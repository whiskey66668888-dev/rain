/**
 * 会员互转骨架屏
 */
import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const MemberTransferPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1200px] flex flex-col gap-[8px]">
      <div className={clsx(styles.skeletonBase, 'h-[44px] lg:hidden')}></div>
      <div className="px-[12px] flex flex-col gap-[12px]">
        <div className={clsx(styles.skeletonBase, 'h-[54px] rounded-[12px]')}></div>
        <div className={clsx(styles.skeletonBase, 'h-[192px] rounded-[12px]')}></div>
        <div className={clsx(styles.skeletonBase, 'h-[44px] rounded-[12px]')}></div>
        <div className={clsx(styles.skeletonBase, 'h-[120px]')}></div>
      </div>
    </div>
  );
};

export default MemberTransferPageSkeleton;
