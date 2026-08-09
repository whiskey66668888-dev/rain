import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';

export interface TCancelReserveEarlySettleFbParams {
  /** 预约提前结算订单ID */
  reserveCashOutId: string;
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

/** 取消提前结算预约订单：/v1/order/cashOutReserve/cancel */
export const cancelReserveEarlySettleFb = (params: TCancelReserveEarlySettleFbParams) => {
  return requestFB.post<boolean, TCancelReserveEarlySettleFbParams>(
    '/v1/order/cashOutReserve/cancel',
    { body: params },
  );
};
