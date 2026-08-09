/** 角球单场记录（/v2/sport/match/conner） */
export interface CornerKickMatchRecord {
  matchId?: string;
  matchTime?: string;
  tournamentName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeConnerGoal?: string;
  awayConnerGoal?: string;
  handicap?: string;
  realResult?: string;
}

export interface CornerKickConnerData {
  fightInfo: CornerKickMatchRecord[];
  homeRanking: CornerKickMatchRecord[];
  awayRanking: CornerKickMatchRecord[];
}

export interface CornerKickData {
  conner: CornerKickConnerData | null;
}

export type CornerKickStatsRowType = 'avg' | 'percent';

export interface CornerKickStatsRow {
  label: string;
  home: number;
  away: number;
  avg: number;
  type: CornerKickStatsRowType;
}

export interface CornerKickHistoryRow {
  date: string;
  league: string;
  home: string;
  away: string;
  corners: string;
  homeHighlight: 'win' | 'lose' | 'none';
  awayHighlight: 'win' | 'lose' | 'none';
  bigSmallText: string;
  bigSmallTone: 'big' | 'small' | 'none';
}

export interface CornerKickBigSmallRate {
  bigRate: number;
  smallRate: number;
}

const toRecordList = (raw: unknown): CornerKickMatchRecord[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const json = item as Record<string, unknown>;
    return {
      matchId: typeof json.match_id === 'string' ? json.match_id : undefined,
      matchTime: typeof json.match_time === 'string' ? json.match_time : undefined,
      tournamentName: typeof json.tournament_name === 'string' ? json.tournament_name : undefined,
      homeTeamName: typeof json.home_team_name === 'string' ? json.home_team_name : undefined,
      awayTeamName: typeof json.away_team_name === 'string' ? json.away_team_name : undefined,
      homeTeamId: typeof json.home_team_id === 'string' ? json.home_team_id : undefined,
      awayTeamId: typeof json.away_team_id === 'string' ? json.away_team_id : undefined,
      homeConnerGoal: typeof json.home_conner_goal === 'string' ? json.home_conner_goal : undefined,
      awayConnerGoal: typeof json.away_conner_goal === 'string' ? json.away_conner_goal : undefined,
      handicap: typeof json.handicap === 'string' ? json.handicap : undefined,
      realResult: typeof json.real_result === 'string' ? json.real_result : undefined,
    };
  });
};

/** 解析 /v2/sport/match/conner 的 data */
export const normalizeCornerKickData = (
  raw: Record<string, unknown> | null | undefined,
): CornerKickData => {
  if (!raw?.conner || typeof raw.conner !== 'object') {
    return { conner: null };
  }

  const conner = raw.conner as Record<string, unknown>;
  return {
    conner: {
      fightInfo: toRecordList(conner.fight_info),
      homeRanking: toRecordList(conner.home_ranking),
      awayRanking: toRecordList(conner.away_ranking),
    },
  };
};
