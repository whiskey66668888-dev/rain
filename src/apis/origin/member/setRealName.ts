import request from '@/core/sdk/request';

export interface TSetRealNameParams {
  realName: string;
}

// 设置会员真实姓名
export const setRealNameReq = (params: TSetRealNameParams) => {
  return request.post<unknown, TSetRealNameParams>('/v3/member/setRealName', {
    body: params,
  });
};
