import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { useHandle } from '@/sites/op7/hooks/useRoute';
import styles from './MainLayout.module.scss';

import { getMustMessageReq, getUnreadMessageReq } from '@/apis/origin/message';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/core/store/hooks';

import BottomMenu, { isRouteUnderH5BottomTabs } from '../../components/BottomMenu';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import SidebarMenu from '../../components/SidebarMenu';
import RightSidebar from '../../components/RightSidebar';
import clsx from 'clsx';
import { getSystemTheme, scrollToTopLayoutMainContent } from '@/utils';
import MessageCenter from '../MessageCenter';
import FloatingButton from '@/common/components/FloatingButton';
import { ClientOnly } from '@/common/components/ClientOnly';
import { useWebsiteSwitchListQuery } from '@/apis/origin/websiteSwitch';
import { useSocialConfigQuery } from '@/apis/origin/social/getSocialConfig';
import {
  isOp7SportsModuleRoute,
  resetSportVideoSoundSession,
} from '@/sites/op7/utils/sportVideoSoundSession';
import { getQueryString } from '@/core/sdk/request/util';
import {
  PwaInstallMobileBanner,
  runStandaloneWelcomeToastOnce,
} from '@/sites/op7/components/PwaInstall';
import {
  applyH5NotchColor,
  getH5NotchSolidColor,
  getNotchPageKind,
} from '@/sites/op7/utils/h5NotchColor';
import { useMarkBootAppReady } from '@/core/boot/useMarkBootAppReady';

const isHomePath = (pathname: string) => pathname === '/' || pathname === '';
const H5_NOTCH_COLOR_ENTERTAIN = 'var(--Background-700)';
const H5_NOTCH_COLOR_SPORTS_LIGHT = '#CBD8ED';
const H5_NOTCH_COLOR_SPORTS_DARK = '#18181B';
const H5_NOTCH_COLOR_DEFAULT = 'var(--Background-300, #fff)';

/**
 * 带头底侧边栏的主布局组件
 */
const MainLayout: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const outlet = useOutlet();
  const { data: websiteSwitchList = [] } = useWebsiteSwitchListQuery();
  useSocialConfigQuery();

  const handle = useHandle();
  const h5ShowHeader = !!handle?.h5ShowHeader;
  const h5ShowFooter = !!handle?.h5ShowFooter;
  const h5NoBottomMenu = !!handle?.h5NoBottomMenu;
  const lineGradient = !!handle?.lineGradient;
  const fbSwitchItem = useMemo(
    () => websiteSwitchList.find((item) => typeof item?.FB !== 'undefined'),
    [websiteSwitchList],
  );
  const isFBSportsMaintenance = useMemo(
    () => String(fbSwitchItem?.FB ?? '') === '0',
    [fbSwitchItem],
  );
  const pageKind = useMemo(
    () => (h5ShowHeader ? getNotchPageKind(location.pathname, handle?.module) : 'default'),
    [h5ShowHeader, location.pathname, handle?.module],
  );
  const isDark = themeMode === 'dark' || (themeMode === 'system' && getSystemTheme() === 'dark');
  const h5HeaderBgColor = useMemo(() => {
    if (pageKind === 'sports') {
      if (!isMobile) {
        return H5_NOTCH_COLOR_ENTERTAIN;
      }
      if (isFBSportsMaintenance) return H5_NOTCH_COLOR_ENTERTAIN;
      return isDark ? H5_NOTCH_COLOR_SPORTS_DARK : H5_NOTCH_COLOR_SPORTS_LIGHT;
    }
    if (pageKind === 'entertainment') return H5_NOTCH_COLOR_ENTERTAIN;
    return H5_NOTCH_COLOR_DEFAULT;
  }, [isDark, isFBSportsMaintenance, pageKind, isMobile]);
  const h5NotchSolidColor = useMemo(
    () =>
      getH5NotchSolidColor(pageKind, isDark, {
        isMobile,
        isFBSportsMaintenance,
      }),
    [isDark, isFBSportsMaintenance, isMobile, pageKind],
  );
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  // 在 MainLayout 中触发站内信接口（首页且已登录时），确保不依赖 HomePage 挂载
  useEffect(() => {
    if (!isHomePath(location.pathname) || !isLogin) return;
    getMustMessageReq()
      .then((res) => queryClient.setQueryData(['center', 'mustMessage'], res.data))
      .catch(() => {});
    getUnreadMessageReq()
      .then((res) => queryClient.setQueryData(['center', 'unreadMessage'], res.data))
      .catch(() => {});
  }, [location.pathname, isLogin, queryClient]);

  useEffect(() => {
    scrollToTopLayoutMainContent();
  }, [location.pathname]);

  /**
   * 「自动」主题：getSystemTheme() 随本地小时变化，但 html 的 data-theme 仅在首屏脚本 / setTheme 时写入，
   * 长驻页面跨 6/18 点或从其它页返回时会出现 Banner/我的等按小时取黑夜素材、整站仍为白天的问题。
   * 在 system 模式下定时与切回前台时与 getSystemTheme() 对齐。
   */
  useEffect(() => {
    if (themeMode !== 'system') return;
    const apply = () => {
      const resolved = getSystemTheme();
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.setAttribute('data-prefers-color-scheme', resolved);
      if (isMobile && h5ShowHeader) {
        applyH5NotchColor(
          getH5NotchSolidColor(pageKind, resolved === 'dark', {
            isMobile,
            isFBSportsMaintenance,
          }),
        );
      }
    };
    apply();
    const timer = window.setInterval(apply, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') apply();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [themeMode, location.pathname, isMobile, h5ShowHeader, pageKind, isFBSportsMaintenance]);

  useEffect(() => {
    if (isMobile) return;
    if (!isOp7SportsModuleRoute(location.pathname, handle?.module)) {
      resetSportVideoSoundSession();
    }
  }, [isMobile, location.pathname, handle?.module]);

  useEffect(() => {
    if (!isMobile) return;

    const syncNotch = () => applyH5NotchColor(h5NotchSolidColor);
    syncNotch();
    const rafId = window.requestAnimationFrame(syncNotch);
    window.addEventListener('load', syncNotch);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('load', syncNotch);
    };
  }, [h5NotchSolidColor, isMobile]);

  useEffect(() => {
    const sysAgentName = getQueryString('sysAgentName');
    if (sysAgentName) {
      sessionStorage.setItem('sysAgentName', sysAgentName);
    }
  }, []);

  // Safari「添加到程序坞」不触发 appinstalled：首次从程序坞/主屏幕以独立窗口打开时补一条成功提示
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      runStandaloneWelcomeToastOnce();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const showH5NotchBar = isMobile && h5ShowHeader;
  const mainScrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scrollEl = mainScrollRef.current;
    if (!scrollEl) return;
    const TOP_SCROLL_THRESHOLD = 2;

    const onScroll = () => {
      if (isMobile && pageKind === 'sports') {
        const sportsMainAreaTop = document.getElementById('sports-page-main-area-top-h5');
        if (sportsMainAreaTop) {
          const scrollRectTop = scrollEl.getBoundingClientRect().top;
          const paddingTop = Number.parseFloat(getComputedStyle(scrollEl).paddingTop) || 0;
          const stickyTop = scrollRectTop + paddingTop;
          // 仅当 sports 顶部筛选区进入 sticky 状态时，才显示 header 背景色
          setIsHeaderScrolled(sportsMainAreaTop.getBoundingClientRect().top <= stickyTop + 0.5);
          return;
        }
      }
      setIsHeaderScrolled(scrollEl.scrollTop > TOP_SCROLL_THRESHOLD);
    };

    onScroll();
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
    };
  }, [location.pathname, isMobile, pageKind]);

  // 主布局挂载后再关闭开屏 loading，避免 entry 过早 dismiss 导致首屏可点但尚未可交互
  useMarkBootAppReady();

  return (
    <div className="w-full h-full flex">
      {showH5NotchBar ? <div className={styles.h5NotchBar} aria-hidden /> : null}
      {/* 大于lg时显示侧边栏 */}
      <SidebarMenu />

      <div className={clsx('flex-1-col-hidden')}>
        <main
          ref={mainScrollRef}
          className={clsx(
            {
              [styles.h5MainSafePaddingTop as string]: h5ShowHeader && isMobile,
              'pt-48px': h5ShowHeader && !isMobile,
              'pb-bottom-menu': !h5NoBottomMenu,
            },
            { [styles.sportMainLayout as string]: lineGradient && !isFBSportsMaintenance },
            'flex-1 flex flex-col lg:pb-0 lg:pt-0 overflow-y-auto overflow-x-hidden',
          )}
          id="layout-main-content"
        >
          <header
            key={pageKind === 'entertainment' ? 'entertainment-header' : 'default-header'}
            className={clsx('w-full lg:block', {
              ['hidden']: !h5ShowHeader,
              [styles.header as string]: true,
            })}
            style={{
              backgroundColor: isMobile
                ? isHeaderScrolled
                  ? h5HeaderBgColor
                  : 'transparent'
                : 'var(--Background-300)',
            }}
          >
            <Header />
          </header>
          <div
            className={clsx('flex-1 flex flex-col', {
              'overflow-hidden lg:overflow-initial': !h5ShowFooter,
            })}
          >
            {outlet}
          </div>
          <footer
            className={clsx(
              'w-full shrink-0 flex-col items-center gap-10px lg:flex  bg-[var(--Background-400)] ',
              {
                ['flex']: h5ShowFooter,
                ['hidden']: !h5ShowFooter,
              },
            )}
          >
            <Footer />
          </footer>
          <ClientOnly>
            <FloatingButton scrollContainerRef={mainScrollRef} scrollSyncKey={location.pathname} />
            {isMobile && !h5NoBottomMenu && isRouteUnderH5BottomTabs(location.pathname) ? (
              <PwaInstallMobileBanner />
            ) : null}
          </ClientOnly>
        </main>
      </div>

      {isMobile ? <MessageCenter /> : <RightSidebar />}

      {/* 小于lg时h5显示底部菜单 */}
      <div className={clsx({ ['hidden']: h5NoBottomMenu })}>
        <BottomMenu />
      </div>
    </div>
  );
};

export default memo(MainLayout);
