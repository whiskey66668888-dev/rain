import React, { useState } from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';
import type { ChangePlayerV2, TeamLite } from '@/apis/origin/discover';
import TeamBadge from '../TeamBadge';
import { formatRating, getRatingTone } from '../../utils';
import styles from './index.module.scss';

const defaultMember = '/images/common/discover/lineup/default_memmber.png';

const ChangeCard: React.FC<{
  title: string;
  home?: ChangePlayerV2[];
  away?: ChangePlayerV2[];
  homeTeam: TeamLite;
  awayTeam: TeamLite;
}> = ({ title, home = [], away = [], homeTeam, awayTeam }) => {
  const [expanded, setExpanded] = useState(true);
  if (home.length === 0 && away.length === 0) return null;

  const renderPlayer = (
    shirtNum: string,
    logo: string,
    player: string,
    position: string,
    rating: string,
    alignRight = false,
  ) => {
    const ratingValue = formatRating(rating);
    const showRating = ratingValue !== '-';

    return (
      <div className={`${styles.playerCell} ${alignRight ? styles.rightPlayerCell : ''}`}>
        <span className={styles.shirtNumber}>{shirtNum ? `#${shirtNum}` : '-'}</span>
        <span className={styles.avatarWrap}>
          <LazyImage
            className={styles.playerAvatar}
            src={logo || defaultMember}
            alt=""
            fallback={defaultMember}
          />
          {showRating && (
            <span
              className={clsx(styles.playerMeta, styles[`rating-${getRatingTone(ratingValue)}`])}
            >
              {ratingValue}
            </span>
          )}
        </span>
        <span className={styles.playerInfo}>
          <span className={styles.playerName}>{player || '-'}</span>
          <span className={styles.small}>{position || '-'}</span>
        </span>
      </div>
    );
  };

  const renderChange = (item: ChangePlayerV2, index: number) => (
    <div className={styles.changeItem} key={`${item.time ?? ''}-${index}`}>
      {renderPlayer(
        item.in_shirt_num,
        item.in_player_logo,
        item.in_player,
        item.in_position,
        item.in_rating,
      )}
      <div className={styles.changeMeta}>
        <span className={styles.changeArrows}>
          <img src="/images/common/discover/lineup/changeup.png" />
          <img src="/images/common/discover/lineup/changedown.png" />
        </span>
        <span className={styles.minute}>{item.time ? `${item.time}'` : '-'}</span>
      </div>
      {renderPlayer(
        item.out_shirt_num,
        item.out_player_logo,
        item.out_player,
        item.out_position,
        item.out_rating,
        true,
      )}
    </div>
  );

  return (
    <section className={styles.panel}>
      <button
        className={styles.panelTitleButton}
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <h3>{title}</h3>
        <span className={expanded ? styles.arrowDown : styles.arrowUp} />
      </button>
      {expanded && (
        <div className={styles.teamList}>
          <div className={styles.teamBlock}>
            <TeamBadge team={homeTeam} />
            {home.map(renderChange)}
          </div>
          <div className={styles.line}></div>
          <div className={styles.teamBlock}>
            <TeamBadge team={awayTeam} />
            {away.map(renderChange)}
          </div>
        </div>
      )}
    </section>
  );
};

export default ChangeCard;
