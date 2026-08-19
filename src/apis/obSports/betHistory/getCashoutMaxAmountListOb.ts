import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObCashoutAmountItem } from './types';

/**
 * OB 批量获取未结算注单的提前结算报价
 * 对齐 Flutter getPriceByOrderNos：GET，orderNo 用英文逗号拼接；
 * 返回列表中存在的注单才可提前结算，缺失即当前不支持。
 */
export const getCashoutMaxAmountListOb = ({ orderNos }: { orderNos: string[] }) => {
  const query = new URLSearchParams({
    orderNo: orderNos.join(','),
    cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    rdm: `${Date.now()}`,
  });
  return requestOB.get<TObCashoutAmountItem[], object>(
    `/yewu13/order/betRecord/getCashoutMaxAmountList?${query.toString()}`,
    { isErrorToast: false },
  );
};
