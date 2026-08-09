import request from '@/core/sdk/request';
import { TNewsMsgItem } from './newsInbox';

export const getNewsOutboxReq = () => {
  return request.post<TNewsMsgItem[], unknown>('/api/center/news/outbox', {
    body: {},
  });
};
