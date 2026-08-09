import { Writable } from 'stream';

import type { DehydratedState } from '@tanstack/react-query';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom/server';

import { defaultLocale, initI18nSSR, i18n } from '@/core/i18n';
import { createServerQueryClient } from '@/core/query/client';
import { QueryProvider } from '@/core/query/provider';
import { dehydrateQueryState } from '@/core/query/ssr';
import type { AppStore } from '@/core/store';
import { setGlobalStoreForApiRequest } from '@/core/store/util';

import App from './App';

export async function render(
  urlPathname: string,
  store: AppStore,
  locale?: string,
): Promise<{ html: string; queryState: DehydratedState }> {
  await initI18nSSR(locale || defaultLocale);
  setGlobalStoreForApiRequest(store);

  const queryClient = createServerQueryClient();

  const html = await new Promise<string>((resolve, reject) => {
    let htmlContent = '';
    const { pipe } = renderToPipeableStream(
      <QueryProvider client={queryClient}>
        <Provider store={store}>
          <StaticRouter
            location={urlPathname}
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <I18nextProvider i18n={i18n}>
              <App />
            </I18nextProvider>
          </StaticRouter>
        </Provider>
      </QueryProvider>,
      {
        onShellReady() {
          // shell 就绪（Suspense 外部）
        },
        onAllReady() {
          // 所有内容渲染完成（包括懒加载组件以及组件内部的请求）
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
