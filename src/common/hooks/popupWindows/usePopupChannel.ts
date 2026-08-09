import { useEffect } from 'react';
import { POPUP_PING_MSG, POPUP_PONG_MSG } from './windowManager';

/**
 * 供弹出子页面使用的消息通信 Hook。
 *
 * 内部自动响应父页面的心跳 ping，对业务代码完全透明。
 * channelName 通过 getPopupChannelName(key) 获取。
 *
 * @example
 * import { usePopupChannel } from '@/common/hooks/popupWindows/usePopupChannel';
 * import { EPopupWindowKey, getPopupChannelName } from '@/common/hooks/popupWindows/windowManager';
 *
 * const { send } = usePopupChannel(getPopupChannelName(EPopupWindowKey.BetHistory), (msg) => {
 *   if (msg.type === 'TOKEN_REFRESH') { ... }
 * });
 */
export function usePopupChannel<T = unknown>(channelName: string, onMessage?: (data: T) => void) {
  useEffect(() => {
    const channel = new BroadcastChannel(channelName);

    channel.onmessage = (event) => {
      // 自动响应心跳 ping，不透传给业务层
      if (event.data === POPUP_PING_MSG) {
        const pong = new BroadcastChannel(channelName);
        pong.postMessage(POPUP_PONG_MSG);
        pong.close();
        return;
      }
      onMessage?.(event.data as T);
    };

    return () => channel.close();
  }, [channelName, onMessage]);

  const send = (message: T) => {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage(message);
    channel.close();
  };

  return { send };
}
