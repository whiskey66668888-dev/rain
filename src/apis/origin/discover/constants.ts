/** FB 场馆 type：2=fb(易倍体育) */
export const DISCOVER_VENUE_TYPE_FB = 2;

export const discoverChatConfigQueryKey = (sportType: number) =>
  ['origin', 'discover', 'chatConfig', sportType] as const;

export const discoverNmMatchIdQueryKey = (matchId: string) =>
  ['origin', 'discover', 'nmMatchId', matchId] as const;

export const discoverMatchTabsQueryKey = (scheduleId: string, sportType: number) =>
  ['origin', 'discover', 'matchTabs', scheduleId, sportType] as const;

export const discoverCornerKickQueryKey = (scheduleId: string) =>
  ['origin', 'discover', 'cornerKick', scheduleId] as const;

export const discoverGoalQueryKey = (scheduleId: string) =>
  ['origin', 'discover', 'goal', scheduleId] as const;

export const discoverIntelQueryKey = (scheduleId: string, sportType: number, type: number) =>
  ['origin', 'discover', 'intel', scheduleId, sportType, type] as const;

export const discoverPolymarketBackgroundQueryKey = (scheduleId: string, sportType: number) =>
  ['origin', 'discover', 'polymarketBackground', scheduleId, sportType] as const;

export const discoverMatchAnalysisQueryKey = (scheduleId: string, sportType: number) =>
  ['origin', 'discover', 'matchAnalysis', scheduleId, sportType] as const;
export const discoverAnalysisQueryKey = (scheduleId: string, sportType: number) =>
  ['origin', 'discover', 'analysis', scheduleId, sportType] as const;
