/** 分析页比赛记录（API 原始字段） */
export interface AnalysisMatchEntity {
  match_time?: string;
  sclass_name?: string;
  home_team_name?: string;
  guest_team_name?: string;
  home_score?: string;
  guest_score?: string;
  home_half_score?: string;
  guest_half_score?: string;
  let_score?: string;
  total_score?: string;
  home_team_id?: string;
  guest_team_id?: string;
  sclass_id?: string;
  index_let?: string;
  index_total?: string;
  schedule_id?: string;
  match_state?: string;
  home_logo?: string;
  guest_logo?: string;
}

export interface CompareTeamStats {
  name?: string;
  team_logo?: string;
  won?: string;
  lost?: string;
  won_rate?: string;
  points_avg?: string;
  streaks?: string;
  points?: string;
  points_against?: string;
  rebounds?: string;
  assists?: string;
  blocks?: string;
  steals?: string;
  field_goals_accuracy?: string;
  three_points_accuracy?: string;
  free_throws_accuracy?: string;
  team_id?: string;
  position?: string;
  area?: string;
  game_back?: string;
  home?: string;
  away?: string;
  last10?: string;
  last_10?: string;
  show?: boolean;
}

export interface AnalysisCompare {
  home?: CompareTeamStats;
  away?: CompareTeamStats;
}

export interface AnalysisHistory {
  vs?: AnalysisMatchEntity[];
  home?: AnalysisMatchEntity[];
  away?: AnalysisMatchEntity[];
}

export interface AnalysisFuture {
  vs?: AnalysisMatchEntity[];
  home?: AnalysisMatchEntity[];
  away?: AnalysisMatchEntity[];
}

export interface AnalysisData {
  history?: AnalysisHistory;
  future?: AnalysisFuture;
  compare?: AnalysisCompare;
}

const toMatchList = (raw: unknown): AnalysisMatchEntity[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  return raw as AnalysisMatchEntity[];
};

export const normalizeAnalysisData = (raw: Record<string, unknown>): AnalysisData => {
  const historyRaw = raw.history as Record<string, unknown> | undefined;
  const futureRaw = raw.future as Record<string, unknown> | undefined;
  const compareRaw = raw.compare as Record<string, unknown> | undefined;

  return {
    history: historyRaw
      ? {
          vs: toMatchList(historyRaw.vs),
          home: toMatchList(historyRaw.home),
          away: toMatchList(historyRaw.away),
        }
      : undefined,
    future: futureRaw
      ? {
          vs: toMatchList(futureRaw.vs),
          home: toMatchList(futureRaw.home),
          away: toMatchList(futureRaw.away),
        }
      : undefined,
    compare: compareRaw
      ? {
          home: compareRaw.home as CompareTeamStats | undefined,
          away: compareRaw.away as CompareTeamStats | undefined,
        }
      : undefined,
  };
};
