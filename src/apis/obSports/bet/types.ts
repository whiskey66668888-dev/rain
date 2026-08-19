import type { EObBetOrderStatusCode, EObMatchType, EObQueryOrderStatus } from './constants';

// ─── 查询最新盘口信息 /betOrder/client/queryLatestMarketInfo ──────────────────

/** 请求项，对齐 Flutter OBMarketItem */
export interface TObLatestMarketReqItem {
  /** 赛事id */
  matchInfoId: string;
  /** 盘口id */
  marketId: string;
  /** 投注项id（对应列表的 oid） */
  oddsId: string;
  /** 投注项类型（对应列表的 ot） */
  oddsType: string;
  /** 玩法id */
  playId: string;
  /** 坑位（对应列表的 hn） */
  placeNum: number;
  /** 赛事类型标识 */
  matchType: EObMatchType;
}

export interface TObMarketOddsItem {
  /** 投注项id */
  id: string;
  /** 原始赔率，欧赔 × 100000 */
  oddsValue: number;
  /** 投注项状态 1-开盘 2-封盘 */
  oddsStatus: number;
  /** 投注项名称（让球玩法取这里） */
  playOptions?: string;
  /** 投注项类型 */
  oddsType?: string;
}

export interface TObLatestMarketRespItem {
  /** 盘口id */
  id: string;
  /** 赛事id */
  matchInfoId: string;
  /** 玩法id */
  playId: string;
  /** 玩法名称 */
  playName?: string;
  /** 坑位 */
  placeNum?: number;
  /** 盘口值（大小球等取这里） */
  marketValue?: string;
  /** 赛事结束状态 0-未结束 1-结束（对应 mo） */
  matchOver?: number;
  /** 赛事级别开关（对应 mhs） */
  matchHandicapStatus?: number;
  /** 盘口状态（对应 hs） */
  status?: number;
  /** 是否支持预约投注 */
  pendingOrderStatus?: number;
  marketOddsList?: TObMarketOddsItem[];
}

// ─── 查询最大最小投注金额 /betOrder/client/queryMarketMaxMinBetMoney ──────────

/** 请求项，对齐 Flutter OBBetMoneyItem */
export interface TObBetMoneyReqItem {
  /** 设备类型 */
  deviceType: number;
  /** 最终赔率（展示用，截断后的字符串） */
  oddsFinally: string;
  /** 原始赔率，欧赔 × 100000 */
  oddsValue: number;
  /** 玩法id */
  playId: string;
  /** 投注项id */
  playOptionId: string;
  /** 赛事id */
  matchId: string;
  /** 盘口id */
  marketId: string;
  /** 赛事类型标识 */
  matchType: EObMatchType;
  /** 是否开启多单关投注模式，1：是，0：否（串关传 0） */
  openMiltSingle: number;
}

export interface TObBetMoneyRespItem {
  /** 最小投注金额 */
  minBet?: number | string;
  /** 最大投注金额 */
  orderMaxPay?: number | string;
  /** 串关类型，2001 / 3001 / 3004 …（仅串关返回） */
  type?: string;
  /** 串关赔率（仅串关返回） */
  seriesOdds?: number | string;
  /** 单关时用于回填匹配 */
  playOptionId?: string;
  marketId?: string;
  matchId?: string;
}

// ─── 投注 /betOrder/client/bet ────────────────────────────────────────────────

export interface TObOrderDetailParam {
  /** 玩法id */
  playId: string;
  /** 赛事类型标识 */
  matchType: EObMatchType;
  /** 最终盘口类型 EU / HK */
  marketTypeFinally: string;
  /** 投注项id */
  playOptionsId: string;
  /** 坑位 */
  placeNum: number;
  /** 投注金额 */
  betAmount: string;
  /** 赛事id */
  matchId: string;
  /** 盘口id */
  marketId: string;
  /** 原始赔率，欧赔 × 100000（不区分欧洲/香港盘） */
  odds: number;
  /** 最终赔率，截断后的展示值 */
  oddFinally: string;
  /** 球种id */
  sportId: number;
  /** 球种名称 */
  sportName?: string;
  /** 联赛id */
  tournamentId?: number;
  /** 投注项名称 */
  playOptionName?: string;
  /** 投注项类型 */
  playOptions?: string;
  /** 玩法名称 */
  playName?: string;
  /** 联赛名称 */
  matchName?: string;
  /** 盘口值 */
  marketValue?: string;
  /** 基准分，接口要求必传，无值传空串 */
  scoreBenchmark?: string;
}

export interface TObSeriesOrderParam {
  /** 串关类型 1：单关，2001：2串1，3001：3串1 … */
  seriesType: number;
  /** 串关子单个数，单关为 1 */
  seriesSum: number;
  /** 是否满额投注 1-是 0-否 */
  fullBet: number;
  orderDetailList: TObOrderDetailParam[];
}

export interface TObBetParams {
  /** 是否自动接受赔率变化 */
  useAcceptOdds: number;
  deviceType: number;
  deviceImei: string;
  /** 0-直接投注 1-预约投注 */
  preBet: number;
  seriesOrders: TObSeriesOrderParam[];
}

export interface TObBetOrderDetailResp {
  orderNo: string;
  /** 投注项id */
  playOptionsId?: string;
  /** 盘口id */
  marketId?: string;
  /** 最终赔率 */
  oddsValues?: number | string;
  /** 投注金额 */
  betMoney?: number | string;
  /** 最大可赢金额，单位「分」 */
  maxWinMoney?: number | string;
  /** 盘口类型 */
  marketType?: string;
  orderStatusCode?: EObBetOrderStatusCode;
}

export interface TObBetSeriesOrderResp {
  orderNo: string;
  /** 串关类型 code */
  seriesCode?: string | number;
  /** 串关名称，如 2串1 */
  seriesValue?: string;
  /** 串关子单数 */
  seriesSum?: number;
  /** 串关总投注额 */
  seriesBetAmount?: number | string;
  /** 最大可赢金额，单位「分」 */
  maxWinMoney?: number | string;
  marketType?: string;
  orderStatusCode?: EObBetOrderStatusCode;
}

export interface TObBetRespData {
  orderDetailRespList?: TObBetOrderDetailResp[];
  seriesOrderRespList?: TObBetSeriesOrderResp[];
}

// ─── 注单状态 /betOrder/queryOrderStatus ──────────────────────────────────────

export interface TObOrderStatusRespItem {
  orderNo: string;
  status: EObQueryOrderStatus;
  /** 最新最大可赢金额，单位「分」 */
  newMaxWinAmount?: number | string;
  oddsChangeList?: unknown[];
}
