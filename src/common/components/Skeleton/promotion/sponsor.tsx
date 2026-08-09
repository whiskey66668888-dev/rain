import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

/**
 * 赞助页面骨架屏
 */
const SponsorSkeleton = () => {
  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-[1200px] mx-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="relative rounded-xl overflow-hidden bg-[var(--Background-300)] shadow-lg"
          >
            {/* 图片骨架 - 赞助页面尺寸 */}
            <div
              className={clsx(
                styles.skeletonBase,
                'relative w-full h-[179px] sm:h-[190px] md:h-[230px] lg:h-[260px] bg-[var(--Background-300)]',
              )}
            >
              {/* 可选：添加渐变光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300/50 to-gray-200/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorSkeleton;
