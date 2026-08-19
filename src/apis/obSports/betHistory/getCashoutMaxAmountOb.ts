import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObCashoutAmountItem } from './types';

/**
 * OB 获取单个注单的最新提前结算报价
 * 对齐 Flutter getPriceByOrderNo：提交提前结算前先取一次最新价，避免用列表上的旧报价结算。
 */
export const getCashoutMaxAmountOb = ({ orderNo }: { orderNo: string }) => {
  const query = new URLSearchParams({
    orderNo,
    cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    rdm: `${Date.now()}`,
  });
  return requestOB.get<TObCashoutAmountItem, object>(
    `/yewu13/v1/betOrder/client/getCashoutMaxAmount?${query.toString()}`,
    { isErrorToast: false },
  );
};
