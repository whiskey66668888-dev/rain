import { CbEvents, getSDK, type MessageItem } from '@front-openim/wasm-client-sdk';
import { ensureOpenImAuthConfigLoaded, getOpenImConfig } from '@/apis/origin/discover';
import { getImSdkPlatformId } from '@/utils/constants/apiCodeIm';
import { createImLogger } from '../logger/imLogger';
import { installImNetworkHooks } from './imNetworkHooks';
import { createListenerRegistry, type ListenerRegistry } from './listenerRegistry';

const logger = createImLogger('OpenIMClient');

type SDKInstance = ReturnType<typeof getSDK>;

export type ImConnectionState =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'failed'
  | 'maintain'
  | 'missing_config';

/** OpenIM 重复登录错误码 */
const ERR_ALREADY_LOGGED_IN = 10102;

/** login 后等 sync 超时（对齐 Flutter：超时放行） */
const SYNC_WAIT_TIMEOUT_MS = 8000;

/**
 * OpenIM WASM 客户端（对齐 tf90）
 *
 * 1. getImMessage(platform=5) → imUserId / imToken / api / ws / siteCode
 * 2. installImNetworkHooks（WS 补 siteCode，API 补 X-Request-Api）
 * 3. getSDK → login(platformID=5)
 * 4. 等 OnSyncServerFinish 后再拉历史
 */
class OpenIMClient {
  private sdk: SDKInstance | null = null;
  private listenerRegistry: ListenerRegistry | null = null;
  private state: ImConnectionState = 'idle';
  private selfUserId = '';
  private ensureReadyTask: Promise<boolean> | null = null;
  /** 在跑的建连任务是否会等同步；决定后来的调用方能否直接复用它 */
  private ensureReadyTaskWaitsSync = true;
  /** login 已完成（可收发消息）。与 syncCompleted 分开：发消息不依赖同步 */
  private loginCompleted = false;
  private syncCompleted = false;
  private syncWaiters: Array<() => void> = [];

  private getOrCreateSdk(siteCode: string): SDKInstance {
    if (this.sdk) return this.sdk;
    // 缓存 query 用 SDK 版本而非 __VERSION__（每次构建都是新时间戳），
    // 否则每发一次版，用户已缓存的 34MB wasm 全部作废重下
    this.sdk = getSDK({
      coreWasmPath: `/openIM.wasm?v=${__IM_WASM_VERSION__}`,
      sqlWasmPath: `/sql-wasm.wasm?v=${__IM_WASM_VERSION__}`,
      siteCode,
      debug: false,
    });
    this.listenerRegistry = createListenerRegistry(this.sdk);
    this.bindLifecycleListeners(this.sdk);
    return this.sdk;
  }

  private bindLifecycleListeners(sdk: SDKInstance): void {
    sdk.on(CbEvents.OnConnectFailed, (event) => {
      logger.error('OnConnectFailed', event);
    });
    sdk.on(CbEvents.OnSyncServerStart, () => {
      this.syncCompleted = false;
    });
    sdk.on(CbEvents.OnSyncServerFinish, () => {
      this.markSyncCompleted();
    });
    sdk.on(CbEvents.OnSyncServerFailed, () => {
      logger.warn('OnSyncServerFailed');
      this.markSyncCompleted();
    });
  }

  private markSyncCompleted(): void {
    this.syncCompleted = true;
    const waiters = this.syncWaiters.splice(0, this.syncWaiters.length);
    waiters.forEach((resolve) => resolve());
  }

  /** 等待会话/群同步；超时也返回 */
  async waitForSync(timeoutMs = SYNC_WAIT_TIMEOUT_MS): Promise<boolean> {
    if (this.syncCompleted) return true;
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        logger.warn(`waitForSync timeout ${timeoutMs}ms`);
        resolve(false);
      }, timeoutMs);
      this.syncWaiters.push(() => {
        clearTimeout(timer);
        resolve(true);
      });
    });
  }

  getConnectionState(): ImConnectionState {
    return this.state;
  }

  getSelfUserId(): string {
    return this.selfUserId;
  }

  getSDKInstance(): SDKInstance | null {
    return this.sdk;
  }

  isSyncCompleted(): boolean {
    return this.syncCompleted;
  }

  /**
   * 退出 OpenIM 并清空会话态（对齐 Flutter OpenIMService.uninit）。
   * 换号 / 网站登出必须调用，否则仍用旧账号发消息。
   *
   * `keepEnsureReadyTask`：doEnsureReady 内部换号时用。它自己就是那个在飞任务，
   * 若在这里把标记清掉，等它 await logout 期间进来的并发调用会看到「没有在飞任务」
   * 而另起一个 doEnsureReady，导致两次 login 打架。
   */
  async logoutAndReset(options?: { keepEnsureReadyTask?: boolean }): Promise<void> {
    this.clearListeners();
    if (this.sdk) {
      try {
        await this.sdk.logout();
        logger.info('logout ok', { userID: this.selfUserId });
      } catch (error) {
        logger.warn('logout failed (continue reset)', error);
      }
    }
    this.selfUserId = '';
    this.state = 'idle';
    this.loginCompleted = false;
    this.syncCompleted = false;
    if (!options?.keepEnsureReadyTask) this.ensureReadyTask = null;
    const waiters = this.syncWaiters.splice(0, this.syncWaiters.length);
    waiters.forEach((resolve) => resolve());
  }

  /**
   * 建连 + 登录。
   *
   * `waitSync=false`：login 成功即返回，不等 `OnSyncServerFinish`。login 后 Go 核心会自动打
   * get_incremental_conversation / join_groups / friends / black_list / group_member 等一串
   * 增量同步，最多白等 8s，而「往公共群发一条自定义消息」只需要连上 + groupId，与它们无关。
   * 这些请求仍在后台继续跑，聊天室后续照常受益。
   *
   * 聊天室初始化必须保持默认 `waitSync=true`：拉历史消息依赖同步完成。
   */
  async ensureReady(options?: { waitSync?: boolean }): Promise<boolean> {
    const waitSync = options?.waitSync !== false;
    const cfg = getOpenImConfig();
    const sameUser =
      !!this.sdk && !!this.selfUserId && !!cfg?.imUserId && this.selfUserId === cfg.imUserId;
    // 默认沿用原来的 syncCompleted 条件；只发消息时登录完成即可
    const readySameUser =
      this.state === 'ready' && sameUser && (waitSync ? this.syncCompleted : this.loginCompleted);

    if (readySameUser) return true;

    // 连接是分享路径建的（没等同步），本次调用方却需要同步：等同步即可，不必重新登录
    if (this.state === 'ready' && sameUser && this.loginCompleted && waitSync) {
      await this.waitForSync();
      return true;
    }

    // 已 ready 但是另一账号：必须先 logout 再登新号
    if (
      this.state === 'ready' &&
      this.selfUserId &&
      cfg?.imUserId &&
      this.selfUserId !== cfg.imUserId
    ) {
      logger.info('account switched, force re-login', {
        prev: this.selfUserId,
        next: cfg.imUserId,
      });
      await this.logoutAndReset();
    }

    if (this.state === 'failed') {
      this.state = 'idle';
    }
    if (this.ensureReadyTask) {
      const task = this.ensureReadyTask;
      // 在跑的任务不等同步，而本次调用方需要 → 复用同一条连接，自己补等同步
      if (waitSync && !this.ensureReadyTaskWaitsSync) {
        const ok = await task;
        if (ok && !this.syncCompleted) await this.waitForSync();
        return ok;
      }
      return task;
    }
    this.ensureReadyTaskWaitsSync = waitSync;
    // 严格比对：换号时旧任务会被丢弃，别让它结束时把新任务的标记清掉
    const task: Promise<boolean> = this.doEnsureReady(waitSync).finally(() => {
      if (this.ensureReadyTask === task) this.ensureReadyTask = null;
    });
    this.ensureReadyTask = task;
    return task;
  }

  private async doEnsureReady(waitSync = true): Promise<boolean> {
    this.state = 'initializing';
    const ok = await ensureOpenImAuthConfigLoaded();
    const cfg = getOpenImConfig();
    if (!ok || !cfg) {
      this.state = 'missing_config';
      return false;
    }
    if (cfg.imIsMaintain) {
      this.state = 'maintain';
      return false;
    }
    if (!cfg.imUserId || !cfg.imToken || !cfg.imApiUrl || !cfg.imWsUrl) {
      this.state = 'missing_config';
      logger.error('missing im login fields');
      return false;
    }

    // 缓存/SDK 仍是旧账号时，先退出再登录（本方法就是在飞任务，保留标记防并发重登）
    if (this.selfUserId && this.selfUserId !== cfg.imUserId) {
      await this.logoutAndReset({ keepEnsureReadyTask: true });
      this.state = 'initializing';
    }

    const apiAddr = cfg.imApiUrl.replace(/\/$/, '');
    const wsAddr = cfg.imWsUrl.replace(/\/$/, '');
    const siteCode = cfg.siteCodeThl || '';
    const platformID = getImSdkPlatformId();

    installImNetworkHooks({ apiAddr, wsAddr, siteCode });

    try {
      const sdk = this.getOrCreateSdk(siteCode);
      this.loginCompleted = false;
      this.syncCompleted = false;

      try {
        logger.info('login start', { userID: cfg.imUserId, platformID, siteCode });
        await sdk.login({
          userID: cfg.imUserId,
          token: cfg.imToken,
          platformID,
          apiAddr,
          wsAddr,
          siteCode,
        });
        logger.info('login ok');
      } catch (loginError) {
        const errCode = (loginError as { errCode?: number })?.errCode;
        if (errCode !== ERR_ALREADY_LOGGED_IN) throw loginError;

        // 10102：可能是旧账号仍占着会话。身份不一致则强制切换。
        if (this.selfUserId && this.selfUserId !== cfg.imUserId) {
          logger.info('already logged in as other user, switch account', {
            prev: this.selfUserId,
            next: cfg.imUserId,
          });
          try {
            await sdk.logout();
          } catch (logoutError) {
            logger.warn('switch-account logout failed', logoutError);
          }
          this.syncCompleted = false;
          await sdk.login({
            userID: cfg.imUserId,
            token: cfg.imToken,
            platformID,
            apiAddr,
            wsAddr,
            siteCode,
          });
          logger.info('re-login ok after account switch');
        } else {
          logger.info('already logged in');
          this.markSyncCompleted();
        }
      }

      // 先置可用：login 成功即可收发消息，等同步只是为了拉全历史
      this.selfUserId = cfg.imUserId;
      this.loginCompleted = true;
      this.state = 'ready';

      if (waitSync && !this.syncCompleted) {
        await this.waitForSync();
      }
      return true;
    } catch (error) {
      this.state = 'failed';
      logger.error('ensureReady failed', error);
      return false;
    }
  }

  bindMessageListener(callback: (message: MessageItem) => void): void {
    if (!this.listenerRegistry) return;
    this.listenerRegistry.bindMessageListener(callback);
  }

  bindConnectListener(callback: () => void): void {
    if (!this.listenerRegistry) return;
    this.listenerRegistry.bindConnectListener(callback);
  }

  /** VIP 进场：定制「进入聊天室」事件（对齐 emc onGroupMemberJoinTheGroupChat） */
  bindGroupMemberJoinChatListener(callback: (raw: unknown) => void): void {
    if (!this.listenerRegistry) return;
    this.listenerRegistry.bindGroupMemberJoinChatListener(callback);
  }

  clearListeners(): void {
    this.listenerRegistry?.clearAll();
  }
}

export const openIMClient = new OpenIMClient();
