import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

/**
 * 安全中心主内容区骨架。
 */
const SecurityCenterSkeleton: React.FC = () => {
  return (
    <div className="min-h-full w-full bg-[var(--Background-700)]">
      <div className="mx-auto flex min-h-full w-full max-w-full flex-col lg:max-w-[1200px] lg:min-h-0">
        {/* H5 顶栏占位 */}
        <div className="flex h-[44px] items-center justify-between px-[16px] lg:hidden">
          <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[12px]')} />
          <div className="h-[24px] w-[24px]" />
        </div>

        <div className="flex flex-col gap-[12px] p-[12px] pb-[20px] lg:gap-[16px] lg:px-0 lg:pb-[24px]">
          <div className="flex items-start justify-between gap-[12px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
              <div
                className={clsx(
                  styles.skeletonBase,
                  'h-[28px] w-[160px] rounded-[12px] lg:h-[28px] lg:w-[280px]',
                )}
              />
              <div className="flex flex-wrap gap-[12px]">
                <div
                  className={clsx(
                    styles.skeletonBase,
                    'h-[32px] w-[100px] rounded-full lg:h-[32px] lg:w-[132px]',
                  )}
                />
                <div
                  className={clsx(
                    styles.skeletonBase,
                    'h-[32px] w-[100px] rounded-full lg:h-[32px] lg:w-[132px]',
                  )}
                />
              </div>
            </div>
            <div
              className={clsx(
                styles.skeletonBase,
                'h-[83px] w-[83px] flex-shrink-0 rounded-full lg:h-[90px] lg:w-[90px]',
              )}
            />
          </div>

          <div className="box-border flex min-h-[64px] w-full max-w-full items-center justify-between rounded-[12px] bg-[var(--Background-300)] px-[14px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[8px] pr-[12px]">
              <div
                className={clsx(
                  styles.skeletonBase,
                  'h-[16px] w-[min(100%,200px)] rounded-[12px] lg:h-[18px] lg:w-[240px]',
                )}
              />
              <div
                className={clsx(
                  styles.skeletonBase,
                  'h-[12px] w-[min(100%,160px)] rounded-[12px] lg:h-[14px] lg:w-[200px]',
                )}
              />
            </div>
            <div
              className={clsx(styles.skeletonBase, 'h-[46px] w-[46px] flex-shrink-0 rounded-full')}
            />
          </div>

          <div className="flex flex-col gap-[24px] rounded-t-[16px] bg-[var(--Background-300)] p-[12px] pt-[16px] lg:rounded-[16px] lg:p-[24px] lg:pt-[24px]">
            <div className="flex items-center gap-[8px]">
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[20px] rounded-[12px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[88px] rounded-[12px]')} />
            </div>
            <div className="flex flex-wrap gap-[12px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex min-h-[64px] min-w-[140px] w-[calc(50%-6px)] items-center justify-between rounded-[12px] bg-[var(--Line-100)] p-[12px] lg:min-h-[64px]"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                    <div
                      className={clsx(styles.skeletonBase, 'h-[16px] w-[90px] rounded-[12px]')}
                    />
                    <div
                      className={clsx(styles.skeletonBase, 'h-[14px] w-[48px] rounded-[12px]')}
                    />
                  </div>
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      'h-[24px] w-[24px] flex-shrink-0 rounded-[12px]',
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="mt-[12px] flex items-center gap-[8px] lg:mt-[16px]">
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[20px] rounded-[12px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[88px] rounded-[12px]')} />
            </div>
            <div className="flex flex-wrap gap-[12px]">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex min-h-[64px] min-w-[140px] w-[calc(50%-6px)] items-center justify-between rounded-[12px] bg-[var(--Line-100)] p-[12px] lg:min-h-[64px]"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                    <div
                      className={clsx(styles.skeletonBase, 'h-[16px] w-[100px] rounded-[12px]')}
                    />
                    <div
                      className={clsx(styles.skeletonBase, 'h-[14px] w-[56px] rounded-[12px]')}
                    />
                  </div>
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      'h-[24px] w-[24px] flex-shrink-0 rounded-[12px]',
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-[24px]">
            <div className={clsx(styles.skeletonBase, 'h-[14px] w-[120px] rounded-[12px]')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenterSkeleton;
