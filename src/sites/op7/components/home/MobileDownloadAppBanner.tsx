import React from 'react';
import clsx from 'clsx';

import { useAppDownload } from '@/common/hooks/useAppDownload';

export interface MobileDownloadAppBannerProps {
  /** 与首页一致：上方有「推荐赛事」等区块时用一点上间距 */
  addTopSpacing?: boolean;
}

/**
 * H5 首页 / 落地页等：downloadImg Banner，点击走站点下载链接（含 sysAgentName）
 */
const MobileDownloadAppBanner: React.FC<MobileDownloadAppBannerProps> = ({}) => {
  const { openDownloadApp } = useAppDownload();

  return (
    <button
      type="button"
      className={clsx(
        'w-full px-12px border-none bg-transparent mt-16px block cursor-pointer appearance-none lg:hidden',
      )}
      onClick={openDownloadApp}
      aria-label="下载 APP"
    >
      <img
        src="/images/common/downloadImg1.webp"
        alt=""
        className="w-full h-131px pointer-events-none"
      />
    </button>
  );
};

export default MobileDownloadAppBanner;
