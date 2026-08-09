/**
 * 充值骨架屏组件
 */
import React from 'react';
import clsx from 'clsx';
// styles
import styles from '../Skeleton.module.scss';

const MainListSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="grid grid-cols-2 gap-[12px]">
        <div className={clsx(styles.skeletonBase, 'h-[56px] flex-1 rounded-[12px]')}></div>
        <div className={clsx(styles.skeletonBase, 'h-[56px] flex-1 rounded-[12px]')}></div>
      </div>

      <div className={clsx(styles.skeletonBase, 'h-[124px] rounded-[12px]')}></div>

      <div className={clsx(styles.skeletonBase, 'h-[246px] rounded-[12px]')}></div>

      <div className={clsx(styles.skeletonBase, 'h-[160px] rounded-[12px]')}></div>
    </div>
  );
};

export default MainListSkeleton;
