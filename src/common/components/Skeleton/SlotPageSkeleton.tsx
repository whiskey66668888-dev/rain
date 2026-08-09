/**
 * 电子游戏首页骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';
import Skeleton from '.';

const SlotPageSkeleton: React.FC = () => {
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
      <Skeleton type="slotList" />
    </div>
  );
};

export default SlotPageSkeleton;
