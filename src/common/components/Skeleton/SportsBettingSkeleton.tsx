/**
 * 赛事详情页骨架屏组件，与详情页布局一致
 */
import React from 'react';

import styles from './Skeleton.module.scss';

const SportsBettingSkeleton: React.FC = () => {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[var(--Background-700)]">
      <div className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col">
        <div className="shrink-0 bg-[var(--Background-300)] px-10px">
          <div className="relative flex h-[44px] items-center justify-center">
            {[0, 1].map((item) => (
              <div key={item} className="flex items-center">
                {item > 0 && <div className="h-[14px] w-px bg-[var(--Line-200)]" />}
                <div className="relative flex h-[44px] items-center px-16px">
                  <div
                    className={`${styles.skeletonBase} h-[16px] ${
                      item === 0 ? 'w-[42px]' : 'w-[54px]'
                    } rounded`}
                  />
                  {item === 0 && (
                    <div className="absolute bottom-0 left-1/2 h-[2px] w-[28px] -translate-x-1/2 rounded bg-[var(--ThemeColor-Main)] opacity-30" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="my-4px flex h-[24px] items-center gap-8px overflow-hidden rounded-full bg-[var(--Background-500)] px-12px">
            <div className={`${styles.skeletonBase} h-[15px] w-[15px] shrink-0 rounded-full`} />
            <div className={`${styles.skeletonBase} h-[12px] flex-1 rounded`} />
            <div className={`${styles.skeletonBase} h-[14px] w-[14px] shrink-0 rounded`} />
          </div>

          <div className="flex items-center gap-10px py-6px">
            <div className="grid h-[36px] flex-1 grid-cols-4 rounded-[18px] bg-[var(--Background-500)] p-[2px]">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-center">
                  <div
                    className={`${styles.skeletonBase} h-[14px] ${
                      item === 0 ? 'w-[44px] bg-[var(--ThemeColor-Main)] opacity-30' : 'w-[36px]'
                    } rounded`}
                  />
                </div>
              ))}
            </div>
            <div className={`${styles.skeletonBase} h-[14px] w-[14px] shrink-0 rounded`} />
          </div>
        </div>

        <div className="flex flex-col gap-12px px-10px pb-20px pt-10px">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[10px] bg-[var(--Background-300)] p-12px">
              <div className="mb-10px flex items-center justify-between">
                <div className={`${styles.skeletonBase} h-[16px] w-[96px] rounded`} />
                <div className={`${styles.skeletonBase} h-[14px] w-[54px] rounded`} />
              </div>
              <div className="mb-10px flex items-center gap-8px">
                <div className={`${styles.skeletonBase} h-[18px] w-[18px] rounded-full`} />
                <div className={`${styles.skeletonBase} h-[14px] w-[132px] rounded`} />
              </div>
              <div className="grid grid-cols-3 gap-8px">
                <div className={`${styles.skeletonBase} h-[34px] rounded-[6px]`} />
                <div className={`${styles.skeletonBase} h-[34px] rounded-[6px]`} />
                <div className={`${styles.skeletonBase} h-[34px] rounded-[6px]`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsBettingSkeleton;
