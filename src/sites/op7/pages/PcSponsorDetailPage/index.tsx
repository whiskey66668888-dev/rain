import React, { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './sponsorDetailPage.module.scss';

import { useAppSelector } from '@/core/store/hooks';
import { SponsorItem, useSponsorListQuery } from '@/apis/origin/promotion/getSponsorList';
import siteConfig from '@/sites/op7/site.config';
import { getSystemTheme } from '@/utils';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { ClientOnly } from '@/common/components/ClientOnly';
const SponsorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const discountId = id ?? '';
  const { data: sponsorList } = useSponsorListQuery();
  const [gameInitLoading, setGameInitLoading] = useState<boolean>(true);
  const navigate = useNavigateWithLanguage();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const discountInfo = sponsorList?.find((item: SponsorItem) => item.id === Number(discountId));
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // 本地开发时自动加上 baseUrl 前缀
  const iframeUrl = useMemo(() => {
    const address = discountInfo?.webTargetAddress ?? '';
    if (!address) return '';
    // 已经是完整 URL（http/https 开头），直接使用
    if (/^https?:\/\//.test(address)) return address;
    // 相对路径，本地开发时拼接 baseUrl
    const isDev = __NODE_ENV__ === 'development';
    const baseUrl = isDev ? siteConfig.api.baseUrl : '';
    return `${baseUrl}${address}`;
  }, [discountInfo?.webTargetAddress]);
  const handleLogoClick = (): void => {
    navigate(PATHS.home);
  };
  return (
    <div className="self-center w-full h-full flex-1 flex flex-col lg:overflow-initial">
      <div className={styles.titleWrapper}>
        <div className={styles.title}>
          <div className={styles.logo} onClick={handleLogoClick}></div>
        </div>
      </div>
      <ClientOnly>
        <div className={styles.iframeContainer}>
          {gameInitLoading && (
            <div className={styles.gameInitLoading}>
              <img src={`/images/${theme}/loading.png`} alt="loading" />
            </div>
          )}
          <iframe
            id=""
            ref={iframeRef}
            src={iframeUrl}
            allowFullScreen
            onLoad={() => setGameInitLoading(false)}
          />
        </div>
      </ClientOnly>
    </div>
  );
};

export default SponsorDetailPage;
