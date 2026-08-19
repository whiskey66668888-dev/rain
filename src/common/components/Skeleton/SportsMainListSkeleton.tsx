/**
 * 体育主列表骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';
import { useAppSelector } from '@/core/store/hooks';

const TeamRowsSkeleton: React.FC<{ compact?: boolean }> = ({ compact = true }) => (
  <div className={`${compact ? 'h-[60px] gap-[8px]' : 'h-[88px]'} flex flex-col justify-center`}>
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className={`${compact ? '' : 'h-[46px]'} flex items-center justify-between gap-[10px]`}
      >
        <div className="flex min-w-0 items-center gap-[5px]">
          <div
            className={`${styles.skeletonBase} ${styles.delay2} h-[16px] w-[16px] rounded-full`}
          />
          <div
            className={`${styles.skeletonBase} h-[14px] ${index === 0 ? 'w-[86px]' : 'w-[92px]'} rounded`}
          />
        </div>
        <div className={`${styles.skeletonBase} h-[18px] w-[18px] rounded`} />
      </div>
    ))}
  </div>
);

const SportsMainListH5Skeleton: React.FC = () => {
  const isSimpleOdds = useAppSelector((state) => state.sport.mainList.settings.isSimpleOdds);
  const matchItemClassName = isSimpleOdds ? 'min-h-[97px]' : 'min-h-[152px]';
  const oddsItemClassName = isSimpleOdds ? 'h-[52px]' : 'h-[112px]';
  const oddsCount = isSimpleOdds ? 3 : 2;

  return (
    <div className={`${styles.sportsH5SkeletonTheme} px-[12px] pt-[10px] lg:hidden`}>
      {Array.from({ length: 4 }).map((_, groupIndex) => (
        <div
          key={groupIndex}
          className={`${styles.sportsH5ListCard} mb-[12px] overflow-hidden rounded-[10px]`}
        >
          <div className="flex min-h-[32px] items-center justify-between px-[12px]">
            <div className={`${styles.skeletonBase} h-[14px] w-[120px] rounded`} />
            <div className={`${styles.skeletonBase} h-[12px] w-[12px] rounded`} />
          </div>

          {Array.from({ length: 2 }).map((_, matchIndex) => (
            <div
              key={matchIndex}
              className={`${matchItemClassName} flex justify-between border-b border-[rgba(203,216,237,0.35)] px-[12px] last:border-b-0 dark:border-[var(--Line-100)]`}
            >
              <div className="w-[180px] max-w-[180px] shrink-0">
                <div className="flex items-end justify-between py-[8px]">
                  <div
                    className={`${styles.skeletonBase} ${styles.delay1} ml-[-12px] h-[20px] w-[96px] rounded-r-[10px]`}
                  />
                  {isSimpleOdds && (
                    <div className={`${styles.skeletonBase} h-[12px] w-[42px] rounded`} />
                  )}
                </div>
                <TeamRowsSkeleton compact={isSimpleOdds} />
              </div>

              <div className="ml-[20px] flex min-w-0 flex-1 items-center gap-[4px]">
                {Array.from({ length: oddsCount }).map((_, oddsIndex) => (
                  <div
                    key={oddsIndex}
                    className={`${styles.skeletonBase} ${styles.delay3} ${oddsItemClassName} flex-1 rounded-[4px]`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const SportsMainListPcSkeleton: React.FC = () => (
  <div className="hidden lg:flex flex-col gap-[4px]">
    {Array.from({ length: 4 }).map((_, groupIndex) => (
      <div key={groupIndex} className="overflow-hidden rounded-[6px] bg-[var(--Background-300)]">
        <div className="flex min-h-[32px] items-center justify-between px-[12px]">
          <div className={`${styles.skeletonBase} h-[14px] w-[180px] rounded`} />
          <div className={`${styles.skeletonBase} h-[12px] w-[12px] rounded`} />
        </div>

        {Array.from({ length: 2 }).map((_, matchIndex) => (
          <div
            key={matchIndex}
            className="flex min-h-[104px] items-center gap-[12px] border-t border-[var(--Line-100)] px-[12px]"
          >
            <div className="w-[220px] shrink-0">
              <div className="mb-[10px] flex items-center justify-between">
                <div
                  className={`${styles.skeletonBase} ${styles.delay1} h-[16px] w-[86px] rounded`}
                />
                <div className={`${styles.skeletonBase} h-[12px] w-[42px] rounded`} />
              </div>
              <TeamRowsSkeleton />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-[6px]">
              {Array.from({ length: 6 }).map((_, oddsIndex) => (
                <div
                  key={oddsIndex}
                  className={`${styles.skeletonBase} ${styles.delay3} h-[58px] min-w-[84px] flex-1 rounded-[4px]`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const SportsSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-hidden">
      <SportsMainListH5Skeleton />
      <SportsMainListPcSkeleton />
    </div>
  );
};

export default SportsSkeleton;
