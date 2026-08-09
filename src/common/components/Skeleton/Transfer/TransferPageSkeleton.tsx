/**
 * 转账骨架屏
 */
import React from 'react';
import MainListSkeleton from './MainListSkeleton';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const TransferPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1200px] flex flex-col gap-[12px]">
      <div className={clsx(styles.skeletonBase, 'h-[60px] rounded-[12px]')}></div>
      <div className={clsx(styles.skeletonBase, 'h-[54px] rounded-[12px]')}></div>
      <MainListSkeleton />

      <div className="px-[12px] flex flex-col gap-[12px]">
        <div className={clsx(styles.skeletonBase, 'h-[96px] rounded-[12px]')}></div>

        <div className={clsx(styles.skeletonBase, 'h-[68px] rounded-[12px]')}></div>

        <div className={clsx(styles.skeletonBase, 'h-[44px] rounded-[12px]')}></div>
      </div>
    </div>
  );
};

export default TransferPageSkeleton;
