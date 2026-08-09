import React from 'react';

import Skeleton from '@/common/components/Skeleton';

import styles from './DiscoverPlaceholder.module.scss';

interface DiscoverPlaceholderProps {
  loading?: boolean;
  subTabTitle?: string;
}

/**
 * 发现子模块占位（聊天/赛况/阵容等页面后续接入）
 */
const DiscoverPlaceholder: React.FC<DiscoverPlaceholderProps> = ({
  loading = false,
  subTabTitle,
}) => {
  if (loading) {
    return (
      <div className={styles.placeholder}>
        <Skeleton type="base" baseClassName="h-120px" />
      </div>
    );
  }

  return (
    <div className={styles.placeholder}>
      <span className={`${styles.text} _tf[14]`}>
        {subTabTitle ? `${subTabTitle}模块开发中` : '发现模块开发中'}
      </span>
    </div>
  );
};

export default DiscoverPlaceholder;
