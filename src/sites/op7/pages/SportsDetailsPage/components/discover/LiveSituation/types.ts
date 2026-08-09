import type { TeamLite } from '@/apis/origin/discover';
import type {
  IncidentItem,
  LiveInfoItem,
  LiveSituationData,
  PlayerStat,
} from '@/apis/origin/discover';

export interface LiveSituationProps {
  scheduleId: string | null;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  /** PC 右侧栏内嵌时天气卡保持 H5 高度 */
  embeddedInSidebar?: boolean;
}

export type SituationTab = 'live' | 'events' | 'team' | 'player';

export interface SituationTabsProps {
  activeTab: SituationTab;
  onChange: (tab: SituationTab) => void;
}

export interface SituationTabPanelProps {
  activeTab: SituationTab;
  data?: LiveSituationData | null;
  liveList: LiveInfoItem[];
  incidents: IncidentItem[];
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  homePlayers: PlayerStat[];
  awayPlayers: PlayerStat[];
}
