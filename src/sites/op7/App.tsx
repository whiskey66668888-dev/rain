import React, { lazy, Suspense, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { prefetchServiceInfo } from '@/apis/origin/customerService';
import { prefetchLoginBanners } from '@/apis/origin/loginBanner';
import { MainLayout } from '@/common/components/layouts/MainLayout';
import { ClientOnly } from '@/common/components/ClientOnly';
import GlobalIpAccess from '@/common/components/GlobalIpAccess';

import { useRegisterGlobalActions } from '@/common/hooks/useGlobalNavigate';
import { useInitCanHover } from '@/common/hooks/useInitCanHover';
import { useScreenBreakpoint } from '@/common/hooks/useScreenBreakpoint';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Outlet } from 'react-router-dom';
import { useSyncMemberSettingsFromInfo } from '@/common/hooks/memberSettingsBridge';
import { useHeaderBalance } from '@/common/hooks/useHeaderBalance';
import { useInitUnreadCount } from '@/common/hooks/messageCenter/useInitUnreadCount';
import { useInitSocialUnreadCount } from '@/apis/origin/social/getSocialUnreadCount';
import { InviteModal } from './components/Modals/InviteModal';
import GlobalCustomerServiceHost from './components/GlobalCustomerServiceHost';
import DevSystemSettingsFloat from './components/DevSystemSettingsFloat';
import {
  usePopupWindowConnect,
  useBetHistoryPopupBridge,
} from '@/common/hooks/popupWindows/usePopupWindows';
import GlobalPostMessageHost from './components/GlobalPostMessageHost';
import BetShareSheetHost from './pages/SportsDetailsPage/components/BetShareSheet/BetShareSheetHost';
import FullScreenLoadingHost from './components/FullScreenLoading/FullScreenLoadingHost';
import { BootSplashDismissBridge } from '@/core/boot/BootSplashDismissBridge';
import { initMouseActionTracking, isPC } from '@/utils/mouseAction';

const NotificationWsHost = lazy(() => import('./components/NotificationWsHost'));

/**
 * 应用根组件
 */
const App: React.FC = () => {
  const queryClient = useQueryClient();

  useRegisterGlobalActions();
  useInitCanHover();
  useScreenBreakpoint();
  useSyncMemberSettingsFromInfo();
  useHeaderBalance();
  useInitUnreadCount();
  useInitSocialUnreadCount();
  usePopupWindowConnect();
  useBetHistoryPopupBridge();

  useEffect(() => {
    if (isPC()) {
      initMouseActionTracking();
    }
    prefetchLoginBanners(queryClient);
    prefetchServiceInfo(queryClient, 1);
  }, [queryClient]);

  return (
    <MainLayout>
      <BootSplashDismissBridge />
      <GlobalIpAccess />
      <Outlet />
      {/* 登录/注册弹窗 */}
      <LoginPage />
      <RegisterPage />
      {/* 首充开启邀请特权弹窗 */}
      <InviteModal />
      <GlobalCustomerServiceHost />
      {/* 和iframe通信 */}
      <GlobalPostMessageHost />
      {/* 全局单例宿主：挂在 App 而非 MainLayout，
          否则 /bet_history_pc 这类不套 MainLayout 的顶层路由上点分享会没反应 */}
      <ClientOnly>
        <BetShareSheetHost />
        <FullScreenLoadingHost />
      </ClientOnly>
      {__NODE_ENV__ === 'development' && (
        <ClientOnly>
          <DevSystemSettingsFloat />
        </ClientOnly>
      )}
      <ClientOnly>
        <Suspense fallback={null}>
          <NotificationWsHost />
        </Suspense>
      </ClientOnly>
    </MainLayout>
  );
};

export default App;
