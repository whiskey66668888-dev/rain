import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObBetMoneyReqItem, TObBetMoneyRespItem } from './types';

interface TQueryMarketMaxMinBetMoneyBody {
  orderMaxBetMoney: TObBetMoneyReqItem[];
  cuid: string;
}

/**
 * OB 查询投注限额。
 * 单关（openMiltSingle=1）按投注项返回 minBet/orderMaxPay；
 * 串关（openMiltSingle=0）返回各串关类型的 type/seriesOdds/minBet/orderMaxPay。
 * 对齐 Flutter getOBMarketMaxMinBetMoneyReq
 */
export const queryMarketMaxMinBetMoneyOb = (orderMaxBetMoney: TObBetMoneyReqItem[]) => {
  return requestOB.post<TObBetMoneyRespItem[], TQueryMarketMaxMinBetMoneyBody>(
    '/yewu13/v1/betOrder/client/queryMarketMaxMinBetMoney',
    {
      body: {
        orderMaxBetMoney,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
