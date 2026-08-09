export interface BasketStateInfo {
  /** 3分球进球数：主队,客队 */
  '1'?: string;
  /** 2分球进球数：主队,客队 */
  '2'?: string;
  /** 罚球进球数：主队,客队 */
  '3'?: string;
  /** 剩余暂停数：主队,客队 */
  '4'?: string;
  /** 犯规数：主队,客队 */
  '5'?: string;
  /** 罚球命中率：主队,客队 */
  '6'?: string;
  /** 总暂停数：主队,客队 */
  '7'?: string;
}

export interface BasketPlayerStats {
  player_id?: string;
  chinese_name?: string;
  cantonese_name?: string;
  english_name?: string;
  player_logo?: string;
  jersey_number?: string;
  playing_time?: string;
  field_goals?: string;
  three_point_goals?: string;
  free_throws?: string;
  offensive_rebounds?: string;
  defensive_rebounds?: string;
  total_rebounds?: string;
  assists?: string;
  steals?: string;
  blocks?: string;
  turnovers?: string;
  personal_fouls?: string;
  plus_minus?: string;
  points?: string;
  is_played?: string;
  is_on_court?: string;
  is_substitute?: string;
}

export interface BasketTeamStats {
  field_goals?: string;
  field_points?: string;
  three_point_goals?: string;
  three_points?: string;
  free_throws?: string;
  free_points?: string;
  offensive_rebounds?: string;
  defensive_rebounds?: string;
  total_rebounds?: string;
  assists?: string;
  steals?: string;
  blocks?: string;
  turnovers?: string;
  personal_fouls?: string;
  points?: string;
}

export interface BasketMaxStatItem {
  value?: string;
  player_logo?: string;
  player_name?: string;
}

export interface BasketStatistics {
  home_team_players?: BasketPlayerStats[];
  away_team_players?: BasketPlayerStats[];
  home_team_stats?: BasketTeamStats;
  away_team_stats?: BasketTeamStats;
  home_max_stats?: Record<string, BasketMaxStatItem>;
  guest_max_stats?: Record<string, BasketMaxStatItem>;
}

export interface BasketStatsData {
  state_info?: BasketStateInfo;
  statistics?: BasketStatistics;
}

export interface BasketLiveItem {
  game_time?: string;
  score?: string;
  neutrality?: string;
  content?: string;
  period?: string;
  points?: string;
  player_name?: string;
  player_logo?: string;
  type?: string;
}

export interface BasketLiveData {
  period_live?: BasketLiveItem[];
}
