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
import { makeStore } from '@/core/store';
import { setGlobalStoreForApiRequest } from '@/core/store/util';

import App from './App';
import './theme.scss';
import '@common/styles/base.scss';

/**
 * 客户端入口（纯 SPA，无 SSR hydration）
 */
(() => {
  initI18nClientInit();
  const rootElement = document.getElementById('root') as HTMLElement;
  const store = makeStore();
  setGlobalStoreForApiRequest(store);
  const queryClient = createClientQueryClient();

  const app = (
    <React.StrictMode>
      <QueryProvider client={queryClient}>
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
      </QueryProvider>
    </React.StrictMode>
  );

  ReactDOM.createRoot(rootElement).render(app);

  registerServiceWorker();
})();
