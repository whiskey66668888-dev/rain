/**
 * 盘口背景（/v2/sport/sd/match/polymarket/background）类型与归一化
 * 对齐 App polymarket_background_entity.dart
 */

/** 单个市场的背景信息 */
export interface PolymarketMarket {
  marketType: string;
  title: string;
  url: string;
  leagueSlug: string;
  eventDate: string;
  homeTeam: string;
  awayTeam: string;
  backgroundText: string;
  backgroundTextZh: string;
  backgroundTextEn: string;
  rulesText: string;
  rulesTextZh: string;
  rulesTextEn: string;
}

/** 归一化后的盘口背景 */
export interface PolymarketBackgroundData {
  scheduleId: string;
  sportType: number;
  matched: boolean;
  markets: PolymarketMarket[];
}

type Json = Record<string, unknown>;

const asObject = (raw: unknown): Json | null =>
  raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Json) : null;

const asString = (raw: unknown): string => (typeof raw === 'string' ? raw : '');

const asNumber = (raw: unknown): number => {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

const toMarket = (raw: unknown): PolymarketMarket => {
  const json = asObject(raw) ?? {};
  return {
    marketType: asString(json.market_type),
    title: asString(json.title),
    url: asString(json.url),
    leagueSlug: asString(json.league_slug),
    eventDate: asString(json.event_date),
    homeTeam: asString(json.home_team),
    awayTeam: asString(json.away_team),
    backgroundText: asString(json.background_text),
    backgroundTextZh: asString(json.background_text_zh),
    backgroundTextEn: asString(json.background_text_en),
    rulesText: asString(json.rules_text),
    rulesTextZh: asString(json.rules_text_zh),
    rulesTextEn: asString(json.rules_text_en),
  };
};

export const normalizePolymarketBackground = (raw: unknown): PolymarketBackgroundData => {
  const json = asObject(raw) ?? {};
  return {
    scheduleId: asString(json.schedule_id),
    sportType: asNumber(json.sport_type),
    matched: json.matched === true,
    markets: Array.isArray(json.markets) ? json.markets.map(toMarket) : [],
  };
};

/** 是否有可展示的市场数据 */
export const hasPolymarketData = (data: PolymarketBackgroundData | null): boolean =>
  !!data && data.markets.length > 0;

/**
 * 单个市场拼接后的展示文本：背景（中文）+ 规则（英文），对齐 App
 * background/rules 都非空时用空行拼接
 */
export const marketDisplayContent = (market: PolymarketMarket): string => {
  const background = market.backgroundTextZh.trim();
  const rules = market.rulesTextEn.trim();
  if (background && rules) return `${background}\n\n${rules}`;
  return background || rules;
};
