import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const MinePageH5Skeleton: React.FC = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* 顶部纹理区 + 用户行 + 客服按钮 */}
        <div className={clsx(styles.mineH5Hero, 'px-12px pb-16px pt-16px')}>
          <div className="flex items-start gap-12px">
            <div className="flex min-w-0 flex-1 items-center gap-12px">
              <div className={clsx(styles.skeletonBase, 'h-52px w-52px shrink-0 rounded-full')} />
              <div className="flex min-w-0 flex-col gap-4px">
                <div className="flex items-center gap-4px">
                  <div className={clsx(styles.skeletonBase, 'h-20px w-100px rounded-6px')} />
                  <div className={clsx(styles.skeletonBase, 'h-26px w-57px rounded-6px')} />
                </div>
                <div className={clsx(styles.skeletonBase, 'h-14px w-140px rounded-6px')} />
              </div>
            </div>
            <div
              className={clsx(styles.skeletonBase, 'mt-4px h-40px w-40px shrink-0 rounded-full')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-12px bg-[var(--Background-700)] px-12px pb-28px pt-4px">
          {/* 蓝钱包 + 快捷条 */}
          <div className="flex flex-col gap-12px">
            <div className="overflow-hidden rounded-16px bg-[var(--ThemeColor-Main)]">
              <div className="flex py-[18px]">
                <div className="flex flex-1 flex-col items-center gap-8px">
                  <div
                    className={clsx(styles.skeletonBase, 'h-22px w-80px rounded-6px bg-white/30')}
                  />
                  <div
                    className={clsx(styles.skeletonBase, 'h-14px w-72px rounded-6px bg-white/25')}
                  />
                </div>
                <div className="h-52px w-px shrink-0 self-center bg-white/30" />
                <div className="flex flex-1 flex-col items-center gap-8px">
                  <div
                    className={clsx(styles.skeletonBase, 'h-22px w-80px rounded-6px bg-white/30')}
                  />
                  <div
                    className={clsx(styles.skeletonBase, 'h-14px w-72px rounded-6px bg-white/25')}
                  />
                </div>
              </div>
            </div>
            <div className="rounded-16px bg-[var(--Background-300)] px-4px py-12px">
              <div className="grid grid-cols-4">
                {[...Array(4).keys()].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-8px py-6px">
                    <div className={clsx(styles.skeletonBase, 'h-28px w-28px rounded-8px')} />
                    <div className={clsx(styles.skeletonBase, 'h-12px w-36px rounded-4px')} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 双 Banner */}
          <div className="flex flex-col gap-8px">
            <div className={clsx(styles.skeletonBase, 'h-[120px] rounded-12px')} />
            <div className={clsx(styles.skeletonBase, 'h-[56px] rounded-12px')} />
          </div>

          {/* 4x3 宫格 */}
          <div className="rounded-16px bg-[var(--Background-300)] px-8px py-16px">
            <div className="grid grid-cols-4 gap-x-4px gap-y-16px">
              {[...Array(12).keys()].map((i) => (
                <div key={i} className="flex flex-col items-center gap-8px">
                  <div className={clsx(styles.skeletonBase, 'h-48px w-48px rounded-full')} />
                  <div className={clsx(styles.skeletonBase, 'h-11px w-52px rounded-4px')} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinePageH5Skeleton;
