import request from '@/core/sdk/request';
import { querystringStringify } from '@/utils';

interface TDelMulParams {
  ids: string;
}

export const inboxDelMulReq = (params: TDelMulParams) => {
  const query = querystringStringify({ ...params });
  return request.get<void, TDelMulParams>(`/api/center/message/inbox/delMul?${query}`);
};
