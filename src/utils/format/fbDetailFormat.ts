import type { MarketGroup, MarketItem, OddsOption } from '@/apis/fbSports/common/types';
import { fbWinArray, fbHandBigArray, fbPointArray } from '@/utils/constants/bettingCategories';
import { EFbSelectionType } from '@/apis/fbSports/common/constants/selectionType';
import { EFbMarketCurtSaleStatusEnum } from '@/apis/fbSports/common/constants/enum';
import { normalizeFbMarketDisplayName } from '@/apis/fbSports/common/fbFormat';

/**
 * 足球15分钟阶段枚举
 */
export enum Football15MatchPeriod {
  s0 = 's0', // 比赛开始-14:59
  first1 = 'first1', // 15:00-29:59
  first2 = 'first2', // 30:00-中场休息
  first3 = 'first3', // 下半场开始-59:59
  last1 = 'last1', // 60:00-74:59
  last2 = 'last2', // 75:00-90分钟全场结束
}

/**
 * 投注选项接口
 */
export interface SelectionItem {
  type: string; // 选项类型
  marketId: string; // 盘口ID
  oddsId: string; // 动画使用唯一id
  isSupportHK: boolean; // 是否支持香港盘
  odds: number; // 欧盘赔率
  oddsHK: number; // 香港盘赔率
  isSupportStray: boolean; // 是否支持串关
  name: string; // 全称
  handicap: string; // 简称
  betName: string; // 投注名称
  isLock: boolean; // 是否锁定 (1-开盘 2-封盘 3-投注项关盘)
}

/**
 * 盘口数据接口
 */
export interface MarketData {
  marketId: string;
  betTypeName: string;
  betTypeId: number;
  selections: SelectionItem[];
  isLocked: boolean;
  homeTeam: string;
  awayTeam: string;
  hpt: number;
  types: string[];
  category: string; // fb 用于分类
  lineCount: number;
}

/**
 * 分类映射接口
 */
export interface CategoryMap {
  [key: string]: {
    name: string;
    type: string;
    market: MarketData[];
  };
}

/**
 * 足球热门ID列表1（固定）
 */
const footballFeaturedIdsList1: string[] = [
  '1005_1001', // 1.独赢（胜平负）
  '1012_1001', // 2.足球双重机会
  '1002_1001', // 3.让球胜平负
  '1027_1001', // 4.双方均有进球
  '1089_1001', // 5.第x粒进球
  '1007_1001', // 6.大小-附加盘
  '1007_1002', // 7.大小-上半场-附加盘
];

/**
 * 足球热门ID列表2（15分钟阶段）
 */
const footballFeaturedIdsList2: string[] = [
  '1007_1007', // 大小-比赛开始-14：59
  '1007_1008', // 大小-15:00-29：59
  '1007_1009', // 大小-30:00-中场休息
  '1007_1010', // 大小-下半场开始-59：59
  '1007_1011', // 大小-60:00-74：59
  '1007_1012', // 大小-75:00-90分钟全场结束
];

/**
 * 足球热门ID列表3（固定）
 */
const footballFeaturedIdsList3: string[] = [
  '1000_1001', // 9.让球-附加盘
  '1000_1002', // 10.让球-上半场-附加盘
  '1010_1001', // 11.角球：大小-附加盘
  '1010_1002', // 12.角球：大小-上半场-附加盘
];

/**
 * 篮球热门ID列表
 */
const basketballFeaturedIdsList1: string[] = [
  '3004_3001', // 独赢
  '3002_3001', // 让分-附加盘
  '3002_3003', // 让分-上半场-附加盘
  '3003_3001', // 总分大小-附加盘
  '3003_3003', // 总分大小-上半场-附加盘
  '3020_3005', // 独赢（两项）-第一节
  '3020_3006', // 独赢（两项）-第二节
  '3020_3007', // 独赢（两项）-第三节
  '3020_3008', // 独赢（两项）-第四节
  '3002_3005', // 让分-第一节
  '3002_3006', // 让分-第二节
  '3002_3007', // 让分-第三节
  '3002_3008', // 让分-第四节
  '3003_3005', // 总分大小-第一节
  '3003_3006', // 总分大小-第二节
  '3003_3007', // 总分大小-第三节
  '3003_3008', // 总分大小-第四节
];

/**
 * 足球进球类别ID
 */
const categoryGoalIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 足球波胆类别ID
 */
const categoryCSIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 足球角球类别ID
 */
const categoryCornerIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 足球罚牌类别ID
 */
const categoryPenaltyCardIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 足球时间类别ID
 */
const categoryTimesIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 特殊投注类别ID
 */
const categorySpecialIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 篮球全场类别ID
 */
const categoryFullIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 篮球半场类别ID
 */
const categoryHalfIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 篮球无让分类别ID
 */
const categoryNoodfIds: string[] = [
  // TODO: 根据实际需求添加
];

/**
 * 分类映射
 */
const categoryMap: CategoryMap = {
  all: { name: '全部', type: '-1', market: [] },
  featured: { name: '热门', type: 'p', market: [] },
  goal: { name: '进球', type: 's', market: [] },
  cs: { name: '波胆', type: 'cs', market: [] },
  corner: { name: '角球', type: 'c', market: [] },
  penaltyCard: { name: '罚牌', type: 'b', market: [] },
  time: { name: '时间', type: 't', market: [] },
  special: { name: '特殊投注', type: 'i', market: [] },
  full: { name: '全场', type: 'f', market: [] },
  half: { name: '半场', type: 'h', market: [] },
  nood: { name: '无让分', type: 'n', market: [] },
};

/**
 * 根据玩法处理显示名称
 */
export function formatHandicap(op: OddsOption, mty: number): string {
  let result = '';
  const nm = String(op.nm || '');
  const name = nm.trim();

  // 如果是独赢 直接显示nm
  if (fbWinArray.includes(mty)) {
    return name;
  }

  switch (op.ty) {
    case EFbSelectionType.home:
      result = name === '主' ? name : `主 ${name}`;
      break;
    case EFbSelectionType.away:
      result = name === '客' ? name : `客 ${name}`;
      break;
    case EFbSelectionType.draw:
      // 如果是让球 增加 和
      if (fbHandBigArray.includes(mty)) {
        const na = String(op.na || '');
        result = `${na} ${name}`;
      } else {
        result = name;
      }
      break;
    default:
      result = name;
      break;
  }

  return result;
}

/**
 * 三列布局的盘口类型数组
 */
const fbTreeArray: number[] = [
  // TODO: 根据实际需求添加需要三列布局的盘口类型
];

/**
 * 两列布局的盘口类型数组
 */
const fbTwoArray: number[] = [
  // TODO: 根据实际需求添加需要两列布局的盘口类型
];

/**
 * 处理显示栏位
 */
export function getLineCount(market: MarketGroup): number {
  const markets: MarketItem[] = market.mks || [];
  if (markets.length === 0) return 1;

  const mty: number = market.mty;
  if (fbTreeArray.includes(mty)) {
    return 3;
  }

  const name: string = normalizeFbMarketDisplayName(market.nm, market.mty);
  if (name.includes('比分')) {
    return 3;
  }

  if (fbTwoArray.includes(mty)) {
    return 2;
  }

  return 1;
}

/**
 * 获取盘口的投注数据
 */
function getSelectionList(markets: MarketItem[], mty: number): SelectionItem[] {
  const result: SelectionItem[] = [];

  for (const market of markets) {
    const options: OddsOption[] = market.op || [];
    if (options.length === 0) {
      continue;
    }

    options.forEach((res: OddsOption) => {
      const ty = res.ty;
      const odds = res.od;
      const marketId = `${market.id}`;

      const selection: SelectionItem = {
        type: `${ty}`,
        marketId,
        oddsId: `${marketId}_${ty}`, // 动画使用唯一id
        isSupportHK: true, // 是否支持香港盘
        odds: odds, // 欧盘赔率
        oddsHK: odds, // 香港盘赔率（简化处理，实际需要转换）
        isSupportStray: market.au === 1, // 是否支持串关，0 不可串关，1 可串关
        name: res.na || '', // 全称
        handicap: formatHandicap(res, mty), // 简称
        betName: `${res.na || ''} ${res.nm || ''}`,
        // 1-开盘 2-封盘 3-投注项关盘
        isLock: market.ss !== EFbMarketCurtSaleStatusEnum.Active,
      };
      result.push(selection);
    });
  }

  return sortSelectionList(result, mty);
}

/**
 * 获取盘口数据
 */
function getMarketList(
  detailData: { ts?: Array<{ na: string }>; id: number },
  detailList: MarketGroup[],
): MarketData[] {
  const marketList: MarketData[] = [];
  const teamMsgList = Array.isArray(detailData.ts) ? detailData.ts : [];
  const homeName = teamMsgList[0]?.na || '主队';
  const awayName = teamMsgList[1]?.na || '客队';

  try {
    detailList.forEach((item: MarketGroup, index: number) => {
      const markets: MarketItem[] = item.mks || [];
      const mty: number = item.mty;
      const pe: number = item.pe;
      const nm: string = item.nm;
      const tps: string[] = item.tps || [];
      const selectionList = getSelectionList(markets, mty);
      const mItem: MarketData = {
        marketId: `${detailData.id}${index}`,
        betTypeName: normalizeFbMarketDisplayName(nm, mty),
        betTypeId: mty,
        selections: selectionList,
        isLocked: markets[0]?.ss !== EFbMarketCurtSaleStatusEnum.Active,
        homeTeam: homeName,
        awayTeam: awayName,
        hpt: mty,
        types: tps,
        category: `${mty}_${pe}`, // fb 用于分类
        lineCount: getLineCount(item),
      };
      marketList.push(mItem);
    });
    return marketList;
  } catch (_e) {
    return [];
  }
}

/**
 * 分类比赛时间（足球15分钟阶段）
 */
export function classifyMatchTime(matchTime: string): Football15MatchPeriod | null {
  const time = parseInt(matchTime, 10);
  if (isNaN(time)) return null;

  // 比赛开始-14:59
  if (time >= 0 && time < 900) {
    return Football15MatchPeriod.s0;
  }
  // 15:00-29:59
  if (time >= 900 && time < 1800) {
    return Football15MatchPeriod.first1;
  }
  // 30:00-中场休息
  if (time >= 1800 && time < 2700) {
    return Football15MatchPeriod.first2;
  }
  // 下半场开始-59:59
  if (time >= 2700 && time < 3600) {
    return Football15MatchPeriod.first3;
  }
  // 60:00-74:59
  if (time >= 3600 && time < 4500) {
    return Football15MatchPeriod.last1;
  }
  // 75:00-90分钟全场结束
  if (time >= 4500) {
    return Football15MatchPeriod.last2;
  }

  return null;
}

/**
 * 判断篮球是否开始
 */
export function basketballIsStart(matchTime: string): boolean {
  const time = parseInt(matchTime, 10);
  return !isNaN(time) && time > 0;
}

/**
 * 获取足球热门类别ID
 */
function getFootCategoryFeaturedIds(period: Football15MatchPeriod | null): string[] {
  const result: string[] = [...footballFeaturedIdsList1];

  if (period === null) {
    result.push(...footballFeaturedIdsList2);
    result.push(...footballFeaturedIdsList3);
    return result;
  }

  // 使用映射表简化期对应的 ID
  const periodMapping: Record<Football15MatchPeriod, string> = {
    [Football15MatchPeriod.s0]: '1007_1007', // 大小-比赛开始-14：59
    [Football15MatchPeriod.first1]: '1007_1008', // 大小-15:00-29：59
    [Football15MatchPeriod.first2]: '1007_1009', // 大小-30:00-中场休息
    [Football15MatchPeriod.first3]: '1007_1010', // 大小-下半场开始-59：59
    [Football15MatchPeriod.last1]: '1007_1011', // 大小-60:00-74：59
    [Football15MatchPeriod.last2]: '1007_1012', // 大小-75:00-90分钟全场结束
  };

  if (periodMapping[period]) {
    result.push(periodMapping[period]);
  }

  result.push(...footballFeaturedIdsList3);

  return result;
}

/**
 * 处理足球类别
 */
function setFootBallCategory(item: MarketData, categoryFeaturedIds: string[]): void {
  // 热门增多之后 和其他的类别有重叠
  if (categoryFeaturedIds.includes(item.category)) {
    categoryMap?.featured?.market.push(item);
  }

  // 所有类别=非热门的类别之和
  if (categoryGoalIds.includes(item.category)) {
    categoryMap?.goal?.market.push(item);
  } else if (categoryCSIds.includes(item.category)) {
    categoryMap?.cs?.market.push(item);
  } else if (categoryCornerIds.includes(item.category)) {
    categoryMap?.corner?.market.push(item);
  } else if (categoryPenaltyCardIds.includes(item.category)) {
    categoryMap?.penaltyCard?.market.push(item);
  } else if (categoryTimesIds.includes(item.category)) {
    categoryMap?.time?.market.push(item);
  } else if (categorySpecialIds.includes(item.category)) {
    categoryMap?.special?.market.push(item);
  } else if (item.types.includes('i')) {
    categoryMap?.special?.market.push(item);
  } else if (item.betTypeName.includes('比分')) {
    // 正确比分  进行排序，不够上锁补齐
    const bifens = item.selections.filter((e: SelectionItem) => e.handicap != null);
    const zhu: SelectionItem[] = [];
    const ping: SelectionItem[] = [];
    const ke: SelectionItem[] = [];

    for (const map of bifens) {
      const str = map.handicap.replace(/非 /g, ''); // "handicap" -> "1-0"
      const arr: string[] = str.split('-');

      if (arr.length >= 2) {
        const firstNum = Number.parseInt(arr[0] ?? '0', 10) || 0;
        const lastNum = Number.parseInt(arr[1] ?? '0', 10) || 0;

        if (firstNum - lastNum > 0) {
          zhu.push(map);
        } else if (firstNum - lastNum < 0) {
          ke.push(map);
        } else {
          ping.push(map);
        }
      }
    }

    // 排序
    zhu.sort((a, b) => {
      const astrs: string[] = a.handicap.split('-');
      const bstrs: string[] = b.handicap.split('-');
      const afirst = Number.parseInt(astrs[0] ?? '0', 10) || 0;
      const bfirst = Number.parseInt(bstrs[0] ?? '0', 10) || 0;
      if (a.handicap !== b.handicap) {
        return a.handicap.localeCompare(b.handicap);
      } else {
        return afirst - bfirst;
      }
    });

    ping.sort((a, b) => a.handicap.localeCompare(b.handicap));

    ke.sort((a, b) => {
      const astrs: string[] = a.handicap.split('-');
      const bstrs: string[] = b.handicap.split('-');
      const afirst = Number.parseInt(astrs[0] ?? '0', 10) || 0;
      const alast = Number.parseInt(astrs[1] ?? '0', 10) || 0;
      const bfirst = Number.parseInt(bstrs[0] ?? '0', 10) || 0;
      const blast = Number.parseInt(bstrs[1] ?? '0', 10) || 0;
      if (alast - blast !== 0) {
        return alast - blast;
      } else {
        return afirst - bfirst;
      }
    });

    const maxCount = Math.max(zhu.length, ping.length, ke.length);
    let lastMap: SelectionItem | undefined;
    if (maxCount === zhu.length && zhu.length > 0) {
      lastMap = zhu[zhu.length - 1];
    } else if (maxCount === ping.length && ping.length > 0) {
      lastMap = ping[ping.length - 1];
    } else if (ke.length > 0) {
      lastMap = ke[ke.length - 1];
    }

    // 长度不够就补齐
    if (lastMap) {
      for (let index = zhu.length; index < maxCount; index++) {
        const addMap: SelectionItem = { ...lastMap };
        addMap.handicap = '';
        addMap.isLock = true;
        zhu.push(addMap);
      }

      for (let index = ping.length; index < maxCount; index++) {
        const addMap: SelectionItem = { ...lastMap };
        addMap.handicap = '';
        addMap.isLock = true;
        ping.push(addMap);
      }

      for (let index = ke.length; index < maxCount; index++) {
        const addMap: SelectionItem = { ...lastMap };
        addMap.handicap = '';
        addMap.isLock = true;
        ke.push(addMap);
      }
    }

    const newbifens: SelectionItem[] = [];
    for (let index = 0; index < zhu.length; index++) {
      newbifens.push(zhu[index]!);
      newbifens.push(ping[index]!);
      newbifens.push(ke[index]!);
    }

    item.selections = newbifens;
    categoryMap.cs!.market.push(item);
  }

  categoryMap.all!.market.push(item);
}

/**
 * 处理篮球类别
 */
function setBasketballCategory(item: MarketData, basketBallFeaturedIds: string[]): void {
  // 热门和其他类别是并存的
  if (basketBallFeaturedIds.includes(item.category)) {
    categoryMap.featured!.market.push(item);
  }

  // 其他类别都是单独存在的，只会属于一种类别
  if (categoryFullIds.includes(item.category)) {
    categoryMap.full!.market.push(item);
  } else if (categoryHalfIds.includes(item.category)) {
    categoryMap.half!.market.push(item);
  } else if (categoryNoodfIds.includes(item.category)) {
    categoryMap.nood!.market.push(item);
  } else if (categorySpecialIds.includes(item.category)) {
    categoryMap.special!.market.push(item);
  } else if (item.types.includes('i')) {
    categoryMap.special!.market.push(item);
  }

  categoryMap.all!.market.push(item);
}

/**
 * 篮球过滤方法
 * 篮球的第x节，赛前：只放第1节
 * 滚球中：获取数字最小的节
 */
function featuredBasketballFilterFromMap(
  categoryMapData: CategoryMap,
  isStart: boolean,
): CategoryMap {
  const featured = categoryMapData.featured;
  if (!featured || !Array.isArray(featured.market)) {
    return categoryMapData;
  }

  const items = featured.market;
  const resultItems: MarketData[] = [];

  const time1 = '_3005';
  const time2 = '_3006';
  const time3 = '_3007';
  const time4 = '_3008';

  if (!isStart) {
    // 如果未开始，仅保留第一节的数据
    for (const item of items) {
      const id = item.category || '';
      const end = id.includes(time2) || id.includes(time3) || id.includes(time4);
      if (!end) {
        resultItems.push(item);
      }
    }
  } else {
    // 已经开始时判断
    let end1 = false;
    let end2 = false;
    let end3 = false;

    for (const item of items) {
      const id = item.category || '';
      if (id.includes(time1)) end1 = true; // 第一节
      if (id.includes(time2)) end2 = true; // 第二节
      if (id.includes(time3)) end3 = true; // 第三节
    }

    // 根据已经出现的节数筛选项目
    // 过滤一些不要的节
    for (const item of items) {
      const id = item.category || '';
      if (end1) {
        if (id.includes(time2) || id.includes(time3) || id.includes(time4)) {
          continue;
        }
      }
      if (end2) {
        if (id.includes(time3) || id.includes(time4)) {
          continue;
        }
      }
      if (end3) {
        if (id.includes(time4)) {
          continue;
        }
      }
      resultItems.push(item);
    }
  }
  featured.market = resultItems;
  return categoryMapData;
}

/**
 * 处理其他类别
 */
function setOtherCategory(item: MarketData): void {
  for (const category of Object.values(categoryMap)) {
    if (item.types.includes(category.type)) {
      category.market.push(item);
    }
  }
  categoryMap.all!.market.push(item);
}

/**
 * 热门重新排序
 */
function featuredSortFromMap(categoryMapData: CategoryMap, categoryIds: string[]): CategoryMap {
  // 检查 categoryMap 和其中的 featured 是否存在
  if (!categoryMapData.featured || !Array.isArray(categoryMapData.featured.market)) {
    return categoryMapData;
  }

  const list = categoryMapData.featured.market;

  // 如果 market 列表为空，直接返回 categoryMap
  if (list.length === 0) {
    return categoryMapData;
  }

  // 构建 orderMap
  const orderMap: Record<string, number> = {};
  categoryIds.forEach((id, i) => {
    orderMap[id] = i;
  });

  // 添加异常处理以防止排序时出现的潜在错误
  try {
    list.sort((a, b) => {
      const categoryA = a.category;
      const categoryB = b.category;

      // 检查是否存在于 orderMap 中
      if (orderMap[categoryA] === undefined || orderMap[categoryB] === undefined) {
        // 如果不在 orderMap 中，可以选择如何处理：例如返回 0（保持原顺序）。
        return 0;
      }
      // 确保 orderMap 中的值非 null
      return orderMap[categoryA] - orderMap[categoryB];
    });
  } catch (_e) {
    return categoryMapData;
  }

  // 更新并返回 categoryMap
  categoryMapData.featured.market = list;
  return categoryMapData;
}

/**
 * 具体的投注类型放入hand的market里面
 */
function getAllList(
  list: MarketData[], // 投注列表数据
  sportId: number, // 体育类型 1 足球 3 篮球
  matchTime: string, // 比赛时间，足球热门的15分钟阶段，篮球节 用到
): CategoryMap {
  // 先重置
  Object.keys(categoryMap).forEach((key) => {
    categoryMap[key]!.market = [];
  });

  try {
    // 足球
    if (sportId === 1) {
      const period = classifyMatchTime(matchTime);
      const ids = getFootCategoryFeaturedIds(period);

      for (const item of list) {
        setFootBallCategory(item, ids);
      }
      return featuredSortFromMap(categoryMap, ids);
    } else if (sportId === 3) {
      // 篮球
      const ids = basketballFeaturedIdsList1;
      for (const item of list) {
        setBasketballCategory(item, ids);
      }
      const sortedMap = featuredSortFromMap(categoryMap, ids);
      // 篮球的第x节，赛前：只放第1节
      // 滚球中：获取数字最小的节
      const isStart = basketballIsStart(matchTime);
      return featuredBasketballFilterFromMap(sortedMap, isStart);
    } else {
      for (const item of list) {
        setOtherCategory(item);
      }
    }
  } catch (_e) {
    // 数据异常处理
  }
  return categoryMap;
}

/**
 * 处理波胆的数据
 */
export function sortSelectionList(selectionList: SelectionItem[], mty: number): SelectionItem[] {
  try {
    // 如果不是波胆 直接返回
    if (!fbPointArray.includes(mty)) {
      return selectionList;
    }

    // 解析数据
    const homeArray: SelectionItem[] = [];
    const drawArray: SelectionItem[] = [];
    const awayArray: SelectionItem[] = [];

    for (const selection of selectionList) {
      const pointArray: string[] = selection.handicap.split('-');
      const homePoint =
        pointArray.length > 0 && !isNaN(Number.parseInt(pointArray[0] ?? '', 10))
          ? Number.parseInt(pointArray[0] ?? '0', 10)
          : 0;
      const awayPoint =
        pointArray.length > 1 && !isNaN(Number.parseInt(pointArray[1] ?? '', 10))
          ? Number.parseInt(pointArray[1] ?? '0', 10)
          : 0;

      if (homePoint > awayPoint) {
        homeArray.push(selection);
      } else if (homePoint < awayPoint) {
        awayArray.push(selection);
      } else if (homePoint === awayPoint) {
        drawArray.push(selection);
      }
    }

    // homeArray 去掉空值，做从小到大排序
    // 排序规则：先按主队得分排序，主队得分相同时按客队得分排序
    const validHomeArray = homeArray.filter((item) => item.handicap && item.handicap.trim() !== '');
    validHomeArray.sort((a, b) => {
      const aHandicap = a.handicap || '';
      const bHandicap = b.handicap || '';
      const aStrs: string[] = aHandicap.split('-');
      const bStrs: string[] = bHandicap.split('-');
      const aHome = Number.parseInt(aStrs[0] ?? '0', 10) || 0;
      const aAway = Number.parseInt(aStrs[1] ?? '0', 10) || 0;
      const bHome = Number.parseInt(bStrs[0] ?? '0', 10) || 0;
      const bAway = Number.parseInt(bStrs[1] ?? '0', 10) || 0;

      // 先按主队得分排序
      if (aHome !== bHome) {
        return aHome - bHome;
      }
      // 主队得分相同时，按客队得分排序
      return aAway - bAway;
    });

    // 主/客队/和局不足，则添加空的投注选项
    const homeLen = validHomeArray.length;
    const drawLen = drawArray.length;
    const awayLen = awayArray.length;
    const lenList = [homeLen, drawLen, awayLen];
    const maxLen = Math.max(...lenList);

    // 使用排序后的有效数组
    const sortedHomeArray = [...validHomeArray];

    // 长度不够就补
    if (maxLen > sortedHomeArray.length) {
      for (let i = 0; i < maxLen - sortedHomeArray.length; i++) {
        const map: SelectionItem = {
          type: '',
          marketId: '',
          oddsId: '',
          isSupportHK: false,
          odds: -1,
          oddsHK: -1,
          isSupportStray: false,
          name: '',
          handicap: '',
          betName: '',
          isLock: true,
        };
        sortedHomeArray.push(map);
      }
    }
    if (maxLen > drawArray.length) {
      for (let i = 0; i < maxLen - drawArray.length; i++) {
        const map: SelectionItem = {
          type: '',
          marketId: '',
          oddsId: '',
          isSupportHK: false,
          odds: -1,
          oddsHK: -1,
          isSupportStray: false,
          name: '',
          handicap: '',
          betName: '',
          isLock: true,
        };
        drawArray.push(map);
      }
    }
    if (maxLen > awayArray.length) {
      for (let i = 0; i < maxLen - awayArray.length; i++) {
        const map: SelectionItem = {
          type: '',
          marketId: '',
          oddsId: '',
          isSupportHK: false,
          odds: -1,
          oddsHK: -1,
          isSupportStray: false,
          name: '',
          handicap: '',
          betName: '',
          isLock: true,
        };
        awayArray.push(map);
      }
    }

    const newList: SelectionItem[] = [];
    for (let i = 0; i < maxLen; i++) {
      newList.push(sortedHomeArray[i]!);
      newList.push(drawArray[i]!);
      newList.push(awayArray[i]!);
    }
    return newList;
  } catch (_e) {
    return [];
  }
}

/**
 * 处理详情列表数据
 */
export function formatFbDetailList(
  detailData: { ts?: Array<{ na: string }>; id: number; sid: number; mc?: { s?: number } },
  detailList: MarketGroup[],
): Array<{ name: string; type: string[]; market: MarketData[] }> {
  if (!detailList || detailList.length === 0) {
    return [];
  }

  try {
    // 处理列表数据
    const list = getMarketList(detailData, detailList);
    // 整合数据
    const timeMap = detailData.mc || {};
    const time = `${timeMap.s || 0}`;

    const newData = getAllList(list, detailData.sid, time);
    const result: Array<{ name: string; type: string[]; market: MarketData[] }> = [];

    Object.values(newData).forEach((curr) => {
      if (curr.market.length > 0) {
        result.push({
          name: curr.name.replace(/波胆/g, '比分'),
          type: [],
          market: curr.market,
        });
      }
    });

    return result;
  } catch (_e) {
    return [];
  }
}
