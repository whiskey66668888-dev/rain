import React from 'react';
import clsx from 'clsx';

import styles from './Skeleton.module.scss';

const BaseSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={clsx(styles.skeletonBase, 'min-h-2px', className)} />;
};

export default BaseSkeleton;
