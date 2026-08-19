/**
 * OB 投注记录数据转换：三方原始结构 → 统一的 TBetHistoryData
 * 对齐 Flutter lib/pages/mine/record/betting/sport/eb/ob/index.dart 的 handleBetItemData
 */
import dayjs from 'dayjs';

import {
  EBetHistoryQueryType,
  EBetOrderStatus,
  EBetSettleResult,
  EOddsStatus,
  EOddsType,
} from '@/apis/commonSports/constants';
import type {
  TBetHistoryData,
  TBetHistoryOrderItem,
  TBetHistoryQueryParams,
  THistoryBetItem,
} from '@/apis/commonSports/types';
import { bigNB } from '@/utils/bet/bigMath';
import { calcParlayOdds } from '@/utils/bet/parlay';

import type { TOrderBetListObData, TOrderBetListObParams } from '../betHistory/orderBetListOb';
import type {
  TReserveBetListObData,
  TReserveBetListObParams,
} from '../betHistory/reserveBetListOb';
import type { TObOrderDetail, TObOrderRecord } from '../betHistory/types';

/** 香港盘的 marketType，其 oddFinally 是港赔（欧赔 − 1） */
const OB_MARKET_TYPE_HK = 'HK';

/** 只区分香港盘，马来/印尼盘等一律按欧洲盘处理 */
const obMarketTypeToOddsType = (marketType: string): EOddsType =>
  marketType === OB_MARKET_TYPE_HK ? EOddsType.HK : EOddsType.EU;

/** 注单下发的 oddFinally 是按盘口展示的赔率，统一换算回欧赔 */
const obOddFinallyToEuOdds = (oddFinally: string | number | undefined, marketType: string) =>
  +bigNB(Number(oddFinally) || 0)
    .plus(marketType === OB_MARKET_TYPE_HK ? 1 : 0)
    .toFixed(2);

/** 投注取消、投注失败的注单不进列表（对齐 Flutter failStatus） */
const OB_FAIL_ORDER_STATUS = ['2', '4'];

/** 冠军赛事的 matchType */
const OB_MATCH_TYPE_CHAMPION = 3;

/** 电竞赛种不参与滚球赛况轮询（对齐 Flutter potentialLive 判断） */
const OB_ESPORTS_SPORT_IDS = [100, 101, 102, 103];

/** OB 与 FB 共用一套结算结果编码，此外的（8 延期、11 中断等）统一按未结算兜底 */
const OB_KNOWN_SETTLE_RESULTS: number[] = [
  EBetSettleResult.Return,
  EBetSettleResult.Lost,
  EBetSettleResult.Won,
  EBetSettleResult.WinReturn,
  EBetSettleResult.LooseReturn,
  EBetSettleResult.Cancel,
];

const SETTLED_QUERY_TYPES = [
  EBetHistoryQueryType.SETTLED,
  EBetHistoryQueryType.SETTLED_CHAMPION,
  EBetHistoryQueryType.SETTLED_EARLY_SETTLEMENT,
];

const isSettledQueryType = (queryType: EBetHistoryQueryType) =>
  SETTLED_QUERY_TYPES.includes(queryType);

/** OB 注单状态 → 统一注单状态（对齐 Flutter statusTo） */
const obOrderStatusFormat = (orderStatus: string): EBetOrderStatus => {
  switch (orderStatus) {
    // 确认中
    case '3':
      return EBetOrderStatus.Confirming;
    // 投注取消 / 投注失败
    case '2':
    case '4':
      return EBetOrderStatus.Fail;
    // '0' 投注成功、'1' 已结算
    default:
      return EBetOrderStatus.Success;
  }
};

/** OB 预约注单状态 → 统一注单状态（对齐 Flutter rstMsg） */
const obReserveStatusFormat = (preOrderStatus?: number): EBetOrderStatus => {
  switch (preOrderStatus) {
    case 0:
      return EBetOrderStatus.Confirming;
    case 1:
      return EBetOrderStatus.Success;
    // 2 预约失败，3、4 取消
    default:
      return EBetOrderStatus.Fail;
  }
};

const obSettleResultFormat = (result?: number): EBetSettleResult =>
  result !== undefined && OB_KNOWN_SETTLE_RESULTS.includes(result)
    ? result
    : EBetSettleResult.NoResulted;

/**
 * 串关总赔率：seriesValue 形如 "2串1"、"3串4"
 * n串1 取 n 个组合乘积和；特殊串（3串4、4串11 等）为 2..n 各组合之和，与 calcParlayOdds(0) 等价。
 * 与 Flutter OddsUtil.getAllOdds 一致：向下截断两位，最低 1.01。
 */
const calcObParlayOdds = (seriesValue: string | undefined, odds: number[]): number => {
  const parts = (seriesValue ?? '').split('串');
  const n = Number(parts[0]);
  const k = Number(parts[1]);
  if (!n || !k) return 0;
  const total = calcParlayOdds(k === 1 ? n : 0, odds);
  const truncated = Math.floor(total * 100) / 100;
  return truncated > 0 && truncated < 1.01 ? 1.01 : truncated;
};

const formatObOrderDetail = ({
  detail,
  isReserve,
}: {
  detail: TObOrderDetail;
  isReserve: boolean;
}): THistoryBetItem => {
  const isChampion = detail.matchType === OB_MATCH_TYPE_CHAMPION;
  // 对阵信息形如 "队伍A v 队伍B"
  const [homeName = '', awayName = ''] = (detail.matchInfo ?? '').split(/\s+v\s+/i);
  // 预约注单的投注项名在 playOptionName
  const betItemName = (isReserve ? detail.playOptionName : detail.marketValue) ?? '';

  return {
    sportId: `${detail.sportId}`,
    matchId: detail.matchId,
    leagueName: detail.matchName,
    homeName,
    awayName,
    // OB 注单不返回滚球标记，按「未结算 + 非冠军 + 非电竞」判断是否需要拉赛况（对齐 Flutter potentialLive）
    isLive: !isChampion && detail.betStatus === 0 && !OB_ESPORTS_SPORT_IDS.includes(detail.sportId),
    isChampion,
    isSupportHK: false,
    canParlay: false,
    canPreBet: false,
    playName: detail.playName,
    playId: `${detail.playId}`,
    marketId: detail.marketId,
    // OB 无独立球头值，盘口值合并在投注项名内
    marketValue: '',
    betItemShortName: betItemName,
    betItemFullName: betItemName,
    betItemId: detail.playOptionsId,
    // oddFinally 是按注单盘口展示的赔率，港盘要加回 1 —— baseOdds 恒为欧赔
    baseOdds: obOddFinallyToEuOdds(detail.oddFinally, detail.marketType),
    bettingOddsType: obMarketTypeToOddsType(detail.marketType),
    oddsStatus: EOddsStatus.Open,
    matchStartTime: Number(isChampion ? detail.closingTime : detail.beginTime) || 0,
    resultScore: detail.settleScore?.replace('全场比分 ', '') || undefined,
    scoreWhileBetting: detail.scoreBenchmark?.replace(':', '-') || undefined,
    orderSettleResult: obSettleResultFormat(detail.betResult),
    leagueId: detail.tournamentId,
    sportName: detail.sportName,
  };
};

const formatObOrder = ({
  record,
  isSettled,
  isReserve,
}: {
  record: TObOrderRecord;
  isSettled: boolean;
  isReserve: boolean;
}): TBetHistoryOrderItem => {
  // '1'、'3' 为单关（对齐 Flutter isSingle）
  const isSingle = record.seriesType === '1' || record.seriesType === '3';
  const details = record.detailList ?? [];
  const stake = record.orderAmountTotal ?? 0;
  const maxWinAmount = record.maxWinAmount ?? 0;
  const profitAmount = record.profitAmount ?? 0;
  const euOddsList = details.map((detail) =>
    obOddFinallyToEuOdds(detail.oddFinally, detail.marketType),
  );
  // 已提前结算（对齐 Flutter preSettle 1、2）
  const isEarlySettled = record.preSettle === 1 || record.preSettle === 2;
  // 已结算返还 = 本金 + 输赢，香港盘同样含本金
  const settledBackAmount = isSettled ? bigNB(stake).plus(profitAmount).toFixed(2) : '';

  return {
    orderId: record.orderNo,
    orderConfirmTime: Number(record.betTime) || 0,
    orderBetAmount: bigNB(stake).toFixed(2),
    // 可返还 / 预约返还 = 最大可赢 + 本金。接口的 maxWinAmount 恒为纯盈利，
    // 香港盘也要加回本金（App 港盘只显示纯盈利，Web 统一含本金）
    orderMaxWinAmount: bigNB(maxWinAmount).plus(stake).toFixed(2),
    orderSettledBackAmount: settledBackAmount,
    orderStatus: isReserve
      ? obReserveStatusFormat(record.preOrderStatus)
      : obOrderStatusFormat(record.orderStatus),
    orderSettleResult: isEarlySettled
      ? EBetSettleResult.EarlySettled
      : isSettled
        ? obSettleResultFormat(record.outcome)
        : EBetSettleResult.NoResulted,
    // orderOdds 与 baseOdds 同为欧赔；串关必须用欧赔连乘，展示层再按盘口换算
    orderOdds: isSingle ? (euOddsList[0] ?? 0) : calcObParlayOdds(record.seriesValue, euOddsList),
    isParlayOrder: !isSingle,
    orderCode: isSingle ? '1' : (record.seriesValue ?? ''),
    orderSum: isSingle ? 1 : (record.seriesSum ?? 1),
    orderLabel: isSingle ? '单关' : (record.seriesValue ?? ''),
    isUnsettledOrder: !isSettled && !isReserve,
    isSettledOrder: isSettled,
    isPreBetOrder: isReserve,
    // 预约状态 3、4 为用户手动取消
    isManualCancel: isReserve
      ? record.preOrderStatus === 3 || record.preOrderStatus === 4
      : undefined,
    isEarlySettleOrder: isEarlySettled,
    orderWinLossAmount: profitAmount,
    // 未结算注单才可能有提前结算报价（是否真的可结算由报价接口决定，对齐 Flutter orderPrice != null）
    supportEarlySettle: !isSettled && !isReserve,
    // OB 只有全额提前结算：已结算的提前结算注单补一条整单记录，供「提前结算详情」展示
    ...(isSettled &&
      isEarlySettled && {
        earlySettleHistory: [{ id: record.orderNo, stake, payout: Number(settledBackAmount) || 0 }],
      }),
    orderDetails: details.map((detail) => formatObOrderDetail({ detail, isReserve })),
  };
};

/** 按下单时间倒序（对齐 Flutter betTime 降序排序） */
const sortByConfirmTimeDesc = (list: TBetHistoryOrderItem[]) =>
  [...list].sort((a, b) => b.orderConfirmTime - a.orderConfirmTime);

/** 格式化 OB 未结算 / 已结算注单列表参数 */
export const formatBetHistoryParamsOb = (
  params: TBetHistoryQueryParams,
  pageNum: number,
): TOrderBetListObParams => {
  const isSettled = isSettledQueryType(params.queryType);

  return {
    orderStatus: isSettled ? 1 : 0,
    page: pageNum,
    size: params.pageSize,
    // 对齐 Flutter：仅已结算传时间范围，未结算查全部
    ...(isSettled && !!params.startTime && { beginTime: params.startTime }),
    ...(isSettled && !!params.endTime && { endTime: params.endTime }),
  };
};

/** 格式化 OB 预约注单列表参数：对齐 Flutter，固定查近 7 天 */
export const formatBetHistoryParamsReserveOb = (
  params: TBetHistoryQueryParams,
  pageNum: number,
): TReserveBetListObParams => {
  const isFailed = params.queryType === EBetHistoryQueryType.RESERVE_FAIL;

  return {
    preOrderStatusList: isFailed ? [2, 3, 4] : [0],
    beginTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
    page: pageNum,
    size: params.pageSize,
  };
};

export const formatBetHistoryRespOb = ({
  data,
  params,
  pageNum,
}: {
  data: TOrderBetListObData;
  params: TBetHistoryQueryParams;
  pageNum: number;
}): TBetHistoryData => {
  const isSettled = isSettledQueryType(params.queryType);
  const records = (data.records ?? []).filter(
    (record) => !OB_FAIL_ORDER_STATUS.includes(record.orderStatus),
  );

  return {
    list: sortByConfirmTimeDesc(
      records.map((record) => formatObOrder({ record, isSettled, isReserve: false })),
    ),
    current: pageNum,
    size: params.pageSize,
    total: Number(data.total) || 0,
    stats: {
      totalOrderCount: Number(data.total) || 0,
      totalBetAmount: Number(data.betTotalAmount) || 0,
      winOrLoseAmount: Number(data.profit) || 0,
    },
  };
};

export const formatBetHistoryRespReserveOb = ({
  data,
  params,
  pageNum,
}: {
  data: TReserveBetListObData;
  params: TBetHistoryQueryParams;
  pageNum: number;
}): TBetHistoryData => {
  // 接口按日期分组返回，展开成一维列表（对齐 Flutter）
  const records = Object.values(data.record ?? {}).flatMap((group) => group?.data ?? []);

  return {
    list: sortByConfirmTimeDesc(
      records.map((record) => formatObOrder({ record, isSettled: false, isReserve: true })),
    ),
    current: pageNum,
    size: params.pageSize,
    total: Number(data.total) || 0,
    stats: {
      totalOrderCount: Number(data.total) || 0,
      // 预约列表不返回投注总额，按当页累加（对齐 Flutter）
      totalBetAmount: records.reduce((acc, record) => acc + (record.orderAmountTotal ?? 0), 0),
      winOrLoseAmount: Number(data.profit) || 0,
    },
  };
};
