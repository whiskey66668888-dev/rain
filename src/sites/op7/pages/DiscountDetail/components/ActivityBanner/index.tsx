import React, { useMemo } from 'react';

import styles from './index.module.scss';
import LazyImage from '@/common/components/LazyImage';
import { useAppSelector } from '@/core/store/hooks';
import type { DiscountActivityProps } from '../../activityRegistry';

const ActivityBanner: React.FC<DiscountActivityProps> = ({ discountInfo }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);

  const defaultTopImage = isMobile
    ? '/images/common/promotion/discount_placehold_h5.png'
    : '/images/common/promotion/discount_placehold_pc.png';

  const currentTopImage = isMobile ? discountInfo?.topImageApp : discountInfo?.topImageWeb;

  return (
    <div className={styles.banner}>
      <LazyImage
        src={currentTopImage || defaultTopImage}
        placeholder={defaultTopImage}
        alt={discountInfo?.title || ''}
        aspectRatio="351/141"
        className={styles.bannerImage}
      />
    </div>
  );
};

export default ActivityBanner;
