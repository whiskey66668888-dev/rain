/** 对齐 App IndexEntryOddsItem / OddsInfo */

export interface MarketOddsInfo {
  recordTime: string;
  odds1: number;
  odds2: number;
  odds3: number;
  oddsChange1: number;
  oddsChange2: number;
  oddsChange3: number;
}

export interface MarketOddsEntryItem {
  platform: string;
  matchId: string;
  matchTime: string;
  marketType: string;
  marketStatus: number;
  score: string;
  initialOdds?: MarketOddsInfo | null;
  preMatchOdds?: MarketOddsInfo | null;
  inPlayOdds?: MarketOddsInfo | null;
}

export interface MarketOddsHistoryItem {
  recordTime: string;
  platform: string;
  matchId: string;
  marketStatus: number;
  score: string;
  odds1: number;
  odds2: number;
  odds3: number;
  oddsChange1: number;
  oddsChange2: number;
  oddsChange3: number;
}

export interface MarketOddsHistoryPage {
  content: MarketOddsHistoryItem[];
  totalElements: number;
  last: boolean;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  numberOfElements: number;
}

export type MarketOddsMatchScope = 'full' | 'half';

export interface MarketOddsListParams {
  matchId: string;
  platform: string;
  matchDataScope: MarketOddsMatchScope;
  playType: number;
}

export interface MarketOddsHistoryParams extends MarketOddsListParams {
  page: number;
}

const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toStr = (v: unknown, fallback = ''): string => {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return `${v}`;
  return fallback;
};

export const normalizeOddsInfo = (raw: unknown): MarketOddsInfo | null => {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  return {
    recordTime: toStr(item.recordTime),
    odds1: toNum(item.odds1),
    odds2: toNum(item.odds2),
    odds3: toNum(item.odds3),
    oddsChange1: toNum(item.oddsChange1),
    oddsChange2: toNum(item.oddsChange2),
    oddsChange3: toNum(item.oddsChange3),
  };
};

export const normalizeMarketOddsEntryItem = (raw: unknown): MarketOddsEntryItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  return {
    platform: toStr(item.platform),
    matchId: toStr(item.matchId),
    matchTime: toStr(item.matchTime),
    marketType: toStr(item.marketType),
    marketStatus: toNum(item.marketStatus),
    score: toStr(item.score),
    initialOdds: normalizeOddsInfo(item.initialOdds),
    preMatchOdds: normalizeOddsInfo(item.preMatchOdds),
    inPlayOdds: normalizeOddsInfo(item.inPlayOdds),
  };
};

export const normalizeMarketOddsList = (raw: unknown): MarketOddsEntryItem[] => {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)
      ? ((raw as { data: unknown[] }).data ?? [])
      : [];
  return list
    .map(normalizeMarketOddsEntryItem)
    .filter((item): item is MarketOddsEntryItem => !!item);
};

export const normalizeMarketOddsHistoryItem = (raw: unknown): MarketOddsHistoryItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  return {
    recordTime: toStr(item.recordTime),
    platform: toStr(item.platform),
    matchId: toStr(item.matchId),
    marketStatus: toNum(item.marketStatus),
    score: toStr(item.score),
    odds1: toNum(item.odds1),
    odds2: toNum(item.odds2),
    odds3: toNum(item.odds3),
    oddsChange1: toNum(item.oddsChange1),
    oddsChange2: toNum(item.oddsChange2),
    oddsChange3: toNum(item.oddsChange3),
  };
};

export const normalizeMarketOddsHistoryPage = (raw: unknown): MarketOddsHistoryPage => {
  const page =
    raw && typeof raw === 'object'
      ? (raw as { data?: unknown }).data && typeof (raw as { data: unknown }).data === 'object'
        ? ((raw as { data: Record<string, unknown> }).data ?? (raw as Record<string, unknown>))
        : (raw as Record<string, unknown>)
      : {};
  const contentRaw = Array.isArray(page.content) ? page.content : [];
  return {
    content: contentRaw
      .map(normalizeMarketOddsHistoryItem)
      .filter((item): item is MarketOddsHistoryItem => !!item),
    totalElements: toNum(page.totalElements),
    last: !!page.last,
    totalPages: toNum(page.totalPages),
    number: toNum(page.number),
    size: toNum(page.size),
    first: !!page.first,
    numberOfElements: toNum(page.numberOfElements),
  };
};
