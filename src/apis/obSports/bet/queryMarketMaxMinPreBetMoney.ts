import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObBetMoneyReqItem, TObBetMoneyRespItem } from './types';

interface TQueryMarketMaxMinPreBetMoneyBody {
  orderMaxBetMoney: TObBetMoneyReqItem[];
  cuid: string;
}

/**
 * OB 查询「预约投注」限额，参数与 queryMarketMaxMinBetMoney 相同，
 * 返回的 orderMaxPay 是最大可赢金额，实际最大本金需再除以预约赔率。
 * 对齐 Flutter getOBReserveBetInfoReq
 */
export const queryMarketMaxMinPreBetMoneyOb = (orderMaxBetMoney: TObBetMoneyReqItem[]) => {
  return requestOB.post<TObBetMoneyRespItem[], TQueryMarketMaxMinPreBetMoneyBody>(
    '/yewu13/v1/betOrder/client/queryMarketMaxMinPreBetMoney',
    {
      body: {
        orderMaxBetMoney,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
