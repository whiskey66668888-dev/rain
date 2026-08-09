import React from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';

import type { TeamOverviewItem } from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

interface TeamOverviewProps {
  homeName: string;
  awayName: string;
  homeRecord: string;
  awayRecord: string;
  homeLogo: string;
  awayLogo: string;
  items: TeamOverviewItem[];
}

const TeamOverview: React.FC<TeamOverviewProps> = ({
  homeName,
  awayName,
  homeRecord,
  awayRecord,
  homeLogo,
  awayLogo,
  items,
}) => (
  <div>
    <h3 className={styles.sectionTitle}>球队概况</h3>
    <div className={styles.teamHeaderRow}>
      <div className={styles.teamHeader}>
        {homeLogo ? <LazyImage className={styles.teamLogo} src={homeLogo} alt="" /> : null}
        <div className={styles.teamNameCol}>
          <span className={styles.teamName}>{homeName}</span>
          <span className={styles.teamRecord}>{homeRecord}</span>
        </div>
      </div>
      <div className={clsx(styles.teamHeader, styles.teamHeaderRight)}>
        <div className={styles.teamNameCol}>
          <span className={styles.teamName}>{awayName}</span>
          <span className={styles.teamRecord}>{awayRecord}</span>
        </div>
        {awayLogo ? <LazyImage className={styles.teamLogo} src={awayLogo} alt="" /> : null}
      </div>
    </div>
    {items.map((item, index) => (
      <div
        key={item.label}
        className={clsx(styles.overviewRow, index % 2 === 0 && styles.overviewRowEven)}
      >
        <span className={styles.overviewVal}>{item.leftVal || '-'}</span>
        <span className={styles.overviewLabel}>{item.label}</span>
        <span className={clsx(styles.overviewVal, styles.overviewValRight)}>
          {item.rightVal || '-'}
        </span>
      </div>
    ))}
  </div>
);

export default TeamOverview;
