import type { TeamLite } from '@/apis/origin/discover';

export interface LineUpProps {
  scheduleId: string | null;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  leagueName: string;
}

export type PlayerOption = 'rating' | 'national_logo' | 'age' | 'market_value' | 'height';
