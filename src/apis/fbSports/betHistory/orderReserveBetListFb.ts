import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import {
  EFbMatchType,
  EFbOddsFormatType,
  EFbReserveOrderFailCode,
  EFbReserveOrderStatus,
  EFbReservePayEnum,
} from '../common/constants/enum';
import { EFbPeriod } from '../common/constants/period';
import { EFbMarketType } from '../common/constants/marketType';
import { EFbSelectionType } from '../common/constants/selectionType';

export interface TOrderReserveBetListFbParams {
  /** 起始时间(yyyy-MM-dd HH:mm:ss) */
  startTime?: string;
  /** 结束时间(yyyy-MM-dd HH:mm:ss) */
  endTime?: string;
  /** 国际化语言类型，默认ENG */
  languageType: FB_LANGUAGE_TYPE;
  /** 是否已失效 */
  isFailed: boolean;
  /** 币种ID , see enum: currency */
  currencyId?: number;
}

export interface TOrderReserveBetListFbTeamItem {
  /** 球队名称 */
  na: string;
  /** 球队id */
  id: number;
}

export interface TOrderReserveBetListFbOrderOptionItem {
  /** 运动ID , see enum: sports */
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
  /** 比赛球队信息 */
  te: TOrderReserveBetListFbTeamItem[];
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
  /** 赛事类型 1 冠军投注赛事，2 正常赛事 , see enum: match_type */
  mtp: EFbMatchType;
  /** 是否滚球玩法 */
  ip: boolean;
}

export interface TOrderReserveBetListFbOrderItem {
  /** 订单号 */
  id: string;
  /** 总投注额(本金) */
  sat: number;
  /** 订单下单时间，13位数字时间戳 */
  cte: number;
  /** 预约状态 0预约中，1预约成功，2预约失败，3取消 , see enum: reserve_order_status */
  rst: EFbReserveOrderStatus;
  /** 币种ID , see enum: currency */
  cid: number;
  /** 预约支付信息 , see enum: reserve_pay_enum */
  p: EFbReservePayEnum;
  /** 预约订单失效原因描述 , see enum: reserve_order_fail_code_enum */
  fr: EFbReserveOrderFailCode;
  /** 第三方关联ID */
  rid: string;
  /** 订单选项详情 */
  ops: TOrderReserveBetListFbOrderOptionItem[];
}

export interface TOrderReserveBetListFbStatsItem {
  /** 币种ID , see enum: currency */
  cid: number;
  /** 订单数 */
  ct: number;
  /** 投注金额 */
  sa: number;
  /** 总可盈额 */
  mw: number;
}

export interface TOrderReserveBetListFbData {
  /** 预约订单列表 */
  ods: TOrderReserveBetListFbOrderItem[];
  /** 分币种统计 */
  sts?: TOrderReserveBetListFbStatsItem[];
}

/** 查询预约投注列表和统计信息接口：/v1/order/new/reserve/betList */
export const orderReserveBetListFb = (params: TOrderReserveBetListFbParams) => {
  return requestFB.post<TOrderReserveBetListFbData, TOrderReserveBetListFbParams>(
    '/v1/order/new/reserve/betList',
    { body: params },
  );
};
