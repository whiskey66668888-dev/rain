/**
 * 娱乐首页骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';

const HomePageSkeleton: React.FC = () => {
  return (
    <div className="h-full max-w-[1200px] mx-auto overflow-hidden">
      <div className="mt-[8px] overflow-hidden px-[12px] lg:h-[180px]">
        <div className="flex gap-[12px] overflow-hidden lg:h-full">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative h-[calc((100vw-24px)*163/350)] max-h-[194px] min-h-[150px] w-full shrink-0 overflow-hidden rounded-[8px] bg-[var(--Background-300)] p-[18px] lg:h-[175px] lg:w-[351px] lg:min-h-0 lg:max-h-none"
            >
              <div className={`${styles.skeletonBase} mb-[14px] h-[22px] w-[42%] rounded-[4px]`} />
              <div className="flex gap-[8px]">
                <div className={`${styles.skeletonBase} h-[8px] w-[52px] rounded-[2px]`} />
                <div className={`${styles.skeletonBase} h-[8px] w-[64px] rounded-[2px]`} />
              </div>
              <div className="mt-[8px] flex gap-[8px]">
                <div className={`${styles.skeletonBase} h-[8px] w-[58px] rounded-[2px]`} />
                <div className={`${styles.skeletonBase} h-[8px] w-[50px] rounded-[2px]`} />
              </div>
              <div
                className={`${styles.skeletonBase} absolute right-[18px] top-[24px] h-[74%] w-[36%] rounded-[50%]`}
              />
              <div
                className={`${styles.skeletonBase} absolute left-1/2 top-[54px] h-[20px] w-[30px] -translate-x-1/2 rounded-[6px]`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[600px] rounded-t-[10px] bg-[var(--Background-700)]">
        <nav className="mb-[-12px] flex gap-[8px] overflow-hidden px-[12px] py-[12px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.skeletonBase} h-[36px] min-w-[80px] flex-1 shrink-0 rounded-[10px]`}
            />
          ))}
        </nav>

        {Array.from({ length: 3 }).map((_, index) => (
          <section className="mt-[16px]" key={index}>
            <div className="mb-[12px] flex h-[25px] items-center gap-[10px] px-[12px]">
              <span className={`${styles.skeletonBase} h-[18px] w-[18px] rounded-full`} />
              <p className={`${styles.skeletonBase} h-[16px] w-[64px] rounded`} />
              <p className={`${styles.skeletonBase} h-[14px] w-[96px] rounded`} />
              <div className={`${styles.skeletonBase} ml-auto h-[24px] w-[48px] rounded-[4px]`} />
            </div>

            <ul className="flex flex-nowrap gap-[5px] overflow-hidden px-[12px]">
              {Array.from({ length: 6 }).map((_, itemIndex) => (
                <li
                  className={`${styles.skeletonBase} h-[145px] w-[108px] min-w-[108px] shrink-0 rounded-[10px]`}
                  key={itemIndex}
                />
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-[16px] mb-[16px] hidden max-lg:block">
          <div className="mb-[12px] flex h-[25px] items-center gap-[10px] px-[12px]">
            <span className={`${styles.skeletonBase} h-[18px] w-[18px] rounded-full`} />
            <p className={`${styles.skeletonBase} h-[16px] w-[72px] rounded`} />
            <div className={`${styles.skeletonBase} ml-auto h-[24px] w-[48px] rounded-[4px]`} />
          </div>
          <ul className="flex flex-nowrap gap-[12px] overflow-hidden px-[12px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className={`${styles.skeletonBase} h-[154px] w-[351px] shrink-0 rounded-[10px]`}
              />
            ))}
          </ul>
        </section>

        <section className="mt-[12px] px-[12px] hidden max-lg:block">
          <div className="grid grid-cols-2 gap-[8px] lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`${styles.skeletonBase} h-[77px] rounded-[10px]`} />
            ))}
          </div>
        </section>

        <section className="mt-[16px] px-[12px] pb-[16px] hidden max-lg:block">
          <div className="mb-[12px] flex h-[25px] items-center gap-[10px]">
            <span className={`${styles.skeletonBase} h-[18px] w-[18px] rounded-full`} />
            <p className={`${styles.skeletonBase} h-[16px] w-[64px] rounded`} />
          </div>
          <div className={`${styles.skeletonBase} h-[72px] rounded-[10px]`} />
        </section>
      </div>
    </div>
  );
};

export default HomePageSkeleton;
