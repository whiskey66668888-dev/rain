import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import H5Header from '@/sites/op7/components/H5Header';
import { ClientOnly } from '@/common/components/ClientOnly';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

import styles from './DepositPayPage.module.scss';

interface DepositPayLocationState {
  url?: string;
}

/**
 * H5 充值支付页：iframe 内嵌第三方支付链接，避免马甲包无法外跳
 */
const DepositPayPage: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const location = useLocation();
  const payUrl = (location.state as DepositPayLocationState | null)?.url ?? '';
  const [iframeLoading, setIframeLoading] = useState(true);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;

  useEffect(() => {
    if (!payUrl) {
      navigate(PATHS.mineDeposit, { replace: true });
    }
  }, [navigate, payUrl]);

  if (!payUrl) {
    return null;
  }

  return (
    <div className={styles.page}>
      <H5Header title="充值" isFixed={isMobile} />
      <ClientOnly>
        <div className={styles.iframeContainer}>
          {iframeLoading ? (
            <div className={styles.loading}>
              <img src={`/images/${theme}/loading.png`} alt="loading" />
            </div>
          ) : null}
          <iframe src={payUrl} title="充值" onLoad={() => setIframeLoading(false)} />
        </div>
      </ClientOnly>
    </div>
  );
};

export default DepositPayPage;
