/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __SITE_ID__: string;
declare const __VERSION__: string;
/** OpenIM wasm 缓存 query，取 SDK 依赖版本（不随应用发版变化） */
declare const __IM_WASM_VERSION__: string;
declare const __SITE_CONFIG__: SiteConfig;
declare const __BUILD_ENV__: 'dev' | 'sit' | 'release' | 'main';
declare const __NODE_ENV__: 'development' | 'production';

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface Window {
  removeInitialLoading: () => void;
}
