import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Modal from '@/common/components/Modal';
import { toast } from '@/common/components/Toast';
import { EBetHistoryQueryType, EBetSettleResult, EVenue } from '@/apis/commonSports/constants';
import type {
  MatchBaseInfo,
  TBetHistoryOrderItem,
  THistoryBetItem,
} from '@/apis/commonSports/types';
import { EFbOrderStatus } from '@/apis/fbSports/common/constants/enum';
import { formatBetHistoryParamsFb, formatBetHistoryRespFb } from '@/apis/fbSports/common/fbFormat';
import { orderBetListFb } from '@/apis/fbSports/betHistory/orderBetListFb';
import { getListReq } from '@/apis/fbSports/getList';
import { orderBetListOb } from '@/apis/obSports/betHistory/orderBetListOb';
import { formatBetHistoryRespOb } from '@/apis/obSports/common/obBetHistoryFormat';
import { getListByMidsReq } from '@/apis/obSports/getList';
import Timing from '@/common/components/Timing';
import { useAppSelector } from '@/core/store/hooks';
import type { BetShareCard } from '@/core/sdk/IMManager';
import { last7DaysRange } from '@/utils/dateHelper';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';
import { ArrowRightSvg, CopySvg, LoadingIcon } from '@/sites/op7/components/SvgIcons';
import {
  SETTLED_RESULT_CONFIG,
  UNSETTLED_STATUS_CONFIG,
} from '@/sites/op7/pages/BetHistoryPage/BetHistoryH5/constants';
import { mapBetHistoryOrderToShareCard } from '../../utils/shareOrderMapper';
import styles from './ShareOrderDialog.module.scss';
import { getOrderDisplayOdds, getOrderOddsFormatLabel } from '@/utils/betHistory';

/** 晒单选单已支持的场馆（对齐 Flutter ShareOrderLogic） */
const SUPPORT_SHARE_ORDER_VENUES = new Set<string>([EVenue.FB, EVenue.OB]);

interface ShareOrderDialogProps {
  minAmount?: number;
  onConfirm: (payload: BetShareCard) => Promise<boolean> | boolean;
  onClose?: () => void;
}

type TabKey = 'unsettled' | 'settled';

const PAGE_SIZE = 50;

interface TabState {
  orders: TBetHistoryOrderItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  failedPage?: number;
}

const EMPTY_TAB_STATE: TabState = {
  orders: [],
  page: 0,
  hasMore: true,
  loading: false,
  loaded: false,
  error: false,
  failedPage: undefined,
};

const formatMoney = (value: string | number | undefined): string => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : String(value ?? '');
};

const getOrderTitle = (order: TBetHistoryOrderItem): string => {
  const first = order.orderDetails[0];
  if (order.isParlayOrder) return '串关投注';
  if (first?.isChampion) return '冠军';
  return first ? `${first.homeName} VS ${first.awayName}` : order.orderLabel;
};

const OrderStatus: React.FC<{ order: TBetHistoryOrderItem }> = ({ order }) => {
  if (order.isSettledOrder) {
    const result =
      SETTLED_RESULT_CONFIG[order.orderSettleResult] ??
      SETTLED_RESULT_CONFIG[EBetSettleResult.NoResulted];
    return <img className={styles.resultIcon} src={result.icon} alt={result.label} />;
  }

  const status = UNSETTLED_STATUS_CONFIG[order.orderStatus];
  if (!status) return null;
  const StatusIcon = status.icon;
  return (
    <span className={styles.orderStatus}>
      <StatusIcon className={clsx(styles.statusIcon, status.iconColorH5 ?? status.iconColor)} />
      <span>{status.label}</span>
    </span>
  );
};

const LiveMatchInfo: React.FC<{
  detail: THistoryBetItem;
  match?: MatchBaseInfo;
  loading?: boolean;
}> = ({ detail, match, loading }) => {
  if (!match?.isLive) {
    return (
      <span className={styles.staticResult}>
        赛果&nbsp;
        {loading ? <LoadingIcon className={styles.inlineLoading} /> : detail.resultScore || '--'}
      </span>
    );
  }

  const isCorner = detail.playName.includes('角球');
  const score = isCorner
    ? `${match.homeCornerKick ?? '-'}-${match.awayCornerKick ?? '-'}`
    : match.sportName === '网球'
      ? match.scoreAll?.[match.scoreAll.length - 1] || match.score
      : `${match.homeScore ?? '-'}-${match.awayScore ?? '-'}`;

  return (
    <span className={styles.liveInfo}>
      {match.periodName ? <span>{match.periodName}</span> : null}
      {match.matchTime !== 0 ? (
        <Timing
          time={match.matchTime}
          running={match.isCountdown}
          isCountdown={match.clockType === 'DESC'}
        />
      ) : null}
      {score ? (
        <span className={styles.liveScore}>
          {isCorner ? (
            <img
              className={styles.cornerIcon}
              src="/images/common/chat/score.png"
              alt=""
              width={10}
              height={10}
            />
          ) : null}
          {score}
        </span>
      ) : null}
    </span>
  );
};

const DetailRow: React.FC<{
  detail: THistoryBetItem;
  settled: boolean;
  parlay: boolean;
  liveMatch?: MatchBaseInfo;
  liveLoading?: boolean;
}> = ({ detail, settled, parlay, liveMatch, liveLoading }) => {
  const result = SETTLED_RESULT_CONFIG[detail.orderSettleResult];
  return (
    <div className={styles.detail}>
      {parlay ? (
        <div className={styles.detailMatch}>
          <span>
            {detail.homeName} VS {detail.awayName}
          </span>
          {detail.orderSettleResult !== EBetSettleResult.NoResulted && result ? (
            <span style={{ color: result.color }}>{result.label}</span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.leagueRow}>
        <span>{detail.leagueName}</span>
        <time>{dayjs(detail.matchStartTime).format('MM-DD HH:mm')}</time>
      </div>
      <div className={styles.marketBox}>
        <div className={styles.marketTop}>
          <span>{detail.betItemFullName || detail.betItemShortName}</span>
          <span className={styles.odds}>@{getOrderDisplayOdds(detail.baseOdds, detail)}</span>
        </div>
        <div className={styles.marketBottom}>
          <span>
            {detail.playName} {getOrderOddsFormatLabel(detail)}
            {detail.scoreWhileBetting ? ` [${detail.scoreWhileBetting}]` : ''}
          </span>
          {settled ? (
            <span>赛果 {detail.resultScore || '--'}</span>
          ) : (
            <LiveMatchInfo detail={detail} match={liveMatch} loading={liveLoading} />
          )}
        </div>
      </div>
    </div>
  );
};

const ShareOrderCard: React.FC<{
  order: TBetHistoryOrderItem;
  selected: boolean;
  collapsed: boolean;
  liveMatchMap: Record<string, MatchBaseInfo>;
  liveLoading: boolean;
  onSelect: () => void;
  onToggle: () => void;
}> = ({ order, selected, collapsed, liveMatchMap, liveLoading, onSelect, onToggle }) => {
  const first = order.orderDetails[0];
  const payable = order.isSettledOrder ? order.orderSettledBackAmount : order.orderMaxWinAmount;

  const copyOrderNo = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.orderId);
      toast({ type: 'success', description: '复制成功' });
    } catch {
      toast({ type: 'error', description: '复制失败' });
    }
  };

  return (
    <article
      className={clsx(styles.orderCard, selected && styles.orderCardSelected)}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <header className={styles.orderHead}>
        <span className={styles.headAccent} aria-hidden />
        <div className={styles.headContent}>
          <strong>{getOrderTitle(order)}</strong>
          {order.isParlayOrder ? (
            <>
              <span className={styles.seriesText}>
                {order.orderLabel}
                {order.orderSum ? `*${order.orderSum}` : ''}
              </span>
              <span className={styles.seriesOdds}>
                @{getOrderDisplayOdds(order.orderOdds, order)}
              </span>
            </>
          ) : null}
        </div>
        <OrderStatus order={order} />
        <button
          type="button"
          className={clsx(styles.expandButton, !collapsed && styles.expandButtonOpen)}
          aria-label={collapsed ? '展开注单' : '收起注单'}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          <ArrowRightSvg />
        </button>
      </header>

      {!collapsed ? (
        <>
          <div className={styles.details}>
            {order.orderDetails.map((detail, index) => (
              <React.Fragment key={`${detail.betItemId}-${index}`}>
                {index > 0 ? <div className={styles.detailDivider} /> : null}
                <DetailRow
                  detail={detail}
                  settled={order.isSettledOrder}
                  parlay={order.isParlayOrder}
                  liveMatch={liveMatchMap[detail.matchId]}
                  liveLoading={liveLoading && !liveMatchMap[detail.matchId]}
                />
              </React.Fragment>
            ))}
          </div>
          <div className={styles.amountRow}>
            <strong>本金: {formatMoney(order.orderBetAmount)}</strong>
            <strong>
              {order.isSettledOrder ? '返还' : '可返还'}: <span>{formatMoney(payable)}</span>
            </strong>
          </div>
          <footer className={styles.orderFooter}>
            <div>
              <span>确认: {dayjs(order.orderConfirmTime).format('MM-DD HH:mm:ss')}</span>
              <span>单号: {order.orderId}</span>
            </div>
            <button
              type="button"
              className={styles.copyButton}
              onClick={(event) => void copyOrderNo(event)}
            >
              <CopySvg />
              复制
            </button>
          </footer>
        </>
      ) : (
        <div className={styles.collapsedSummary}>
          <span>
            {first?.betItemFullName || first?.betItemShortName} @
            {getOrderDisplayOdds(first?.baseOdds, first)}
          </span>
          <strong>{formatMoney(order.orderBetAmount)}</strong>
        </div>
      )}
    </article>
  );
};

/**
 * 晒单弹窗（对齐 emc ShareOrderPage）
 * 拉近 7 天未结算/已结算注单，映射为 BetShareCard 后发送
 */
const ShareOrderDialogInner: React.FC<ShareOrderDialogProps> = ({
  minAmount = 0,
  onConfirm,
  onClose,
}) => {
  const venue = useAppSelector((state) => state.sport.venue);
  const [tab, setTab] = useState<TabKey>('unsettled');
  const [submitting, setSubmitting] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [tabState, setTabState] = useState<Record<TabKey, TabState>>({
    unsettled: { ...EMPTY_TAB_STATE },
    settled: { ...EMPTY_TAB_STATE },
  });
  const [selectedId, setSelectedId] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [liveMatchList, setLiveMatchList] = useState<MatchBaseInfo[]>([]);
  const [liveMatchesLoading, setLiveMatchesLoading] = useState(false);
  const requestSeqRef = useRef<Record<TabKey, number>>({ unsettled: 0, settled: 0 });

  const loadOrders = useCallback(
    async (nextTab: TabKey, page = 1, append = false) => {
      const seq = ++requestSeqRef.current[nextTab];
      setTabState((previous) => ({
        ...previous,
        [nextTab]: {
          ...previous[nextTab],
          loading: true,
          error: false,
          failedPage: undefined,
        },
      }));
      try {
        if (!SUPPORT_SHARE_ORDER_VENUES.has(String(venue))) {
          setTabState((previous) => ({
            ...previous,
            [nextTab]: {
              ...EMPTY_TAB_STATE,
              loaded: true,
              hasMore: false,
            },
          }));
          return;
        }
        // 对齐 Flutter getNearDay(6)：今天 + 往前 6 天的自然日区间。
        const [startDate, endDate] = last7DaysRange();
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        const queryType =
          nextTab === 'settled' ? EBetHistoryQueryType.SETTLED : EBetHistoryQueryType.UNSETTLED;
        const isSettled = nextTab === 'settled';

        let list: TBetHistoryOrderItem[] = [];
        if (venue === EVenue.FB) {
          const params = formatBetHistoryParamsFb({
            queryType,
            startTime,
            endTime,
            pageNum: page,
            pageSize: PAGE_SIZE,
          });
          // 未结算也带时间范围（对齐 Flutter 近 7 天）
          const res = await orderBetListFb({
            ...params,
            unsettledAllowTimeRange: !isSettled,
            startTime,
            endTime,
          });
          // 对齐 Flutter getFbBetList：拒单（st=2）不可晒单；取消单保留。
          list = formatBetHistoryRespFb({
            data: {
              ...res.data,
              records: res.data.records.filter((record) => record.st !== EFbOrderStatus.Rejected),
            },
          }).list;
        } else {
          // OB：已结算 / 未结算均传近 7 天（对齐 Flutter ShareOrderLogic._loadOBData）
          const res = await orderBetListOb({
            orderStatus: isSettled ? 1 : 0,
            beginTime: startTime,
            endTime: endTime,
            page,
            size: PAGE_SIZE,
          });
          // formatBetHistoryRespOb 已过滤取消 / 失败单（orderStatus 2、4）
          list = formatBetHistoryRespOb({
            data: res.data,
            params: {
              queryType,
              startTime,
              endTime,
              pageNum: page,
              pageSize: PAGE_SIZE,
            },
            pageNum: page,
          }).list;
        }

        if (seq !== requestSeqRef.current[nextTab]) return;
        setTabState((previous) => {
          const previousOrders = append ? previous[nextTab].orders : [];
          const deduped = new Map([...previousOrders, ...list].map((item) => [item.orderId, item]));
          return {
            ...previous,
            [nextTab]: {
              orders: Array.from(deduped.values()),
              page,
              hasMore: list.length >= PAGE_SIZE,
              loading: false,
              loaded: true,
              error: false,
              failedPage: undefined,
            },
          };
        });
      } catch (error) {
        console.error('load share orders failed', error);
        if (seq !== requestSeqRef.current[nextTab]) return;
        setTabState((previous) => ({
          ...previous,
          [nextTab]: {
            ...previous[nextTab],
            loading: false,
            loaded: true,
            error: true,
            failedPage: page,
          },
        }));
      }
    },
    [venue],
  );

  useEffect(() => {
    void loadOrders('unsettled');
  }, [loadOrders]);

  const currentState = tabState[tab];
  const orders = currentState.orders;
  const liveMatchIds = useMemo(() => {
    if (tab !== 'unsettled') return [];
    const ids = new Set<string>();
    orders.forEach((order) => {
      order.orderDetails.forEach((detail) => {
        const matchId = detail.matchId;
        const sportId = Number(detail.sportId);
        const isVirtual = [100, 101, 102, 103].includes(sportId);
        if (matchId && !detail.isChampion && !isVirtual) ids.add(matchId);
      });
    });
    return Array.from(ids);
  }, [orders, tab]);

  // Modal.open 使用独立 React Root（无 QueryClientProvider），因此这里直接轮询赛事接口。
  useEffect(() => {
    let disposed = false;
    let requesting = false;

    if (!SUPPORT_SHARE_ORDER_VENUES.has(String(venue)) || liveMatchIds.length === 0) {
      setLiveMatchList([]);
      setLiveMatchesLoading(false);
      return undefined;
    }

    const loadLiveMatches = async () => {
      if (requesting) return;
      requesting = true;
      setLiveMatchesLoading(true);
      try {
        const response =
          venue === EVenue.OB
            ? await getListByMidsReq({ mids: liveMatchIds.join(',') })
            : await getListReq({ matchIds: liveMatchIds, size: 999 });
        if (!disposed) setLiveMatchList(response.data);
      } catch (error) {
        console.error('load share-order live matches failed', error);
      } finally {
        requesting = false;
        if (!disposed) setLiveMatchesLoading(false);
      }
    };

    void loadLiveMatches();
    const timer = window.setInterval(() => void loadLiveMatches(), 7_000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [liveMatchIds, venue]);

  const liveMatchMap = useMemo(
    () =>
      Object.fromEntries(
        (liveMatchList ?? []).map((match) => [String(match.matchId), match]),
      ) as Record<string, MatchBaseInfo>,
    [liveMatchList],
  );

  const selectedOrder = useMemo(
    () => orders.find((item) => item.orderId === selectedId),
    [orders, selectedId],
  );

  const switchTab = (nextTab: TabKey) => {
    if (nextTab === tab) return;
    setTab(nextTab);
    setSelectedId('');
    setInfoVisible(false);
    void loadOrders(nextTab);
  };

  const selectOrder = (order: TBetHistoryOrderItem) => {
    if (selectedId === order.orderId) {
      setSelectedId('');
      return;
    }
    if (Number(order.orderBetAmount) < Number(minAmount)) {
      toast({
        type: 'warning',
        description: `请分享投注金额大于等于${formatMoney(minAmount)}的注单`,
      });
      return;
    }
    setSelectedId(order.orderId);
  };

  const toggleOrder = (orderId: string) => {
    setCollapsedIds((previous) => {
      const next = new Set(previous);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      toast({ type: 'warning', description: '请选择要晒的注单' });
      return;
    }
    if (Number(selectedOrder.orderBetAmount) < Number(minAmount)) {
      toast({
        type: 'warning',
        description: `该注单金额低于晒单门槛 (${minAmount})`,
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = mapBetHistoryOrderToShareCard(selectedOrder, String(venue || EVenue.FB));
      const ok = await onConfirm(payload);
      if (ok) onClose?.();
    } catch (error) {
      console.error('share order failed', error);
      toast({ type: 'error', description: '晒单失败，请稍后再试' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.dialogHeader}>
        <div className={styles.dialogTitle}>
          <h2>晒单</h2>
          <button
            type="button"
            className={styles.infoButton}
            aria-label="晒单说明"
            aria-expanded={infoVisible}
            onClick={() => setInfoVisible((visible) => !visible)}
          >
            i
          </button>
          {infoVisible ? (
            <div className={styles.infoTip} role="tooltip">
              晒单内容仅在对应场馆的聊天室内展示
            </div>
          ) : null}
        </div>
        <ModalCloseButton onClick={onClose} className={styles.closeButton} ariaLabel="关闭" />
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === 'unsettled' ? styles.tabActive : styles.tab}
          onClick={() => switchTab('unsettled')}
        >
          未结算
        </button>
        <button
          type="button"
          className={tab === 'settled' ? styles.tabActive : styles.tab}
          onClick={() => switchTab('settled')}
        >
          已结算
        </button>
      </div>

      <div
        className={styles.listArea}
        onScroll={(event) => {
          const target = event.currentTarget;
          const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 80;
          if (nearBottom && currentState.hasMore && !currentState.loading) {
            void loadOrders(tab, currentState.page + 1, true);
          }
        }}
      >
        {currentState.loading && orders.length === 0 ? (
          <div className={styles.skeletonList} aria-label="加载中">
            <div />
            <div />
          </div>
        ) : currentState.error && orders.length === 0 ? (
          <div className={styles.empty}>
            <span>注单加载失败</span>
            <button type="button" onClick={() => void loadOrders(tab)}>
              重新加载
            </button>
          </div>
        ) : !SUPPORT_SHARE_ORDER_VENUES.has(String(venue)) ? (
          <div className={styles.empty}>当前场馆暂不支持晒单选单</div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>暂无可晒注单</div>
        ) : (
          <div className={styles.list} role="radiogroup" aria-label="选择晒单注单">
            {orders.map((order) => (
              <ShareOrderCard
                key={order.orderId}
                order={order}
                selected={selectedId === order.orderId}
                collapsed={collapsedIds.has(order.orderId)}
                liveMatchMap={liveMatchMap}
                liveLoading={liveMatchesLoading}
                onSelect={() => selectOrder(order)}
                onToggle={() => toggleOrder(order.orderId)}
              />
            ))}
            {currentState.loading ? <div className={styles.loadingMore}>加载中…</div> : null}
            {currentState.error && currentState.failedPage ? (
              <button
                type="button"
                className={styles.loadMoreError}
                onClick={() =>
                  void loadOrders(tab, currentState.failedPage, (currentState.failedPage ?? 1) > 1)
                }
              >
                加载失败，点击重试
              </button>
            ) : null}
            {!currentState.hasMore ? <div className={styles.listEnd}>- 我是有底线的 -</div> : null}
          </div>
        )}
      </div>

      {orders.length > 0 ? (
        <button
          type="button"
          className={styles.submit}
          disabled={submitting || !selectedOrder}
          onClick={() => void handleSubmit()}
        >
          {submitting ? '发送中…' : '晒单'}
        </button>
      ) : null}
    </div>
  );
};

export const openShareOrderDialog = (props: Omit<ShareOrderDialogProps, 'onClose'>) => {
  Modal.open({
    content: (close) => <ShareOrderDialogInner {...props} onClose={close} />,
    showCloseButton: false,
    footer: <></>,
    position: 'bottom',
    className: styles.shareModal,
    contentClassName: styles.modalContent,
  });
};

export default openShareOrderDialog;
