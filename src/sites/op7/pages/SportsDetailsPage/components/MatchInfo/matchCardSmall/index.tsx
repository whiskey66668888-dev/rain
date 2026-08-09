import React from 'react';

// components
import LazyImage from '@/common/components/LazyImage';
import Timing from '@/common/components/Timing';

import { MatchBaseInfo } from '@/apis/commonSports/types';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
import { getSpecialSportScore } from '@/apis/fbSports/common/fbFormat';

// styles
import styles from './index.module.scss';
import clsx from 'clsx';

const MatchCardSmall: React.FC<{
  matchInfo: MatchBaseInfo;
  visible: boolean;
  fixedStyle?: React.CSSProperties;
}> = ({ matchInfo, visible, fixedStyle }) => {
  const {
    isLive,
    isEnded = false,
    sportId,
    matchPeriod,
    nameBold,
    homeName,
    homeLogo,
    homeScore,
    awayName,
    awayLogo,
    awayScore,
    homeCornerKick,
    awayCornerKick,
    homeYellowCard,
    awayYellowCard,
    homeRedCard,
    awayRedCard,
    matchTime,
    isCountdown,
  } = matchInfo;

  const renderContent = () => {
    const isFootball = sportId === FBCompetitionMap.football.id;
    if (true) {
      return (
        <div className={styles.matchCardSmallContent}>
          {isFootball ? (
            <div className={styles.scoreWrapper}>
              <div className={styles.scoreItem}>
                <LazyImage
                  src={'/images/common/sportsDetails/corner_kick1.png'}
                  alt={'corner'}
                  className="h-10px w-8px"
                  lazy={false}
                />
                <span>{homeCornerKick}</span>
              </div>

              <div className={styles.scoreItem}>
                <LazyImage
                  src={'/images/common/sportsDetails/yellow_card.png'}
                  alt={'corner'}
                  className="h-10px w-8px"
                  lazy={false}
                />
                <span>{homeYellowCard}</span>
              </div>

              <div className={styles.scoreItem}>
                <LazyImage
                  src={'/images/common/sportsDetails/red_card.png'}
                  alt={'corner'}
                  className="h-10px w-8px"
                  lazy={false}
                />
                <span>{homeRedCard}</span>
              </div>
            </div>
          ) : null}

          <div className={styles.matchTeam}>
            <span className={clsx(nameBold === 'home' && 'font-bold')}>{homeName}</span>
            <LazyImage src={homeLogo} width={16} height={16} />
          </div>

          {isLive || isEnded ? (
            <div className={styles.liveText}>
              <div className={styles.status}>
                {matchPeriod}
                {/* 完场后不再走表 */}
                {isLive && (
                  <Timing
                    time={matchTime}
                    running={isCountdown}
                    isCountdown={matchInfo.clockType === 'DESC'}
                  />
                )}
              </div>
              <div
                className={styles.score}
              >{`${getSpecialSportScore(sportId, homeScore)} - ${getSpecialSportScore(sportId, awayScore)}`}</div>
            </div>
          ) : (
            <div></div>
          )}

          <div className={styles.matchTeam}>
            <LazyImage src={awayLogo} width={16} height={16} />
            <span className={clsx(nameBold === 'away' && 'font-bold')}>{awayName}</span>
          </div>
          {isFootball ? (
            <div className={styles.scoreWrapper}>
              <div className={styles.scoreItem}>
                <LazyImage
                  src={'/images/common/sportsDetails/corner_kick1.png'}
                  alt={'corner'}
                  className="h-10px w-8px"
                  lazy={false}
                />
                <span>{awayCornerKick}</span>
              </div>

              <div className={styles.scoreItem}>
                <LazyImage
                  src={'/images/common/sportsDetails/yellow_card.png'}
                  alt={'corner'}
                  className="h-10px w-8px"
                  lazy={false}
                />
                <span>{awayYellowCard}</span>
              </div>

              <div className={styles.scoreItem}>
                <LazyImage
                  src={'/images/common/sportsDetails/red_card.png'}
                  alt={'corner'}
                  className="h-10px w-8px"
                  lazy={false}
                />
                <span>{awayRedCard}</span>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={clsx(styles.matchCardSmall, visible ? styles.show : '')} style={fixedStyle}>
      {renderContent()}
    </div>
  );
};

export default MatchCardSmall;
