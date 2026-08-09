import React from 'react';
import styles from '../Skeleton.module.scss';

const SkeletonBox = ({ className = '' }: { className?: string }) => (
  <div className={`${styles.skeletonBase} ${className}`} />
);

const VipPageSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col gap-4 p-4 max-w-[1200px] mx-auto w-full"
      style={{ background: 'var(--Background-300)' }}
    >
      {/* 用户信息区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <SkeletonBox className="w-12 h-12 !rounded-full flex-shrink-0" />
          <div className="flex flex-col gap-2">
            {/* 用户名 */}
            <SkeletonBox className="w-30 h-4" />
            {/* 加入时间 */}
            <SkeletonBox className="w-20 h-3" />
          </div>
        </div>
        {/* VIP 等级标签 */}
        <SkeletonBox className="w-14 h-6 !rounded-full" />
      </div>

      {/* 流水数据区域 */}
      <div className="flex gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col gap-2 p-3 rounded-lg"
            style={{ background: 'var(--Background-600)' }}
          >
            <SkeletonBox className="w-20 h-3" />
            <SkeletonBox className="w-28 h-6" />
          </div>
        ))}
      </div>

      {/* 进度条 */}
      <div className="flex flex-col gap-2">
        <SkeletonBox className="w-full h-2" />
        <div className="flex justify-between">
          <SkeletonBox className="w-36 h-3" />
          <SkeletonBox className="w-28 h-3" />
        </div>
      </div>

      {/* VIP 等级 Tab */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBox key={i} className="w-12 h-7 !rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* VIP 等级详情卡片（横向滚动） */}
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[180px] flex-shrink-0 flex flex-col gap-3 p-4 rounded-xl"
            style={{ background: 'var(--Background-600)' }}
          >
            {/* VIP 标题 + 徽章 */}
            <div className="flex items-center justify-between">
              <SkeletonBox className="w-20 h-9" />
              <SkeletonBox className="w-14 h-14 !rounded-full" />
            </div>
            {/* 进度条 */}
            <SkeletonBox className="w-full h-1.5" />
            {/* 数据 */}
            <div className="flex justify-between">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-1.5">
                  <SkeletonBox className="w-10 h-3" />
                  <SkeletonBox className="w-14 h-4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 升级按钮 */}
      <SkeletonBox className="w-full h-11 !rounded-lg" />

      {/* VIP 尊享 */}
      <div className="flex flex-col gap-3">
        <SkeletonBox className="w-20 h-5" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <SkeletonBox className="w-8 h-8 !rounded-full" />
              <SkeletonBox className="w-16 h-4" />
              <SkeletonBox className="w-12 h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* VIP 晋级优惠 */}
      <div className="flex flex-col gap-3">
        <SkeletonBox className="w-24 h-5" />
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <SkeletonBox className="w-12 h-5" />
              <SkeletonBox className="w-14 h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* VIP 详情按钮 */}
      <SkeletonBox className="w-full h-11 !rounded-lg" />
    </div>
  );
};

export default VipPageSkeleton;
