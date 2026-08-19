/**
 * 体育首页骨架屏：对齐 SportsPage 顶部 Banner / 玩法 Tab / 赛种胶囊 / 搜索栏
 */
import React from 'react';

import styles from './Skeleton.module.scss';
import Skeleton from '.';

const SportsSkeleton: React.FC = () => {
  return (
    <section
      className={`${styles.sportsH5SkeletonTheme} w-full bg-[var(--Background-700)] max-lg:min-h-[100dvh] max-lg:bg-[var(--sports-skeleton-page-bg)]`}
    >
      <div className="relative mx-auto w-full overflow-hidden bg-[var(--Background-700)] max-lg:bg-[var(--sports-skeleton-page-bg)] lg:max-w-[1200px]">
        {/* H5 Banner：对齐真实页 120px 卡片 + mainArea 134px 首屏间距 */}
        <div className="hidden h-[134px] items-start gap-[10px] overflow-hidden bg-[var(--Background-700)] px-[12px] max-lg:flex max-lg:bg-[var(--sports-skeleton-page-bg)]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.skeletonBase} h-[120px] w-[351px] shrink-0 rounded-[12px]`}
            />
          ))}
        </div>

        <div className="flex min-h-[500px] flex-col bg-[var(--Background-700)] max-lg:min-h-[calc(100dvh-134px)] max-lg:rounded-t-[10px] max-lg:bg-[var(--sports-skeleton-page-bg)] lg:rounded-none lg:px-[8px] lg:pr-0">
          {/* H5：玩法 Tab + 赛种胶囊 + 搜索栏 */}
          <div className="mb-[4px] lg:hidden">
            <div className="flex min-h-[40px] rounded-t-[10px] bg-[var(--Background-60)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex flex-1 flex-col items-center justify-center gap-[2px] py-[4px] ${
                    index === 0 ? 'rounded-t-[10px] bg-[var(--Background-300)]' : ''
                  }`}
                >
                  <div
                    className={`${styles.skeletonBase} h-[12px] ${
                      index === 0 ? 'w-[32px]' : 'w-[24px]'
                    } rounded`}
                  />
                  <div
                    className={`${styles.skeletonBase} h-[10px] ${
                      index === 0 ? 'w-[28px]' : 'w-[34px]'
                    } rounded`}
                  />
                </div>
              ))}
            </div>
            <div className="relative flex gap-[8px] overflow-hidden border-b border-[var(--Line-100)] bg-[var(--Background-300)] px-[12px] py-[8px]">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`${styles.skeletonBase} h-[28px] min-w-[66px] shrink-0 rounded-full ${
                    index === 0 ? 'bg-[var(--ThemeColor-Main)] opacity-30' : ''
                  }`}
                />
              ))}
            </div>
            <div className="flex h-[34px] items-center justify-between rounded-b-[6px] bg-[var(--Background-300)] px-[8px]">
              <div className="flex min-w-0 flex-1 items-center gap-[8px]">
                <div className={`${styles.skeletonBase} h-[16px] w-[16px] rounded-full`} />
                <div className="h-[16px] w-px bg-[var(--Line-100)]" />
                <div className={`${styles.skeletonBase} h-[22px] w-[70px] rounded-[2px]`} />
                <div className={`${styles.skeletonBase} h-[18px] w-[110px] rounded-full`} />
              </div>
              <div className={`${styles.skeletonBase} h-[16px] w-[16px] shrink-0 rounded`} />
            </div>
          </div>

          {/* PC：选项栏 + 公告 + 赛种导航 */}
          <div className="hidden flex-col gap-[4px] pt-[4px] lg:flex">
            <div className={`${styles.skeletonBase} h-[36px] w-full rounded-[4px]`} />
            <div className={`${styles.skeletonBase} h-[30px] w-full rounded-[4px]`} />
            <div className="flex gap-[8px] overflow-hidden py-[8px]">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={`${styles.skeletonBase} h-[28px] w-[72px] shrink-0 rounded-full`}
                />
              ))}
            </div>
          </div>

          <div className="max-lg:flex-1 max-lg:bg-[var(--sports-skeleton-page-bg)] max-lg:pb-[72px]">
            <Skeleton type="sportsMainList" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportsSkeleton;
