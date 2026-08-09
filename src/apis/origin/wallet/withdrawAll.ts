import request from '@/core/sdk/request';

/**
 * 一键回收
 * 接口：POST /game/withdraw/all
 */
export const withdrawAllReq = () => {
  return request.post('/api/game/withdraw/all', { isErrorToast: false });
};
