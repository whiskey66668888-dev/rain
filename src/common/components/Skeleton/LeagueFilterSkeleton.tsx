/**
 * 联赛筛选骨架屏
 */
import React from 'react';

import styles from './LeagueFilter.module.scss';

const LeagueFilterSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className={styles.skeletonItem}>
          <div className={`${styles.skeletonBase} h-10 w-[60%] rounded`}></div>
          <div className={`${styles.skeletonBase} h-10 w-[38%] rounded`}></div>
        </div>
      ))}
    </div>
  );
};

export default LeagueFilterSkeleton;
