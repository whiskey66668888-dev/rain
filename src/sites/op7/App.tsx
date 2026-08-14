import React, { lazy, Suspense, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';

import { prefetchServiceInfo } from '@/apis/origin/customerService';
import { prefetchLoginBanners } from '@/apis/origin/loginBanner';
import { useInitSocialUnreadCount } from '@/apis/origin/social/getSocialUnreadCount';
import { ClientOnly } from '@/common/components/ClientOnly';
import GlobalIpAccess from '@/common/components/GlobalIpAccess';
import { MainLayout } from '@/common/components/layouts/MainLayout';
import { useHeaderBalance } from '@/common/hooks/useHeaderBalance';
import { useRegisterGlobalActions } from '@/common/hooks/useGlobalNavigate';
import { useInitCanHover } from '@/common/hooks/useInitCanHover';
import { useInitUnreadCount } from '@/common/hooks/messageCenter/useInitUnreadCount';
import { useSyncMemberSettingsFromInfo } from '@/common/hooks/memberSettingsBridge';
import {
  useBetHistoryPopupBridge,
  usePopupWindowConnect,
} from '@/common/hooks/popupWindows/usePopupWindows';
import { useScreenBreakpoint } from '@/common/hooks/useScreenBreakpoint';
import { BootSplashDismissBridge } from '@/core/boot/BootSplashDismissBridge';
import { useAppSelector } from '@/core/store/hooks';
import { initMouseActionTracking, isPC } from '@/utils/mouseAction';

import DevSystemSettingsFloat from './components/DevSystemSettingsFloat';
import { useFullScreenLoadingState } from './components/FullScreenLoading/loadingStore';
import GlobalPostMessageHost from './components/GlobalPostMessageHost';
import { loadLoginPage, loadRegisterPage, prefetchAuthModals } from './pages/prefetchAuthModals';
import { useBetShareState } from './pages/SportsDetailsPage/components/share/betShareStore';

const LoginPage = lazy(loadLoginPage);
const RegisterPage = lazy(loadRegisterPage);
const GlobalCustomerServiceHost = lazy(() => import('./components/GlobalCustomerServiceHost'));
const BetShareSheetHost = lazy(
  () => import('./pages/SportsDetailsPage/components/BetShareSheet/BetShareSheetHost'),
);
const FullScreenLoadingHost = lazy(
  () => import('./components/FullScreenLoading/FullScreenLoadingHost'),
);
const NotificationWsHost = lazy(() => import('./components/NotificationWsHost'));
const InviteModal = lazy(() =>
  import('./components/Modals/InviteModal').then((m) => ({ default: m.InviteModal })),
);

/**
 * 应用根组件
 */
const App: React.FC = () => {
  const queryClient = useQueryClient();
  const authModalType = useAppSelector((state) => state.authUI.activeModal);
  const customerServiceOpenSeq = useAppSelector((state) => state.customerServiceUI.openSeq);
  const { open: betShareOpen } = useBetShareState();
  const { open: fullScreenLoadingOpen } = useFullScreenLoadingState();
  const inviteModalVisible = useAppSelector((state) => state.user.inviteModalVisible);

  const [authModalLoaded, setAuthModalLoaded] = useState(false);
  const [customerServiceHostLoaded, setCustomerServiceHostLoaded] = useState(false);
  const [betShareHostLoaded, setBetShareHostLoaded] = useState(false);
  const [fullScreenLoadingHostLoaded, setFullScreenLoadingHostLoaded] = useState(false);
  const [inviteModalLoaded, setInviteModalLoaded] = useState(false);

  const showAuthModals = authModalLoaded || Boolean(authModalType);
  const showCustomerServiceHost = customerServiceHostLoaded || customerServiceOpenSeq > 0;
  const showBetShareHost = betShareHostLoaded || betShareOpen;
  const showFullScreenLoadingHost = fullScreenLoadingHostLoaded || fullScreenLoadingOpen;
  const showInviteModal = inviteModalLoaded || inviteModalVisible;

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

  useEffect(() => {
    const prefetch = () => prefetchAuthModals();
    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(prefetch, { timeout: 2500 });
      return () => cancelIdleCallback(idleId);
    }
    const timer = window.setTimeout(prefetch, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authModalType) return;
    setAuthModalLoaded(true);
    prefetchAuthModals();
  }, [authModalType]);

  useEffect(() => {
    if (customerServiceOpenSeq > 0) {
      setCustomerServiceHostLoaded(true);
    }
  }, [customerServiceOpenSeq]);

  useEffect(() => {
    if (betShareOpen) {
      setBetShareHostLoaded(true);
    }
  }, [betShareOpen]);

  useEffect(() => {
    if (fullScreenLoadingOpen) {
      setFullScreenLoadingHostLoaded(true);
    }
  }, [fullScreenLoadingOpen]);

  useEffect(() => {
    if (inviteModalVisible) {
      setInviteModalLoaded(true);
    }
  }, [inviteModalVisible]);

  return (
    <MainLayout>
      <BootSplashDismissBridge />
      <GlobalIpAccess />
      <Outlet />
      {/* 登录/注册弹窗：首次打开后再挂载，关闭后保持以免重复拉 chunk */}
      {showAuthModals && (
        <Suspense fallback={null}>
          <LoginPage />
          <RegisterPage />
        </Suspense>
      )}
      {/* 首充开启邀请特权弹窗：首次打开后再挂载，关闭后保持以播退场动画 */}
      {showInviteModal ? (
        <Suspense fallback={null}>
          <InviteModal />
        </Suspense>
      ) : null}
      {showCustomerServiceHost && (
        <Suspense fallback={null}>
          <GlobalCustomerServiceHost />
        </Suspense>
      )}
      {/* 和iframe通信 */}
      <GlobalPostMessageHost />
      {/* 全局单例宿主：挂在 App 而非 MainLayout，
          否则 /bet_history_pc 这类不套 MainLayout 的顶层路由上点分享会没反应 */}
      <ClientOnly>
        <Suspense fallback={null}>
          {showBetShareHost && <BetShareSheetHost />}
          {showFullScreenLoadingHost && <FullScreenLoadingHost />}
        </Suspense>
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
