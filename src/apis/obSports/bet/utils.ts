import {
  BasicMultiple,
  EAcceptOddsPrefer,
  EOddsStatus,
  EOddsType,
} from '@/apis/commonSports/constants';
import type { TBetItem } from '@/apis/commonSports/types';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { bigNB } from '@/utils/bet/bigMath';

import {
  EObAcceptOdds,
  EObMarketTypeFinally,
  EObMatchType,
  EObOpenMiltSingle,
  OB_DEVICE_TYPE,
  OB_ESPORT_SPORT_IDS,
  OB_LOCKED_HANDICAP_STATUS,
  OB_ODDS_STATUS_SUSPENDED,
} from './constants';
import { OBCompetitionMap } from '../common/constants';
import type { TObBetMoneyReqItem, TObLatestMarketRespItem, TObOrderDetailParam } from './types';

/** 是否 OB 电竞球种（对齐 Flutter isOBESport） */
export const isObESport = (sportId: string | number) => OB_ESPORT_SPORT_IDS.includes(`${sportId}`);

/**
 * 赛事类型标识（传错会直接导致投注失败）。
 * 冠军固定 3、电竞固定 5；早盘/滚球按官方口径取 hl.hmt（1-早盘 0-滚球），
 * 但 hmt 缺省值同样是 0，所以再用「赛事是否进行中」兜底，避免未开赛赛事被当成滚球。
 */
export const getObMatchType = (betItem: TBetItem): EObMatchType => {
  if (betItem.isChampion) return EObMatchType.Champion;
  if (isObESport(betItem.sportId)) return EObMatchType.ESport;
  if (betItem.ob?.hmt === 1) return EObMatchType.Early;
  return betItem.isLive ? EObMatchType.Live : EObMatchType.Early;
};

/** 展示用赔率 → OB 原始赔率（欧赔 × 100000），投注参数 odds 用它 */
export const toObRawOdds = (baseOdds: number) =>
  +bigNB(baseOdds || 0)
    .times(BasicMultiple.ObOdds)
    .toFixed(0);

/** OB 原始赔率 → 欧赔 */
export const fromObRawOdds = (oddsValue: number) =>
  bigNB(oddsValue || 0)
    .div(BasicMultiple.ObOdds)
    .toNumber();

/**
 * 投注参数 oddFinally：最终赔率的展示值。
 * 对齐 Flutter getOBOdds —— 香港盘 = 欧盘 − 1，电竞保留 3 位、其余 2 位，一律截断不进位。
 */
export const getObOddFinally = ({
  baseOdds,
  isSupportHK,
  isESport,
}: {
  baseOdds: number;
  isSupportHK: boolean;
  isESport: boolean;
}) =>
  bigNB(baseOdds || 0)
    .minus(isSupportHK ? 1 : 0)
    .toFixed(isESport ? 3 : 2);

/** 当前生效盘口是否香港盘（FB 场馆恒为欧洲盘，由 store 派生值保证） */
export const isCurrentHKOdds = () =>
  getGlobalStoreForApiRequest().getState().sport.currentOddsType === EOddsType.HK;

/**
 * 单个投注项最终使用的盘口类型：
 * 需同时满足「用户选了香港盘」+「该投注项支持香港盘」；串关只支持欧洲盘。
 */
export const getObMarketTypeFinally = ({
  betItem,
  isParlay,
}: {
  betItem: TBetItem;
  isParlay: boolean;
}) =>
  !isParlay && betItem.isSupportHK && isCurrentHKOdds()
    ? EObMarketTypeFinally.HK
    : EObMarketTypeFinally.EU;

/** 接受赔率偏好 → OB useAcceptOdds */
export const acceptOddsPreferFormatOb = (acceptOddsPrefer: EAcceptOddsPrefer) => {
  switch (acceptOddsPrefer) {
    case EAcceptOddsPrefer.No:
      return EObAcceptOdds.No;
    case EAcceptOddsPrefer.Any:
      return EObAcceptOdds.Any;
    default:
      return EObAcceptOdds.Better;
  }
};

/**
 * 盘口状态 → 投注项状态。
 * 对齐 Flutter getOBMarketStatusId：赛事结束(mo)、赛事级别开关(mhs)、盘口状态(hs)、投注项状态(os)
 * 任意一级不可投注即视为封盘。
 */
export const getObOddsStatus = (
  marketData: TObLatestMarketRespItem,
  oddsItem?: { oddsStatus?: number },
): EOddsStatus => {
  if (Number(marketData.matchOver) === 1) return EOddsStatus.Suspended;
  if (OB_LOCKED_HANDICAP_STATUS.includes(Number(marketData.matchHandicapStatus)))
    return EOddsStatus.Suspended;
  if (OB_LOCKED_HANDICAP_STATUS.includes(Number(marketData.status))) return EOddsStatus.Suspended;
  if (Number(oddsItem?.oddsStatus) === OB_ODDS_STATUS_SUSPENDED) return EOddsStatus.Suspended;
  return EOddsStatus.Open;
};

/**
 * 限额接口（普通投注 / 预约投注共用）的请求项组装。
 * 对齐 Flutter OBBetMoneyItem：oddsFinally 传展示赔率、oddsValue 传原始欧赔。
 */
export const buildObBetMoneyReqItems = ({
  betItems,
  isParlay,
}: {
  betItems: TBetItem[];
  isParlay: boolean;
}): TObBetMoneyReqItem[] =>
  betItems.map((item) => {
    const isHK = getObMarketTypeFinally({ betItem: item, isParlay }) === EObMarketTypeFinally.HK;
    return {
      deviceType: OB_DEVICE_TYPE,
      oddsFinally: getObOddFinally({
        baseOdds: item.baseOdds,
        isSupportHK: isHK,
        isESport: isObESport(item.sportId),
      }),
      oddsValue: toObRawOdds(item.baseOdds),
      playId: `${item.playId}`,
      playOptionId: item.ob?.oid ?? '',
      matchId: item.matchId,
      marketId: item.marketId,
      matchType: getObMatchType(item),
      openMiltSingle: isParlay ? EObOpenMiltSingle.No : EObOpenMiltSingle.Yes,
    };
  });

/** 球种名称（预约投注必填，直接投注一并带上） */
export const getObSportName = (sportId: string) =>
  Object.values(OBCompetitionMap).find((item) => `${item.id}` === `${sportId}`)?.label ?? '';

/**
 * 单个投注项 → 投注参数明细。
 * @param overrideOdds 预约投注传预约赔率（欧赔），普通投注不传即用当前赔率
 */
export const buildObOrderDetail = ({
  betItem,
  betAmount,
  isParlay,
  overrideOdds,
}: {
  betItem: TBetItem;
  betAmount: string;
  isParlay: boolean;
  overrideOdds?: number;
}): TObOrderDetailParam => {
  const marketTypeFinally = getObMarketTypeFinally({ betItem, isParlay });
  const odds = overrideOdds && overrideOdds > 0 ? overrideOdds : betItem.baseOdds;
  return {
    playId: `${betItem.playId}`,
    matchType: getObMatchType(betItem),
    marketTypeFinally,
    playOptionsId: betItem.ob?.oid ?? '',
    placeNum: betItem.ob?.placeNum ?? 0,
    betAmount,
    matchId: betItem.matchId,
    marketId: betItem.marketId,
    // 赔率不区分欧洲/香港盘，一律传原始欧赔
    odds: toObRawOdds(odds),
    oddFinally: getObOddFinally({
      baseOdds: odds,
      isSupportHK: marketTypeFinally === EObMarketTypeFinally.HK,
      isESport: isObESport(betItem.sportId),
    }),
    sportId: Number(betItem.sportId) || 0,
    sportName: getObSportName(betItem.sportId),
    tournamentId: betItem.leagueId,
    playOptionName: betItem.betItemFullName,
    playOptions: betItem.ob?.ot ?? '',
    playName: betItem.playName,
    matchName: betItem.leagueName,
    marketValue: betItem.marketValue,
    scoreBenchmark: '',
  };
};

/** 拼投注项唯一 id：mid + 玩法id + 坑位 + 投注项类型，与列表/详情格式化保持一致 */
export const buildObBetItemId = ({
  matchId,
  playId,
  placeNum,
  ot,
}: {
  matchId: string | number;
  playId: string | number;
  placeNum: number;
  ot: string;
}) => `${matchId}_${playId}_${placeNum}_${ot}`;
