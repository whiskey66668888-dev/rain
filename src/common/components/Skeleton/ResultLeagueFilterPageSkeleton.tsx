import React from 'react';
import clsx from 'clsx';

import styles from './Skeleton.module.scss';

const ResultLeagueFilterPageSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[var(--Background-700,#ecf2ff)] flex flex-col">
      <div className="h-[48px] px-[12px] bg-[var(--Background-300,#fff)] grid grid-cols-[32px_minmax(0,1fr)_32px] items-center">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-full')} />
        <div className="flex justify-center">
          <div className={clsx(styles.skeletonBase, 'h-[20px] w-[88px] rounded-[10px]')} />
        </div>
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="h-[52px] px-[10px] pt-[6px] pb-[10px] bg-[var(--Background-300,#fff)] grid grid-cols-[72px_minmax(0,1fr)] items-center gap-[10px]">
        <div className="flex items-center gap-[8px]">
          <div className="w-[2px] h-[16px] rounded-r-[2px] bg-[var(--ThemeColor-Main,#1a81ff)]" />
          <div className={clsx(styles.skeletonBase, 'h-[18px] w-[44px] rounded-[8px]')} />
        </div>
        <div className="h-[36px] rounded-[8px] bg-[var(--Background-500,#e9f0fc)] px-[12px] flex items-center">
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-full rounded-[8px]')} />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative pl-[10px] pr-[18px] pt-[12px]">
        <div className={clsx(styles.skeletonBase, 'h-[16px] w-[96px] rounded-[8px] mb-[12px]')} />

        <div className="flex flex-col gap-[20px] pb-[100px]">
          {['A', 'B', 'C', 'D', 'E'].map((letter, groupIndex) => (
            <div key={letter}>
              <div
                className={clsx(
                  styles.skeletonBase,
                  groupIndex % 2 === 0 ? styles.delay1 : styles.delay2,
                  'h-[24px] w-[20px] rounded-[8px] mb-[8px]',
                )}
              />
              <div className="flex flex-col gap-[4px]">
                {[...Array(5).keys()].map((itemIndex) => (
                  <div
                    key={`${letter}-${itemIndex}`}
                    className="h-[32px] px-[10px] flex items-center gap-[8px]"
                  >
                    <div
                      className={clsx(
                        styles.skeletonBase,
                        itemIndex % 2 === 0 ? styles.delay2 : styles.delay3,
                        'h-[16px] w-[16px] rounded-full',
                      )}
                    />
                    <div
                      className={clsx(
                        styles.skeletonBase,
                        itemIndex % 2 === 0 ? styles.delay3 : styles.delay4,
                        itemIndex % 3 === 0 ? 'w-[45%]' : 'w-[62%]',
                        'h-[16px] rounded-[8px]',
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-[42px] right-[2px] w-[20px] flex flex-col items-center gap-[2px]">
          {[...Array(8).keys()].map((index) => (
            <div
              key={index}
              className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[6px]')}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 px-[12px] pt-[8px] pb-[calc(12px+env(safe-area-inset-bottom))] bg-[var(--Background-300,#fff)] flex items-center gap-[12px]">
        <div className="flex-1 h-[44px] rounded-[22px] border border-[var(--Line-300,#d8e2f0)] bg-[var(--Background-300,#fff)] px-[16px] flex items-center gap-[8px]">
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[16px] rounded-full')} />
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[40px] rounded-[8px]')} />
        </div>
        <div className="flex-1 h-[44px] rounded-[22px] bg-[var(--Background-500,#e9f0fc)] px-[16px] flex items-center justify-center gap-[8px]">
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[56px] rounded-[8px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[20px] rounded-[8px]')} />
        </div>
      </div>
    </div>
  );
};

export default ResultLeagueFilterPageSkeleton;
