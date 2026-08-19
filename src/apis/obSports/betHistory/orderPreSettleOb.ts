import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

export interface TOrderPreSettleObParams {
  /** 订单号 */
  orderNo: string;
  /** 结算本金，取最新报价的 betAmount（OB 只支持全额结算） */
  settleAmount: number;
  /** 结算返还金额，取最新报价的 preSettleMaxWin */
  frontSettleAmount: number;
  /** 设备类型，固定 1 */
  deviceType?: number;
}

/**
 * OB 提交提前结算
 * 对齐 Flutter redemptionEarly。注意：服务端常以 0400524 错误码表示「已受理，去查结算单状态」，
 * 调用方需捕获该错误码后再轮询 queryOrderPreSettleConfirmOb。
 */
export const orderPreSettleOb = (params: TOrderPreSettleObParams) => {
  return requestOB.post<unknown, TOrderPreSettleObParams & { cuid: string }>(
    '/yewu13/v1/betOrder/orderPreSettle',
    {
      body: {
        deviceType: 1,
        ...params,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
