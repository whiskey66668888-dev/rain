import type { ProxyOptions } from 'vite';

/**
 * 根据 siteConfig 生成 Vite 开发代理配置
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
