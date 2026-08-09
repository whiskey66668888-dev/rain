import React from 'react';
import clsx from 'clsx';
import styles from './Skeleton.module.scss';

const AllBettingRecordPageSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1-col-hidden lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="shrink-0 flex flex-col gap-[12px] p-[12px]">
        {/* 日期选择器 */}
        <div className={clsx(styles.skeletonBase, 'h-[32px] w-[160px] rounded-full')} />

        {/* 统计数字行 */}
        <div className="flex gap-[20px]">
          {[...Array(4).keys()].map((i) => (
            <div key={i} className={clsx(styles.skeletonBase, 'h-[16px] w-[72px] rounded-[6px]')} />
          ))}
        </div>
      </div>

      {/* 游戏卡片列表 */}
      <div className="flex flex-col gap-[12px] p-[12px] pt-0">
        {[...Array(4).keys()].map((i) => (
          <div key={i} className={clsx(styles.skeletonBase, 'h-[112px] w-full rounded-[12px]')} />
        ))}
      </div>
    </div>
  );
};

export default AllBettingRecordPageSkeleton;
