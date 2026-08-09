import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import { createProxyMiddleware } from 'http-proxy-middleware';
import Koa from 'koa';
import open from 'open';
import { createServer as createViteServer } from 'vite';
import type { ViteDevServer } from 'vite';

import { defaultLocale, Locale } from '@/core/i18n';
import { type AppStore, type RootState } from '@/core/store';

import { prepareServerState, stateForClient, updateCacheState } from './prepareServerState';
import { createProxyMiddlewareConfig } from './proxy.config';
import { ssrConfig } from './ssr.config';
import viteConfig from '../../vite.config';
import { detectLocaleFromRequest } from './utils/common';
import { buildAgentPromoRedirectUrl } from '@/utils/agentPromoLink';
import { collectCssForRoute } from './utils/cssCollector';
const PORT = process.env.PORT || 3000;
const SITE_ID = process.env.SITE_ID;
const templateHtml = path.resolve(process.cwd(), `src/sites/${SITE_ID}/index.html`);
// HTTPS 证书
const httpsOptions = {
  key: fs.readFileSync(path.resolve(process.cwd(), 'certificates/private.key')),
  cert: fs.readFileSync(path.resolve(process.cwd(), 'certificates/certificate.crt')),
};
/**
 * 开发环境服务器入口
 * 集成 Vite 开发服务器，支持 HMR
 */
async function startDevServer(): Promise<void> {
  // 创建 Vite 开发服务器（中间件模式）
  const resolvedConfig = viteConfig({ mode: 'development', command: 'serve' });
  const HOST = resolvedConfig.server?.host as string;
  const vite: ViteDevServer = await createViteServer({
    ...resolvedConfig,
    server: {
      ...resolvedConfig.server,
      middlewareMode: true,
      https: httpsOptions,
      hmr: {
        host: HOST,
        port: 5174, // HMR WebSocket 端口
        clientPort: 5174, // 客户端连接的 HMR 端口
      },
    },
    appType: 'custom',
  });

  console.log(`✅ Vite server initialized with root: ${resolvedConfig.root}`);

  // 加载站点配置
  const siteConfig = (await vite.ssrLoadModule('site.config.ts')).default as SiteConfig;

  const app = new Koa();
  // 获取当前主机名（用于修复 Cookie Domain）
  const currentHost = `${HOST}:${PORT}`;
  const proxyConfigs = createProxyMiddlewareConfig(siteConfig, currentHost);
  for (const { path, options } of proxyConfigs) {
    const proxy = createProxyMiddleware(options);

    app.use(async (ctx, next): Promise<void> => {
      if (ctx.path.startsWith(path)) {
        return new Promise<void>((resolve) => {
          // 拦截 setHeader 方法，修复 Cookie Domain
          const originalSetHeader = ctx.res.setHeader.bind(ctx.res);

          // 修复 Set-Cookie 响应头的函数
          ctx.res.setHeader = function (name: string, value: string | number | readonly string[]) {
            if (name.toLowerCase() === 'set-cookie' && Array.isArray(value)) {
              value = value.map((cookie: string) => {
                // 删除 Domain 属性
                return cookie.replace(/;\s*Domain=[^;]+/gi, '');
              });
            }
            return originalSetHeader(name, value);
          };

          proxy(ctx.req, ctx.res, (err?: Error) => {
            if (err) {
              console.error(`Proxy error for ${path}:`, err);
            }
            resolve();
          });
        });
      }
      return next();
    });
  }

  // 注册 Vite 中间件
  app.use(async (ctx, next) => {
    return new Promise<void>((resolve) => {
      vite.middlewares(ctx.req, ctx.res, (_err?: Error | null) => {
        // 如果 Vite 已经处理了请求（响应已发送），直接返回
        if (ctx.res.headersSent || ctx.res.writableEnded) {
          return resolve();
        }
        // Vite 没有处理，恢复 Koa 的响应处理并继续下一个中间件
        ctx.respond = true;
        next()
          .then(() => resolve())
          .catch((err) => {
            console.error('Next middleware error:', err);
            resolve();
          });
      });
    });
  });

  /**
   * SSR 中间件
   * 处理所有未被其他中间件处理的请求（页面路由）
   */
  app.use(async (ctx) => {
    // 如果响应已发送，直接返回
    if (
      ctx.res.headersSent ||
      ctx.body !== undefined ||
      (ctx.status !== 404 && ctx.status !== 200)
    ) {
      return;
    }

    const reqPath = ctx.path;
    const agentPromoRedirect = buildAgentPromoRedirectUrl(reqPath, ctx.search || '');
    if (agentPromoRedirect) {
      ctx.redirect(agentPromoRedirect);
      return;
    }

    if (
      reqPath.startsWith('/@') ||
      reqPath.startsWith('/node_modules/') ||
      reqPath.endsWith('.tsx') ||
      reqPath.endsWith('.ts')
    ) {
      console.warn(
        `⚠️  Static resource request reached SSR middleware (Vite should handle this): ${reqPath}`,
      );
      console.warn(`   This usually means Vite middleware didn't process the request properly.`);
      ctx.status = 404;
      ctx.body = 'Not Found - This should be handled by Vite';
      return;
    }
    // 如果请求路径为根路径，则替换为默认语言
    const routePath = reqPath === '/' ? `/${defaultLocale}` : reqPath;
    if (
      ssrConfig.noSSRPaths.some((noSSRPath: string) =>
        routePath.startsWith(`/${defaultLocale}/${noSSRPath}`),
      )
    ) {
      //  检查是否是不需要 SSR 渲染的路径 直接返回客户端 HTML，不进行 SSR
      let htmlTemplate = fs.readFileSync(templateHtml, 'utf-8');
      htmlTemplate = await vite.transformIndexHtml(reqPath, htmlTemplate);
      ctx.type = 'text/html';
      ctx.body = htmlTemplate;
      return;
    }

    console.log('@SSR Middleware dev routePath:', routePath);
    try {
      const serverModule = (await vite.ssrLoadModule(`src/sites/${SITE_ID}/entry-server.tsx`)) as {
        makeStore: (preloadedState: Partial<RootState>) => AppStore;
        render: (
          path: string,
          store: AppStore,
          detectedLocale: Locale,
        ) => Promise<{ html: string; queryState: import('@tanstack/react-query').DehydratedState }>;
      };
      // 2. 检测语言（用于 SSR 渲染）
      const detectedLocale = detectLocaleFromRequest(ctx);

      // 3. 准备服务端数据preloadedState
      const preloadedState = prepareServerState(ctx, siteConfig, detectedLocale);

      // 4. 创建 Redux store
      const store = serverModule.makeStore(preloadedState);

      // 5. 加载服务端渲染函数
      const render = serverModule.render;

      // 7. 开发环境 HTML 模板处理函数
      let htmlTemplate = fs.readFileSync(templateHtml, 'utf-8');
      // 使用 Vite 转换 HTML（处理 Vite 的特殊标签和 HMR）
      htmlTemplate = await vite.transformIndexHtml(routePath, htmlTemplate);

      // 10. 注入 React Refresh Runtime
      const reactRefreshScript = `<script type="module">
        import RefreshRuntime from "/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
        </script>`;

      // 11. 使用 store 进行服务端渲染
      const { html: ssrHtml, queryState } = await render(routePath, store, detectedLocale);

      const state = store.getState();
      // 更新state缓存（三方api配置会在业务代码中写入到state，服务端进行缓存，避免每次请求都重新请求三方api）
      updateCacheState(state);

      // 12. 收集当前路由的 CSS（开发环境）
      let cssLinks = '';
      try {
        cssLinks = collectCssForRoute(routePath, vite);
      } catch (error) {
        console.warn('Failed to collect CSS for route:', error);
      }

      // 13. 注入查询状态（用于客户端 hydration）
      const queryStateScript = `<script>
      window.__REACT_QUERY_STATE__ = ${JSON.stringify(queryState).replace(/</g, '\\u003c')};
      </script>`;

      // 14. 注入 Redux 状态（用于客户端 hydration）
      const reduxStateScript = `<script>
        window.__REDUX_STATE__ = ${JSON.stringify(stateForClient(state)).replace(/</g, '\\u003c')};
        </script>`;

      // 15. 组装最终 HTML
      const html = htmlTemplate
        .replace(
          `<!--ssr-head-->`,
          cssLinks + reduxStateScript + reactRefreshScript + queryStateScript,
        )
        .replace(`<!--ssr-html-->`, ssrHtml);

      ctx.type = 'text/html';
      ctx.body = html;
    } catch (error) {
      console.error('SSR Error: 服务端报错:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      const errorDetails = {
        message: errorMessage,
        stack: errorStack,
        routePath,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      };
      ctx.status = 500;
      ctx.type = 'text/html';
      ctx.body = `<h1>Server Error 服务端报错</h1>
        <h2>错误信息:</h2>
        <pre>${errorMessage}</pre>
        <h2>路由路径:</h2>
        <pre>${routePath}</pre>
        <h2>错误堆栈:</h2>
        <pre>${errorStack || '无堆栈信息'}</pre>
        <h2>完整错误对象:</h2>
        <pre>${JSON.stringify(errorDetails, null, 2)}</pre>
        <hr>
        <p>本地开发环境直接返回错误信息方便调试, 生产直接返回纯客户端html模板</p>`;
    }
  });

  https
    .createServer(httpsOptions, app.callback() as Parameters<typeof https.createServer>[1])
    .listen(Number(PORT), HOST, () => {
      const url = `https://${HOST}:${PORT}`;
      console.log(`🚀 SSR Server (Development) running at ${url}`);
      console.log(`📦 Site ID: ${SITE_ID}`);
      console.log(`🔥 Vite HMR enabled on port 5174`);
      open(url);
    });
}

startDevServer().catch(console.error);
