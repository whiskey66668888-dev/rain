import type {
  AnalysisCompare,
  AnalysisData,
  AnalysisMatchEntity,
  CompareTeamStats,
} from '@/apis/origin/discover/analysisTypes';
import type { DiscoverMatchInfo } from '@/apis/origin/discover/sportsTypes';

/** 比赛列表行 */
export interface AnalysisMatchItem {
  date: string;
  leagueName: string;
  guestTeam: string;
  homeTeam: string;
  score: string;
  halfScore: string;
  handicap: string;
  handicapRes: string;
  totalScore: string;
  totalRes: string;
}

/** 统计摘要 */
export interface AnalysisStats {
  count: number;
  winRate: string;
  winOdd: string;
  bigRate: string;
  singleRate: string;
  winDesc: string;
  winOddDesc: string;
  bigDesc: string;
  singleDesc: string;
}

/** 分布统计项（胜分差 / 半全场） */
export interface DistributionItem {
  label: string;
  homeMain: string;
  homeGuest: string;
  homeTotal: string;
  guestMain: string;
  guestGuest: string;
  guestTotal: string;
}

export interface AnalysisFilterState {
  sameHomeAway: boolean;
  sameLeague: boolean;
  matchCount: number;
}

export interface TeamOverviewItem {
  label: string;
  leftVal: string;
  rightVal: string;
}

export interface AverageCircleItem {
  label: string;
  leftValue: number;
  rightValue: number;
  leftPercent: number;
  rightPercent: number;
}

export interface AverageStatItem {
  label: string;
  leftValue: number;
  rightValue: number;
  maxValue: number;
}

export interface ScheduleItem {
  date: string;
  leagueName: string;
  homeTeam: string;
  guestTeam: string;
  scoreOrVs: string;
  interval: string;
  isCurrent?: boolean;
  scheduleId?: string;
}

export interface DistributionResult {
  items: DistributionItem[];
  hMain: number;
  hGuest: number;
  hTotal: number;
  gMain: number;
  gGuest: number;
  gTotal: number;
}

export const DEFAULT_ANALYSIS_FILTER: AnalysisFilterState = {
  sameHomeAway: false,
  sameLeague: false,
  matchCount: 10,
};

const parseNum = (val?: string): number => {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

const parseIntVal = (val?: string): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
};

export const fmtDate = (ts?: string): string => {
  if (!ts) return '-';
  try {
    if (ts.includes('/') || ts.includes('-')) return ts;
    const t = parseIntVal(ts);
    if (t === 0) return ts;
    const dt = new Date(t * 1000);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  } catch {
    return ts;
  }
};

const fmtScheduleDate = (ts?: string): string => {
  if (!ts) return '-';
  try {
    if (ts.includes('-') || ts.includes('/')) {
      const dt = new Date(ts.replace(/\//g, '-'));
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const t = parseIntVal(ts);
    if (t === 0) return ts;
    const dt = new Date(t * 1000);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return ts;
  }
};

const parseTimestamp = (ts?: string): number => {
  if (!ts) return 0;
  try {
    const trimmed = ts.trim();
    if (!trimmed) return 0;

    if (trimmed.includes('-') || trimmed.includes('/')) {
      const normalized = trimmed.replace(/\//g, '-').replace(' ', 'T');
      const ms = Date.parse(normalized);
      if (!Number.isNaN(ms)) return Math.floor(ms / 1000);
      return 0;
    }

    const n = parseIntVal(trimmed);
    if (n === 0) return 0;
    // 13 位为毫秒时间戳
    if (trimmed.length >= 13 || n > 1e11) return Math.floor(n / 1000);
    return n;
  } catch {
    return 0;
  }
};

const resolveCurrentMatchTimestamp = (matchInfo?: DiscoverMatchInfo | null): number => {
  const candidates = [matchInfo?.match_time, matchInfo?.begin_timestamp];
  for (const ts of candidates) {
    const parsed = parseTimestamp(ts);
    if (parsed > 0) return parsed;
  }
  return 0;
};

const parseLine = (str?: string): string => {
  if (!str) return '';
  if (str.includes(',')) {
    const parts = str.split(',');
    if (parts.length > 1) return parts[1] ?? '';
  }
  return str;
};

const fmtDouble = (val: number): string => {
  if (val === Math.floor(val)) return String(val);
  return val.toString();
};

const fmtPct = (v?: string): string => {
  if (!v) return '0%';
  const d = parseFloat(v);
  if (Number.isNaN(d)) return v;
  return `${(d * 100).toFixed(1)}%`;
};

const fmtStreak = (s?: string): string => {
  if (!s) return '-';
  const val = parseIntVal(s);
  if (val > 0) return `${val}连胜`;
  if (val < 0) return `${Math.abs(val)}连败`;
  return s;
};

const getLast10 = (team?: CompareTeamStats): string => {
  // 对齐 App：last10 为空字符串时继续读 last_10（?? 不会处理 ''）
  const primary = team?.last10;
  if (typeof primary === 'string' && primary.trim() !== '') return primary;
  const fallback = team?.last_10;
  if (typeof fallback === 'string' && fallback.trim() !== '') return fallback;
  return '0-0';
};

const mapMatchToItem = (e: AnalysisMatchEntity, targetTeamId: string): AnalysisMatchItem => {
  const dateStr = fmtDate(e.match_time);
  const scoreStr = `${e.guest_score ?? '0'}:${e.home_score ?? '0'}`;

  let letStr = e.let_score ?? '';
  if (!letStr) letStr = e.index_let ?? '';
  const finalLetStr = parseLine(letStr);

  let totalStr = e.total_score ?? '';
  if (!totalStr) totalStr = e.index_total ?? '';
  const finalTotalStr = parseLine(totalStr);

  const hScore = parseNum(e.home_score);
  const gScore = parseNum(e.guest_score);

  // 对齐 App：按「被分析球队」在该场是否为主队判断，而非当前赛事主队 ID
  const isTargetHome = e.home_team_id === targetTeamId;

  let letRes = '-';
  const letVal = parseNum(finalLetStr);
  const displayLet = fmtDouble(-letVal);

  if (finalLetStr) {
    if (hScore - letVal > gScore) {
      letRes = isTargetHome ? '赢' : '输';
    } else if (hScore - letVal < gScore) {
      letRes = isTargetHome ? '输' : '赢';
    } else {
      letRes = '走';
    }
  }

  let totalRes = '-';
  const tVal = parseNum(finalTotalStr);
  const displayTotal = fmtDouble(tVal);

  if (finalTotalStr && tVal > 0) {
    if (hScore + gScore > tVal) totalRes = '大';
    else if (hScore + gScore < tVal) totalRes = '小';
    else totalRes = '走';
  }

  return {
    date: dateStr,
    leagueName: e.sclass_name ?? '-',
    guestTeam: e.guest_team_name ?? '-',
    homeTeam: e.home_team_name ?? '-',
    score: scoreStr,
    halfScore: `(${e.guest_half_score ?? '0'}:${e.home_half_score ?? '0'})`,
    handicap: displayLet,
    handicapRes: letRes,
    totalScore: displayTotal,
    totalRes,
  };
};

const computeStats = (
  filtered: AnalysisMatchEntity[],
  targetTeamId: string,
): AnalysisStats | null => {
  if (filtered.length === 0) return null;

  let win = 0;
  let lose = 0;
  let winOdd = 0;
  let pingOdd = 0;
  let big = 0;
  let odd = 0;

  filtered.forEach((e) => {
    const hScore = parseNum(e.home_score);
    const gScore = parseNum(e.guest_score);
    // 对齐 App：按「被分析球队」在该场是否为主队判断
    const isTargetHome = e.home_team_id === targetTeamId;

    let letStr = e.let_score ?? '';
    if (!letStr) letStr = e.index_let ?? '';
    const letVal = parseNum(parseLine(letStr));

    if (parseLine(letStr)) {
      if (hScore - letVal > gScore) {
        if (isTargetHome) winOdd++;
      } else if (hScore - letVal < gScore) {
        if (!isTargetHome) winOdd++;
      } else {
        pingOdd++;
      }
    }

    let totalStr = e.total_score ?? '';
    if (!totalStr) totalStr = e.index_total ?? '';
    const tVal = parseNum(parseLine(totalStr));
    if (parseLine(totalStr) && tVal > 0 && hScore + gScore > tVal) big++;

    if (hScore > gScore) {
      if (isTargetHome) win++;
      else lose++;
    } else if (hScore < gScore) {
      if (isTargetHome) lose++;
      else win++;
    }

    if ((hScore + gScore) % 2 !== 0) odd++;
  });

  const total = filtered.length;
  return {
    count: total,
    winRate: `${Math.round((win / total) * 100)}%`,
    winOdd: `${Math.round((winOdd / total) * 100)}%`,
    bigRate: `${Math.round((big / total) * 100)}%`,
    singleRate: `${Math.round((odd / total) * 100)}%`,
    winDesc: `${win}胜${lose}负`,
    winOddDesc: `${winOdd}赢${pingOdd}走${total - winOdd - pingOdd}输`,
    bigDesc: `${big}大${total - big}小`,
    singleDesc: `${odd}单${total - odd}双`,
  };
};

const filterMatches = (
  source: AnalysisMatchEntity[],
  filter: AnalysisFilterState,
  homeId: string,
  awayId: string,
  leagueId: string,
): AnalysisMatchEntity[] => {
  let list = [...source];

  if (list.length > filter.matchCount) {
    list = list.slice(0, filter.matchCount);
  }

  if (filter.sameLeague && leagueId) {
    list = list.filter((e) => e.sclass_id === leagueId);
  }

  if (filter.sameHomeAway && homeId) {
    list = list.filter((e) => e.home_team_id === homeId && e.guest_team_id === awayId);
  }

  return list;
};

/** 球队概况 */
export const buildTeamOverview = (
  data: AnalysisData | null,
  matchInfo: DiscoverMatchInfo | null | undefined,
  homeLogo?: string,
  awayLogo?: string,
): {
  homeName: string;
  awayName: string;
  homeRecord: string;
  awayRecord: string;
  homeLogo: string;
  awayLogo: string;
  items: TeamOverviewItem[];
} => {
  const compare = data?.compare;
  const home = compare?.home;
  const away = compare?.away;

  const homeName = matchInfo?.home_team_name ?? '主队';
  const awayName = matchInfo?.guest_team_name ?? '客队';

  return {
    homeName,
    awayName,
    homeRecord: `${home?.won ?? 0}胜${home?.lost ?? 0}负`,
    awayRecord: `${away?.won ?? 0}胜${away?.lost ?? 0}负`,
    homeLogo: home?.team_logo || homeLogo || '',
    awayLogo: away?.team_logo || awayLogo || '',
    items: [
      {
        label: '排名',
        leftVal: home?.position ? `${home.area ?? ''}${home.position}` : '0',
        rightVal: away?.position ? `${away.area ?? ''}${away.position}` : '0',
      },
      { label: '胜率', leftVal: fmtPct(home?.won_rate), rightVal: fmtPct(away?.won_rate) },
      { label: '胜差', leftVal: home?.game_back ?? '0', rightVal: away?.game_back ?? '0' },
      { label: '近况', leftVal: fmtStreak(home?.streaks), rightVal: fmtStreak(away?.streaks) },
      { label: '场均得分', leftVal: home?.points_avg ?? '0', rightVal: away?.points_avg ?? '0' },
      { label: '近10场', leftVal: getLast10(home), rightVal: getLast10(away) },
      { label: '主场', leftVal: home?.home ?? '0-0', rightVal: away?.home ?? '0-0' },
      { label: '客场', leftVal: home?.away ?? '0-0', rightVal: away?.away ?? '0-0' },
      { label: '积分', leftVal: home?.points ?? '0-0', rightVal: away?.points ?? '0-0' },
    ],
  };
};

const buildCircleItem = (label: string, lStr?: string, rStr?: string): AverageCircleItem => {
  const l = parseNum(lStr);
  const r = parseNum(rStr);
  const total = l + r;
  return {
    label,
    leftValue: Math.round(l),
    rightValue: Math.round(r),
    leftPercent: total === 0 ? 0 : l / total,
    rightPercent: total === 0 ? 0 : r / total,
  };
};

const buildStatItem = (label: string, lStr?: string, rStr?: string): AverageStatItem => {
  const l = parseNum(lStr);
  const r = parseNum(rStr);
  const maxVal = l + r || 1;
  return { label, leftValue: l, rightValue: r, maxValue: maxVal };
};

/** 场均对比 */
export const buildAverageComparison = (
  compare?: AnalysisCompare,
): { circleItems: AverageCircleItem[]; statItems: AverageStatItem[] } => {
  const home = compare?.home;
  const away = compare?.away;
  return {
    circleItems: [
      buildCircleItem('三分%', home?.three_points_accuracy, away?.three_points_accuracy),
      buildCircleItem('投篮%', home?.field_goals_accuracy, away?.field_goals_accuracy),
      buildCircleItem('罚球%', home?.free_throws_accuracy, away?.free_throws_accuracy),
    ],
    statItems: [
      buildStatItem('得分', home?.points, away?.points),
      buildStatItem('失分', home?.points_against, away?.points_against),
      buildStatItem('篮板', home?.rebounds, away?.rebounds),
      buildStatItem('助攻', home?.assists, away?.assists),
      buildStatItem('盖帽', home?.blocks, away?.blocks),
      buildStatItem('抢断', home?.steals, away?.steals),
    ],
  };
};

/** 历史交锋 */
export const applyHistoricalMatchup = (
  matches: AnalysisMatchEntity[] | undefined,
  filter: AnalysisFilterState,
  homeId: string,
  awayId: string,
  leagueId: string,
): { matchList: AnalysisMatchItem[]; stats: AnalysisStats | null } => {
  const all = matches ?? [];
  const filtered = filterMatches(all, filter, homeId, awayId, leagueId);
  const matchList = filtered.map((e) => mapMatchToItem(e, homeId));
  const stats = computeStats(filtered, homeId);
  return { matchList, stats };
};

/** 近期战绩（单队） */
export const applyRecentRecord = (
  raw: AnalysisMatchEntity[] | undefined,
  filter: AnalysisFilterState,
  targetTeamId: string,
  homeId: string,
  guestId: string,
  leagueId: string,
): { matchList: AnalysisMatchItem[]; stats: AnalysisStats | null } => {
  const filtered = filterMatches(raw ?? [], filter, homeId, guestId, leagueId);
  const matchList = filtered.map((e) => mapMatchToItem(e, targetTeamId));
  const stats = computeStats(filtered, targetTeamId);
  return { matchList, stats };
};

const calcIntervalFromCurrent = (ts: string | undefined, currentTs: number): string => {
  const matchTs = parseTimestamp(ts);
  if (matchTs === 0 || currentTs === 0) return '-';
  const matchDate = new Date(matchTs * 1000);
  const currentDate = new Date(currentTs * 1000);
  const totalHours = Math.abs(
    Math.floor((matchDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60)),
  );
  const days = Math.floor(totalHours / 24);
  if (days < 1) return '-';
  return `${days}天`;
};

const buildCombinedScheduleList = (
  historyData: AnalysisMatchEntity[] | undefined,
  futureData: AnalysisMatchEntity[] | undefined,
  currentItem: ScheduleItem,
  currentMatchTs: number,
): ScheduleItem[] => {
  const result: ScheduleItem[] = [];

  if (historyData && historyData.length > 0) {
    const sorted = [...historyData].sort(
      (a, b) => parseTimestamp(b.match_time) - parseTimestamp(a.match_time),
    );
    const lastMatch = sorted[0]!;
    result.push({
      date: fmtScheduleDate(lastMatch.match_time),
      leagueName: lastMatch.sclass_name ?? '-',
      homeTeam: lastMatch.home_team_name ?? '-',
      guestTeam: lastMatch.guest_team_name ?? '-',
      scoreOrVs: `${lastMatch.home_score ?? '0'}-${lastMatch.guest_score ?? '0'}`,
      interval: calcIntervalFromCurrent(lastMatch.match_time, currentMatchTs),
      scheduleId: lastMatch.schedule_id,
    });
  }

  result.push(currentItem);

  if (futureData && futureData.length > 0) {
    const sorted = [...futureData].sort(
      (a, b) => parseTimestamp(a.match_time) - parseTimestamp(b.match_time),
    );
    sorted.forEach((match) => {
      result.push({
        date: fmtScheduleDate(match.match_time),
        leagueName: match.sclass_name ?? '-',
        homeTeam: match.home_team_name ?? '-',
        guestTeam: match.guest_team_name ?? '-',
        scoreOrVs: 'VS',
        interval: calcIntervalFromCurrent(match.match_time, currentMatchTs),
        scheduleId: match.schedule_id,
      });
    });
  }

  return result;
};

/** 近期赛程 */
export const buildRecentSchedule = (
  data: AnalysisData | null,
  matchInfo: DiscoverMatchInfo | null | undefined,
  homeName: string,
  awayName: string,
): { homeList: ScheduleItem[]; guestList: ScheduleItem[] } => {
  const currentMatchTs = resolveCurrentMatchTimestamp(matchInfo);
  const currentMatchTime = matchInfo?.match_time || matchInfo?.begin_timestamp;
  const isCurrentFinished = matchInfo?.match_state === '8';

  const currentItem: ScheduleItem = {
    date: fmtScheduleDate(currentMatchTime),
    leagueName: matchInfo?.sclass_name ?? '-',
    homeTeam: homeName || matchInfo?.home_team_name || '-',
    guestTeam: awayName || matchInfo?.guest_team_name || '-',
    scoreOrVs: isCurrentFinished
      ? `${matchInfo?.home_score ?? '0'}-${matchInfo?.guest_score ?? '0'}`
      : 'VS',
    interval: '本场',
    isCurrent: true,
    scheduleId: matchInfo?.schedule_id,
  };

  return {
    homeList: buildCombinedScheduleList(
      data?.history?.home,
      data?.future?.home,
      currentItem,
      currentMatchTs,
    ),
    guestList: buildCombinedScheduleList(
      data?.history?.away,
      data?.future?.away,
      currentItem,
      currentMatchTs,
    ),
  };
};

const SCORE_DIFF_LABELS = ['1-5', '6-10', '11-15', '16-20', '21-25', '26+'];

const getScoreDiffIndex = (diff: number): number => {
  if (diff >= 1 && diff <= 5) return 0;
  if (diff >= 6 && diff <= 10) return 1;
  if (diff >= 11 && diff <= 15) return 2;
  if (diff >= 16 && diff <= 20) return 3;
  if (diff >= 21 && diff <= 25) return 4;
  if (diff >= 26) return 5;
  return -1;
};

const filterDistributionMatches = (
  source: AnalysisMatchEntity[],
  filter: AnalysisFilterState,
  homeId: string,
  awayId: string,
  sclassId: string,
): AnalysisMatchEntity[] => {
  let list = [...source];
  list.sort((a, b) => parseTimestamp(b.match_time) - parseTimestamp(a.match_time));

  if (list.length > filter.matchCount) {
    list = list.slice(0, filter.matchCount);
  }
  if (filter.sameLeague && sclassId) {
    list = list.filter((m) => m.sclass_id === sclassId);
  }
  if (filter.sameHomeAway) {
    list = list.filter((m) => m.home_team_id === homeId && m.guest_team_id === awayId);
  }
  return list;
};

const bumpDistributionStat = (
  stats: Record<number, number[]>,
  index: number,
  slot: number,
): void => {
  const row = stats[index] ?? [0, 0, 0, 0];
  row[slot] = (row[slot] ?? 0) + 1;
  stats[index] = row;
};

const processScoreDiffMatch = (
  match: AnalysisMatchEntity,
  stats: Record<number, number[]>,
  isHomeTeamLogic: boolean,
  homeId: string,
  awayId: string,
): void => {
  const hScore = parseIntVal(match.home_score);
  const aScore = parseIntVal(match.guest_score);
  if (hScore === 0 && aScore === 0) return;

  const targetId = isHomeTeamLogic ? homeId : awayId;
  const isPlayingAsHome = match.home_team_id === targetId;
  const myScore = isPlayingAsHome ? hScore : aScore;
  const opScore = isPlayingAsHome ? aScore : hScore;

  if (myScore <= opScore) return;

  const diff = Math.abs(hScore - aScore);
  const index = getScoreDiffIndex(diff);
  if (index === -1) return;

  if (isHomeTeamLogic) {
    bumpDistributionStat(stats, index, isPlayingAsHome ? 0 : 1);
  } else {
    bumpDistributionStat(stats, index, isPlayingAsHome ? 2 : 3);
  }
};

const buildDistributionResult = (
  stats: Record<number, number[]>,
  labels: readonly string[] = SCORE_DIFF_LABELS,
): DistributionResult => {
  const items = labels.map((label, index) => {
    const counts = stats[index] ?? [0, 0, 0, 0];
    return {
      label,
      homeMain: String(counts[0] ?? 0),
      homeGuest: String(counts[1] ?? 0),
      homeTotal: String((counts[0] ?? 0) + (counts[1] ?? 0)),
      guestMain: String(counts[2] ?? 0),
      guestGuest: String(counts[3] ?? 0),
      guestTotal: String((counts[2] ?? 0) + (counts[3] ?? 0)),
    };
  });

  let hm = 0;
  let hg = 0;
  let gm = 0;
  let gg = 0;
  Object.values(stats).forEach((v) => {
    hm += v[0] ?? 0;
    hg += v[1] ?? 0;
    gm += v[2] ?? 0;
    gg += v[3] ?? 0;
  });

  return {
    items,
    hMain: hm,
    hGuest: hg,
    hTotal: hm + hg,
    gMain: gm,
    gGuest: gg,
    gTotal: gm + gg,
  };
};

/** 胜分差 */
export const calculateScoreDifference = (
  vsData: AnalysisMatchEntity[] | undefined,
  filter: AnalysisFilterState,
  homeId: string,
  awayId: string,
  sclassId: string,
): DistributionResult => {
  const stats: Record<number, number[]> = {
    0: [0, 0, 0, 0],
    1: [0, 0, 0, 0],
    2: [0, 0, 0, 0],
    3: [0, 0, 0, 0],
    4: [0, 0, 0, 0],
    5: [0, 0, 0, 0],
  };

  const source = vsData ?? [];

  if (homeId) {
    const filtered = filterDistributionMatches(source, filter, homeId, awayId, sclassId);
    filtered.forEach((m) => processScoreDiffMatch(m, stats, true, homeId, awayId));
  }
  if (awayId) {
    const filtered = filterDistributionMatches(source, filter, homeId, awayId, sclassId);
    filtered.forEach((m) => processScoreDiffMatch(m, stats, false, homeId, awayId));
  }

  return buildDistributionResult(stats);
};

const HALF_FULL_LABELS = ['胜胜', '胜负', '平胜', '平负', '负胜', '负负'];
const HALF_FULL_KEY_MAP: Record<string, number> = {
  胜胜: 0,
  胜负: 1,
  平胜: 2,
  平负: 3,
  负胜: 4,
  负负: 5,
};

const processHalfFullMatch = (
  match: AnalysisMatchEntity,
  stats: Record<number, number[]>,
  isHomeTeamLogic: boolean,
  homeId: string,
  awayId: string,
): void => {
  const fullHome = parseIntVal(match.home_score);
  const fullGuest = parseIntVal(match.guest_score);
  if (fullHome === 0 && fullGuest === 0) return;

  const targetId = isHomeTeamLogic ? homeId : awayId;
  const isPlayingAsHome = match.home_team_id === targetId;

  const halfHome = parseIntVal(match.home_half_score);
  const halfGuest = parseIntVal(match.guest_half_score);

  const targetFull = isPlayingAsHome ? fullHome : fullGuest;
  const oppFull = isPlayingAsHome ? fullGuest : fullHome;
  const targetHalf = isPlayingAsHome ? halfHome : halfGuest;
  const oppHalf = isPlayingAsHome ? halfGuest : halfHome;

  let halfRes: string;
  if (targetHalf > oppHalf) halfRes = '胜';
  else if (targetHalf === oppHalf) halfRes = '平';
  else halfRes = '负';

  let fullRes: string;
  if (targetFull > oppFull) fullRes = '胜';
  else if (targetFull === oppFull) fullRes = '平';
  else fullRes = '负';

  const key = `${halfRes}${fullRes}`;
  const index = HALF_FULL_KEY_MAP[key];
  if (index === undefined) return;

  if (isHomeTeamLogic) {
    bumpDistributionStat(stats, index, isPlayingAsHome ? 0 : 1);
  } else {
    bumpDistributionStat(stats, index, isPlayingAsHome ? 2 : 3);
  }
};

/** 半全场胜负 */
export const calculateHalfFullTime = (
  vsData: AnalysisMatchEntity[] | undefined,
  filter: AnalysisFilterState,
  homeId: string,
  awayId: string,
  sclassId: string,
): DistributionResult => {
  const stats: Record<number, number[]> = {
    0: [0, 0, 0, 0],
    1: [0, 0, 0, 0],
    2: [0, 0, 0, 0],
    3: [0, 0, 0, 0],
    4: [0, 0, 0, 0],
    5: [0, 0, 0, 0],
  };

  const source = vsData ?? [];

  if (homeId) {
    const filtered = filterDistributionMatches(source, filter, homeId, awayId, sclassId);
    filtered.forEach((m) => processHalfFullMatch(m, stats, true, homeId, awayId));
  }
  if (awayId) {
    const filtered = filterDistributionMatches(source, filter, homeId, awayId, sclassId);
    filtered.forEach((m) => processHalfFullMatch(m, stats, false, homeId, awayId));
  }

  return buildDistributionResult(stats, HALF_FULL_LABELS);
};
