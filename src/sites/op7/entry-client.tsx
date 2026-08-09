import { HydrationBoundary } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRouteObjects } from './routes';
import 'virtual:uno.css';

import { i18n, initI18nClientInit } from '@/core/i18n';
// import { initPwaNotificationTest } from '@/core/pwa/notification-test';
import { registerServiceWorker } from '@/core/pwa/sw-register';
import { createClientQueryClient } from '@/core/query/client';
import { QueryProvider } from '@/core/query/provider';
import { getSSRQueryState } from '@/core/query/ssr';
import { getSSRPreloadedState, makeStore } from '@/core/store';
import { initUmengApm } from '@/core/apm/umeng.client';
import { initBootSplashDismiss } from '@/core/boot/dismissBootShield';
import { setGlobalStoreForApiRequest } from '@/core/store/util';
import { redirectAgentPromoPathIfNeeded } from '@/utils/agentPromoLink';
import { persistAppAuthFromUrl } from '@/utils/appEmbed';
import { initAntiDebug } from '@/core/security/anti-debug';

import * as Sentry from '@sentry/react';
import './theme.scss';
import '@common/styles/base.scss';

// 监控 SDK 需在 React 渲染前初始化，才能覆盖首屏 JS 异常与资源错误
initUmengApm();

if (__NODE_ENV__ === 'production') {
  // 客户端日志上报
  Sentry.init({
    dsn: 'https://86d5dc9458ef8b1cd85ba01c3148e2bc@api.gqkm6y.cc/4',
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}
/**
 * 客户端入口
 */
(() => {
  initAntiDebug();
  initBootSplashDismiss();
  persistAppAuthFromUrl();

  if (redirectAgentPromoPathIfNeeded()) return;

  initI18nClientInit();
  const rootElement = document.getElementById('root') as HTMLElement;
  const preloadedState = getSSRPreloadedState();
  const store = makeStore(preloadedState);
  setGlobalStoreForApiRequest(store);
  const queryClient = createClientQueryClient();
  const dehydratedState = getSSRQueryState();

  const router = createBrowserRouter(appRouteObjects, {
    future: { v7_relativeSplatPath: true },
  });

  const app = (
    // <React.StrictMode>
    <QueryProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <RouterProvider router={router} />
          </I18nextProvider>
        </Provider>
      </HydrationBoundary>
    </QueryProvider>
    // </React.StrictMode>
  );

  if (dehydratedState) {
    // SSR hydration：如果已经有服务端渲染的内容, 进行 hydration
    ReactDOM.hydrateRoot(rootElement, app);
  } else {
    // 降级到客户端渲染
    ReactDOM.createRoot(rootElement).render(app);
  }

  registerServiceWorker();
  // initPwaNotificationTest();
})();
