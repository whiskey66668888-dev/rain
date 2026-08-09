import React, { useMemo } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import { useLoginBannerQuery } from '@/apis/origin/loginBanner';
import { ClientOnly } from '@/common/components/ClientOnly';
import { useAppSelector } from '@/core/store/hooks';

import styles from './LoginBanner.module.scss';
import { getSystemTheme } from '@/utils';

export interface LoginBannerProps {
  /**
   * 是否为移动端
   */
  isMobile?: boolean;
  /**
   * 点击 banner 的回调
   */
  onBannerClick?: (item: { jumpType?: number; targetAddress?: string }) => void;
}

/**
 * 登录注册页面 Banner 轮播组件
 */
const LoginBanner: React.FC<LoginBannerProps> = ({ isMobile = false, onBannerClick }) => {
  const { data, isPending } = useLoginBannerQuery({ pid: 8, isMobile });
  const bannerData = data ?? [];
  const themeMode = useAppSelector((state) => state.config.system.themeMode);

  // 是否暗色模式
  const isDarkMode = useMemo(() => {
    if (themeMode === 'dark') {
      return true;
    }
    if (themeMode === 'light') {
      return false;
    }
    // themeMode === 'system'：getSystemTheme 返回 'light' | 'dark'，需显式比较，勿把字符串当布尔用
    return getSystemTheme() === 'dark';
  }, [themeMode]);

  // 默认静态图片（备用）
  const defaultImages = {
    mobile: '/images/common/login/banner-mobile.png',
    desktop: '/images/common/login/banner-desktop.png',
  };

  // 处理 banner 点击
  const handleBannerClick = (item: { jumpType?: number; targetAddress?: string }): void => {
    if (onBannerClick) {
      onBannerClick(item);
      return;
    }

    // 默认处理逻辑
    if (item.jumpType === 1 && item.targetAddress) {
      // 内部跳转
      window.location.href = item.targetAddress;
    } else if (item.jumpType === 2 && item.targetAddress) {
      // 外部跳转
      window.open(item.targetAddress, '_blank');
    }
  };

  // 获取图片 URL
  const getImageUrl = (item: {
    daytimeMaterialContent?: string;
    nightMaterialContent?: string;
    imageUrl?: string;
  }): string => {
    if (isDarkMode && item.nightMaterialContent) {
      return item.nightMaterialContent;
    }
    if (item.daytimeMaterialContent) {
      return item.daytimeMaterialContent;
    }
    if (item.imageUrl) {
      return item.imageUrl;
    }
    return isMobile ? defaultImages.mobile : defaultImages.desktop;
  };

  const hasApiData = bannerData.length > 0;

  // 首次请求未完成：不展示默认底图，
  if (isPending) {
    return (
      <ClientOnly>
        <div className={styles.bannerContainer} aria-busy="true" aria-label="加载中">
          <div className={styles.bannerSkeleton} />
        </div>
      </ClientOnly>
    );
  }

  // 请求结束仍无运营配置，使用默认图片
  if (!hasApiData) {
    return (
      <ClientOnly>
        <div className={styles.bannerContainer}>
          <img
            src={isMobile ? defaultImages.mobile : defaultImages.desktop}
            alt=""
            className={isMobile ? styles.bannerImageMobile : styles.bannerImageDesktop}
            onError={(e) => {
              console.error('Banner image failed to load:', e);
            }}
          />
        </div>
      </ClientOnly>
    );
  }

  // 使用 API 数据的轮播
  return (
    <ClientOnly>
      <div className={styles.bannerContainer}>
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={bannerData.length > 1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            enabled: bannerData.length > 1,
          }}
          className={styles.bannerSwiper}
        >
          {bannerData.map((item, index) => (
            <SwiperSlide key={item.bannerId || index} className={styles.bannerSlide}>
              <img
                src={getImageUrl(item)}
                alt={item.title || 'Banner'}
                className={isMobile ? styles.bannerImageMobile : styles.bannerImageDesktop}
                onClick={() => handleBannerClick(item)}
                onError={(e) => {
                  console.error('Banner image failed to load:', e);
                  // 如果图片加载失败，使用默认图片
                  const target = e.target as HTMLImageElement;
                  target.src = isMobile ? defaultImages.mobile : defaultImages.desktop;
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </ClientOnly>
  );
};

export default LoginBanner;
