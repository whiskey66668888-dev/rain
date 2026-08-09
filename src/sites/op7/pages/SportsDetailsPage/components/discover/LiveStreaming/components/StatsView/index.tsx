import React from 'react';
import clsx from 'clsx';

import type { BasketMaxStatItem, BasketPlayerStats, BasketTeamStats } from '@/apis/origin/discover';
import LazyImage from '@/common/components/LazyImage';
import { DEFAULT_AVATAR, DEFAULT_AWAY_TEAM_ICON, DEFAULT_HOME_TEAM_ICON } from '../../constants';
import type { StatsTab, TeamDisplayInfo } from '../../types';
import { getDisplayName } from '../../utils';
import EmptyState from '../EmptyState';
import SegmentedTabs from '../SegmentedTabs';
import TeamTitle from '../TeamTitle';
import styles from './index.module.scss';

interface StatsViewProps {
  activeTab: StatsTab;
  onTabChange: (tab: StatsTab) => void;
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
  homePlayers: BasketPlayerStats[];
  awayPlayers: BasketPlayerStats[];
  hasPlayerStats: boolean;
  homeStats?: BasketTeamStats;
  awayStats?: BasketTeamStats;
  homeMaxStats?: Record<string, BasketMaxStatItem>;
  guestMaxStats?: Record<string, BasketMaxStatItem>;
}

/**
 * 数据统计面板，内部包含球员统计、球队统计和单项最高统计三种视图。
 */
const StatsView: React.FC<StatsViewProps> = ({
  activeTab,
  onTabChange,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  hasPlayerStats,
  homeStats,
  awayStats,
  homeMaxStats,
  guestMaxStats,
}) => (
  <div className={styles.statsView}>
    <SegmentedTabs
      variant="subtle"
      tabs={[
        { key: 'player', label: '球员统计' },
        { key: 'team', label: '球队统计' },
        { key: 'max', label: '各项最高统计' },
      ]}
      activeKey={activeTab}
      onChange={onTabChange}
    />
    {activeTab === 'player' && (
      <PlayerStatsPanel
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homePlayers={homePlayers}
        awayPlayers={awayPlayers}
        hasPlayerStats={hasPlayerStats}
      />
    )}
    {activeTab === 'team' && (
      <TeamStatsPanel
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeStats={homeStats}
        awayStats={awayStats}
      />
    )}
    {activeTab === 'max' && (
      <MaxStatsPanel
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeMaxStats={homeMaxStats}
        guestMaxStats={guestMaxStats}
      />
    )}
  </div>
);

const playerColumns: Array<{
  key: keyof BasketPlayerStats;
  label: string;
  fallback: string;
}> = [
  { key: 'playing_time', label: '时间', fallback: '0' },
  { key: 'points', label: '得分', fallback: '0' },
  { key: 'total_rebounds', label: '篮板', fallback: '0' },
  { key: 'assists', label: '助攻', fallback: '0' },
  { key: 'field_goals', label: '投篮', fallback: '0-0' },
  { key: 'three_point_goals', label: '三分', fallback: '0-0' },
  { key: 'free_throws', label: '罚球', fallback: '0-0' },
  { key: 'steals', label: '抢断', fallback: '0' },
  { key: 'blocks', label: '盖帽', fallback: '0' },
  { key: 'turnovers', label: '失误', fallback: '0' },
  { key: 'personal_fouls', label: '犯规', fallback: '0' },
  { key: 'offensive_rebounds', label: '前板', fallback: '0' },
  { key: 'defensive_rebounds', label: '后板', fallback: '0' },
  { key: 'plus_minus', label: '正负值', fallback: '0' },
];

const PlayerStatsPanel: React.FC<{
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
  homePlayers: BasketPlayerStats[];
  awayPlayers: BasketPlayerStats[];
  hasPlayerStats: boolean;
}> = ({ homeTeam, awayTeam, homePlayers, awayPlayers, hasPlayerStats }) => {
  if (!hasPlayerStats) return <EmptyState />;
  return (
    <div className={styles.playerStats}>
      <div className={styles.statsNote}>
        <strong>球员统计</strong>
        <span>*前5名为首发球员，场上球员红色名字</span>
      </div>
      <div className={styles.playerTableSlot}>
        <PlayerTable team={homeTeam} players={homePlayers} side="home" />
      </div>
      <div className={styles.playerTableSlot}>
        <PlayerTable team={awayTeam} players={awayPlayers} side="away" />
      </div>
    </div>
  );
};

const PlayerTable: React.FC<{
  team: TeamDisplayInfo;
  players: BasketPlayerStats[];
  side: 'home' | 'away';
}> = ({ team, players, side }) => {
  if (players.length === 0) return null;
  const fallback = side === 'home' ? DEFAULT_HOME_TEAM_ICON : DEFAULT_AWAY_TEAM_ICON;

  return (
    <div>
      <div className={styles.playerTeamTitle}>
        <LazyImage
          className={styles.playerTeamLogo}
          imageClassName={styles.playerTeamLogo}
          src={team.logo || fallback}
          fallback={fallback}
          width={20}
          height={20}
          alt=""
        />
        <span>{team.name || '-'}</span>
      </div>
      <div className={styles.statsTableWrap}>
        <div className={styles.statsTable}>
          <div className={clsx(styles.statsRow, styles.statsHeader)}>
            <div className={styles.playerNameCell}>球员</div>
            {playerColumns.map((column) => (
              <div key={column.key}>{column.label}</div>
            ))}
          </div>
          {players.map((player, index) => (
            <div
              key={player.player_id || `${player.chinese_name}-${index}`}
              className={clsx(
                styles.statsRow,
                index % 2 === 1 && styles.alternateStatsRow,
                index === 4 && styles.starterBoundary,
              )}
            >
              <div className={styles.playerNameCell}>
                {/* EMC 当前逻辑：is_on_court 不为 1 时显示红色。 */}
                <span className={player.is_on_court !== '1' ? styles.emcRedName : undefined}>
                  {getDisplayName(player.chinese_name, player.english_name)}
                </span>
              </div>
              {playerColumns.map((column) => (
                <div key={column.key}>{player[column.key] ?? column.fallback}</div>
              ))}
            </div>
          ))}
        </div>
        <img className={styles.statsScrollHint} src="/images/common/vip/arrow_left.png" alt="" />
      </div>
    </div>
  );
};

const teamStatRows: Array<{ label: string; key: keyof BasketTeamStats; isPercent?: boolean }> = [
  { label: '得分', key: 'points' },
  { label: '篮板', key: 'total_rebounds' },
  { label: '投篮命中率', key: 'field_points' },
  { label: '三分命中率', key: 'three_points' },
  { label: '罚球命中率', key: 'free_points' },
];

const TeamStatsPanel: React.FC<{
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
  homeStats?: BasketTeamStats;
  awayStats?: BasketTeamStats;
}> = ({ homeTeam, awayTeam, homeStats, awayStats }) => {
  if (!homeStats || !awayStats) return <EmptyState />;
  return (
    <div className={styles.teamStatsList}>
      <StatsSectionHeader title="球队统计" homeTeam={homeTeam} awayTeam={awayTeam} />
      {teamStatRows.map((row) => (
        <TeamStatsCompareRow
          key={row.key}
          label={row.label}
          homeValue={homeStats[row.key]}
          awayValue={awayStats[row.key]}
          isPercent={row.isPercent ?? row.key.includes('points')}
        />
      ))}
    </div>
  );
};

const TeamStatsCompareRow: React.FC<{
  label: string;
  homeValue?: string;
  awayValue?: string;
  isPercent?: boolean;
}> = ({ label, homeValue, awayValue, isPercent }) => {
  const homeNumber = parseStatNumber(homeValue);
  const awayNumber = parseStatNumber(awayValue);
  const isEmpty = homeNumber === 0 && awayNumber === 0;
  const total = isPercent ? 100 : homeNumber + awayNumber || 1;
  const homeRatio = isEmpty ? 0.5 : Math.min(Math.max(homeNumber / total, 0), 1);
  const awayRatio = isEmpty ? 0.5 : Math.min(Math.max(awayNumber / total, 0), 1);

  return (
    <div className={styles.teamStatsRow}>
      <span className={styles.teamStatsValue}>{formatTeamStatText(homeValue, isPercent)}</span>
      <div className={styles.teamStatsTrack}>
        <i className={styles.teamStatsHomeBar} style={{ width: `${homeRatio * 100}%` }} />
      </div>
      <strong>{label}</strong>
      <div className={styles.teamStatsTrack}>
        <i className={styles.teamStatsAwayBar} style={{ width: `${awayRatio * 100}%` }} />
      </div>
      <span className={styles.teamStatsValue}>{formatTeamStatText(awayValue, isPercent)}</span>
    </div>
  );
};

const maxStatRows: Array<{ key: string; label: string; fallback?: string }> = [
  { key: 'points', label: '得分' },
  { key: 'rebounds', label: '篮板' },
  { key: 'assists', label: '助攻' },
  { key: 'steals', label: '抢断' },
  { key: 'blocks', label: '盖帽' },
  { key: 'playing_time', label: '时间', fallback: 'minutes' },
  { key: 'turnovers', label: '失误' },
  { key: 'personal_fouls', label: '犯规', fallback: 'fouls' },
];

const MaxStatsPanel: React.FC<{
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
  homeMaxStats?: Record<string, BasketMaxStatItem>;
  guestMaxStats?: Record<string, BasketMaxStatItem>;
}> = ({ homeTeam, awayTeam, homeMaxStats, guestMaxStats }) => {
  const rows = maxStatRows
    .map((row) => ({
      ...row,
      homeItem:
        homeMaxStats?.[row.key] ?? (row.fallback ? homeMaxStats?.[row.fallback] : undefined),
      awayItem:
        guestMaxStats?.[row.key] ?? (row.fallback ? guestMaxStats?.[row.fallback] : undefined),
    }))
    .filter((row) => row.homeItem || row.awayItem);

  if (rows.length === 0) return <EmptyState />;
  return (
    <div className={styles.maxStatsList}>
      <StatsSectionHeader title="各项最高统计" homeTeam={homeTeam} awayTeam={awayTeam} />
      {rows.map((row) => (
        <MaxStatsRow
          key={row.key}
          label={row.label}
          homeItem={row.homeItem}
          awayItem={row.awayItem}
        />
      ))}
    </div>
  );
};

const StatsSectionHeader: React.FC<{
  title: string;
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
}> = ({ title, homeTeam, awayTeam }) => (
  <div className={styles.statsSectionHeader}>
    <h4>{title}</h4>
    <div className={styles.statsTeamRow}>
      <TeamTitle logo={homeTeam.logo} name={homeTeam.name} side="home" />
      <TeamTitle logo={awayTeam.logo} name={awayTeam.name} side="away" reverse />
    </div>
  </div>
);

const MaxStatsRow: React.FC<{
  label: string;
  homeItem?: BasketMaxStatItem;
  awayItem?: BasketMaxStatItem;
}> = ({ label, homeItem, awayItem }) => {
  const homeValue = parseStatNumber(homeItem?.value);
  const awayValue = parseStatNumber(awayItem?.value);
  const total = homeValue + awayValue;
  const homeRatio = total === 0 ? 0.5 : Math.max(homeValue / total, 0.08);
  const awayRatio = total === 0 ? 0.5 : Math.max(awayValue / total, 0.08);
  const awayIsZero = (awayItem?.value ?? '0') === '0';
  const homeIsZero = (homeItem?.value ?? '0') === '0';

  return (
    <div className={styles.maxStatsRow}>
      <div className={styles.maxStatsPlayers}>
        <MaxStatPlayer item={homeItem} />
        <strong>{label}</strong>
        <MaxStatPlayer item={awayItem} reverse />
      </div>
      <div className={styles.maxStatsBars}>
        <span
          className={clsx(styles.maxStatsBar, awayIsZero && styles.maxStatsBarEmpty)}
          style={{ flex: homeRatio }}
        >
          {homeItem?.value ?? '0'}
        </span>
        <span
          className={clsx(
            styles.maxStatsBar,
            styles.maxStatsAwayBar,
            homeIsZero && styles.maxStatsBarEmpty,
          )}
          style={{ flex: awayRatio }}
        >
          {awayItem?.value ?? '0'}
        </span>
      </div>
    </div>
  );
};

const MaxStatPlayer: React.FC<{ item?: BasketMaxStatItem; reverse?: boolean }> = ({
  item,
  reverse,
}) => (
  <div className={clsx(styles.maxStatPlayer, reverse && styles.maxStatPlayerReverse)}>
    <LazyImage
      className={styles.maxStatAvatar}
      imageClassName={styles.maxStatAvatar}
      src={item?.player_logo || DEFAULT_AVATAR}
      fallback={DEFAULT_AVATAR}
      width={30}
      height={30}
      alt=""
    />
    <span>{item?.player_name || '-'}</span>
  </div>
);

const parseStatNumber = (value?: string): number => Number(value?.replace('%', '')) || 0;

const formatTeamStatText = (value?: string, isPercent?: boolean): string => {
  const text = value || '0';
  if (isPercent) return text.includes('%') ? text : `${text}%`;
  const number = parseStatNumber(text);
  return number === Math.trunc(number) ? String(Math.trunc(number)) : text;
};

export default StatsView;
