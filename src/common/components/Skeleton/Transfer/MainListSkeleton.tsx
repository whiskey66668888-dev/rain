/**
 * 转账 骨架屏组件
 */
import React from 'react';
import clsx from 'clsx';
// styles
import styles from '../Skeleton.module.scss';

const MainListSkeleton: React.FC = () => {
  return <div className={clsx(styles.skeletonBase, 'h-[320px] rounded-[12px]')}></div>;
};

export default MainListSkeleton;
