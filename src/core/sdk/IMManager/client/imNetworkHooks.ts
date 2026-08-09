/**
 * OpenIM WASM 全局网络钩子（对齐 tf90 imStore.installImGlobalNetworkHooks）
 * - WS：对 OpenIM host 补 siteCode
 * - fetch：OpenIM API 补 X-Request-Api；上传补 siteCode
 * - 全局只包一层，避免重复 wrap
 */

type HookConfig = {
  apiAddr: string;
  wsHost: string;
  siteCode: string;
};

let hooksInstalled = false;
let hookConfig: HookConfig = { apiAddr: '', wsHost: '', siteCode: '' };
let baseWebSocket: typeof WebSocket | null = null;
let baseFetch: typeof fetch | null = null;

const resolveWsHost = (wsAddr: string): string => {
  try {
    return new URL(wsAddr).host;
  } catch {
    return '';
  }
};

const createWebSocketWithProtocols = (
  WebSocketCtor: typeof WebSocket,
  url: string,
  protocols?: string | string[],
): WebSocket => {
  return protocols === undefined ? new WebSocketCtor(url) : new WebSocketCtor(url, protocols);
};

export const installImNetworkHooks = (params: {
  apiAddr: string;
  wsAddr: string;
  siteCode: string;
}): void => {
  if (typeof window === 'undefined') return;

  // 每次调用更新配置；安装动作只执行一次
  hookConfig = {
    apiAddr: params.apiAddr.replace(/\/$/, ''),
    wsHost: resolveWsHost(params.wsAddr),
    siteCode: params.siteCode,
  };

  if (hooksInstalled) return;
  hooksInstalled = true;

  baseWebSocket = window.WebSocket;
  baseFetch = window.fetch.bind(window);

  const PatchedWebSocket = function (url: string | URL, protocols?: string | string[]) {
    const WebSocketCtor = baseWebSocket ?? window.WebSocket;

    if (typeof url === 'string' && hookConfig.wsHost) {
      try {
        const parsed = new URL(url, window.location.href);
        // 仅处理 OpenIM WS host，补 siteCode（与 tf90 一致）
        if (
          parsed.host === hookConfig.wsHost &&
          hookConfig.siteCode &&
          !parsed.searchParams.has('siteCode')
        ) {
          parsed.searchParams.set('siteCode', hookConfig.siteCode);
        }
        return createWebSocketWithProtocols(WebSocketCtor, parsed.toString(), protocols);
      } catch {
        return createWebSocketWithProtocols(WebSocketCtor, url, protocols);
      }
    }

    return createWebSocketWithProtocols(WebSocketCtor, String(url), protocols);
  };

  if (baseWebSocket) {
    try {
      PatchedWebSocket.prototype = baseWebSocket.prototype;
      Object.setPrototypeOf(PatchedWebSocket, baseWebSocket);
    } catch {
      // Safari 旧版可忽略
    }
  }

  window.WebSocket = PatchedWebSocket as unknown as typeof WebSocket;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const fetchFn = baseFetch ?? window.fetch.bind(window);
    const reqUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // OpenIM API：补 X-Request-Api（对齐 tf90）
    if (
      reqUrl &&
      (reqUrl.includes('openim-api') || reqUrl.includes('/object/complete_multipart_upload'))
    ) {
      const headers = new Headers(init?.headers);
      if (hookConfig.apiAddr) {
        headers.set('X-Request-Api', hookConfig.apiAddr);
      }
      return fetchFn(input, { ...init, headers });
    }

    // 上传类：补 siteCode（对齐 tf90）
    if (
      reqUrl &&
      (reqUrl.includes('/object/') || reqUrl.includes('/upload') || reqUrl.includes('/file'))
    ) {
      const headers = new Headers(init?.headers);
      if (hookConfig.siteCode) {
        headers.set('siteCode', hookConfig.siteCode);
      }
      return fetchFn(input, { ...init, headers });
    }

    return fetchFn(input, init);
  };
};
