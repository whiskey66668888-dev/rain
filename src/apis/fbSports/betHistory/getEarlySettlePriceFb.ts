import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbAskEarlySettleStatus } from '../common/constants/enum';

export interface TGetEarlySettlePriceFbParams {
  /** 订单id集合 */
  orderIds: string[];
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

export interface TGetEarlySettlePriceFbPriceItem {
  /** 订单ID */
  oid: string;
  /** 提前结算金额 */
  amt?: number;
  /** 当前订单如果有提前结算订单，则返回提前结算状态，如果无提前结算则返回订单状态，0:订单创建 1：订单确认中，2：订单拒绝 3：订单取消，4：订单已接单 5；订单已结算 101：预约提前结算中 102：提前结算进行中 , see enum: ask_cash_out_status */
  st: EFbAskEarlySettleStatus;
  /** 单关订单提前结算单次最小结算本金 */
  smis?: number;
  /** 串关订单提前结算单次最小结算本金 */
  pmis?: number;
  /** 预约提前结算金额 */
  rcs?: string;
}

export interface TGetEarlySettlePriceFbData {
  /** 最大并发提前结算数 */
  mxc: number;
  /** 报价数据列表 */
  pr: TGetEarlySettlePriceFbPriceItem[];
}

/** 批量获取订单提前结算报价：/v1/order/cashOut/price */
export const getEarlySettlePriceFb = (params: TGetEarlySettlePriceFbParams) => {
  return requestFB.post<TGetEarlySettlePriceFbData, TGetEarlySettlePriceFbParams>(
    '/v1/order/cashOut/price',
    { body: params },
  );
};
