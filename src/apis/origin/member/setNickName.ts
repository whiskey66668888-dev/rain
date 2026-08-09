import request from '@/core/sdk/request';

export interface TSetNickNameParams {
  nickName: string;
}

export const setNickNameReq = (params: TSetNickNameParams) => {
  const query = new URLSearchParams({ nickName: params.nickName });
  return request.get<unknown, void>(`/api/member/info/edit?${query.toString()}`, {
    isErrorToast: true,
  });
};
