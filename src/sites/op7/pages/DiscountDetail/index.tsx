import React, { Suspense, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './DiscountDetail.module.scss';
// import { getDiscountActivityComponent } from './activityRegistry';
import H5Header from '../../components/H5Header';
import { useDiscountinfoQuery } from '@/apis/origin/promotion/discountDeatil';
import { useAppSelector } from '@/core/store/hooks';
import { useDiscountFavorite } from '@/common/hooks/useDiscountFavorite';
import { isVipExclusiveActivityId } from '@/common/utils/emcLink';
import Icon from '@/common/components/Icon';
import { getSystemTheme } from '@/utils';
import { ClientOnly } from '@/common/components/ClientOnly';

const DiscountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const discountId = id ?? '';
  // const ActivityComponent = getDiscountActivityComponent(discountId);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const [gameInitLoading, setGameInitLoading] = useState<boolean>(true);
  const { data: discountInfo } = useDiscountinfoQuery(discountId, isMobile);
  const hideFavorite = isVipExclusiveActivityId(discountId);
  const { isSaved, toggleFavorite } = useDiscountFavorite(Number(discountId));

  const favoriteButton = hideFavorite ? null : (
    <button
      type="button"
      aria-label={isSaved ? '取消收藏' : '收藏'}
      className="flex h-32px w-32px items-center justify-center rounded-full border-none bg-transparent p-0"
      onClick={(e) => void toggleFavorite(e)}
    >
      <Icon
        src={isSaved ? '/images/common/followed.svg' : '/images/common/follow.svg'}
        size={20}
        color={isSaved ? 'var(--Warning-200)' : 'var(--Text-800)'}
      />
    </button>
  );
  const title = <div className="font-700">{discountInfo?.data.title}</div>;
  return (
    <Suspense fallback={<div className={styles.discountDetail}>Loading...</div>}>
      <div className="self-center w-full flex-1 flex flex-col  lg:overflow-initial ">
        <H5Header title={title} isFixed={isMobile} pcHidden={false} right={favoriteButton} />
        {/* <ActivityComponent discountInfo={discountInfo?.data} /> */}
        <ClientOnly>
          <div className={styles.iframeContainer}>
            {gameInitLoading && (
              <div className={styles.gameInitLoading}>
                <img src={`/images/${theme}/loading.png`} alt="loading" />
              </div>
            )}

            <iframe src={discountInfo?.data.url} onLoad={() => setGameInitLoading(false)}></iframe>
            {/* <iframe src={'https://emc-sit-pc.test300.xyz/discount/details/216'}></iframe> */}
          </div>
        </ClientOnly>
      </div>
    </Suspense>
  );
};

export default DiscountDetail;
