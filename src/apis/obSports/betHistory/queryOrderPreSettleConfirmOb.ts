import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { TObPreSettleConfirmItem } from './types';

/**
 * OB 查询提前结算单状态（返回当前用户所有处理中的提前结算单，调用方按 orderNo 自行匹配）
 * 对齐 Flutter reqPreBetOrder。
 */
export const queryOrderPreSettleConfirmOb = () => {
  const query = new URLSearchParams({
    cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    rdm: `${Date.now()}`,
  });
  return requestOB.get<TObPreSettleConfirmItem[], object>(
    `/yewu13/v1/betOrder/client/queryOrderPreSettleConfirm?${query.toString()}`,
    { isErrorToast: false },
  );
};
