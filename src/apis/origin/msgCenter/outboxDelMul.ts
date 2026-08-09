import request from '@/core/sdk/request';
import { querystringStringify } from '@/utils';

interface TDelMulParams {
  ids: string;
}

export const outboxDelMulReq = (params: TDelMulParams) => {
  const query = querystringStringify({ ...params });
  return request.get<void, TDelMulParams>(`/api/center/message/outbox/delMul?${query}`);
};
