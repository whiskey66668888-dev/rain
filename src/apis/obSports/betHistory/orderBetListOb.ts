import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObOrderRecord } from './types';

export interface TOrderBetListObParams {
  /** 0 查未结算，1 查已结算 */
  orderStatus: number;
  /** 开始时间，13位时间戳，已结算才传 */
  beginTime?: number;
  /** 结束时间，13位时间戳，已结算才传 */
  endTime?: number;
  /** 页码，从1开始 */
  page: number;
  /** 每页条数 */
  size: number;
}

export interface TOrderBetListObData {
  /** 总条数（字符串） */
  total: string;
  /** 总投注金额（字符串） */
  betTotalAmount: string;
  /** 总输赢（字符串） */
  profit: string;
  records: TObOrderRecord[];
}

/**
 * OB 注单列表（未结算 / 已结算）
 * 对齐 Flutter getOBOrderList
 */
export const orderBetListOb = (params: TOrderBetListObParams) => {
  return requestOB.post<TOrderBetListObData, TOrderBetListObParams & { cuid: string }>(
    '/yewu13/v1/betOrder/client/getOrderListV3PB',
    {
      body: {
        ...params,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
