/**
 * 发现-历史 纯逻辑（对齐 App info_history_list_vm.dart / goal_distribution_logic.dart）
 */
import type {
  GoalDisScope,
  GoalDisSide,
  HistoryFuture,
  HistoryMatchItem,
  HistoryMatches,
} from '@/apis/origin/discover';

export type HistoryContext = 'vs' | 'home' | 'away';
export type ResultTag = 'win' | 'draw' | 'lose';
export type HandicapTag = 'win' | 'draw' | 'lose' | 'ignore';

/** 当前比赛信息（用于筛选/视角） */
export interface CurrentMatchInfo {
  homeTeamId: string;
  guestTeamId: string;
  sclassId: string;
}

const toNum = (s: string): number => {
  const v = Number.parseFloat((s ?? '').trim());
  return Number.isNaN(v) ? 0 : v;
};

const toInt = (s: string): number => {
  const v = Number.parseInt((s ?? '').trim(), 10);
  return Number.isNaN(v) ? 0 : v;
};

// ---------- 时间 ----------

export const parseMatchTime = (raw: string): Date | null => {
  const s = (raw ?? '').trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const v = Number.parseInt(s, 10);
    if (Number.isNaN(v)) return null;
    if (s.length >= 13) return new Date(v);
    if (s.length === 10) return new Date(v * 1000);
  }
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
};

/** 两行日期：{ line1: 'M月DD', line2: 'YYYY' } */
export const formatDate2Line = (raw: string): { line1: string; line2: string } => {
  const dt = parseMatchTime(raw);
  if (!dt) return { line1: '', line2: '' };
  const mm = String(dt.getMonth() + 1);
  const dd = String(dt.getDate()).padStart(2, '0');
  return { line1: `${mm}月${dd}`, line2: String(dt.getFullYear()) };
};

// ---------- 让球盘口解析 ----------

const splitOddsRaw = (raw: string): string[] => {
  const s = (raw ?? '').trim();
  if (!s) return [];
  return s
    .split(/[|\s,]+/)
    .map((e) => e.trim())
    .filter(Boolean);
};

const splitOddsH5 = (raw: string): string[] => {
  const arr = splitOddsRaw(raw);
  if (arr.length >= 4) arr.pop();
  return arr.length > 3 ? arr.slice(0, 3) : arr;
};

/** 解析亚洲盘：单值直接取，双值(a/b)取平均并处理符号 */
const parseAsianLine = (raw: string): number | null => {
  const s = (raw ?? '').trim();
  if (!s) return null;
  const text = s.replace(/\s/g, '');
  if (!text.includes('/')) {
    const v = Number.parseFloat(text.replace(/\+/g, ''));
    return Number.isNaN(v) ? null : v;
  }
  const parts = text.split('/');
  if (parts.length !== 2) return null;
  const aStr = (parts[0] ?? '').trim();
  const bStr = (parts[1] ?? '').trim();
  if (!aStr || !bStr) return null;
  const sign = aStr.startsWith('-') ? -1 : aStr.startsWith('+') ? 1 : 0;
  const a = Number.parseFloat(aStr.replace(/\+/g, ''));
  if (Number.isNaN(a)) return null;
  let b: number;
  if (bStr.startsWith('-') || bStr.startsWith('+')) {
    b = Number.parseFloat(bStr.replace(/\+/g, ''));
  } else {
    const bv = Number.parseFloat(bStr);
    b = Number.isNaN(bv) ? NaN : sign < 0 ? -bv : bv;
  }
  if (Number.isNaN(b)) return null;
  return (a + b) / 2;
};

const parseLetLineValue = (m: HistoryMatchItem): number | null => {
  const v1 = parseAsianLine(m.letScore);
  if (v1 != null) return v1;
  const p = splitOddsH5(m.indexLet);
  if (p.length >= 2) {
    const v2 = parseAsianLine(p[1] ?? '');
    if (v2 != null) return v2;
  }
  return null;
};

// ---------- 展开态赔率（对齐 App info_history_list_vm.dart MatchItemMapper） ----------

const tryNum = (s: string): number | null => {
  const v = Number.parseFloat((s ?? '').replace(/\+/g, '').trim());
  return Number.isNaN(v) ? null : v;
};

/** 返回“唯一最小值”的下标；并列或全空返回 null */
const uniqueMinIndex = (nums: (number | null)[]): number | null => {
  const valid = new Map<number, number>();
  nums.forEach((v, i) => {
    if (v != null) valid.set(i, v);
  });
  if (valid.size === 0) return null;
  let minVal = Infinity;
  for (const v of valid.values()) minVal = Math.min(minVal, v);
  const idxs = [...valid.entries()].filter(([, v]) => v === minVal).map(([i]) => i);
  return idxs.length === 1 ? (idxs[0] ?? null) : null;
};

/** 1X2（欧赔）三行：唯一最小值加粗 */
export interface StandOdds {
  home: string;
  draw: string;
  away: string;
  homeBold: boolean;
  drawBold: boolean;
  awayBold: boolean;
}

/** 让球：盘口 + 两边赔率 */
export interface HandicapOdds {
  line: string;
  homeOdd: string;
  awayOdd: string;
  homeOddBold: boolean;
  awayOddBold: boolean;
}

/** 大小球：大/小标签 + 两边赔率 */
export interface TotalOdds {
  overLabel: string;
  underLabel: string;
  overOdd: string;
  underOdd: string;
  overOddBold: boolean;
  underOddBold: boolean;
}

export interface RowOdds {
  stand: StandOdds;
  handicap: HandicapOdds;
  total: TotalOdds;
}

const parseStandOdds = (m: HistoryMatchItem): StandOdds => {
  const p = splitOddsH5(m.indexStand);
  const home = p[0] ?? '';
  const draw = p[1] ?? '';
  const away = p[2] ?? '';
  const minIdx = uniqueMinIndex([tryNum(home), tryNum(draw), tryNum(away)]);
  return {
    home,
    draw,
    away,
    homeBold: minIdx === 0,
    drawBold: minIdx === 1,
    awayBold: minIdx === 2,
  };
};

const parseHandicapOdds = (m: HistoryMatchItem): HandicapOdds => {
  const p = splitOddsH5(m.indexLet);
  let odd0 = '';
  let line = '';
  let odd2 = '';
  if (p.length >= 3) {
    [odd0, line, odd2] = [p[0] ?? '', p[1] ?? '', p[2] ?? ''];
  } else {
    const raw = splitOddsRaw(m.indexLet);
    odd0 = raw[0] ?? '';
    line = raw[1] ?? '';
    odd2 = raw[2] ?? '';
  }
  if (!line.trim()) line = (m.letScore ?? '').trim();
  const minIdx = uniqueMinIndex([tryNum(odd0), tryNum(odd2)]);
  return {
    line: line.trim(),
    homeOdd: odd0.trim(),
    awayOdd: odd2.trim(),
    homeOddBold: minIdx === 0,
    awayOddBold: minIdx === 1,
  };
};

const parseTotalOdds = (m: HistoryMatchItem): TotalOdds => {
  const p = splitOddsH5(m.indexTotal);
  let overOdd = '';
  let line = '';
  let underOdd = '';
  if (p.length >= 3) {
    [overOdd, line, underOdd] = [p[0] ?? '', p[1] ?? '', p[2] ?? ''];
  } else {
    const raw = splitOddsRaw(m.indexTotal);
    overOdd = raw[0] ?? '';
    line = raw[1] ?? '';
    underOdd = raw[2] ?? '';
  }
  if (!line.trim()) line = (m.totalScore ?? '').trim();
  const lineText = line.trim();
  const minIdx = uniqueMinIndex([tryNum(overOdd), tryNum(underOdd)]);
  return {
    overLabel: lineText ? `大 ${lineText}` : '大',
    underLabel: lineText ? `小 ${lineText}` : '小',
    overOdd: overOdd.trim(),
    underOdd: underOdd.trim(),
    overOddBold: minIdx === 0,
    underOddBold: minIdx === 1,
  };
};

export const parseRowOdds = (m: HistoryMatchItem): RowOdds => ({
  stand: parseStandOdds(m),
  handicap: parseHandicapOdds(m),
  total: parseTotalOdds(m),
});

// ---------- 胜平负 / 赢盘 ----------

export const computeResultTag = (m: HistoryMatchItem, focusTeamId: string): ResultTag => {
  const homeId = m.homeTeamId.trim();
  const awayId = m.guestTeamId.trim();
  const hs = toNum(m.homeScore);
  const as = toNum(m.guestScore);
  let gf = hs;
  let ga = as;
  if (focusTeamId && focusTeamId === awayId) {
    gf = as;
    ga = hs;
  } else if (focusTeamId && focusTeamId === homeId) {
    gf = hs;
    ga = as;
  }
  if (gf > ga) return 'win';
  if (gf === ga) return 'draw';
  return 'lose';
};

const computeHandicapTag = (m: HistoryMatchItem, focusTeamId: string): HandicapTag => {
  const letValue = parseLetLineValue(m);
  if (letValue == null) return 'ignore';
  const hs = toNum(m.homeScore);
  const gs = toNum(m.guestScore);
  const diff = hs - gs - letValue;
  let homeTag: HandicapTag;
  if (diff > 0) homeTag = 'win';
  else if (diff < 0) homeTag = 'lose';
  else homeTag = 'draw';

  const awayId = m.guestTeamId.trim();
  if (focusTeamId && focusTeamId === awayId) {
    if (homeTag === 'win') return 'lose';
    if (homeTag === 'lose') return 'win';
    return 'draw';
  }
  return homeTag;
};

// ---------- 视角 / 筛选 ----------

export const focusTeamIdOf = (ctx: HistoryContext, cur: CurrentMatchInfo): string =>
  ctx === 'away' ? cur.guestTeamId.trim() : cur.homeTeamId.trim();

const pickBaseList = (history: HistoryMatches, ctx: HistoryContext): HistoryMatchItem[] => {
  if (ctx === 'vs') return history.vs;
  if (ctx === 'home') return history.home;
  return history.away;
};

const isSameHomeAway = (
  m: HistoryMatchItem,
  ctx: HistoryContext,
  cur: CurrentMatchInfo,
): boolean => {
  const curHome = cur.homeTeamId.trim();
  const curAway = cur.guestTeamId.trim();
  const mh = m.homeTeamId.trim();
  const ma = m.guestTeamId.trim();
  if (ctx === 'vs') {
    if (!curHome || !curAway) return true;
    return mh === curHome && ma === curAway;
  }
  if (ctx === 'home') {
    if (!curHome) return true;
    return mh === curHome;
  }
  if (!curAway) return true;
  return ma === curAway;
};

const isSameLeague = (m: HistoryMatchItem, cur: CurrentMatchInfo): boolean => {
  const curLid = cur.sclassId.trim();
  if (!curLid) return true;
  return m.sclassId.trim() === curLid;
};

// ---------- 汇总 ----------

export interface HistorySummary {
  win: number;
  draw: number;
  lose: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  handicapWinRate: number;
}

export const EMPTY_SUMMARY: HistorySummary = {
  win: 0,
  draw: 0,
  lose: 0,
  avgGoalsFor: 0,
  avgGoalsAgainst: 0,
  handicapWinRate: 0,
};

const buildSummary = (list: HistoryMatchItem[], focusTeamId: string): HistorySummary => {
  if (list.length === 0) return EMPTY_SUMMARY;
  let w = 0;
  let d = 0;
  let l = 0;
  let gfSum = 0;
  let gaSum = 0;
  let hWin = 0;
  let hDraw = 0;
  let hLose = 0;

  for (const m of list) {
    const tag = computeResultTag(m, focusTeamId);
    if (tag === 'win') w += 1;
    else if (tag === 'draw') d += 1;
    else l += 1;

    const homeId = m.homeTeamId.trim();
    const awayId = m.guestTeamId.trim();
    const hs = toNum(m.homeScore);
    const as = toNum(m.guestScore);
    if (focusTeamId && focusTeamId === awayId) {
      gfSum += as;
      gaSum += hs;
    } else if (focusTeamId && focusTeamId === homeId) {
      gfSum += hs;
      gaSum += as;
    } else {
      gfSum += hs;
      gaSum += as;
    }

    const ht = computeHandicapTag(m, focusTeamId);
    if (ht === 'win') hWin += 1;
    else if (ht === 'draw') hDraw += 1;
    else if (ht === 'lose') hLose += 1;
  }

  const n = list.length;
  const totalPan = hWin + hDraw + hLose;
  return {
    win: w,
    draw: d,
    lose: l,
    avgGoalsFor: gfSum / Math.max(1, n),
    avgGoalsAgainst: gaSum / Math.max(1, n),
    handicapWinRate: totalPan === 0 ? 0 : hWin / totalPan,
  };
};

// ---------- 列表构建 ----------

export interface HistoryRow {
  item: HistoryMatchItem;
  resultTag: ResultTag;
  date: { line1: string; line2: string };
  odds: RowOdds;
}

export interface HistoryListResult {
  rows: HistoryRow[];
  summary: HistorySummary;
  /** 当前筛选下可用的场次总数（用于场次选择上限） */
  available: number;
  /** 实际展示的场次数 */
  count: number;
}

export interface HistoryFilters {
  sameHomeAway: boolean;
  sameLeague: boolean;
  /** 期望展示场次（用户选择）；null 表示用默认 */
  desiredCount: number | null;
}

const DEFAULT_COUNT = 6;

export const buildHistoryList = (
  history: HistoryMatches,
  ctx: HistoryContext,
  cur: CurrentMatchInfo,
  filters: HistoryFilters,
): HistoryListResult => {
  const focusTeamId = focusTeamIdOf(ctx, cur);
  let list = pickBaseList(history, ctx);
  if (filters.sameHomeAway) list = list.filter((m) => isSameHomeAway(m, ctx, cur));
  if (filters.sameLeague) list = list.filter((m) => isSameLeague(m, cur));

  const available = list.length;
  if (available === 0) {
    return { rows: [], summary: EMPTY_SUMMARY, available: 0, count: 0 };
  }

  const desired = filters.desiredCount ?? DEFAULT_COUNT;
  const count = Math.min(Math.max(1, desired), available);
  const limited = list.slice(0, count);

  const rows: HistoryRow[] = limited.map((item) => ({
    item,
    resultTag: computeResultTag(item, focusTeamId),
    date: formatDate2Line(item.matchTime),
    odds: parseRowOdds(item),
  }));

  return { rows, summary: buildSummary(limited, focusTeamId), available, count };
};

// ---------- 按联赛分组 ----------

export interface LeagueGroup {
  leagueName: string;
  leagueLogo: string;
  rows: HistoryRow[];
}

const EPOCH = new Date(0).getTime();
const rowTime = (r: HistoryRow): number => parseMatchTime(r.item.matchTime)?.getTime() ?? EPOCH;

export const groupByLeague = (rows: HistoryRow[]): LeagueGroup[] => {
  const groups: LeagueGroup[] = [];
  const map = new Map<string, LeagueGroup>();
  for (const r of rows) {
    const key = r.item.sclassName.trim();
    let g = map.get(key);
    if (!g) {
      g = { leagueName: key || '未知联赛', leagueLogo: r.item.sclassLogo, rows: [] };
      map.set(key, g);
      groups.push(g);
    }
    g.rows.push(r);
  }
  // 组内：时间从近到远
  for (const g of groups) g.rows.sort((a, b) => rowTime(b) - rowTime(a));
  // 组间：以组内最老比赛时间，从近到远
  const oldest = (g: LeagueGroup) => g.rows.reduce((min, r) => Math.min(min, rowTime(r)), Infinity);
  groups.sort((a, b) => oldest(b) - oldest(a));
  return groups;
};

// ---------- 进球分布 ----------

const SEG_DEFS: [number, number][] = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
  [76, 90],
];
const SEG_LEN = SEG_DEFS.length;

const overlapLen = (a1: number, a2: number, b1: number, b2: number): number => {
  const left = Math.max(a1, b1);
  const right = Math.min(a2, b2);
  return right >= left ? right - left + 1 : 0;
};

const indexOfSeg = (start: number, end: number): number => {
  for (let i = 0; i < SEG_LEN; i += 1) {
    const def = SEG_DEFS[i];
    if (def && def[0] === start && def[1] === end) return i;
  }
  let bestIdx = -1;
  let bestOverlap = -1;
  for (let i = 0; i < SEG_LEN; i += 1) {
    const def = SEG_DEFS[i];
    if (!def) continue;
    const ov = overlapLen(start, end, def[0], def[1]);
    if (ov > bestOverlap) {
      bestOverlap = ov;
      bestIdx = i;
    }
  }
  return bestOverlap <= 0 ? -1 : bestIdx;
};

const fillSegments = (rows: string[][]): number[] => {
  const out = new Array<number>(SEG_LEN).fill(0);
  for (const row of rows) {
    if (row.length < 4) continue;
    const cnt = toInt(row[0] ?? '');
    const start = toInt(row[2] ?? '');
    const end = toInt(row[3] ?? '');
    const idx = indexOfSeg(start, end);
    if (idx >= 0 && idx < SEG_LEN) out[idx] = cnt;
  }
  return out;
};

export interface GoalSegments {
  scored: number[];
  conceded: number[];
  totalScored: number;
  totalConceded: number;
}

export const parseGoalSegments = (scope: GoalDisScope | null): GoalSegments => {
  const scored = fillSegments(scope?.scored ?? []);
  const conceded = fillSegments(scope?.conceded ?? []);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  return { scored, conceded, totalScored: sum(scored), totalConceded: sum(conceded) };
};

/**
 * 选取球队进球分布区间。
 * 对齐 App：勾选“同主客”→ 按主/客(team-specific)；未勾选 → all(全部)。
 * 注意 App 的图片与 bool 取反，这里 sameHomeAway 直接表示“勾选态(视觉)”。
 */
export const pickGoalScope = (
  side: GoalDisSide | null,
  sameHomeAway: boolean,
  teamKind: 'home' | 'away',
): GoalDisScope | null => {
  if (!side) return null;
  const preferred = sameHomeAway ? side[teamKind] : side.all;
  return preferred ?? side.all ?? side.home ?? side.away;
};

/** 有无进球分布数据 */
export const hasGoalDistribution = (home: GoalDisSide | null, guest: GoalDisSide | null): boolean =>
  Boolean(home?.all || home?.home || home?.away || guest?.all || guest?.home || guest?.away);

/** 时间轴刻度 */
export const GOAL_AXIS_LABELS = ["0'", "15'", "30'", "45'", "60'", "75'", "90'"];

// ---------- 近期赛程（对齐 App recent_schedule_logic.dart） ----------

export type RecentScheduleSide = 'home' | 'away';

/** 当前本场比赛信息（来自 match/info 接口） */
export interface RecentScheduleMatchInfo {
  scheduleId: string;
  matchTime: string;
  matchTimeStr: string;
  matchState: string;
  homeTeamId: string;
  guestTeamId: string;
  homeTeamName: string;
  guestTeamName: string;
  homeLogo: string;
  guestLogo: string;
  sclassName: string;
  homeScore: string;
  guestScore: string;
}

/** 赛事基础信息兜底 */
export interface RecentScheduleCompetition {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamIcon: string;
  awayTeamIcon: string;
  leagueName: string;
}

export interface RecentScheduleRow {
  dateText: string; // yyyy-MM-dd
  leagueText: string;
  homeName: string;
  awayName: string;
  scoreText: string; // 'VS' | '1-2'
  gapText: string; // '本场' | 'N天' | '-'
  isCurrent: boolean;
}

export interface RecentScheduleMatch {
  scheduleId: string;
  matchTime: Date | null;
  leagueLogo: string;
  homeLogo: string;
  awayLogo: string;
  homeTeamId: string;
  awayTeamId: string;
}

export interface RecentScheduleTimeline {
  current: RecentScheduleMatch;
  previous: RecentScheduleMatch | null;
  next: RecentScheduleMatch | null;
  /** 与上一场的间隔（整数小时，null 表示无上一场） */
  gapToPreviousHours: number | null;
  gapToNextHours: number | null;
  focusTeamId: string;
}

export interface RecentScheduleResult {
  rows: RecentScheduleRow[];
  timeline: RecentScheduleTimeline | null;
}

const fmtDateYmd = (dt: Date | null): string => {
  if (!dt) return '';
  const y = String(dt.getFullYear()).padStart(4, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** 满 24 小时算 1 天，不足按小时算，days<1 显示 '-' */
const calcGapDaysFromBase = (base: Date, target: Date | null): string => {
  if (!target) return '-';
  const totalHours = Math.floor(Math.abs(target.getTime() - base.getTime()) / 3_600_000);
  const days = Math.floor(totalHours / 24);
  if (days < 1) return '-';
  return `${days}天`;
};

const trimStr = (s: string | undefined): string => (s ?? '').trim();

interface BuildRecentScheduleParams {
  side: RecentScheduleSide;
  history: HistoryMatches;
  future: HistoryFuture;
  info: RecentScheduleMatchInfo | null;
  competition: RecentScheduleCompetition;
  scheduleId: string;
  /** 无本场时间时的间隔计算兜底基准 */
  baseTime?: Date | null;
}

export const buildRecentSchedule = ({
  side,
  history,
  future,
  info,
  competition,
  scheduleId,
  baseTime = null,
}: BuildRecentScheduleParams): RecentScheduleResult => {
  const historyList = side === 'home' ? history.home : history.away;
  const futureList = side === 'home' ? future.home : future.away;

  const currentMatchTime = info
    ? (parseMatchTime(info.matchTime) ?? parseMatchTime(info.matchTimeStr))
    : null;
  const baseRef = currentMatchTime ?? baseTime ?? new Date();

  const rows: RecentScheduleRow[] = [];

  // 1. 上一场：历史中最近一场
  if (historyList.length > 0) {
    const sorted = [...historyList].sort(
      (a, b) =>
        (parseMatchTime(b.matchTime)?.getTime() ?? 0) -
        (parseMatchTime(a.matchTime)?.getTime() ?? 0),
    );
    const last = sorted[0]!;
    const mt = parseMatchTime(last.matchTime);
    const hs = trimStr(last.homeScore);
    const gs = trimStr(last.guestScore);
    rows.push({
      dateText: fmtDateYmd(mt),
      leagueText: trimStr(last.sclassName),
      homeName: trimStr(last.homeTeamName),
      awayName: trimStr(last.guestTeamName),
      scoreText: hs && gs ? `${hs}-${gs}` : 'VS',
      gapText: calcGapDaysFromBase(baseRef, mt),
      isCurrent: false,
    });
  }

  // 2. 本场（始终展示，用 competition 兜底）
  {
    let homeName: string;
    let awayName: string;
    let leagueText: string;
    let scoreText: string;
    if (info) {
      homeName = trimStr(info.homeTeamName) || competition.homeTeamName || '-';
      awayName = trimStr(info.guestTeamName) || competition.awayTeamName || '-';
      leagueText = info.sclassName;
      if (info.matchState === '1') {
        scoreText = 'VS';
      } else {
        const hs = trimStr(info.homeScore);
        const gs = trimStr(info.guestScore);
        scoreText = hs && gs ? `${hs}-${gs}` : 'VS';
      }
    } else {
      homeName = competition.homeTeamName || '-';
      awayName = competition.awayTeamName || '-';
      leagueText = competition.leagueName || '-';
      scoreText = 'VS';
    }
    rows.push({
      dateText: fmtDateYmd(currentMatchTime ?? baseTime),
      leagueText,
      homeName,
      awayName,
      scoreText,
      gapText: '本场',
      isCurrent: true,
    });
  }

  // 3. 未来赛程（升序）
  if (futureList.length > 0) {
    const sorted = [...futureList].sort(
      (a, b) =>
        (parseMatchTime(a.matchTime)?.getTime() ?? 0) -
        (parseMatchTime(b.matchTime)?.getTime() ?? 0),
    );
    for (const match of sorted) {
      const mt = parseMatchTime(match.matchTime);
      rows.push({
        dateText: fmtDateYmd(mt),
        leagueText: trimStr(match.sclassName),
        homeName: trimStr(match.homeTeamName),
        awayName: trimStr(match.guestTeamName),
        scoreText: 'VS',
        gapText: calcGapDaysFromBase(baseRef, mt),
        isCurrent: false,
      });
    }
  }

  return {
    rows,
    timeline: buildTimeline({
      side,
      historyList,
      futureList,
      info,
      competition,
      scheduleId,
      baseTime,
    }),
  };
};

interface BuildTimelineParams {
  side: RecentScheduleSide;
  historyList: HistoryMatchItem[];
  futureList: HistoryMatchItem[];
  info: RecentScheduleMatchInfo | null;
  competition: RecentScheduleCompetition;
  scheduleId: string;
  baseTime: Date | null;
}

const itemToScheduleMatch = (m: HistoryMatchItem): RecentScheduleMatch => ({
  scheduleId: trimStr(m.scheduleId),
  matchTime: parseMatchTime(m.matchTime),
  leagueLogo: trimStr(m.sclassLogo),
  homeLogo: trimStr(m.homeLogo),
  awayLogo: trimStr(m.guestLogo),
  homeTeamId: trimStr(m.homeTeamId),
  awayTeamId: trimStr(m.guestTeamId),
});

const buildTimeline = ({
  side,
  historyList,
  futureList,
  info,
  competition,
  scheduleId,
  baseTime,
}: BuildTimelineParams): RecentScheduleTimeline | null => {
  if (!info) return null;

  const focusTeamId = side === 'home' ? trimStr(info.homeTeamId) : trimStr(info.guestTeamId);
  const sid = scheduleId.trim();

  // 合并、去重（保留首次出现）、按时间升序
  const seen = new Set<string>();
  const merged = [...historyList, ...futureList].filter((m) => {
    const id = trimStr(m.scheduleId);
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  merged.sort(
    (a, b) =>
      (parseMatchTime(a.matchTime)?.getTime() ?? 0) - (parseMatchTime(b.matchTime)?.getTime() ?? 0),
  );

  const allVMs = merged.map(itemToScheduleMatch);
  const viewedTime = parseMatchTime(info.matchTime) ?? parseMatchTime(info.matchTimeStr);

  // 若本场不在 history/future 中，用 matchInfo 构建并按时间插入
  if (!allVMs.some((vm) => vm.scheduleId === sid)) {
    const viewedMatchTime = viewedTime ?? baseTime;
    if (!viewedMatchTime) return null;
    let viewedLeagueLogo = '';
    const curSclass = trimStr(info.sclassName);
    if (curSclass) {
      const found = merged.find(
        (m) => trimStr(m.sclassName) === curSclass && trimStr(m.sclassLogo),
      );
      if (found) viewedLeagueLogo = trimStr(found.sclassLogo);
    }
    const viewedVM: RecentScheduleMatch = {
      scheduleId: sid,
      matchTime: viewedMatchTime,
      leagueLogo: viewedLeagueLogo,
      homeLogo: trimStr(info.homeLogo) || competition.homeTeamIcon,
      awayLogo: trimStr(info.guestLogo) || competition.awayTeamIcon,
      homeTeamId: trimStr(info.homeTeamId),
      awayTeamId: trimStr(info.guestTeamId),
    };
    let insertIdx = allVMs.length;
    for (let i = 0; i < allVMs.length; i += 1) {
      const t = allVMs[i]!.matchTime;
      if (t && t.getTime() > viewedMatchTime.getTime()) {
        insertIdx = i;
        break;
      }
    }
    allVMs.splice(insertIdx, 0, viewedVM);
  }

  const anchorIndex = allVMs.findIndex((vm) => vm.scheduleId === sid);
  if (anchorIndex < 0) return null;

  const current = allVMs[anchorIndex]!;
  const previous = anchorIndex > 0 ? allVMs[anchorIndex - 1]! : null;
  const next = anchorIndex < allVMs.length - 1 ? allVMs[anchorIndex + 1]! : null;

  const anchorTime = current.matchTime ?? new Date();
  const hoursBetween = (a: Date, b: Date): number =>
    Math.max(0, Math.floor((a.getTime() - b.getTime()) / 3_600_000));

  const gapToPreviousHours = previous?.matchTime
    ? hoursBetween(anchorTime, previous.matchTime)
    : null;
  const gapToNextHours = next?.matchTime ? hoursBetween(next.matchTime, anchorTime) : null;

  return { current, previous, next, gapToPreviousHours, gapToNextHours, focusTeamId };
};
