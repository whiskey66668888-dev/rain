import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const TransactionRecordPageSkeleton: React.FC = () => {
  return (
    <>
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="flex-1 flex flex-col gap-[12px] overflow-hidden p-[12px] lg:p-0">
        {/* 类型 + 日期筛选器 */}
        <div className="flex shrink-0 items-center gap-[12px]">
          <div className={clsx(styles.skeletonBase, 'flex-1 h-[32px] rounded-full')} />
          <div className={clsx(styles.skeletonBase, 'flex-1 h-[32px] rounded-full')} />
        </div>

        {/* 列表区域 */}
        <div className="flex flex-1 flex-col gap-[12px] rounded-[8px] bg-[var(--Background-300)] p-[12px]">
          {[...Array(5).keys()].map((i) => (
            <div key={i} className={clsx(styles.skeletonBase, 'h-[56px] w-full rounded-[8px]')} />
          ))}
        </div>
      </div>
    </>
  );
};

export default TransactionRecordPageSkeleton;
