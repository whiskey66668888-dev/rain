import requestFB from '@/core/sdk/requestFB';

export interface TCancelReserveBetFbParams {
  /** 预约订单号 */
  reserveId: string;
}

/** 取消预约投注：/v1/order/reserve/cancel */
export const cancelReserveBetFb = (params: TCancelReserveBetFbParams) => {
  return requestFB.post<boolean, TCancelReserveBetFbParams>('/v1/order/reserve/cancel', {
    body: params,
  });
};
