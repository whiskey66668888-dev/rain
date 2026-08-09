import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import styles from './Banner.module.scss';
import clsx from 'clsx';

export interface BannerProps {
  /**
   * Banner 内容
   */
  items: React.ReactNode[];
  /**
   * 每个 item 的宽度（px）
   */
  itemWidth: number;
  /**
   * 每个 item 的高度（px）
   */
  itemHeight?: number;
  /**
   * item 之间的间隔（px）
   * @default 10
   */
  gap?: number;
  /**
   * 自动播放间隔（ms），0 表示不自动播放
   * @default 3000
   */
  autoplayInterval?: number;
  /**
   * 是否显示指示器
   * @default true
   */
  showDots?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
  /** 手机模式下之展示1张 */
  isMobileOnlyOne?: boolean;
}

/**
 * Banner 轮播组件
 */
export const Banner: React.FC<BannerProps> = ({
  items,
  itemWidth,
  itemHeight,
  gap = 10,
  autoplayInterval = 3000,
  showDots = true,
  className = '',
  isMobileOnlyOne = true,
}) => {
  const swiperRef = useRef<SwiperRef | null>(null);
  // 在ssr初始化时需要添加间隙，避免样式闪烁
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    setIsInit(false);
    // const handleResize = (): void => {
    //   if (swiperRef.current) {
    //     swiperRef.current.swiper.updateSlides();
    //   }
    // };
    // window.addEventListener('resize', handleResize);
    return () => {
      //   window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePrev = useCallback(() => {
    swiperRef.current?.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.swiper.slideNext();
  }, []);

  if (items.length === 0) {
    return null;
  }

  const canNavigate = items.length > 1;

  return (
    <div className={`${styles.banner} ${className} ${isMobileOnlyOne ? styles.mobileOnlyOne : ''}`}>
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={gap}
        slidesPerView="auto"
        loop={canNavigate}
        autoplay={
          autoplayInterval > 0
            ? {
                delay: autoplayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={
          showDots && canNavigate
            ? {
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} ${styles.customPagination}"></span>`;
                },
              }
            : false
        }
        className={styles.bannerSwiper}
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={index}
            className={clsx(
              styles.bannerSlide,
              {
                'mr-10px': isInit,
              },
              isMobileOnlyOne ? styles.mobileOnlyOne : '',
            )}
            style={{
              width: `${itemWidth}px`,
              height: itemHeight ? `${itemHeight}px` : 'auto',
            }}
          >
            {item}
          </SwiperSlide>
        ))}
      </Swiper>

      {canNavigate && (
        <>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowPrev}`}
            onClick={handlePrev}
            aria-label="上一张"
          >
            <img src="/images/common/glass_arrow.png" alt="" className={styles.arrowImg} />
          </button>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowNext}`}
            onClick={handleNext}
            aria-label="下一张"
          >
            <img src="/images/common/glass_arrow.png" alt="" className={styles.arrowImg} />
          </button>
        </>
      )}
    </div>
  );
};

export default Banner;
