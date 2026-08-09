import React, { useMemo } from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';
import Timing from '@/common/components/Timing';
import { MatchBaseInfo } from '@/apis/commonSports/types';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
import { getSpecialSportScore } from '@/apis/fbSports/common/fbFormat';

import styles from './index.module.scss';

function parseHalfScore(s: string): [number, number] {
  if (!s) return [0, 0];
  const nums = String(s).match(/\d+/g);
  if (!nums || nums.length < 2) return [0, 0];
  const a = parseInt(nums[0] ?? '0', 10);
  const b = parseInt(nums[1] ?? '0', 10);
  return [Number.isNaN(a) ? 0 : a, Number.isNaN(b) ? 0 : b];
}

function parseStageScorePair(value: string): [string, string] {
  const nums = String(value ?? '').match(/\d+/g);
  if (!nums || nums.length < 2) return ['-', '-'];
  return [nums[0] ?? '-', nums[1] ?? '-'];
}

/** 篮球固定 4 节；列顺序 Q1、Q2、1H、Q3、Q4、2H、FT */
const BASKETBALL_FIXED_QUARTER_COUNT = 4;
const BASKETBALL_HEADER_COLUMNS = ['Q1', 'Q2', '1H', 'Q3', 'Q4', '2H', 'FT'] as const;

function isBasketballQuarterStarted(scoreAll: string[], index: number): boolean {
  const raw = scoreAll[index];
  return raw != null && String(raw).trim() !== '';
}

function parseBasketballQuarterScore(scoreAll: string[], index: number): [string, string] {
  if (!isBasketballQuarterStarted(scoreAll, index)) return ['-', '-'];
  return parseStageScorePair(scoreAll[index]!);
}

function sumBasketballQuarterRange(
  homeScores: string[],
  awayScores: string[],
  scoreAll: string[],
  start: number,
  end: number,
): [string, string] {
  for (let i = start; i < end; i++) {
    if (!isBasketballQuarterStarted(scoreAll, i)) return ['-', '-'];
  }
  let homeSum = 0;
  let awaySum = 0;
  for (let i = start; i < end; i++) {
    homeSum += parseInt(homeScores[i] ?? '0', 10) || 0;
    awaySum += parseInt(awayScores[i] ?? '0', 10) || 0;
  }
  return [String(homeSum), String(awaySum)];
}

function buildBasketballScoreboardColumns(
  scoreAll: string[],
  /** 滚球中或已完场：FT 列展示总分，未开赛展示占位 */
  hasStarted: boolean,
  homeTotal: number | string,
  awayTotal: number | string,
): { headerColumns: readonly string[]; homeColumns: string[]; awayColumns: string[] } {
  const homeQuarterScores: string[] = [];
  const awayQuarterScores: string[] = [];
  for (let i = 0; i < BASKETBALL_FIXED_QUARTER_COUNT; i++) {
    const [home, away] = parseBasketballQuarterScore(scoreAll, i);
    homeQuarterScores.push(home);
    awayQuarterScores.push(away);
  }

  const [homeFirstHalf, awayFirstHalf] = sumBasketballQuarterRange(
    homeQuarterScores,
    awayQuarterScores,
    scoreAll,
    0,
    2,
  );
  const [homeSecondHalf, awaySecondHalf] = sumBasketballQuarterRange(
    homeQuarterScores,
    awayQuarterScores,
    scoreAll,
    2,
    BASKETBALL_FIXED_QUARTER_COUNT,
  );

  const hasAnyQuarter = scoreAll.some((item) => item != null && String(item).trim() !== '');
  const ftHome = hasAnyQuarter || hasStarted ? String(homeTotal) : '-';
  const ftAway = hasAnyQuarter || hasStarted ? String(awayTotal) : '-';

  return {
    headerColumns: BASKETBALL_HEADER_COLUMNS,
    homeColumns: [
      homeQuarterScores[0]!,
      homeQuarterScores[1]!,
      homeFirstHalf,
      homeQuarterScores[2]!,
      homeQuarterScores[3]!,
      homeSecondHalf,
      ftHome,
    ],
    awayColumns: [
      awayQuarterScores[0]!,
      awayQuarterScores[1]!,
      awayFirstHalf,
      awayQuarterScores[2]!,
      awayQuarterScores[3]!,
      awaySecondHalf,
      ftAway,
    ],
  };
}

/**
 * PC 端足球赛事：球场背景 + 顶部状态条 + 双行对齐统计（H5 不使用）
 */
const FootballWebScoreboard: React.FC<{ matchInfo: MatchBaseInfo }> = ({ matchInfo }) => {
  const {
    homeName,
    homeLogo,
    awayName,
    awayLogo,
    nameBold,
    homeScore,
    awayScore,
    detailHomeScore,
    detailAwayScore,
    matchDate,
    isLive,
    isEnded = false,
    matchPeriod,
    isCountdown,
    matchTime,
    clockType,
    homeCornerKick = 0,
    awayCornerKick = 0,
    homeYellowCard = 0,
    awayYellowCard = 0,
    homeRedCard = 0,
    awayRedCard = 0,
    firstHalfScore = '',
    halfTimeScore = '',
    scoreAll = [],
  } = matchInfo;
  /** 滚球中或已完场：均展示阶段文案与比分板；仅未开赛走 VS 版式 */
  const hasStarted = isLive || isEnded;
  const isBasketball = matchInfo.sportId === FBCompetitionMap.basketball.id;
  const isTennis = matchInfo.sportId === FBCompetitionMap.tennis.id;
  const isBadminton = matchInfo.sportId === FBCompetitionMap.badminton.id;
  const isPingPong = matchInfo.sportId === FBCompetitionMap.pingPong.id;
  const isVolleyball = matchInfo.sportId === FBCompetitionMap.volleyball.id;
  const isPuck = matchInfo.sportId === FBCompetitionMap.puck.id;
  const isBaseball = matchInfo.sportId === FBCompetitionMap.baseball.id;
  const isSnooker = matchInfo.sportId === FBCompetitionMap.snooker.id;
  const homeTeamNameClass = clsx(styles.teamName, nameBold === 'home' && styles.teamNameBold);
  const awayTeamNameClass = clsx(styles.teamName, nameBold === 'away' && styles.teamNameBold);
  const homePreNameClass = clsx(styles.preName, nameBold === 'home' && styles.teamNameBold);
  const awayPreNameClass = clsx(styles.preName, nameBold === 'away' && styles.teamNameBold);

  const [htHome, htAway] = useMemo(
    () => parseHalfScore(firstHalfScore || halfTimeScore),
    [firstHalfScore, halfTimeScore],
  );

  const liveTopLeft = (
    <div className={styles.statusLeft}>
      <span className={styles.period}>{hasStarted ? matchPeriod : matchDate}</span>
      {isLive && matchTime !== 0 && (
        <Timing
          time={matchTime}
          running={isCountdown}
          isCountdown={clockType === 'DESC'}
          className={styles.liveClock}
        />
      )}
    </div>
  );

  const statIcons = (
    <div className={styles.statColumns} aria-hidden>
      <LazyImage
        src="/images/common/sportsDetails/corner_kick1.png"
        alt=""
        className={styles.statHeadIconImg}
        lazy={false}
      />
      <LazyImage
        src="/images/common/sportsDetails/red_card.png"
        alt=""
        className={styles.statHeadIconImg}
        lazy={false}
      />
      <LazyImage
        src="/images/common/sportsDetails/yellow_card.png"
        alt=""
        className={styles.statHeadIconImg}
        lazy={false}
      />
      <LazyImage
        src="/images/common/sportsDetails/hakf_f.png"
        alt=""
        className={styles.statHeadIconImg}
        lazy={false}
      />
      <LazyImage
        src="/images/common/sportsDetails/all_f.png"
        alt=""
        className={styles.statHeadIconImg}
        lazy={false}
      />
    </div>
  );

  if (!hasStarted) {
    return (
      <div className={styles.root}>
        <div className={styles.field}>
          <div className={styles.preMatch}>
            <div className={styles.preTeam}>
              <LazyImage src={homeLogo} alt="" className={styles.preLogo} lazy={false} />
              <span className={homePreNameClass}>{homeName}</span>
            </div>
            <div className={styles.preCenter}>
              <span className={styles.preVs}>VS</span>
              <span className={styles.preDate}>{matchDate}</span>
            </div>
            <div className={styles.preTeam}>
              <LazyImage src={awayLogo} alt="" className={styles.preLogo} lazy={false} />
              <span className={awayPreNameClass}>{awayName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTennis || isBadminton || isPingPong || isVolleyball) {
    const fixedSets = isPingPong || isVolleyball ? 5 : 3;
    const setHeaders =
      isTennis || isBadminton || isPingPong || isVolleyball
        ? Array.from({ length: fixedSets }, (_, index) => String(index + 1))
        : scoreAll.map((_: string, index: number) => String(index + 1));
    const [homeSetScores, awaySetScores] = scoreAll.reduce<[string[], string[]]>(
      (acc: [string[], string[]], current: string) => {
        const [homePart, awayPart] = parseStageScorePair(current);
        acc[0].push(homePart);
        acc[1].push(awayPart);
        return acc;
      },
      [[], []],
    );

    const fixedSetScoresHome = Array.from(
      { length: fixedSets },
      (_, index) => homeSetScores[index] ?? '-',
    );
    const fixedSetScoresAway = Array.from(
      { length: fixedSets },
      (_, index) => awaySetScores[index] ?? '-',
    );

    const headerColumns = isTennis ? [...setHeaders, '盘', '分'] : [...setHeaders, '全场'];
    const homeColumns = isTennis
      ? [
          ...fixedSetScoresHome,
          String(detailHomeScore ?? 0),
          String(getSpecialSportScore(matchInfo.sportId, homeScore)),
        ]
      : [...fixedSetScoresHome, String(detailHomeScore ?? 0)];
    const awayColumns = isTennis
      ? [
          ...fixedSetScoresAway,
          String(detailAwayScore ?? 0),
          String(getSpecialSportScore(matchInfo.sportId, awayScore)),
        ]
      : [...fixedSetScoresAway, String(detailAwayScore ?? 0)];
    const tennisColumnsStyle = {
      gridTemplateColumns: `repeat(${headerColumns.length}, minmax(0, 1fr))`,
    };

    return (
      <div className={styles.root}>
        <div className={styles.field}>
          <div className={styles.topBar}>
            {liveTopLeft}
            <div
              className={`${styles.basketballColumns} ${styles.basketballHeaderColumns}`}
              style={tennisColumnsStyle}
              aria-hidden
            >
              {headerColumns.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className={styles.teamBlock}>
            <div className={styles.teamRow}>
              <div className={styles.teamId}>
                <LazyImage src={homeLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={homeTeamNameClass}>{homeName}</span>
              </div>
              <div className={styles.basketballColumns} style={tennisColumnsStyle}>
                {homeColumns.map((value, index) => (
                  <span key={`home-tennis-${index}`}>{value}</span>
                ))}
              </div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamId}>
                <LazyImage src={awayLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={awayTeamNameClass}>{awayName}</span>
              </div>
              <div className={styles.basketballColumns} style={tennisColumnsStyle}>
                {awayColumns.map((value, index) => (
                  <span key={`away-tennis-${index}`}>{value}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSnooker) {
    const totalFrames = 19;
    const frameHeaders = Array.from({ length: totalFrames }, (_, index) => String(index + 1));
    const [homeFrameScores, awayFrameScores] = scoreAll.reduce<[string[], string[]]>(
      (acc: [string[], string[]], current: string) => {
        const [homePart, awayPart] = parseStageScorePair(current);
        acc[0].push(homePart);
        acc[1].push(awayPart);
        return acc;
      },
      [[], []],
    );
    const paddedHomeFrameScores = Array.from(
      { length: totalFrames },
      (_, index) => homeFrameScores[index] ?? '-',
    );
    const paddedAwayFrameScores = Array.from(
      { length: totalFrames },
      (_, index) => awayFrameScores[index] ?? '-',
    );

    const headerColumns = [...frameHeaders, '局'];
    const homeColumns = [...paddedHomeFrameScores, String(detailHomeScore ?? 0)];
    const awayColumns = [...paddedAwayFrameScores, String(detailAwayScore ?? 0)];
    const snookerColumnsStyle = {
      gridTemplateColumns: `repeat(${headerColumns.length}, 46px)`,
    };
    const lastIndex = headerColumns.length - 1;

    return (
      <div className={styles.root}>
        <div className={clsx(styles.field, styles.fieldHScroll)}>
          <div className={styles.snookerBoard}>
            <div className={styles.snookerLeftCol}>
              <div className={styles.snookerLeftHead}>{liveTopLeft}</div>
              <div className={styles.snookerLeftTeam}>
                <LazyImage src={homeLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={homeTeamNameClass}>{homeName}</span>
              </div>
              <div className={styles.snookerLeftTeam}>
                <LazyImage src={awayLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={awayTeamNameClass}>{awayName}</span>
              </div>
            </div>
            <div className={styles.scrollColumnsWrap}>
              <div
                className={`${styles.scrollColumns} ${styles.scrollHeaderRow} ${styles.basketballHeaderColumns}`}
                style={snookerColumnsStyle}
                aria-hidden
              >
                {headerColumns.map((label, index) => (
                  <span key={label} className={index === lastIndex ? styles.stickyLast : undefined}>
                    {label}
                  </span>
                ))}
              </div>
              <div
                className={`${styles.scrollColumns} ${styles.scrollDataRow}`}
                style={snookerColumnsStyle}
              >
                {homeColumns.map((value, index) => (
                  <span
                    key={`home-snooker-${index}`}
                    className={index === lastIndex ? styles.stickyLast : undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
              <div
                className={`${styles.scrollColumns} ${styles.scrollDataRow}`}
                style={snookerColumnsStyle}
              >
                {awayColumns.map((value, index) => (
                  <span
                    key={`away-snooker-${index}`}
                    className={index === lastIndex ? styles.stickyLast : undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBaseball) {
    const totalInnings = 9;
    const inningHeaders = Array.from({ length: totalInnings }, (_, index) => String(index + 1));
    const [homeInnings, awayInnings] = scoreAll.reduce<[string[], string[]]>(
      (acc: [string[], string[]], current: string) => {
        const [homePart, awayPart] = parseStageScorePair(current);
        acc[0].push(homePart);
        acc[1].push(awayPart);
        return acc;
      },
      [[], []],
    );
    const paddedHomeInnings = Array.from(
      { length: totalInnings },
      (_, index) => homeInnings[index] ?? '-',
    );
    const paddedAwayInnings = Array.from(
      { length: totalInnings },
      (_, index) => awayInnings[index] ?? '-',
    );

    const headerColumns = [...inningHeaders, '总分'];
    const homeColumns = [...paddedHomeInnings, String(homeScore ?? 0)];
    const awayColumns = [...paddedAwayInnings, String(awayScore ?? 0)];
    const baseballColumnsStyle = {
      gridTemplateColumns: `repeat(${headerColumns.length}, minmax(44px, 1fr))`,
    };
    const lastIndex = headerColumns.length - 1;

    return (
      <div className={styles.root}>
        <div className={clsx(styles.field, styles.fieldHScroll)}>
          <div className={styles.snookerBoard}>
            <div className={styles.snookerLeftCol}>
              <div className={styles.snookerLeftHead}>{liveTopLeft}</div>
              <div className={styles.snookerLeftTeam}>
                <LazyImage src={homeLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={homeTeamNameClass}>{homeName}</span>
              </div>
              <div className={styles.snookerLeftTeam}>
                <LazyImage src={awayLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={awayTeamNameClass}>{awayName}</span>
              </div>
            </div>
            <div className={styles.scrollColumnsWrap}>
              <div
                className={`${styles.scrollColumns} ${styles.scrollHeaderRow} ${styles.basketballHeaderColumns}`}
                style={baseballColumnsStyle}
                aria-hidden
              >
                {headerColumns.map((label, index) => (
                  <span key={label} className={index === lastIndex ? styles.stickyLast : undefined}>
                    {label}
                  </span>
                ))}
              </div>
              <div
                className={`${styles.scrollColumns} ${styles.scrollDataRow}`}
                style={baseballColumnsStyle}
              >
                {homeColumns.map((value, index) => (
                  <span
                    key={`home-baseball-${index}`}
                    className={index === lastIndex ? styles.stickyLast : undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
              <div
                className={`${styles.scrollColumns} ${styles.scrollDataRow}`}
                style={baseballColumnsStyle}
              >
                {awayColumns.map((value, index) => (
                  <span
                    key={`away-baseball-${index}`}
                    className={index === lastIndex ? styles.stickyLast : undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPuck) {
    const [homePeriods, awayPeriods] = scoreAll.reduce<[string[], string[]]>(
      (acc: [string[], string[]], current: string) => {
        const [homePart, awayPart] = parseStageScorePair(current);
        acc[0].push(homePart);
        acc[1].push(awayPart);
        return acc;
      },
      [[], []],
    );
    const homeColumns = [
      homePeriods[0] ?? '-',
      homePeriods[1] ?? '-',
      homePeriods[2] ?? '-',
      homePeriods[3] ?? '-',
      String(homeScore ?? 0),
      homePeriods[4] ?? '-',
    ];
    const awayColumns = [
      awayPeriods[0] ?? '-',
      awayPeriods[1] ?? '-',
      awayPeriods[2] ?? '-',
      awayPeriods[3] ?? '-',
      String(awayScore ?? 0),
      awayPeriods[4] ?? '-',
    ];
    const headerColumns = ['1', '2', '3', '加时', '总分', '点球'];
    /** 宽屏用 1fr 拉满滚动区；窄于列总 min 时由 scrollColumnsWrap 横向滚动 */
    const puckColumnsStyle = {
      gridTemplateColumns: `repeat(${headerColumns.length}, minmax(48px, 1fr))`,
    };
    const lastIndex = headerColumns.length - 1;

    return (
      <div className={styles.root}>
        <div className={clsx(styles.field, styles.fieldHScroll)}>
          <div className={styles.snookerBoard}>
            <div className={styles.snookerLeftCol}>
              <div className={styles.snookerLeftHead}>{liveTopLeft}</div>
              <div className={styles.snookerLeftTeam}>
                <LazyImage src={homeLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={homeTeamNameClass}>{homeName}</span>
              </div>
              <div className={styles.snookerLeftTeam}>
                <LazyImage src={awayLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={awayTeamNameClass}>{awayName}</span>
              </div>
            </div>
            <div className={styles.scrollColumnsWrap}>
              <div
                className={`${styles.scrollColumns} ${styles.scrollHeaderRow} ${styles.basketballHeaderColumns}`}
                style={puckColumnsStyle}
                aria-hidden
              >
                {headerColumns.map((label, index) => (
                  <span key={label} className={index === lastIndex ? styles.stickyLast : undefined}>
                    {label}
                  </span>
                ))}
              </div>
              <div
                className={`${styles.scrollColumns} ${styles.scrollDataRow}`}
                style={puckColumnsStyle}
              >
                {homeColumns.map((value, index) => (
                  <span
                    key={`home-puck-${index}`}
                    className={index === lastIndex ? styles.stickyLast : undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
              <div
                className={`${styles.scrollColumns} ${styles.scrollDataRow}`}
                style={puckColumnsStyle}
              >
                {awayColumns.map((value, index) => (
                  <span
                    key={`away-puck-${index}`}
                    className={index === lastIndex ? styles.stickyLast : undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBasketball) {
    const { headerColumns, homeColumns, awayColumns } = buildBasketballScoreboardColumns(
      scoreAll,
      hasStarted,
      homeScore,
      awayScore,
    );
    const basketballColumnsStyle = {
      gridTemplateColumns: `repeat(${headerColumns.length}, minmax(0, 1fr))`,
    };

    return (
      <div className={styles.root}>
        <div className={styles.field}>
          <div className={styles.topBar}>
            {liveTopLeft}
            <div
              className={`${styles.basketballColumns} ${styles.basketballHeaderColumns}`}
              style={basketballColumnsStyle}
              aria-hidden
            >
              {headerColumns.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className={styles.teamBlock}>
            <div className={styles.teamRow}>
              <div className={styles.teamId}>
                <LazyImage src={homeLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={homeTeamNameClass}>{homeName}</span>
              </div>
              <div className={styles.basketballColumns} style={basketballColumnsStyle}>
                {homeColumns.map((value, index) => (
                  <span key={`home-${index}`}>{value}</span>
                ))}
              </div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamId}>
                <LazyImage src={awayLogo} alt="" className={styles.teamLogo} lazy={false} />
                <span className={awayTeamNameClass}>{awayName}</span>
              </div>
              <div className={styles.basketballColumns} style={basketballColumnsStyle}>
                {awayColumns.map((value, index) => (
                  <span key={`away-${index}`}>{value}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <div className={styles.topBar}>
          {liveTopLeft}
          {statIcons}
        </div>

        <div className={styles.teamBlock}>
          <div className={styles.teamRow}>
            <div className={styles.teamId}>
              <LazyImage src={homeLogo} alt="" className={styles.teamLogo} lazy={false} />
              <span className={homeTeamNameClass}>{homeName}</span>
            </div>
            <div className={styles.statColumns}>
              <span>{homeCornerKick}</span>
              <span>{homeRedCard}</span>
              <span>{homeYellowCard}</span>
              <span>{htHome}</span>
              <span>{homeScore}</span>
            </div>
          </div>
          <div className={styles.teamRow}>
            <div className={styles.teamId}>
              <LazyImage src={awayLogo} alt="" className={styles.teamLogo} lazy={false} />
              <span className={awayTeamNameClass}>{awayName}</span>
            </div>
            <div className={styles.statColumns}>
              <span>{awayCornerKick}</span>
              <span>{awayRedCard}</span>
              <span>{awayYellowCard}</span>
              <span>{htAway}</span>
              <span>{awayScore}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const isFootballMatch = (info: MatchBaseInfo): boolean =>
  info.sportId === FBCompetitionMap.football.id;

export default FootballWebScoreboard;
