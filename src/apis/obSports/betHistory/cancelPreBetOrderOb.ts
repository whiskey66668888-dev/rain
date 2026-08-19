import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

/**
 * 取消 OB 预约注单
 * 对齐 Flutter cancelPreBetOrder：GET，成功即无异常返回
 */
export const cancelPreBetOrderOb = ({ orderNo }: { orderNo: string }) => {
  const query = new URLSearchParams({
    orderNo,
    cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    rdm: `${Date.now()}`,
  });
  return requestOB.get<unknown, object>(
    `/yewu13/v1/betOrder/client/cancelPreBetOrder?${query.toString()}`,
    { isErrorToast: false },
  );
};
