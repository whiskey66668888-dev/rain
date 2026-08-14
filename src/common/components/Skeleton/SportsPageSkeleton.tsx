/**
 * 体育首页骨架屏：对齐 SportsPage 顶部 Banner / 玩法 Tab / 赛种胶囊 / 搜索栏
 */
import React from 'react';

import styles from './Skeleton.module.scss';
import Skeleton from '.';

const SportsSkeleton: React.FC = () => {
  return (
    <section className="w-full">
      <div className="relative mx-auto w-full overflow-hidden lg:max-w-[1200px]">
        {/* H5 Banner：真实页 110px 容器 + 90px 卡片，不额外加顶边距 */}
        <div className="hidden h-[110px] items-center gap-[10px] overflow-hidden px-[12px] pb-[8px] max-lg:flex">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.skeletonBase} h-[90px] w-[351px] shrink-0 rounded-[12px]`}
            />
          ))}
        </div>

        <div className="flex min-h-[500px] flex-col bg-[var(--Background-700)] max-lg:rounded-t-[10px] lg:rounded-none lg:px-[8px] lg:pr-0">
          {/* H5：玩法 Tab + 赛种胶囊 + 搜索栏 */}
          <div className="mb-[4px] lg:hidden">
            <div className="flex rounded-t-[10px] bg-[var(--Background-60)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-h-[40px] flex-1 items-center justify-center py-[4px]"
                >
                  <div className={`${styles.skeletonBase} h-[14px] w-[36px] rounded`} />
                </div>
              ))}
            </div>
            <div className="flex gap-[8px] overflow-hidden bg-[var(--Background-300)] px-[12px] py-[8px]">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`${styles.skeletonBase} h-[28px] min-w-[66px] shrink-0 rounded-full`}
                />
              ))}
            </div>
            <div className="flex h-[34px] items-center rounded-b-[6px] bg-[var(--Background-300)] px-[12px]">
              <div className={`${styles.skeletonBase} h-[22px] w-full rounded-[2px]`} />
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

          <Skeleton type="sportsMainList" />
        </div>
      </div>
    </section>
  );
};

export default SportsSkeleton;
