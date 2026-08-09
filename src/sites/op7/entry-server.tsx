import { Writable } from 'stream';

import type { DehydratedState } from '@tanstack/react-query';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server';

import { defaultLocale, initI18nSSR, i18n } from '@/core/i18n';
import { appRouteObjects } from './routes';
import { createServerQueryClient } from '@/core/query/client';
import { QueryProvider } from '@/core/query/provider';
import { dehydrateQueryState } from '@/core/query/ssr';
import type { AppStore } from '@/core/store';
import { setGlobalStoreForApiRequest } from '@/core/store/util';
export {
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
  siteConfig,
  buildAgentPromoRedirectUrl,
} from '@/server/server-prod-modules';
export { runWithSsrRequestOrigin } from '@/server/ssrRequestContext';

// 路由配置不变，handler 只需初始化一次
const staticHandler = createStaticHandler(appRouteObjects);

export async function render(
  urlPathname: string,
  store: AppStore,
  locale?: string,
): Promise<{ html: string; queryState: DehydratedState }> {
  await initI18nSSR(locale || defaultLocale);
  setGlobalStoreForApiRequest(store);

  const queryClient = createServerQueryClient();
  const context = await staticHandler.query(new Request(`http://localhost${urlPathname}`));
  if (context instanceof Response)
    throw new Error(`Redirect: ${context.status} ${context.headers.get('Location')}`);
  const staticRouter = createStaticRouter(staticHandler.dataRoutes, context);

  const html = await new Promise<string>((resolve, reject) => {
    let htmlContent = '';
    const { pipe } = renderToPipeableStream(
      <QueryProvider client={queryClient}>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <StaticRouterProvider router={staticRouter} context={context} />
          </I18nextProvider>
        </Provider>
      </QueryProvider>,
      {
        // 设置一个很大的 progressiveChunkSize，减少分块
        progressiveChunkSize: Number.MAX_SAFE_INTEGER,
        onShellReady() {
          // shell 就绪（Suspense 外部），但不输出，等待所有内容完成
          // 不在这里 pipe，确保等待 onAllReady
        },
        onAllReady() {
          // 所有内容渲染完成（包括所有 Suspense 边界和懒加载组件）
          // 此时收集完整 HTML，不包含任何 fallback
          const writable = new Writable({
            write(
              chunk: Buffer,
              _encoding: BufferEncoding,
              callback: (error?: Error | null) => void,
            ) {
              htmlContent += chunk.toString();
              callback();
            },
            final(callback: () => void) {
              // 确保收集到完整的 HTML 字符串
              resolve(htmlContent);
              callback();
            },
          });

          pipe(writable);
        },
        onError(error: unknown) {
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      },
    );
  });

  const queryState = dehydrateQueryState(queryClient);

  return { html, queryState };
}
