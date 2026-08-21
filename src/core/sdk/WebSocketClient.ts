import { safeGetLocalString } from '@/utils/storage/webStorage';

export type WSStatus = 'idle' | 'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting';

interface WebSocketClientOptions {
  url: string | (() => string);
  protocols?: string | string[];
  maxRetries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
  debug?: boolean;

  enableHeartbeat?: boolean;
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
  pingMessage?: string | object | (() => string | object);
  isPongMessage?: (event: MessageEvent) => boolean;

  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onReconnect?: (attempt: number, delayMs: number) => void;
  onHeartbeatTimeout?: () => void;
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private options: WebSocketClientOptions;
  private status: WSStatus = 'idle';
  private retryCount = 0;
  private reconnectTimer: number | null = null;
  private manuallyClosed = false;

  private heartbeatTimer: number | null = null;
  private heartbeatTimeoutTimer: number | null = null;
  private lastActivityTs = 0;

  constructor(options: WebSocketClientOptions) {
    this.options = {
      maxRetries: 5,
      retryDelay: 1000,
      maxRetryDelay: 15000,
      debug: false,
      enableHeartbeat: true,
      heartbeatIntervalMs: 30000,
      heartbeatTimeoutMs: 10000,
      pingMessage: { type: 'ping' },
      ...options,
    };
  }

  getStatus: () => WSStatus = () => {
    return this.status;
  };

  isOpen: () => boolean = () => {
    return this.status === 'open';
  };

  connect: () => void = () => {
    if (this.status === 'connecting' || this.status === 'open' || this.status === 'reconnecting') {
      this.log('connect() ignored, status:', this.status);
      return;
    }

    this.manuallyClosed = false;
    const url = typeof this.options.url === 'function' ? this.options.url() : this.options.url;

    this.log('Connecting to', url);
    this.status = this.retryCount > 0 ? 'reconnecting' : 'connecting';

    try {
      const socket = new WebSocket(url, this.options.protocols);
      this.socket = socket;

      socket.onopen = (evt) => {
        this.log('WebSocket open');
        this.status = 'open';
        this.retryCount = 0;
        this.lastActivityTs = Date.now();
        this.startHeartbeat();
        this.options.onOpen?.(evt);
      };

      socket.onmessage = (evt) => {
        this.lastActivityTs = Date.now();
        this.resetHeartbeatTimeout();

        if (this.options.isPongMessage && this.options.isPongMessage(evt)) {
          this.log('Receive pong');
        } else {
          this.options.onMessage?.(evt);
        }
      };

      socket.onerror = (evt) => {
        this.log('WebSocket error', evt);
        this.options.onError?.(evt);
      };

      socket.onclose = (evt) => {
        this.log('WebSocket closed', evt.code, evt.reason);
        this.status = 'closed';
        this.stopHeartbeat();
        this.options.onClose?.(evt);

        if (!this.manuallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.log('Connect error', err);
      this.scheduleReconnect();
    }
  };

  send(data: string | object): void {
    if (!this.socket || this.status !== 'open') {
      this.log('send() failed: not open');
      return;
    }
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    this.socket.send(payload);
  }

  close(code?: number, reason?: string): void {
    this.manuallyClosed = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();

    if (
      this.socket &&
      (this.status === 'open' || this.status === 'connecting' || this.status === 'reconnecting')
    ) {
      this.status = 'closing';
      this.socket.close(code, reason);
    }
  }

  destroy(): void {
    this.close();
    this.socket = null;
  }

  // heartbeat
  private startHeartbeat(): void {
    if (!this.options.enableHeartbeat) return;
    this.stopHeartbeat();

    const interval = this.options.heartbeatIntervalMs!;
    const timeout = this.options.heartbeatTimeoutMs!;

    this.heartbeatTimer = window.setInterval(() => {
      if (this.status !== 'open') return;
      const msg =
        typeof this.options.pingMessage === 'function'
          ? (this.options.pingMessage() as string | object)
          : this.options.pingMessage;
      this.log('Send ping');
      this.send(msg as string | object);
      this.startHeartbeatTimeout(timeout);
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer != null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearHeartbeatTimeout();
  }

  private startHeartbeatTimeout(timeoutMs: number): void {
    this.clearHeartbeatTimeout();
    this.heartbeatTimeoutTimer = window.setTimeout(() => {
      const diff = Date.now() - this.lastActivityTs;
      if (diff >= timeoutMs) {
        this.log('Heartbeat timeout, diff=', diff);
        this.options.onHeartbeatTimeout?.();
        if (this.socket) {
          this.socket.close(4000, 'Heartbeat timeout');
        }
      }
    }, timeoutMs + 100);
  }

  private resetHeartbeatTimeout(): void {
    if (!this.options.enableHeartbeat) return;
    const timeout = this.options.heartbeatTimeoutMs!;
    this.startHeartbeatTimeout(timeout);
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer != null) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private scheduleReconnect(): void {
    const { maxRetries, retryDelay, maxRetryDelay } = this.options;

    if (!maxRetries || maxRetries <= 0) {
      this.log('Reconnect disabled');
      return;
    }

    if (this.retryCount >= maxRetries) {
      this.log('Max reconnect attempts reached:', maxRetries);
      return;
    }

    this.retryCount += 1;
    const delay = this.calcBackoffDelay(retryDelay!, maxRetryDelay!, this.retryCount);
    this.log(`Schedule reconnect #${this.retryCount} in ${delay}ms`);

    this.options.onReconnect?.(this.retryCount, delay);

    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private calcBackoffDelay(base: number, max: number, attempt: number): number {
    const exp = base * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.3 * exp;
    return Math.min(exp + jitter, max);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private log(...args: unknown[]): void {
    if (this.options.debug) {
      console.log('[WS]', ...args);
    }
  }
}

export const createWSClient = (
  path: string,
  options?: Partial<WebSocketClientOptions>,
): WebSocketClient => {
  const url: () => string = () => {
    const token = safeGetLocalString('token') ?? '';
    return `${location.origin.replace('http', 'ws')}/ws${path}?token=${encodeURIComponent(token)}`;
  };

  return new WebSocketClient({
    url,
    maxRetries: 10,
    retryDelay: 1000,
    maxRetryDelay: 15_000,
    enableHeartbeat: true,
    heartbeatIntervalMs: 30_000,
    heartbeatTimeoutMs: 10_000,
    pingMessage: { type: 'ping' },
    isPongMessage: (evt: MessageEvent<string>) => {
      try {
        const o = JSON.parse(evt.data) as { type: string };
        return o.type === 'pong';
      } catch {
        return false;
      }
    },
    ...options,
  });
};
