import React from 'react';
import clsx from 'clsx';

import type { Player } from '@/apis/origin/discover';
import assistIcon from '@/sites/op7/images/common/discover/lineup/18.png';
import goalIcon from '@/sites/op7/images/common/discover/lineup/1.png';
import redCardIcon from '@/sites/op7/images/common/discover/lineup/4.png';
import subIcon from '@/sites/op7/images/common/discover/lineup/9.png';
import yellowCardIcon from '@/sites/op7/images/common/discover/lineup/3.png';
import type { PlayerOption } from '../../types';
import { getPlayerValue, getRatingTone } from '../../utils';
import styles from './index.module.scss';
import LazyImage from '@/common/components/LazyImage';

const defaultMember = '/images/common/discover/lineup/default_memmber.png';

const getEventCounts = (player: Player) => {
  const counts = { yellow: 0, red: 0, sub: 0, goal: 0, assist: 0 };
  (player.incidents ?? []).forEach((event) => {
    const type = Number(event.type);
    if (type === 3) counts.yellow += 1;
    else if (type === 4 || type === 15) counts.red += 1;
    else if (type === 9) counts.sub += 1;
    else if (type === 18) counts.assist += 1;
    else if (type === 1 && event.assist) counts.assist += 1;
    else if (type === 1) counts.goal += 1;
  });
  return counts;
};

const BadgeWithCount: React.FC<{ icon: string; count: number }> = ({ icon, count }) => {
  if (count <= 0) return null;
  if (count === 1) return <img src={icon} alt="" />;

  return (
    <span className={styles.countBadge}>
      <img src={icon} alt="" />
      <span>{count}</span>
    </span>
  );
};

const PlayerToken: React.FC<{
  player: Player;
  option: PlayerOption;
  side: 'home' | 'away';
}> = ({ player, option, side }) => {
  const value = getPlayerValue(player, option);
  const events = getEventCounts(player);
  const showMeta = option === 'national_logo' ? Boolean(player.national_logo) : value !== '-';

  return (
    <div className={clsx(styles.playerToken, side === 'away' && styles.awayPlayer)}>
      <div className={styles.avatarWrap}>
        <LazyImage
          className={styles.avatar}
          src={player.player_logo || defaultMember}
          alt=""
          fallback={defaultMember}
        />
        {(events.yellow > 0 || events.red > 0) && (
          <span className={styles.cardBadges}>
            {events.yellow > 0 && <img src={yellowCardIcon} alt="" />}
            {events.red > 0 && <img src={redCardIcon} alt="" />}
          </span>
        )}
        {events.sub > 0 && (
          <span className={styles.subBadge}>
            <img src={subIcon} alt="" />
          </span>
        )}
        {events.assist > 0 && (
          <span className={styles.assistBadge}>
            <BadgeWithCount icon={assistIcon} count={events.assist} />
          </span>
        )}
        {events.goal > 0 && (
          <span className={styles.goalBadge}>
            <BadgeWithCount icon={goalIcon} count={events.goal} />
          </span>
        )}
      </div>

      {showMeta &&
        (option === 'national_logo' ? (
          <img className={styles.flag} src={value} alt="" />
        ) : (
          <span
            className={clsx(
              styles.playerMeta,
              option === 'rating' && styles[`rating-${getRatingTone(value)}`],
            )}
          >
            {value}
          </span>
        ))}

      <span className={styles.playerName}>
        {player.shirt_num || '-'}.{player.player || '-'}
      </span>
    </div>
  );
};

export default PlayerToken;
