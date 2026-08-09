import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbOddsFormatType, EFbOrderStatus } from '../common/constants/enum';
import { EFbPeriod } from '../common/constants/period';
import { EFbMarketType } from '../common/constants/marketType';
import { EFbSelectionType } from '../common/constants/selectionType';

export interface TGetReserveEarlySettleStatusByIdsFbParams {
  /** 预约提前结算订单ID集合 */
  reserveCashOutIds: string[];
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

interface TReserveEarlySettleTeamItem {
  /** 球队名称 */
  na: string;
  /** 球队ID */
  id: number;
}

interface TReserveEarlySettleOrderOptionItem {
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
  /** 玩法阶段code，see enum: period */
  pe: EFbPeriod;
  /** 玩法类型code，see enum: market_type */
  mty: EFbMarketType;
  /** 投注选项完整名称 */
  on: string;
  /** 投注选项名称 */
  onm: string;
  /** 是否滚球玩法 */
  ip: boolean;
  /** 球队信息 */
  te: TReserveEarlySettleTeamItem[];
  /** 订单结算时比分 */
  rs: string;
  /** 选项结算结果，see enum: outcome */
  sr: number;
  /** 展示赔率 */
  bo: string;
  /** 下注时赔率类型，see enum: odds_format_type_enum */
  of: EFbOddsFormatType;
  /** 带线玩法对应的值 */
  li: string;
  /** 备注 */
  rmk: string;
  /** 扩展信息 */
  re: string;
  /** 选项的玩法ID */
  mrid: number;
  /** 选项类型，see enum: selection_type */
  ty: EFbSelectionType;
  /** 欧盘赔率 */
  od: number;
  /** 玩法名称 */
  mgn: string;
}

export interface TGetReserveEarlySettleStatusByIdsFbItem {
  /** 预约提前结算订单ID */
  id: string;
  /** 预约提前结算创建时间，13位数字时间戳 */
  ct: number;
  /** 预约提前结算本金 */
  cst: number;
  /** 预约提前结算期望派奖金额 */
  cops: number;
  /** 预约提前结算订单状态，see enum: reserve_order_status */
  st: EFbOrderStatus;
  /** 单位（1元）金额可返还的金额 */
  unps: number;
  /** 对应的原始订单ID */
  oid: string;
  /** 投注选项详情 */
  ops: TReserveEarlySettleOrderOptionItem[];
}

/** 批量获取预约提前结算订单详情：/v1/order/reserve/cashOut/statusInfoByIds */
export const getReserveEarlySettleStatusByIdsFb = (
  params: TGetReserveEarlySettleStatusByIdsFbParams,
) => {
  return requestFB.post<
    TGetReserveEarlySettleStatusByIdsFbItem[],
    TGetReserveEarlySettleStatusByIdsFbParams
  >('/v1/order/reserve/cashOut/statusInfoByIds', { body: params });
};
