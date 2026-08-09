import request from '@/core/sdk/request';

export const findMessageReq = (id: number) => {
  return request.post<null, { id: number }>('/api/center/news/findMessage', {
    body: { id },
  });
};
