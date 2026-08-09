import React from 'react';
import clsx from 'clsx';

import styles from './Skeleton.module.scss';

const MsgChildListSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-8px p-12px">
      <div className="flex items-center justify-between">
        <p className={clsx(styles.skeletonBase, 'w-60px h-[18px]')}></p>
        <p className={clsx(styles.skeletonBase, 'w-60px h-[18px]')}></p>
      </div>
      <div className={clsx(styles.skeletonBase, 'w-full h-[54px] rounded-[12px]')}></div>
    </div>
  );
};

export default MsgChildListSkeleton;
