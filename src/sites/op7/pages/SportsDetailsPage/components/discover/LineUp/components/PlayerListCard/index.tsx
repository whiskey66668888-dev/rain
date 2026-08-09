import React, { useState } from 'react';

import LazyImage from '@/common/components/LazyImage';
import type { LineUpBenchPlayer, TeamLite } from '@/apis/origin/discover';
import TeamBadge from '../TeamBadge';
import styles from './index.module.scss';

const defaultMember = '/images/common/discover/lineup/default_memmber.png';

const PlayerListCard: React.FC<{
  title: string;
  home?: LineUpBenchPlayer[];
  away?: LineUpBenchPlayer[];
  homeTeam: TeamLite;
  awayTeam: TeamLite;
}> = ({ title, home = [], away = [], homeTeam, awayTeam }) => {
  const [expanded, setExpanded] = useState(true);
  if (home.length === 0 && away.length === 0) return null;

  const renderPlayer = (player: LineUpBenchPlayer, index: number) => (
    <div className={styles.listPlayer} key={`${player.player ?? ''}-${index}`}>
      <span className={styles.shirtNumber}>{player.shirt_num ? `#${player.shirt_num}` : '-'}</span>
      <LazyImage
        className={styles.playerAvatar}
        src={player.player_logo || defaultMember}
        alt=""
        fallback={defaultMember}
      />
      <span className={styles.playerInfo}>
        <span className={styles.playerName}>{player.player || '-'}</span>
        <span className={styles.playerPosition}>{player.position || '-'}</span>
      </span>
    </div>
  );

  return (
    <section className={styles.panel}>
      <button
        className={styles.panelTitleButton}
        type="button"
        onClick={() => setExpanded((value) => !value)}
      >
        <h3>{title}</h3>
        <span className={expanded ? styles.arrowDown : styles.arrowUp} />
      </button>
      {expanded && (
        <div className={styles.dualColumn}>
          <div className={styles.team}>
            <TeamBadge team={homeTeam} />
            {home.map(renderPlayer)}
          </div>
          <div className={styles.line}></div>
          <div className={styles.team}>
            <TeamBadge team={awayTeam} />
            {away.map(renderPlayer)}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlayerListCard;
