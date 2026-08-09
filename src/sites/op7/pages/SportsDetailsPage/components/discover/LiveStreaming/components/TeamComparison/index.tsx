import React from 'react';

import type { BasketStateInfo, BasketTeamStats } from '@/apis/origin/discover';
import { formatStatValue, parsePair } from '../../utils';
import type { TeamDisplayInfo } from '../../types';
import TeamTitle from '../TeamTitle';
import styles from './index.module.scss';

interface TeamComparisonProps {
  stateInfo: BasketStateInfo;
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
  homeStats?: BasketTeamStats;
  awayStats?: BasketTeamStats;
}

/**
 * 篮球双方实时数据对比，包含投篮圆环、篮板/失误等横条和犯规叠层。
 */
const TeamComparison: React.FC<TeamComparisonProps> = ({
  stateInfo,
  homeTeam,
  awayTeam,
  homeStats,
  awayStats,
}) => {
  const [homeFouls, awayFouls] = parsePair(stateInfo['5']);

  return (
    <section className={styles.compareCard}>
      <div className={styles.compareTeams}>
        <TeamTitle logo={homeTeam.logo} name={homeTeam.name} side="home" />
        <TeamTitle logo={awayTeam.logo} name={awayTeam.name} side="away" reverse />
      </div>
      <div className={styles.ringRow}>
        <RingMetric title="2分球" value={stateInfo['2']} />
        <RingMetric title="3分球" value={stateInfo['1']} />
        <RingMetric title="罚球" value={stateInfo['3']} />
      </div>
      <BarComparisonSection
        stateInfo={stateInfo}
        homeStats={homeStats}
        awayStats={awayStats}
        homeFouls={homeFouls}
        awayFouls={awayFouls}
      />
    </section>
  );
};

const BarComparisonSection: React.FC<{
  stateInfo: BasketStateInfo;
  homeStats?: BasketTeamStats;
  awayStats?: BasketTeamStats;
  homeFouls: number;
  awayFouls: number;
}> = ({ stateInfo, homeStats, awayStats, homeFouls, awayFouls }) => (
  <div className={styles.barComparisonSection}>
    {/* 犯规按 EMC 篮球直播样式叠在篮板/失误区域两侧，标题和数量分别定位。 */}
    <div className={styles.foulOverlayLeft}>
      <span className={styles.foulBadge}>犯规</span>
      <span className={styles.foulValue}>{formatStatValue(homeFouls)}</span>
    </div>
    <div className={styles.foulOverlayRight}>
      <span className={styles.foulBadge}>犯规</span>
      <span className={styles.foulValue}>{formatStatValue(awayFouls)}</span>
    </div>
    <CompareBar title="篮板" home={homeStats?.total_rebounds} away={awayStats?.total_rebounds} />
    <CompareBar title="失误" home={homeStats?.turnovers} away={awayStats?.turnovers} />
    <CompareBar title="罚球命中率%" pair={stateInfo['6']} keepRatio />
    <CompareBar title="剩余暂停" pair={stateInfo['4']} />
  </div>
);

const RingMetric: React.FC<{ title: string; value?: string }> = ({ title, value }) => {
  const [home, away] = parsePair(value);
  const total = home + away;
  const homeRatio = total > 0 ? home / total : 0.5;

  return (
    <div className={styles.ringMetric}>
      <div className={styles.metricTitle}>{title}</div>
      <div className={styles.ringLine}>
        <strong>{formatStatValue(home)}</strong>
        <span
          className={styles.ring}
          style={{ '--ring-home': `${Math.round(homeRatio * 100)}%` } as React.CSSProperties}
        />
        <strong>{formatStatValue(away)}</strong>
      </div>
    </div>
  );
};

const CompareBar: React.FC<{
  title: string;
  home?: string;
  away?: string;
  pair?: string;
  keepRatio?: boolean;
}> = ({ title, home, away, pair, keepRatio }) => {
  const [homeValue, awayValue] = pair ? parsePair(pair) : [Number(home) || 0, Number(away) || 0];
  const total = homeValue + awayValue;
  const homeRatio = total > 0 ? homeValue / total : 0.5;
  const awayRatio = total > 0 ? awayValue / total : 0.5;

  return (
    <div className={styles.compareBar}>
      <div className={styles.metricTitle}>{title}</div>
      <div className={styles.barLine}>
        <span className={styles.sideNumber}>{formatStatValue(homeValue, keepRatio)}</span>
        <div className={styles.splitBars}>
          <span className={styles.homeTrack}>
            <i style={{ width: `${homeRatio * 100}%` }} />
          </span>
          <span className={styles.awayTrack}>
            <i style={{ width: `${awayRatio * 100}%` }} />
          </span>
        </div>
        <span className={styles.sideNumber}>{formatStatValue(awayValue, keepRatio)}</span>
      </div>
    </div>
  );
};

export default TeamComparison;
