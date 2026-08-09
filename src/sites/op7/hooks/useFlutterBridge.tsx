import { useCallback } from 'react';

// ✅ 定义通道类型
interface FlutterChannel {
  postMessage: (message: string) => void;
}

// ✅ 扩展 Window 接口
declare global {
  interface Window {
    [key: string]: unknown;
  }
}

// ✅ 定义消息类型
interface FlutterMessage {
  eventName: string;
  payload: Record<string, unknown>;
  meta: {
    timestamp: number;
    source: string;
  };
}

interface UseFlutterBridgeProps {
  channelName?: string;
}

function useFlutterBridge({ channelName = 'H5ToFlutter' }: UseFlutterBridgeProps = {}) {
  // ✅ 类型安全的通道检查
  const getChannel = useCallback((): FlutterChannel | null => {
    const channel = window[channelName];

    // 运行时类型守卫
    if (
      channel &&
      typeof channel === 'object' &&
      channel !== null &&
      'postMessage' in channel &&
      typeof (channel as Record<string, unknown>).postMessage === 'function'
    ) {
      return channel as FlutterChannel;
    }

    return null;
  }, [channelName]);

  const isInFlutter = useCallback(() => {
    return getChannel() !== null;
  }, [getChannel]);

  const sendToFlutter = useCallback(
    (eventName: string, payload: Record<string, unknown> = {}) => {
      const channel = getChannel();

      if (!channel) {
        console.warn(`[FlutterBridge] 通道 "${channelName}" 不存在`);
        return false;
      }

      try {
        // ✅ 特殊处理：非 H5ToFlutter 通道直接发送事件名
        if (channelName !== 'H5ToFlutter') {
          console.log(`[FlutterBridge][${channelName}] 发送事件:`, eventName);
          channel.postMessage(eventName);
          return true;
        }

        // ✅ H5ToFlutter 通道发送完整 JSON 消息
        const message: FlutterMessage = {
          eventName,
          payload,
          meta: {
            timestamp: Date.now(),
            source: 'h5',
          },
        };

        const json = JSON.stringify(message);
        console.log(`[FlutterBridge][${channelName}] 发送消息:`, json);
        channel.postMessage(json);
        return true;
      } catch (error) {
        console.error(`[FlutterBridge][${channelName}] 发送消息失败:`, error);
        return false;
      }
    },
    [channelName, getChannel],
  );

  return { sendToFlutter, isInFlutter };
}

export default useFlutterBridge;
