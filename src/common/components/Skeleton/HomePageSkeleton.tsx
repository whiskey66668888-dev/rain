/**
 * 娱乐首页骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';

const HomePageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1200px] h-full mx-auto overflow-hidden p-[20px]">
      <ul className="flex flex-wrap gap-4 overflow-hidden flex-nowrap mt-[10px]">
        {Array.from({ length: 7 }).map((_, index) => (
          <li
            key={index}
            className={`${styles.skeletonBase} w-[351px] h-[150px] rounded-md flex-shrink-0 rounded-[12px]`}
          ></li>
        ))}
      </ul>
      <div className={`${styles.skeletonBase} w-full h-[17px] rounded-md mt-[30px]`}></div>
      {Array.from({ length: 5 }).map((_, index) => (
        <section className="mt-[20px] mb-[20px]" key={index}>
          <div className="w-full flex items-center gap-[12px] mb-[12px]">
            <span className={`${styles.skeletonBase} w-[12px] h-[12px] rounded-full`}></span>
            <p className={`${styles.skeletonBase} w-[50px] h-[20px]`}></p>
            <p className={`${styles.skeletonBase} w-[100px] h-[20px]`}></p>
            <div className={`${styles.skeletonBase} w-[70px] h-[18px] ml-auto`}></div>
          </div>
          {/* 主列表（联动菜单） */}
          <ul className="flex flex-nowrap pt-[16px] gap-[12px] overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <li
                className={`${styles.skeletonBase} flex-shrink-0 h-[164px] w-[114px] lg:w-[200px] lg:h-[126px]`}
                key={index}
              ></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default HomePageSkeleton;
