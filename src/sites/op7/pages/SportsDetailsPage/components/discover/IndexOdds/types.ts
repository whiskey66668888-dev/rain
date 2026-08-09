export interface IndexOddsProps {
  /** 纳米 schedule_id，用于赛事状态等发现接口 */
  scheduleId: string | null;
  /** 场馆赛事 ID（对齐 App competition.matchId），用于 marketOdds */
  matchId?: string | null;
  sportId?: number;
}

export type OddsTabKey = 'standard' | 'let' | 'total' | 'corner';

export type OddsTab = {
  label: string;
  playType: number;
  key: OddsTabKey;
};

/** 入口页行类型：对齐 App IndexEntryOddRowType */
export type EntryOddRowType = 'initial' | 'preMatch' | 'live';

export type OddCellData = {
  text: string;
  change: number;
  locked: boolean;
};

export type EntryCompanyRow = {
  companyId: string;
  name: string;
  image: string;
  apiPlatform: string;
  matchId: string;
  cellsByType: Record<EntryOddRowType, OddCellData[]>;
};
