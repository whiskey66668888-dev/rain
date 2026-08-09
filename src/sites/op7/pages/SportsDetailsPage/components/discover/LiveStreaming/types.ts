import type { TeamLite } from '@/apis/origin/discover';

export type MainTab = 'live' | 'stats';
export type StatsTab = 'player' | 'team' | 'max';

export interface LiveStreamingProps {
  scheduleId: string | null;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

export interface TeamDisplayInfo {
  name: string;
  logo: string;
}
