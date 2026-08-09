import { useEffect, useMemo, useRef, useState } from 'react';
import { TNotificationMessage } from './types';
import { useAppSelector } from '@/core/store/hooks';
import { usePreInfoQuery } from '@/apis/origin/setting';

type WorkerToTabMsg =
  | { type: 'WS_MESSAGE'; data: TNotificationMessage }
  | { type: 'WS_STATUS'; status: 'open' | 'close' | 'error' }
  | { type: 'PING' };

/**
 * WS 连接管理 Hook（SharedWorker 版）
 *
 * 同一账号多 Tab 共享同一个 SharedWorker，Worker 内只维护一条 WS 连接，
 * 彻底避免多 Tab 互相踢下线的问题。对上层暴露的接口与原版保持一致。
 */
export const useWsConnection = () => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const Authorization = useAppSelector((state) => state.user.loginInfo?.Authorization);
  const { data: preInfo } = usePreInfoQuery();
  const openWebSocket = preInfo?.openWebSocket ?? false;
  const webSocketUrls = useMemo(() => preInfo?.webSocketUrls || [], [preInfo?.webSocketUrls]);

  const [lastJsonMessage, setLastJsonMessage] = useState<TNotificationMessage | null>(null);
  const portRef = useRef<MessagePort | null>(null);

  // ── 创建 SharedWorker，整个生命周期只执行一次 ──────────────────────────────
  useEffect(() => {
    // SSR 或不支持 SharedWorker 的环境（Safari < 16.4）直接跳过
    if (typeof SharedWorker === 'undefined') return;

    const worker = new SharedWorker(new URL('./ws.worker.ts', import.meta.url), {
      type: 'module',
      // name 相同的 Worker 在同一 origin 下共享同一实例
      name: 'notification-ws',
    });

    portRef.current = worker.port;

    worker.port.onmessage = (e: MessageEvent<string>) => {
      try {
        const msg: WorkerToTabMsg = JSON.parse(e.data);
        if (msg.type === 'WS_MESSAGE') {
          setLastJsonMessage(msg.data);
        } else if (msg.type === 'PING') {
          // Worker 的探活心跳，立即回 PONG。
          // Worker 通过收不到 PONG 来判断 Tab 是否已关闭。
          worker.port.postMessage(JSON.stringify({ type: 'PONG' }));
        }
      } catch {
        // 忽略非法消息
      }
    };

    worker.port.start();

    return () => {
      // Tab 正常卸载（SPA 路由跳转/组件销毁）时主动通知 Worker 移除 port，
      // 不用等探活超时（5~8s），可以立即释放资源
      worker.port.postMessage(JSON.stringify({ type: 'PORT_CLOSE' }));
      worker.port.close();
      portRef.current = null;
    };
  }, []);

  // ── 登录态 / 凭证 / URL 变化时同步给 Worker ───────────────────────────────
  useEffect(() => {
    const port = portRef.current;
    if (!port) return;

    if (isLogin && Authorization && webSocketUrls.length && openWebSocket) {
      port.postMessage(JSON.stringify({ type: 'INIT', urls: webSocketUrls, token: Authorization }));
    } else {
      port.postMessage(JSON.stringify({ type: 'LOGOUT' }));
    }
  }, [isLogin, Authorization, webSocketUrls, openWebSocket]);

  return { lastJsonMessage };
};
