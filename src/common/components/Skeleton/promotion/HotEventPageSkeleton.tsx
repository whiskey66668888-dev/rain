import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const SkeletonBox = ({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => <div className={clsx(styles.skeletonBase, className)} style={style} />;

const HotEventPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* 顶部事件 Tab 横向滚动 */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none flex-shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'flex-shrink-0 rounded-xl p-2 flex items-center gap-2',
              'w-[140px] sm:w-[160px]',
              i === 0 ? 'border-2 border-blue-200' : '',
            )}
          >
            <div className="flex flex-col gap-1.5 flex-1">
              {/* 事件标题 */}
              <SkeletonBox className="w-full h-4 rounded" />
              {/* 时间 */}
              <SkeletonBox className="w-20 h-3 rounded" />
            </div>
            {/* 缩略图 */}
            <SkeletonBox className="w-10 h-10 rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* 主体内容区域 */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end">
        {/* 评论列表 - 靠下显示 */}
        <div className="flex flex-col gap-4 px-3 pb-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              {/* 头像 */}
              <SkeletonBox className="w-10 h-10 !rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                {/* 用户名 + 时间 + 点赞 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* 官方标签 */}
                    <SkeletonBox className="w-8 h-4 rounded" />
                    {/* 用户名 */}
                    <SkeletonBox className="w-20 h-4 rounded" />
                  </div>
                  <div className="flex items-center gap-1">
                    {/* 时间 */}
                    <SkeletonBox className="w-24 h-3 rounded" />
                    {/* 点赞 */}
                    <SkeletonBox className="w-6 h-3 rounded" />
                  </div>
                </div>
                {/* 评论内容 */}
                <SkeletonBox className="w-full h-3 rounded" />
                <SkeletonBox className="w-full h-3 rounded" />
                <SkeletonBox className="w-3/4 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="flex-shrink-0 flex items-center border-t border-gray-100 dark:border-gray-800 px-3 py-3 gap-2 ">
        <SkeletonBox className="flex-1 h-10 rounded-lg" />
        <SkeletonBox className="flex-1 h-10 rounded-lg" />
        <SkeletonBox className="flex-1 h-10 rounded-xl" />
      </div>
    </div>
  );
};

export default HotEventPageSkeleton;
