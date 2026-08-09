import Skeleton from '@/common/components/Skeleton';
import styles from './list.module.scss';

export default function SkeletonCard() {
  return (
    <div className={styles.row}>
      <div className={styles.leftIconWrap}>
        <Skeleton type="base" baseClassName="w-24px h-24px !rounded-full" />
      </div>
      <div className={styles.rowMain}>
        <div className={styles.leftText}>
          <div className={styles.nameRow}>
            <Skeleton type="base" baseClassName="w-88px h-14px rounded-6px" />
          </div>
          <Skeleton type="base" baseClassName="w-120px h-12px rounded-6px" />
        </div>

        <div className={styles.rightText}>
          <Skeleton type="base" baseClassName="w-56px h-14px rounded-6px" />
          <Skeleton type="base" baseClassName="w-48px h-12px rounded-6px" />
        </div>
      </div>
    </div>
  );
}
