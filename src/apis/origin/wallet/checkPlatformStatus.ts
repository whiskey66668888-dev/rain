import request from '@/core/sdk/request';

/**
 * 检查场馆钱包是否锁定
 * 接口：POST /api/game/check/platform/status
 */

export interface TCheckPlatformStatusParams {
  gameId: number;
}

// {"code":1,"info":"场馆钱包未锁定，请继续转账"}

export const checkPlatformStatusReq = (params: TCheckPlatformStatusParams) => {
  return request.post('/api/game/check/platform/status', {
    body: params,
  });
};
