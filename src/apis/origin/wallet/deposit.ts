import request from '@/core/sdk/request';

/**
 * 一键转入
 * 接口：POST /api/game/deposit
 */

export interface TDepositAllParams {
  gameId: number;
}

export const depositAllReq = (params: TDepositAllParams) => {
  return request.post('/api/game/deposit', {
    body: params,
    isErrorToast: false,
  });
};
