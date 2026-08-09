import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import {
  EFbCashOutOrderStatus,
  EFbClockType,
  EFbCommonStatus,
  EFbMatchClockTimeDisplayAccuracy,
  EFbMatchStatus,
  EFbMatchType,
  EFbOddsChangeEnum,
  EFbOddsFormatType,
  EFbOrderQueryTimeType,
  EFbOrderRejectType,
  EFbOrderStatus,
  EFbOutcome,
  EFbPendingType,
  EFbPromotionBetResult,
  EFbSeriesType,
} from '../common/constants/enum';
import { EFbPeriod } from '../common/constants/period';
import { EFbMarketType } from '../common/constants/marketType';
import { EFbSelectionType } from '../common/constants/selectionType';
import { EFbMatchFormat } from '../common/constants/matchFormat';

export interface TOrderBetListFbParams {
  /** 查询未结算订单时支持时间范围筛选 */
  unsettledAllowTimeRange?: boolean;
  /** true 为查询已结算列表，false 为查询未结算列表 */
  isSettled: boolean;
  /** 开始时间，13位数字时间戳，查询已结算列表，该字段必填 */
  startTime?: number;
  /** 结束时间，13位数字时间戳，查询已结算列表，该字段必填 */
  endTime?: number;
  /** 国际化语言类型，CMN、ENG等，默认英语 */
  languageType?: FB_LANGUAGE_TYPE;
  /** 当前分页页数，从1开始 */
  current?: number;
  /** 每页订单条数 */
  size?: number;
  /** 时间范围类型，与startTime,endTime配合使用, 1.下单时间,2.结算时间 */
  timeType?: EFbOrderQueryTimeType;
  /** 币种ID */
  currencyId?: number;
  /** 赛事类型集合 */
  matchTypes?: EFbMatchType[];
  /** 是否仅返回做过提前结算的订单，默认false */
  isCashout?: boolean;
}

export interface TOrderBetListFbStatsItem {
  /** 币种ID */
  cid: number;
  /** 订单数 */
  ct: number;
  /** 总投注金额 */
  sa: number;
  /** 总派彩金额 */
  pa: number;
  /** 总用户输赢 */
  cwl: number;
}

export interface TOrderBetListFbTeamItem {
  /** 球队名称 */
  na: string;
  /** 球队id */
  id: number;
}

export interface TOrderBetListFbMatchClock {
  /** 走表时间，以秒为单位，如250秒，客户端用秒去转换成时分秒时间 */
  s: number;
  /** 走表时间展示精度 , see enum: match_clock_time_display_accuracy */
  tu: EFbMatchClockTimeDisplayAccuracy;
  /** 赛事阶段，如 足球上半场，篮球第一节等 , see enum: match_period */
  pe: EFbPeriod;
  /** 是否走表，true为走表，false为停表 */
  r: boolean;
  /** 走表类型 , see enum: clock_type */
  tp: EFbClockType;
  /** 伤停补时时长(分钟) */
  itd: number;
}

export interface TOrderBetListFbOrderOptionItem {
  /** 运动ID */
  sid: number;
  /** 比赛ID */
  mid: number;
  /** 比赛名称 */
  mn: string;
  /** 联赛ID */
  lid: number;
  /** 联赛名称 */
  ln: string;
  /** 比赛开赛时间，13位数字时间戳 */
  bt: number;
  /** 玩法阶段code，如 上半场、全场等 , see enum: period */
  pe: EFbPeriod;
  /** 玩法类型code，如 大小球、让球 , see enum: market_type */
  mty: EFbMarketType;
  /** 投注选项完整名称 */
  on: string;
  /** 投注选项名称(全名or简名，目前为全名) */
  onm: string;
  /** 是否滚球玩法 , see enum: in_play_enum */
  ip: boolean;
  /** 球队信息 */
  te: TOrderBetListFbTeamItem[];
  /** 订单结算时比分，部分玩法没有对应比分 */
  rs: string;
  /** 选项结算结果，0未结算，2走水，3全输，4全赢，5赢半，6输半，7玩法取消 , see enum: outcome */
  sr?: EFbOutcome;
  /** 展示赔率，按下单时赔率类型（of字段）展示，如下单时用港盘，港盘赔率是0.82，该字段就是0.82 */
  bo: string;
  /** 下注时赔率类型，1欧洲盘，2香港盘，目前只支持这两种 , see enum: odds_format_type_enum */
  of: EFbOddsFormatType;
  /** 带线（球头）的玩法对应的值，如 大小球 2.5，该字段是"2.5" */
  li: string;
  /** 备注 */
  rmk: string;
  /** 扩展信息，主要是亚盘玩法的比分，如 1-1 */
  re: string;
  /** 选项的玩法ID */
  mrid: number;
  /** 选项类型 , see enum: selection_type */
  ty: EFbSelectionType;
  /** 欧盘赔率，下单时欧盘赔率，与展示的赔率类型无关，如展示位港盘赔率 0.82，实际欧盘是1.82，该字段为1.82 */
  od: number;
  /** 玩法名称 marketType+period */
  mgn: string;
  /** 取消原因 */
  cr: string;
  /** 赛事类型 1 冠军投注赛事，2 正常赛事 , see enum: match_type */
  mtp: EFbMatchType;
  /** 赛制 , see enum: match_format */
  fmt: EFbMatchFormat;
  /** 赛制的场次、局数、节数 */
  fid: number;
  /** 赛事状态 , see enum: match_status */
  ms: EFbMatchStatus;
  /** 当前比分 */
  scs: number[];
  /**
   * 注时比分 ("R: 0-0,Y: 0-1,S: 0-3")
   * 投注盘口阶段比分快照，格式示例说明：S: 19-26，S为比分类型组，见枚举result_type_group的REMARK，19-26为主客队比分
   */
  bsc?: string;
  /** 比赛时钟信息，滚球走表信息 */
  mc: TOrderBetListFbMatchClock;
  /** 延迟事件类型 , see enum: pending_type */
  pt: EFbPendingType;
  /** 优惠结果 , see enum: promotion_bet_result_enum */
  pr: EFbPromotionBetResult;
}

export interface TOrderBetListFbReserveCashoutItem {
  /** 预约提前结算订单ID */
  id: string;
  /** 预约提前结算时间，13位数字时间戳 */
  ct: number;
  /** 预约提前结算本金 */
  cst: number;
  /** 预约提前结算期望派奖金额 */
  cops: number;
  /** 预约提前结算订单状态 1、等待中 2、成功提前结算 3、失败 4、取消 , see enum: order_status */
  st: EFbOrderStatus;
  /** 单位（1元）金额可返还的金额 */
  unps: number;
  /** 预约提前结算对应的原始订单ID */
  oid: string;
}

export interface TOrderBetListFbCashoutRecordItem {
  /** 提前结算订单ID */
  id: string;
  /** 提前结算订单创建时间 */
  ct: number;
  /** 提前结算本金 */
  cst: number;
  /** 提前结算派奖金额 */
  cops: number;
  /** 提前结算订单状态，0创建成功，1接单确认中，2拒单，3取消，4接单成功，5结算 , see enum: cash_out_order_status */
  st: EFbCashOutOrderStatus;
  /** 提前结算对应的原始订单ID */
  oid: string;
  /** 提前结算取消原因 */
  cr: string;
}

export interface TOrderBetListFbRecordItem {
  /** 订单号 */
  id: string;
  /** 用户输赢 */
  uwl: string;
  /** 注单类型(0:单注 1:串关 ) , see enum: series_type */
  sert: EFbSeriesType;
  /** 总注单数，单关为1，串关为子单个数，如4串4*11，则该字段为11 */
  bn: number;
  /** 选项个数 */
  al: number;
  /** 总投注额(本金) */
  sat: number;
  /** 正常结算派奖金额, 已结算才有 */
  sa?: number;
  /** 订单状态，0创建成功，1确认中，2拒单，3取消订单，4接单成功，5已结算 , see enum: order_status */
  st: EFbOrderStatus;
  /** 是否接受赔率变更设置：0不接受，1 接受更好赔率，2接受任意赔率 , see enum: odds_change_enum */
  oc: EFbOddsChangeEnum;
  /** 订单结算时间，13位数字时间戳 */
  stm?: number;
  /** 订单下单时间，13位数字时间戳 */
  cte: number;
  /** 订单取消时间，13位数字时间戳 */
  ct: number;
  /** 订单变更时间，13位数字时间戳 */
  mt: number;
  /** 第三方备注 */
  rmk: string;
  /** 单笔投注金额，单关时和总投注额相等，串关为子单投注额 */
  us: number;
  /** 串关类型，(例:3x1*3) */
  bt: string;
  /** 提前结算总本金 */
  cots: number;
  /** 提前结算派彩金额 */
  cops: number;
  /** 该订单提前结算总次数，FB提供多次部分提前结算，最多5次成功的提前结算但 */
  coc: number;
  /** 是否为预约投注单 */
  ab: boolean;
  /** 选项个数，单关为1，串关为选项个数 */
  ic: number;
  /** 串关子单选项个数，如：投注4场比赛的3串1，此字段为3，如果是全串关（4串11*11），则为0； */
  sv: number;
  /** 剩余可赢额，如有部分提前结算，该字段为剩余本金*赔率 */
  lwa: number;
  /** 可返还金额，包含本金 */
  mla: number;
  /** 最大可赢额，不包含本金 */
  mwa: number;
  /** 币种ID */
  cid: number;
  /** 汇率快照 */
  exr: number;
  /** 是否支持提前结算, 1:支持,0:不支持 */
  co: number;
  /** 是否二次结算 */
  ss: boolean;
  /** 是否支持提前派彩 , see enum: common_status_enum */
  ep: EFbCommonStatus;
  /** 拒单原因码 */
  rj: EFbOrderRejectType;
  /** 拒单原因 */
  rjs: string;
  /** 订单选项详情 */
  ops: TOrderBetListFbOrderOptionItem[];
  /** 预约提前结算订单列表 */
  rcool: TOrderBetListFbReserveCashoutItem[];
  /** 提前结算历史记录 */
  crl?: TOrderBetListFbCashoutRecordItem[];
}

export interface TOrderBetListFbData {
  current: number;
  size: number;
  total: number;
  totalType: number;
  records: TOrderBetListFbRecordItem[];
  /** 分币种统计 */
  sts?: TOrderBetListFbStatsItem[];
}

/** 投注记录接口：/v1/order/new/bet/list */
export const orderBetListFb = (params: TOrderBetListFbParams) => {
  return requestFB.post<TOrderBetListFbData, TOrderBetListFbParams>('/v1/order/new/bet/list', {
    body: params,
  });
};
