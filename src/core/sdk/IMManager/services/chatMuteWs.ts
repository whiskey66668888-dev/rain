import { createImLogger } from '../logger/imLogger';

const logger = createImLogger('ChatMuteWs');

export interface ChatMuteRealtimeEvent {
  /** true=解禁；false=禁言（对齐 emc：解禁 toast 无 action） */
  isUnmute: boolean;
  title?: string;
  content?: string;
}

type MuteEventHandler = (event: ChatMuteRealtimeEvent) => void;

/**
 * 单用户禁言/解禁实时 WS（对齐 emc ChatMuteWsService）
 *
 * - 独立连接球布斯 `reqWsUrl`，与 OpenIM ws 无关
 * - 连接：`<reqWsUrl>?siteCode=&token=`
 * - 仅处理 business_type=3 && data.type=T1
 * - reqWsUrl 为空时休眠，不建连
 */
class ChatMuteWsClient {
  private ws: WebSocket | null = null;
  private connKey = '';
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private handlers = new Set<MuteEventHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastConnectArgs: { reqWsUrl: string; siteCode: string; token: string } | null = null;

  /** 订阅禁言实时事件；返回取消订阅函数 */
  subscribe(handler: MuteEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /** 幂等连接：配置未变则复用 */
  connectIfNeeded(params: { reqWsUrl: string; siteCode: string; token: string }): void {
    const url = params.reqWsUrl.trim();
    const token = params.token.trim();
    if (!url || !token) {
      logger.info('reqWsUrl/token 为空，跳过连接');
      return;
    }

    const key = `${url}|${params.siteCode}|${token}`;
    if (this.connKey === key && this.ws && this.ws.readyState <= WebSocket.OPEN) {
      return;
    }

    this.lastConnectArgs = params;
    this.teardown();
    this.connKey = key;

    try {
      const base = new URL(url);
      base.searchParams.set('siteCode', params.siteCode);
      base.searchParams.set('token', token);
      const ws = new WebSocket(base.toString());
      this.ws = ws;

      ws.onopen = () => {
        logger.info('禁言 WS 已连接');
        this.startHeartbeat();
      };
      ws.onmessage = (event) => {
        this.handleRawMessage(event.data);
      };
      ws.onerror = () => {
        logger.warn('禁言 WS 错误');
      };
      ws.onclose = () => {
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
    } catch (error) {
      logger.error('禁言 WS 建连失败', error);
    }
  }

  disconnect(): void {
    this.lastConnectArgs = null;
    this.connKey = '';
    this.teardown();
  }

  private scheduleReconnect(): void {
    if (!this.lastConnectArgs) return;
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.lastConnectArgs) {
        this.connectIfNeeded(this.lastConnectArgs);
      }
    }, 3000);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      // 对齐 emc：{ business_type:1, data:{ param:'PING' } }
      this.ws.send(JSON.stringify({ business_type: 1, data: { param: 'PING' } }));
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private teardown(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
  }

  private handleRawMessage(raw: unknown): void {
    let data: Record<string, unknown>;
    try {
      data =
        typeof raw === 'string'
          ? (JSON.parse(raw) as Record<string, unknown>)
          : (raw as Record<string, unknown>);
    } catch {
      return;
    }
    if (!data || typeof data !== 'object') return;

    const businessType = Number(data.business_type ?? data.businessType);
    if (businessType !== 3) return;

    const inner = data.data;
    if (!inner || typeof inner !== 'object') return;
    const payload = inner as Record<string, unknown>;
    if ((payload.type ?? '') !== 'T1') return;

    const event: ChatMuteRealtimeEvent = {
      isUnmute: payload.action == null,
      title: payload.title as string,
      content: payload.content as string,
    };
    this.handlers.forEach((handler) => handler(event));
  }
}

export const chatMuteWsClient = new ChatMuteWsClient();
