import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbOrderStatus } from '../common/constants/enum';

export interface TReserveEarlySettleBetFbParams {
  /** 设备ID */
  deviceId?: string;
  /** 原始订单ID */
  orderId: string;
  /** 预约提前结算本金 */
  cashOutStake: number;
  /** 预约提前结算期望派奖金额 */
  cashOutPayoutStake: number;
  /** 是否串关 */
  parlay: boolean;
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

export interface TReserveEarlySettleBetFbData {
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
  /** 预约提前结算对应的原始订单ID */
  oid: string;
}

/** 预约提前结算投注：/v1/order/cashOutReserve/bet */
export const reserveEarlySettleBetFb = (params: TReserveEarlySettleBetFbParams) => {
  return requestFB.post<TReserveEarlySettleBetFbData, TReserveEarlySettleBetFbParams>(
    '/v1/order/cashOutReserve/bet',
    { body: params },
  );
};
