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
    <div className="w-full min-h-screen bg-[var(--Background-700)]">
      <div className="flex h-[88px] items-center justify-center bg-[var(--Background-300)]">
        {['w-[32px]', 'w-[44px]', 'w-[56px]'].map((widthClass, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <div className="mx-16px h-[14px] w-px bg-[var(--Line-200)]" />}
            <div className="relative flex h-[32px] items-center justify-center">
              <div
                className={clsx(
                  styles.skeletonBase,
                  'h-[14px] rounded',
                  index === 0 ? 'bg-[var(--ThemeColor-Main)] opacity-30' : '',
                  widthClass,
                )}
              />
              {index === 0 && (
                <div className="absolute bottom-[-5px] left-1/2 h-[2px] w-[28px] -translate-x-1/2 rounded bg-[var(--ThemeColor-Main)] opacity-30" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 二级 Tabs 骨架 */}
      {showSubTabs && (
        <div className="border-b border-[var(--Line-100)] bg-[var(--Background-300)]">
          <div className="mx-auto flex max-w-[1052px] gap-8px overflow-x-auto px-12px py-10px">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className={clsx(
                  styles.skeletonBase,
                  'h-[28px] w-[68px] flex-shrink-0 rounded-full',
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* 卡片列表骨架 */}
      <div className="w-full px-12px py-10px lg:px-12px lg:py-14px">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10px md:grid-cols-2 lg:gap-16px">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-[10px] bg-[var(--Background-300)] shadow-[0_6px_10px_rgba(0,0,0,0.05)]"
            >
              {/* 图片骨架 */}
              <div
                className={clsx(
                  styles.skeletonBase,
                  'relative aspect-[351/179] w-full lg:h-[209px] lg:aspect-auto',
                )}
              />

              {/* 底部信息栏 */}
              {showSubTabs && (
                <div className="flex h-[35px] items-center justify-between border-t border-[var(--Line-100)] px-12px">
                  {/* 左侧：时间 */}
                  <div className="flex items-center gap-8px">
                    <div className={clsx(styles.skeletonBase, 'h-12px w-64px rounded')} />
                    <div className={clsx(styles.skeletonBase, 'h-12px w-88px rounded')} />
                  </div>

                  {/* 右侧：查看详情 */}
                  <div className="flex items-center gap-6px">
                    <div className={clsx(styles.skeletonBase, 'h-12px w-48px rounded')} />
                    <div className={clsx(styles.skeletonBase, 'h-12px w-12px rounded-full')} />
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
