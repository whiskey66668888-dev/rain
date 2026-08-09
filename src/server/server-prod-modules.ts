import { defaultLocale } from '@/core/i18n';
import { AppStore, makeStore } from '@/core/store';

import { nginxCacheHtml } from './nginx.cache';
import { prepareServerState, stateForClient, updateCacheState } from './prepareServerState';
import { createProxyMiddlewareConfig } from './proxy.config';
import { ssrConfig } from './ssr.config';
import { detectLocaleFromRequest } from './utils/common';
import { getCssLinksForRoute } from './utils/getCssLinksForRoute';
import { buildAgentPromoRedirectUrl } from '@/utils/agentPromoLink';

const siteConfig = __SITE_CONFIG__;

/**
 * 通过服务端入口文件导出，方便在vite进行打包编译，服务代码就不单独打包了
 * 导出服务端模块，用于在 server-prod.js 中使用
 */
export {
  defaultLocale,
  makeStore,
  type AppStore,
  nginxCacheHtml,
  prepareServerState,
  stateForClient,
  updateCacheState,
  createProxyMiddlewareConfig,
  ssrConfig,
  detectLocaleFromRequest,
  getCssLinksForRoute,
  buildAgentPromoRedirectUrl,
  siteConfig,
};
