import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useInView } from 'react-intersection-observer';

import {
  type MatchItem,
  type MatchResultItem,
  type MatchResultRecordItem,
  type NsgItem,
  useFbMatchResultListQuery,
} from '@/apis/fbSports/betRecord/getFBResultList';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { EFbPeriod, FullPes } from '@/apis/fbSports/common/constants/period';
import Icon from '@/common/components/Icon';

import {
  createResultLeagueOptionsFromLgs,
  type ResultLeagueOption,
} from '../../utils/resultLeagueFilterStorage';
import type { ResultSearchConditionValue } from '../ResultSearchCondition';
import styles from './index.module.scss';

const RESULT_LOGO_PLACEHOLDER = '/images/common/logo_small.png';

interface ResultLogoProps {
  src?: string;
  type: 'league' | 'team';
}

const ResultLogo = ({ src, type }: ResultLogoProps) => {
  const logoSrc = src || RESULT_LOGO_PLACEHOLDER;
  const [currentSrc, setCurrentSrc] = useState(logoSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(logoSrc);
    setLoaded(false);
  }, [logoSrc]);

  const handleError = () => {
    if (currentSrc !== RESULT_LOGO_PLACEHOLDER) {
      setCurrentSrc(RESULT_LOGO_PLACEHOLDER);
      setLoaded(false);
      return;
    }

    setLoaded(true);
  };

  return (
    <span
      className={clsx(
        styles.resultLogo,
        loaded && styles.resultLogoLoaded,
        type === 'league' ? styles.leagueLogo : styles.teamLogo,
      )}
      aria-hidden="true"
    >
      <img className={styles.logoPlaceholder} src={RESULT_LOGO_PLACEHOLDER} alt="" />
      <img
        className={clsx(styles.logoImage, loaded && styles.logoImageLoaded)}
        src={currentSrc}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={handleError}
        draggable="false"
      />
    </span>
  );
};

interface ResultMatchListProps {
  searchValue: ResultSearchConditionValue;
  collapsed: boolean;
  onLeagueOptionsChange?: (options: ResultLeagueOption[]) => void;
}

const getScoreText = (nsgList: NsgItem[], index: number) => {
  const score = nsgList[0]?.sc[index];
  return typeof score === 'number' ? String(score) : '-';
};

const getHalfScores = (match: MatchItem, sportId: number) => {
  const halfPeriod: number | undefined = sportId === 1 ? EFbPeriod.soccerFirstHalf : undefined;
  const halfScore = match.nsg.filter(
    (item) =>
      item.tyg === 5 &&
      (halfPeriod !== undefined ? item.pe === halfPeriod : !FullPes.includes(item.pe)),
  );

  return [getScoreText(halfScore, 0), getScoreText(halfScore, 1)];
};

// 部分球种的最终赛果会落在“含加时/点球”的阶段上，需要优先取这些 period。
const FULL_PERIODS_BY_SPORT_ID: Partial<Record<FBSportIdValue, number[]>> = {
  [FBSportIdValue.Football]: [
    EFbPeriod.soccerFullTimeInclET,
    EFbPeriod.soccerFullTime,
    EFbPeriod.soccerExtraFullTime,
  ],
  [FBSportIdValue.Basketball]: [EFbPeriod.basketballFullTime],
  [FBSportIdValue.Tennis]: [EFbPeriod.tennisFullTime],
  [FBSportIdValue.Volleyball]: [EFbPeriod.volleyballFullTime],
  [FBSportIdValue.BeachVolleyball]: [EFbPeriod.beachVolleyballFullTime],
  [FBSportIdValue.Puck]: [EFbPeriod.iceHockeyFullTimeInclOTAndPEN, EFbPeriod.iceHockeyFullTime],
  [FBSportIdValue.Badminton]: [EFbPeriod.badmintonFullTime],
  [FBSportIdValue.PingPong]: [EFbPeriod.tableTennisFullTime],
  [FBSportIdValue.Baseball]: [EFbPeriod.baseballFullTimeInclExtraInns, EFbPeriod.baseballFullTime],
  [FBSportIdValue.USBaseball]: [
    EFbPeriod.americanFootballFullTime,
    EFbPeriod.americanFootballRegularTime,
  ],
  [FBSportIdValue.Handball]: [EFbPeriod.handballFullTimeInclOTAndPen, EFbPeriod.handballFullTime],
  [FBSportIdValue.Olive]: [EFbPeriod.rugbyFullTime],
  [FBSportIdValue.Cricket]: [EFbPeriod.cricketFullTimeInclSuperOver, EFbPeriod.cricketFullTime],
  [FBSportIdValue.Snooker]: [EFbPeriod.snookerFullTime],
  [FBSportIdValue.Boxing]: [EFbPeriod.boxingFullTime],
  [FBSportIdValue.Water]: [EFbPeriod.waterPoloFullTime],
  [FBSportIdValue.Fight]: [EFbPeriod.mmaFullTime],
};

/**
 * 获取指定球种的完场比分候选阶段。
 * 同一个球种可能同时存在常规全场、含加时全场等多个阶段，按优先级依次兜底。
 */
const getFullPeriodCandidates = (sportId: number): number[] => {
  const candidates = [...(FULL_PERIODS_BY_SPORT_ID[sportId] ?? []), ...FullPes, sportId * 1000 + 1];

  return Array.from(new Set(candidates));
};

/**
 * 获取赛事完场比分。
 * 会按当前球种的候选完场阶段查找，避免只依赖通用 FullPes 导致部分球种取不到比分。
 */
const getFullScores = (match: MatchItem, sportId: number) => {
  const fullPeriods = getFullPeriodCandidates(sportId);
  const fullScore = fullPeriods
    .map((period) => match.nsg.find((item) => item.tyg === 5 && item.pe === period))
    .find(Boolean);

  return getScorePairText(fullScore);
};

const BASKETBALL_QUARTER_PERIODS = [
  EFbPeriod.basketballFirstQuarter,
  EFbPeriod.basketballSecondQuarter,
  EFbPeriod.basketballThirdQuarter,
  EFbPeriod.basketballFourthQuarter,
] as number[];

const BASKETBALL_SPORT_ID = Number(FBSportIdValue.Basketball);

// H5 赛果卡片列规则：足球显示半场/完场，篮球显示四节/完场，其它球种只显示完场。
const HALF_SCORE_SPORT_IDS = new Set<number>([FBSportIdValue.Football]);

/**
 * 将单条比分数据转换成主客队文本。
 * 当接口缺少某一侧比分时返回 "-"，用于保持列表占位稳定。
 */
const getScorePairText = (score?: NsgItem): [string, string] => {
  if (!score) return ['-', '-'];

  return [
    typeof score.sc?.[0] === 'number' ? String(score.sc[0]) : '-',
    typeof score.sc?.[1] === 'number' ? String(score.sc[1]) : '-',
  ];
};

/**
 * 获取篮球四节比分。
 * 赛果页需要按 1、2、3、4 节分别展示，和 app 侧展示保持一致。
 */
const getBasketballQuarterScores = (match: MatchItem): Array<[string, string]> =>
  BASKETBALL_QUARTER_PERIODS.map((period) =>
    getScorePairText(match.nsg.find((item) => item.tyg === 5 && item.pe === period)),
  );

const ResultMatchList = ({
  searchValue,
  collapsed,
  onLeagueOptionsChange,
}: ResultMatchListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useFbMatchResultListQuery({
      sportId: searchValue.sportId,
      beginTime: searchValue.dateRange.startTime,
      endTime: searchValue.dateRange.endTime,
      leagueIds: searchValue.leagueIds,
      size: 300,
    });

  const records = useMemo<MatchResultItem[]>(() => {
    if (!data?.pages?.length) return [];

    const pageList: MatchResultRecordItem[] = [];
    data.pages.forEach((page) => {
      if (Array.isArray(page?.records)) {
        pageList.push(...page.records);
      }
    });

    const leagueMap: Record<number, MatchResultItem> = {};
    pageList.forEach((item, index) => {
      const key = item.lg.id;
      const league =
        leagueMap[key] ??
        ({
          leagueId: item.lg.id,
          leagueName: item.lg.na,
          leagueIcon: item.lg.lurl ?? '',
          sort: index,
          List: [],
        } satisfies MatchResultItem);

      league.List.push({
        id: item.id,
        bt: item.bt,
        ms: item.ms,
        fid: item.fid,
        fmt: item.fmt,
        ne: item.ne,
        ts: item.ts,
        nsg: item.nsg,
      });
      leagueMap[key] = league;
    });

    return Object.values(leagueMap).sort((a, b) => a.sort - b.sort);
  }, [data]);

  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const previousSearchKeyRef = useRef('');
  const searchKey = `${searchValue.sportId}-${searchValue.dateRange.startTime}-${searchValue.dateRange.endTime}-${searchValue.leagueIds.join(',')}`;

  useEffect(() => {
    const leagueOptions: ResultLeagueOption[] = [];
    const leagueIdSet = new Set<number>();

    data?.pages.forEach((page) => {
      page.lgs?.forEach((league) => {
        const [option] = createResultLeagueOptionsFromLgs([league]);
        if (!option || leagueIdSet.has(option.leagueId)) return;

        leagueIdSet.add(option.leagueId);
        leagueOptions.push(option);
      });
    });

    onLeagueOptionsChange?.(leagueOptions);
  }, [data?.pages, onLeagueOptionsChange]);

  useEffect(() => {
    const leagueIds = records.map((item) => item.leagueId);

    setExpandedSet((prev) => {
      if (collapsed) {
        previousSearchKeyRef.current = searchKey;
        return new Set();
      }

      const isSearchChanged = previousSearchKeyRef.current !== searchKey;
      previousSearchKeyRef.current = searchKey;

      if (isSearchChanged || prev.size === 0) {
        return new Set(leagueIds);
      }

      const next = new Set(prev);
      const recordLeagueIdSet = new Set(leagueIds);

      leagueIds.forEach((leagueId) => {
        next.add(leagueId);
      });

      Array.from(next).forEach((leagueId) => {
        if (!recordLeagueIdSet.has(leagueId)) {
          next.delete(leagueId);
        }
      });

      return next;
    });
  }, [collapsed, records, searchKey]);

  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const toggleExpand = (leagueId: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(leagueId)) {
        next.delete(leagueId);
      } else {
        next.add(leagueId);
      }
      return next;
    });
  };

  return (
    <div className={styles.resultMatchList}>
      {isFetching && records.length === 0 && <div className={styles.stateText}>加载中...</div>}

      {!isFetching && records.length === 0 && <div className={styles.stateText}>暂无数据</div>}

      {records.map((league) => {
        const expanded = expandedSet.has(league.leagueId);

        return (
          <section key={league.leagueId} className={styles.leagueBlock}>
            <button
              type="button"
              className={clsx(styles.leagueHeader, !expanded && styles.leagueHeaderCollapsed)}
              onClick={() => toggleExpand(league.leagueId)}
            >
              <span className={styles.leagueName}>
                <ResultLogo src={league.leagueIcon} type="league" />
                <span>{league.leagueName}</span>
              </span>
              <span className={styles.leagueArrowWrap}>
                <Icon
                  src="/images/common/arrow_sports.svg"
                  size="12px"
                  color="var(--Text-700)"
                  className={clsx(styles.leagueArrow, !expanded && styles.expanded)}
                />
              </span>
            </button>

            {expanded &&
              league.List.map((match) => {
                const homeTeam = match.ts[0];
                const awayTeam = match.ts[1];
                const halfScores = getHalfScores(match, searchValue.sportId);
                const fullScores = getFullScores(match, searchValue.sportId);
                const isBasketball = searchValue.sportId === BASKETBALL_SPORT_ID;
                const showHalfScores = HALF_SCORE_SPORT_IDS.has(searchValue.sportId);
                const quarterScores = isBasketball ? getBasketballQuarterScores(match) : [];

                return (
                  <article
                    key={match.id}
                    className={clsx(
                      styles.matchCard,
                      isBasketball && styles.basketballMatchCard,
                      !isBasketball && !showHalfScores && styles.fullOnlyMatchCard,
                    )}
                  >
                    <div className={styles.matchInfo}>
                      <span className={styles.timeBadge}>
                        {dayjs(match.bt).format('MM-DD HH:mm')}
                      </span>

                      {[homeTeam, awayTeam].map((team, index) => (
                        <div key={team?.id ?? index} className={styles.teamRow}>
                          <ResultLogo src={team?.lurl} type="team" />
                          <span>{team?.na ?? '-'}</span>
                        </div>
                      ))}
                    </div>

                    {isBasketball &&
                      quarterScores.map((scores, index) => (
                        <div
                          key={`${match.id}-quarter-${index}`}
                          className={clsx(styles.scoreColumn, styles.basketballScoreColumn)}
                        >
                          <span className={styles.scoreTitle}>{index + 1}</span>
                          <strong>{scores[0]}</strong>
                          <strong>{scores[1]}</strong>
                        </div>
                      ))}

                    {showHalfScores && (
                      <div className={styles.scoreColumn}>
                        <span className={styles.scoreTitle}>半</span>
                        <strong>{halfScores[0]}</strong>
                        <strong>{halfScores[1]}</strong>
                      </div>
                    )}

                    <div
                      className={clsx(
                        styles.scoreColumn,
                        isBasketball && styles.basketballFullColumn,
                      )}
                    >
                      <span className={styles.fullBadge}>
                        完场
                        {/* <i className={styles.playIcon} /> */}
                      </span>
                      <strong
                        className={clsx(
                          styles.fullScore,
                          fullScores[0] === '-' && styles.emptyScore,
                        )}
                      >
                        {fullScores[0]}
                      </strong>
                      <strong
                        className={clsx(
                          styles.fullScore,
                          fullScores[1] === '-' && styles.emptyScore,
                        )}
                      >
                        {fullScores[1]}
                      </strong>
                    </div>
                  </article>
                );
              })}
          </section>
        );
      })}

      {isFetchingNextPage && <div className={styles.stateText}>加载中...</div>}
      {hasNextPage && !isFetchingNextPage && <div ref={ref} className={styles.sentinel} />}
      {!hasNextPage && records.length > 0 && <div className={styles.stateText}>没有更多数据了</div>}
    </div>
  );
};

export default ResultMatchList;
