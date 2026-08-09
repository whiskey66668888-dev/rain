import React from 'react';
import clsx from 'clsx';
import styles from './ChatSkeleton.module.scss';
import skeletonStyles from '@/common/components/Skeleton/Skeleton.module.scss';

interface ChatSkeletonProps {
  rows?: number;
}

const ChatSkeleton: React.FC<ChatSkeletonProps> = ({ rows = 8 }) => {
  return (
    <div className={styles.wrapper}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className={styles.row}>
          <div className={clsx(skeletonStyles.skeletonBase, styles.avatar)} />
          <div className={styles.content}>
            <div className={clsx(skeletonStyles.skeletonBase, styles.line, styles.short)} />
            <div className={clsx(skeletonStyles.skeletonBase, styles.line)} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSkeleton;
