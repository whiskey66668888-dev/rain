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
 * 实时返水骨架屏
 * 对齐 RealtimeRebatePage：H5Header -> hero(金额环+右上操作) -> 领取按钮 -> 返水记录列表
 */
const RealtimeRebateSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[88px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="w-full text-sm text-[var(--Text-800)]">
        {/* hero 区（背景图区域） */}
        <div className="relative h-[407px] w-full overflow-hidden rounded-[12px] lg:rounded-none">
          {/* 右上操作 pill */}
          <div className="absolute right-0 top-[12px] z-[9] inline-flex flex-col items-start gap-[8px]">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="inline-flex h-[28px] w-[82px] items-center justify-center rounded-l-[100px] bg-[var(--Background-300)]"
              >
                <div className="flex items-center gap-[4px]">
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      DELAY_CLASSES[(i - 1) % 5],
                      'h-[14px] w-[42px] rounded-[6px]',
                    )}
                  />
                  <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
                </div>
              </div>
            ))}
          </div>

          {/* 中心金额环 */}
          <div className="absolute left-1/2 top-1/2 inline-flex w-[93.6%] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <div className="relative flex h-[321px] w-[324px] items-center justify-center rounded-full bg-[var(--Background-300)]">
              <div className="inline-flex flex-col items-center justify-center gap-[10px]">
                <div className={clsx(styles.skeletonBase, 'h-[20px] w-[96px] rounded-[8px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[34px] w-[140px] rounded-[10px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[16px] w-[180px] rounded-[8px]')} />
              </div>
            </div>
          </div>
        </div>

        {/* 领取按钮 */}
        <div className="mx-auto my-[24px] h-[44px] w-[calc(100%-20px)] rounded-[100px] lg:w-full">
          <div className={clsx(styles.skeletonBase, 'h-full w-full rounded-[100px]')} />
        </div>

        {/* 返水记录列表（对应 List 组件） */}
        <div className="mx-auto flex w-[calc(100%-20px)] flex-col gap-[12px] rounded-[16px] bg-[var(--Background-300)] px-[12px] pb-[20px] pt-[12px] lg:w-full">
          <div className="flex h-[40px] items-center justify-between py-[8px]">
            <div className={clsx(styles.skeletonBase, 'h-[20px] w-[72px] rounded-[8px]')} />
            <div className="flex items-center gap-[4px]">
              <div className={clsx(styles.skeletonBase, 'h-[16px] w-[56px] rounded-[6px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
            </div>
          </div>

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
                  <div className={clsx(styles.skeletonBase, 'h-[12px] w-[120px] rounded-[6px]')} />
                </div>

                <div className="inline-flex flex-col items-end justify-center gap-[2px]">
                  <div className={clsx(styles.skeletonBase, 'h-[14px] w-[56px] rounded-[6px]')} />
                  <div className={clsx(styles.skeletonBase, 'h-[12px] w-[48px] rounded-[6px]')} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeRebateSkeleton;
