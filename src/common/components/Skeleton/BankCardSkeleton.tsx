import React from 'react';
import clsx from 'clsx';

import styles from './Skeleton.module.scss';

const BankCardSkeleton: React.FC = () => {
  return <div className={clsx(styles.skeletonBase, 'w-full h-112px rounded-[6px]')}></div>;
};

export default BankCardSkeleton;
