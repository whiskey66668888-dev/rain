import { memo } from 'react';
import { useDebounce } from 'ahooks';
import { useVenueBetData } from '@/common/hooks/bet/useVenueBetData';
import { BettingDataContext } from '@/common/hooks/bet/context/BettingDataContext';
import BetPc from './BetPC';
import BetH5 from './BetH5';
import { useQuery } from '@tanstack/react-query';
import { useGetFbPreBetLimit, useGetLatestBetData } from '@/common/hooks/bet/useGetLatestBetData';
import FloatingButton from './BetPC/components/FloatingButton';
import { useGetConfirmingOrders } from '@/common/hooks/bet/useBetMethods';
import { EVenue } from '@/apis/commonSports/constants';
import { useBetResultToast } from '@/common/hooks/bet/useBetResultToast';
import { useCancelOrderPush } from '@/common/hooks/bet/useCancelOrderPush';
import { useAppSelector } from '@/core/store/hooks';
import { useHandle } from '../../hooks/useRoute';

const Bet = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const autoFollowMatch = useAppSelector((state) => state.user.autoFollowMatch);
  const betData = useVenueBetData();
  const { getLatestBetData } = useGetLatestBetData();
  const { getFbPreBetLimit } = useGetFbPreBetLimit();
  const { getConfirmingOrders } = useGetConfirmingOrders();
  const {
    venue,
    queryCount,
    isParlay,
    singleBetData,
    parlayBetData,
    showBetDrawer,
    confirmingOrders,
    currStep,
    preBetItem,
  } = betData;
  useBetResultToast();
  useCancelOrderPush();
  const handle = useHandle();
  const isShowBetRouter = isMobile ? !!handle?.showBet : true;

  // 防抖：快速切换单关/串关时，仅在实际停止切换后再发起请求
  const isParlayDebounced = useDebounce(isParlay, { wait: 300 });
  // #region 轮训投注项
  useQuery({
    queryKey: ['getLatestBetData', queryCount, isParlayDebounced],
    queryFn: () =>
      getLatestBetData({
        venue,
        isParlay: isParlayDebounced,
        singleBetData,
        parlayBetData,
      }),
    enabled: !!isShowBetRouter && showBetDrawer && currStep.normal,
    refetchInterval: 5 * 1000,
    staleTime: 0,
  });
  // #endregion

  // #region 轮训预约投注项限额信息
  useQuery({
    queryKey: ['getFbPreBetLimit', venue, !!preBetItem?.preBetInfo?.preBetEnabled],
    queryFn: () => getFbPreBetLimit({ venue, betItem: preBetItem }),
    enabled:
      !!isShowBetRouter && showBetDrawer && currStep.normal && !!preBetItem && venue === EVenue.FB,
    refetchInterval: 10 * 1000,
    staleTime: 0,
  });
  // #endregion

  // #region 轮训确认中订单,
  // 这个队列中，可能不止包含本次投注的订单，还有可能存在之前投注但还未等到结果就关闭投注弹窗的订单
  useQuery({
    queryKey: ['getLatestConfirmingOrders', venue],
    queryFn: () => getConfirmingOrders({ venue, confirmingOrders, autoFollowMatch }),
    enabled: !!confirmingOrders.length,
    refetchInterval: 2 * 1000,
    staleTime: 0,
  });
  // #endregion

  if (!isShowBetRouter) {
    return null;
  }

  return (
    <BettingDataContext.Provider value={betData}>
      {isMobile ? (
        <>
          <FloatingButton />
          <BetH5 key="h5" />
        </>
      ) : (
        <BetPc key="pc" />
      )}
    </BettingDataContext.Provider>
  );
};

Bet.displayName = 'Bet';

export default memo(Bet);
