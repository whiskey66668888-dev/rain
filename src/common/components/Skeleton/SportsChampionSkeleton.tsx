/**
 * 赛事详情页骨架屏组件，与详情页布局一致
 */
import React from 'react';

import styles from './Skeleton.module.scss';

const SportsBettingSkeleton: React.FC = () => {
  return (
    <section>
      <div className="flex flex-col min-h-[100vh] w-full max-w-[1200px] mx-auto bg-[var(--color-bg)] text-white">
        {/* 头部骨架 */}
        <div className="flex items-center justify-between h-14 p-3 gap-2 shrink-0 sticky top-0 z-10">
          <div className={`${styles.skeletonBase} ${styles.delay2} h-8 rounded-full w-full`} />
        </div>

        {Array.from({ length: 30 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between px-3 py-1">
            <div className={`${styles.skeletonBase} ${styles.delay1} h-6 w-full rounded`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SportsBettingSkeleton;
