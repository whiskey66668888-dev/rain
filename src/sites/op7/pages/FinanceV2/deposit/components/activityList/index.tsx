import React from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { ActiveItemV2 } from '@/apis/origin/finance/depositV2';
import { useOpenDiscountActivity } from '@/common/hooks/useOpenDiscountActivity';

import styles from './index.module.scss';

interface ActivityListProps {
  list: ActiveItemV2[];
  tutorial?: React.ReactNode;
  carousel?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ list, tutorial, carousel = false }) => {
  const { openDiscountDetail } = useOpenDiscountActivity();

  if (list.length === 0 && !tutorial) return null;

  if (carousel) {
    const items = [
      ...(tutorial ? [{ type: 'tutorial' as const, node: tutorial }] : []),
      ...list.map((item) => ({ type: 'activity' as const, item })),
    ];

    return (
      <div className={styles.carouselWrap}>
        <Swiper
          className={styles.carousel}
          modules={[Autoplay]}
          slidesPerView={1}
          spaceBetween={0}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={items.length > 1}
        >
          {items.map((item) => (
            <SwiperSlide
              key={item.type === 'tutorial' ? 'tutorial' : item.item.id}
              className={styles.slide}
            >
              {item.type === 'tutorial' ? (
                item.node
              ) : (
                <button
                  type="button"
                  className={styles.activityButton}
                  onClick={() => openDiscountDetail(item.item.id)}
                >
                  <img src={item.item.image} alt="" className={styles.carouselImage} />
                </button>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <div className={styles.activityList}>
      {list.map((item) => (
        <button
          type="button"
          key={item.id}
          className={styles.activityButton}
          onClick={() => openDiscountDetail(item.id)}
        >
          <img src={item.image} alt="" />
        </button>
      ))}
    </div>
  );
};

export default ActivityList;
