import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbCashOutOrderStatus } from '../common/constants/enum';

export interface TGetEarlySettlesByIdsFbParams {
  /** 提前结算ID集合 */
  ids: string[];
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

export interface TGetEarlySettlesByIdsFbItem {
  /** 提前结算ID */
  id: string;
  /** 提前结算创建时间，13位数字时间戳 */
  createTime: number;
  /** 提前结算本金 */
  cashOutStake: number;
  /** 提前结算派奖金额 */
  cashOutPayoutStake: number;
  /** 提前结算盈利金额 */
  cashOutProfitStake: number;
  /** 提前结算订单状态，see enum: cash_out_order_status */
  orderStatus: EFbCashOutOrderStatus;
  /** 取消时间，13位数字时间戳 */
  cancelTime: number;
  /** 备注 */
  remark: string;
  /** 取消原因码 */
  cancelReasonCode: number;
  /** 取消时可转回的金额 */
  cancelCashOutAmountTo: number;
  /** 对应的原始订单ID */
  orderId: string;
  /** 币种ID */
  currencyId: number;
  /** 汇率快照 */
  exchangeRate: number;
}

/** 获取提前结算订单状态：/v1/order/getCashOutsByIds */
export const getEarlySettlesByIdsFb = (params: TGetEarlySettlesByIdsFbParams) => {
  return requestFB.post<TGetEarlySettlesByIdsFbItem[], TGetEarlySettlesByIdsFbParams>(
    '/v1/order/getCashOutsByIds',
    { body: params },
  );
};
