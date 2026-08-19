import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObLatestMarketReqItem, TObLatestMarketRespItem } from './types';

interface TQueryLatestMarketInfoBody {
  idList: TObLatestMarketReqItem[];
  cuid: string;
}

/**
 * OB 查询最新盘口信息（赔率、盘口值、封盘状态）
 * 对齐 Flutter getOBLatestMarketInfoReq
 */
export const queryLatestMarketInfoOb = (idList: TObLatestMarketReqItem[]) => {
  return requestOB.post<TObLatestMarketRespItem[], TQueryLatestMarketInfoBody>(
    '/yewu13/v1/betOrder/client/queryLatestMarketInfo',
    {
      body: {
        idList,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
