/**
 * 发现页「进球」数据类型（/v2/sport/match/goal）
 * 对齐 App detail_goal/model/detai_goal_entity.dart
 */

const s = (v: unknown): string => {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
};

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {};

/** 六个 15 分钟时间段的进/失球分布（total/home/away） */
export interface GoalDistSide {
  /** 各时段总进球 [0-15, 15-30, 30-45, 45-60, 60-75, 75-90] */
  totalScored: string[];
  homeScored: string[];
  awayScored: string[];
  totalConceded: string[];
  homeConceded: string[];
  awayConceded: string[];
}

export interface GoalDist {
  home: GoalDistSide;
  away: GoalDistSide;
}

/** 进球统计（大于 X 球场次） */
export interface GoalStaticNumSide {
  totalMatches: string;
  homeMatches: string;
  awayMatches: string;
  totalNormal05: string;
  totalNormal15: string;
  totalNormal25: string;
  totalNormal35: string;
}

/** 场均统计 */
export interface GoalStaticNumAvgSide {
  totalNormalGoalAvg: string;
  homeNormalGoalAvg: string;
  awayNormalGoalAvg: string;
  totalNormalLossGoalAvg: string;
  homeNormalLossGoalAvg: string;
  awayNormalLossGoalAvg: string;
  totalNormalInGoalAvg: string;
  homeNormalInGoalAvg: string;
  awayNormalInGoalAvg: string;
}

/** 首球平均时间（秒） */
export interface GoalFirstTimeSide {
  totalScoredFirstTimeAvg: string;
  homeScoredFirstTimeAvg: string;
  awayScoredFirstTimeAvg: string;
  totalConcededFirstTimeAvg: string;
  homeConcededFirstTimeAvg: string;
  awayConcededFirstTimeAvg: string;
}

/** 先进球 / 先丢球成绩 */
export interface GoalGradeSide {
  totalScoredFirst: string;
  totalScoredFirstWin: string;
  totalScoredFirstDraw: string;
  totalScoredFirstLoss: string;
  totalOpponentScored: string;
  totalOpponentScoredWin: string;
  totalOpponentScoredDraw: string;
  totalOpponentScoredLoss: string;
}

/** 赢指统计（让球胜负 + 大小球） */
export interface GoalHandicapSide {
  totalAsWin: string;
  totalAsLoss: string;
  totalTlOver: string;
  totalTlUnder: string;
  homeAsWin: string;
  homeAsLoss: string;
  homeTlOver: string;
  homeTlUnder: string;
  awayAsWin: string;
  awayAsLoss: string;
  awayTlOver: string;
  awayTlUnder: string;
  tournamentId: string;
  seasonId: string;
}

/** 其他统计（双方进球 / 零封 / 上下半场进失球） */
export interface GoalOtherSide {
  totalMatches: string;
  totalNormalBts: string;
  totalNormalCs: string;
  totalHalfNormalGoal: string;
  totalHalfNormalLossGoal: string;
}

/** 状态对比（本赛季 vs 近 6 场场均） */
export interface GoalStateSide {
  totalNormalGoalAvg: string;
  totalNormalScoreAvg: string;
  totalNormalConcedeAvg: string;
  totalRecentGoalAvg: string;
  totalRecentScoreAvg: string;
  totalRecentConcedeAvg: string;
}

export interface GoalData {
  dist: GoalDist;
  staticNum: { home: GoalStaticNumSide; away: GoalStaticNumSide };
  staticNumAvg: { home: GoalStaticNumAvgSide; away: GoalStaticNumAvgSide };
  firstGoalTime: { home: GoalFirstTimeSide; away: GoalFirstTimeSide };
  grade: { home: GoalGradeSide; away: GoalGradeSide };
  handicap: { home: GoalHandicapSide; away: GoalHandicapSide };
  other: { home: GoalOtherSide; away: GoalOtherSide };
  state: { home: GoalStateSide; away: GoalStateSide };
  isVip: boolean;
}

const QUARTERS = [
  'first_quarter',
  'second_quarter',
  'third_quarter',
  'fourth_quarter',
  'fifth_quarter',
  'sixth_quarter',
] as const;

const distSide = (raw: unknown): GoalDistSide => {
  const o = obj(raw);
  // key 形如 total_scored_first_quarter
  const col = (metric: string): string[] => QUARTERS.map((q) => s(o[`${metric}_${q}`]));
  return {
    totalScored: col('total_scored'),
    homeScored: col('home_scored'),
    awayScored: col('away_scored'),
    totalConceded: col('total_conceded'),
    homeConceded: col('home_conceded'),
    awayConceded: col('away_conceded'),
  };
};

const staticNumSide = (raw: unknown): GoalStaticNumSide => {
  const o = obj(raw);
  return {
    totalMatches: s(o.total_matches),
    homeMatches: s(o.home_matches),
    awayMatches: s(o.away_matches),
    totalNormal05: s(o.total_normal_05),
    totalNormal15: s(o.total_normal_15),
    totalNormal25: s(o.total_normal_25),
    totalNormal35: s(o.total_normal_35),
  };
};

const staticNumAvgSide = (raw: unknown): GoalStaticNumAvgSide => {
  const o = obj(raw);
  return {
    totalNormalGoalAvg: s(o.total_normal_goal_avg),
    homeNormalGoalAvg: s(o.home_normal_goal_avg),
    awayNormalGoalAvg: s(o.away_normal_goal_avg),
    totalNormalLossGoalAvg: s(o.total_normal_loss_goal_avg),
    homeNormalLossGoalAvg: s(o.home_normal_loss_goal_avg),
    awayNormalLossGoalAvg: s(o.away_normal_loss_goal_avg),
    totalNormalInGoalAvg: s(o.total_normal_in_goal_avg),
    homeNormalInGoalAvg: s(o.home_normal_in_goal_avg),
    awayNormalInGoalAvg: s(o.away_normal_in_goal_avg),
  };
};

const firstTimeSide = (raw: unknown): GoalFirstTimeSide => {
  const o = obj(raw);
  return {
    totalScoredFirstTimeAvg: s(o.total_scored_first_time_avg),
    homeScoredFirstTimeAvg: s(o.home_scored_first_time_avg),
    awayScoredFirstTimeAvg: s(o.away_scored_first_time_avg),
    totalConcededFirstTimeAvg: s(o.total_conceded_first_time_avg),
    homeConcededFirstTimeAvg: s(o.home_conceded_first_time_avg),
    awayConcededFirstTimeAvg: s(o.away_conceded_first_time_avg),
  };
};

const gradeSide = (raw: unknown): GoalGradeSide => {
  const o = obj(raw);
  return {
    totalScoredFirst: s(o.total_scored_first),
    totalScoredFirstWin: s(o.total_scored_first_win),
    totalScoredFirstDraw: s(o.total_scored_first_draw),
    totalScoredFirstLoss: s(o.total_scored_first_loss),
    totalOpponentScored: s(o.total_opponent_scored),
    totalOpponentScoredWin: s(o.total_opponent_scored_win),
    totalOpponentScoredDraw: s(o.total_opponent_scored_draw),
    totalOpponentScoredLoss: s(o.total_opponent_scored_loss),
  };
};

const handicapSide = (raw: unknown): GoalHandicapSide => {
  const o = obj(raw);
  return {
    totalAsWin: s(o.total_as_win),
    totalAsLoss: s(o.total_as_loss),
    totalTlOver: s(o.total_tl_over),
    totalTlUnder: s(o.total_tl_under),
    homeAsWin: s(o.home_as_win),
    homeAsLoss: s(o.home_as_loss),
    homeTlOver: s(o.home_tl_over),
    homeTlUnder: s(o.home_tl_under),
    awayAsWin: s(o.away_as_win),
    awayAsLoss: s(o.away_as_loss),
    awayTlOver: s(o.away_tl_over),
    awayTlUnder: s(o.away_tl_under),
    tournamentId: s(o.tournament_id),
    seasonId: s(o.season_id),
  };
};

const otherSide = (raw: unknown): GoalOtherSide => {
  const o = obj(raw);
  return {
    totalMatches: s(o.total_matches),
    totalNormalBts: s(o.total_normal_bts),
    totalNormalCs: s(o.total_normal_cs),
    totalHalfNormalGoal: s(o.total_half_normal_goal),
    totalHalfNormalLossGoal: s(o.total_half_normal_loss_goal),
  };
};

const stateSide = (raw: unknown): GoalStateSide => {
  const o = obj(raw);
  return {
    totalNormalGoalAvg: s(o.total_normal_goal_avg),
    totalNormalScoreAvg: s(o.total_normal_score_avg),
    totalNormalConcedeAvg: s(o.total_normal_concede_avg),
    totalRecentGoalAvg: s(o.total_recent_goal_avg),
    totalRecentScoreAvg: s(o.total_recent_score_avg),
    totalRecentConcedeAvg: s(o.total_recent_concede_avg),
  };
};

const twoSides = <T>(raw: unknown, build: (v: unknown) => T): { home: T; away: T } => {
  const o = obj(raw);
  return { home: build(o.home), away: build(o.away) };
};

/** 解析 /v2/sport/match/goal 的 data.goal，返回 null 表示无数据 */
export const normalizeGoalData = (
  raw: Record<string, unknown> | null | undefined,
): GoalData | null => {
  const goal = obj(raw?.goal);
  if (!raw?.goal || Object.keys(goal).length === 0) {
    return null;
  }
  return {
    dist: twoSides(goal.goal_static_time_15_num, distSide),
    staticNum: twoSides(goal.goal_static_num, staticNumSide),
    staticNumAvg: twoSides(goal.goal_static_num_avg, staticNumAvgSide),
    firstGoalTime: twoSides(goal.first_goal_time_avg, firstTimeSide),
    grade: twoSides(goal.first_goal_grade, gradeSide),
    handicap: twoSides(goal.teach_handicap, handicapSide),
    other: twoSides(goal.tech_other, otherSide),
    state: twoSides(goal.tech_state, stateSide),
    isVip: s(obj(goal.vip_info).is_vip) === '1',
  };
};
