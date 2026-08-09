import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import clsx from 'clsx';

import type { TNoticeListResponse } from '@/apis/origin/noticeList';
import { NOTICE_SHOW_LOCK_KEY } from '@/utils/constants/cacheKey';

import styles from './PlatformNotice.module.scss';
import CommonDialog from '../CommonDialog';

const NOTICE_ONE_DAY_COOKIE_KEY = 'noticeOneDay';

export interface PlatformNoticeProps {
  visible: boolean;
  onClose: () => void;
  noticeList: TNoticeListResponse[];
  showCheck?: boolean;
  initialSlideIndex?: number;
}

const PlatformNotice: React.FC<PlatformNoticeProps> = ({
  visible,
  onClose,
  noticeList,
  showCheck = true,
  initialSlideIndex = 0,
}) => {
  const { t } = useTranslation();
  const [dontRemind, setDontRemind] = useState(false);
  const swiperBoxsRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const clampedInitialSlide = useMemo(() => {
    if (!noticeList.length) return 0;
    return Math.min(Math.max(initialSlideIndex, 0), noticeList.length - 1);
  }, [initialSlideIndex, noticeList]);

  const handleClose = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      if (dontRemind) {
        sessionStorage.setItem(NOTICE_SHOW_LOCK_KEY, '1');
        Cookies.set(NOTICE_ONE_DAY_COOKIE_KEY, '1', { expires: 1 });
      } else {
        sessionStorage.removeItem(NOTICE_SHOW_LOCK_KEY);
      }
    } catch {
      // ignore
    }

    onClose();
  }, [dontRemind, onClose]);

  const handleSwiper = useCallback((swiperInstance: SwiperType) => {
    swiperRef.current = swiperInstance;
    const pauseAutoplay = () => swiperInstance.autoplay?.stop?.();
    const resumeAutoplay = () => swiperInstance.autoplay?.start?.();

    swiperInstance.on('touchStart', () => {
      pauseAutoplay();
      const el = swiperBoxsRef.current;
      if (!el) return;

      el.querySelectorAll('.gradient').forEach((gradient) => {
        (gradient as HTMLElement).style.display = 'block';
      });
    });

    swiperInstance.on('touchEnd', () => {
      resumeAutoplay();
      const el = swiperBoxsRef.current;
      if (!el) return;

      el.querySelectorAll('.gradient').forEach((gradient) => {
        (gradient as HTMLElement).style.display = 'none';
      });
    });
  }, []);

  useEffect(() => {
    if (!visible || !noticeList.length) return;

    const swiper = swiperRef.current;
    if (!swiper) return;

    const run = () => {
      try {
        if (noticeList.length > 1 && swiper.params.loop) {
          swiper.slideToLoop(clampedInitialSlide, 0);
        } else {
          swiper.slideTo(clampedInitialSlide, 0);
        }
      } catch {
        // ignore
      }
    };

    const id = requestAnimationFrame(() => requestAnimationFrame(run));
    return () => cancelAnimationFrame(id);
  }, [visible, clampedInitialSlide, noticeList.length]);

  if (!noticeList.length) return null;

  return (
    <CommonDialog
      visible={visible}
      onClose={handleClose}
      header={t('modals.platformNotice.title')}
      footerButtonText={t('modals.iknow')}
      onFooterButtonClick={handleClose}
      footerTigMsg={showCheck ? t('modals.dontRemind24h') : undefined}
      footerTipChecked={dontRemind}
      onFooterTipClick={showCheck ? () => setDontRemind((prev) => !prev) : undefined}
    >
      <div className={styles.swiperBoxs} ref={swiperBoxsRef}>
        <Swiper
          key={`${clampedInitialSlide}-${visible}`}
          onSwiper={handleSwiper}
          modules={[Autoplay, Pagination]}
          speed={800}
          loop={noticeList.length > 1}
          initialSlide={clampedInitialSlide}
          pagination={noticeList.length > 1}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          roundLengths
        >
          {noticeList.map((item, index) => (
            <SwiperSlide key={item.id ?? index}>
              <div className={styles.slideWrap}>
                <div className={styles.allTitle}>{item.title ?? ''}</div>
                <div className={styles.sildBox}>
                  <div className={clsx(styles.gradient, 'gradient')} />
                  <div className={styles.noticeBox}>
                    <div
                      className={styles.content}
                      dangerouslySetInnerHTML={{
                        __html: item.content ?? item.messageInfo ?? item.title ?? '',
                      }}
                    />
                  </div>
                  <div className={clsx(styles.gradient1, 'gradient')} />
                </div>
              </div>
              <div className={styles.time}>
                {(item.addTime ?? item.addTimed)
                  ? dayjs(item.addTime ?? item.addTimed).format('YYYY-MM-DD HH:mm')
                  : ''}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </CommonDialog>
  );
};

export default PlatformNotice;
