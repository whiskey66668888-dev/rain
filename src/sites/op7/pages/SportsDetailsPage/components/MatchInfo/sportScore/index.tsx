import React from 'react';
import clsx from 'clsx';

import { MatchBaseInfo } from '@/apis/commonSports/types';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';

// styles
import styles from './index.module.scss';

const SportScore: React.FC<{ matchInfo: MatchBaseInfo; rootClassName?: string }> = ({
  matchInfo,
  rootClassName,
}) => {
  const {
    sportId,
    isLive,
    isEnded = false,
    matchStatusId,
    firstHalfScore,
    halfTimeScore,
    homeCornerKick = 0,
    awayCornerKick = 0,
    homeYellowCard = 0,
    awayYellowCard = 0,
    homeRedCard = 0,
    awayRedCard = 0,
    scoreAll = [],
  } = matchInfo;

  /** 足球 sportId */
  const isFootball = sportId === FBCompetitionMap.football.id;
  // 完场后角球/红黄牌/半场比分仍需展示，故与滚球同口径
  const showScore = isFootball ? (isLive || isEnded) && matchStatusId !== 4 : scoreAll.length > 0;

  if (!showScore) return null;

  if (isFootball) {
    const displayHalfScore = firstHalfScore || halfTimeScore;
    const parts = [
      displayHalfScore && (
        <React.Fragment key="half">
          <img src={'/images/common/hf_1.svg'} alt={'corner'} className="h-12px w-12px" />
          <span className={`${styles.halfTimeScore} _tf[12] mb[-1px] mr-[6px]`}>
            {displayHalfScore}
          </span>
        </React.Fragment>
      ),

      <React.Fragment key="corner">
        <img
          src={'/images/common/sportsDetails/corner_kick1.png'}
          alt={'corner'}
          className="h-12px w-8px"
        />
        <span className={`${styles.halfTimeScore} _tf[12] mb[-2px] mr-[6px]`}>
          {homeCornerKick}-{awayCornerKick}
        </span>
      </React.Fragment>,

      <React.Fragment key="yellow">
        <img
          src={'/images/common/sportsDetails/yellow_card.png'}
          alt={'corner'}
          className="h-12px w-10px"
        />
        <span
          key="yellow"
          className={`${styles.halfTimeScore} ${styles.scoreFlagYellow} _tf[12] mb[-2px]  mr-[6px]`}
        >
          {homeYellowCard}-{awayYellowCard}
        </span>
      </React.Fragment>,
      <React.Fragment key="red">
        <img
          src={'/images/common/sportsDetails/red_card.png'}
          alt={'corner'}
          className="h-12px w-10px"
        />
        <span
          key="red"
          className={`${styles.halfTimeScore} ${styles.scoreFlagRed} _tf[12] mb[-2px]`}
        >
          {homeRedCard}-{awayRedCard}
        </span>
      </React.Fragment>,
    ].filter(Boolean);

    return <div className={clsx(styles.halfTimeRow, rootClassName)}>{parts}</div>;
  }

  if (scoreAll.length === 0) return null;
  return (
    <div className={clsx(styles.halfTimeRow, rootClassName)}>
      {scoreAll.map((value, index) => (
        <span
          key={index}
          className={`${styles.halfTimeScore}  _tf[12]`}
          style={{
            color: index === scoreAll.length - 1 ? 'var(--ThemeColor-Main)' : undefined,
          }}
        >
          {value}
        </span>
      ))}
    </div>
  );
};

export default SportScore;
