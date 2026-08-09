import React from 'react';
import clsx from 'clsx';
import styles from './Skeleton.module.scss';

/**
 * 帮助中心页骨架屏
 * 对应 help_center 路由
 */
const HelpCenterPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-full w-full bg-[var(--Background-700)]">
      {/* 顶栏占位 */}
      <div className="flex h-[44px] items-center justify-between px-[12px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[88px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
      </div>

      <div className="flex flex-col gap-[12px] p-[12px]">
        {/* 自助工具卡片 */}
        <div className="rounded-[12px] bg-[var(--Background-300)] p-[12px]">
          <div className={clsx(styles.skeletonBase, 'mb-[14px] h-[24px] w-[96px] rounded-[8px]')} />
          <div className="grid grid-cols-4 gap-[12px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-[8px]">
                <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-full')} />
                <div className={clsx(styles.skeletonBase, 'h-[14px] w-[56px] rounded-[8px]')} />
              </div>
            ))}
          </div>
        </div>

        {/* 猜你想问内容卡片 */}
        <div className="rounded-[12px] bg-[var(--Background-300)] p-[12px]">
          <div className={clsx(styles.skeletonBase, 'mb-[14px] h-[24px] w-[96px] rounded-[8px]')} />

          <div className="mb-[14px] flex gap-[8px] overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={clsx(styles.skeletonBase, 'h-[32px] w-[78px] rounded-full')}
              />
            ))}
          </div>

          <div className="flex flex-col gap-[10px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-[6px]">
                <div className={clsx(styles.skeletonBase, 'h-[18px] w-[72%] rounded-[8px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[14px] w-[14px] rounded-[6px]')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPageSkeleton;
