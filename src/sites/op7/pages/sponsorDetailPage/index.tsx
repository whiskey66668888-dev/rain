import React, { Suspense, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './sponsorDetailPage.module.scss';
import H5Header from '../../components/H5Header';

import { useAppSelector } from '@/core/store/hooks';
import { SponsorItem, useSponsorListQuery } from '@/apis/origin/promotion/getSponsorList';
import siteConfig from '@/sites/op7/site.config';
import { getSystemTheme } from '@/utils';
import { ClientOnly } from '@/common/components/ClientOnly';

const SponsorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const discountId = id ?? '';
  const { data: sponsorList } = useSponsorListQuery();
  const [gameInitLoading, setGameInitLoading] = useState<boolean>(true);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const discountInfo = sponsorList?.find((item: SponsorItem) => item.id === Number(discountId));

  // 本地开发时自动加上 baseUrl 前缀
  const iframeUrl = useMemo(() => {
    const address = discountInfo?.targetAddress ?? '';
    if (!address) return '';
    // 已经是完整 URL（http/https 开头），直接使用
    if (/^https?:\/\//.test(address)) return address;
    // 相对路径，本地开发时拼接 baseUrl
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? siteConfig.api.baseUrl : '';
    return `${baseUrl}${address}`;
  }, [discountInfo?.targetAddress]);

  return (
    <Suspense fallback={<div className={styles.discountDetail}></div>}>
      <div className="self-center w-full flex-1 flex flex-col lg:overflow-initial">
        <H5Header title={discountInfo?.resourceName} isFixed={isMobile} pcHidden={false} />
        <ClientOnly>
          <div className={styles.iframeContainer}>
            {gameInitLoading && (
              <div className={styles.gameInitLoading}>
                <img src={`/images/${theme}/loading.webp`} alt="loading" />
              </div>
            )}
            <iframe src={iframeUrl} allowFullScreen onLoad={() => setGameInitLoading(false)} />
          </div>
        </ClientOnly>
      </div>
    </Suspense>
  );
};

export default SponsorDetailPage;
