import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObOrderRecord } from './types';

export interface TReserveBetListObParams {
  /** 预约状态集合：[0] 预约中，[2,3,4] 已失效 */
  preOrderStatusList: number[];
  /** 开始时间，13位时间戳 */
  beginTime?: number;
  /** 结束时间，13位时间戳 */
  endTime?: number;
  page: number;
  size: number;
}

export interface TReserveBetListObData {
  /** 总条数（字符串） */
  total: string;
  /** 总输赢（字符串） */
  profit: string;
  /** 按日期分组的注单，形如 { '2026-07-30': { data: [...] } } */
  record?: Record<string, { data: TObOrderRecord[] } | null> | null;
}

/**
 * OB 预约注单列表
 * 对齐 Flutter getObReserveBetList
 */
export const reserveBetListOb = (params: TReserveBetListObParams) => {
  return requestOB.post<TReserveBetListObData, TReserveBetListObParams & { cuid: string }>(
    '/yewu13/v1/betOrder/client/getH5PreBetOrderlist',
    {
      body: {
        ...params,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
