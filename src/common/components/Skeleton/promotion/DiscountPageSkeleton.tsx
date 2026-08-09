import clsx from 'clsx';
import styles from '../Skeleton.module.scss';
interface Props {
  showSubTabs: boolean;
}
/**
 * 优惠页面完整骨架屏（包含 Tabs + 卡片列表）
 */
const PromotionPageSkeleton = ({ showSubTabs }: Props) => {
  return (
    <div className="w-full min-h-screen">
      {/* 二级 Tabs 骨架 */}
      {showSubTabs && (
        <div className=" border-b border-gray-200">
          <div className="max-w-[1052px] mx-auto px-4 py-4 flex gap-4 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className={clsx(styles.skeletonBase, 'h-8 w-16  rounded-full flex-shrink-0')}
              />
            ))}
          </div>
        </div>
      )}

      {/* 卡片列表骨架 */}
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-[1200px] mx-auto">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden  shadow-lg">
              {/* 图片骨架 */}
              <div
                className={clsx(
                  styles.skeletonBase,
                  'relative w-full h-[141px] sm:h-[150px] md:h-[185px] lg:h-[209px] ',
                )}
              />

              {/* 底部信息栏 */}
              {showSubTabs && (
                <div className="h-[35px] px-5  flex items-center justify-between border-t border-gray-100">
                  {/* 左侧：时间 */}
                  <div className="flex items-center gap-2">
                    <div className={clsx(styles.skeletonBase, 'w-16 h-3  rounded')} />
                    <div className={clsx(styles.skeletonBase, 'w-24 h-3  rounded')} />
                  </div>

                  {/* 右侧：查看详情 */}
                  <div className="flex items-center gap-1.5">
                    <div className={clsx(styles.skeletonBase, 'w-12 h-3  rounded')} />
                    <div className={clsx(styles.skeletonBase, 'w-3 h-3  rounded-full')} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionPageSkeleton;
