import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import Empty from '@/common/components/Empty';
import type { LiveSituationData, TeamStatItem } from '@/apis/origin/discover';
import {
  getTeamStatDisplayValue,
  getTeamStatGroups,
  getTeamStatValue,
  prepareTeamStatRows,
  shouldShowTeamStatDivider,
  toPercentNumber,
} from '../../../utils/formatDiscoverData';
import shotBgDark from '@/sites/op7/images/common/discover/liveSituation/ic_shot_dark.png.webp';
import shotBgLight from '@/sites/op7/images/common/discover/liveSituation/ic_shot_light.png.webp';
import styles from './index.module.scss';

type TeamStatsData = NonNullable<LiveSituationData['team_stats']>;

const StatTabs: React.FC<{
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}> = ({ tabs, activeIndex, onChange }) => (
  <div className={styles.innerTabs}>
    {tabs.map((tab, index) => (
      <button
        type="button"
        className={clsx(activeIndex === index && styles.activeInnerTab)}
        onClick={() => onChange(index)}
        key={tab}
      >
        {tab}
      </button>
    ))}
  </div>
);

const BallControl: React.FC<{ item: TeamStatItem }> = ({ item }) => {
  const homeValue = toPercentNumber(item.home, toPercentNumber(item.home_rate, 0));
  const awayValue = toPercentNumber(item.away, toPercentNumber(item.away_rate, 0));
  const total = homeValue + awayValue;
  const homeRate = total > 0 ? (homeValue / total) * 100 : 50;
  const awayRate = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <div className={styles.ballControl}>
      <h5>控球率</h5>
      <div className={styles.ballTrack}>
        <i style={{ flexBasis: `${homeRate}%` }}>{Math.round(homeValue)}%</i>
        <em style={{ flexBasis: `${awayRate}%` }}>{Math.round(awayValue)}%</em>
      </div>
      <b className={styles.sectionDivider} />
    </div>
  );
};

const ShotSummary: React.FC<{
  shotOnTarget?: TeamStatItem;
  shotOffTarget?: TeamStatItem;
}> = ({ shotOnTarget, shotOffTarget }) => (
  <div
    className={styles.shotSummary}
    style={
      {
        '--shot-bg-light': `url(${shotBgLight})`,
        '--shot-bg-dark': `url(${shotBgDark})`,
      } as React.CSSProperties
    }
  >
    <div className={styles.shotOffTarget}>
      <span className={styles.shotTagHome}>{getTeamStatValue(shotOffTarget, 'home')}</span>
      <b>射偏</b>
      <span className={styles.shotTagAway}>{getTeamStatValue(shotOffTarget, 'away')}</span>
    </div>
    <div className={styles.shotOnTarget}>
      <span className={styles.shotTagHome}>{getTeamStatValue(shotOnTarget, 'home')}</span>
      <b>射正</b>
      <span className={styles.shotTagAway}>{getTeamStatValue(shotOnTarget, 'away')}</span>
    </div>
  </div>
);

const TeamStatRow: React.FC<{ item: TeamStatItem }> = ({ item }) => (
  <div className={styles.statRow}>
    <span>{getTeamStatDisplayValue(item, 'home')}</span>
    <b>{item.item_name}</b>
    <span>{getTeamStatDisplayValue(item, 'away')}</span>
  </div>
);

const TeamStats: React.FC<{ teamStats?: TeamStatsData | null }> = ({ teamStats }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const groups = useMemo(() => getTeamStatGroups(teamStats), [teamStats]);
  const activeGroup = groups[activeIndex] ?? { label: '全部', rows: [] };
  const preparedRows = useMemo(() => prepareTeamStatRows(activeGroup.rows), [activeGroup.rows]);

  return (
    <section className={styles.teamStats}>
      <header className={styles.panelHeader}>
        <h4>球队统计</h4>
        <StatTabs
          tabs={groups.map((group) => group.label)}
          activeIndex={activeIndex}
          onChange={setActiveIndex}
        />
      </header>

      {!preparedRows.ballControl &&
      preparedRows.rows.length === 0 &&
      !preparedRows.hasShotSummary ? (
        <Empty
          text="暂无球队统计"
          variant="card"
          className="h-[160px]"
          imgWrapClassName="w-[64px] h-[64px]"
          iconClassName="w-[30px] h-[30px]"
          textClassName="_tf[13]"
        />
      ) : (
        <>
          {preparedRows.ballControl && <BallControl item={preparedRows.ballControl} />}
          <div className={styles.statList}>
            {preparedRows.rows.map((item, index) => {
              const showShotAfterRow =
                preparedRows.hasShotSummary && (item.item_name === '射门' || item.item_id === '83');

              return (
                <React.Fragment key={`${item.item_id}-${item.item_name}`}>
                  <TeamStatRow item={item} />
                  {showShotAfterRow && (
                    <ShotSummary
                      shotOnTarget={preparedRows.shotOnTarget}
                      shotOffTarget={preparedRows.shotOffTarget}
                    />
                  )}
                  {index !== preparedRows.rows.length - 1 &&
                    shouldShowTeamStatDivider(item, index, preparedRows.rows.length) && (
                      <i className={styles.divider} />
                    )}
                </React.Fragment>
              );
            })}
            {preparedRows.hasShotSummary &&
              !preparedRows.rows.some(
                (item) => item.item_name === '射门' || item.item_id === '83',
              ) && (
                <ShotSummary
                  shotOnTarget={preparedRows.shotOnTarget}
                  shotOffTarget={preparedRows.shotOffTarget}
                />
              )}
          </div>
        </>
      )}
    </section>
  );
};

export default TeamStats;
