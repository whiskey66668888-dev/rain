declare module '@umengfe/apm' {
  export interface UmengApmFilter {
    mode: 'ignore' | 'match';
    rules: Array<string | RegExp | ((url: string) => boolean)>;
  }

  export interface UmengApmInitParams {
    pid: string;
    tag?: string;
    puid?: string;
    release?: string;
    logLevel?: 0 | 1 | 2 | 3;
    pageFilter?: UmengApmFilter;
    apiFilter?: UmengApmFilter;
    errorFilter?: UmengApmFilter;
    hookXHR?: boolean;
    hookFetch?: boolean;
    traceKey?: string;
    enableCatchJSError?: boolean;
    enablePerformance?: boolean;
    enableBlankScreen?: boolean;
    blankConfig?: {
      blank_target: string;
      blank_timeout: number;
      screenshot?: boolean;
      X: number;
      Y: number;
    };
    xhrConfig?: { enableReqBody: boolean };
    fetchConfig?: { enableReqBody: boolean };
  }

  export interface UmengUserConfig {
    puid?: string;
    tag?: string;
    release?: string;
  }

  export function init(param: UmengApmInitParams): unknown;
  export function captureException(error: Error): void;
  export function setUserConfig(cfg: UmengUserConfig): void;
  export function sendAPILog(payload: Record<string, unknown>): void;
}
