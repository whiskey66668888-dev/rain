import React from 'react';
import clsx from 'clsx';

import styles from './Skeleton.module.scss';

const DEFAULT_SLOT_LIST_SKELETON_COUNT = 18;

const SlotListSkeleton: React.FC<{ count?: number }> = ({
  count = DEFAULT_SLOT_LIST_SKELETON_COUNT,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            styles.skeletonBase,
            'w-full min-w-[113px] max-w-[145px] rounded-[6px]',
            'aspect-ratio-[113/145] h-auto justify-self-start',
          )}
        ></div>
      ))}
    </>
  );
};

export default SlotListSkeleton;
