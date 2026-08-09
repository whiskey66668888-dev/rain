import dayjs from 'dayjs';
import _ from 'lodash';
import CryptoJS from 'crypto-js';
type WordArray = CryptoJS.lib.WordArray;
import Pinyin from 'tiny-pinyin';

import {
  EAcceptOddsPrefer,
  EBetHistoryQueryType,
  EBetOrderStatus,
  EBetSettleResult,
  EOddsStatus,
  HotSportId,
  PlayType,
} from '@/apis/commonSports/constants';
import {
  TBaseBetItem,
  // ChampionMarket,
  // ChampionTournament,
  // DetailMatchInfo,
  // DetailMatchTabs,
  LeagueInfo,
  // LeagueInfoResp,
  MatchBaseInfo,
  MatchMarket,
  BetType,
  Menues,
  MenuInfo,
  TBetHistoryData,
  TBetHistoryOrderItem,
  THistoryBetItem,
  TBetHistoryQueryParams,
  // Selection,
} from '@/apis/commonSports/types';

import { MatchRecord } from '../getList';
import { MatchStatsResponse } from '../statistical';
import {
  FBCompetitionMap,
  FBSportId,
  FBSportIdValue,
  FBSportIds,
  fbList,
  matchPlayTypeToPlayTypeMap,
} from './constants';
import {
  // categoryMap,
  // type CategoryItem,
  // fbHandBigArray,
  mtyHandicapSet,
  mtyPointSet,
  mtyWinSet,
  // fbTreeArray,
  // fbTwoArray,
  // fbWinArray,
  // categoryFeaturedIds,
  // categoryGoalIds,
  // categoryCSIds,
  // categoryCornerIds,
  // categoryPenaltyCardIds,
  // categoryTimesIds,
  // categorySpecialIds,
  // categoryFullIds,
  // categoryHalfIds,
  // categoryNoodfIds,
} from './constants/fbPlays';
import { fbSportsStatusMap, fbTeamScoreType } from './constants/matchPeriod';
import {
  LocalHandicapItem,
  MarketGroup,
  ScoreItem,
  type League,
  type Team,
  type MatchClock,
  OddsOption,
  LeagueGroup,
  LeagueItem,
} from './types';
import { LeagueRecord } from '../getLeagues';
import {
  EFbMarketCurtSaleStatusEnum,
  EFbMatchStatus,
  EFbMatchType,
  EFbOddsChangeEnum,
  EFbOrderQueryTimeType,
  EFbOrderStatus,
  EFbOutcome,
  EFbReserveOrderStatus,
  EFbSeriesType,
} from './constants/enum';
import { EFbSelectionType } from './constants/selectionType';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import {
  TOrderBetListFbData,
  TOrderBetListFbOrderOptionItem,
  TOrderBetListFbParams,
  TOrderBetListFbRecordItem,
} from '../betHistory/orderBetListFb';
import {
  TOrderReserveBetListFbData,
  TOrderReserveBetListFbParams,
} from '../betHistory/orderReserveBetListFb';
import { bigNB } from '@/utils/bet/bigMath';
import { calcParlayOdds } from '@/utils/bet/parlay';
import { EFbMarketType } from './constants/marketType';
import { EFbResultTypeGroupRemark } from './constants/resultTypeGroup';

/** API 玩法名「胜负」与产品「独赢」 */
const FB_MARKET_NM_WINNER_TO_DUYING_MTYS = new Set<number>([EFbMarketType.winner_3004]);

/**
 * 统一 FB 玩法展示名：篮球等两项独赢接口可能返回「胜负」，产品展示为「独赢」
 */
export function normalizeFbMarketDisplayName(nm: string, mty?: number): string {
  const name = String(nm || '').replace(/波胆/g, '比分');
  if (name === '胜负' && mty != null && FB_MARKET_NM_WINNER_TO_DUYING_MTYS.has(mty)) {
    return '独赢';
  }
  return name;
}

// 使用 categoryMap 作为 fbCategoryMap 的别名
// const fbCategoryMap: Record<string, CategoryItem> = categoryMap;

/**
 * 获取赛事状态
 * @param sportId - 赛事id
 * @param mmp - 赛事状态
 * @returns 状态对应的中文文案
 */
function _getFBMatchStatus({
  sportId,
  mmp,
}: {
  sportId: number; // 赛事id
  mmp?: number; // 赛事状态
}): string {
  try {
    return fbSportsStatusMap[sportId]?.[mmp ?? '-1'] ?? '进行中';
  } catch (e) {
    console.error(e, 'Failed to get FB match status');
    return '进行中';
  }
}
/**
 * 格式化时间戳为字符串，格式为 MM-DD HH:mm
 * @param time 毫秒时间戳（例如：1713787200000）
 * @returns 格式化后的时间字符串，失败则返回空字符串
 */
/**
 * 判定赛事是否完场，兼容两种数据来源：
 * - 赛果接口（convertResultToMatch）：matchStatusId=3、matchStatus/periodName='完场'。
 * - live 列表接口（formatFBSportItem）：matchStatusId 是阶段枚举（如足球完场=1005，非 3），
 *   且不写 matchStatus，完场文案落在 periodName（'已结束'）。此前只看 matchStatusId===3 / matchStatus，
 *   导致「关注列表按 matchIds 拉到的已完赛事」被判成未完场 → 不显示比分、状态标签回退成日期。
 */
export const isFBMatchEnded = (match: {
  matchStatusId?: number | string | null;
  matchStatus?: string | null;
  periodName?: string | null;
}): boolean =>
  Number(match.matchStatusId) === 3 ||
  /已结束|完场/i.test(match.matchStatus ?? '') ||
  /已结束|完场/i.test(match.periodName ?? '');

export function getFBTime(time: number): string {
  try {
    return dayjs(time).format('MM-DD HH:mm');
  } catch (e) {
    console.error(e, 'Failed to format FB time');
    return '';
  }
}
interface ScoreData {
  tyg: number; // 比分类型
  pe: number; // 判定是否当前需要的项，sportId * 1000 + stepX
  sc: [number?, number?]; // 比分：[主队, 客队]
}

/**
 * 格式化比分，根据 sportId 和 type 过滤出对应的比分
 * @param sportId 赛种 id
 * @param list 比分原始列表
 * @param type 比分类型
 * @param step1 步进值1，默认 0
 * @param step2 步进值2，默认 1
 * @returns 比分对象，如 { home: 1, away: 2 }
 */
export function getFBScoreByType({
  sportId,
  list,
  type,
  step1 = 0,
  step2 = 1,
}: {
  sportId: number;
  list?: ScoreData[] | null;
  type: number;
  step1?: number;
  step2?: number;
}): Record<'home' | 'away', number> {
  if (!list) return { home: 0, away: 0 };

  const data: Record<'home' | 'away', number> = { home: 0, away: 0 };

  try {
    // 查找符合条件的比分项
    const result = list.find(
      (item) =>
        item.tyg === type &&
        (item.pe === sportId * 1000 + step1 || item.pe === sportId * 1000 + step2),
    );

    data.home = result?.sc?.[0] ?? 0;
    data.away = result?.sc?.[1] ?? 0;
  } catch (e) {
    // 不处理错误
    console.error(e, 'Failed to format FB score by type');
    return data;
  }

  return data;
}

/**
 * 格式化主场比分，根据 sportId 判断是否使用特殊类型处理
 * @param sportId 赛种 id
 * @param list 比分列表
 * @param isHandleTennis 是否处理网球特殊逻辑，默认 true
 * @returns 主客队比分对象 { home, away }
 */
export function getFBScoreBySportId({
  sportId,
  list,
  isHandleTennis = true,
}: {
  sportId: number;
  list?: ScoreData[] | null;
  isHandleTennis?: boolean;
}): Record<'home' | 'away', number> {
  if (!list) return { home: 0, away: 0 };

  // 如果是网球或乒乓球，并且允许处理网球特殊逻辑
  if (
    (sportId === FBCompetitionMap[FBSportId.Tennis].id && isHandleTennis) ||
    sportId === FBCompetitionMap[FBSportId.PingPong].id
  ) {
    return getFBScoreByType({ sportId, list, type: 5559 });
  }

  // 其他情况使用默认类型 5
  return getFBScoreByType({ sportId, list, type: 5 });
}

/**
 * 格式化上半场比分
 * @param sportId 赛种 id
 * @param list 比分列表
 * @param mmp 当前赛事状态
 * @returns 上半场比分字符串，例如 '1-2'
 */
export function getFBFirstHalfScoreBySportId({
  sportId,
  list,
  mmp,
}: {
  sportId: number;
  list?: ScoreData[] | null;
  mmp: number;
}): string {
  if (!list) return '';

  const step = 2; // 上半场
  // 如果当前上半场未结束，不计算
  if (mmp <= sportId * 1000 + step) {
    return '';
  }

  // 获取比分
  const result = getFBScoreByType({
    sportId,
    list,
    type: 5,
    step1: step,
    step2: step,
  });

  return `${result.home || 0}-${result.away || 0}`;
}

/** 根据选项 ty 解析主/客/和（与详情页 BettingMarket 一致） */
const resolveFbSelectionSideLabel = (ty?: number | string | null): string | null => {
  const type = Number(ty);
  if (type === Number(EFbSelectionType.home)) return '主';
  if (type === Number(EFbSelectionType.away)) return '客';
  if (type === Number(EFbSelectionType.draw)) return '和';
  return null;
};

/**
 * 列表/首页卡片投注项简称：主客和 + 盘口值，避免仅展示队名缩写
 */
export const formatFbBetItemShortName = (params: {
  nm?: string | null;
  na?: string | null;
  ty?: number | string | null;
  li?: string | number | null;
}): string => {
  const side = resolveFbSelectionSideLabel(params.ty);
  const lineValue =
    params.li != null && String(params.li).trim() !== '' ? String(params.li).trim() : '';

  if (side) {
    return lineValue ? `${side} ${lineValue}`.trim() : side;
  }

  return (params.nm || params.na || '').trim();
};

/** 从 TBaseBetItem 取展示用简称（兼容旧数据） */
export const getBetItemDisplayShortName = (betItem: TBaseBetItem): string => {
  const display = formatFbBetItemShortName({
    nm: betItem.betItemShortName,
    na: betItem.betItemFullName,
    ty: betItem.fb?.ty,
    li: betItem.marketValue,
  });
  return display || betItem.betItemShortName || '—';
};

/**
 * 获取比分赔率
 * @param sportId 当前赛种 id
 * @param list 比分列表
 * @returns 格式化后的赔率数据
 */
export function getFBScoreOdds({
  sportId,
  list,
  // homeName,
  // awayName,
}: {
  sportId: number;
  list?: MarketGroup[] | null;
  homeName: string;
  awayName: string;
}): MatchMarket[] {
  // 隐藏头部 网球/排球/乒乓球
  // const isHiddenHandicap = [
  //   FBCompetitionMap.tennis.id,
  //   FBCompetitionMap.volleyball.id,
  //   FBCompetitionMap.pingPong.id,
  // ].includes(sportId);

  try {
    // 获取当前赛事列表
    const scoreList = getFBSportList(sportId);
    // 处理比分列表
    const data: MatchMarket[] = [];
    scoreList.forEach((item) => {
      // 类型
      const type = item.idList[0];
      const period = item.period || sportId * 1000 + 1;
      // 是否显示 3 个
      // const isThree = item.row === 3;

      const isCS = type === 1188; // 比分

      // 获取当前值
      const result =
        (list ?? []).find((value) => {
          return (
            Number(value.mty) === Number(type) && (!period || Number(value.pe) === Number(period))
          );
        }) ?? ({} as MarketGroup);

      // 比分值
      const hlList = result['mks'] ?? [];
      if (hlList.length === 0) {
        return;
      }

      hlList.forEach((hlData) => {
        // 比分 map
        const matchMarket: MatchMarket = {
          itemType: `${type}_${period}`,
          name: item.name,
          children: [
            {
              betTypeId: `${hlData?.['id'] ?? type}`,
              betTypeName: normalizeFbMarketDisplayName(result['nm'] ?? '', result['mty']),
              typeId: result['mty'],
              lists: [],
            },
          ],
        };

        // const betTypeName = result['nm'];

        if (Object.keys(hlData).length === 0) {
          data.push(matchMarket);
        } else {
          // 设置串关
          // const isSupportStray = hlData['au'] === 1; // 0-不支持 1-支持
          const oddList = hlData['op'];
          if (oddList.length === 0) {
            data.push(matchMarket);
            return;
          }

          // 根据行数创建相应数量的投注项
          const betItems: TBaseBetItem[] = [];

          // 遍历子元素
          oddList.forEach((hlValue) => {
            // 赔率条目
            const ty = hlValue['ty'];
            const marketId = `${hlData['id']}`;
            const odds = hlValue['od'];

            const betItemShortName = formatFbBetItemShortName({
              nm: hlValue['nm'],
              na: hlValue['na'],
              ty: hlValue['ty'],
              li: hlValue['li'],
            });

            const betItem: TBaseBetItem = {
              isSupportHK: false,
              canParlay: hlData['au'] == 1,
              canPreBet: true,
              playName: normalizeFbMarketDisplayName(result['nm'] ?? '', result['mty']),
              playId: `${result.mty}_${result.pe}`,
              marketId,
              marketValue: hlValue['li'] || '',
              betItemShortName,
              betItemFullName: getBetItemFullNameFb({ mksItem: result, op: hlValue }),
              betItemId: `${hlData['id']}_${ty}`,
              baseOdds: odds,
              oddsStatus: oddsStatusFormatFb({ ss: hlData['ss'] }),
              fb: {
                mty: result['mty'],
                pe: result['pe'],
                ty: ty,
              },
              // type: `${ty}`,
              // betItemStatus: hlData['ss'] !== 1 ? 2 : 1,
              // betItemName:
              //   hlValue['na'] === homeName
              //     ? '主'
              //     : hlValue['na'] === awayName
              //       ? '客'
              //       : hlValue['na'],
              // betItemType: `${hlValue['ty']}`,
              // //  marketValue: isFirst && isHiddenHandicap ? '' : (hlValue['li'] ?? hlValue['nm']),
              // marketValue: hlValue['li'] || '',
              // odds: odds?.toString() || '0',
              // betItemId: `${hlValue['oid'] || `${marketId}_${ty}`}`,
              // oddsType: String(hlValue['odt']),
              // marketId,
              // isSupportHK: true,
              // oddsEU: getFBOdds(odds, false),
              // oddsHK: getFBOdds(odds, true),
              // placeNum: hlData['mbl'] || 0,
              // isSupportCombo: hlData['au'] ? 1 : 0,
              // matchType: 1,
              // canPreBet: true,
              // typeIdPe: result['pe'],
              // canSeriesBet: hlData['au'] == 1,
              // otherOdds: fbHandBigArray.includes(result['mty'])
              //   ? index === 1 && oddList.length > 0
              //     ? `${oddList?.[0]?.['od']?.toString() || '0'}`
              //     : `${oddList?.[1]?.['od']?.toString() || '0'}`
              //   : '0', // 大小让球时需要otherOdds
              // teamIcon: '',
            };

            // 设置值
            betItems.push(betItem);
          });

          if (isCS) {
            const existing = data.find((m) => m.itemType.includes('1188'));
            if (existing && existing.children?.[0]) {
              existing.children[0].lists.push(...betItems);
              existing.children[0].lists = sortBetItemList(
                existing.children?.[0]?.lists ?? [],
                type,
              );
            } else {
              if (matchMarket.children?.[0]) {
                matchMarket.children[0].lists = sortBetItemList(betItems, type);
              }
              data.push(matchMarket);
            }
          } else {
            if (matchMarket.children?.[0]) {
              matchMarket.children[0].lists = sortBetItemList(betItems, type ?? 0);
            }
            data.push(matchMarket);
          }
        }
      });
    });

    return data;
  } catch (e) {
    console.error(e, 'getFBScoreOdds error:');
    return [];
  }
}

/**
 * 获取各个阶段比分
 * @param list 比分列表
 * @param sid 赛种 id
 * @returns 各个阶段的比分列表
 */
export function getFBScoreAll(list: ScoreItem[] | null, sid: number): string[] {
  try {
    const data: string[] = [];
    const type = getSportScoreType(sid);
    for (const element of list ?? []) {
      if (element['tyg'] === type && element['pe'] >= getSportStartSetNo(sid)) {
        const result = element['sc'];
        data.push(`${result[0]}-${result[1]}`);
      }
    }
    return data;
  } catch (e) {
    console.error(e, 'getFBScoreAll error:');
    return [];
  }
}

/**
 * 根据胜平负/让球规则计算队名加粗方
 * 规则1：有胜平负赔率时，胜赔低的一方加粗
 * 规则2：无胜平负时看让球，谁让球谁加粗；平手盘则水位低的一方加粗
 * 规则3：都无法判断时左边（主队）加粗
 */
function getBoldTeamFromMg(mg: MarketGroup[] | null | undefined): 'home' | 'away' {
  const list = mg ?? [];
  // 规则1：胜平负 - 胜赔低的一方加粗
  for (const g of list) {
    if (!mtyWinSet.has(g.mty)) continue;
    const mks = g.mks ?? [];
    for (const m of mks) {
      const op = m.op ?? [];
      const homeOp = op.find((o) => o.ty === EFbSelectionType.home);
      const awayOp = op.find((o) => o.ty === EFbSelectionType.away);
      const homeOdds = homeOp?.od;
      const awayOdds = awayOp?.od;
      if (homeOdds != null && awayOdds != null && homeOdds > 0 && awayOdds > 0) {
        return homeOdds < awayOdds ? 'home' : 'away';
      }
    }
  }
  // 规则2：让球 - 谁让球谁加粗；平手盘则水位低加粗
  for (const g of list) {
    if (!mtyHandicapSet.has(g.mty)) continue;
    const mks = g.mks ?? [];
    for (const m of mks) {
      const op = m.op ?? [];
      const homeOp = op.find((o) => o.ty === EFbSelectionType.home);
      const awayOp = op.find((o) => o.ty === EFbSelectionType.away);
      if (!homeOp || !awayOp || homeOp.od <= 0 || awayOp.od <= 0) continue;
      const lineHome = parseFloat(homeOp.li ?? m.li ?? '0') || 0;
      const lineAway = parseFloat(awayOp.li ?? m.li ?? '0') || 0;
      if (lineHome !== 0 || lineAway !== 0) {
        if (lineHome < 0) return 'home';
        if (lineAway < 0) return 'away';
      }
      return homeOp.od < awayOp.od ? 'home' : 'away';
    }
  }
  return 'home';
}

export function formatFBSportItem(
  value: MatchRecord, // 单条数据模型
  pageIndex?: number, // 当前数据请求分页角标
): MatchBaseInfo {
  const sportId: number = value.sid;
  const leagueMap = value.lg || ({} as League);
  const teamList: [Team, Team] =
    value.ts ||
    ([
      { na: '', id: 0 },
      { na: '', id: 0 },
    ] as [Team, Team]);

  const map: Partial<MatchBaseInfo> = {
    pageIndex: pageIndex || 0, // 当前分页角标
    sportId,
    viewId: getFBSportNameAndViewId(sportId).viewId,
    sportName: getFBSportNameAndViewId(sportId).name,
    leagueId: leagueMap['id'],
    leagueName: leagueMap['na'],
    leagueLogo: leagueMap['lurl'] || '',
    homeName: teamList[0] && teamList[0]['na'],
    homeLogo: (teamList[0] && teamList[0]['lurl']) || '',
    awayName: teamList[1] && teamList[1]['na'],
    awayLogo: (teamList[1] && teamList[1]['lurl']) || '',
    matchId: value['id'],
    matchNum: value['tms'] ?? 0,
    marketCount: value['tms'] ?? 0,
    matchDate: getFBTime(value['bt']),
    bt: value['bt'],
    isLive: value['ms'] === 5,
    animationUrl: value['as']?.[0],
    hasVideo: value['vs']?.have,
    isChampion: value['ty'] === 1,
    nameBold: getBoldTeamFromMg(value['mg']),
  };

  const isFootball = sportId === FBCompetitionMap.football.id;
  const timeMap: MatchClock = value.mc || { s: 0, tu: 0, pe: 0, r: false, tp: 0 };

  if (isFootball) {
    map['isCountdown'] = timeMap['r'];
  }
  map['clockType'] = timeMap['tp'] === 1 ? 'ASC' : 'DESC';

  map['matchTime'] = timeMap['s'] ?? 0;
  const mmp = timeMap['pe'] ?? 0;
  map['matchStatusId'] = mmp;
  map['periodName'] = _getFBMatchStatus({ sportId: map['sportId']!, mmp });
  // 完场态：ms 由 5（滚球）翻成 0（已结束）后 isLive 即为 false，若只按 isLive 二分，
  // 详情页/海报会回退成「未开赛 + 开赛时间」。故这里统一给出第三态供各端判断。
  const isEnded =
    Number(value['ms']) === Number(EFbMatchStatus.Ended) ||
    isFBMatchEnded({ matchStatusId: mmp, periodName: map['periodName'] });
  // 完场后 mc 可能被清空（pe 落在映射表外），_getFBMatchStatus 会兜底成「进行中」，需纠正
  if (isEnded && !fbSportsStatusMap[map['sportId']!]?.[mmp]) {
    map['periodName'] = '已结束';
  }
  map['isEnded'] = isEnded;

  const scoreList = value.nsg;

  const scoreData = getFBScoreBySportId({ sportId, list: scoreList });
  map['homeScore'] = scoreData.home;
  map['awayScore'] = scoreData.away;

  map['halfTimeScore'] = getFBFirstHalfScoreBySportId({
    sportId,
    list: scoreList,
    mmp,
  });

  const detailScoreData = getFBScoreBySportId({
    sportId,
    list: scoreList,
    isHandleTennis: false,
  });
  map['detailHomeScore'] = detailScoreData.home;
  map['detailAwayScore'] = detailScoreData.away;

  if (isFootball) {
    const redCardData = getFBScoreByType({ sportId, list: scoreList, type: 8 });
    const yellowCardData = getFBScoreByType({ sportId, list: scoreList, type: 7 });
    const cornerKickData = getFBScoreByType({ sportId, list: scoreList, type: 6 });

    map['homeRedCard'] = redCardData.home;
    map['awayRedCard'] = redCardData.away;
    map['homeYellowCard'] = yellowCardData.home;
    map['awayYellowCard'] = yellowCardData.away;
    map['homeCornerKick'] = cornerKickData.home;
    map['awayCornerKick'] = cornerKickData.away;
  }

  map['children'] = getFBScoreOdds({
    sportId,
    list: value['mg'],
    homeName: teamList[0] && teamList[0]['na'],
    awayName: teamList[1] && teamList[1]['na'],
  });

  if (isFootball) {
    map['children'].forEach((item: MatchMarket) => {
      if (
        item.itemType.includes('1009_') ||
        item.itemType.includes('1011_') ||
        item.itemType.includes('1010_')
      ) {
        map['cosCorner'] = true;
      }
      if (
        item.itemType.includes('_1007') ||
        item.itemType.includes('_1008') ||
        item.itemType.includes('_1009') ||
        item.itemType.includes('_1010') ||
        item.itemType.includes('_1011') ||
        item.itemType.includes('_1012')
      ) {
        map['cos15Minutes'] = true;
      }
      if (
        item.itemType.includes('1099_') ||
        item.itemType.includes('1100_') ||
        item.itemType.includes('1188_')
      ) {
        map['cosBold'] = true;
      }
      if (
        item.itemType.includes('1061_') ||
        item.itemType.includes('1060_') ||
        item.itemType.includes('1063_')
      ) {
        map['cosPunish'] = true;
      }
    });
  }

  map['scoreAll'] = getFBScoreAll(scoreList ?? null, value.sid);
  return map as MatchBaseInfo;
}

/**
 * 根据赛事类型获取小节比分类型
 * @param sportType 赛事类型
 * @returns 小节比分类型
 */
export function getSportScoreType(sid: number): number {
  switch (sid) {
    case 5:
    case 13:
      return fbTeamScoreType['setScore'] ?? fbTeamScoreType['gameScore'] ?? 5;
    case 15:
    case 47:
      return fbTeamScoreType['gameScore'] ?? 5;
    case 16:
      return fbTeamScoreType['frameScore'] ?? fbTeamScoreType['gameScore'] ?? 5;
    case 2:
    case 3:
    case 7:
    case 178:
      return fbTeamScoreType['score'] ?? 5;
    default:
      return fbTeamScoreType['gameScore'] ?? 5;
  }
}

/**
 * 根据赛事类型获取小节起始节
 * @param sid 赛事类型
 * @returns 小节起始节
 */
export function getSportStartSetNo(sid: number): number {
  switch (sid) {
    case 3:
      return 3005;
    case 13:
      return 13002;
    case 5:
      return 5002;
    case 15:
      return 15002;
    case 7:
      return 7004;
    case 47:
      return 47002;
    case 2:
      return 2003;
    case 6:
      return 6005;
    case 16:
      return 16002;
    case 178:
      return 178005;
    default:
      return 0;
  }
}

// 常量定义（根据实际情况调整）
const flatListPageSize = 10; // 默认分页大小

/**
 * 格式化赛事列表数据
 * 将赛事列表根据联赛进行分组，并转换为 SportTypeInfo 类型结构
 *
 * @param list 原始赛事列表（可能为空）
 * @param pageIndex 当前分页索引
 * @returns 格式化后的赛事列表（SportTypeInfo[]）
 */
export function formatFBMatches({
  list,
  pageIndex,
}: {
  list?: MatchRecord[];
  pageIndex: number;
}): LeagueInfo[] {
  // 如果列表为空或未定义，直接返回空数组
  if (!list || list.length === 0) {
    return [];
  }

  const data: LeagueInfo[] = [];

  list.forEach((item, index) => {
    // 数据格式转换
    try {
      const map = formatFBSportItem(item, index < flatListPageSize ? pageIndex : pageIndex + 1);

      // 查询 list 中是否包含此联赛 ID
      const existIndex = data.findIndex((d) => d.leagueId === map.leagueId);

      if (existIndex === -1) {
        // 创建新的 LeagueInfo 条目
        data.push({
          sportId: map.sportId,
          sportName: map.sportName,
          leagueId: map.leagueId,
          leagueName: map.leagueName,
          leagueLogo: map.leagueLogo || '',
          children: [map],
        });
      } else {
        // 添加到现有的 LeagueInfo 条目
        data[existIndex]!.children.push(map);
      }
    } catch (e) {
      console.error('formatFBMatches error:', e);
    }
  });

  // 转换成 LeagueInfo 实例
  return data.map((item) => toLeagueInfo(item));
}

/**
 * 格式化 FB 菜单列表数据
 * 将 MatchStatsResponse 转换为 MenuInfo
 */
export function formatFBMenuList(res: MatchStatsResponse): MenuInfo {
  // 初始化 menus，为每个 PlayType 创建空数组
  const menus: Menues = {
    [PlayType.Living]: [],
    [PlayType.Today]: [],
    [PlayType.Early]: [],
    [PlayType.Follow]: [],
    [PlayType.Champion]: [],
  };

  // 初始化 playTypes 数组
  const playTypes: Array<{
    type: PlayType;
    typeId: number;
    name: string;
    count: number;
  }> = [];

  // 处理 sl（所有赛事对应的不同类型的场次集合）
  if (res.sl && Array.isArray(res.sl)) {
    res.sl.forEach((matchTypeGroup) => {
      const playType = matchPlayTypeToPlayTypeMap[matchTypeGroup.ty];

      // 如果该 MatchPlayType 有对应的 PlayType，则处理数据
      if (playType) {
        // 处理该类型下的运动统计
        if (matchTypeGroup.ssl && Array.isArray(matchTypeGroup.ssl)) {
          if ([PlayType.Living, PlayType.Today, PlayType.Early].includes(playType)) {
            // 滚球、今日、早盘展示热门
            menus[playType].push({
              sportId: HotSportId,
              name: '热门',
              count: 0,
              viewId: HotSportId,
            });
          }
          matchTypeGroup.ssl.forEach((sportStat) => {
            // 查找是否已存在该运动ID
            const existingSport = _.find(menus[playType], (item) => item.sportId === sportStat.sid);

            if (existingSport) {
              // 如果已存在，累加数量
              existingSport.count += sportStat.c;
            } else {
              // 如果不存在，添加新项
              const { name, viewId } = getFBSportNameAndViewId(sportStat.sid);
              if (name && viewId && sportStat.c > 0) {
                // 这里只添加处理了映射的赛种,数量大于0的赛种
                menus[playType].push({
                  sportId: sportStat.sid,
                  count: sportStat.c,
                  name,
                  viewId,
                });
              }
            }
          });
        }

        // 处理 playTypes 数组
        const existingPlayType = _.find(playTypes, (item) => item.type === playType);

        if (existingPlayType) {
          // 如果已存在，累加总数
          existingPlayType.count += matchTypeGroup.tc;
        } else {
          // 如果不存在，添加新项
          playTypes.push({
            type: playType,
            typeId: matchTypeGroup.ty,
            // 临时处理去掉赛事字眼，后续这里用国际化映射
            name: matchTypeGroup.des.replace('赛事', '') || '',
            count: matchTypeGroup.tc,
          });
        }
      }
    });
  }

  // // 对每个 PlayType 的运动列表按 sportId 排序
  // Object.keys(menus).forEach((key) => {
  //   const playType = key as PlayType;
  //   menus[playType] = _.sortBy(menus[playType], 'sportId');
  // });

  // 对 playTypes 按 typeId 排序
  const sortedPlayTypes = _.sortBy(playTypes, 'typeId') as [
    {
      type: PlayType;
      typeId: number;
      name: string;
      count: number;
    },
  ];

  return {
    hotSportMatchIds: res.hls.map((item) => item.id),
    menus,
    playTypes: sortedPlayTypes,
  };
}

// function formatBatchNo(): number {
//   const now = new Date();
//   const pad = (n: number) => n.toString().padStart(2, '0');
//   const formatted =
//     now.getFullYear().toString() +
//     pad(now.getMonth() + 1) +
//     pad(now.getDate()) +
//     pad(now.getHours()) +
//     pad(now.getMinutes()) +
//     pad(now.getSeconds());
//   return Number(formatted);
// }

// export function transformToLeagueInfoResp(data: LeagueInfo[], platform: string): LeagueInfoResp[] {
//   const batchNo = formatBatchNo();

//   return data
//     .map((item) => ({
//       leagueId: String(item.id),
//       sportName: '',
//       sportId: String(item.sid),
//       leagueEnName: '',
//       leagueZhName: item.na,
//       leagueLevel: item.or,
//       leagueShortName: item.na.slice(0, 10),
//       platform,
//       batchNo,
//       sort: item.or,
//     }))
//     .sort((a, b) => a.leagueLevel - b.leagueLevel) // 按联赛等级排序
//     .slice(0, 10); // 限制联赛数量
// }

// export const formatChampionData = ({
//   list,
//   // pageIndex,
//   // isLive = false,
//   // isFavoriteTab = false,
// }: {
//   list?: any[];
//   pageIndex: number;
//   isLive?: boolean;
//   isFavoriteTab?: boolean;
// }): ChampionTournament[] => {
//   if (!list || list.length === 0) {
//     return [];
//   }

//   return list.map((tournament: any) => ({
//     tournamentId: tournament.lg.id.toString(),
//     sportId: tournament.sid.toString(),
//     sportName: tournament.lg.na,
//     tournamentName: tournament.nm,
//     logo: tournament.lg.lurl,
//     endTime: tournament.bt.toString(),
//     startTime: tournament.bt.toString(),
//     matchId: tournament.id.toString(),
//     markets: tournament.mg ? formatChampionMarkets({ data: tournament }) : [],
//   }));
// };

// export const formatChampionMarkets = ({ data }: { data: any }): ChampionMarket[] => {
//   if (!data.mg || data.mg.length === 0) {
//     return [];
//   }

//   return data.mg.map((market: any) => ({
//     betTypeId: market.mks?.[0]?.id?.toString() || '',
//     marketId: market.mks?.[0]?.id?.toString() || '',
//     marketName: market.nm,
//     endTime: data.bt?.toString() || '',
//     startTime: data.bt?.toString() || '',
//     status: market.mks?.[0]?.ss || 0,
//     selections:
//       market.mks
//         ?.flatMap((mk: any) =>
//           (mk.op || []).map((selection: any) => ({
//             oid: `${mk.id}_${selection.ty}`,
//             name: `${selection.nm}`,
//             type: `${selection.ty}`,
//             odds: selection.od.toString(),
//             status: mk.ss,
//             sort: selection.ty,
//             placeNum: mk.mbl || 0,
//           })),
//         )
//         .sort((a: any, b: any) => a.sort - b.sort) || [],
//   }));
// };

// type DetailData = Record<string, any>;
// type DetailItem = Record<string, any>;

// export const formatFbDetailList = ({
//   detailData,
//   detailList,
// }: {
//   detailData: DetailData;
//   detailList: DetailItem[];
// }): DetailMatchInfo[] => {
//   if (!detailList.length) return [];
//   console.log('detailData detailData', detailData);
//   console.log('detailList detailList', detailList);

//   try {
//     const list = getMarketList(detailData, detailList);
//     console.log('formatFbDetailList list', list);
//     const newData = getFBAllList(list, detailData.sid);
//     console.log('formatFbDetailList newData', newData);

//     const result: DetailMatchInfo[] = newData.reduce((acc, curr) => {
//       if (Array.isArray(curr.children) && curr.children.length > 0) {
//         acc.push({
//           tabType: (typeof curr.tabType === 'string' ? curr.tabType : '').replace(/波胆/g, '比分'),
//           id: typeof curr.id === 'string' ? curr.id : '',
//           children: (curr.children as DetailMatchTabs[]) || [],
//         });
//       }
//       return acc;
//     }, [] as DetailMatchInfo[]);

//     return result;
//   } catch (e) {
//     console.error('formatFbDetailList error:', e);
//     return [];
//   }
// };
// export const getMarketList = (detailData: DetailData, detailList: DetailItem[]): any[] => {
//   const marketList: any[] = [];

//   const teamMsgList = detailData.ts || [];
//   const homeName = teamMsgList.length > 0 ? teamMsgList[0].na : '主队';
//   const awayName = teamMsgList.length > 1 ? teamMsgList[1].na : '客队';
//   try {
//     detailList.forEach((item: any, index: number) => {
//       const selectionList = getSelectionList(item);
//       marketList.push({
//         marketId: `${detailData.id}${index}`,
//         betTypeName: item.nm?.replace(/波胆/g, '比分'),
//         betTypeId: item.mty,
//         lists: selectionList,
//         isLocked: item.ss !== 1,
//         homeTeam: homeName,
//         awayTeam: awayName,
//         hpt: item.mty,
//         types: item.tps || [],
//         category: `${item.mty}_${item.pe}`, // fb 用于分类
//         typeIdPe: item?.pe, // fb 用于 投注类型阶段id
//         lineCount: getLineCount(item),
//       });
//     });
//   } catch (e) {
//     console.error(e, 'getSelectionList error:');
//     return [];
//   }
//   return marketList;
// };
// export function getSelectionList(market: any): Selection[] {
//   const result: Selection[] = [];

//   for (const value of market.mks || []) {
//     (value?.op || []).forEach((res: any, index: number) => {
//       const ty = res.ty;
//       const odds = res.od;
//       const marketId = String(value.id);

//       const selection: Selection = {
//         type: String(ty),
//         marketValue: res['li'] || '',
//         oddsType: String(res['odt']),
//         betItemType: res['ty'],
//         betTypeId: `${marketId}`,
//         placeNum: value['mbl'] || 0,
//         marketId,
//         betItemId: res['oid'] || `${marketId}_${ty}`,
//         isSupportHK: true,
//         odds,
//         typeId: market['mty'], // fb 投注类型阶段id
//         typeIdPe: market['pe'], // fb 投注类型阶段id
//         oddsEU: getFBOdds(odds, false),
//         oddsHK: getFBOdds(odds, true),
//         isSupportStray: value.au === 1,
//         name: res.na,
//         handicap: formatHandicap(res, market.mty),
//         betItemName: `${res.na}`,
//         isLock: value.ss !== 1,
//         matchType: 1,
//         canSeriesBet: value.au === 1,
//         otherOdds: fbHandBigArray.includes(market['mty'])
//           ? index === 1 && value?.op.length > 0
//             ? value?.op[0]['od']?.toString() || '0'
//             : value?.op[1]['od']?.toString() || '0'
//           : 0, // 大小让球时需要otherOdds
//       };

//       result.push(selection);
//     });
//   }

//   return sortSelectionList(result, market.mty);
// }

// //处理比分的数据
// export function sortSelectionList(selectionList: any[], mty: number): any[] {
//   try {
//     // 如果不是比分类型，直接返回原列表
//     if (!fbPointArray.includes(mty)) {
//       return selectionList;
//     }

//     const homeArray: any[] = [];
//     const drawArray: any[] = [];
//     const awayArray: any[] = [];

//     for (const selection of selectionList) {
//       const pointArray = (selection.handicap || '').split('-');
//       const homePoint =
//         pointArray.length > 0 && !isNaN(Number(pointArray[0])) ? Number(pointArray[0]) : 0;
//       const awayPoint =
//         pointArray.length > 1 && !isNaN(Number(pointArray[1])) ? Number(pointArray[1]) : 0;

//       if (homePoint > awayPoint) {
//         homeArray.push(selection);
//       } else if (homePoint < awayPoint) {
//         awayArray.push(selection);
//       } else {
//         drawArray.push(selection);
//       }
//     }

//     const maxLen = Math.max(homeArray.length, drawArray.length, awayArray.length);

//     // 补齐空位（为了列对齐）
//     while (homeArray.length < maxLen) homeArray.push({});
//     while (drawArray.length < maxLen) drawArray.push({});
//     while (awayArray.length < maxLen) awayArray.push({});

//     // 重新拼接为列顺序：主 平 客 主 平 客 ...
//     const newList: any[] = [];
//     for (let i = 0; i < maxLen; i++) {
//       newList.push(homeArray[i]);
//       newList.push(drawArray[i]);
//       newList.push(awayArray[i]);
//     }

//     return newList;
//   } catch (e) {
//     console.error('sortSelectionList error:', e);
//     return [];
//   }
// }

// export function formatHandicap(op: Record<string, any>, mty: number): string {
//   let result = '';
//   const name = (op.nm || '').trim();

//   // 如果是独赢玩法，直接返回原始名称
//   if (fbWinArray.includes(mty)) {
//     return name;
//   }

//   switch (op.ty) {
//     case 1: // 主队
//       result = name === '主' ? name : `主 ${name}`;
//       break;
//     case 2: // 客队
//       result = name === '客' ? name : `客 ${name}`;
//       break;
//     case 3: // 和局 / 让球
//       if (fbHandBigArray.includes(mty)) {
//         result = `${op.na} ${name}`;
//       } else {
//         result = name;
//       }
//       break;
//     default:
//       result = name;
//       break;
//   }

//   return result;
// }
// export function getLineCount(market: Record<string, any>): number {
//   if (!market?.mks || market.mks.length === 0) {
//     return 1;
//   }

//   const mty = market.mty;

//   if (fbTreeArray.includes(mty)) {
//     return 3;
//   }

//   const name = (market.nm || '').replace(/波胆/g, '比分');
//   if (name.includes('比分')) {
//     return 3;
//   }

//   if (fbTwoArray.includes(mty)) {
//     return 2;
//   }

//   return 2;
// }

/**
 * 按类型升序排序投注项
 * @param betItems 需要排序的投注项数组
 * @returns 排序后的投注项数组
 */
function sortBetItemList(selectionList: TBaseBetItem[], mty: number): TBaseBetItem[] {
  try {
    // 如果不是比分类型：胜平负等三选项按 主(1)、和(3)、客(2) 顺序，其余按 ty 升序
    if (!mtyPointSet.has(mty)) {
      const orderMap: Record<number, number> = {
        1: 0, // 主
        3: 1, // 和
        2: 2, // 客
      };
      return selectionList.sort((a, b) => {
        const typeA = parseInt(a.fb?.ty?.toString() || '0', 10);
        const typeB = parseInt(b.fb?.ty?.toString() || '0', 10);
        const orderA = orderMap[typeA] ?? typeA;
        const orderB = orderMap[typeB] ?? typeB;
        return orderA - orderB;
      });
    }

    const homeArray: TBaseBetItem[] = [];
    const drawArray: TBaseBetItem[] = [];
    const awayArray: TBaseBetItem[] = [];

    let otherBetItem: TBaseBetItem = {} as TBaseBetItem;

    // 半/全场正确比分文案含「/」，不能走 split('-') 分栏；保持原顺序即可
    if (mty === 1186) {
      return [...selectionList];
    }

    for (const selection of selectionList) {
      const pointArray = String(selection.betItemFullName).split('-');
      const homePoint = pointArray[0] ? parseInt(pointArray[0], 10) || 0 : 0;
      const awayPoint = pointArray[1] ? parseInt(pointArray[1], 10) || 0 : 0;

      if (homePoint > awayPoint) {
        homeArray.push(selection);
      } else if (homePoint < awayPoint) {
        awayArray.push(selection);
      } else {
        if (selection.fb?.ty.toString() === 'Other' || selection.betItemFullName === '其他') {
          otherBetItem = selection;
          drawArray.push({} as TBaseBetItem);
        } else {
          drawArray.push(selection);
        }
      }
    }

    const homeLen = homeArray.length;
    const drawLen = drawArray.length;
    const awayLen = awayArray.length;
    let maxLen = Math.max(homeLen, drawLen, awayLen, 10);
    maxLen = Math.min(maxLen, 10);

    // 填补空项，保持数组对齐
    while (homeArray.length < maxLen) homeArray.push({} as TBaseBetItem);
    while (drawArray.length < maxLen) drawArray.push({} as TBaseBetItem);
    while (awayArray.length < maxLen) awayArray.push({} as TBaseBetItem);

    const newList: TBaseBetItem[] = [];
    for (let i = 0; i < maxLen; i++) {
      newList.push(homeArray[i] || ({} as TBaseBetItem));
      newList.push(drawArray[i] || ({} as TBaseBetItem));
      newList.push(awayArray[i] || ({} as TBaseBetItem));
    }

    newList.push(otherBetItem);
    return newList;
  } catch (_error) {
    return [];
  }
}

// 足球 15 分钟大小玩法（动态只取 1 个）
const FOOTBALL_15_MINUTE_IDS: string[] = [
  '1007_1007', // 比赛开始 - 14:59
  '1007_1008', // 15:00 - 29:59
  '1007_1009', // 30:00 - 中场休息
  '1007_1010', // 下半场开始 - 59:59
  '1007_1011', // 60:00 - 74:59
  '1007_1012', // 75:00 - 全场结束
];

// 足球热门固定玩法（按产品展示顺序）
const FOOTBALL_HOT_FIXED_IDS: string[] = [
  '1005_1001', // 独赢（胜平负）
  '1000_1001', // 让球（全场）
  '1007_1001', // 大小（全场）
  '1005_1002', // 独赢（上半场）
  '1000_1002', // 让球（上半场）
  '1007_1002', // 大小（上半场）
  '1010_1001', // 角球大小（全场）
  '1011_1001', // 角球让球（全场）
  '1010_1002', // 角球大小（上半场）
  '1011_1002', // 角球让球（上半场）
  '1188_1001', // 波胆（全场）
  ...FOOTBALL_15_MINUTE_IDS,
  '1102_1001', // 精确进球数
  '1101_1001', // 总进球数（区间）
  // '1012_1001', // 双重机会
  // '1002_1001', // 让球胜平负
  // '1027_1001', // 双方均有进球
  // '1089_1001', // 第x粒进球
];

// 篮球热门固定玩法（按产品展示顺序）
const BASKETBALL_HOT_FIXED_IDS: string[] = [
  // 1. 全场
  '3004_3001', // 全场独赢（胜负）
  '3002_3001', // 全场让球（让分）
  '3003_3001', // 全场大小（总分大小）
  '3012_3001', // 全场主队总分大小
  '3013_3001', // 全场客队总分大小
  // 2. 上半场
  '3020_3003', // 上半场独赢（两项）
  '3002_3003', // 上半场让球
  '3003_3003', // 上半场大小
  '3012_3003', // 上半场主队总分大小
  '3013_3003', // 上半场客队总分大小
  // 3. 第一节 ~ 第四节：让分 / 大小 / 主客队总分大小
  '3002_3005', // 第一节让分
  '3003_3005', // 第一节大小
  '3012_3005', // 第一节主队总分大小
  '3013_3005', // 第一节客队总分大小
  '3002_3006', // 第二节让分
  '3003_3006', // 第二节大小
  '3012_3006', // 第二节主队总分大小
  '3013_3006', // 第二节客队总分大小
  '3002_3007', // 第三节让分
  '3003_3007', // 第三节大小
  '3012_3007', // 第三节主队总分大小
  '3013_3007', // 第三节客队总分大小
  '3002_3008', // 第四节让分
  '3003_3008', // 第四节大小
  '3012_3008', // 第四节主队总分大小
  '3013_3008', // 第四节客队总分大小
  // 4. 单双
  '3005_3001', // 全场单双
  '3005_3003', // 上半场单双
  '3005_3005', // 第一节单双
  '3005_3006', // 第二节单双
  '3005_3007', // 第三节单双
  '3005_3008', // 第四节单双
];

// 篮球「第x节」动态玩法族（独赢/让分/总分大小）
const BASKETBALL_PERIOD_MTYS: number[] = [3020, 3002, 3003];
// 篮球节次（第一节 -> 第四节），用于赛前固定第一节、滚球取最小可用节
const BASKETBALL_PERIOD_PES: number[] = [3005, 3006, 3007, 3008];

export function getFootball15MinuteHotId(matchTime?: number): string {
  const time = Number(matchTime);
  // 赛前/无时间：只取第一个 15 分钟玩法
  if (!Number.isFinite(time) || time <= 0) return FOOTBALL_15_MINUTE_IDS[0]!;
  if (time < 900) return FOOTBALL_15_MINUTE_IDS[0]!;
  if (time < 1800) return FOOTBALL_15_MINUTE_IDS[1]!;
  if (time < 2700) return FOOTBALL_15_MINUTE_IDS[2]!;
  if (time < 3600) return FOOTBALL_15_MINUTE_IDS[3]!;
  if (time < 4500) return FOOTBALL_15_MINUTE_IDS[4]!;
  return FOOTBALL_15_MINUTE_IDS[5]!;
}

export function getBasketballHotPeriodPe(list: MarketGroup[], matchTime?: number): number {
  const time = Number(matchTime);
  // 赛前：只取第一节
  if (!Number.isFinite(time) || time <= 0) return 3005;

  let minPeriod = Number.POSITIVE_INFINITY;
  for (const item of list) {
    const pe = Number(item.pe);
    if (!BASKETBALL_PERIOD_PES.includes(pe)) continue;
    if (!BASKETBALL_PERIOD_MTYS.includes(Number(item.mty))) continue;
    if (pe < minPeriod) minPeriod = pe;
  }

  return Number.isFinite(minPeriod) ? minPeriod : 3005;
}

function buildHotMarketOrderIds(
  list: MarketGroup[],
  sportId: number,
  matchTime?: number, //  OP7-1172 展示所有时间类玩法，
): string[] {
  if (sportId === Number(FBSportIdValue.Football)) {
    // const football15MinuteId = getFootball15MinuteHotId(matchTime);
    return [...FOOTBALL_HOT_FIXED_IDS];
  }

  if (sportId === Number(FBSportIdValue.Basketball)) {
    return [...BASKETBALL_HOT_FIXED_IDS];
  }

  return [];
  if (1 > 2) {
    console.warn(matchTime);
  }
}

// 详情热门盘口玩法过滤排序
export function getFBDetailHotMarketList(
  list: MarketGroup[],
  sportId: number,
  matchTime?: number,
): MarketGroup[] {
  const orderIds = buildHotMarketOrderIds(list, sportId, matchTime);
  if (orderIds.length === 0 || list.length === 0) return [];

  const marketMap = new Map<string, MarketGroup>();
  for (const item of list) {
    const key = `${item.mty}_${item.pe}`;
    if (!marketMap.has(key)) {
      marketMap.set(key, item);
    }
  }

  const result: MarketGroup[] = [];
  for (const id of orderIds) {
    const market = marketMap.get(id);
    if (market) result.push(market);
  }
  return result;
}

function sortFootballHandBigMarkets(list: MarketGroup[], sourceList: MarketGroup[]): MarketGroup[] {
  const fifteenMinPe = new Set([1007, 1008, 1009, 1010, 1011, 1012]);
  const originalIndex = new Map<string, number>();
  sourceList.forEach((item, index) => {
    const key = `${item.mty}_${item.pe}`;
    if (!originalIndex.has(key)) {
      originalIndex.set(key, index);
    }
  });

  const getIndex = (group: MarketGroup) =>
    originalIndex.get(`${group.mty}_${group.pe}`) ?? Number.MAX_SAFE_INTEGER;

  // 与 EMC 一致：整体保持接口 mg 顺序；同一 mty 内 15 分钟阶段沉底
  return [...list].sort((a, b) => {
    if (Number(a.mty) === Number(b.mty)) {
      const aIs15Min = fifteenMinPe.has(Number(a.pe));
      const bIs15Min = fifteenMinPe.has(Number(b.pe));
      if (aIs15Min !== bIs15Min) {
        return aIs15Min ? 1 : -1;
      }
    }
    return getIndex(a) - getIndex(b);
  });
}

/** 足球让球&大/小 Tab：保持接口顺序，同 mty 内 15 分钟玩法置底 */
export function getFBDetailHandBigMarketList(
  list: MarketGroup[],
  sportId: number,
  sourceList?: MarketGroup[],
): MarketGroup[] {
  if (sportId !== Number(FBSportIdValue.Football) || list.length === 0) return list;
  return sortFootballHandBigMarkets(list, sourceList ?? list);
}
// // fb详情 组装  具体的投注类型放入hand的market里面
// export function getFBAllList(list: unknown[], sportId: number): CategoryItem[] {
//   // 先重置分类中的 market 列表
//   for (const key in fbCategoryMap) {
//     if (fbCategoryMap.hasOwnProperty(key)) {
//       const category = fbCategoryMap[key];
//       if (category) {
//         category.children = [];
//       }
//     }
//   }

//   for (const item of list) {
//     if (sportId === 1) {
//       setFootBallCategory(item);
//     } else if (sportId === 3) {
//       setBasketballCategory(item);
//     } else {
//       setOtherCategory(item);
//     }
//   }

//   // 返回分类后的数组
//   return Object.values(fbCategoryMap);
// }

/**
 * 计算赔率（香港/欧洲盘）
 * @param value 欧盘赔率
 * @param isSupportHK 是否支持香港盘
 * @returns 返回格式化的赔率值（字符串）
 */
export function getFBOdds(value: number, isSupportHK: boolean): string {
  try {
    // 赔率(欧洲盘)
    const data = parseFloat(`${value}`);
    // 如果赔率小于0，表示锁盘状态
    if (data < 0) return '';
    // 赔率(香港盘)
    const oddsHk = (data * 100 - 100) / 100;
    // 返回展示信息，选择展示香港盘或欧洲盘
    return isSupportHK ? oddsHk.toFixed(2) : data.toFixed(2);
  } catch (err) {
    console.error(err, 'getFBOdds');
    return '0.00';
  }
}

// /**
//  * 将普通对象转换为 LeagueInfo 类型
//  * @param data 原始对象
//  */
export function toLeagueInfo(data: LeagueInfo): LeagueInfo {
  return {
    sportId: data.sportId ?? 0,
    sportName: data.sportName ?? '',
    leagueId: data.leagueId ?? 0,
    leagueName: data.leagueName ?? '',
    leagueLogo: data.leagueLogo ?? '',
    children: (data.children ?? []).map((match: MatchBaseInfo) => ({
      viewId: match.viewId,
      matchStatus: match.periodName ?? '',
      matchStatusId: match.matchStatusId ?? '',
      matchTime: match.matchTime ?? '',
      matchDate: match.matchDate ?? '',
      bt: match.bt ?? 0,
      matchId: match.matchId ?? '',
      score: `${match.homeScore ?? 0}-${match.awayScore ?? 0}`,
      homeName: match.homeName ?? '',
      homeLogo: match.homeLogo ?? '',
      awayName: match.awayName ?? '',
      awayLogo: match.awayLogo ?? '',
      children: match.children ?? [],
      marketCount: match.marketCount ?? 0,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      homeRedCard: match.homeRedCard ?? 0,
      awayRedCard: match.awayRedCard ?? 0,
      homeYellowCard: match.homeYellowCard ?? 0,
      awayYellowCard: match.awayYellowCard ?? 0,
      homeCornerKick: match.homeCornerKick ?? 0,
      awayCornerKick: match.awayCornerKick ?? 0,
      scoreAll: match.scoreAll ?? [],
      firstHalfScore: match.firstHalfScore ?? '',
      halfTimeScore: match.halfTimeScore ?? '',
      cosCorner: match.cosCorner ?? false,
      cos15Minutes: match.cos15Minutes ?? false,
      cosBold: match.cosBold ?? false,
      cosPunish: match.cosPunish ?? false,
      compose: match.compose ?? false,
      sportId: data.sportId ?? 0,
      sportName: data.sportName ?? '',
      leagueId: data.leagueId ?? '',
      leagueName: data.leagueName ?? '',
      leagueLogo: data.leagueLogo ?? '',
      pageIndex: match.pageIndex ?? 0,
      matchNum: match.matchNum ?? '',
      matchPeriod: match.matchPeriod ?? '',
      isLive: match.isLive ?? false,
      isCountdown: match.isCountdown ?? false,
      periodName: match.periodName ?? '',
      detailHomeScore: match.detailHomeScore ?? 0,
      detailAwayScore: match.detailAwayScore ?? 0,
      canPreBet: match.canPreBet ?? false,
      isChampion: match.isChampion ?? false,
      clockType: match.clockType ?? 'ASC',
    })),
  };
}

/**
 * 获取当前列表字段
 * @param id 球种 id
 * @returns 对应球种的 list，未找到则返回空数组
 */
export function getFBSportList(id: number): LocalHandicapItem[] {
  const item = fbList.find((value) => value.id === id);
  return item?.list ?? [];
}

// /**
//  * 获取指定球种的名称
//  * @param id 球种的唯一标识符（例如：1 表示足球）
//  * @returns 匹配的球种名称，如果未找到则返回空字符串
//  */
export function getFBSportNameAndViewId(id: number): { name: string; viewId: number } {
  try {
    const index = fbList.findIndex((value) => value.id === id);
    return index >= 0
      ? {
          name: fbList?.at(index)?.label ?? '',
          viewId: fbList?.at(index)?.viewId ?? 0,
        }
      : { name: '', viewId: 0 };
  } catch (err) {
    console.error(err, 'Failed to find FB sport by id:', id);
    return { name: '', viewId: 0 };
  }
}

// // fb 处理足球类别
// export function setFootBallCategory(item: any) {
//   const cat = item.category;
//   const types = item.types || [];
//   const betTypeName = item.betTypeName || '';

//   const pushTo = (key: string) => {
//     fbCategoryMap[key]?.children?.push(item);
//   };

//   if (categoryFeaturedIds.includes(cat)) {
//     pushTo('featured');
//   } else if (categoryGoalIds.includes(cat)) {
//     pushTo('goal');
//   } else if (categoryCSIds.includes(cat)) {
//     processCorrectScore(item);
//     pushTo('cs');
//   } else if (categoryCornerIds.includes(cat)) {
//     pushTo('corner');
//   } else if (categoryPenaltyCardIds.includes(cat)) {
//     pushTo('penaltyCard');
//   } else if (categoryTimesIds.includes(cat)) {
//     pushTo('time');
//   } else if (categorySpecialIds.includes(cat)) {
//     pushTo('special');
//   } else if (types.includes('i')) {
//     pushTo('special');
//   } else if (betTypeName.includes('比分')) {
//     processCorrectScore(item);
//     pushTo('cs');
//   }

//   // 所有都归到 all
//   pushTo('all');
// }

// // fb 处理篮球类别
// export function setBasketballCategory(item: any) {
//   const cat = item.category;
//   const types = item.types || [];

//   const pushTo = (key: string) => {
//     fbCategoryMap[key]?.children?.push(item);
//   };

//   if (categoryFullIds.includes(cat)) {
//     pushTo('full');
//   } else if (categoryHalfIds.includes(cat)) {
//     pushTo('half');
//   } else if (categoryNoodfIds.includes(cat)) {
//     pushTo('nood');
//   } else if (categorySpecialIds.includes(cat)) {
//     pushTo('special');
//   } else if (types.includes('i')) {
//     pushTo('special');
//   }

//   pushTo('all');
// }

// // fb 处理其他类别
// export function setOtherCategory(item: any) {
//   const types = Array.isArray(item.types) ? item.types : [];

//   for (const key in fbCategoryMap) {
//     const category = fbCategoryMap[key];
//     if (category && types.includes(category.type)) {
//       category.children?.push(item);
//     }
//   }

//   fbCategoryMap.all?.children?.push(item);
// }

// 补齐比分逻辑，保持原样
// function processCorrectScore(item: any) {
//   const selections = [...(item.selections || [])];
//   const zhu: any[] = [];
//   const ping: any[] = [];
//   const ke: any[] = [];

//   selections.forEach((s) => {
//     const [a, b] = (s.handicap || '').split('-').map(Number);
//     if (isNaN(a) || isNaN(b)) return;
//     if (a > b) zhu.push(s);
//     else if (a < b) ke.push(s);
//     else ping.push(s);
//   });

//   zhu.sort((a, b) => a.handicap.localeCompare(b.handicap));
//   ping.sort((a, b) => a.handicap.localeCompare(b.handicap));
//   ke.sort((a, b) => {
//     const [a1, a2] = a.handicap.split('-').map(Number);
//     const [b1, b2] = b.handicap.split('-').map(Number);
//     return a2 - b2 || a1 - b1;
//   });

//   const maxLen = Math.max(zhu.length, ping.length, ke.length);
//   const lock = () => ({ handicap: '', isLock: true });

//   while (zhu.length < maxLen) zhu.push({ ...lock() });
//   while (ping.length < maxLen) ping.push({ ...lock() });
//   while (ke.length < maxLen) ke.push({ ...lock() });

//   const result: any[] = [];
//   for (let i = 0; i < maxLen; i++) {
//     result.push(zhu[i], ping[i], ke[i]);
//   }

//   item.selections = result;
// }

/** 格式化未结算，已结算，投注记录参数 */
export const formatBetHistoryParamsFb = (params: TBetHistoryQueryParams) => {
  const { queryType, startTime, endTime, pageSize, pageNum } = params;

  const isSettled = [
    EBetHistoryQueryType.SETTLED,
    EBetHistoryQueryType.SETTLED_CHAMPION,
    EBetHistoryQueryType.SETTLED_EARLY_SETTLEMENT,
  ].includes(queryType);

  const isChampion = [
    EBetHistoryQueryType.UNSETTLED_CHAMPION,
    EBetHistoryQueryType.SETTLED_CHAMPION,
  ].includes(queryType);

  const isEarlySettled = [
    EBetHistoryQueryType.UNSETTLED_EARLY_SETTLEMENT,
    EBetHistoryQueryType.SETTLED_EARLY_SETTLEMENT,
  ].includes(queryType);

  const fbParams: TOrderBetListFbParams = {
    isSettled,
    current: pageNum,
    size: pageSize,
    languageType: FB_LANGUAGE_TYPE.zh,
    // 已结算按结算时间，未结算按下单时间；晒单两类都查近 7 个自然日。
    timeType: isSettled ? EFbOrderQueryTimeType.SettleTime : EFbOrderQueryTimeType.CreateTime,
    ...(isChampion && {
      matchTypes: [EFbMatchType.Outright, EFbMatchType.ESOutright],
    }),
    ...(!!startTime && { startTime: startTime.valueOf() }),
    ...(!!endTime && { endTime: endTime.valueOf() }),
    isCashout: isEarlySettled,
  };

  return fbParams;
};

/** 格式化预约投注记录接口参数 */
export const formatBetHistoryParamsReserveFb = (params: TBetHistoryQueryParams) => {
  const isFailed = params.queryType === EBetHistoryQueryType.RESERVE_FAIL;
  const fbParams: TOrderReserveBetListFbParams = {
    languageType: FB_LANGUAGE_TYPE.zh,
    isFailed,
    // 失败查询必须指定时间范围
    ...(!!isFailed && {
      startTime: dayjs().add(-30, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    }),
  };

  return fbParams;
};

/** 串关总单结算结果：sa（实际派奖）vs sat（本金）派生，只映射 Won/Return/Lost */
const deriveParlaySettleResult = (sa: number = 0, sat: number = 0) => {
  if (sa > sat) return EBetSettleResult.Won;
  if (sa === sat) return EBetSettleResult.Return;
  return EBetSettleResult.Lost;
};

/** FB ops[i].sr (EFbOutcome) → EBetSettleResult */
export const settleResultFormatFb = (
  oItem: TOrderBetListFbRecordItem,
  sr?: EFbOutcome,
): EBetSettleResult => {
  if (oItem.st === EFbOrderStatus.Rejected) {
    return EBetSettleResult.BetFail;
  }
  if (oItem.crl?.length) {
    return EBetSettleResult.EarlySettled;
  }
  switch (sr) {
    case EFbOutcome.NoResulted:
      return EBetSettleResult.NoResulted;
    case EFbOutcome.Return:
      return EBetSettleResult.Return;
    case EFbOutcome.Lost:
      return EBetSettleResult.Lost;
    case EFbOutcome.Won:
      return EBetSettleResult.Won;
    case EFbOutcome.WinReturn:
      return EBetSettleResult.WinReturn;
    case EFbOutcome.LooseReturn:
      return EBetSettleResult.LooseReturn;
    case EFbOutcome.Cancel:
      return EBetSettleResult.Cancel;
    case undefined:
      if (oItem.sert === EFbSeriesType.Parlay) {
        return EBetSettleResult.NoResulted;
      } else {
        return EBetSettleResult.EarlySettled;
      }

    default:
      return EBetSettleResult.NoResulted;
  }
};

const parseBsc = (bsc = ''): Partial<Record<EFbResultTypeGroupRemark, string>> =>
  Object.fromEntries(
    [...bsc.matchAll(/([^:,]+):\s*([^,]+)/g)].map(([, key, val]) => [
      key!.trim() as EFbResultTypeGroupRemark,
      val!.trim(),
    ]),
  );

const getScoreWhileBetting = (
  bItem: Pick<TOrderBetListFbOrderOptionItem, 'bsc' | 'sid' | 'mty'>,
) => {
  let result: string | undefined;
  const { bsc } = bItem;
  const isFootball = bItem.sid === FBCompetitionMap.football.id;
  const parsedBsc = parseBsc(bsc);
  const mainScore = parsedBsc[EFbResultTypeGroupRemark.Score];
  if (isFootball && !_.isEmpty(parsedBsc)) {
    let homeScore = 0;
    let awayScore = 0;
    let hasScore = false;
    _.forEach(parsedBsc, (val) => {
      const [, hs, as] = val?.match(/^(\d+)-(\d+)$/) ?? [];
      if (hs && as) {
        hasScore = true;
        homeScore += +hs;
        awayScore += +as;
      }
    });
    if (hasScore) {
      result = `${homeScore}-${awayScore}`;
    }
  } else {
    result = mainScore;
  }
  return result;
};

export const formatBetHistoryRespFb = ({ data }: { data: TOrderBetListFbData }) => {
  const result: TBetHistoryData = {
    stats: {
      totalOrderCount: data.sts?.[0]?.ct ?? 0,
      totalBetAmount: data.sts?.[0]?.sa ?? 0,
      winOrLoseAmount: data.sts?.[0]?.cwl ?? 0,
    },
    list: data.records.map((oItem) => {
      let orderLabel = '单关';
      let orderCode = '1';
      if (oItem.sert === EFbSeriesType.Parlay) {
        if (oItem.sv) {
          orderLabel = `${oItem.sv}串1`;
          orderCode = `${oItem.sv}001`;
        } else {
          orderLabel = `${oItem.al}串${oItem.bn}`;
          orderCode = `${oItem.al}00${oItem.bn}`;
        }
      }
      const isSettledOrder = [EFbOrderStatus.Rejected, EFbOrderStatus.Settled].includes(oItem.st);
      const isParlay = oItem.sert === EFbSeriesType.Parlay;
      const orderSettleResult = isSettledOrder
        ? isParlay
          ? deriveParlaySettleResult(oItem.sa, oItem.sat)
          : settleResultFormatFb(oItem, oItem.ops[0]?.sr)
        : EBetSettleResult.NoResulted;
      const order: TBetHistoryOrderItem = {
        orderId: oItem.id,
        orderConfirmTime: oItem.cte,
        orderSettleTime: oItem.stm,
        orderBetAmount: oItem.sat + '',
        orderMaxWinAmount: oItem.mla + '',
        orderSettledBackAmount: oItem.sa ? `${oItem.sa}` : '',
        orderCode,
        orderSum: oItem.bn,
        orderStatus: betOrderStatusFormatFb({ st: oItem.st }),
        orderOdds: isParlay
          ? calcParlayOdds(
              oItem.sv,
              oItem.ops.map((op) => op.od),
            )
          : (oItem.ops[0]?.od ?? 0),
        orderLabel,
        isParlayOrder: isParlay,
        isUnsettledOrder: !isSettledOrder,
        isSettledOrder,
        isPreBetOrder: false,
        isEarlySettleOrder: (oItem.crl?.length ?? 0) > 0,
        orderWinLossAmount: +(oItem.uwl || '0'),
        orderSettleResult,
        supportEarlySettle: oItem.co === 1,
        earlySettleTotalStake: oItem.cots,
        earlySettleTotalPayout: oItem.cops,
        earlySettleCurrentPayable: oItem.mla,
        earlySettleRemainingWin: oItem.lwa,
        earlySettleCount: oItem.coc ?? 0,
        earlySettleHistory: (oItem.crl ?? []).map((r) => ({
          id: r.id,
          stake: r.cst,
          payout: r.cops,
        })),
        reserveEarlySettles: (oItem.rcool ?? []).map((r) => ({
          id: r.id,
          status: r.st,
          stake: r.cst,
          payout: r.cops,
        })),
        orderDetails: oItem.ops.map((bItem) => {
          const newBetItem: THistoryBetItem = {
            sportId: bItem.sid + '',
            matchId: bItem.mid + '',
            leagueName: bItem.ln,
            homeName: bItem.te?.[0]?.na ?? '',
            awayName: bItem.te?.[1]?.na ?? '',
            isLive: bItem.ip,
            isChampion: bItem.mtp === EFbMatchType.Outright,
            isSupportHK: false,
            canParlay: false,
            canPreBet: false,
            playName: bItem.mgn,
            playId: `${bItem.mty}_${bItem.pe}`,
            marketId: bItem.mrid + '',
            marketValue: bItem.li,
            betItemShortName: bItem.on,
            betItemFullName: bItem.onm,
            // 跟单/晒单匹配用 `${mrid}_${ty}`（对齐 Flutter playOptionsId）
            betItemId: `${bItem.mrid}_${bItem.ty}`,
            baseOdds: bItem.od,
            matchStartTime: bItem.bt,
            resultScore: bItem.rs || undefined,
            scoreWhileBetting: getScoreWhileBetting(bItem),
            oddsStatus: EOddsStatus.Open,
            orderSettleResult: settleResultFormatFb(oItem, bItem.sr),
            fb: {
              mty: bItem.mty,
              pe: bItem.pe,
              ty: bItem.ty,
              of: bItem.of,
            },
          };
          return newBetItem;
        }),
      };
      return order;
    }),
    current: data.current,
    size: data.size,
    total: data.total,
  };
  return result;
};

export const formatBetHistoryRespReserveFb = ({ data }: { data: TOrderReserveBetListFbData }) => {
  const result: TBetHistoryData = {
    stats: {
      totalOrderCount: data.sts?.[0]?.ct ?? 0,
      totalBetAmount: data.sts?.[0]?.sa ?? 0,
      winOrLoseAmount: 0,
    },
    list: data.ods.map((oItem) => {
      const bItem = oItem.ops[0];
      const order: TBetHistoryOrderItem = {
        orderId: oItem.id,
        orderConfirmTime: oItem.cte,
        orderBetAmount: oItem.sat + '',
        orderMaxWinAmount: bigNB(oItem.sat)
          .times(bItem?.od ?? 0)
          .toFixed(2),
        orderSettledBackAmount: '',
        orderStatus: betOrderStatusFormatReserveFb({ st: oItem.rst }),
        orderOdds: bItem?.od ?? 0,
        orderCode: '1',
        orderSum: 1,
        orderLabel: '单关',
        isParlayOrder: false,
        isUnsettledOrder: false,
        isSettledOrder: false,
        isPreBetOrder: true,
        isManualCancel: oItem.rst === EFbReserveOrderStatus.Cancelled,
        isEarlySettleOrder: false,
        orderWinLossAmount: 0,
        orderSettleResult: EBetSettleResult.NoResulted,
        orderDetails: oItem.ops.map((bItem) => {
          const newBetItem: THistoryBetItem = {
            sportId: bItem.sid + '',
            matchId: bItem.mid + '',
            leagueName: bItem.ln,
            homeName: bItem.te?.[0]?.na ?? '',
            awayName: bItem.te?.[1]?.na ?? '',
            isLive: bItem.ip,
            isChampion: bItem.mtp === EFbMatchType.Outright,
            isSupportHK: false,
            canParlay: false,
            canPreBet: false,
            playName: bItem.mgn,
            playId: `${bItem.mty}_${bItem.pe}`,
            marketId: bItem.mrid + '',
            marketValue: bItem.li ?? '',
            betItemShortName: bItem.on,
            betItemFullName: bItem.onm,
            betItemId: `${bItem.mrid}_${bItem.ty}`,
            baseOdds: bItem.od,
            oddsStatus: EOddsStatus.Open,
            matchStartTime: bItem.bt,
            fb: {
              mty: bItem.mty,
              pe: bItem.pe,
              ty: bItem.ty,
            },
            orderSettleResult: EBetSettleResult.NoResulted,
          };
          return newBetItem;
        }),
      };
      return order;
    }),
    current: 1,
    size: 999,
    total: 999,
  };
  return result;
};

export const acceptOddsPreferFormatFb = ({
  acceptOddsPrefer,
}: {
  acceptOddsPrefer: EAcceptOddsPrefer;
}) => {
  switch (acceptOddsPrefer) {
    case EAcceptOddsPrefer.Any:
      return EFbOddsChangeEnum.Any;
    case EAcceptOddsPrefer.No:
      return EFbOddsChangeEnum.No;
    default:
      return EFbOddsChangeEnum.Better;
  }
};

export const betOrderStatusFormatFb = ({ st }: { st: EFbOrderStatus }) => {
  switch (st) {
    case EFbOrderStatus.Created:
    case EFbOrderStatus.Confirming:
      return EBetOrderStatus.Confirming;
    case EFbOrderStatus.Rejected:
    case EFbOrderStatus.Canceled:
      return EBetOrderStatus.Fail;
    case EFbOrderStatus.Confirmed:
    case EFbOrderStatus.Settled:
      return EBetOrderStatus.Success;
    default:
      return EBetOrderStatus.Fail;
  }
};

export const betOrderStatusFormatReserveFb = ({ st }: { st: EFbReserveOrderStatus }) => {
  switch (st) {
    case EFbReserveOrderStatus.Valid:
    case EFbReserveOrderStatus.Confirming:
      return EBetOrderStatus.Confirming;

    case EFbReserveOrderStatus.Failed:
    case EFbReserveOrderStatus.Cancelled:
      return EBetOrderStatus.Fail;

    case EFbReserveOrderStatus.Successful:
      return EBetOrderStatus.Success;

    default:
      return EBetOrderStatus.Fail;
  }
};

/**
 * 将 fb 的玩法销售状态转换为 common 的投注项状态
 * @param ss fb 的玩法销售状态
 * @returns common 的投注项状态
 */
export const oddsStatusFormatFb = ({ ss }: { ss: EFbMarketCurtSaleStatusEnum }): EOddsStatus => {
  switch (ss) {
    case EFbMarketCurtSaleStatusEnum.Active:
      return EOddsStatus.Open;
    case EFbMarketCurtSaleStatusEnum.Suspended:
      return EOddsStatus.Suspended;
    case EFbMarketCurtSaleStatusEnum.Closed:
      return EOddsStatus.Closed;
    default:
      return EOddsStatus.Closed;
  }
};

/** 让球/让分/让盘盘口：na 为队伍名，nm 为盘口值，展示为 "队伍名 盘口值" */
export function getBetItemFullNameFb({ mksItem, op }: { mksItem: MarketGroup; op: OddsOption }) {
  if (mtyHandicapSet.has(mksItem.mty)) {
    return `${op.na} ${op.nm}`;
  }
  return op.nm.includes(' ') ? op.nm : op.na;
}

export function formatFBChampionItem(
  value: MatchRecord, // 单条数据模型
  pageIndex?: number, // 当前数据请求分页角标
): MatchBaseInfo {
  const sportId: number = value.sid;
  const leagueMap = value.lg || ({} as League);
  const sportName: string = getFBSportNameAndViewId(sportId).name;
  const map: Partial<MatchBaseInfo> = {
    pageIndex: pageIndex || 0, // 当前分页角标
    sportId,
    viewId: getFBSportNameAndViewId(sportId).viewId,
    sportName,
    leagueId: leagueMap['id'],
    leagueName: value.nm,
    leagueLogo: leagueMap['lurl'] || '',
    homeName: '',
    homeLogo: '',
    awayName: '',
    awayLogo: '',
    matchId: value['id'],
    matchNum: value['tms'] ?? 0,
    marketCount: value['tms'] ?? 0,
    matchDate: getFBTime(value['bt']),
    bt: value['bt'],
    animationUrl: '',
    hasVideo: value['vs']?.have,
    isChampion: value['ty'] === 1,
  };

  map['children'] = getFBChampionScoreOdds(value['mg'] ?? [], sportName);
  return map as MatchBaseInfo;
}

// 处理冠军比分赔率
export function getFBChampionScoreOdds(list: MarketGroup[], sportName: string): MatchMarket[] {
  try {
    const data: MatchMarket[] = list?.map((item) => {
      // 比分 map
      const matchMarket: MatchMarket = {
        itemType: `${item.mty}`, // 玩法类型，如 亚盘、大小球等 , see enum: market_type
        name: item.nm, // 玩法名称
        children: item.mks?.map((market) => {
          const betType: BetType = {
            betTypeId: `${market.id}`, // 玩法ID
            betTypeName: market?.li ?? '',
            lists: market.op.map((op) => {
              const betItem: TBaseBetItem = {
                isSupportHK: false,
                canParlay: market.au == 1,
                canPreBet: true,
                playName: item.nm,
                playId: `${item.mty}_${item.pe}`,
                marketId: `${market.id}`,
                marketValue: op.li || '',
                betItemShortName: op.nm || '',
                betItemFullName: op.na || '',
                betItemId: `${market.id}_${op.ty}`,
                baseOdds: op.od,
                oddsStatus: oddsStatusFormatFb({ ss: market.ss }),
                fb: {
                  mty: item.mty,
                  pe: item.pe,
                  ty: op.ty,
                },
                teamIcon: getMatchIcon({
                  teamName: op.nm,
                  sportName: sportName,
                  isLeague: false,
                }),
                // type: `${op.ty}`,
                // betItemName: op.nm,
                // betItemType: `${op.ty}`,
                // marketValue: op.li || '',
                // odds: op.od?.toString() || '0',
                // betItemStatus: market.ss !== 1 ? 2 : 1,
                // betItemId: `${market.id}_${op.ty}`,
                // oddsType: `${op.odt}`,
                // marketId: `${market.id}`,
                // isSupportHK: false,
                // oddsEU: getFBOdds(op.od, false),
                // oddsHK: getFBOdds(op.od, true),
                // placeNum: market?.mbl ?? 0,
                // isSupportCombo: 0,
                // matchType: 1,
              };
              return betItem;
            }),
          };

          return betType;
        }),
      };
      return matchMarket;
    });

    return data;
  } catch (e) {
    console.error(e, 'getFBChampionScoreOdds error:');
    return [];
  }
}

function utf8Encode(str: string): Uint8Array {
  if (!str) return new Uint8Array(0);
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * 等价于 Dart 的 md5.convert：字节数组转 MD5 字符串
 * @param bytes UTF-8 字节数组
 * @returns 32 位小写十六进制 MD5 字符串
 */
function md5Convert(bytes: Uint8Array | number[]): string {
  const wordArray: WordArray = CryptoJS.lib.WordArray.create(bytes);
  const md5Hash: string = CryptoJS.MD5(wordArray).toString();
  return md5Hash;
}

// 获取赛事icon
function getMatchIcon({
  teamName, // 队伍名称
  sportName, // 赛种名称
  isLeague = false,
}: {
  teamName: string;
  sportName: string;
  isLeague: boolean;
}): string {
  // 如果队伍名称不存在
  if (!teamName) {
    return '';
  }
  // 图片域名
  const domain: string = 'https://logo.wbtgf.com/';
  // 图片路径

  const imgUrl: string = md5Convert(utf8Encode(`${teamName}${sportName}Yncdb2U8Ncd24Udyt3`));

  return `${domain}${domain.endsWith('/') ? '' : '/'}bti/${isLeague ? 'matchevent' : 'teamlist'}/${imgUrl}.png`;
}

/**
 * 获取字符串首字母拼音
 * @param str 输入的中文字符串
 * @returns 首字母拼音（大写）
 */
export function getFirstLetterPinyin(str: string): string {
  if (!str) return '';

  try {
    // 轻量拼音转换，直接取拼音首字母（如: "中国" => "ZG"）
    const firstLetters = Pinyin.convertToPinyin(str, '', true).toUpperCase();

    return firstLetters;
  } catch (error) {
    console.error('获取拼音失败:', error);
    return '';
  }
}

export function formatFBLeagueGroup(list: LeagueRecord[]): LeagueGroup[] {
  // 名称分组
  const map: { [key: string]: LeagueItem[] } = {};
  // 按名称分组
  list.forEach((record: LeagueRecord) => {
    const name = record.rnm;
    if (!map[name]) {
      map[name] = [];
    }
    const leagueItem: LeagueItem = {
      sportId: record.sid,
      id: record.id,
      name: record.na,
      icon: record.lurl,
      hot: record.hot,
      mt: record.mt,
      or: record.or,
      rid: record.rid,
      rnm: record.rnm,
    };
    map[name].push(leagueItem);
  });

  const result: LeagueGroup[] = [];
  Object.keys(map).forEach((key) => {
    const firstWord = getFirstLetterPinyin(key);
    const spell: string = firstWord[0]?.toUpperCase() ?? '';
    const leagueGroup: LeagueGroup = {
      spell: spell,
      name: key,
      isCollapsed: false,
      list: map[key] ?? [],
    };

    result.push(leagueGroup);
  });

  // 排序
  result.sort((a, b) => {
    if (a.spell < b.spell) {
      return -1;
    }
    if (a.spell > b.spell) {
      return 1;
    }
    return 0;
  });

  return result;
}

/**特殊球种比分处理 */
export function getSpecialSportScore(sportId: number, score: number): number | string {
  if (sportId === FBSportIds.Tennis) {
    // 网球40比40后，其中一方先到50就代表A（advantage）
    return score === 50 ? 'A' : score;
  }
  return score;
}
