import request from '@/core/sdk/request';

export const readMessageAllReq = () => {
  return request.post<void, unknown>('/api/center/readMessageAll', {
    body: {},
  });
};
