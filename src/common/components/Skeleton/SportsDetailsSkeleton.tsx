/**
 * 赛事详情页骨架屏组件，与详情页布局一致
 */
import React from 'react';

import styles from './Skeleton.module.scss';

interface SportsDetailsSkeletonProps {
  compact?: boolean;
  groupCount?: number;
}

interface MarketListSkeletonProps {
  groupCount?: number;
}

const BettingTabsSkeleton: React.FC = () => (
  <div className="flex items-center justify-between bg-[var(--Background-700)] px-3 py-2">
    <div className="flex min-w-0 flex-1 gap-2 overflow-hidden">
      {[56, 44, 44, 44].map((width, index) => (
        <div
          key={index}
          className={`${styles.skeletonBase} ${styles.delay2} h-8 shrink-0 rounded-full`}
          style={{ width }}
        />
      ))}
    </div>
    <div className={`${styles.skeletonBase} ${styles.delay2} ml-2 h-8 w-8 shrink-0 rounded-lg`} />
  </div>
);

const MarketListSkeleton: React.FC<MarketListSkeletonProps> = ({ groupCount = 5 }) => (
  <div className="px-3 pt-0 bg-[var(--Background-700)]">
    {Array.from({ length: groupCount }).map((_, groupIndex) => (
      <div key={groupIndex} className="mb-3 last:mb-0">
        {/* 盘口组标题 */}
        <div className="flex items-center justify-between py-2">
          <div className={`${styles.skeletonBase} ${styles.delay1} h-4 w-24 rounded`} />
          <div className={`${styles.skeletonBase} ${styles.delay2} w-5 h-5 rounded`} />
        </div>
        {/* 盘口行 */}
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              <div className={`${styles.skeletonBase} ${styles.delay2} h-9 flex-1 rounded`} />
              <div className={`${styles.skeletonBase} ${styles.delay3} h-9 w-16 rounded`} />
              <div className={`${styles.skeletonBase} ${styles.delay3} h-9 w-16 rounded`} />
              <div className={`${styles.skeletonBase} ${styles.delay3} h-9 w-16 rounded`} />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SportsDetailsSkeleton: React.FC<SportsDetailsSkeletonProps> = ({
  compact = false,
  groupCount,
}) => {
  if (compact) {
    return (
      <section className="w-full bg-[var(--Background-700)] pt-0">
        <BettingTabsSkeleton />
        <MarketListSkeleton groupCount={groupCount ?? 3} />
      </section>
    );
  }

  return (
    <section className="base-main-background">
      <div className="flex flex-col min-h-[100vh] w-full max-w-[1200px] mx-auto bg-[var(--color-bg)] text-white">
        {/* 头部骨架：与 MatchDetailsHeader 一致 */}
        <div className="flex items-center justify-between h-11 px-3 shrink-0 sticky top-0 z-10">
          {/* <div className={`${styles.skeletonBase} ${styles.delay1} w-7 h-7 rounded`} />
          <div className={`${styles.skeletonBase} ${styles.delay2} h-4 w-32 rounded flex-1 mx-2 max-w-[200px]`} /> */}
          <div className="flex items-center gap-2">
            {/* <div className={`${styles.skeletonBase} ${styles.delay2} w-7 h-7 rounded`} />
            <div className={`${styles.skeletonBase} ${styles.delay3} w-7 h-7 rounded`} /> */}
          </div>
        </div>

        <div className="flex-1 pb-20 lg:pb-6">
          <div className="px-3 pt-0">
            <div className="rounded-lg overflow-hidden">
              <div className="w-full h-[155px] rounded-t-lg flex flex-col p-3">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* <div className={`${styles.skeletonBase} ${styles.delay1} w-10 h-10 rounded-full shrink-0`} />
                    <div className={`${styles.skeletonBase} ${styles.delay2} h-4 flex-1 max-w-[80px] rounded`} /> */}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* <div className={`${styles.skeletonBase} ${styles.delay2} h-6 w-8 rounded`} />
                    <span className="text-[var(--Text-700)]">-</span>
                    <div className={`${styles.skeletonBase} ${styles.delay2} h-6 w-8 rounded`} /> */}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    {/* <div className={`${styles.skeletonBase} ${styles.delay2} h-4 flex-1 max-w-[80px] rounded`} />
                    <div className={`${styles.skeletonBase} ${styles.delay1} w-10 h-10 rounded-full shrink-0`} /> */}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  {/* <div className="flex gap-4">
                    <div className={`${styles.skeletonBase} ${styles.delay3} h-4 w-12 rounded`} />
                    <div className={`${styles.skeletonBase} ${styles.delay3} h-4 w-12 rounded`} />
                  </div>
                  <div className="flex gap-1">
                    <div className={`${styles.skeletonBase} ${styles.delay3} w-4 h-4 rounded`} />
                    <div className={`${styles.skeletonBase} ${styles.delay3} w-4 h-4 rounded`} />
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* BettingTabs 骨架 */}
          <BettingTabsSkeleton />

          {/* 盘口列表骨架 */}
          <MarketListSkeleton groupCount={groupCount} />
        </div>
      </div>
    </section>
  );
};

export default SportsDetailsSkeleton;
