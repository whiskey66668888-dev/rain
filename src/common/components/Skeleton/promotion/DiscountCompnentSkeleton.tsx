import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const PromotionSkeleton = () => {
  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-[1200px] mx-auto">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="relative rounded-xl overflow-hidden shadow-lg">
            {/* 图片骨架 */}
            <div
              className={clsx(styles.skeletonBase, 'relative w-full')}
              style={{ aspectRatio: '5/2' }}
            >
              {/* 可选：添加渐变效果 */}
              <div
                className={clsx(
                  styles.skeletonBase,
                  'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
                )}
              />
            </div>

            {/* 底部信息栏 */}
            <div className="h-[35px] px-5 flex items-center justify-between border-t border-gray-100">
              {/* 左侧 */}
              <div className="flex items-center gap-2">
                <div className={clsx(styles.skeletonBase, 'w-16 h-3  rounded')} />
                <div className={clsx(styles.skeletonBase, 'w-24 h-3  rounded')} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionSkeleton;
