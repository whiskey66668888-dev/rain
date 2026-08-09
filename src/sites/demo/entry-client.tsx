import { HydrationBoundary } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import 'virtual:uno.css';

import { i18n, initI18nClientInit } from '@/core/i18n';
import { registerServiceWorker } from '@/core/pwa/sw-register';
import { createClientQueryClient } from '@/core/query/client';
import { QueryProvider } from '@/core/query/provider';
import { getSSRQueryState } from '@/core/query/ssr';
import { getSSRPreloadedState, makeStore } from '@/core/store';
import { setGlobalStoreForApiRequest } from '@/core/store/util';

import App from './App';
import './theme.scss';
import '@common/styles/base.scss';

/**
 * 客户端入口
 */

(() => {
  initI18nClientInit();
  const rootElement = document.getElementById('root') as HTMLElement;
  const preloadedState = getSSRPreloadedState();
  const store = makeStore(preloadedState);
  setGlobalStoreForApiRequest(store);
  const queryClient = createClientQueryClient();
  const dehydratedState = getSSRQueryState();

  const app = (
    <React.StrictMode>
      <QueryProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <Provider store={store}>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <I18nextProvider i18n={i18n}>
                <App />
              </I18nextProvider>
            </BrowserRouter>
          </Provider>
        </HydrationBoundary>
      </QueryProvider>
    </React.StrictMode>
  );

  if (dehydratedState) {
    // SSR hydration：如果已经有服务端渲染的内容, 进行 hydration
    ReactDOM.hydrateRoot(rootElement, app);
  } else {
    // 降级到客户端渲染
    ReactDOM.createRoot(rootElement).render(app);
  }

  registerServiceWorker();
})();
