import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const DELAY_CLASSES = [
  styles.delay1,
  styles.delay2,
  styles.delay3,
  styles.delay4,
  styles.delay5,
] as const;

/**
 * 福利中心骨架屏
 */
const WelfareCenterSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏：返回 / 标题 / 右侧状态 + 箭头（PC 默认隐藏，与 H5Header pcHidden 一致） */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[96px] rounded-[12px]')} />
        <div className="flex items-center gap-[4px]">
          <div className={clsx(styles.skeletonBase, 'h-[20px] w-[48px] rounded-[8px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
        </div>
      </div>

      <div className="mt-2 w-full text-sm text-[var(--text-800)]">
        {/* PC：状态 Tab（与 index.module.scss .statusGroup 一致） */}
        <div className="mb-0 hidden w-full rounded-[100px] bg-[var(--background-100)] p-[2px] lg:inline-flex">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-1 justify-center px-[16px] py-[8px]">
              <div
                className={clsx(
                  styles.skeletonBase,
                  DELAY_CLASSES[(i - 1) % 5],
                  'h-[20px] w-[48px] rounded-[8px]',
                )}
              />
            </div>
          ))}
        </div>

        {/* Content.wrap：移动端左右 12px 内边距 */}
        <div className="flex flex-col gap-[12px] px-[12px] pb-[20px] pt-[12px] lg:px-0">
          {/* 实时返水 banner */}
          <div className="flex w-full items-center gap-[10px] rounded-[12px] bg-[var(--theme-main)] px-[16px] py-[12px]">
            <div
              className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] shrink-0 rounded-[8px]')}
            />
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[72px] rounded-[8px]')} />
            <div className="ml-auto flex items-center gap-[8px]">
              <div className={clsx(styles.skeletonBase, 'h-[8px] w-[8px] rounded-full')} />
              <div
                className={clsx(styles.skeletonBase, 'h-[14px] w-[14px] shrink-0 rounded-full')}
              />
            </div>
          </div>

          {/* stats：移动端日期筛选 pill + PC Tabs；右侧笔数 / 总金额 */}
          <div className="flex w-full flex-nowrap items-center justify-between gap-[16px]">
            <div
              className={clsx(
                'flex shrink-0 items-center rounded-[32px] bg-[var(--background-100)] px-[12px] py-[6px] lg:hidden',
              )}
            >
              <div
                className={clsx(styles.skeletonBase, 'mr-[8px] h-[20px] w-[56px] rounded-[8px]')}
              />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
            </div>
            <div
              className={clsx(
                'hidden max-h-[36px] min-w-0 flex-1 items-center gap-[2px] overflow-x-auto rounded-[50px] bg-[var(--background-100)] p-[2px] lg:flex',
              )}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={clsx(styles.skeletonBase, 'h-[32px] w-[72px] shrink-0 rounded-[16px]')}
                />
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-[12px]">
              <div className="flex items-center gap-[4px]">
                <div className={clsx(styles.skeletonBase, 'h-[20px] w-[28px] rounded-[8px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[20px] w-[32px] rounded-[8px]')} />
              </div>
              <div className="flex items-center gap-[4px]">
                <div className={clsx(styles.skeletonBase, 'h-[20px] w-[40px] rounded-[8px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[20px] w-[56px] rounded-[8px]')} />
              </div>
            </div>
          </div>

          {/* 卡片列表（与 Content 内 SkeletonCard 数量、结构一致） */}
          <div className="flex w-full flex-col gap-[12px]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex w-full flex-col gap-[10px] rounded-[12px] bg-[var(--background-100)] p-[12px]"
              >
                <div className="flex w-full items-end justify-between gap-[8px]">
                  <div className="flex min-w-0 items-center gap-[12px]">
                    <div
                      className={clsx(
                        styles.skeletonBase,
                        DELAY_CLASSES[i % 5],
                        'h-[56px] w-[56px] shrink-0 rounded-[12px]',
                      )}
                    />
                    <div className="flex min-w-0 flex-col gap-[4px]">
                      <div
                        className={clsx(
                          styles.skeletonBase,
                          'h-[14px] w-[180px] max-w-[55vw] rounded-[6px]',
                        )}
                      />
                      <div
                        className={clsx(styles.skeletonBase, 'h-[12px] w-[120px] rounded-[6px]')}
                      />
                      <div
                        className={clsx(styles.skeletonBase, 'h-[12px] w-[140px] rounded-[6px]')}
                      />
                    </div>
                  </div>
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      'h-[18px] w-[72px] shrink-0 rounded-[6px]',
                    )}
                  />
                </div>
                <div className="h-[0.5px] w-full bg-[var(--line-100)]" />
                <div className="flex w-full items-center justify-between gap-[8px]">
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      'h-[12px] w-[140px] max-w-[50%] rounded-[6px]',
                    )}
                  />
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      'h-[24px] w-[80px] shrink-0 rounded-[100px]',
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelfareCenterSkeleton;
