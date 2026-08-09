/**
 * 赛事分析（/v2/sport/sd/match/analysis）类型与归一化
 * 对齐 App match_goal_distribution_model.dart
 * 发现-历史 使用其中的 history（历史交锋/近期战绩）与 goal_distribution（进球分布）
 */

/** 单场历史比赛 */
export interface HistoryMatchItem {
  scheduleId: string;
  matchTime: string;
  sclassId: string;
  sclassName: string;
  sclassLogo: string;
  homeTeamId: string;
  homeTeamName: string;
  homeLogo: string;
  guestTeamId: string;
  guestTeamName: string;
  guestLogo: string;
  homeScore: string;
  guestScore: string;
  homeHalfScore: string;
  guestHalfScore: string;
  /** 让球盘口 */
  letScore: string;
  /** 大小球盘口 */
  totalScore: string;
  /** 让球指数（如 "1.9|-0.5|1.9"） */
  indexLet: string;
  /** 标准(欧赔/1X2)指数（如 "1.4|4.5|5.5"） */
  indexStand: string;
  /** 大小球指数（如 "0.8|3.5|1"） */
  indexTotal: string;
}

/** 历史比赛（对阵/主队/客队） */
export interface HistoryMatches {
  vs: HistoryMatchItem[];
  home: HistoryMatchItem[];
  away: HistoryMatchItem[];
}

/** 近期赛程（未来赛程，主队/客队） */
export interface HistoryFuture {
  home: HistoryMatchItem[];
  away: HistoryMatchItem[];
}

/** 进球分布区间：接口每行为 [count, pct, start, end] */
export type GoalDisRow = string[];

export interface GoalDisScope {
  scored: GoalDisRow[];
  conceded: GoalDisRow[];
  matches: string;
}

export interface GoalDisSide {
  all: GoalDisScope | null;
  home: GoalDisScope | null;
  away: GoalDisScope | null;
}

export interface GoalDistribution {
  /** 主队进球分布 */
  home: GoalDisSide | null;
  /** 客队进球分布 */
  guest: GoalDisSide | null;
}

/** 归一化后的赛事分析数据 */
export interface MatchAnalysisData {
  history: HistoryMatches;
  future: HistoryFuture;
  goalDistribution: GoalDistribution;
}

// ---------- 归一化 ----------

type Json = Record<string, unknown>;

const asObject = (raw: unknown): Json | null =>
  raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Json) : null;

const asString = (raw: unknown): string => {
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  return '';
};

const toMatchItem = (raw: unknown): HistoryMatchItem => {
  const j = asObject(raw) ?? {};
  return {
    scheduleId: asString(j.schedule_id),
    matchTime: asString(j.match_time),
    sclassId: asString(j.sclass_id),
    sclassName: asString(j.sclass_name),
    sclassLogo: asString(j.sclass_logo),
    homeTeamId: asString(j.home_team_id),
    homeTeamName: asString(j.home_team_name),
    homeLogo: asString(j.home_logo),
    guestTeamId: asString(j.guest_team_id),
    guestTeamName: asString(j.guest_team_name),
    guestLogo: asString(j.guest_logo),
    homeScore: asString(j.home_score),
    guestScore: asString(j.guest_score),
    homeHalfScore: asString(j.home_half_score),
    guestHalfScore: asString(j.guest_half_score),
    letScore: asString(j.let_score),
    totalScore: asString(j.total_score),
    indexLet: asString(j.index_let),
    indexStand: asString(j.index_stand),
    indexTotal: asString(j.index_total),
  };
};

const toMatchList = (raw: unknown): HistoryMatchItem[] =>
  Array.isArray(raw) ? raw.map(toMatchItem) : [];

const toGoalDisRows = (raw: unknown): GoalDisRow[] =>
  Array.isArray(raw) ? raw.map((row) => (Array.isArray(row) ? row.map(asString) : [])) : [];

const toGoalDisScope = (raw: unknown): GoalDisScope | null => {
  const j = asObject(raw);
  if (!j) return null;
  return {
    scored: toGoalDisRows(j.scored),
    conceded: toGoalDisRows(j.conceded),
    matches: asString(j.matches),
  };
};

const toGoalDisSide = (raw: unknown): GoalDisSide | null => {
  const j = asObject(raw);
  if (!j) return null;
  return {
    all: toGoalDisScope(j.all),
    home: toGoalDisScope(j.home),
    away: toGoalDisScope(j.away),
  };
};

export const normalizeMatchAnalysis = (raw: unknown): MatchAnalysisData => {
  const j = asObject(raw) ?? {};
  const history = asObject(j.history) ?? {};
  const future = asObject(j.future) ?? {};
  const gd = asObject(j.goal_distribution) ?? {};
  return {
    history: {
      vs: toMatchList(history.vs),
      home: toMatchList(history.home),
      away: toMatchList(history.away),
    },
    future: {
      home: toMatchList(future.home),
      away: toMatchList(future.away),
    },
    goalDistribution: {
      home: toGoalDisSide(gd.goal_dis_home),
      guest: toGoalDisSide(gd.goal_dis_guest),
    },
  };
};
