/**
 * 公告列表骨架屏组件
 */
import React from 'react';

import styles from './Skeleton.module.scss';
import clsx from 'clsx';

const NoticeListSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-8px">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={clsx(styles.skeletonBase, 'w-full h-[120px] rounded-[12px]')}
        ></div>
      ))}
    </div>
  );
};

export default NoticeListSkeleton;
