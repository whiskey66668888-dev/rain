import { useCallback, useEffect, useRef } from 'react';
import { EMsgWeight } from '@/utils/constants/notificationWs';
import { useNavigateWithLanguage } from '../useNavigateWithLanguage';
import { useWsConnection } from './useWsConnection';
import { WEIGHT_MAP } from '@/utils/constants/notificationWs';
import {
  TNotificationMessage,
  TSportWinOrderMessage,
  TPickResult,
  isSportWinOrderMessage,
  isSportCancelOrderMessage,
} from './types';
import { toast } from '@/common/components/Toast';
import { getHandler } from './handlers';
import { useUnmount } from 'ahooks';
import { useAppSelector } from '@/core/store/hooks';
import { usePopupWindows } from '../popupWindows/usePopupWindows';
import { cancelOrderPushBridge } from './cancelOrderPushBridge';
import { cancelOrderHistoryBridge } from './cancelOrderHistoryBridge';

/**
 * 通知类 WebSocket 业务 Hook
 * 负责：消息入队、优先级调度、分发给对应 handler 展示 toast
 */
export const useNotificationWs = () => {
  const navigate = useNavigateWithLanguage();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const { openBetHistoryWindow } = usePopupWindows();

  const { lastJsonMessage } = useWsConnection();

  const msgQueueRef = useRef<TNotificationMessage[]>([]);
  const isShowingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickNextMsgs = useCallback((): TPickResult => {
    const result: TPickResult = { msg: null, winOrderMsgs: null };
    if (!msgQueueRef.current.length) return result;

    // 找出队列中优先级最高（WEIGHT_MAP 值最小）的消息下标
    let bestIdx = -1;
    let bestWeight = 9999;
    for (let i = 0; i < msgQueueRef.current.length; i++) {
      const msg = msgQueueRef.current[i];
      if (!msg) continue;
      const weight = WEIGHT_MAP[msg.businessInfo.msgWeight] ?? 9999;
      if (weight < bestWeight) {
        bestWeight = weight;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) return result;

    const pickMsg = msgQueueRef.current[bestIdx];
    if (!pickMsg) return result;
    result.msg = pickMsg;

    // SPORT_WIN_ORDER_PUSH 需要批量处理：一次捞出队列中所有同类型消息
    if (isSportWinOrderMessage(pickMsg)) {
      const sportMsgs: TSportWinOrderMessage[] = [];
      const remaining: TNotificationMessage[] = [];
      for (const m of msgQueueRef.current) {
        if (isSportWinOrderMessage(m)) {
          sportMsgs.push(m);
        } else {
          remaining.push(m);
        }
      }
      msgQueueRef.current = remaining;
      result.winOrderMsgs = sportMsgs;
      return result;
    }

    // 普通消息：从队列中取出这一条
    msgQueueRef.current.splice(bestIdx, 1);
    return result;
  }, []);

  const showNextToast = useCallback(() => {
    if (isShowingRef.current) return;
    const result = pickNextMsgs();
    if (!result.msg) return;
    isShowingRef.current = true;

    const { msg, winOrderMsgs } = result;

    if (isSportCancelOrderMessage(msg)) {
      cancelOrderPushBridge.current?.(msg.businessData.orderId);
      cancelOrderHistoryBridge.current?.(msg.businessData.orderId);
    }

    const handler = getHandler(msg.businessInfo.businessType);
    const toastOptions = handler({ msg, winOrderMsgs, navigate, isMobile, openBetHistoryWindow });

    if (toastOptions.type) {
      toast(toastOptions);
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(
      () => {
        isShowingRef.current = false;
        showNextToast();
      },
      (toastOptions.duration ?? 0) + 100,
    );
  }, [navigate, isMobile, openBetHistoryWindow, pickNextMsgs]);

  // 监听消息推送
  useEffect(() => {
    if (
      lastJsonMessage?.businessInfo &&
      [EMsgWeight.T0, EMsgWeight.T1, EMsgWeight.T2].includes(lastJsonMessage.businessInfo.msgWeight)
    ) {
      msgQueueRef.current.push(lastJsonMessage);
      showNextToast();
    }
  }, [lastJsonMessage, showNextToast]);

  useUnmount(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  });
};
