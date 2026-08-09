import React from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';
import { DEFAULT_AWAY_TEAM_ICON, DEFAULT_HOME_TEAM_ICON } from '../../constants';
import styles from './index.module.scss';

/**
 * 队伍名称和 logo 的统一展示，logo 缺失或加载失败时按主客队显示默认图标。
 */
const TeamTitle: React.FC<{
  logo?: string;
  name?: string;
  side: 'home' | 'away';
  reverse?: boolean;
}> = ({ logo, name, side, reverse }) => {
  const fallback = side === 'home' ? DEFAULT_HOME_TEAM_ICON : DEFAULT_AWAY_TEAM_ICON;

  return (
    <div className={clsx(styles.teamTitle, reverse && styles.teamTitleReverse)}>
      <LazyImage
        className={styles.teamLogo}
        imageClassName={styles.teamLogo}
        src={logo || fallback}
        fallback={fallback}
        width={24}
        height={24}
        alt=""
      />
      <span>{name || '-'}</span>
    </div>
  );
};

export default TeamTitle;
