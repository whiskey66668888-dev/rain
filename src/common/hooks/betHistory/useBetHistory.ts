import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import { useBetListQuery, useGetListByMatchIds } from './useBetHistoryQuery';
import {
  EBetHistoryQueryType,
  EBetHistoryTab,
  EBetOrderStatus,
  EVenue,
} from '@/apis/commonSports/constants';
import { useBetHistoryBaseMethods } from './useBetHistoryMethods';
import { useMount, useLatest } from 'ahooks';
import { useSearchParams } from 'react-router-dom';
import type {
  MatchBaseInfo,
  TBetHistoryOrderItem,
  TFbPreBetLimitItem,
  THistoryBetItem,
} from '@/apis/commonSports/types';
import { EBetHistoryType, queryTypeToTabMap } from './constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBetParameterFb } from '@/apis/fbSports/bet/getBetParameter';
import { bigNB } from '@/utils/bet/bigMath';
import { useEarlySettleConfigQuery } from './useEarlySettleConfigQuery';
import type { TEarlySettleConfigItem } from './useEarlySettleConfigQuery';
import { checkConfirmingOrderIds } from '@/apis/fbSports/bet/getStakeOrderStatus';
import { cancelOrderHistoryBridge } from '@/common/hooks/useNotificationWs/cancelOrderHistoryBridge';
import { toast } from '@/common/components/Toast';
import { earlySettleBetFb } from '@/apis/fbSports/betHistory/earlySettleBetFb';
import { getEarlySettlesByIdsFb } from '@/apis/fbSports/betHistory/getEarlySettlesByIdsFb';
import { reserveEarlySettleBetFb } from '@/apis/fbSports/betHistory/reserveEarlySettleBetFb';
import { cancelReserveEarlySettleFb } from '@/apis/fbSports/betHistory/cancelReserveEarlySettleFb';
import { calcEarlySettleStats, calcReservePercentsFromActive } from '@/utils/betHistory';
import { EFbCashOutOrderStatus, EFbOrderStatus } from '@/apis/fbSports/common/constants/enum';
import { getMatchDetailReq } from '@/apis/fbSports/getMatchDetail';
import { useGoMatchDetail } from '@/sites/op7/hooks/useGoMatchDetail';
import {
  EPopupMessageType,
  EPopupWindowKey,
  windowManager,
  type PopupMessage,
} from '@/common/hooks/popupWindows/windowManager';

const POLL_INTERVAL = 2_000;
const POLL_TIMEOUT = 300_000;
/** 拿到终态后，在 UI 上停留多久再清理 */
const RESULT_DISPLAY_DELAY = 1_000;

// ── 提前结算类型 ───────────────────────────────────────────────────────────────

export type TEarlySettleStep =
  | 'selecting' // 底部弹窗中选择本金
  | 'confirming' // 中心确认弹窗
  | 'submitting' // 提交 API 中
  | 'polling' // 轮询结算状态中
  | 'settled'
  | 'failed';

export type TReserveEarlySettleStep =
  | 'viewing' // 已预约，只读回显
  | 'selecting' // 首次预约，选择金额
  | 'editing' // 修改预约，可调整滑条
  | 'confirming' // 二次确认弹窗（selecting / editing 共用）
  | 'submitting';

/** 正在等接口返回结果的订单（同参考文件 checkingOrders） */
type TCheckingOrder = {
  cashOutId: string;
  orderId: string;
  pollingStartedAt: number;
};

/** 已拿到终态、等待延迟清理的订单（同参考文件 withResultsOrders） */
type TWithResultOrder = {
  orderId: string;
  step: TEarlySettleStep;
  resolvedAt: number;
};

/** 立即提前结算 — 仅 orderId 和 step 为必填，其余按阶段逐步填入 */
export type TEarlySettleEntry = {
  orderId: string;
  step: TEarlySettleStep;
  /**
   * 是否展示金额选择面板/弹窗（与 step 解耦的独立开关）。
   * - 走面板的单（非串关、可调整）：selecting 阶段置 true，并贯穿 confirming/submitting，
   *   使二次确认弹窗弹出时面板仍保持显示；进入 polling 或关闭时置 false / 移除。
   * - 串关等 skipSheet 直接进 confirming 的单：保持 falsy，面板永不显示，只弹确认弹窗。
   * 注：PC 两处为 per-order 内联/popover，可同时多个 showPanel；H5 全局弹层同时仅一个。
   */
  showPanel?: boolean;
  // selecting 阶段：0~1，0=minStake，1=maxStake
  percent?: number;
  // confirming / submitting 阶段
  cashOutStake?: number;
  // polling 阶段
  cashOutId?: string;
};

/** 预约提前结算操作条目 */
export type TReserveEarlySettleEntry = {
  orderId: string;
  step: TReserveEarlySettleStep;
  /**
   * 是否展示金额选择面板/弹窗（与 step 解耦，同 TEarlySettleEntry.showPanel）。
   * 打开面板时置 true，贯穿 selecting/confirming/submitting，使二次确认弹窗弹出/提交 loading
   * 期间面板仍保持显示；仅在关闭或提交成功移除 entry 时消失。
   */
  showPanel?: boolean;
  // 0~1，0=minStake，1=remainingStake
  stakePercent: number;
  // 0~1，0=minPayout，1=maxPayout
  payoutPercent: number;
  // confirming / submitting 阶段锁定的值
  cashOutStake?: number;
  cashOutPayoutStake?: number;
  /** true = 修改预约；false/undefined = 首次预约 */
  isUpdate?: boolean;
};

export type TEarlySettleMap = Partial<Record<string, TEarlySettleEntry>>;
export type TReserveEarlySettleMap = Partial<Record<string, TReserveEarlySettleEntry>>;

export type TCancelReserveConfirmEntry = {
  orderId: string;
  reserveId: string;
  step: 'confirming' | 'submitting';
};

const useBetHistory = (type: EBetHistoryType) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [checkingMatchId, setCheckingMatchId] = useState<string | null>(null);
  const activeVenue = useAppSelector((state) => state.betHistory.activeVenue);
  const queryParams = useAppSelector((state) => state.betHistory[activeVenue].queryParams);
  const reserveEdit = useAppSelector((state) => state.betHistory[activeVenue].reserveEdit);
  const { baseChangeActiveTab } = useBetHistoryBaseMethods();
  const goMatchDetail = useGoMatchDetail();

  const {
    list,
    total,
    stats,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useBetListQuery({
    params: queryParams,
    venue: activeVenue,
    type,
    options: {
      enabled: !!queryParams && queryParams.queryType !== EBetHistoryQueryType.RESULTS,
    },
  });

  const activeTab = useMemo(() => {
    return queryTypeToTabMap[queryParams?.queryType ?? EBetHistoryQueryType.UNSETTLED];
  }, [queryParams?.queryType]);

  // #region 实时比赛信息
  const liveMatchIds = useMemo(() => {
    if (activeTab !== EBetHistoryTab.UNSETTLED) return [];
    const ids: number[] = [];
    for (const order of list) {
      if (!order.isUnsettledOrder) continue;
      for (const detail of order.orderDetails) {
        if (detail.isLive && !detail.isChampion) {
          const id = Number(detail.matchId);
          if (!isNaN(id) && id > 0) ids.push(id);
        }
      }
    }
    return [...new Set(ids)];
  }, [list, activeTab]);

  const { data: liveMatchList } = useGetListByMatchIds({
    venue: activeVenue,
    ids: liveMatchIds,
  });

  const liveMatchMap = useMemo(() => {
    const map: Record<string, MatchBaseInfo> = {};
    for (const match of liveMatchList ?? []) {
      map[String(match.matchId)] = match;
    }
    return map;
  }, [liveMatchList]);
  // #endregion

  /**
   * 跳转赛事详情。
   * - PC_PAGE 运行在弹出子窗口：无法在本窗口跳转，改为通过 BroadcastChannel 通知主窗口跳转。
   *   注：主窗口会在后台完成跳转，但浏览器禁止脚本把后台窗口提到 OS 前台，故不做置顶，用户自行切回主窗口。
   * - 其它端（H5/侧边栏）在当前窗口内直接跳转。
   */
  const navigateToMatchDetail = useCallback(
    (matchId: string, isChampion: boolean) => {
      if (type === EBetHistoryType.PC_PAGE) {
        windowManager.send<PopupMessage>(EPopupWindowKey.BetHistory, {
          type: EPopupMessageType.GoMatchDetail,
          matchId,
          isChampion,
        });
        return;
      }
      goMatchDetail(matchId, { isChampion });
    },
    [type, goMatchDetail],
  );

  // #region 点击赛事区域 - 校验比赛是否已结束后跳转详情
  /**
   * 点击注单赛事区域时调用：先拉一次赛事详情接口，校验比赛是否仍可查看，再决定跳转。
   * 对齐 App 端逻辑（teamDetail.dart）：
   * - 接口返回正确内容（该场存在且未完场）→ 跳转赛事详情页；
   * - 接口返回为空（已下架/已清理）或赛事已结束（完场）→ toast「赛事已结束，无法查看投注盘口」。
   * 注：目前仅 FB 场馆有详情接口，其它场馆暂不处理（与列表请求一致，仅 FB 实现）。
   */
  const tryGoMatchDetail = useCallback(
    async ({ matchId, isChampion }: Pick<THistoryBetItem, 'matchId' | 'isChampion'>) => {
      if (!!checkingMatchId) {
        return;
      }

      const notifyEnded = () => toast({ title: '赛事已结束，无法查看投注盘口', type: 'warning' });

      // 目前仅 FB 场馆有详情接口
      if (activeVenue !== EVenue.FB) return;

      try {
        setCheckingMatchId(matchId);
        const res = await getMatchDetailReq({ matchId: +matchId });
        const record = res?.data;
        // 接口未返回该场（matchId 为空）或赛事状态为「已结束/完场」→ 拦截并提示
        if (!record?.id || record.ms === 0) {
          notifyEnded();
          return;
        }
        // 返回正确内容 → 跳转赛事详情页（冠军走冠军玩法页）
        navigateToMatchDetail(matchId, isChampion);
      } catch {
        // 与 App 一致：详情请求异常按已结束处理
        notifyEnded();
      } finally {
        setCheckingMatchId(null);
      }
    },
    [activeVenue, checkingMatchId, navigateToMatchDetail],
  );
  // #endregion

  // #region 轮训未结算列表中的确认中订单
  const confirmingOrderIds = useMemo(() => {
    if (activeTab !== EBetHistoryTab.UNSETTLED) return [];
    return list.filter((o) => o.orderStatus === EBetOrderStatus.Confirming).map((o) => o.orderId);
  }, [list, activeTab]);

  const { data: changedConfirmingIds } = useQuery({
    queryKey: ['betHistoryConfirmingOrders', confirmingOrderIds],
    queryFn: () => checkConfirmingOrderIds(confirmingOrderIds),
    enabled: confirmingOrderIds.length > 0,
    refetchInterval: 2 * 1000,
    staleTime: 0,
  });

  useEffect(() => {
    if (changedConfirmingIds?.length) {
      queryClient.invalidateQueries({ queryKey: ['betHistorylist'] });
    }
  }, [changedConfirmingIds, queryClient]);
  // #endregion

  // #region WS 取消推送刷新未结算列表
  const listRef = useLatest(list);

  useEffect(() => {
    cancelOrderHistoryBridge.current = (orderId: string) => {
      const hit = listRef.current?.some((o) => o.orderId === orderId);
      if (hit) {
        queryClient.invalidateQueries({ queryKey: ['betHistorylist'] });
      }
    };
    return () => {
      cancelOrderHistoryBridge.current = null;
    };
  }, [listRef, queryClient]);
  // #endregion

  // #region 轮训预约注单修改限额（仅在修改态开启时触发）
  const reserveEditOrder = useMemo(() => {
    if (!reserveEdit) return undefined;
    return list.find((o) => o.orderId === reserveEdit.orderId);
  }, [reserveEdit, list]);

  const reserveEditDetail = reserveEditOrder?.orderDetails[0];

  const { data: reserveEditLimit } = useQuery<TFbPreBetLimitItem | null>({
    queryKey: [
      'reserveEditLimit',
      reserveEditDetail?.matchId,
      reserveEditDetail?.marketId,
      reserveEditDetail?.fb?.ty,
    ],
    queryFn: async () => {
      if (!reserveEditDetail || activeVenue !== EVenue.FB) return null;
      const res = await getBetParameterFb({
        matchId: +reserveEditDetail.matchId,
        marketId: +reserveEditDetail.marketId,
        optionType: reserveEditDetail.fb?.ty,
      });
      if (res.success && res.data) return res.data;
      return null;
    },
    enabled: !!reserveEditDetail && activeVenue === EVenue.FB,
    refetchInterval: 10 * 1000,
    staleTime: 0,
  });
  // 镜像 preBetItem 的 useMemo：用限额 + 当前编辑赔率动态推导本金范围和赔率范围
  // 每次 reserveEdit.odds 或 reserveEditLimit 变化时自动重算
  const reserveEditComputed = useMemo(() => {
    if (!reserveEdit || !reserveEditLimit) return null;

    const oddsMinusOne = bigNB(reserveEdit.odds).minus(1);
    const calcMax = oddsMinusOne.lte(0)
      ? 0
      : +bigNB(reserveEditLimit.mly).div(oddsMinusOne).toFixed(2);

    const _maxStake = Math.min(
      calcMax,
      reserveEditLimit.mly,
      reserveEditLimit.mms || reserveEditLimit.mly,
    );

    return {
      minUnitStake: reserveEditLimit.mis,
      maxUnitStake: Math.max(_maxStake, reserveEditLimit.mis),
      minOdds: reserveEditLimit.od,
      maxOdds: reserveEditLimit.mod,
    };
  }, [reserveEdit, reserveEditLimit]);
  // #endregion

  // #region 提前结算报价
  const { data: earlySettleConfigData } = useEarlySettleConfigQuery({
    venue: activeVenue,
    list,
    activeTab,
  });
  const EarlySettleConfigMap = useMemo(
    () => earlySettleConfigData?.earlySettleConfigMap ?? {},
    [earlySettleConfigData?.earlySettleConfigMap],
  );
  const earlySettleMaxCount = earlySettleConfigData?.earlySettleMaxCount ?? 0;
  // #endregion

  // #region 提前结算 - state
  const [earlySettleMap, setEarlySettleMap] = useState<TEarlySettleMap>({});
  const [reserveEarlySettleMap, setReserveEarlySettleMap] = useState<TReserveEarlySettleMap>({});
  /** 预约结算 H5 全局底部弹层当前激活订单（H5 同时仅一个；PC 走 reserveEarlySettleMap 的 step） */
  const [activeReserveEarlySettleOrderId, setActiveReserveEarlySettleOrderId] = useState<
    string | null
  >(null);
  /** 立即结算确认弹窗的显式条目（confirming / submitting 阶段） */
  const [earlySettleConfirmEntry, setEarlySettleConfirmEntry] = useState<TEarlySettleEntry | null>(
    null,
  );
  /** 预约结算确认弹窗的显式条目（confirming / submitting 阶段） */
  const [reserveConfirmEntry, setReserveConfirmEntry] = useState<TReserveEarlySettleEntry | null>(
    null,
  );
  /** 取消预约确认弹窗的显式条目（confirming / submitting 阶段） */
  const [cancelReserveConfirmEntry, setCancelReserveConfirmEntry] =
    useState<TCancelReserveConfirmEntry | null>(null);

  /** Poll 1 开关：checkingOrders 非空时开启 */
  const [checkingEnabled, setCheckingEnabled] = useState(false);
  /** Poll 2 开关：withResultsOrders 非空时开启 */
  const [cleanupEnabled, setCleanupEnabled] = useState(false);

  /** 正在等接口结果的订单列表 */
  const checkingOrders = useRef<TCheckingOrder[]>([]);
  /** 已拿到终态、等待延迟展示后清理的订单 */
  const withResultsOrders = useRef<TWithResultOrder[]>([]);
  // #endregion

  // #region 提前结算 - 辅助函数
  const refreshList = useCallback(
    (deep = false) => {
      queryClient.invalidateQueries({ queryKey: ['betHistorylist'] });
      if (deep) {
        queryClient.invalidateQueries({ queryKey: ['earlySettlePrice'] });
      }
    },
    [queryClient],
  );

  const patchEarlySettle = useCallback((orderId: string, patch: Partial<TEarlySettleEntry>) => {
    setEarlySettleMap((prev) => {
      const cur = prev[orderId];
      if (!cur) return prev;
      return { ...prev, [orderId]: { ...cur, ...patch } };
    });
  }, []);

  const removeEarlySettle = useCallback((orderId: string) => {
    setEarlySettleMap((prev) => {
      if (!(orderId in prev)) return prev;
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }, []);

  const resetEarlySettleData = useCallback(() => {
    setEarlySettleMap({});
    setReserveEarlySettleMap({});
    setActiveReserveEarlySettleOrderId(null);
    setEarlySettleConfirmEntry(null);
    setReserveConfirmEntry(null);
    setCheckingEnabled(false);
    setCleanupEnabled(false);
    checkingOrders.current = [];
    withResultsOrders.current = [];
  }, []);
  // #endregion

  // #region 提前结算 - Poll 1：轮询 cashOut 接口状态
  // 处理 checkingOrders：分类为「继续等」/ 「进入延迟清理队列」

  const processCheckingOrders = useCallback(async () => {
    try {
      const stillChecking: TCheckingOrder[] = [];
      const newResults: TWithResultOrder[] = [];

      const ids = checkingOrders.current.map((o) => o.cashOutId);
      if (!ids.length) {
        // 不应该出现，但如果出现了说明轮训改停止了，checkingOrders该清空了
        checkingOrders.current = [];
        setCheckingEnabled(false);
        return;
      }
      const res = await getEarlySettlesByIdsFb({ ids });
      const data = res.data;
      if (!data.length) {
        return;
      }
      for (const order of checkingOrders.current) {
        // 超时：服务端长时间未给终态，视为失败
        if (Date.now() - order.pollingStartedAt >= POLL_TIMEOUT) {
          patchEarlySettle(order.orderId, { step: 'failed' });
          toast({ title: '提前结算超时', type: 'error' });
          newResults.push({ orderId: order.orderId, step: 'failed', resolvedAt: Date.now() });
          continue;
        }

        const item = data.find((d) => d.id === order.cashOutId);
        if (!item) {
          // 找不到，不应该找不到，找不到就算失败
          patchEarlySettle(order.orderId, { step: 'failed' });
          toast({ title: '提前结算失败', type: 'error' });
          newResults.push({ orderId: order.orderId, step: 'failed', resolvedAt: Date.now() });
          continue;
        }

        const { orderStatus } = item;
        if (
          orderStatus === EFbCashOutOrderStatus.Settled ||
          orderStatus === EFbCashOutOrderStatus.Confirmed
        ) {
          patchEarlySettle(order.orderId, { step: 'settled' });
          toast({ title: '提前结算成功', type: 'success' });
          newResults.push({ orderId: order.orderId, step: 'settled', resolvedAt: Date.now() });
        } else if (
          orderStatus === EFbCashOutOrderStatus.Refused ||
          orderStatus === EFbCashOutOrderStatus.Canceled
        ) {
          patchEarlySettle(order.orderId, { step: 'failed' });
          toast({ title: '提前结算失败', type: 'error' });
          newResults.push({ orderId: order.orderId, step: 'failed', resolvedAt: Date.now() });
        } else {
          // Created / Confirming，继续等
          stillChecking.push(order);
        }
      }

      checkingOrders.current = stillChecking;

      if (newResults.length) {
        refreshList();
        withResultsOrders.current = [...withResultsOrders.current, ...newResults];
        setCleanupEnabled(true); // 有新结果 → 开启 Poll 2
      }
      if (stillChecking.length === 0) {
        setCheckingEnabled(false); // 没有待查询项 → 停 Poll 1
      }
    } catch (error) {
      console.error('processCheckingOrders---error', error);
    }
  }, [patchEarlySettle, refreshList]);

  useQuery({
    queryKey: ['earlySettleCheckPoll'],
    queryFn: processCheckingOrders,
    enabled: checkingEnabled,
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
    gcTime: 0,
  });
  // #endregion

  // #region 提前结算 - Poll 2：延迟清理结果展示
  // 不调接口，纯粹用 React Query 当定时器，处理延迟展示后的清理

  const processWithResultsOrders = useCallback(() => {
    const keepResults: TWithResultOrder[] = [];

    for (const r of withResultsOrders.current) {
      if (Date.now() - r.resolvedAt < RESULT_DISPLAY_DELAY) {
        keepResults.push(r);
        continue;
      }
      removeEarlySettle(r.orderId);
    }

    withResultsOrders.current = keepResults;
    if (keepResults.length === 0) {
      setCleanupEnabled(false); // 队列清空 → 停 Poll 2
    }
  }, [removeEarlySettle]);

  useQuery({
    queryKey: ['earlySettleCleanupPoll'],
    queryFn: processWithResultsOrders,
    enabled: cleanupEnabled,
    refetchInterval: RESULT_DISPLAY_DELAY,
    staleTime: 0,
    gcTime: 0,
  });
  // #endregion

  // #region 提前结算 - 立即提前结算

  const handleEarlySettle = useCallback(
    ({
      order,
      earlySettleConfig,
      entry,
      fromList,
    }: {
      order: TBetHistoryOrderItem;
      earlySettleConfig: TEarlySettleConfigItem;
      entry?: TEarlySettleEntry;
      fromList?: boolean;
    }) => {
      const { orderId, isParlayOrder } = order;
      const { remainingStake: maxStake } = calcEarlySettleStats(order, 0);
      const minStake = isParlayOrder
        ? (earlySettleConfig.parlayMinStake ?? 0)
        : (earlySettleConfig.singleMinStake ?? 0);
      const skipSheet = isParlayOrder || maxStake <= minStake;

      if (fromList || !entry) {
        if (skipSheet) {
          // 串关等跳过金额面板：直接进二次确认弹窗，showPanel 不置（面板不显示）
          const confirmEntry: TEarlySettleEntry = {
            orderId,
            step: 'confirming',
            cashOutStake: maxStake,
          };
          setEarlySettleMap((prev) => ({ ...prev, [orderId]: confirmEntry }));
          setEarlySettleConfirmEntry(confirmEntry);
        } else {
          // 走金额面板：showPanel=true 作为该单面板显示的开关（per-order，支持 PC 多个并存）
          setEarlySettleMap((prev) => ({
            ...prev,
            [orderId]: {
              orderId,
              step: 'selecting',
              showPanel: true,
              percent: entry?.percent ?? 1,
            },
          }));
        }
        return;
      }

      if (entry.step === 'selecting') {
        const p = entry.percent ?? 1;
        const cashOutStake = minStake + p * (maxStake - minStake);
        const confirmEntry: TEarlySettleEntry = { ...entry, step: 'confirming', cashOutStake };
        setEarlySettleMap((prev) => ({ ...prev, [orderId]: confirmEntry }));
        setEarlySettleConfirmEntry(confirmEntry);
      }
    },
    [],
  );

  // ── 用户在确认弹窗点击「确认」时调用 ────────────────────────────────────

  const submitEarlySettle = useCallback(
    async ({ order, cashOutStake }: { order: TBetHistoryOrderItem; cashOutStake: number }) => {
      if (activeVenue !== EVenue.FB) return;
      const { orderId, isParlayOrder } = order;
      const earlySettleConfig = EarlySettleConfigMap[orderId];

      patchEarlySettle(orderId, { step: 'submitting', cashOutStake });
      setEarlySettleConfirmEntry((prev) => (prev ? { ...prev, step: 'submitting' } : prev));

      try {
        const res = await earlySettleBetFb({
          orderId,
          cashOutStake: +bigNB(cashOutStake).toFixed(2),
          unitCashOutPayoutStake: earlySettleConfig?.cashOutRate ?? 0,
          acceptOddsChange: true,
          parlay: isParlayOrder,
        });

        if (!res.data.id) {
          toast({ title: '提前结算失败', type: 'error' });
          // 回到 confirming，用户可重试或取消（showPanel 不变，面板继续保留）
          patchEarlySettle(orderId, { step: 'confirming' });
          setEarlySettleConfirmEntry((prev) => (prev ? { ...prev, step: 'confirming' } : prev));
          return;
        }

        // st 只会返回 Created(0) 或 Confirming(1)，必须走轮询
        const cashOutId = res.data.id;
        checkingOrders.current = [
          ...checkingOrders.current,
          { cashOutId, orderId, pollingStartedAt: Date.now() },
        ];
        // 进入 polling：关闭确认弹窗，并收起金额面板（showPanel=false）
        patchEarlySettle(orderId, { cashOutId, step: 'polling', showPanel: false });
        setEarlySettleConfirmEntry(null);
        setCheckingEnabled(true); // 开启 Poll 1
      } catch {
        removeEarlySettle(orderId);
        setEarlySettleConfirmEntry(null);
        toast({ title: '提前结算失败', type: 'error' });
      }
    },
    [activeVenue, EarlySettleConfigMap, patchEarlySettle, removeEarlySettle],
  );

  /** 关闭弹窗（selecting / confirming 阶段可关闭；submitting / polling 不可打断） */
  const closeEarlySettle = useCallback((orderId: string = '') => {
    if (!orderId) return;
    setEarlySettleMap((prev) => {
      const entry = prev[orderId];
      if (!entry || entry.step === 'submitting' || entry.step === 'polling') return prev;
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setEarlySettleConfirmEntry((prev) => {
      if (!prev || prev.orderId !== orderId) return prev;
      if (prev.step === 'submitting' || prev.step === 'polling') return prev;
      return null;
    });
  }, []);

  /**
   * 二次确认弹窗点击「取消」：
   * - 若该订单走金额选择面板（entry.showPanel）：退回 selecting，保留滑条值，仅关确认弹窗，
   *   金额面板继续保持显示；
   * - 否则（串关等直接确认）：彻底关闭整个流程。
   */
  const cancelEarlySettleConfirm = useCallback((orderId: string = '') => {
    if (!orderId) return;
    setEarlySettleMap((prev) => {
      const cur = prev[orderId];
      if (!cur || cur.step === 'submitting' || cur.step === 'polling') return prev;
      if (cur.showPanel) {
        // 走面板的单：退回 selecting，面板保留
        return { ...prev, [orderId]: { ...cur, step: 'selecting' } };
      }
      // 串关等：彻底移除
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setEarlySettleConfirmEntry((prev) => {
      if (!prev || prev.orderId !== orderId) return prev;
      if (prev.step === 'submitting' || prev.step === 'polling') return prev;
      return null;
    });
  }, []);

  /** 更新 selecting 阶段的 percent（0=minStake，1=maxStake） */
  const updateEarlySettleInput = useCallback((orderId: string, percent: number) => {
    setEarlySettleMap((prev) => {
      const cur = prev[orderId];
      if (!cur) return prev;
      return { ...prev, [orderId]: { ...cur, percent } };
    });
  }, []);
  // #endregion

  // #region 提前结算 - 预约提前结算

  const openReserveEarlySettleSheet = useCallback(
    (orderId: string) => {
      const order = list.find((o) => o.orderId === orderId);
      const activeReserve = order?.reserveEarlySettles?.find((r) => r.status === 1);
      const config = EarlySettleConfigMap[orderId];

      let step: TReserveEarlySettleStep = 'selecting';
      let stakePercent = 1;
      let payoutPercent = 1;

      if (activeReserve && config && order) {
        ({ stakePercent, payoutPercent } = calcReservePercentsFromActive(
          order,
          config,
          activeReserve,
        ));
        step = 'viewing';
      }

      setReserveEarlySettleMap((prev) => ({
        ...prev,
        [orderId]: {
          orderId,
          step,
          stakePercent,
          payoutPercent,
          isUpdate: !!activeReserve,
          showPanel: true,
        },
      }));
      setActiveReserveEarlySettleOrderId(orderId);
    },
    [list, EarlySettleConfigMap],
  );

  const closeReserveEarlySettleSheet = useCallback((orderId?: string) => {
    setActiveReserveEarlySettleOrderId((prev) => {
      const targetId = orderId ?? prev;
      if (targetId) {
        setReserveEarlySettleMap((m) => {
          const next = { ...m };
          delete next[targetId];
          return next;
        });
      }
      return prev === targetId ? null : prev;
    });
  }, []);

  /** 更新预约提前结算条目的滑条百分比 */
  const updateReserveEarlySettleInputs = useCallback(
    (
      orderId: string,
      patch: Partial<Pick<TReserveEarlySettleEntry, 'stakePercent' | 'payoutPercent'>>,
    ) => {
      setReserveEarlySettleMap((prev) => {
        const cur = prev[orderId];
        if (!cur) return prev;
        return { ...prev, [orderId]: { ...cur, ...patch } };
      });
    },
    [],
  );

  /** 单独切换 step（Sheet 用于 viewing ↔ editing 互转） */
  const setReserveEarlySettleStep = useCallback(
    (orderId: string, step: TReserveEarlySettleStep) => {
      setReserveEarlySettleMap((prev) => {
        const cur = prev[orderId];
        if (!cur) return prev;
        return { ...prev, [orderId]: { ...cur, step } };
      });
    },
    [],
  );

  /** 从 selecting/editing → confirming，锁定本金和返还额 */
  const openReserveEarlySettleConfirm = useCallback(
    (orderId: string, cashOutStake: number, cashOutPayoutStake: number) => {
      const isUpdate = reserveEarlySettleMap[orderId]?.isUpdate;
      setReserveEarlySettleMap((prev) => {
        const cur = prev[orderId];
        if (!cur) return prev;
        return {
          ...prev,
          [orderId]: { ...cur, step: 'confirming', cashOutStake, cashOutPayoutStake },
        };
      });
      setReserveConfirmEntry({
        orderId,
        step: 'confirming',
        stakePercent: 0,
        payoutPercent: 0,
        cashOutStake,
        cashOutPayoutStake,
        isUpdate,
      });
    },
    [reserveEarlySettleMap],
  );

  /** 从 confirming → selecting，用户点「取消」退回弹窗 */
  const cancelReserveEarlySettleConfirm = useCallback((orderId: string) => {
    setReserveEarlySettleMap((prev) => {
      const cur = prev[orderId];
      if (!cur) return prev;
      return { ...prev, [orderId]: { ...cur, step: cur.isUpdate ? 'editing' : 'selecting' } };
    });
    setReserveConfirmEntry(null);
  }, []);

  const submitReserveEarlySettle = useCallback(
    async ({
      order,
      cashOutStake,
      cashOutPayoutStake,
      isUpdate,
    }: {
      order: TBetHistoryOrderItem;
      cashOutStake: number;
      cashOutPayoutStake: number;
      isUpdate?: boolean;
    }) => {
      if (activeVenue !== EVenue.FB) return;
      const { orderId, isParlayOrder } = order;

      const rollbackToConfirming = () => {
        setReserveEarlySettleMap((prev) => {
          const cur = prev[orderId];
          if (!cur) return prev;
          return { ...prev, [orderId]: { ...cur, step: 'confirming' } };
        });
        setReserveConfirmEntry((prev) => (prev ? { ...prev, step: 'confirming' } : prev));
      };

      setReserveEarlySettleMap((prev) => {
        const cur = prev[orderId];
        if (!cur) return prev;
        return { ...prev, [orderId]: { ...cur, step: 'submitting' } };
      });
      setReserveConfirmEntry((prev) => (prev ? { ...prev, step: 'submitting' } : prev));

      try {
        const res = await reserveEarlySettleBetFb({
          orderId,
          cashOutStake: +bigNB(cashOutStake).toFixed(2),
          cashOutPayoutStake: +bigNB(cashOutPayoutStake).toFixed(2),
          parlay: isParlayOrder,
        });

        const st = res.data?.st;
        if (st === EFbOrderStatus.Confirming || st === EFbOrderStatus.Confirmed) {
          toast({ title: isUpdate ? '修改预约成功' : '预约提前结算成功', type: 'success' });
          setReserveConfirmEntry(null);
          closeReserveEarlySettleSheet();
          refreshList();
        } else {
          toast({ title: isUpdate ? '修改预约失败' : '预约提前结算失败', type: 'error' });
          rollbackToConfirming();
        }
      } catch {
        rollbackToConfirming();
      }
    },
    [activeVenue, closeReserveEarlySettleSheet, refreshList],
  );

  const cancelReserveEarlySettle = useCallback(async () => {
    if (activeVenue !== EVenue.FB || !cancelReserveConfirmEntry) return;
    const { orderId, reserveId } = cancelReserveConfirmEntry;

    setCancelReserveConfirmEntry((prev) => (prev ? { ...prev, step: 'submitting' } : prev));
    try {
      await cancelReserveEarlySettleFb({ reserveCashOutId: reserveId });
      toast({ title: '取消预约结算成功', type: 'success' });
      setCancelReserveConfirmEntry(null);
      closeReserveEarlySettleSheet(orderId);
      refreshList();
    } catch {
      toast({ title: '取消预约结算失败', type: 'error' });
      setCancelReserveConfirmEntry((prev) => (prev ? { ...prev, step: 'confirming' } : prev));
    }
  }, [activeVenue, cancelReserveConfirmEntry, closeReserveEarlySettleSheet, refreshList]);

  const closeCancelReserveConfirm = useCallback(() => {
    setCancelReserveConfirmEntry(null);
  }, []);

  /** 「取消预约」按钮：弹二次确认弹窗 */
  const openCancelReserveEarlySettleConfirm = useCallback(
    (orderId: string) => {
      const order = list.find((o) => o.orderId === orderId);
      const activeReserve = order?.reserveEarlySettles?.find((r) => r.status === 1);
      if (!activeReserve) return;
      setCancelReserveConfirmEntry({ orderId, reserveId: activeReserve.id, step: 'confirming' });
    },
    [list],
  );

  /** 「取消」按钮（editing 模式）：将滑条 percent 还原为当前预约值，回到 viewing */
  const cancelReserveEarlySettleEdit = useCallback(
    (orderId: string) => {
      const order = list.find((o) => o.orderId === orderId);
      const config = EarlySettleConfigMap[orderId];
      const activeReserve = order?.reserveEarlySettles?.find((r) => r.status === 1);
      if (!order || !config || !activeReserve) return;

      const { stakePercent, payoutPercent } = calcReservePercentsFromActive(
        order,
        config,
        activeReserve,
      );
      updateReserveEarlySettleInputs(orderId, { stakePercent, payoutPercent });
      setReserveEarlySettleStep(orderId, 'viewing');
    },
    [list, EarlySettleConfigMap, updateReserveEarlySettleInputs, setReserveEarlySettleStep],
  );
  // #endregion

  // #region 提前结算 - changeActiveTab
  const changeActiveTab = useCallback(
    (params: Parameters<typeof baseChangeActiveTab>[0]) => {
      baseChangeActiveTab(params);
      resetEarlySettleData();
    },
    [baseChangeActiveTab, resetEarlySettleData],
  );
  // #endregion

  // #region 初始化 tab
  useMount(() => {
    const searchQueryType = searchParams.get('queryType');
    if ((type === EBetHistoryType.H5 || type === EBetHistoryType.PC_PAGE) && searchQueryType) {
      setSearchParams('', { replace: true });
      changeActiveTab({ activeVenue, queryType: +searchQueryType });
      return;
    }
    if (!queryParams) {
      changeActiveTab({ activeVenue });
    }
  });
  // #endregion

  return {
    activeTab,
    list,
    total,
    stats,
    activeVenue,
    queryParams,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    liveMatchMap,
    checkingMatchId,
    tryGoMatchDetail,
    reserveEdit,
    reserveEditLimit: reserveEditLimit ?? null,
    reserveEditComputed,
    // 提前结算
    EarlySettleConfigMap,
    earlySettleMaxCount,
    earlySettleMap,
    reserveEarlySettleMap,
    earlySettleConfirmEntry,
    reserveConfirmEntry,
    activeReserveEarlySettleOrderId,
    handleEarlySettle,
    submitEarlySettle,
    closeEarlySettle,
    cancelEarlySettleConfirm,
    updateEarlySettleInput,
    openReserveEarlySettleSheet,
    closeReserveEarlySettleSheet,
    setReserveEarlySettleStep,
    updateReserveEarlySettleInputs,
    openReserveEarlySettleConfirm,
    cancelReserveEarlySettleConfirm,
    submitReserveEarlySettle,
    cancelReserveEarlySettle,
    cancelReserveConfirmEntry,
    closeCancelReserveConfirm,
    openCancelReserveEarlySettleConfirm,
    cancelReserveEarlySettleEdit,
    changeActiveTab,
  };
};

export type TUseBetHistory = ReturnType<typeof useBetHistory>;

export default useBetHistory;
