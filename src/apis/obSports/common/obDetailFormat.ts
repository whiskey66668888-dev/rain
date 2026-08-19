/**
 * OB 详情玩法格式化（对齐 EMC App：homeSport/index/ob/detail/utils.dart）
 */
import type { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';
import { BasicMultiple, EOddsStatus } from '@/apis/commonSports/constants';

import type { HPSItem, HLRes, OLRes } from './types';
import {
  classifyMatchTime,
  getCategoryBasketballHotNames,
  getCategoryFootballHotNames,
  getObDetailLineCount,
  OB_DETAIL_CATEGORY_MAP,
  OB_POINT_HPIDS,
  type OBDetailCategoryDef,
  type OBDetailCategoryKey,
} from './constants/obDetailCategory';

/** OB 详情分类 Tab（对齐 Flutter SportDetailTypeItem） */
export interface OBDetailTypeItem {
  id: string;
  label: string;
  markets: OBDetailMarketItem[];
}

/** OB 详情单个玩法盘口（对齐 Flutter SportMarketItem） */
export interface OBDetailMarketItem {
  marketId: string;
  betTypeName: string;
  betTypeId: number;
  homeTeam: string;
  awayTeam: string;
  hpt?: number;
  lineCount: number;
  lists: TBaseBetItem[];
}

export interface OBCategoryItem {
  id?: string | number;
  marketName?: string;
  plays?: number[];
}

type OLResExt = OLRes & { ott?: string; otd?: number | string };

function asInt(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function truncateObOdds(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value * 100) / 100;
}

function getOBOddsValue(ov: number, isSupportHK: boolean): number {
  const eu = ov / BasicMultiple.ObOdds;
  return truncateObOdds(isSupportHK ? eu - 1 : eu);
}

/** 对齐 Flutter getObAllType：取「所有投注」mcid */
export function getObAllTypeMcid(list: OBCategoryItem[]): string {
  const hit = list.find((item) => item.marketName === '所有投注');
  if (hit?.id == null || hit.id === '') return '';
  return String(hit.id);
}

/**
 * 对齐 EMC formatHandicap：
 * ot=1/2/Over/Under 用 on；否则 otv；再替换主客队名
 */
function formatHandicap(hps: HPSItem, ol: OLResExt, homeName: string, awayName: string): string {
  const score = `${ol.on ?? ''}`.trim();
  const otv = `${ol.otv ?? ''}`.trim();
  const ot = `${ol.ot ?? ''}`;
  let result = '';

  switch (ot) {
    case '1':
      result = `${homeName} ${score}`;
      break;
    case '2':
      result = `${awayName} ${score}`;
      break;
    case 'Over':
      result = `大 ${score}`;
      break;
    case 'Under':
      result = `小 ${score}`;
      break;
    default:
      result = otv;
      break;
  }

  const hpn = `${hps.hpn ?? ''}`;
  if (hpn.includes('进球数') || hpn.includes('罚牌分数') || hpn.includes('准确盘数')) {
    return result.replaceAll(homeName, '').replaceAll(awayName, '').trim();
  }

  return result.replaceAll(homeName, '主').replaceAll(awayName, '客').trim();
}

function getTeamOtdMap(
  titleList: HPSItem['title'] | undefined,
  homeName: string,
  awayName: string,
): { homeOtd: number; awayOtd: number } {
  let homeOtd = 0;
  let awayOtd = 0;
  if (!Array.isArray(titleList)) return { homeOtd, awayOtd };

  for (const item of titleList) {
    const osn = `${item?.osn ?? ''}`.trim();
    const otd = asInt(item?.otd, 0);
    if (osn === homeName.trim()) homeOtd = otd;
    else if (osn === awayName.trim()) awayOtd = otd;
    if (homeOtd !== 0 && awayOtd !== 0) break;
  }
  return { homeOtd, awayOtd };
}

function createEmptyBetItem(key: string): TBaseBetItem {
  return {
    isSupportHK: false,
    canParlay: false,
    canPreBet: false,
    playName: '',
    playId: '',
    marketId: '',
    marketValue: '',
    betItemShortName: '',
    betItemFullName: '',
    betItemId: `empty_${key}`,
    baseOdds: 0,
    oddsStatus: EOddsStatus.Closed,
  };
}

function buildDetailBetItem({
  ol,
  hl,
  hps,
  matchId,
  homeName,
  awayName,
  teamOtdMap,
}: {
  ol: OLResExt;
  hl: HLRes;
  hps: HPSItem;
  matchId: string;
  homeName: string;
  awayName: string;
  teamOtdMap: { homeOtd: number; awayOtd: number };
}): TBaseBetItem {
  const supportHandicap = `${hps.hsw ?? ''}`.split(',');
  const isSupportHK = supportHandicap.includes('2');
  const oddsValue = asInt(ol.ov, 0);
  const ot = `${ol.ot ?? ''}`;
  const oid = `${ol.oid ?? ''}`;
  const placeNum = asInt(hl.hn, 0);
  const playId = `${hps.hpid ?? ''}`;
  const playName = `${hps.hpn ?? ''}`;
  let handicap = formatHandicap(hps, ol, homeName, awayName);
  const ott = `${ol.ott ?? ''}`.trim();
  const on = `${ol.on ?? ''}`.trim();
  const betName = `${ol.otv ?? ''}`.replace(/ {2}/g, ' ').trim();

  // 半场/全场 & 准确进球数
  if (playName.includes('半场/全场') && playName.includes('准确进球数')) {
    handicap = `${ott} & ${on}`;
  }

  // 对齐 EMC：hs != 0 || os != 1
  const hs = asInt(hl.hs, 0);
  const os = asInt(ol.os, 0);
  const locked = hs !== 0 || os !== 1;

  const otd = asInt(ol.otd, -1);
  const displayName = handicap || ott || betName;
  if (otd !== -1) {
    if (teamOtdMap.homeOtd === otd || teamOtdMap.awayOtd === otd) {
      // 保留 handicap；obTeam 信息落在展示文案已由 formatHandicap 处理
    }
  }

  return {
    isSupportHK,
    canParlay: asInt(hps.hids, 0) === 1,
    canPreBet: false,
    playName,
    playId,
    marketId: `${hl.hid ?? ''}`,
    marketValue: displayName || betName,
    betItemShortName: displayName || betName,
    betItemFullName: betName || displayName,
    betItemId: `${matchId}_${playId}_${placeNum}_${ot}`,
    baseOdds: getOBOddsValue(oddsValue, false),
    oddsStatus: locked ? EOddsStatus.Suspended : EOddsStatus.Open,
    ob: {
      hmt: asInt(hl.hmt, 0),
      placeNum,
      oid,
      ot,
    },
  };
}

/** 独赢 & 进球单/双：主单|主双 / 客单|客双 / 平单|平双 */
function sortWinAndOddEven(lists: TBaseBetItem[]): TBaseBetItem[] {
  const bucket = new Map<string, TBaseBetItem>();
  for (const item of lists) {
    const key = item.ob?.ot ?? '';
    if (key) bucket.set(key, item);
  }
  const lock = (k: string) => createEmptyBetItem(k);
  const result: TBaseBetItem[] = [
    bucket.get('1AndOdd') ?? lock('1AndOdd'),
    bucket.get('1AndEven') ?? lock('1AndEven'),
    bucket.get('2AndOdd') ?? lock('2AndOdd'),
    bucket.get('2AndEven') ?? lock('2AndEven'),
  ];
  const hasDrawOdd = bucket.has('XAndOdd');
  const hasDrawEven = bucket.has('XAndEven');
  if (hasDrawOdd || hasDrawEven) {
    if (hasDrawOdd && hasDrawEven) {
      result.push(bucket.get('XAndOdd')!, bucket.get('XAndEven')!);
    } else if (hasDrawEven) {
      result.push(bucket.get('XAndEven')!, lock('XAndOdd'));
    } else {
      result.push(bucket.get('XAndOdd')!, lock('XAndEven'));
    }
  }
  return result;
}

/** 对齐 EMC sortSelectionList */
function sortSelectionList(lists: TBaseBetItem[], hpid: number, hpn: string): TBaseBetItem[] {
  if (
    hpid === 384 ||
    hpn.includes('独赢 & 进球单/双') ||
    hpn.includes('独赢&进球单双') ||
    hpn.includes('独赢 & 进球单双') ||
    hpn.includes('独赢&进球单/双')
  ) {
    return sortWinAndOddEven(lists);
  }

  if (!OB_POINT_HPIDS.has(hpid)) return lists;

  const home: TBaseBetItem[] = [];
  const draw: TBaseBetItem[] = [];
  const away: TBaseBetItem[] = [];

  for (const item of lists) {
    const parts = (item.betItemShortName || item.marketValue || '').split('-');
    const homePoint = Number.parseInt(parts[0] ?? '', 10);
    const awayPoint = Number.parseInt(parts[1] ?? '', 10);
    const hp = Number.isFinite(homePoint) ? homePoint : 0;
    const ap = Number.isFinite(awayPoint) ? awayPoint : 0;
    if (hp > ap) home.push(item);
    else if (hp < ap) away.push(item);
    else draw.push(item);
  }

  const maxLen = Math.max(home.length, draw.length, away.length);
  while (home.length < maxLen) home.push(createEmptyBetItem(`h_${home.length}`));
  while (draw.length < maxLen) draw.push(createEmptyBetItem(`d_${draw.length}`));
  while (away.length < maxLen) away.push(createEmptyBetItem(`a_${away.length}`));

  const result: TBaseBetItem[] = [];
  for (let i = 0; i < maxLen; i += 1) {
    result.push(home[i]!, draw[i]!, away[i]!);
  }
  return result;
}

/** 对齐 EMC _getDetailList */
function buildDetailMarkets(
  detailList: HPSItem[],
  competition: Pick<MatchBaseInfo, 'matchId' | 'homeName' | 'awayName'>,
): OBDetailMarketItem[] {
  const homeName = competition.homeName ?? '';
  const awayName = competition.awayName ?? '';
  const matchId = String(competition.matchId ?? '');
  const markets: OBDetailMarketItem[] = [];

  for (const item of detailList) {
    const teamOtdMap = getTeamOtdMap(item.title, homeName, awayName);
    const lists: TBaseBetItem[] = [];
    const hlList = Array.isArray(item.hl) ? item.hl : [];

    for (const hl of hlList) {
      const olList = Array.isArray(hl.ol) ? hl.ol : [];
      for (const ol of olList) {
        lists.push(
          buildDetailBetItem({
            ol: ol,
            hl,
            hps: item,
            matchId,
            homeName,
            awayName,
            teamOtdMap,
          }),
        );
      }
    }

    const betTypeId = asInt(item.hpid, 0);
    const rawName = `${item.hpn ?? ''}`;
    const betTypeName = rawName.replaceAll('波胆', '比分');
    const sorted = sortSelectionList(lists, betTypeId, rawName);
    // topKey 对齐 EMC：`${matchId}_${topKey}`；无 topKey 时回退 hpid
    const topKey = `${(item as HPSItem & { topKey?: string }).topKey ?? item.hpid ?? markets.length}`;

    markets.push({
      marketId: `${matchId}_${topKey}`,
      betTypeName,
      betTypeId,
      homeTeam: homeName,
      awayTeam: awayName,
      hpt: asInt(item.hpt, 0) || undefined,
      lineCount: getObDetailLineCount(betTypeId, rawName, sorted.length),
      lists: sorted,
    });
  }

  return markets;
}

type CategoryBucket = OBDetailCategoryDef & { market: OBDetailMarketItem[] };

function createCategoryBuckets(): Record<OBDetailCategoryKey, CategoryBucket> {
  const entries = Object.entries(OB_DETAIL_CATEGORY_MAP) as [
    OBDetailCategoryKey,
    (typeof OB_DETAIL_CATEGORY_MAP)[OBDetailCategoryKey],
  ][];
  return Object.fromEntries(
    entries.map(([key, def]) => [key, { ...def, market: [] as OBDetailMarketItem[] }]),
  ) as Record<OBDetailCategoryKey, CategoryBucket>;
}

function resolveHotNameList(sportId: string, matchTime?: number | string | null): string[][] {
  if (sportId === '2') return getCategoryBasketballHotNames();
  if (sportId === '1') {
    return getCategoryFootballHotNames(classifyMatchTime(matchTime));
  }
  return getCategoryFootballHotNames(null);
}

/** 篮球热门：赛前只留第1节；滚球按已出现的最小节过滤 */
function filterBasketballHot(items: OBDetailMarketItem[], isStart: boolean): OBDetailMarketItem[] {
  const t1 = '第1节';
  const t2 = '第2节';
  const t3 = '第3节';
  const t4 = '第4节';

  if (!isStart) {
    return items.filter((item) => {
      const id = item.betTypeName ?? '';
      return !(id.includes(t2) || id.includes(t3) || id.includes(t4));
    });
  }

  let end1 = false;
  let end2 = false;
  let end3 = false;
  for (const item of items) {
    const id = item.betTypeName ?? '';
    if (id.includes(t1)) end1 = true;
    if (id.includes(t2)) end2 = true;
    if (id.includes(t3)) end3 = true;
  }

  return items.filter((item) => {
    const id = item.betTypeName ?? '';
    if (end1 && (id.includes(t2) || id.includes(t3) || id.includes(t4))) return false;
    if (end2 && (id.includes(t3) || id.includes(t4))) return false;
    if (end3 && id.includes(t4)) return false;
    return true;
  });
}

/**
 * 对齐 EMC formatObDetailList：
 * categoryList + getMatchOddsInfoPB hps → 详情 Tab（仅保留有盘口的分类）
 */
export function formatObDetailList({
  categoryList,
  detailList,
  competition,
  sportId,
  matchTime,
}: {
  categoryList: OBCategoryItem[];
  detailList: HPSItem[];
  competition: Pick<MatchBaseInfo, 'matchId' | 'homeName' | 'awayName'>;
  sportId?: string | number;
  matchTime?: number | string | null;
}): OBDetailTypeItem[] {
  if (!detailList.length) return [];

  const markets = buildDetailMarkets(detailList, competition);
  const buckets = createCategoryBuckets();
  const sid = String(sportId ?? '1');
  const hotNameList = resolveHotNameList(sid, matchTime);
  const orderMap = new Map<string, number>();
  hotNameList.forEach((names, index) => {
    names.forEach((name) => orderMap.set(name, index));
  });

  for (const item of markets) {
    const matchedCats = categoryList.filter(
      (cat) =>
        String(cat.id) !== '0' &&
        Array.isArray(cat.plays) &&
        cat.plays.some((playId) => Number(playId) === item.betTypeId),
    );

    // 对齐 EMC：一个玩法可落入多个分类 Tab（只 break 内层桶循环，不中断 matchedCats）
    if (matchedCats.length) {
      for (const temp of matchedCats) {
        for (const bucket of Object.values(buckets)) {
          if (bucket.name === '热门') continue;
          if (bucket.type.includes(String(temp.id))) {
            bucket.market.push(item);
            break;
          }
        }
      }
    }

    // 热门：按玩法名精确匹配 EMC 热门名表（不是简单正则）
    if (hotNameList.some((names) => names.includes(item.betTypeName))) {
      buckets.featured.market.push(item);
    }

    buckets.all.market.push(item);
  }

  // 热门排序 + 篮球过滤
  let hotMarket = buckets.featured.market;
  hotMarket = [...hotMarket].sort((a, b) => {
    const orderA = orderMap.get(a.betTypeName) ?? 9999;
    const orderB = orderMap.get(b.betTypeName) ?? 9999;
    return orderA - orderB;
  });
  if (sid === '2') {
    const isStart = Number(matchTime) > 0;
    hotMarket = filterBasketballHot(hotMarket, isStart);
  }
  buckets.featured.market = hotMarket;

  return Object.values(buckets)
    .filter((bucket) => bucket.market.length > 0)
    .map((bucket) => ({
      id: bucket.id,
      label: `${bucket.name}`.replaceAll('波胆', '比分'),
      markets: bucket.market,
    }));
}
