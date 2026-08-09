import request from '@/core/sdk/request';

export const getMessageSumReq = () => {
  return request.post<number, unknown>('/api/center/message/messageSum', {
    body: {},
  });
};
