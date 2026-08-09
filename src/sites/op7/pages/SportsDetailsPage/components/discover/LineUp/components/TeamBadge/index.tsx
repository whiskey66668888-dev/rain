import React from 'react';
import clsx from 'clsx';

import type { TeamLite } from '@/apis/origin/discover';
import styles from './index.module.scss';

const TeamBadge: React.FC<{ team: TeamLite; align?: 'left' | 'right' }> = ({ team, align }) => (
  <div className={clsx(styles.teamBadge, align === 'right' && styles.right)}>
    {team.logo ? <img src={team.logo} alt="" className={styles.teamLogo} /> : <span />}
    <span>{team.name || '-'}</span>
  </div>
);

export default TeamBadge;
