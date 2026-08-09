import React, { useRef, useEffect } from 'react';

import { MatchBaseInfo } from '@/apis/commonSports/types';

import styles from './MatchItemSimple.module.scss';
import Icon from '@/common/components/Icon';
import clsx from 'clsx';
import Timing from '@/common/components/Timing';
import LazyImage from '@/common/components/LazyImage';
import { SportIdForView } from '@/apis/commonSports/constants';
import BettingOdds from '../BettingOdds';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';
import { useInView } from 'react-intersection-observer';
import Popover from '@/common/components/Popover';
import { getSpecialSportScore, isFBMatchEnded } from '@/apis/fbSports/common/fbFormat';
import { useAppSelector } from '@/core/store/hooks';

interface MatchItemSimpleProps {
  match: MatchBaseInfo;
  changePinnedMatchStatus: (matchId: number, type: 'add' | 'remove') => void;
  /** 强制使用移动端样式，用于弹窗等场景 */
  forceMobile?: boolean;
  /** 三行盘口在 OddBtn 内是否使用纵向布局 */
  threeLineColumn?: boolean;
  hideMatchNum?: boolean;
  /** 右侧栏等窄容器：左侧信息区 150px */
  compactLeftInfo?: boolean;
  isLast?: boolean;
  onMatchClick?: (matchId: string | number) => void;
  lotterySportTips?: string; // 竞猜赛事周数
}

/**
 * @description 比赛项组件
 */
const MatchItemSimple: React.FC<MatchItemSimpleProps> = ({
  match,
  // changePinnedMatchStatus,
  forceMobile,
  threeLineColumn,
  hideMatchNum,
  compactLeftInfo,
  isLast,
  onMatchClick,
  lotterySportTips,
}) => {
  const navigate = useNavigateWithLanguage();
  const { ref, inView: matchInView } = useInView({
    threshold: 0,
  });
  const scoreListRef = useRef<HTMLDivElement>(null);
  const simpleActiveItem = useAppSelector(
    (state) => state.sport.mainList.settings.simpleActiveItem,
  );
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const isThreeRowOdds = simpleActiveItem?.row === 3;

  const isLive = match.isLive;
  // 完场态：赛果接口(matchStatusId=3) 与 live 列表(periodName='已结束') 双口径，与 MatchItem 保持一致
  const isEnded = isFBMatchEnded(match);
  // 是否展示比分：滚球中，或已完场且赛果已就绪（占位态 scorePending 时不展示，避免误显示 0-0）
  const showScore = isLive || (isEnded && !match.scorePending);

  // 篮球等横向滚动的比分列表默认滚到最右侧（最新一节）
  useEffect(() => {
    if (!matchInView) return;
    const el = scoreListRef.current;
    if (!el) return;
    const scrollToEnd = () => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    };
    scrollToEnd();
    const t = requestAnimationFrame(scrollToEnd);
    return () => cancelAnimationFrame(t);
  }, [matchInView, match.viewId, match.scoreAll]);
  const toggleDetail = () => {
    onMatchClick?.(match.matchId);
    navigate(generatePath(PATHS.sportsDetail, { matchId: String(match.matchId) }));
  };

  return (
    <div className={clsx(styles.matchItem, isLast && styles.noBorder)} ref={ref}>
      {matchInView && (
        <>
          <section
            className={clsx(styles.leftInfo, {
              [styles.leftInfoThreeRow as string]: isThreeRowOdds,
              [styles.leftInfoCompact as string]: compactLeftInfo,
            })}
          >
            <div className={clsx(styles.leftTitle, '_tf[12]')}>
              <div className={styles.titleLeftBox}>
                {/* <Icon
                  src="/images/common/pin.svg"
                  size="12px"
                  color={match.matchPinned ? '#1A81FF' : 'var(--Text-800)'}
                  className={styles.titleIcon}
                  onClick={() =>
                    changePinnedMatchStatus(match.matchId, match.matchPinned ? 'remove' : 'add')
                  }
                /> */}
                <span>{match.isLive || isEnded ? match.periodName : match.matchDate}</span>
                {match.isLive && match.matchTime !== 0 && (
                  <Timing
                    time={match.matchTime}
                    running={match.isCountdown}
                    isCountdown={match.clockType === 'DESC'}
                  />
                )}
                {match.hasVideo && !isMobile && (
                  <Icon
                    src="/images/common/sportsDetails/video_icon.svg"
                    size={12}
                    color={'var(--ThemeColor-Main)'}
                    className={styles.videoIcon}
                  />
                )}
              </div>
              {/* <span onClick={toggleDetail}>{match.matchNum}</span> */}
              <div
                ref={scoreListRef}
                className={clsx(styles.scoreList, '_tf[12]', {
                  [styles.specialScoreList as string]: match.viewId !== SportIdForView.Football,
                })}
              >
                {(match.scoreAll ?? []).map((score, index, arr) => (
                  <div
                    className={clsx({
                      [styles.scoreItemHighlight as string]:
                        match.viewId !== SportIdForView.Football && index === arr.length - 1,
                    })}
                    key={score + index}
                  >
                    {score}
                  </div>
                ))}

                {match.halfTimeScore && [SportIdForView.Football].includes(match.viewId) && (
                  <div>
                    <Icon
                      src="/images/common/hf.svg"
                      size="10px"
                      color="var(--Text-800)"
                      className=" mt-[-2px]"
                    />
                    <span>{match.halfTimeScore}</span>
                  </div>
                )}
                {
                  // 足球的角球比分
                  match.viewId === SportIdForView.Football && isLive && (
                    <div>
                      <Icon
                        src="/images/common/corner.svg"
                        className=" mt-[-2px]"
                        size="10px"
                        color="var(--Text-800)"
                      />
                      <span>
                        {match.homeCornerKick}-{match.awayCornerKick}
                      </span>
                    </div>
                  )
                }
              </div>
            </div>
            <div className={styles.teams} onClick={toggleDetail}>
              <TeamInfo
                logo={match.homeLogo}
                name={match.homeName}
                score={match.homeScore}
                isLive={isLive}
                showScore={showScore}
                redCard={match.homeRedCard}
                yellowCard={match.homeYellowCard}
                bold={match.nameBold === 'home'}
                sportId={match.sportId}
              />
              <TeamInfo
                logo={match.awayLogo}
                name={match.awayName}
                score={match.awayScore}
                isLive={isLive}
                showScore={showScore}
                redCard={match.awayRedCard}
                yellowCard={match.awayYellowCard}
                bold={match.nameBold === 'away'}
                sportId={match.sportId}
              />
            </div>
            {lotterySportTips && (
              <p className="_tf[10] text-[var(--Text-800)] mb-[5px] din-pro">{lotterySportTips}</p>
            )}
          </section>
          <section className={styles.rightInfo}>
            <BettingOdds
              match={match}
              isPro={false}
              forceMobile={forceMobile}
              threeLineColumn={threeLineColumn}
              hideMatchNum={hideMatchNum}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default MatchItemSimple;

const TeamInfo: React.FC<{
  logo: string;
  name: string;
  score: number;
  isLive: boolean;
  /** 是否展示比分（滚球中或完场都展示） */
  showScore?: boolean;
  redCard?: number;
  yellowCard?: number;
  bold?: boolean;
  sportId: number;
}> = React.memo(({ logo, name, score, isLive, showScore, redCard, bold, sportId }) => {
  return (
    <div className={clsx(styles.teamInfo, '_tf[14]')}>
      <div className={styles.team}>
        <LazyImage
          src={logo}
          alt={name}
          width={16}
          height={16}
          fallback={'/images/common/logo_small.png'}
          placeholder={
            <img width={16} height={16} src="/images/common/logo_small.png" alt={name} />
          }
        />
        <Popover content={name}>
          <span className={clsx('line-clamp-1', bold && 'font-bold')}>{name}</span>
        </Popover>
      </div>
      {(showScore ?? isLive) && (
        <div className={clsx(styles.score, '_tf[18]')}>
          {isLive && !!(redCard && redCard !== 0) && (
            <span className={clsx(styles.redCard, '_tf[10]')}>{redCard}</span>
          )}
          {/* {!!(yellowCard && yellowCard !== 0) && (
            <span className={styles.yellowCard}>{yellowCard}</span>
          )} */}
          <span className={styles.teamScore}>{getSpecialSportScore(sportId, score)}</span>
        </div>
      )}
    </div>
  );
});
