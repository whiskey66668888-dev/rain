import React from 'react';

import LazyImage from '@/common/components/LazyImage';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';

import styles from './index.module.scss';
import { ClientOnly } from '@/common/components/ClientOnly';

const Banner: React.FC = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  return (
    <section className={styles.heroSection}>
      <button
        className={styles.heroBanner}
        onClick={() => {
          if (!isLogin) {
            dispatch(openLoginModal());
          }
        }}
      >
        <div className={styles.heroBannerContent}>
          <div className={styles.heroBrandRow}>
            <div className={styles.heroBrand}>OP7</div>
            <span className={styles.heroDivider}></span>
            <span className={styles.heroOffer}>Promotional Offer</span>
          </div>
          <h2 className={styles.heroTitle}>专注专业/值得信赖</h2>
          <p className={styles.heroSubtitle}>Trusted Gambling Platform</p>
          <div style={{ height: '30px' }}>
            <ClientOnly>
              {isLogin ? (
                <div className={styles.heroLogos}>
                  <LazyImage
                    src="/images/common/landing/jj-icon.png"
                    alt="Juventus"
                    width={20}
                    height={20}
                    lazy={false}
                  />
                  <LazyImage
                    src="/images/common/landing/hq-icon.png"
                    alt="Globe Soccer"
                    width={20}
                    height={20}
                    lazy={false}
                  />
                  <LazyImage
                    src="/images/light/sponsor/bfk.png"
                    alt="Benfica"
                    width={20}
                    height={20}
                    lazy={false}
                  />
                </div>
              ) : (
                <div className={styles.heroButton}>立即加入</div>
              )}
            </ClientOnly>
          </div>
        </div>
        <div className={styles.heroFigure} aria-hidden="true" />
      </button>
    </section>
  );
};

export default Banner;
