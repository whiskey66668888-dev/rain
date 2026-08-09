/**
 * 体育主列表骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';

const SportsSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-hidden">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 mb-3 rounded-lg border-b border-[var(--Background-300)] last:border-b-0"
        >
          {/* 左侧：球队信息 */}
          <div className="flex-1 flex flex-col gap-3">
            {/* 时间 */}
            <div className={`${styles.skeletonBase} ${styles.delay1} h-4 w-[60%] rounded`} />
            {/* 球队1 */}
            <div className="flex items-center gap-2">
              <div className={`${styles.skeletonBase} ${styles.delay2} w-[15%] h-5 rounded`} />
              <div className={`${styles.skeletonBase} ${styles.delay3} h-4 w-[50%] rounded`} />
            </div>
            {/* 球队2 */}
            <div className="flex items-center gap-2">
              <div className={`${styles.skeletonBase} ${styles.delay2} w-[15%] h-5 rounded`} />
              <div className={`${styles.skeletonBase} ${styles.delay3} h-4 w-[50%] rounded`} />
            </div>
          </div>

          {/* 中间：比分 */}
          <div className="flex flex-col items-center gap-2">
            <div className={`${styles.skeletonBase} ${styles.delay1} h-6 w-[20%] rounded`} />
            <div className={`${styles.skeletonBase} ${styles.delay2} h-6 w-[20%] rounded`} />
          </div>

          {/* 右侧：水位玩法 */}
          <div className="flex gap-2 w-[30%] min-w-[150px]">
            {Array.from({ length: 3 }).map((_, oddsIndex) => (
              <div
                key={oddsIndex}
                className={`${styles.skeletonBase} ${styles.delay3} h-12 w-full rounded`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SportsSkeleton;
