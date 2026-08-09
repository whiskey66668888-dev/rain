import type { IncomingMessage } from 'http';

import type { Options } from 'http-proxy-middleware';
import type { ProxyOptions } from 'vite';

/**
 * 根据 siteConfig 生成 Vite 代理配置
 */
export function createProxyConfig(
  siteConfig: globalThis.SiteConfig,
  _currentHost?: string,
): Record<string, ProxyOptions> {
  const apiPaths = ['/api', '/v3', '/v2', '/json'];
  const config: Record<string, ProxyOptions> = {};

  // Cookie Domain 修复函数
  const fixCookieDomain = (proxyRes: {
    headers: Record<string, string | string[] | undefined>;
  }): void => {
    const setCookieHeaders = proxyRes.headers['set-cookie'];
    if (setCookieHeaders) {
      // 修改所有 Set-Cookie 响应头：删除 Domain 属性（让浏览器使用当前域名）
      const modifiedCookies = (
        Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]
      ).map((cookie: string) => {
        return cookie.replace(/;\s*Domain=[^;]+/gi, '');
      });

      // 更新响应头
      proxyRes.headers['set-cookie'] = modifiedCookies;
    }
  };

  // API 代理配置
  for (const path of apiPaths) {
    config[path] = {
      target: siteConfig.api.baseUrl,
      changeOrigin: true,
      secure: true,
      configure: (proxy, _options) => {
        proxy.on('proxyRes', fixCookieDomain);
      },
    };
  }

  // WebSocket 代理配置
  config['/ws'] = {
    target: siteConfig.api.wsBaseUrl,
    ws: true,
    changeOrigin: true,
    secure: siteConfig.api.wsBaseUrl.startsWith('https://'),
  };

  return config;
}

/**
 * 根据 vite配置 生成 http-proxy-middleware 配置（用于 SSR 服务器）
 */
export function createProxyMiddlewareConfig(
  siteConfig: globalThis.SiteConfig,
  currentHost?: string,
): Array<{
  path: string;
  options: Options;
}> {
  const configs: Array<{ path: string; options: Options }> = [];
  const proxyConfig = createProxyConfig(siteConfig, currentHost);

  for (const key of Object.keys(proxyConfig)) {
    const baseOptions = proxyConfig[key] as Options;

    // 添加 Cookie Domain 修复逻辑
    const options = {
      ...baseOptions,
      cookieDomainRewrite: false, // 删除所有 Domain 属性，让浏览器使用当前域名
      onProxyRes: (proxyRes: IncomingMessage) => {
        // 双重保险：直接修改响应头
        const setCookieHeaders = proxyRes.headers['set-cookie'];
        if (setCookieHeaders) {
          // 修改所有 Set-Cookie 响应头：删除 Domain 属性
          const modifiedCookies = (
            Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]
          ).map((cookie: string) => {
            // 删除 Domain 属性（让浏览器使用当前域名）
            return cookie.replace(/;\s*Domain=[^;]+/gi, '');
          });

          // 更新代理响应头
          proxyRes.headers['set-cookie'] = modifiedCookies;
        }
      },
    } as Options;

    configs.push({
      path: key,
      options,
    });
  }
  return configs;
}
