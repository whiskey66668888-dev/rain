declare global {
  const _: typeof import('lodash');
  interface Window {
    /** 原生壳（任意平台）注入：H5 在 App / 马甲包内，勿展示 PWA 安装 */
    __OP7_IN_APP__?: boolean;
    __OP7_HIDE_PWA__?: boolean;
  }
  interface SiteConfig {
    siteId: string;
    name: string;
    theme: {
      primary: string;
      mode: 'light' | 'dark';
      template: 'sports' | 'casino' | 'live' | 'poker' | 'other';
    };
    api: {
      baseUrl: string;
      wsBaseUrl: string;
      /** 本地开发 vite 代理 OpenIM 域名，避免浏览器跨域 */
      openImProxyTarget?: string;
      /** 指数 marketOdds 专用域名 */
      oddsDomain?: string;
    };
    captcha?: {
      type?: '1' | '2' | 'none';
      geetest?: {
        captchaId: string;
        language?: string;
        product?: string;
        protocol?: string;
      };
    };
    /** 友盟 U-APM Web 监控，见 https://developer.umeng.com/docs/193624/detail/432099 */
    umengApm?: {
      pid: string;
      /** 总开关，默认随生产环境开启 */
      enabled?: boolean;
      /** 开发环境也上报，便于联调（云配有缓存延迟） */
      enableInDev?: boolean;
      tag?: string;
      traceKey?: string;
      logLevel?: 0 | 1 | 2 | 3;
      blankTarget?: string;
      blankTimeout?: number;
      pageFilter?: {
        mode: 'ignore' | 'match';
        rules: Array<string | RegExp | ((url: string) => boolean)>;
      };
      apiFilter?: {
        mode: 'ignore' | 'match';
        rules: Array<string | RegExp | ((url: string) => boolean)>;
      };
      errorFilter?: {
        mode: 'ignore' | 'match';
        rules: Array<string | RegExp | ((url: string) => boolean)>;
      };
    };
  }
}

export {};
