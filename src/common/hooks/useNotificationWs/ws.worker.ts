/**
 * ws.worker.ts — SharedWorker
 *
 * 问题背景：
 *   同一账号在浏览器开多个 Tab 时，每个 Tab 都会独立连接 WS。
 *   但后端只允许同一账号保持一个连接，导致多 Tab 互相踢下线、无限重连。
 *
 * 解决思路：
 *   把 WS 连接放进 SharedWorker。SharedWorker 是浏览器提供的跨 Tab 共享进程，
 *   同一 origin 下 name 相同的 SharedWorker 只会有一个实例。
 *   所有 Tab 都连接到这同一个 Worker，Worker 内部只维护一条 WS 连接，
 *   收到后端消息后广播给所有 Tab。
 *
 * 通信协议：
 *   Tab → Worker（通过 port.postMessage）：
 *     { type: 'INIT', urls, token }  — Tab 登录成功或 token 变化时发，触发建立/重建 WS
 *     { type: 'LOGOUT' }             — Tab 登出时发，Worker 主动断开 WS
 *     { type: 'PORT_CLOSE' }         — Tab 正常卸载时发，Worker 立即移除该 port（可选优化）
 *     { type: 'PONG' }               — 回应 Worker 的 PING 探活
 *
 *   Worker → Tab（通过 port.postMessage）：
 *     { type: 'WS_MESSAGE', data }   — 将后端推送的业务消息转发给所有 Tab
 *     { type: 'WS_STATUS', status }  — 连接状态变化通知（open/close/error）
 *     { type: 'PING' }               — 探活心跳，Tab 必须回 PONG
 *
 * Port 探活机制（解决 Tab 强制关闭后 stale port 残留的问题）：
 *   Worker 每 5s 向所有 port 发一次 PING，Tab 收到后立即回 PONG。
 *   Worker 记录每个 port 最后一次收到 PONG 的时间，
 *   超过 8s 没有回应则认为该 Tab 已经关闭，自动移除该 port。
 *   这样即使 Tab 崩溃、被强制关闭，stale port 也会在 8s 内自动清理。
 */

// Worker 是独立 bundle，不能 import 主应用的 alias 路径，常量直接写字面量
// EBusinessType.PING_PONG = 1（见 src/utils/constants/notificationWs.ts）
const WS_PING_MESSAGE = JSON.stringify({ businessInfo: { businessType: 1 } });
const MAX_RETRY_PER_URL = 3; // 同一个 URL 失败多少次后切换到下一个
const WS_HEARTBEAT_INTERVAL_MS = 30 * 1000; // 每 30s 向后端发一次 WS 心跳
const WS_HEARTBEAT_TIMEOUT_MS = 60 * 1000; // 60s 内后端无响应则认为连接已死
const RECONNECT_INTERVAL_MS = 1000; // WS 断线后等待 1s 再重连

const PORT_PING_INTERVAL_MS = 5 * 1000; // 每 5s 向所有 Tab port 发一次 PING
const PORT_PONG_TIMEOUT_MS = 8 * 1000; // 超过 8s 没有 PONG 回应，视为 Tab 已关闭

/**
 * 后端返回这些 businessType 时，表示当前 token 已被服务端拒绝。
 * Worker 会主动断开连接，且在 Authorization 更新（重新登录）前不再重连。
 *   -1: AUTHORIZATION_INVALID          令牌已失效
 *   -2: AUTHORIZATION_EMPTY            令牌为空
 *   -3: AUTHORIZATION_VERIFY_ERROR     令牌校验失败
 *   -4: AUTHORIZATION_LOGIN_TIME_ERROR 解析令牌登录时间失败
 *   -5: GET_NODE_INFO_ERROR            获取连接节点信息失败
 */
const AUTH_ERROR_TYPES = new Set([-1, -2, -3, -4, -5]);

// ─── 消息类型 ─────────────────────────────────────────────────────────────────

type TabToWorkerMsg =
  | { type: 'INIT'; urls: string[]; token: string }
  | { type: 'LOGOUT' }
  | { type: 'PORT_CLOSE' }
  | { type: 'PONG' };

// ─── Worker 内部状态 ──────────────────────────────────────────────────────────

/**
 * 所有已连接的 Tab 的通信管道（MessagePort）。
 * 每个 Tab 打开时往这里加一个，Tab 关闭/超时后移除。
 */
const ports = new Set<MessagePort>();

/**
 * 每个 port 最后一次收到 PONG 的时间戳。
 * 用于判断 Tab 是否还存活。
 */
const portLastPong = new Map<MessagePort, number>();

let ws: WebSocket | null = null;
let wsUrls: string[] = []; // 后端提供的备用 WS 地址列表
let wsToken: string | null = null;
let urlIndex = 0; // 当前使用的 URL 下标
let failCount = 0; // 当前 URL 的连续失败次数

/**
 * 是否应该保持 WS 连接。
 * 登出或所有 Tab 关闭时置为 false，断线后就不会再重连。
 */
let active = false;

/**
 * 服务端是否因 token 无效而拒绝了连接。
 * 为 true 时，收到相同 token 的 INIT 不会重连，防止无意义的重试。
 * 只有 INIT 携带了新 token 时才会清除此标志并重新连接。
 */
let authRejected = false;

let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
/** 发出 WS 心跳后等待后端响应的计时器，收到任意消息后清除 */
let wsPongTimer: ReturnType<typeof setTimeout> | null = null;
/** 定期向所有 Tab port 发 PING 的计时器 */
let portPingTimer: ReturnType<typeof setInterval> | null = null;

// ─── 广播 ────────────────────────────────────────────────────────────────────

/** 将消息发给所有已连接的 Tab */
function broadcast(msg: object) {
  const data = JSON.stringify(msg);
  ports.forEach((port) => port.postMessage(data));
}

// ─── Port 探活 ────────────────────────────────────────────────────────────────

/**
 * 启动 Port 探活定时器。
 * 每 5s 检查一次：向所有 port 发 PING，同时检查上一轮有没有超时未回的 port。
 * 超时的 port 说明对应 Tab 已经关闭，直接移除。
 */
function startPortHeartbeat() {
  if (portPingTimer) return; // 已经在跑了，不重复启动
  portPingTimer = setInterval(() => {
    const now = Date.now();
    ports.forEach((port) => {
      const lastPong = portLastPong.get(port)!;
      if (now - lastPong > PORT_PONG_TIMEOUT_MS) {
        // 超时：该 Tab 已经关闭或无响应，移除
        console.log('[WsWorker] Port pong timeout, removing stale tab port');
        handlePortClose(port);
      } else {
        // 正常：发 PING，等待 Tab 回 PONG
        port.postMessage(JSON.stringify({ type: 'PING' }));
      }
    });
  }, PORT_PING_INTERVAL_MS);
}

function stopPortHeartbeat() {
  if (portPingTimer) {
    clearInterval(portPingTimer);
    portPingTimer = null;
  }
}

// ─── WS 心跳（Worker ↔ 后端）────────────────────────────────────────────────

function stopWsHeartbeat() {
  if (wsHeartbeatTimer) {
    clearInterval(wsHeartbeatTimer);
    wsHeartbeatTimer = null;
  }
  if (wsPongTimer) {
    clearTimeout(wsPongTimer);
    wsPongTimer = null;
  }
}

function startWsHeartbeat() {
  stopWsHeartbeat();
  wsHeartbeatTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(WS_PING_MESSAGE);
      // 启动超时计时：如果 60s 内没收到任何消息，说明连接已静默断开，
      // 主动 close() 会触发 onclose，onclose 里会安排重连
      wsPongTimer = setTimeout(() => {
        console.warn('[WsWorker] WS pong timeout, closing dead connection...');
        ws?.close();
      }, WS_HEARTBEAT_TIMEOUT_MS);
    }
  }, WS_HEARTBEAT_INTERVAL_MS);
}

// ─── WebSocket 连接 ───────────────────────────────────────────────────────────

function connect() {
  if (!active || !wsUrls.length || !wsToken) return;

  const url = `${wsUrls[urlIndex]}/${encodeURIComponent(wsToken)}`;
  console.log('[WsWorker] Connecting:', url);

  // 用局部变量 socket 保存本次创建的实例。
  // 若在回调触发前已经调用了 closeWs() 创建了新连接，
  // socket !== ws 说明本次连接已作废，直接忽略回调，避免状态错乱。
  const socket = new WebSocket(url);
  ws = socket;

  socket.onopen = () => {
    if (socket !== ws) return;
    console.log('[WsWorker] WebSocket opened');
    failCount = 0;
    broadcast({ type: 'WS_STATUS', status: 'open' });
    startWsHeartbeat();
  };

  socket.onmessage = (e) => {
    // 收到任何消息（包括心跳响应）都清掉后端 pong 超时计时器
    if (wsPongTimer) {
      clearTimeout(wsPongTimer);
      wsPongTimer = null;
    }
    try {
      const data = JSON.parse(e.data as string);
      // 将业务消息广播给所有 Tab，心跳消息(businessType=1)也会广播，
      // 但 useNotificationWs 里会按 msgWeight 过滤，T99 的心跳不会展示
      broadcast({ type: 'WS_MESSAGE', data });

      // 检测服务端 token 鉴权失败，主动断开且不再自动重连
      const businessType = (data as { businessInfo?: { businessType?: number } }).businessInfo
        ?.businessType;
      if (typeof businessType === 'number' && AUTH_ERROR_TYPES.has(businessType)) {
        console.warn('[WsWorker] Auth rejected by server, businessType:', businessType);
        authRejected = true;
        closeWs();
      }
    } catch {
      // 非 JSON 消息（如纯文本 pong）忽略即可
    }
  };

  socket.onclose = () => {
    if (socket !== ws) return;
    console.log('[WsWorker] WebSocket closed');
    stopWsHeartbeat();
    broadcast({ type: 'WS_STATUS', status: 'close' });

    // active 为 false 说明是主动断开（登出/所有 Tab 关闭），不需要重连
    if (!active) return;

    // 累计失败次数，达到阈值后切换到备用 URL
    failCount++;
    if (failCount >= MAX_RETRY_PER_URL) {
      urlIndex = (urlIndex + 1) % wsUrls.length;
      console.log('[WsWorker] Switching to URL index', urlIndex, wsUrls[urlIndex]);
      failCount = 0;
    }
    wsReconnectTimer = setTimeout(connect, RECONNECT_INTERVAL_MS);
  };

  socket.onerror = () => {
    // onerror 之后浏览器一定会触发 onclose，重连逻辑放在 onclose 里统一处理
    broadcast({ type: 'WS_STATUS', status: 'error' });
  };
}

/**
 * 彻底断开 WS 并清理所有 WS 相关定时器。
 * 将 active 置为 false，所以断开后不会触发重连。
 */
function closeWs() {
  active = false;
  stopWsHeartbeat();
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  if (ws) {
    // 先把 onclose 置空，避免 close() 触发 onclose 再走一遍重连判断
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  urlIndex = 0;
  failCount = 0;
}

// ─── 消息处理 ────────────────────────────────────────────────────────────────

/**
 * Tab 登录成功或 token/URL 变化时调用。
 *
 * 如果凭证和 URL 都没变，且连接正常，直接跳过（多 Tab 场景下
 * 第二个 Tab 打开时也会发 INIT，此时 Worker 已经连好了，不用重连）。
 * 否则先 closeWs() 断掉旧连接，再用新凭证重新连接。
 */
function handleInit(urls: string[], token: string) {
  // 服务端曾拒绝过该 token，且用户尚未换新 token（未重新登录），不允许重连
  if (authRejected && token === wsToken) {
    console.warn('[WsWorker] Token was rejected by server, skipping reconnect until re-login');
    return;
  }

  // 新 token 到来（重新登录），清除鉴权拒绝标志
  if (token !== wsToken) {
    authRejected = false;
  }

  // 只有 OPEN 或 CONNECTING 才算"连接可用"，跳过重连。
  // CLOSING（正在握手关闭）和 CLOSED 均视为不可用，触发重连——这是有意为之：
  // CLOSING 状态下连接即将失效，与其等它自然关闭再重连，不如主动接管。
  const isAlreadyConnected =
    token === wsToken &&
    JSON.stringify(urls) === JSON.stringify(wsUrls) &&
    active &&
    ws !== null &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING);

  if (isAlreadyConnected) {
    console.log('[WsWorker] Already connected with same credentials, skipping reconnect');
    return;
  }

  wsUrls = urls;
  wsToken = token;
  closeWs(); // 清掉旧连接和所有计时器
  active = true;
  connect();
}

/** Tab 登出时调用，断开 WS，不再重连，同时清除鉴权拒绝标志 */
function handleLogout() {
  console.log('[WsWorker] Logout, closing WS');
  wsToken = null;
  authRejected = false;
  closeWs();
}

/**
 * 移除指定 port（Tab 正常卸载 或 探活超时 时调用）。
 * 如果这是最后一个 Tab，顺便停止探活定时器并断开 WS。
 */
function handlePortClose(port: MessagePort) {
  ports.delete(port);
  portLastPong.delete(port);
  console.log('[WsWorker] Tab disconnected, remaining tabs:', ports.size);
  if (ports.size === 0) {
    console.log('[WsWorker] No tabs left, closing WS');
    stopPortHeartbeat();
    closeWs();
  }
}

// ─── SharedWorker 入口 ────────────────────────────────────────────────────────

/**
 * 每次有新 Tab 连接到这个 Worker 时触发（相当于 Worker 的 "onmount"）。
 * 注意：Worker 实例本身是单例，这个回调只是每个新 Tab 连进来时触发一次。
 */
(self as unknown as { onconnect: (e: MessageEvent) => void }).onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  if (!port) return;

  ports.add(port);
  // 初始化该 port 的最后 pong 时间为当前时间，
  // 避免刚连上就被第一轮 PING 检查判定为超时
  portLastPong.set(port, Date.now());
  console.log('[WsWorker] New tab connected, total tabs:', ports.size);

  // 有 Tab 连进来就启动探活（已在跑则跳过）
  startPortHeartbeat();

  // 监听来自该 Tab 的消息
  port.onmessage = (event: MessageEvent<string>) => {
    try {
      const msg = JSON.parse(event.data) as TabToWorkerMsg;
      switch (msg.type) {
        case 'INIT':
          handleInit(msg.urls, msg.token);
          break;
        case 'LOGOUT':
          handleLogout();
          break;
        case 'PORT_CLOSE':
          // Tab 正常卸载时主动发来，立即移除，不用等探活超时
          handlePortClose(port);
          break;
        case 'PONG':
          // 更新该 port 的最后存活时间
          portLastPong.set(port, Date.now());
          break;
      }
    } catch {
      // 忽略非法消息
    }
  };

  // MessagePort 默认是暂停状态，必须调用 start() 才开始接收消息
  port.start();
};
