/**
 * 充值骨架屏组件
 */
import React from 'react';
import MainListSkeleton from './MainListSkeleton';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const DepositPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1200px] p-[12px] flex flex-col gap-[12px]">
      <div className={clsx(styles.skeletonBase, 'h-[40px] rounded-[12px] lg:hidden')}></div>
      <div className={clsx(styles.skeletonBase, 'h-[54px] rounded-[12px] lg:hidden')}></div>
      <MainListSkeleton />
    </div>
  );
};

export default DepositPageSkeleton;
