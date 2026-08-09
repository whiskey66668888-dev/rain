import React from 'react';
import clsx from 'clsx';
import styles from './Skeleton.module.scss';

/**
 * 帮助中心搜索页骨架屏
 * 对应 help_center/search 路由
 */
const HelpCenterSearchPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-full w-full bg-[var(--Background-700)]">
      {/* 搜索头部 */}
      <div className="flex h-[56px] items-center gap-[10px] px-[12px]">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className="flex-1">
          <div className={clsx(styles.skeletonBase, 'h-[36px] w-full rounded-[18px]')} />
        </div>
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[36px] rounded-[8px]')} />
      </div>

      {/* 搜索结果列表 */}
      <div className="px-[12px] pb-[12px]">
        <div className="rounded-[12px] bg-[var(--Background-300)] p-[12px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-[10px]">
              <div className={clsx(styles.skeletonBase, 'h-[18px] w-[78%] rounded-[8px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[14px] w-[14px] rounded-[6px]')} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpCenterSearchPageSkeleton;
