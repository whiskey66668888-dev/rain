import React from 'react';
import clsx from 'clsx';
import styles from './Skeleton.module.scss';

const DELAY_CLASSES = [
  styles.delay1,
  styles.delay2,
  styles.delay3,
  styles.delay4,
  styles.delay5,
] as const;

/**
 * 呼朋唤友-直升历史骨架屏
 * 对齐 HistoryReportPage：H5Header -> MyTitle -> TabList -> ListTable -> InfiniteScroll
 */
const InviteFriendsHistoryReportSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[92px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[32px] rounded-[10px]')} />
      </div>

      <div className="w-full px-[12px] pb-[20px]">
        {/* 标题 */}
        <div className="my-[12px] flex h-[20px] items-center gap-[4px]">
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[2px] rounded-[1px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[96px] rounded-[8px]')} />
        </div>

        {/* 周期 tabs */}
        <div className="mb-[12px] flex items-center gap-[6px] rounded-[20px] bg-[var(--Background-700)] p-[2px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={clsx(
                styles.skeletonBase,
                DELAY_CLASSES[(i - 1) % 5],
                'h-[32px] flex-1 rounded-[16px]',
              )}
            />
          ))}
        </div>

        {/* 数据时间 */}
        <div className="mb-[10px] flex items-center gap-[8px]">
          <div className={clsx(styles.skeletonBase, 'h-[12px] w-[56px] rounded-[6px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[12px] w-[180px] rounded-[6px]')} />
        </div>

        {/* 列表表格 */}
        <div className="overflow-hidden rounded-[12px] border border-[var(--Line-100)]">
          <div className="flex bg-[var(--Line-100)]">
            {[120, 64, 72, 64, 56].map((w, idx) => (
              <div key={idx} className="flex-1 px-[4px] py-[12px]">
                <div
                  className={clsx(styles.skeletonBase, 'mx-auto h-[14px] rounded-[6px]')}
                  style={{ width: `${w}px` }}
                />
              </div>
            ))}
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={clsx(
                'flex border-t border-[var(--Line-100)]',
                i % 2 === 0 && 'bg-[var(--Background-700)]',
              )}
            >
              <div className="flex flex-[1.5] items-center justify-center px-[4px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[120px] rounded-[6px]')} />
              </div>
              <div className="flex flex-1 items-center justify-center px-[4px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[40px] rounded-[6px]')} />
              </div>
              <div className="flex flex-[1.2] items-center justify-center px-[4px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[68px] rounded-[6px]')} />
              </div>
              <div className="flex flex-1 items-center justify-center px-[4px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[36px] rounded-[6px]')} />
              </div>
              <div className="flex flex-1 items-center justify-center px-[4px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[52px] rounded-[6px]')} />
              </div>
            </div>
          ))}
        </div>

        {/* 加载中 */}
        <div className="py-[12px] text-center">
          <div className="inline-flex items-center gap-[6px]">
            <div className={clsx(styles.skeletonBase, 'h-[12px] w-[44px] rounded-[6px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-full')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsHistoryReportSkeleton;
