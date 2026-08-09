import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import Empty from '@/common/components/Empty';
import LazyImage from '@/common/components/LazyImage';
import type { PlayerStat, TeamLite } from '@/apis/origin/discover';
import jerseyAway from '@/sites/op7/images/common/discover/lineup/jersey_away.png';
import jerseyHome from '@/sites/op7/images/common/discover/lineup/jersey_home.png';
import styles from './index.module.scss';

type PlayerStatTab = 'attack' | 'defense' | 'pass';

const playerTabs: Array<{ key: PlayerStatTab; label: string }> = [
  { key: 'attack', label: '进攻' },
  { key: 'defense', label: '防守' },
  { key: 'pass', label: '传球' },
];

const fallbackLogo = '/images/common/logo_small.png';

const getHeaders = (tab: PlayerStatTab): string[] => {
  if (tab === 'attack') return ['进球/点球', '助攻', '黄/红牌', '射门'];
  if (tab === 'defense') return ['抢断', '拦截', '封堵', '解围', '黄/红牌'];
  return ['关键传球', '成功传球', '成功传球率'];
};

const getValues = (player: PlayerStat, tab: PlayerStatTab): string[] => {
  if (tab === 'attack') {
    return [
      `${player.att?.goals || '0'}/${player.att?.penalty || '0'}`,
      player.att?.assists || '0',
      `${player.att?.yellow_cards || '0'}/${player.att?.red_cards || '0'}`,
      player.att?.shots || '0',
    ];
  }

  if (tab === 'defense') {
    return [
      player.def?.tackles || '0',
      player.def?.interceptions || '0',
      player.def?.blocked_shots || '0',
      player.def?.clearances || '0',
      `${player.def?.yellow_cards || '0'}/${player.def?.red_cards || '0'}`,
    ];
  }

  return [
    player.pass?.key_passes || '0',
    player.pass?.passes_accuracy || '0',
    player.pass?.passes_accuracy_rate || '-',
  ];
};

const PlayerTable: React.FC<{
  team: TeamLite;
  players: PlayerStat[];
  side: 'home' | 'away';
}> = ({ team, players, side }) => {
  const [activeTab, setActiveTab] = useState<PlayerStatTab>('attack');
  const rows = useMemo(() => players, [players]);
  const headers = getHeaders(activeTab);
  const columnClass =
    headers.length === 5
      ? styles.columns5
      : headers.length === 4
        ? styles.columns4
        : styles.columns3;
  const shirtIcon = side === 'home' ? jerseyHome : jerseyAway;

  return (
    <section className={styles.playerTable}>
      <header className={styles.panelHeader}>
        <div className={styles.teamInfo}>
          <LazyImage
            src={team.logo || fallbackLogo}
            alt={team.name || (side === 'home' ? '主队' : '客队')}
            width={24}
            height={24}
            lazy={false}
            fallback={fallbackLogo}
          />
          <h4>{team.name || (side === 'home' ? '主队' : '客队')}</h4>
        </div>
        <div className={styles.innerTabs}>
          {playerTabs.map((tab) => (
            <button
              type="button"
              className={clsx(activeTab === tab.key && styles.activeInnerTab)}
              onClick={() => setActiveTab(tab.key)}
              key={tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.tableWrap}>
        <div className={clsx(styles.playerHead, columnClass)}>
          <span>
            <b>球员</b>
            <b>时间</b>
          </span>
          {headers.map((header) => (
            <span key={header}>{header}</span>
          ))}
        </div>

        {rows.length === 0 ? (
          <Empty
            variant="card"
            className="h-[128px]"
            imgWrapClassName="w-[56px] h-[56px]"
            iconClassName="w-[28px] h-[28px]"
            textClassName="_tf[13]"
          />
        ) : (
          rows.map((player, index) => (
            <div
              className={clsx(styles.playerRow, columnClass)}
              key={`${player.player_id ?? ''}-${index}`}
            >
              <span className={styles.playerCell}>
                <span className={styles.shirt}>
                  <img src={shirtIcon} alt="" />
                  <b>{player.shirt_num || '-'}</b>
                  <em>{player.player || '-'}</em>
                </span>
                <strong>{player.minutes_played ? `${player.minutes_played}'` : '-'}</strong>
              </span>
              {getValues(player, activeTab).map((value, valueIndex) => (
                <span key={`${player.player_id}-${activeTab}-${valueIndex}`}>{value}</span>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PlayerTable;
