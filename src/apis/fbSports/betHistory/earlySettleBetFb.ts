import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbCashOutOrderStatus } from '../common/constants/enum';

export interface TEarlySettleBetFbParams {
  /** 设备ID */
  deviceId?: string;
  /** 订单ID */
  orderId: string;
  /** 提前结算本金 */
  cashOutStake: number;
  /** 单位（1元）本金对应可返还金额 */
  unitCashOutPayoutStake: number;
  /** 是否接受赔率变化 */
  acceptOddsChange: boolean;
  /** 是否串关 */
  parlay: boolean;
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

export interface TEarlySettleBetFbData {
  /** 下注成功后生成的提前结算ID */
  id: string;
  /** 提前结算订单状态，下注后为异步接单，该字段只返回0创建成功、1确认中 */
  st: EFbCashOutOrderStatus.Created | EFbCashOutOrderStatus.Confirming;
}

/** 提前结算下注：/v1/order/cashOut/bet */
export const earlySettleBetFb = (params: TEarlySettleBetFbParams) => {
  return requestFB.post<TEarlySettleBetFbData, TEarlySettleBetFbParams>('/v1/order/cashOut/bet', {
    body: params,
  });
};
