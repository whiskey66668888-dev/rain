import React from 'react';
import clsx from 'clsx';

// components
import LazyImage from '@/common/components/LazyImage';
import Timing from '@/common/components/Timing';
// import SportScore from '../sportScore';
import FootballWebScoreboard from '../FootballWebScoreboard';

import { MatchBaseInfo } from '@/apis/commonSports/types';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
import { getSpecialSportScore } from '@/apis/fbSports/common/fbFormat';

// styles
import styles from './index.module.scss';

interface SportCardProps {
  matchInfo: MatchBaseInfo;
  /** true 为 H5（md），false 为 Web；Web 足球走球场大比分板 */
  isMobile: boolean;
}

/**
 * 赛事卡片（smallCard，仅本页轮播第一屏使用）
 */
const SportsCard: React.FC<SportCardProps> = ({ matchInfo, isMobile }) => {
  const {
    homeName,
    homeLogo,
    awayName,
    awayLogo,
    nameBold,
    homeScore,
    awayScore,
    matchDate,
    isLive,
    isEnded = false,
    matchPeriod,
    isCountdown,
    matchTime,
    sportId,
  } = matchInfo;

  /** 滚球中或已完场：展示阶段文案与比分；仅未开赛展示日期与开赛时间 */
  const hasStarted = isLive || isEnded;

  const getSportBackgroundAssetPc = (id: number | string | undefined): string => {
    switch (Number(id)) {
      case FBCompetitionMap.football.id:
        return 'Img_football_pc.webp';
      case FBCompetitionMap.basketball.id:
        return 'Img_basketball_pc.webp';
      case FBCompetitionMap.tennis.id:
        return 'Img_tennis_pc.webp';
      case FBCompetitionMap.volleyball.id:
      case FBCompetitionMap.beachVolleyball.id:
        return 'Img_volleyball_pc.webp';
      case FBCompetitionMap.pingPong.id:
        return 'Img_table_tennis_pc.webp';
      case FBCompetitionMap.snooker.id:
        return 'Img_snooker_pc.webp';
      case FBCompetitionMap.badminton.id:
        return 'Img_badminton_pc.webp';
      case FBCompetitionMap.baseball.id:
        return 'Img_baseball_pc.webp';
      case FBCompetitionMap.puck.id:
        return 'Img_ice_hockey_pc.webp';
      case FBCompetitionMap.uSFootball.id:
        return 'Img_american_football_pc.webp';
      case FBCompetitionMap.boxing.id:
        return 'Img_boxing_pc.webp';
      case FBCompetitionMap.cricket.id:
        return 'Img_cricket_pc.webp';
      default:
        return 'Img_football_pc.webp';
    }
  };

  const teamColorClasses = 'text-[var(--White-100)]';
  const leagueColorClasses = 'text-[var(--White-100)]';
  const kickoffTime = matchDate?.split(' ')?.[1] ?? '';
  const kickoffDateLabel = (() => {
    const datePart = matchDate?.split(' ')?.[0];
    if (!datePart) return '';
    const [mm, dd] = datePart.split('-');
    if (!mm || !dd) return datePart;
    return `${Number(mm)}月${Number(dd)}日`;
  })();

  if (!isMobile) {
    return (
      <div
        className={clsx(styles.sportsCard, styles.sportsCardFootballWeb)}
        style={{
          backgroundImage: `url('/images/common/sportsDetails/pc/${getSportBackgroundAssetPc(sportId)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <FootballWebScoreboard matchInfo={matchInfo} />
      </div>
    );
  }

  return (
    <div className={styles.sportsCard}>
      <div className={styles.teamsRow}>
        <div className={styles.teamsRowSide}>
          <LazyImage
            src={homeLogo}
            alt={homeName}
            className="w-34px h-34px flex-shrink-0"
            lazy={false}
          />
          <p
            className={clsx(styles.teamsRowTeamName, '_tf[14]', {
              'font-bold': nameBold === 'home',
            })}
          >
            <span className={styles.teamsRowTeamNameShort}>
              {homeName.length > 5 ? `${homeName.slice(0, 5)}...` : homeName}
            </span>
            <span className={styles.teamsRowTeamNameFull}>{homeName}</span>
          </p>
        </div>
        <div className={styles.teamsRowCenter}>
          {/* <p className={`w-full text-center _tf[12] font-weight-400 ${leagueColorClasses}`}>
            {isLive ? matchPeriod : matchDate}
          </p> */}
          <div
            className={`w-full text-center _tf[12] flex items-center justify-center gap-4px font-weight-400 ${leagueColorClasses}`}
          >
            <span>{hasStarted ? matchPeriod : kickoffDateLabel}</span>
            {isLive && matchTime !== 0 && (
              <Timing
                time={matchTime}
                running={isCountdown}
                isCountdown={matchInfo.clockType === 'DESC'}
              />
            )}
          </div>
          <p className={`text-center _tf[26] font-weight-500 font-din-pro ${teamColorClasses}`}>
            {hasStarted
              ? `${getSpecialSportScore(sportId, homeScore)} - ${getSpecialSportScore(sportId, awayScore)}`
              : kickoffTime || 'VS'}
          </p>
        </div>

        <div className={styles.teamsRowSide}>
          <LazyImage
            src={awayLogo}
            alt={awayName}
            className="w-34px h-34px flex-shrink-0"
            lazy={false}
          />
          <p
            className={clsx(styles.teamsRowTeamName, '_tf[14]', {
              'font-bold': nameBold === 'away',
            })}
          >
            <span className={styles.teamsRowTeamNameShort}>
              {awayName.length > 5 ? `${awayName.slice(0, 5)}...` : awayName}
            </span>
            <span className={styles.teamsRowTeamNameFull}>{awayName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SportsCard;
