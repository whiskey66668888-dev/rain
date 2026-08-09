import React, { useState } from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';

import type { ScheduleItem } from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

const DEFAULT_SHOW_COUNT = 5;

const hasScheduleContent = (item: ScheduleItem): boolean =>
  item.isCurrent ||
  (item.date !== '-' && item.date !== '') ||
  (item.homeTeam !== '-' && item.homeTeam !== '') ||
  (item.guestTeam !== '-' && item.guestTeam !== '');

interface RecentScheduleProps {
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
  homeList: ScheduleItem[];
  guestList: ScheduleItem[];
}

const ScheduleSection: React.FC<{
  name: string;
  logo?: string;
  list: ScheduleItem[];
}> = ({ name, logo, list }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleList = list.filter(hasScheduleContent);
  const showMoreButton = visibleList.length > DEFAULT_SHOW_COUNT;
  const displayList =
    showMoreButton && !expanded ? visibleList.slice(0, DEFAULT_SHOW_COUNT) : visibleList;

  return (
    <div className={styles.scheduleSection}>
      <div className={styles.scheduleTeamBar}>
        {logo ? <LazyImage className={styles.teamLogoSmall} src={logo} alt="" /> : null}
        <span className={styles.teamName}>{name}</span>
      </div>
      <div className={styles.scheduleTableHeader}>
        <span className={styles.scheduleColDate}>时间/赛事</span>
        <span className={styles.scheduleColMatch}>主队 比分 客队</span>
        <span className={styles.scheduleColInterval}>间隔</span>
      </div>
      {displayList.map((item, index) => (
        <div
          key={`${item.scheduleId ?? item.date}-${index}`}
          className={clsx(styles.scheduleRow, item.isCurrent && styles.scheduleRowCurrent)}
        >
          <div className={styles.scheduleColDate}>
            <div>{item.date}</div>
            <div className={styles.scheduleLeagueName}>{item.leagueName}</div>
          </div>
          <div className={clsx(styles.scheduleColMatch, styles.scheduleMatchRow)}>
            <span className={clsx(styles.scheduleTeamName, styles.scheduleTeamNameRight)}>
              {item.homeTeam}
            </span>
            <span className={styles.scheduleScore}>{item.scoreOrVs}</span>
            <span className={clsx(styles.scheduleTeamName, styles.scheduleTeamNameLeft)}>
              {item.guestTeam}
            </span>
          </div>
          <span className={styles.scheduleColInterval}>{item.interval}</span>
        </div>
      ))}
      {showMoreButton ? (
        <button type="button" className={styles.moreBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? '收起' : '更多'}
        </button>
      ) : null}
    </div>
  );
};

const RecentSchedule: React.FC<RecentScheduleProps> = ({
  homeName,
  awayName,
  homeLogo,
  awayLogo,
  homeList,
  guestList,
}) => (
  <div>
    <h3 className={styles.sectionTitle}>近期赛程</h3>
    <ScheduleSection name={homeName} logo={homeLogo} list={homeList} />
    <ScheduleSection name={awayName} logo={awayLogo} list={guestList} />
  </div>
);

export default RecentSchedule;
