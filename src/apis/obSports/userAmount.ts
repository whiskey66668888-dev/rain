import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

export interface TObUserAmountResponse {
  /** 场馆钱包余额 */
  amount: number | string;
}

/**
 * OB 场馆钱包余额
 * 对齐 Flutter getOBAmountReq：GET /yewu12/api/user/amount
 */
export const getUserAmountOb = () => {
  const query = new URLSearchParams({
    cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    rdm: `${Date.now()}`,
  });
  return requestOB.get<TObUserAmountResponse, object>(
    `/yewu12/api/user/amount?${query.toString()}`,
    { isErrorToast: false },
  );
};
