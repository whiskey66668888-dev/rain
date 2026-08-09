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
 * 实时返水记录骨架屏
 * 对齐 RealtimeRebatePage/RecordPage：H5Header -> 状态 Tabs -> 时间筛选/统计 -> 列表 -> 加载更多
 */
const RealtimeRebateRecordSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[88px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="text-sm text-[var(--Text-800)]">
        <div className="px-[12px] pb-[20px] pt-[12px]">
          {/* 顶部状态 Tabs */}
          <div className="mb-[12px] flex items-center gap-[8px]">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={clsx(
                  styles.skeletonBase,
                  DELAY_CLASSES[(i - 1) % 5],
                  'h-[36px] w-[84px] rounded-[18px]',
                )}
              />
            ))}
          </div>

          {/* 筛选 + 统计 */}
          <div className="mb-[12px] flex items-center justify-between gap-[12px]">
            <div className="flex shrink-0 items-center rounded-[32px] bg-[var(--Background-100)] px-[12px] py-[6px] lg:hidden">
              <div
                className={clsx(styles.skeletonBase, 'mr-[8px] h-[20px] w-[56px] rounded-[8px]')}
              />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
            </div>

            <div className="hidden max-h-[36px] min-w-0 flex-1 items-center gap-[2px] overflow-x-auto rounded-[50px] bg-[var(--Background-100)] p-[2px] lg:flex">
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

          {/* 列表容器（对应 List hideTitle + radius） */}
          <div className="flex w-full flex-col gap-[12px] rounded-[16px] bg-[var(--Background-300)] px-[12px] pb-[20px] pt-[12px]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="inline-flex h-[48px] w-full items-center gap-[12px]">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[var(--Line-100)]">
                  <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-full')} />
                </div>

                <div className="flex flex-1 items-center justify-between">
                  <div className="inline-flex flex-col items-start justify-center gap-[2px]">
                    <div
                      className={clsx(
                        styles.skeletonBase,
                        DELAY_CLASSES[(i + 1) % 5],
                        'h-[14px] w-[88px] rounded-[6px]',
                      )}
                    />
                    <div
                      className={clsx(styles.skeletonBase, 'h-[12px] w-[120px] rounded-[6px]')}
                    />
                  </div>

                  <div className="inline-flex flex-col items-end justify-center gap-[2px]">
                    <div className={clsx(styles.skeletonBase, 'h-[14px] w-[56px] rounded-[6px]')} />
                    <div className={clsx(styles.skeletonBase, 'h-[12px] w-[48px] rounded-[6px]')} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 底部加载区域 */}
          <div className="py-[12px] text-center">
            <div className="inline-flex items-center gap-[6px]">
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[44px] rounded-[6px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-full')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeRebateRecordSkeleton;
