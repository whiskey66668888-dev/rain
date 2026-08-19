import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import styles from './Material.module.scss';
// import { getDiscountActivityComponent } from './activityRegistry';
import H5Header from '../../components/H5Header';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import { ClientOnly } from '@/common/components/ClientOnly';
import siteConfig from '@/sites/op7/site.config';
import { navigateTo } from '@/common/hooks/useGlobalNavigate';
import { PATHS } from '../../routes/paths';
const MaterialPage: React.FC = () => {
  // const ActivityComponent = getDiscountActivityComponent(discountId);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;

  const [title, setTitle] = useState<string>('创意素材库');

  const [gameInitLoading, setGameInitLoading] = useState<boolean>(true);
  const iframeUrl = useMemo(() => {
    // 相对路径，本地开发时拼接 baseUrl
    const isDev = __NODE_ENV__ === 'development';
    const baseUrl = isDev ? siteConfig.api.baseUrl : '';
    return `${baseUrl}${'/h5/material'}?theme=${theme}`;
  }, [theme]);

  const onPostMessage = useCallback((e: MessageEvent) => {
    let data: unknown = e.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return;
      }
    }
    if (!data || typeof data !== 'object' || !('eventName' in data)) {
      return;
    }
    const { eventName, payload } = data as { eventName: string; payload?: unknown };
    if (eventName !== 'changeTitle') {
      return;
    }
    if (typeof payload === 'string' && payload.trim()) {
      setTitle(payload.trim());
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', onPostMessage);
    return () => window.removeEventListener('message', onPostMessage);
  }, [onPostMessage]);

  useEffect(() => {
    if (!isMobile) {
      navigateTo(PATHS.promotion, { replace: true });
    }
  }, [isMobile]);

  return (
    <Suspense fallback={<div className={styles.discountDetail}>Loading...</div>}>
      <div className="self-center w-full flex-1 flex flex-col overflow-hidden lg:overflow-initial">
        <H5Header title={title} isFixed={isMobile} pcHidden={false} />
        <ClientOnly>
          <div className={styles.iframeContainer}>
            {gameInitLoading && (
              <div className={styles.gameInitLoading}>
                <img src={`/images/${theme}/loading.png`} alt="loading" />
              </div>
            )}

            <iframe src={iframeUrl} onLoad={() => setGameInitLoading(false)}></iframe>
          </div>
        </ClientOnly>
      </div>
    </Suspense>
  );
};

export default MaterialPage;
