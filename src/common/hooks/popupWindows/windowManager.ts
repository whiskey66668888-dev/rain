/**
 * 统一管理需要以独立弹出窗口打开的页面。
 *
 * 新增窗口类型：
 *   1. EPopupWindowKey 里加一个 key
 *   2. POPUP_CONFIGS 里补对应配置（heartbeat: true 表示启用心跳检测）
 */

// ─── 心跳协议常量（父子页面共用）────────────────────────────────────────────
export const POPUP_PING_MSG = '__POPUP_PING__';
export const POPUP_PONG_MSG = '__POPUP_PONG__';

// ─── 业务消息协议（子窗口 → 父窗口）──────────────────────────────────────────
export enum EPopupMessageType {
  /** 注单弹窗点击赛事：通知主窗口跳转赛事详情 */
  GoMatchDetail = 'GO_MATCH_DETAIL',
}

export interface GoMatchDetailMessage {
  type: EPopupMessageType.GoMatchDetail;
  matchId: string;
  isChampion: boolean;
}

export type PopupMessage = GoMatchDetailMessage;

const HEARTBEAT_INTERVAL_MS = 10 * 1000; // 每 5s 发一次 ping
const HEARTBEAT_TIMEOUT_MS = 20 * 1000; // 超过 8s 未收到 pong 则判定失联

// ─── 1. 窗口 key 定义：后续在这里新增 ────────────────────────────────────────
export enum EPopupWindowKey {
  BetHistory = 'BetHistory',
  SportsPopup = 'SportsPopup',
}

// ─── 2. 每种窗口的默认配置 ───────────────────────────────────────────────────
interface PopupConfig {
  width: number;
  height: number;
  /** 是否启用心跳检测。开启后父页面会周期性探测子窗口是否存活。 */
  heartbeat: boolean;
}

const POPUP_CONFIGS: Record<EPopupWindowKey, PopupConfig> = {
  [EPopupWindowKey.BetHistory]: { width: 1280, height: 900, heartbeat: true },
  [EPopupWindowKey.SportsPopup]: { width: 1280, height: 900, heartbeat: false },
};

// ─── 内部工具 ─────────────────────────────────────────────────────────────────

function buildFeatures(width: number, height: number): string {
  return [
    `width=${width}`,
    `height=${height}`,
    'toolbar=no',
    'menubar=no',
    'location=no',
    'status=no',
    'scrollbars=yes',
    'resizable=yes',
  ].join(',');
}

/** BroadcastChannel 频道名，子页面通过此名订阅消息 */
export function getPopupChannelName(key: EPopupWindowKey): string {
  return `op7_popup_${key}`;
}

/** window.open 的 target name，命名窗口可被浏览器复用 */
function windowTarget(key: EPopupWindowKey): string {
  return `op7_${key}`;
}

const TAG = '[WindowManager]';

// ─── 3. WindowManager ─────────────────────────────────────────────────────────

class WindowManager {
  private windows = new Map<EPopupWindowKey, Window>();
  private hbIntervals = new Map<EPopupWindowKey, ReturnType<typeof setInterval>>();
  private hbPongChannels = new Map<EPopupWindowKey, BroadcastChannel>();
  private lastPongAt = new Map<EPopupWindowKey, number>();
  /** true=存活, false=失联, undefined=未开启心跳 */
  private aliveStatus = new Map<EPopupWindowKey, boolean>();

  // ── 心跳 ──────────────────────────────────────────────────────────────────

  private startHeartbeat(key: EPopupWindowKey) {
    this.stopHeartbeat(key);

    const channelName = getPopupChannelName(key);

    // 监听 pong（长生命周期 channel，随心跳一起关闭）
    const pongChannel = new BroadcastChannel(channelName);
    pongChannel.onmessage = (event) => {
      if (event.data !== POPUP_PONG_MSG) return;
      const wasAlive = this.aliveStatus.get(key);
      this.lastPongAt.set(key, Date.now());
      if (!wasAlive) {
        this.aliveStatus.set(key, true);
        const label = wasAlive === undefined ? '首次心跳确认 ✅' : '心跳恢复 ✅';
        console.warn(`${TAG} ${key}: ${label}`);
      }
    };
    this.hbPongChannels.set(key, pongChannel);

    /**
     * 把 ping 发送 和 timeout 检查 错开：
     *   - 每个 interval tick：先检查【上一次 ping】有没有收到 pong，再发新 ping
     *   - 这样 pong 有整整一个 interval 的时间到达，不会在同一个 tick 里被误判
     *
     * lastPingAt 初始设为 0，让第一个 tick 跳过检查（没有"上一次 ping"）
     */
    let lastPingAt = 0;

    const interval = setInterval(() => {
      const now = Date.now();

      // 检查上一次 ping 是否在 HEARTBEAT_TIMEOUT_MS 内收到了 pong
      if (lastPingAt > 0) {
        const lastPong = this.lastPongAt.get(key) ?? 0;
        const ponged = lastPong >= lastPingAt; // pong 在 ping 之后到达
        const timedOut = now - lastPingAt > HEARTBEAT_TIMEOUT_MS;
        const isAlive = this.aliveStatus.get(key);

        if (!ponged && timedOut && isAlive !== false) {
          this.aliveStatus.set(key, false);
          console.warn(
            `${TAG} ${key}: 心跳丢失 ❌  (距上次 ping ${Math.round((now - lastPingAt) / 1000)}s 无响应)`,
          );
        }
      }

      // 发新 ping
      lastPingAt = Date.now();
      const pingCh = new BroadcastChannel(channelName);
      pingCh.postMessage(POPUP_PING_MSG);
      pingCh.close();
    }, HEARTBEAT_INTERVAL_MS);

    this.hbIntervals.set(key, interval);
    console.warn(
      `${TAG} ${key}: 心跳已启动（interval=${HEARTBEAT_INTERVAL_MS}ms, timeout=${HEARTBEAT_TIMEOUT_MS}ms）`,
    );
  }

  private stopHeartbeat(key: EPopupWindowKey) {
    const interval = this.hbIntervals.get(key);
    if (interval !== undefined) clearInterval(interval);
    this.hbIntervals.delete(key);

    this.hbPongChannels.get(key)?.close();
    this.hbPongChannels.delete(key);

    this.lastPongAt.delete(key);
    this.aliveStatus.delete(key);
  }

  // ── 公开 API ──────────────────────────────────────────────────────────────

  /**
   * 打开弹出窗口。
   * - 同名窗口已存在且未关闭时，浏览器直接聚焦而不重复打开。
   * - 可通过 overrides 覆盖默认尺寸。
   */
  open(
    key: EPopupWindowKey,
    url: string,
    overrides?: { width?: number; height?: number },
  ): Window | null {
    const cfg = POPUP_CONFIGS[key];
    const { width, height } = { ...cfg, ...overrides };
    const popup = window.open(url, windowTarget(key), buildFeatures(width, height));
    if (popup) {
      popup.focus();
      this.windows.set(key, popup);
      console.warn(`${TAG} ${key}: 窗口已打开`);
      // 只有主窗口才管理心跳，子窗口调用 open 时不启动
      if (cfg.heartbeat && window.opener === null) this.startHeartbeat(key);
    }
    return popup;
  }

  /** 主动关闭指定弹出窗口 */
  close(key: EPopupWindowKey) {
    const win = this.windows.get(key);
    if (win && !win.closed) win.close();
    this.windows.delete(key);
    this.stopHeartbeat(key);
    console.warn(`${TAG} ${key}: 窗口已关闭`);
  }

  /** 关闭所有由 windowManager 管理的弹出窗口 */
  closeAll() {
    this.windows.forEach((win, key) => {
      if (!win.closed) win.close();
      this.stopHeartbeat(key);
    });
    this.windows.clear();
    console.warn(`${TAG} 所有窗口已关闭`);
  }

  /**
   * 检查指定窗口是否存活。
   * - 启用心跳的窗口：依据最近 pong 响应判断（精确，抗父页面刷新）。
   * - 未启用心跳的窗口：依据 JS 内存中的窗口引用判断（父页面刷新后可能不准）。
   */
  isOpen(key: EPopupWindowKey): boolean {
    if (POPUP_CONFIGS[key].heartbeat) {
      return this.aliveStatus.get(key) === true;
    }
    const win = this.windows.get(key);
    if (!win || win.closed) {
      this.windows.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 通过 BroadcastChannel 向指定弹出窗口发送消息。
   * 不依赖窗口引用，父页面刷新后依然有效。
   */
  send<T = unknown>(key: EPopupWindowKey, message: T) {
    const channel = new BroadcastChannel(getPopupChannelName(key));
    channel.postMessage(message);
    channel.close();
  }

  /**
   * 父页面刷新后，探测指定子窗口是否仍然存活，并重新建立心跳。
   *
   * 原理：发一次 probe ping，若在 probeTimeoutMs 内收到 pong，
   * 说明子窗口还活着，自动重启心跳；否则认为窗口已关闭。
   *
   * 仅对 heartbeat: true 的窗口有效。
   */
  reconnect(key: EPopupWindowKey, probeTimeoutMs = 1500): Promise<boolean> {
    if (!POPUP_CONFIGS[key].heartbeat) return Promise.resolve(false);

    console.warn(`${TAG} ${key}: reconnect 探测中…`);

    return new Promise((resolve) => {
      const channelName = getPopupChannelName(key);
      const probeChannel = new BroadcastChannel(channelName);
      let settled = false;

      const settle = (alive: boolean) => {
        if (settled) return;
        settled = true;
        probeChannel.close();
        if (alive) {
          this.startHeartbeat(key);
          console.warn(`${TAG} ${key}: reconnect 成功，心跳已恢复 ✅`);
        } else {
          console.warn(`${TAG} ${key}: reconnect 无响应，窗口未找到`);
        }
        resolve(alive);
      };

      probeChannel.onmessage = (event) => {
        if (event.data === POPUP_PONG_MSG) settle(true);
      };

      setTimeout(() => settle(false), probeTimeoutMs);

      // 发探测 ping
      const pingCh = new BroadcastChannel(channelName);
      pingCh.postMessage(POPUP_PING_MSG);
      pingCh.close();
    });
  }

  /**
   * 对所有配置了 heartbeat: true 的窗口执行 reconnect。
   * 在父页面入口（App 根组件的 useEffect）调用一次即可。
   */
  async reconnectAll(probeTimeoutMs = 1500): Promise<void> {
    // 子页面（window.opener 非空）只负责响应 ping，不主动发起心跳管理
    if (window.opener !== null) return;

    const heartbeatKeys = (Object.keys(POPUP_CONFIGS) as EPopupWindowKey[]).filter(
      (key) => POPUP_CONFIGS[key].heartbeat,
    );
    await Promise.all(heartbeatKeys.map((key) => this.reconnect(key, probeTimeoutMs)));
  }
}

/** 全局单例 */
export const windowManager = new WindowManager();
