import { useAppDispatch } from '@/core/store/hooks';
import {
  setBetHistoryQueryParams,
  updateBetHistoryQueryParams,
  openReserveEdit,
  closeReserveEdit,
  setReserveEditUnitStake,
  setReserveEditOdds,
  openReserveEditConfirmDialog,
  closeReserveEditConfirmDialog,
  setReserveEditLoading,
  openCancelReserveBet,
  closeCancelReserveBet,
  setCancelReserveBetLoading,
  type TCancelReserveBetEntry,
  type TReserveEditState,
} from '@/core/store/slices/betHistorySlice';
import { setVenue } from '@/core/store/slices/sportSlice';
import { EBetHistoryQueryType, EBetHistoryTab, EVenue } from '@/apis/commonSports/constants';
import { useCallback } from 'react';
import { BET_HISTORY_PAGE_SIZE, queryTypeToTabMap, tabListH5 } from './constants';
import type { TBetHistoryOrderItem, TBetHistoryQueryParams } from '@/apis/commonSports/types';
import { last7DaysRange, TDateRange } from '@/utils/dateHelper';
import { bigNB } from '@/utils/bet/bigMath';
import bigMath from '@/utils/bet/bigMath';
import { toast } from '@/common/components/Toast';
import { cancelReserveBetFb } from '@/apis/fbSports/betHistory/cancelReserveBetFb';
import { cancelPreBetOrderOb } from '@/apis/obSports/betHistory/cancelPreBetOrderOb';
import { updateReserveFb } from '@/apis/fbSports/betHistory/updateReserveFb';
import { useQueryClient } from '@tanstack/react-query';

export const useBetHistoryBaseMethods = () => {
  const dispatch = useAppDispatch();

  /** 场馆是全局状态（sport.venue），投注记录切场馆等于切全站场馆 */
  const changeActiveVenue = useCallback(
    (activeVenue: EVenue) => {
      dispatch(setVenue(activeVenue));
    },
    [dispatch],
  );

  const setQueryParams = useCallback(
    (payload: { activeVenue: EVenue; queryParams: TBetHistoryQueryParams }) => {
      dispatch(setBetHistoryQueryParams(payload));
    },
    [dispatch],
  );

  const updateQueryParams = useCallback(
    (payload: { activeVenue: EVenue; queryParams: Partial<TBetHistoryQueryParams> }) => {
      dispatch(updateBetHistoryQueryParams(payload));
    },
    [dispatch],
  );

  const baseChangeActiveTab = useCallback(
    ({
      activeVenue,
      activeTab = EBetHistoryTab.UNSETTLED,
      queryType,
    }: {
      activeVenue: EVenue;
      activeTab?: EBetHistoryTab;
      // 传入queryType情况时，忽略activeTab参数
      queryType?: EBetHistoryQueryType;
    }) => {
      const _activeTab = queryType ? queryTypeToTabMap[queryType] : activeTab;

      const currTab = tabListH5.find((i) => i.value === _activeTab);
      if (currTab) {
        const days7 = last7DaysRange();
        setQueryParams({
          activeVenue,
          queryParams: {
            queryType: queryType || currTab.initailParams.queryType,
            pageSize: BET_HISTORY_PAGE_SIZE,
            pageNum: 1,
            ...(_activeTab === EBetHistoryTab.SETTLED && {
              startTime: days7[0].getTime(),
              endTime: days7[1].getTime(),
            }),
          },
        });
      }
    },
    [setQueryParams],
  );

  // #region 切换查询参数
  const changePage = useCallback(
    (activeVenue: EVenue, pageNum: number, pageSize: number) => {
      updateQueryParams({ activeVenue, queryParams: { pageNum, pageSize } });
    },
    [updateQueryParams],
  );

  const changeDate = useCallback(
    (activeVenue: EVenue, range: TDateRange) => {
      const [startTime, endTime] = range;
      updateQueryParams({
        activeVenue,
        queryParams: { startTime: startTime.getTime(), endTime: endTime.getTime(), pageNum: 1 },
      });
    },
    [updateQueryParams],
  );

  /** 未结算，全部比赛|冠军 切换; 预约注单，预约中|已失效 切换 */
  const changeQueryType = useCallback(
    ({ activeVenue, queryType }: { activeVenue: EVenue; queryType: EBetHistoryQueryType }) => {
      updateQueryParams({
        activeVenue,
        queryParams: { queryType, pageNum: 1 },
      });
    },
    [updateQueryParams],
  );
  // #endregion

  return {
    changeActiveVenue,
    setQueryParams,
    baseChangeActiveTab,
    changePage,
    changeDate,
    changeQueryType,
  };
};

export const useBetHistoryMethods = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // #region 预约投注编辑
  /** 打开某条预约注单的修改态，同时自动关闭其他注单 */
  const openReserveEditOrder = useCallback(
    ({ venue, order }: { venue: EVenue; order: TBetHistoryOrderItem }) => {
      const detail = order.orderDetails[0];
      const matchName = detail
        ? detail.isChampion
          ? '冠军'
          : `${detail.homeName} VS ${detail.awayName}`
        : '';
      dispatch(
        openReserveEdit({
          venue,
          orderId: order.orderId,
          unitStake: bigNB(order.orderBetAmount).toFixed(2),
          odds: bigNB(order.orderOdds).toFixed(2),
          matchName,
        }),
      );
    },
    [dispatch],
  );

  const closeReserveEditOrder = useCallback(
    ({ venue }: { venue: EVenue }) => {
      dispatch(closeReserveEdit({ venue }));
    },
    [dispatch],
  );

  const updateReserveUnitStake = useCallback(
    ({
      venue,
      unitStake,
      computed,
      totalBalance,
    }: {
      venue: EVenue;
      unitStake: string;
      computed?: { minUnitStake: number; maxUnitStake: number } | null;
      totalBalance?: string;
    }) => {
      let finalStake = unitStake;
      if (computed && totalBalance) {
        const maxInput = Math.min(+totalBalance, computed.maxUnitStake);
        if (bigNB(+unitStake).gt(maxInput)) {
          finalStake = maxInput.toString();
        }
      }
      dispatch(setReserveEditUnitStake({ venue, unitStake: finalStake }));
    },
    [dispatch],
  );

  /** 镜像 updatePreBetOdds，含限额校验和 toast */
  const updateReserveEditOdds = useCallback(
    ({
      venue,
      type,
      value = '',
      currentOdds,
      computed,
      baseOdds,
    }: {
      venue: EVenue;
      type: 'plus' | 'minus' | 'manualInput';
      value?: string;
      currentOdds: string;
      /** 来自 useBetHistory 的 reserveEditComputed，限额已推导完毕 */
      computed?: { minOdds: number; maxOdds: number } | null;
      baseOdds: number;
    }) => {
      const minOdds = computed?.minOdds ?? baseOdds;
      const maxOdds = computed?.maxOdds;
      let newOdds: string;

      if (type === 'plus') {
        newOdds = bigMath.add(+currentOdds, 0.01).toString();
        if (maxOdds && bigNB(+newOdds).gt(maxOdds)) {
          toast({ type: 'warning', title: '已达最大预约投注赔率' });
          newOdds = maxOdds.toString();
        }
      } else if (type === 'minus') {
        newOdds = bigMath.subtract(+currentOdds, 0.01).toString();
        if (bigNB(+newOdds).lt(minOdds)) {
          toast({ type: 'warning', title: '预约投注赔率不能小于当前赔率' });
          return;
        }
      } else {
        newOdds = value;
      }

      dispatch(setReserveEditOdds({ venue, odds: bigNB(+newOdds).toFixed(2) }));
    },
    [dispatch],
  );

  // #endregion

  // #region 取消预约投注确认弹窗
  const openCancelReserveBetConfirm = useCallback(
    (venue: EVenue, orderId: string) => {
      dispatch(openCancelReserveBet({ venue, orderId }));
    },
    [dispatch],
  );

  const closeCancelReserveBetConfirm = useCallback(
    (venue: EVenue) => {
      dispatch(closeCancelReserveBet({ venue }));
    },
    [dispatch],
  );

  const submitCancelReserveBet = useCallback(
    async (venue: EVenue, entry: TCancelReserveBetEntry) => {
      const { orderId } = entry;

      dispatch(setCancelReserveBetLoading({ venue, loading: true }));
      try {
        let success = false;
        if (venue === EVenue.OB) {
          // OB 接口无返回体，未抛异常即成功
          await cancelPreBetOrderOb({ orderNo: orderId });
          success = true;
        } else {
          const res = await cancelReserveBetFb({ reserveId: orderId });
          success = res.data;
        }
        if (success) {
          toast({ title: '取消预约成功', type: 'success' });
          dispatch(closeCancelReserveBet({ venue }));
          queryClient.invalidateQueries({ queryKey: ['betHistorylist'] });
        } else {
          toast({ title: '取消预约失败', type: 'error' });
          dispatch(setCancelReserveBetLoading({ venue, loading: false }));
        }
      } catch {
        dispatch(setCancelReserveBetLoading({ venue, loading: false }));
      }
    },
    [dispatch, queryClient],
  );
  // #endregion

  // #region 修改预约确认弹窗
  const openReserveEditConfirm = useCallback(
    (venue: EVenue) => {
      dispatch(openReserveEditConfirmDialog({ venue }));
    },
    [dispatch],
  );

  const closeReserveEditConfirm = useCallback(
    (venue: EVenue) => {
      dispatch(closeReserveEditConfirmDialog({ venue }));
    },
    [dispatch],
  );

  const submitReserveEditConfirm = useCallback(
    async (venue: EVenue, edit: TReserveEditState) => {
      if (!edit.confirming) return;
      const { orderId, unitStake, odds } = edit;

      dispatch(setReserveEditLoading({ venue, loading: true }));
      try {
        const res = await updateReserveFb({
          reserveId: orderId,
          unitStake: +unitStake,
          odds: +odds,
        });
        if (res.data) {
          toast({ title: '修改预约成功', type: 'success' });
          dispatch(closeReserveEdit({ venue }));
          queryClient.invalidateQueries({ queryKey: ['betHistorylist'] });
        } else {
          toast({ title: '修改预约失败', type: 'error' });
          dispatch(setReserveEditLoading({ venue, loading: false }));
        }
      } catch {
        dispatch(setReserveEditLoading({ venue, loading: false }));
      }
    },
    [dispatch, queryClient],
  );
  // #endregion

  return {
    openReserveEditOrder,
    closeReserveEditOrder,
    updateReserveUnitStake,
    updateReserveEditOdds,
    openCancelReserveBetConfirm,
    closeCancelReserveBetConfirm,
    submitCancelReserveBet,
    openReserveEditConfirm,
    closeReserveEditConfirm,
    submitReserveEditConfirm,
  };
};
