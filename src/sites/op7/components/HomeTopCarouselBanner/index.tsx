import React from 'react';
import clsx from 'clsx';

import Banner from '@/common/components/Banner';
import { ClientOnly } from '@/common/components/ClientOnly';
import LazyImage from '@/common/components/LazyImage';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import skeletonStyles from '@/common/components/Skeleton/Skeleton.module.scss';
import { CarouselItem, PidType, useCarouselResQuery } from '@/apis/origin/carouselRes';
import { getSystemTheme } from '@/utils';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { openLoginModal } from '@/core/store/slices/authUISlice';

interface HomeTopCarouselBannerProps {
  className?: string;
}

const HomeTopCarouselBanner: React.FC<HomeTopCarouselBannerProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const navigate = useNavigateWithLanguage();
  const { data: bannerList = [], isLoading } = useCarouselResQuery({
    pid: PidType.Home,
    isMobile: true,
  });
  const skeletonItems = Array.from({ length: 4 }).map((_, index) => (
    <div
      key={index}
      className={clsx(skeletonStyles.skeletonBase, 'w-full h-full object-cover rounded-8px')}
    />
  ));
  const handleBannerClick = (banner: CarouselItem) => {
    const target = isMobile ? banner.appTargetAddress : banner.webTargetAddress;
    if (banner.jumpType === 0) return;

    if (banner.jumpType === 1) {
      if (!isLogin) {
        dispatch(openLoginModal());
        return;
      }

      if (!target) return;
      if (isMobile) {
        navigate(target);
      } else {
        window.open(generatePath(target), '_blank');
      }
      return;
    }

    if (banner.jumpType === 2) {
      if (!target) return;
      window.open(target);
    }
  };
  return (
    <Banner
      items={
        isLoading
          ? skeletonItems
          : bannerList.map((banner) => (
              <ClientOnly
                key={banner.id}
                fallback={
                  <div
                    className={clsx(
                      skeletonStyles.skeletonBase,
                      'w-full h-full object-cover rounded-8px',
                    )}
                  />
                }
              >
                <LazyImage
                  src={
                    theme === 'light' ? banner.daytimeMaterialContent : banner.nightMaterialContent
                  }
                  alt={banner.resourceName}
                  className="w-full h-full object-cover rounded-8px"
                  onClick={() => {
                    handleBannerClick(banner);
                  }}
                  // lazy={index !== 0}
                  placeholder={
                    <img
                      src={`/images/${theme}/discount_lazy_new.png`}
                      className="w-full h-full object-cover rounded-8px"
                    ></img>
                  }
                />
              </ClientOnly>
            ))
      }
      itemWidth={351}
      gap={12}
      autoplayInterval={5000}
      showDots={false}
      className={clsx('aspect-ratio-[374/186]', className)}
    />
  );
};

export default HomeTopCarouselBanner;
