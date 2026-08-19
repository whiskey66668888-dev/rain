/**
 * 体育冠军列表骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';

const SportsChampionListSkeleton: React.FC = () => {
  return (
    <div className="w-full overflow-hidden bg-[var(--Background-700)]">
      <div className="relative pr-[18px] pb-[12px] lg:hidden">
        <section className="mt-[6px] flex flex-col gap-[4px] pb-[12px]">
          <div className="flex h-[20px] items-center gap-[4px] pl-[10px]">
            <div className={`${styles.skeletonBase} h-[12px] w-[12px] rounded-full`} />
            <div className={`${styles.skeletonBase} h-[14px] w-[18px] rounded`} />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${styles.skeletonBase} h-[36px] w-full rounded-[18px]`} />
          ))}
        </section>

        <section className="flex flex-col gap-[4px]">
          <div className={`${styles.skeletonBase} ml-[10px] mb-[4px] h-[16px] w-[92px] rounded`} />
          {Array.from({ length: 4 }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-[4px]">
              <div className={`${styles.skeletonBase} ml-[10px] h-[20px] w-[18px] rounded`} />
              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`${styles.skeletonBase} h-[36px] w-full rounded-[18px]`}
                />
              ))}
            </div>
          ))}
        </section>
      </div>

      <ul className="hidden flex-col gap-[4px] pb-[12px] lg:flex">
        {Array.from({ length: 7 }).map((_, index) => (
          <li key={index} className="rounded-[4px] bg-[var(--Background-300)]">
            <div className="flex h-[40px] items-center justify-between px-[12px]">
              <div className={`${styles.skeletonBase} h-[14px] w-[180px] rounded`} />
              <div className="flex items-center gap-[8px]">
                <div className={`${styles.skeletonBase} h-[14px] w-[36px] rounded`} />
                <div className={`${styles.skeletonBase} h-[12px] w-[12px] rounded`} />
              </div>
            </div>
            {index < 2 && (
              <div className="border-t border-[var(--Line-100)] p-[12px]">
                <div className={`${styles.skeletonBase} mb-[12px] h-[28px] w-[120px] rounded`} />
                <div className="grid grid-cols-2 gap-[4px]">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`${styles.skeletonBase} h-[40px] rounded-[4px]`}
                    />
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SportsChampionListSkeleton;
