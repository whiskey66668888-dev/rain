import {
  EAcceptOddsPrefer,
  EBetHistoryQueryType,
  EBetOrderStatus,
  EBetStep,
  EBetType,
  ESportsLeftPanelType,
  EVenue,
} from '@/apis/commonSports/constants';
import type { TBetOrderItem, TBetResultTip, TFbPreBetLimitMap } from '@/apis/commonSports/types';
import type { TBetItem, TParlayItem } from '@/apis/commonSports/types';
import { getStakeOrderStatus } from '@/apis/fbSports/bet/getStakeOrderStatus';
import { placeBetFb } from '@/apis/fbSports/bet/placeBetFb';
import { placePreBetFb } from '@/apis/fbSports/bet/placePreBetFb';
import { toast } from '@/common/components/Toast';
import {
  takeChatFollowContext,
  clearChatFollowContext,
} from '@/common/hooks/bet/chatFollowContext';
import { submitFollowReq } from '@/apis/origin/discover';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import {
  addBetResultTips,
  addConfirmingOrders,
  clearBetData,
  removeConfirmingOrderByIds,
  removeFromParlay,
  removeMultipleFromParlay,
  removeFromSingle,
  removeMultipleFromSingle,
  setBetOrders,
  setBetStep,
  setBetType,
  setParlayBetAmount,
  setParlayFocusId,
  setParlayShowKeyboard,
  setShowBetDrawer,
  setSingleBetAmount,
  toggleOrderExpanded,
  setPreBetStatus,
  updateBetOrders,
  setPreBetOdds,
  setFbPreBetLimitMap,
  setQuickAmountInputId,
  setSingleFocusId,
  setDefaultAmount,
  setSingleIndex,
  setSingleBatchAmount,
  clearParlay,
} from '@/core/store/slices/betSlice';
import { useCallback } from 'react';
import { useNavigateWithLanguage } from '../useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import bigMath, { bigNB } from '@/utils/bet/bigMath';
import {
  handleAmountInputChange,
  betItemToFollowSnapshot,
  ordersToFollowMatchInfos,
} from '@/utils/bet';
import { mirrorBetAutoFollowToServer, mirrorOrdersAutoFollowToServer } from '@/common/hooks/follow';
import Cookies from 'js-cookie';
import { TQuickAmountKeys } from '@/sites/op7/components/Bet/BetPC/components/QuickAmount';
import { setFollowMatchIds, setSportsLeftPanelType } from '@/core/store/slices/sportSlice';
import { usePopupWindows } from '../popupWindows/usePopupWindows';
import { useQueryClient } from '@tanstack/react-query';
import { EFbReserveOrderStatus } from '@/apis/fbSports/common/constants/enum';

const useBetMethods = () => {
  const venue = useAppSelector((state) => state.sport.venue);
  const dispatch = useAppDispatch();

  const showBetDrawerFn = useCallback(() => {
    dispatch(setShowBetDrawer({ venue, showBetDrawer: true }));
  }, [dispatch, venue]);

  const hideBetDrawer = useCallback(() => {
    dispatch(setShowBetDrawer({ venue, showBetDrawer: false }));
    dispatch(setSportsLeftPanelType(ESportsLeftPanelType.MENU));
    clearChatFollowContext();
  }, [dispatch, venue]);

  const switchParlay = useCallback(() => {
    dispatch(setBetType({ venue, betType: EBetType.Parlay }));
  }, [dispatch, venue]);

  const switchSingle = useCallback(() => {
    dispatch(setBetType({ venue, betType: EBetType.Single }));
  }, [dispatch, venue]);

  const clearBet = useCallback(() => {
    dispatch(clearBetData({ venue }));
  }, [dispatch, venue]);

  const clickSingleInput = useCallback(
    (id: string) => {
      dispatch(setSingleFocusId({ venue, singleFocusId: id }));
    },
    [dispatch, venue],
  );

  const onSingleIndexChange = useCallback(
    (index: number) => {
      dispatch(setSingleIndex({ venue, singleIndex: index }));
    },
    [dispatch, venue],
  );

  const clickParlayInput = useCallback(
    (id: string) => {
      dispatch(setParlayShowKeyboard({ venue, show: true }));
      dispatch(setParlayFocusId({ venue, parlayFocusId: id }));
    },
    [dispatch, venue],
  );

  const setQuickAmountInput = useCallback(
    (id: string) => {
      dispatch(setQuickAmountInputId({ venue, id }));
    },
    [dispatch, venue],
  );

  const closeKeyboard = useCallback(() => {
    dispatch(setParlayShowKeyboard({ venue, show: false }));
    dispatch(setParlayFocusId({ venue, parlayFocusId: '' }));
    dispatch(setSingleFocusId({ venue, singleFocusId: '' }));
  }, [dispatch, venue]);

  const updateSingleBetAmount = useCallback(
    (params: { venue: EVenue; betItemId: string; betAmount: string }) => {
      dispatch(setSingleBetAmount(params));
    },
    [dispatch],
  );
  const updateSingleBatchAmount = useCallback(
    (params: { venue: EVenue; batchAmount: string }) => {
      dispatch(setSingleBatchAmount(params));
    },
    [dispatch],
  );

  const amountInputChangeSingle = useCallback(
    ({
      venue,
      betItem,
      value,
      totalBalance,
    }: {
      venue: EVenue;
      betItem: TBetItem;
      value: string;
      totalBalance: string;
    }) => {
      const maxbet = betItem.preBetInfo?.preBetEnabled
        ? betItem.preBetInfo?.preBetMaxAmount
        : betItem.maxBet;

      const amountStr = handleAmountInputChange(value);

      let finalAmountStr = amountStr;

      const maxInputAmount = Math.min(+totalBalance, maxbet);

      if (+amountStr > maxInputAmount) {
        finalAmountStr = maxInputAmount.toString();
      }

      updateSingleBetAmount({
        venue,
        betItemId: betItem.betItemId,
        betAmount: +finalAmountStr > 0 ? finalAmountStr : '',
      });
    },
    [updateSingleBetAmount],
  );

  const amountInputChangeSingleBatch = useCallback(
    ({
      venue,
      maxBet,
      value,
      totalBalance,
    }: {
      venue: EVenue;
      maxBet: number;
      value: string;
      totalBalance: string;
    }) => {
      const amountStr = handleAmountInputChange(value);

      let finalAmountStr = amountStr;

      const maxInputAmount = Math.min(+totalBalance, maxBet);

      if (+amountStr > maxInputAmount) {
        finalAmountStr = maxInputAmount.toString();
      }

      updateSingleBatchAmount({
        venue,
        batchAmount: +finalAmountStr > 0 ? finalAmountStr : '',
      });
    },
    [updateSingleBatchAmount],
  );

  const quickAmountSelectSingle = useCallback(
    ({
      venue,
      betItem,
      value,
      totalBalance,
    }: {
      venue: EVenue;
      betItem: TBetItem;
      value: TQuickAmountKeys;
      totalBalance: string;
    }) => {
      let calcAmount = +betItem.betAmount;
      if (value === 'MAX') {
        calcAmount = Math.min(+totalBalance, betItem.maxBet);
      } else {
        calcAmount = bigMath.add(calcAmount, value);
        calcAmount = Math.min(calcAmount, betItem.maxBet, +totalBalance);
      }
      updateSingleBetAmount({
        venue,
        betItemId: betItem.betItemId,
        betAmount: calcAmount > 0 ? calcAmount.toString() : '',
      });
    },
    [updateSingleBetAmount],
  );

  const openPreBet = useCallback(
    ({ venue, betItemId }: { venue: EVenue; betItemId: string }) => {
      dispatch(setPreBetStatus({ venue, betItemId, enabled: true }));
    },
    [dispatch],
  );

  const closePreBet = useCallback(
    ({ venue, betItemId }: { venue: EVenue; betItemId: string }) => {
      dispatch(setPreBetStatus({ venue, betItemId, enabled: false }));
    },
    [dispatch],
  );

  const updatePreBetOdds = useCallback(
    (params: {
      venue: EVenue;
      betItem: TBetItem;
      value?: string;
      type: 'plus' | 'minus' | 'manualInput';
      fbPreBetLimitMap: TFbPreBetLimitMap;
    }) => {
      const { venue, betItem, value = '', type, fbPreBetLimitMap } = params;
      const { preBetInfo } = betItem;
      if (!preBetInfo) {
        return;
      }
      const fbPreBetLimit = _.find(
        fbPreBetLimitMap,
        (_item, key) => betItem.betItemId === key || _.includes(betItem.relatedIds, key),
      );
      if (!fbPreBetLimit) {
        return;
      }
      console.log('js---updatePreBetOdds', venue, betItem, value, type, fbPreBetLimit);
      // dispatch(setPreBetOdds({ venue, betItem, preBetOdds }));
      let preBetOdds = '';
      if (type === 'plus') {
        preBetOdds = bigMath.add(preBetInfo.preBetOdds, 0.01).toString();
      } else if (type === 'minus') {
        preBetOdds = bigMath.subtract(preBetInfo.preBetOdds, 0.01).toString();
        if (bigNB(preBetOdds).lt(betItem.baseOdds)) {
          toast({
            type: 'warning',
            title: '预约投注赔率不能小于当前赔率',
          });
          return;
        }
      } else if (type === 'manualInput') {
        preBetOdds = handleAmountInputChange(value);
      }

      if (bigNB(preBetOdds).gt(fbPreBetLimit.mod)) {
        toast({
          type: 'warning',
          title: '已达最大预约投注赔率',
        });
        preBetOdds = fbPreBetLimit.mod.toString();
      }
      dispatch(setPreBetOdds({ venue, betItemId: betItem.betItemId, preBetOdds }));
    },
    [dispatch],
  );

  const updateParlayBetAmount = useCallback(
    (params: { venue: EVenue; id: string; betAmount: string }) => {
      dispatch(setParlayBetAmount(params));
    },
    [dispatch],
  );

  const amountInputChangeParlay = useCallback(
    ({
      venue,
      parlayItem,
      value,
      totalBalance,
    }: {
      venue: EVenue;
      parlayItem: TParlayItem;
      value: string;
      totalBalance: string;
    }) => {
      const maxbet = parlayItem.maxBet;

      const amountStr = handleAmountInputChange(value);

      let finalAmountStr = amountStr;

      const maxInputAmount = Math.min(+totalBalance, maxbet);

      if (+amountStr > maxInputAmount) {
        finalAmountStr = maxInputAmount.toString();
      }

      updateParlayBetAmount({
        venue,
        id: parlayItem.parlayCode,
        betAmount: +finalAmountStr > 0 ? finalAmountStr : '',
      });
    },
    [updateParlayBetAmount],
  );

  const quickAmountSelectParlay = useCallback(
    ({
      venue,
      parlayItem,
      value,
      totalBalance,
    }: {
      venue: EVenue;
      parlayItem: TParlayItem;
      value: TQuickAmountKeys;
      totalBalance: string;
    }) => {
      let calcAmount = +parlayItem.betAmount;
      if (value === 'MAX') {
        calcAmount = Math.min(+totalBalance, parlayItem.maxBet);
      } else {
        calcAmount = bigMath.add(calcAmount, value);
        calcAmount = Math.min(calcAmount, parlayItem.maxBet, +totalBalance);
      }
      updateParlayBetAmount({
        venue,
        id: parlayItem.parlayCode,
        betAmount: calcAmount.toString(),
      });
    },
    [updateParlayBetAmount],
  );

  // #region 保留选项继续投注
  /** 保留选项继续投注 */
  const continueBetClick = useCallback(() => {
    dispatch(setBetStep({ venue, betStep: EBetStep.Normal }));
    dispatch(setBetOrders({ venue, betOrders: [] }));
  }, [dispatch, venue]);
  // #endregion

  // #region 投注结果页，点击确认
  const confirmClick = ({
    venue,
    isParlay,
    betOrders,
    isMaskClick,
  }: {
    venue: EVenue;
    isParlay: boolean;
    betOrders: TBetOrderItem[];
    /**
     * 是否点击遮罩触发
     * 参考emc逻辑，
     * 如果是单关，要移除这个投注项，
     * 如果是串关，点击按钮确认时，情空串关所有内容，点击遮罩时，不清空串关投注项
     *  */
    isMaskClick?: boolean;
  }) => {
    // 串关-清空串关列表
    if (isParlay) {
      if (!isMaskClick) {
        dispatch(clearParlay({ venue }));
      }
      dispatch(setBetStep({ venue, betStep: EBetStep.Normal }));
      dispatch(setBetOrders({ venue, betOrders: [] }));
    }
    // 单关-移除当前投注的这个投注项
    if (!isParlay) {
      dispatch(
        removeFromSingle({
          venue,
          betItemId: betOrders[0]?.orderDetails?.[0]?.betItemId ?? '',
          syncSingleParlay: false,
        }),
      );
      dispatch(setBetStep({ venue, betStep: EBetStep.Normal }));
      dispatch(setBetOrders({ venue, betOrders: [] }));
    }
  };
  // #endregion

  const removeBetItem = useCallback(
    ({
      venue,
      betItemId,
      isParlay,
      syncSingleParlay,
    }: {
      venue: EVenue;
      betItemId: string;
      isParlay: boolean;
      syncSingleParlay: boolean;
    }) => {
      if (isParlay) {
        dispatch(removeFromParlay({ venue, betItemId, syncSingleParlay }));
      } else {
        dispatch(removeFromSingle({ venue, betItemId, syncSingleParlay }));
      }
    },
    [dispatch],
  );

  const removeInvalidBetItems = useCallback(
    ({
      venue,
      betItemIds,
      isParlay,
    }: {
      venue: EVenue;
      betItemIds: string[];
      isParlay: boolean;
    }) => {
      if (!betItemIds.length) return;
      if (isParlay) {
        dispatch(removeMultipleFromParlay({ venue, betItemIds }));
      } else {
        dispatch(removeMultipleFromSingle({ venue, betItemIds }));
      }
    },
    [dispatch],
  );

  const toggleBetOrderExpanded = useCallback(
    ({ venue, orderId }: { venue: EVenue; orderId: string }) => {
      dispatch(toggleOrderExpanded({ venue, orderId }));
    },
    [dispatch],
  );

  const setDefaultBetAmount = useCallback(
    ({ venue, defaultAmount }: { venue: EVenue; defaultAmount: string }) => {
      dispatch(setDefaultAmount({ venue, defaultAmount }));
    },
    [dispatch],
  );

  const toggleDefaultAmount = useCallback(
    ({
      defaultAmount,
      betItem,
      venue,
    }: {
      defaultAmount: string;
      betItem: TBetItem;
      venue: EVenue;
    }) => {
      // 如果上一次有默认金额，则设置默认金额为空
      if (!!defaultAmount) {
        setDefaultBetAmount({ venue, defaultAmount: '' });
        return;
      }

      if (!betItem?.minBet) {
        return;
      }

      if (bigNB(betItem.betAmount).lt(betItem.minBet)) {
        toast({
          type: 'warning',
          title: `默认金额最小为${betItem.minBet}`,
        });
        return;
      }
      setDefaultBetAmount({
        venue,
        defaultAmount: betItem.betAmount,
      });
    },
    [setDefaultBetAmount],
  );

  return {
    showBetDrawerFn,
    hideBetDrawer,
    switchParlay,
    switchSingle,
    clearBet,
    clickParlayInput,
    closeKeyboard,
    amountInputChangeParlay,
    quickAmountSelectParlay,
    updateParlayBetAmount,
    amountInputChangeSingle,
    amountInputChangeSingleBatch,
    quickAmountSelectSingle,
    updateSingleBetAmount,
    continueBetClick,
    removeBetItem,
    removeInvalidBetItems,
    toggleBetOrderExpanded,
    openPreBet,
    closePreBet,
    updatePreBetOdds,
    setQuickAmountInput,
    clickSingleInput,
    onSingleIndexChange,
    toggleDefaultAmount,
    setDefaultBetAmount,
    confirmClick,
  };
};

export default useBetMethods;

// #region 投注
export const usePlaceBet = () => {
  const dispatch = useAppDispatch();
  const { betResultTips } = useBetResultTips();
  const queryClient = useQueryClient();

  /** 投注 */
  const placeBet = useCallback(
    async (params: {
      venue: EVenue;
      acceptOddsPrefer: EAcceptOddsPrefer;
      isParlay: boolean;
      betItemList: TBetItem[];
      /** 只传入已输入金额的串关投注项 */
      parlayList: TParlayItem[];
      /** 更新默认金额 */
      updatedDefaultAmount?: string;
      callback?: () => void;
      autoFollowMatch?: boolean;
    }) => {
      if (params.updatedDefaultAmount) {
        dispatch(
          setDefaultAmount({ venue: params.venue, defaultAmount: params.updatedDefaultAmount }),
        );
      }
      dispatch(setBetStep({ venue: params.venue, betStep: EBetStep.Fetching }));
      const res = await placeBetFb(params);
      console.log('js---placeBet', JSON.stringify(res));
      if (!res) {
        // 下注接口返回null，说明投注失败
        dispatch(setBetStep({ venue: params.venue, betStep: EBetStep.Normal }));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['getUnsettledCount'] });
      // 是否关注赛事（仅立即成功的订单，确认中的订单等轮询成功后再关注）
      if (params.autoFollowMatch) {
        const successOrders = res.filter(
          (order: TBetOrderItem) => order.orderStatus === EBetOrderStatus.Success,
        );
        // 登录=bet（随后被服务器列表覆盖），游客=tourist（登录时再 sync 上报）
        const matchInfos = ordersToFollowMatchInfos(
          successOrders,
          Cookies.get('isLogin') === '1' ? 'bet' : 'tourist',
        );
        if (matchInfos.length) {
          dispatch(setFollowMatchIds({ type: 'add', matchInfos }));
          // 登录态镜像到服务器（source=2）；游客态由上面的 redux+localStorage 承接，登录时再 sync
          mirrorOrdersAutoFollowToServer(successOrders);
        }
      }
      // 下注成功，回调,更新余额
      params.callback?.();
      // 设置投注订单
      dispatch(setBetOrders({ venue: params.venue, betOrders: res }));

      // 聊天跟单成功后上报跟单记录（需已有晒单；失败不影响投注流程）
      const isChatBet = !!getGlobalStoreForApiRequest().getState().bet[params.venue]?.isChatBet;
      if (isChatBet) {
        const followCtx = takeChatFollowContext();
        if (followCtx?.shareOrderId) {
          res.forEach((order: TBetOrderItem) => {
            if (
              !order.orderId ||
              order.orderStatus === EBetOrderStatus.Fail ||
              order.isPreBetOrder
            ) {
              return;
            }
            const betAmount = Number(order.orderBetAmount);
            if (!(betAmount > 0)) return;
            void submitFollowReq({
              shareOrderId: followCtx.shareOrderId,
              orderId: order.orderId,
              betAmount,
              venueCode: followCtx.venueCode,
            });
          });
        }
      }

      // 筛选出确认中的注单，加入确认中注单队列
      const confirmingOrders = res.filter(
        (item: TBetOrderItem) => item.orderStatus === EBetOrderStatus.Confirming,
      );

      if (confirmingOrders.length) {
        dispatch(setBetStep({ venue: params.venue, betStep: EBetStep.Polling }));
        dispatch(addConfirmingOrders({ venue: params.venue, orders: confirmingOrders }));
      } else {
        dispatch(setBetStep({ venue: params.venue, betStep: EBetStep.Confirmed }));
      }

      // 添加投注结果提示,会自动过滤掉确认中的注单
      betResultTips({ venue: params.venue, orders: res });
    },
    [dispatch, queryClient, betResultTips],
  );
  return { placeBet };
};

// #endregion

// #region 预约投注
export const usePlacePreBet = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const { openBetHistoryWindow } = usePopupWindows();

  const placePreBet = useCallback(
    async (params: {
      venue: EVenue;
      betItem?: TBetItem;
      callback?: () => void;
      isMobile: boolean;
      autoFollowMatch?: boolean;
    }) => {
      const { venue, betItem, callback, isMobile, autoFollowMatch } = params;
      if (!betItem) return;

      dispatch(setBetStep({ venue, betStep: EBetStep.Fetching }));
      const res = await placePreBetFb({ betItem });
      console.log('js---placePreBet', res);

      // 接口错误，回到普通态，真实的投注失败，继续到结果页面
      if (!res) {
        dispatch(setBetStep({ venue, betStep: EBetStep.Normal }));
        return;
      }

      const success =
        res &&
        res.data &&
        [
          EFbReserveOrderStatus.Valid,
          EFbReserveOrderStatus.Successful,
          EFbReserveOrderStatus.Confirming,
        ].includes(res.data.st);

      // 冠军（Outright）投注项不自动关注
      if (success && autoFollowMatch && !betItem.isChampion) {
        dispatch(
          setFollowMatchIds({
            type: 'add',
            matchInfos: [
              betItemToFollowSnapshot(betItem, Cookies.get('isLogin') === '1' ? 'bet' : 'tourist'),
            ],
          }),
        );
        // 登录态镜像到服务器（source=2）
        mirrorBetAutoFollowToServer([betItem]);
      }

      // 预约投注结果 toast 提示（点击可跳转预约注单）
      toast({
        type: success ? 'success' : 'error',
        title: success ? '预约投注成功' : '预约投注失败',
        description: `${betItem.homeName} VS ${betItem.awayName}`,
        action: () => {
          if (isMobile) {
            navigate(
              `${PATHS.betHistoryH5}?queryType=${success ? EBetHistoryQueryType.RESERVE_IN_PROGRESS : EBetHistoryQueryType.RESERVE_FAIL}`,
            );
          } else {
            openBetHistoryWindow(EBetHistoryQueryType.RESERVE_IN_PROGRESS);
          }
        },
        actionLabel: '查看详情',
        showProgress: true,
        duration: 6000,
      });

      callback?.();

      dispatch(setPreBetStatus({ venue, betItemId: betItem.betItemId, enabled: false }));
      dispatch(setFbPreBetLimitMap({ venue, preBetLimitMap: {} }));

      // 预约投注复用普通订单结果页（OrdersPanel），通过 isPreBetOrder 差异化展示
      const preBetOdds = Number(betItem.preBetInfo?.preBetOdds || betItem.baseOdds || 0);
      const order: TBetOrderItem = {
        orderId: res.data.id,
        isPreBetOrder: true,
        orderBetAmount: bigNB(betItem.betAmount || 0).toFixed(2),
        orderMaxWinAmount: bigNB(betItem.betAmount || 0)
          .times(preBetOdds)
          .toFixed(2),
        orderStatus: success ? EBetOrderStatus.Success : EBetOrderStatus.Fail,
        orderOdds: preBetOdds,
        orderCode: '1',
        orderSum: 1,
        orderLabel: '单关',
        orderDetails: [{ ...betItem, baseOdds: preBetOdds }],
      };
      dispatch(setBetOrders({ venue, betOrders: [order] }));
      dispatch(setBetStep({ venue, betStep: EBetStep.Confirmed }));
    },
    [dispatch, navigate, openBetHistoryWindow],
  );

  return { placePreBet };
};

// #endregion

// #region 投注结果提示
export const useBetResultTips = () => {
  const dispatch = useAppDispatch();
  const betResultTips = useCallback(
    ({ venue, orders }: { venue: EVenue; orders: TBetOrderItem[] }) => {
      const tipsArray: TBetResultTip[] = [];

      orders.forEach((order) => {
        if (order.orderStatus === EBetOrderStatus.Confirming) {
          return;
        }
        if (order.orderCode === '1') {
          const first = order.orderDetails[0];
          tipsArray.push({
            id: `${order.orderId}`,
            message: first?.isChampion ? '冠军投注' : `${first?.homeName} VS ${first?.awayName}`,
            success: [EBetOrderStatus.Success].includes(order.orderStatus),
          });
        } else {
          tipsArray.push({
            id: `${order.orderId}`,
            message: `${order.orderSum}* ${order.orderLabel}`,
            success: [EBetOrderStatus.Success].includes(order.orderStatus),
          });
        }
      });

      if (tipsArray.length) {
        dispatch(addBetResultTips({ venue, tipsArray }));
      }
    },
    [dispatch],
  );
  return { betResultTips };
};
// #endregion

// #region 轮训确认中注单
export const useGetConfirmingOrders = () => {
  const dispatch = useAppDispatch();
  const { betResultTips } = useBetResultTips();

  const getConfirmingOrders = useCallback(
    async ({
      venue,
      confirmingOrders,
      autoFollowMatch,
    }: {
      venue: EVenue;
      confirmingOrders: TBetOrderItem[];
      autoFollowMatch: boolean;
    }) => {
      //   const store = getGlobalStoreForApiRequest();
      const res = await getStakeOrderStatus({ orders: confirmingOrders });
      console.log('js---getConfirmingOrders', res);
      // 这里的res，状态都不是确认中的
      if (res.length) {
        dispatch(updateBetOrders({ venue, newOrders: res }));
        dispatch(removeConfirmingOrderByIds({ venue, orderIds: res.map((o) => o.orderId) }));
        betResultTips({ venue, orders: res });

        // 轮询确认成功后，自动关注赛事
        if (autoFollowMatch) {
          const successOrders = res.filter(
            (order) => order.orderStatus === EBetOrderStatus.Success,
          );
          // 登录=bet（随后被服务器列表覆盖），游客=tourist（登录时再 sync 上报）
          const matchInfos = ordersToFollowMatchInfos(
            successOrders,
            Cookies.get('isLogin') === '1' ? 'bet' : 'tourist',
          );
          if (matchInfos.length) {
            dispatch(setFollowMatchIds({ type: 'add', matchInfos }));
            // 登录态镜像到服务器（source=2）
            mirrorOrdersAutoFollowToServer(successOrders);
          }
        }
      }
      return res;
    },
    [dispatch, betResultTips],
  );
  return { getConfirmingOrders };
};
// #endregion
