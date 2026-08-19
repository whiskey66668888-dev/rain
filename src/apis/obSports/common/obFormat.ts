import type {
  MatchBaseInfo,
  MatchMarket,
  MenuInfo,
  Menues,
  TBaseBetItem,
} from '@/apis/commonSports/types';
import type { LeagueGroup, LeagueItem } from '@/apis/fbSports/common/types';
import { BasicMultiple, EOddsStatus, PlayType } from '@/apis/commonSports/constants';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type {
  HPSItem,
  LocalHandicapItem,
  MatchRecord,
  OBFilterMatchGroup,
  OBMenuListResponse,
  OLRes,
} from './types';
import {
  DefaultPlayTypes,
  OB_CHAMPION_BALL_IDS,
  OB_MAIN_BALL_IDS,
  OBCompetitionMap,
  obList,
} from './constants';
import { obSportsStatusMap } from './constants/matchPeriod';

import dayjs from 'dayjs';
import { bigNB } from '@/utils/bet/bigMath';

/**
 * OB initPB → 统一 MenuInfo
 * 对齐 Flutter：一级按 menuId（400/402/403/406）；二级按本地球种顺序 + field1，count>0
 */
export function formatMenuList(resList: OBMenuListResponse[]): MenuInfo {
  const menus: Menues = {
    [PlayType.Living]: [],
    [PlayType.Today]: [],
    [PlayType.Early]: [],
    [PlayType.Follow]: [],
    [PlayType.Champion]: [],
  };

  const playTypes = DefaultPlayTypes.map((item) => ({
    type: item.type,
    typeId: item.typeId,
    name: item.name,
    count: 0,
  }));

  // menuId → 一级节点，避免每个玩法都扫一遍
  const menuById = new Map<string, OBMenuListResponse>();
  for (const node of resList) {
    menuById.set(String(node.menuId), node);
  }

  DefaultPlayTypes.forEach((playTypeDef, index) => {
    const item = menuById.get(playTypeDef.menuId);
    const playTypeItem = playTypes[index];
    if (!item?.subList?.length || !playTypeItem) return;

    const allowSportIds: number[] =
      playTypeDef.type === PlayType.Champion ? OB_CHAMPION_BALL_IDS : OB_MAIN_BALL_IDS;

    // field1 → 二级节点，按本地球种顺序 O(n) 组装
    const subBySportId = new Map<string, OBMenuListResponse>();
    for (const sub of item.subList) {
      if (sub.field1 != null && sub.field1 !== '') {
        subBySportId.set(String(sub.field1), sub);
      }
    }

    const subList = allowSportIds.flatMap((sportId) => {
      const raw = subBySportId.get(String(sportId));
      const count = raw?.count ?? 0;
      if (!raw || count <= 0) return [];
      const { name, viewId } = getOBSportNameAndViewId(String(sportId));
      if (!name) return [];
      return [
        {
          sportId,
          count,
          name,
          viewId,
          // Flutter: curr.setSportId('${data.menuId}') —— 列表请求 euid
          menuId: String(raw.menuId ?? ''),
        },
      ];
    });

    menus[playTypeDef.type] = subList;
    playTypeItem.count = subList.reduce((total, cur) => total + cur.count, 0);
  });

  return {
    hotSportMatchIds: [],
    menus,
    playTypes,
  };
}

/**
 * 终局状态码（跨球种一致，见 obSportsStatusMap）：
 * 100/990 全场结束·完赛、999 比赛结束、120 点球大战结束。
 * 注意 301/302/303/110 是「某一节/加时结束」的中间态，不算完场。
 */
const OB_ENDED_MATCH_STATUS = ['100', '990', '999', '120'];

/**
 * 根据独赢/让球规则计算队名加粗方（对齐 FB getBoldTeamFromMg）
 * 规则1：有独赢赔率时，胜赔低的一方加粗
 * 规则2：无独赢时看让球，谁让球谁加粗；平手盘则水位低的一方加粗
 * 规则3：都无法判断时左边（主队）加粗
 */
function getBoldTeamFromObChildren(children: MatchMarket[] | null | undefined): 'home' | 'away' {
  const markets = children ?? [];

  // 规则1：独赢
  for (const market of markets) {
    if (market.name !== '独赢') continue;
    const lists = market.children?.[0]?.lists ?? [];
    const home = lists[0];
    // 三栏：主/和/客；两栏：主/客
    const away = lists.length >= 3 ? lists[2] : lists[1];
    const homeOdds = home?.baseOdds ?? 0;
    const awayOdds = away?.baseOdds ?? 0;
    if (homeOdds > 0 && awayOdds > 0) {
      return homeOdds < awayOdds ? 'home' : 'away';
    }
  }

  // 规则2：让球
  for (const market of markets) {
    if (market.name !== '让球') continue;
    const lists = market.children?.[0]?.lists ?? [];
    const home = lists[0];
    const away = lists[1];
    if (!home || !away || home.baseOdds <= 0 || away.baseOdds <= 0) continue;
    const parseLine = (item: TBaseBetItem) => {
      const raw = String(item.marketValue || item.betItemShortName || '0');
      const n = Number.parseFloat(raw.replace(/[^\d.+-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    };
    const lineHome = parseLine(home);
    const lineAway = parseLine(away);
    if (lineHome !== 0 || lineAway !== 0) {
      if (lineHome < 0) return 'home';
      if (lineAway < 0) return 'away';
    }
    return home.baseOdds < away.baseOdds ? 'home' : 'away';
  }

  return 'home';
}

/** 将 OB 原始赛事转为统一 MatchBaseInfo（含列表盘口 children） */
export function formatOBSportItem(value: MatchRecord, pageIndex = 1): MatchBaseInfo {
  const sportIdStr = `${value.csid ?? ''}`;
  const sportId = Number(sportIdStr) || 0;
  const mmp = `${value.mmp ?? 0}`;
  const { name, viewId } = getOBSportNameAndViewId(sportIdStr);
  const isFootball = sportIdStr === OBCompetitionMap.football.id.toString();
  const matchId = `${value.mid ?? ''}`;

  const map: Partial<MatchBaseInfo> = {
    pageIndex,
    viewId,
    sportId,
    sportName: value.csna || name,
    leagueId: Number(value.tid) || 0,
    leagueName: value.tn ?? '',
    leagueLogo: iconFromLu(value.lurl ? [value.lurl] : undefined),
    homeName: value.mhn ?? '',
    homeLogo: iconFromLu(value.mhlu),
    awayName: value.man ?? '',
    awayLogo: iconFromLu(value.malu),
    matchId: String(value.mid ?? ''),
    matchNum: value.mc ?? 0,
    marketCount: value.mc ?? 0,
    matchDate: getOBTime(value.mgt),
    bt: Number(value.mgt) || 0,
    isLive: mmp !== '0',
    isChampion: false,
    canPreBet: false,
    children: getOBScoreOdds({ sportId, list: value.hps, matchId }),
    matchStatusId: Number(mmp) || 0,
    matchPeriod: '',
    periodName: getOBMatchStatus({ sportId: sportIdStr, mmp, mct: `${value.mct ?? 0}` }),
    // OB 完场后 mmp 不会翻 0（isLive 仍为 true），只能靠终局状态码区分
    isEnded: OB_ENDED_MATCH_STATUS.includes(mmp),
    matchTime: Number(value.mst) || 0,
    clockType: 'ASC',
    score: '',
    firstHalfScore: '',
    halfTimeScore: '',
    scoreAll: [],
  };

  if (isFootball) {
    map.isCountdown = ['6', '7', '41', '42', '50'].includes(mmp);
  }

  if (
    (isFootball && mmp === '31') ||
    (sportIdStr === OBCompetitionMap.basketball.id.toString() && mmp === '31')
  ) {
    map.matchTime = 0;
  }

  const scoreData = getOBScoreBySportId({
    sportId: sportIdStr,
    matchStatusId: mmp,
    list: value.msc ?? [],
  });

  if (sportIdStr === OBCompetitionMap.tennis.id.toString()) {
    map.tennisHomeScore = scoreData.home;
    map.tennisAwayScore = scoreData.away;
    map.homeScore = Number(scoreData.home === 'A' ? '50' : scoreData.home) || 0;
    map.awayScore = Number(scoreData.away === 'A' ? '50' : scoreData.away) || 0;
  } else {
    map.homeScore = Number(scoreData.home) || 0;
    map.awayScore = Number(scoreData.away) || 0;
  }

  const detailScore = getOBScoreBySportId({
    sportId: sportIdStr,
    matchStatusId: mmp,
    list: value.msc ?? [],
    isHandleTennis: false,
  });
  map.detailHomeScore = Number(detailScore.home) || 0;
  map.detailAwayScore = Number(detailScore.away) || 0;

  if (isFootball) {
    const redCard = getObScoreByType({ type: 'S11', list: value.msc ?? [] });
    const yellowCard = getObScoreByType({ type: 'S12', list: value.msc ?? [] });
    const corner = getObScoreByType({ type: 'S5', list: value.msc ?? [] });
    map.homeRedCard = Number(redCard.home) || 0;
    map.awayRedCard = Number(redCard.away) || 0;
    map.homeYellowCard = Number(yellowCard.home) || 0;
    map.awayYellowCard = Number(yellowCard.away) || 0;
    map.homeCornerKick = Number(corner.home) || 0;
    map.awayCornerKick = Number(corner.away) || 0;

    const showHalf = ['7', '42', '31', '33'].includes(mmp);
    const half = showHalf ? getObHalfScore({ type: 'S2', list: value.msc ?? [] }) : '';
    map.halfTimeScore = half;
    map.firstHalfScore = half;
  }

  map.score = `${map.homeScore ?? 0}-${map.awayScore ?? 0}`;
  map.scoreAll = getOBScoreAll(value, sportIdStr);
  // 队名加粗本地兜底（对齐 FB getBoldTeamFromMg）；主列表 / Banner 还会被初盘 winner 覆盖
  map.nameBold = getBoldTeamFromObChildren(map.children ?? []);

  return map as MatchBaseInfo;
}

/** OB 冠军单条 → MatchBaseInfo（对齐 Flutter formatOBChampionItem） */
export function formatOBChampionItem(value: MatchRecord, pageIndex = 1): MatchBaseInfo {
  const sportIdStr = `${value.csid ?? ''}`;
  const sportId = Number(sportIdStr) || 0;
  const { name, viewId } = getOBSportNameAndViewId(sportIdStr);
  const hps = value.hps ?? [];
  let matchDate = getOBTime(value.mgt);
  const hmed = hps[0]?.hmed;
  if (hmed) {
    matchDate = getOBChampionTime(hmed);
  }

  console.log('formatOBChampionItem:', value);
  return {
    pageIndex,
    viewId,
    sportId,
    sportName: value.csna || name,
    leagueId: Number(value.tid) || 0,
    leagueName: value.onTn ?? value.tn ?? '',
    leagueLogo: iconFromLu(value.lurl ? [value.lurl] : undefined),
    homeName: '',
    homeLogo: '',
    awayName: '',
    awayLogo: '',
    matchId: String(value.mid ?? ''),
    matchNum: 0,
    marketCount: hps.length,
    matchDate,
    bt: Number(value.mgt) || 0,
    isLive: false,
    isChampion: true,
    canPreBet: false,
    children: getOBChampionScoreOdds(hps),
    matchStatusId: 0,
    matchStatus: '',
    matchPeriod: '',
    periodName: '',
    matchTime: 0,
    isCountdown: false,
    clockType: 'ASC',
    score: '',
    firstHalfScore: '',
    halfTimeScore: '',
    scoreAll: [],
    homeScore: 0,
    awayScore: 0,
    detailHomeScore: 0,
    detailAwayScore: 0,
  };
}

/**
 * 投注项落槽：对齐 Flutter
 * - 列表 getOBScoreOdds：ots=T1/T2，ots 空时用 ot=Over/Under
 * - 详情 formatHandicap：ot=1/2/Over/Under/X（详情半场常只有 ot、ots 为空）
 */
type ObOlSlot = 'home' | 'away' | 'draw' | 'over' | 'under' | 'other';

function resolveObOlSlot(hlValue: OLRes): ObOlSlot {
  const ots = `${hlValue.ots ?? ''}`.trim();
  const ot = `${hlValue.ot ?? ''}`.trim();
  const otLower = ot.toLowerCase();

  if (ots === 'T1' || ot === '1') return 'home';
  if (ots === 'T2' || ot === '2') return 'away';
  if (otLower === 'over') return 'over';
  if (otLower === 'under') return 'under';
  // 独赢平局：ot=X / ots 非 T1T2
  if (otLower === 'x' || ot === 'X') return 'draw';
  if (!ots && !ot) return 'other';
  if (ots && ots !== 'T1' && ots !== 'T2') return 'draw';
  return 'other';
}

function applyWinLabel(betItem: TBaseBetItem, label: '主' | '和' | '客') {
  betItem.betItemShortName = label;
  betItem.betItemFullName = label;
  betItem.marketValue = label;
}

/** 对齐 Flutter odds_blue_slider._cleanHalfHandicap */
function cleanHalfHandicapLabel(betItem: TBaseBetItem) {
  const raw = `${betItem.betItemShortName ?? ''}`.trim();
  const cleaned = raw
    .replace(/^(主|客)\s*/, '')
    .replace(/\s*(主|客)$/, '')
    .replace(/^[：:]\s*/, '')
    .replace(/\s*[：:\-–—]$/, '')
    .trim();
  betItem.betItemShortName = cleaned;
  betItem.betItemFullName = cleaned;
  betItem.marketValue = cleaned;
}

/**
 * 列表盘口：本地玩法列 × hps（对齐 Flutter getOBScoreOdds 非电竞路径）
 * itemType = hpid，供 OddList 按 idList 匹配
 * 详情补盘也走此函数时，必须同时认 ot（详情常用）与 ots（列表常用）
 */
export function getOBScoreOdds({
  sportId,
  list,
  matchId,
}: {
  sportId: number;
  list?: HPSItem[] | null;
  matchId: string;
}): MatchMarket[] {
  try {
    const scoreList = getOBSportList(sportId);
    const hpsList = list ?? [];
    const data: MatchMarket[] = [];

    scoreList.forEach((item) => {
      const type = String(item.idList[0] ?? '');
      const isThree = item.row === 3;
      // 对齐 Flutter 列表：name==独赢；半场独赢同样三列主和客
      const isWin = item.name === '独赢' || item.name === '半场独赢';
      const result = findHpsByPlayId(hpsList, type, item.name);
      const supportHandicap = `${result?.hsw ?? ''}`.split(',');
      const isSupportHK = supportHandicap.includes('2');
      const slotCount = isThree ? 3 : 2;
      const lists: TBaseBetItem[] = Array.from({ length: slotCount }, (_, i) =>
        createEmptyObBetItem(type, i),
      );

      const hlList = result?.hl ?? [];
      const hlData = hlList[0];
      if (result && hlData?.ol?.length) {
        for (const hlValue of hlData.ol) {
          const betItem = buildObBetItem({
            hlValue,
            hlData,
            result,
            isSupportHK,
            matchId,
            playId: type,
            playName: result.hpn || item.name,
          });

          const slot = resolveObOlSlot(hlValue);
          if (slot === 'over') {
            lists[0] = betItem;
            continue;
          }
          if (slot === 'under') {
            lists[1] = betItem;
            continue;
          }
          if (slot === 'home') {
            if (isWin) applyWinLabel(betItem, '主');
            // 对齐 Flutter _cleanHalfHandicap：半场让球去掉主/客前后缀
            if (item.name === '半场让球') cleanHalfHandicapLabel(betItem);
            lists[0] = betItem;
            continue;
          }
          if (slot === 'away') {
            if (isWin) applyWinLabel(betItem, '客');
            if (item.name === '半场让球') cleanHalfHandicapLabel(betItem);
            lists[isThree ? 2 : 1] = betItem;
            continue;
          }
          // 平局 / 其它（对齐 Flutter：非 T1/T2 进中间位）
          if (isWin) applyWinLabel(betItem, '和');
          lists[1] = betItem;
        }
      }

      data.push({
        itemType: type,
        name: item.name,
        children: [
          {
            betTypeId: String(result?.mid ?? type),
            betTypeName: result?.hpn || item.name,
            lists,
          },
        ],
      });
    });

    return data;
  } catch {
    return [];
  }
}

/**
 * 半场等：优先 hpid；对不上再用 hpn
 * - 普通玩法：精确匹配（避免「独赢」误匹配「独赢 & 大/小」）
 * - 网球详情 token（TNS_*）：includes 匹配（对齐 Flutter _containsAny）
 */
const OB_PLAY_NAME_ALIASES: Record<string, string[]> = {
  '4': ['让球', '全场让球', '亚洲让球'],
  '2': ['大小', '大/小', '全场大小'],
  '1': ['独赢', '全场独赢'],
  '114': ['角球大小', '角球：大小', '角球：大/小', '角球'],
  '19': ['上半场让球', '半场让球'],
  '18': ['上半场大小', '上半场大/小', '半场大小'],
  '17': ['上半场独赢', '半场独赢'],
  '122': ['上半场角球大小', '上半场角球：大/小', '半场角球'],
  // 网球详情第 2 页（对齐 Flutter kMarketTokens ob TNS_GAME_*）
  TNS_GAME_HDP: ['全场让局', '让局'],
  TNS_GAME_OU: ['总局数', '总盘数', '局大小'],
};

function findHpsByPlayId(
  hpsList: HPSItem[],
  playId: string,
  localName: string,
): HPSItem | undefined {
  const byId = hpsList.find((v) => String(v.hpid) === playId);
  if (byId) return byId;
  const aliases = OB_PLAY_NAME_ALIASES[playId] ?? [localName];
  const looseNameMatch = playId.startsWith('TNS_');
  return hpsList.find((v) => {
    const hpn = `${v.hpn ?? ''}`.trim();
    return aliases.some((alias) => (looseNameMatch ? hpn.includes(alias) : hpn === alias));
  });
}

/** 冠军盘口（对齐 Flutter getOBChampionScoreOdds） */
export function getOBChampionScoreOdds(list: HPSItem[] | null | undefined): MatchMarket[] {
  if (!list?.length) return [];
  try {
    return list.map((value) => {
      const playId = String(value.hpid ?? '');
      const ol = value.ol ?? [];

      return {
        itemType: playId,
        name: `${value.hps ?? ''}`,
        children: ol.map((hlValue) => {
          const handicap = `${hlValue.on ?? ''}`;
          const ot = `${hlValue.ot ?? ''}`;
          const oid = `${hlValue.oid ?? ''}`;
          const placeNum = 0;

          return {
            betTypeId: String(value.mid ?? playId),
            betTypeName: `${value.hps ?? ''}`,
            lists: [
              {
                isSupportHK: false,
                canParlay: false,
                canPreBet: false,
                playName: `${value.hps ?? ''}`,
                playId,
                marketId: `${value.hid ?? ''}`,
                marketValue: handicap,
                betItemShortName: handicap,
                betItemFullName: handicap,
                betItemId: `${value.mid ?? ''}_${playId}_${placeNum}_${ot}`,
                baseOdds: getOBOddsValue(hlValue.ov),
                oddsStatus: EOddsStatus.Open,
                ob: {
                  hmt: 0,
                  placeNum,
                  oid,
                  ot,
                },
              },
            ],
          };
        }),
      };
    });
  } catch {
    return [];
  }
}

export function getOBSportList(sportId: number): LocalHandicapItem[] {
  return obList.find((v) => v.id === sportId)?.list ?? [];
}

function getOBOddsValue(ov: number) {
  // 对齐 Flutter getOBOdds：ov/100000（欧盘），港盘再 -1；展示截断不四舍五入（numberToFixed）
  return bigNB(ov || 0)
    .div(BasicMultiple.ObOdds)
    .toNumber();
}

function asObInt(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function createEmptyObBetItem(playId: string, idx: number): TBaseBetItem {
  return {
    isSupportHK: false,
    canParlay: false,
    canPreBet: false,
    playName: '',
    playId,
    marketId: '',
    marketValue: '',
    betItemShortName: '',
    betItemFullName: '',
    betItemId: `${playId}_empty_${idx}`,
    baseOdds: 0,
    oddsStatus: EOddsStatus.Closed,
  };
}

function buildObBetItem({
  hlValue,
  hlData,
  result,
  isSupportHK,
  matchId,
  playId,
  playName,
}: {
  hlValue: OLRes;
  hlData: NonNullable<HPSItem['hl']>[number];
  result: HPSItem;
  isSupportHK: boolean;
  matchId: string;
  playId: string;
  playName: string;
}): TBaseBetItem {
  const ot = `${hlValue.ot ?? ''}`;
  const oid = `${hlValue.oid ?? ''}`;
  const placeNum = asObInt(hlData.hn, 0);
  const handicap = `${hlValue.onb ?? hlValue.on ?? ''}`.trim();
  // hs 锁整盘，os!=1 锁单项；必须 Number 比较（解密后可能是字符串）
  const hs = asObInt(hlData.hs, 0);
  const os = asObInt(hlValue.os, 0);
  const locked = hs !== 0 || os !== 1;

  return {
    isSupportHK,
    canParlay: asObInt(result.hids, 0) === 1,
    // 列表拿不到，查询最新盘口信息获取
    canPreBet: false,
    playName,
    playId,
    marketId: `${hlData.hid ?? ''}`,
    marketValue: handicap,
    betItemShortName: handicap,
    betItemFullName: handicap,
    // mid + hpid + hn + ot
    betItemId: `${matchId}_${playId}_${placeNum}_${ot}`,
    baseOdds: getOBOddsValue(hlValue.ov),
    oddsStatus: locked ? EOddsStatus.Suspended : EOddsStatus.Open,
    ob: {
      hmt: asObInt(hlData.hmt, 0),
      placeNum,
      oid,
      ot,
    },
  };
}

function getOBChampionTime(time: string): string {
  try {
    return dayjs(time).format('YYYY-MM-DD HH:mm');
  } catch {
    return '';
  }
}

export function getOBTime(time: string): string {
  try {
    return dayjs(Number(time)).format('MM-DD HH:mm');
  } catch {
    return '';
  }
}

export function getObHalfScore({ type, list }: { type: string; list: string[] }): string {
  try {
    const str = list.find((v) => v.startsWith(`${type}|`)) ?? '';
    return str.split('|')[1]?.replace(':', '-') || '';
  } catch {
    return '';
  }
}

export function getOBSportNameAndViewId(id: string): { name: string; viewId: number } {
  const item = obList.find((v) => v.id.toString() === id);
  return item ? { name: item.label, viewId: item.viewId } : { name: '', viewId: 0 };
}

export function getOBScoreBySportId({
  sportId,
  matchStatusId,
  list,
  isHandleTennis = true,
}: {
  sportId: string;
  matchStatusId: string;
  list: string[];
  isHandleTennis?: boolean;
}): Record<'home' | 'away', string> {
  if (sportId === OBCompetitionMap.pingPong.id.toString()) {
    return getObScoreByType({ type: 'S1110', list });
  }
  if (sportId === OBCompetitionMap.tennis.id.toString() && isHandleTennis) {
    return getObScoreByType({ type: 'S103', list });
  }
  if (sportId === OBCompetitionMap.football.id.toString()) {
    if (matchStatusId === '41' || matchStatusId === '42') {
      return getObScoreByType({ type: 'S7', list });
    }
  }
  return getObScoreByType({ type: 'S1', list });
}

export function getOBScoreAll(value: MatchRecord, sportId: string): string[] {
  try {
    if (sportId === OBCompetitionMap.tennis.id.toString()) {
      return getScoreAll(value.msc ?? [], false);
    }
    if (sportId === OBCompetitionMap.basketball.id.toString()) {
      return getScoreAll(value.msc ?? [], true);
    }
    if (value.mft !== 0) {
      return getScoreTotal(120, value.mft, value.msc ?? []);
    }
    return [];
  } catch {
    return [];
  }
}

export function getOBMatchStatus({
  sportId,
  mmp,
  mct,
}: {
  sportId: string;
  mmp?: string;
  mct?: string;
}): string {
  try {
    if (sportId === OBCompetitionMap.snooker.id.toString()) {
      if (mct === '0') return '进行中';
      return `第${mct}局`;
    }
    return obSportsStatusMap[sportId]?.[mmp ?? '-1'] ?? '进行中';
  } catch {
    return '进行中';
  }
}

function iconFromLu(lu?: string[]): string {
  const imgDomain = getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.imgDomain;
  const join = (path: string) => (path.startsWith('http') ? path : `${imgDomain ?? ''}/${path}`);
  const first = lu?.[0];
  return first ? join(first) : '';
}

function getObScoreByType({ type, list }: { type: string; list: string[] }) {
  const data = { home: '0', away: '0' };
  try {
    const str = list.find((v) => v.startsWith(`${type}|`)) ?? '';
    const parts = (str.split('|')[1] ?? '').split(':');
    data.home = parts[0] ?? '0';
    data.away = parts[1] ?? '0';
  } catch {
    // ignore
  }
  return data;
}

function getScoreTotal(indexStart: number, total: number, scores: string[]): string[] {
  const list: string[] = [];
  for (let i = indexStart; i < indexStart + total; i++) {
    const score = getObScoreByType({ type: `S${i}`, list: scores });
    if (score.home && score.away) {
      list.push(`${score.home}-${score.away}`);
    }
  }
  return list;
}

function getScoreAll(list: string[], isBasketball: boolean): string[] {
  if (!list.length) return [];

  if (isBasketball) {
    const keys = ['S19', 'S20', 'S21', 'S22'] as const;
    const quarter: Partial<Record<(typeof keys)[number], string>> = {};
    for (const item of list) {
      const [key, value = ''] = item.split('|', 2);
      if (keys.includes(key as (typeof keys)[number])) {
        quarter[key as (typeof keys)[number]] = value;
      }
    }
    return keys
      .map((key) => {
        const score = quarter[key];
        if (!score) return null;
        const [a = '0', b = '0'] = score.split(':');
        return `${a}-${b}`;
      })
      .filter((v): v is string => !!v);
  }

  const tennisKeys = ['S23', 'S39', 'S55', 'S71', 'S87'] as const;
  const result: string[] = [];
  for (const item of list) {
    const [key, value = ''] = item.split('|', 2);
    if (key && (tennisKeys as readonly string[]).includes(key)) {
      const [a = '0', b = '0'] = value.split(':');
      result.push(`${a}-${b}`);
    }
  }
  return result;
}

/**
 * 解析联赛 id（对齐 Flutter obj.id；缺省 tournamentId）
 * - 安全整数 → number（兼容现有 FB/UI）
 * - 超长数字串 → 保留原始 string，避免 tid 精度丢失（Flutter Dart int 无此问题）
 */
function parseObTournamentId(obj: {
  id?: string | number | null;
  tournamentId?: string | number | null;
}): number | string | null {
  const raw = obj.id ?? obj.tournamentId;
  if (raw == null || raw === '') return null;
  const idStr = String(raw).trim();
  if (!idStr || idStr === '0') return null;
  if (!/^\d+$/.test(idStr)) return null;
  const id = Number(idStr);
  if (Number.isSafeInteger(id) && String(id) === idStr) return id;
  return idStr;
}

/**
 * OB getFilterMatchListPB → 统一 LeagueGroup
 * 对齐 Flutter getOBLeagueList：HOT→热，热门组置顶，icon 拼 imgDomain
 */
export function formatOBLeagueGroup(list: OBFilterMatchGroup[]): LeagueGroup[] {
  const imgDomain =
    getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.imgDomain ?? '';
  const joinIcon = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${imgDomain}/${path}`;
  };

  const groups: LeagueGroup[] = [];
  for (const item of list) {
    const spell = String(item.spell ?? '').replace(/HOT/g, '热');
    const regionName = String(item.introduction ?? '');
    const leagues: LeagueItem[] = [];

    for (const sport of item.sportVOs ?? []) {
      for (const obj of sport.tournamentList ?? []) {
        const id = parseObTournamentId(obj);
        if (id == null) continue;
        leagues.push({
          sportId: Number(obj.sportId) || 0,
          id,
          name: String(obj.nameText ?? '').trim(),
          icon: joinIcon(obj.picUrlthumb),
          hot: spell === '热' || Number(obj.hotStatus) === 1,
          mt: Number(obj.num) || 0,
          or: Number(obj.tournamentLevel) || 0,
          rid: Number(obj.regionId) || 0,
          rnm: regionName,
        });
      }
    }

    if (!leagues.length) continue;
    groups.push({
      spell,
      name: regionName,
      isCollapsed: false,
      list: leagues,
    });
  }

  groups.sort((a, b) => {
    if (a.spell === '热') return -1;
    if (b.spell === '热') return 1;
    if (a.spell < b.spell) return -1;
    if (a.spell > b.spell) return 1;
    return 0;
  });

  return groups;
}
