/**
 * 体育首页骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';
import Skeleton from '.';

const SportsSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-hidden max-w-[1200px] mx-auto">
      <ul className="flex flex-wrap gap-4 overflow-hidden flex-nowrap mt-[20px]">
        {Array.from({ length: 7 }).map((_, index) => (
          <li
            key={index}
            className={`${styles.skeletonBase} w-[351px] h-[150px] rounded-md flex-shrink-0 rounded-[12px]`}
          ></li>
        ))}
      </ul>
      <div className={`${styles.skeletonBase} w-full h-[17px] rounded-md mt-[30px]`}></div>
      <ul className="flex flex-wrap gap-[10px] flex-nowrap mt-[20px] h-[64px] pt-[12px] pb-[12px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className={`${styles.skeletonBase} flex-1`}></li>
        ))}
      </ul>
      <Skeleton type="sportsMainList" />
    </div>
  );
};

export default SportsSkeleton;
