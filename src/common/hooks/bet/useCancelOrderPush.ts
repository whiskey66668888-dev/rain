import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { updateBetOrders } from '@/core/store/slices/betSlice';
import { EBetOrderStatus, EBetStep } from '@/apis/commonSports/constants';
import { cancelOrderPushBridge } from '@/common/hooks/useNotificationWs/cancelOrderPushBridge';
import { useLatest } from 'ahooks';

export const useCancelOrderPush = () => {
  const dispatch = useAppDispatch();
  const venue = useAppSelector((state) => state.sport.venue);
  const betStep = useAppSelector((state) => state.bet[state.sport.venue].betStep);
  const betOrders = useAppSelector((state) => state.bet[state.sport.venue].betOrders);

  const betStepLatest = useLatest(betStep);
  const betOrdersLatest = useLatest(betOrders);
  const venueLatest = useLatest(venue);

  const handleCancelOrderPush = useCallback(
    (orderId: string) => {
      const isOnConfirmPage =
        betStepLatest.current === EBetStep.Polling || betStepLatest.current === EBetStep.Confirmed;
      if (!isOnConfirmPage || !venueLatest.current) return;

      const matchedOrder = betOrdersLatest.current?.find((o) => o.orderId === orderId);
      if (!matchedOrder) return;

      dispatch(
        updateBetOrders({
          venue: venueLatest.current,
          newOrders: [{ ...matchedOrder, orderStatus: EBetOrderStatus.Fail }],
        }),
      );
    },
    [betOrdersLatest, betStepLatest, dispatch, venueLatest],
  );

  useEffect(() => {
    cancelOrderPushBridge.current = handleCancelOrderPush;
    return () => {
      cancelOrderPushBridge.current = null;
    };
  }, [handleCancelOrderPush]);
};
