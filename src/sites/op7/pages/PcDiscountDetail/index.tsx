import React, { Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './DiscountDetail.module.scss';
// import { getDiscountActivityComponent } from './activityRegistry';
import { useDiscountinfoQuery } from '@/apis/origin/promotion/discountDeatil';
import { useAppSelector } from '@/core/store/hooks';
import { useDiscountFavorite } from '@/common/hooks/useDiscountFavorite';
import { isVipExclusiveActivityId } from '@/common/utils/emcLink';
import { getSystemTheme } from '@/utils';
import { ClientOnly } from '@/common/components/ClientOnly';
import LazyImage from '@/common/components/LazyImage';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';

const DiscountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const discountId = id ?? '';
  // const ActivityComponent = getDiscountActivityComponent(discountId);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);

  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const navigate = useNavigateWithLanguage();
  const [gameInitLoading, setGameInitLoading] = useState<boolean>(true);
  const { data: discountInfo } = useDiscountinfoQuery(discountId, false, 'PC');
  const hideFavorite = isVipExclusiveActivityId(discountId);
  const { isSaved, toggleFavorite } = useDiscountFavorite(Number(discountId));

  const favoriteButton = hideFavorite ? null : (
    <button
      type="button"
      aria-label={isSaved ? '取消收藏' : '收藏'}
      className="flex h-26px w-26px items-center justify-center rounded-full border-none bg-transparent p-0"
      onClick={(e) => void toggleFavorite(e)}
    >
      <LazyImage
        src={isSaved ? `/images/${theme}/saved.png` : `/images/${theme}/unsave.png`}
        width={26}
        height={26}
      />
    </button>
  );
  const handleLogoClick = (): void => {
    navigate(PATHS.home);
  };

  return (
    <Suspense fallback={null}>
      <div className="self-center w-full h-full flex-1 flex flex-col  lg:overflow-initial ">
        <div className={styles.titleWrapper}>
          <div className={styles.title}>
            <div className={styles.logo} onClick={handleLogoClick}></div>
            {favoriteButton ? <div>{favoriteButton}</div> : null}
          </div>
        </div>
        <ClientOnly>
          <div className={styles.iframeContainer}>
            {gameInitLoading && (
              <div className={styles.gameInitLoading}>
                <img src={`/images/${theme}/loading.png`} alt="loading" />
              </div>
            )}
            <iframe src={discountInfo?.data.url} onLoad={() => setGameInitLoading(false)}></iframe>
          </div>
        </ClientOnly>
      </div>
    </Suspense>
  );
};

export default DiscountDetail;
