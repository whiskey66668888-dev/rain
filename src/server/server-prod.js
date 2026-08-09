const fs = require('node:fs');
const path = require('node:path');
const zlib = require('zlib');

const { createProxyMiddleware } = require('http-proxy-middleware');
const Koa = require('koa');
const compress = require('koa-compress');
const serve = require('koa-static');
const Sentry = require('@sentry/node');

const {
  defaultLocale,
  makeStore,
  nginxCacheHtml,
  prepareServerState,
  stateForClient,
  updateCacheState,
  createProxyMiddlewareConfig,
  ssrConfig,
  detectLocaleFromRequest,
  getCssLinksForRoute,
  render,
  runWithSsrRequestOrigin,
  siteConfig,
  buildAgentPromoRedirectUrl,
} = require(path.resolve(process.cwd(), `./server/entry-server.js`));

const htmlTemplate = fs.readFileSync(path.resolve(process.cwd(), './client/index.html'), 'utf-8');

const PORT = process.env.PORT || 3000;
const SITE_ID = process.env.SITE_ID;
const LOCAL_TEST = process.env.LOCAL_TEST;

function getFirstHeaderValue(value) {
  return value.split(',')[0]?.trim() || '';
}

function isPrivateHost(host) {
  const hostname = host.split(':')[0];
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function getSsrApiOrigin(ctx) {
  const forwardedHost = getFirstHeaderValue(ctx.get('x-forwarded-host'));
  const requestHost = getFirstHeaderValue(ctx.get('host'));
  const host = [forwardedHost, requestHost, ctx.host].find((item) => item && !isPrivateHost(item));

  return host ? `https://${host}` : '';
}

function isApiRequest(ctx) {
  return ctx.path === '/api' || ctx.path.startsWith('/api/');
}

function healthCheck(app) {
  app.use(async (ctx, next) => {
    if (ctx.path === '/livez') {
      ctx.status = 200;
      ctx.body = { status: 'ok' };
      return;
    }

    if (ctx.path === '/readyz') {
      ctx.status = 200;
      ctx.body = { status: 'ready' };
      return;
    }

    if (ctx.path === '/testOrigin') {
      ctx.status = 200;
      ctx.body = { origin: getSsrApiOrigin(ctx) };
      return;
    }

    return next();
  });
}

// 服务端错误日志上报初始化
Sentry.init({
  dsn: 'https://5b2d5209c53ccbbfb1a56684e934416e@api.gqkm6y.cc/3',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
/**
 * 全局缓存的 Redux state（SSR 启动时获取，定时更新）
 */
if (!SITE_ID) {
  throw new Error('SITE_ID is required');
}

// 测试模式：使用打包后的静态资源（模拟 nginx）
function testNginx(app) {
  const distPath = path.resolve(process.cwd(), './client');
  const imagesPath = path.resolve(process.cwd(), `src/sites/${SITE_ID}/images`);

  // 启用 gzip 压缩（必须在静态文件服务之前）
  app.use(
    compress({
      filter: (contentType) => {
        // 只压缩文本类型的文件
        return /text|javascript|json|css|svg|xml/i.test(contentType);
      },
      threshold: 1024, // 只压缩大于 1KB 的文件
      gzip: {
        flush: zlib.constants.Z_SYNC_FLUSH,
      },
      deflate: false, // 只使用 gzip
      br: false, // 不使用 brotli
    }),
  );

  app.use(serve(distPath, { index: false, maxAge: 86400000 }));
  app.use(async (ctx, next) => {
    if (ctx.path.startsWith('/images/')) {
      return serve(imagesPath, { index: false })(ctx, next);
    }
    // 提供语言文件服务
    if (ctx.path.startsWith('/locales/')) {
      return serve(distPath, { index: false })(ctx, next);
    }
    return next();
  });

  // 配置代理
  const proxyConfigs = createProxyMiddlewareConfig(siteConfig);
  for (const { path, options } of proxyConfigs) {
    const proxy = createProxyMiddleware(options);

    app.use(async (ctx, next) => {
      if (ctx.path.startsWith(path)) {
        return new Promise((resolve) => {
          proxy(ctx.req, ctx.res, (err) => {
            console.log(ctx.res, 'proxy', err);
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
}

/**
 * 生产环境服务器入口
 */
function startProdServer() {
  // 初始化并启动服务器 state 缓存
  const app = new Koa();
  app.proxy = true;

  healthCheck(app);

  if (LOCAL_TEST) {
    testNginx(app);
  }
  /**
   * SSR 中间件
   * 处理所有页面路由请求
   */
  app.use(async (ctx) => {
    try {
      if (isApiRequest(ctx)) {
        console.warn(`API request reached SSR server: ${ctx.method} ${ctx.path}`);
        ctx.status = 404;
        ctx.body = { message: 'Not Found' };
        return;
      }

      const ssrApiOrigin = getSsrApiOrigin(ctx);
      const agentPromoRedirect = buildAgentPromoRedirectUrl(ctx.path, ctx.search || '');
      if (agentPromoRedirect) {
        ctx.redirect(agentPromoRedirect);
        return;
      }
      // 如果请求路径为根路径，则替换为默认语言
      const routePath = ctx.path === '/' ? `/${defaultLocale}` : ctx.path;
      if (
        ssrConfig.noSSRPaths.some((noSSRPath) =>
          routePath.startsWith(`/${defaultLocale}/${noSSRPath}`),
        )
      ) {
        // 检查是否是不需要 SSR 渲染的路径 直接返回客户端 HTML，不进行 SSR
        console.log('no need to SSR render:', ctx.path);
        ctx.type = 'text/html';
        ctx.body = htmlTemplate;
        return;
      }

      if (LOCAL_TEST) {
        // 1. 检查缓存，如果有缓存直接返回
        const cachedHtml = nginxCacheHtml(routePath);
        if (cachedHtml) {
          ctx.type = 'text/html';
          ctx.body = cachedHtml;
          console.log('@SSR Middleware prod cache:', ctx.path);
          return;
        }
      }
      console.log('SSR render start:', ctx.path);

      // 2. 检测语言（用于 SSR 渲染）
      const detectedLocale = detectLocaleFromRequest(ctx);

      // 3. 准备服务端数据preloadedState
      const preloadedState = prepareServerState(ctx, siteConfig, detectedLocale);

      // 4. 创建 Redux store
      const store = makeStore(preloadedState);

      // 10. 使用 store 进行服务端渲染
      const { html: ssrHtml, queryState } = await runWithSsrRequestOrigin(ssrApiOrigin, () =>
        render(routePath, store, detectedLocale),
      );

      const state = store.getState();

      updateCacheState(state);

      // 11. 获取 CSS 链接
      const cssLinks = getCssLinksForRoute(routePath);

      // 12. 注入查询状态（用于客户端 hydration）
      const queryStateScript = `<script>
      window.__REACT_QUERY_STATE__ = ${JSON.stringify(queryState).replace(/</g, '\\u003c')};
      window.ssrTime = ${Date.now()};
      </script>`;

      // 8. 注入 Redux 状态（用于客户端 hydration）
      const reduxStateScript = `<script>
        window.__REDUX_STATE__ = ${JSON.stringify(stateForClient(state)).replace(/</g, '\\u003c')};
        </script>`;

      // 13. 组装最终 HTML
      const html = htmlTemplate
        .replace(/<link\s[^>]*rel="stylesheet"[^>]*>/g, '')
        .replace(`<!--ssr-head-->`, cssLinks + reduxStateScript + queryStateScript)
        .replace(`<!--ssr-html-->`, ssrHtml);

      if (LOCAL_TEST) {
        // 14. 设置缓存
        nginxCacheHtml(routePath, html);
      }
      console.log('SSR render success:', ctx.path);

      ctx.type = 'text/html';
      ctx.body = html;
    } catch (error) {
      console.error('SSR Error:', error);
      ctx.type = 'text/html';
      ctx.body = htmlTemplate;
    }
  });

  // 启动服务器
  const server = app.listen(PORT, () => {
    console.log(`🚀 SSR Server (Production) running at http://localhost:${PORT}`);
    console.log(`📦 Site ID: ${SITE_ID}`);
    console.log(`🌐 Environment: production`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // 强制关闭超时
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return app;
}

startProdServer();
