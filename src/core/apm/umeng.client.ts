import { captureException, init } from '@umengfe/apm';

let initialized = false;

type UmengSiteApmConfig = NonNullable<SiteConfig['umengApm']>;

function getUmengConfig(): UmengSiteApmConfig | undefined {
  return __SITE_CONFIG__.umengApm;
}

function shouldInitUmengApm(config: UmengSiteApmConfig): boolean {
  if (!config.pid) return false;
  if (config.enabled === false) return false;
  if (config.enableInDev) return true;
  return __NODE_ENV__ === 'production';
}

/**
 * 友盟 U-APM Web SDK 初始化（仅浏览器执行）
 * @see https://developer.umeng.com/docs/193624/detail/432099
 */
export function initUmengApm(): void {
  if (initialized) return;

  const config = getUmengConfig();
  if (!config || !shouldInitUmengApm(config)) return;

  init({
    pid: config.pid,
    tag: config.tag ?? __SITE_ID__,
    release: typeof __VERSION__ !== 'undefined' ? String(__VERSION__) : undefined,
    logLevel: config.logLevel ?? (__NODE_ENV__ === 'production' ? 0 : 3),
    pageFilter: config.pageFilter ?? { mode: 'ignore', rules: [] },
    apiFilter: config.apiFilter ?? { mode: 'ignore', rules: [] },
    errorFilter: config.errorFilter ?? { mode: 'ignore', rules: [] },
    enableCatchJSError: true,
    enablePerformance: true,
    hookXHR: true,
    hookFetch: true,
    xhrConfig: { enableReqBody: true },
    fetchConfig: { enableReqBody: true },
    traceKey: config.traceKey ?? 'traceId',
    enableBlankScreen: true,
    blankConfig: {
      blank_target: config.blankTarget ?? '#root',
      blank_timeout: config.blankTimeout ?? 6000,
      screenshot: true,
      X: 1.5,
      Y: 6,
    },
  });

  initialized = true;
}

/** 手动上报异常（路由错误边界、业务 catch 等） */
export function reportUmengException(error: unknown): void {
  if (!initialized) return;
  const err = error instanceof Error ? error : new Error(String(error));
  captureException(err);
}

export function isUmengApmInitialized(): boolean {
  return initialized;
}
