import clsx from 'clsx';
import Skeleton from '@common/components/Skeleton';
import styles from './content.module.scss';

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderMain}>
          <div className={clsx(styles.cardBadgeOff, '!p-0')}>
            <Skeleton type="base" baseClassName="w-full h-full rounded-6px" />
          </div>
          <div className={styles.cardTextGroup}>
            <div className={styles.cardTitle}>
              <Skeleton type="base" baseClassName="w-180px h-14px rounded-6px" />
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.cardMetaText}>
                <Skeleton type="base" baseClassName="w-120px h-12px rounded-6px" />
              </div>
              <div>
                <Skeleton type="base" baseClassName="w-140px h-12px rounded-6px" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardAmount}>
          <Skeleton type="base" baseClassName="w-72px h-18px rounded-6px" />
        </div>
      </div>

      <div className={styles.cardDivider} />

      <div className={styles.cardFooter}>
        <div className={styles.cardExpire}>
          <Skeleton type="base" baseClassName="w-140px h-12px rounded-6px" />
        </div>
        <div className={styles.cardBtn}>
          <Skeleton type="base" baseClassName="w-full h-full rounded-6px" />
        </div>
      </div>
    </div>
  );
}
