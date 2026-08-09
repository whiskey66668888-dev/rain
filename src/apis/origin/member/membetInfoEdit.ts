import request from '@/core/sdk/request';
import { EGender } from '../constants';

export interface TMemberInfoEditParams {
  gender?: EGender;
  birthDate?: string;
}

// 修改会员信息（目前仅性别）
export const updateMemberInfoEditReq = (params: TMemberInfoEditParams) => {
  return request.post<unknown, TMemberInfoEditParams>('/api/member/info/edit', {
    body: params,
  });
};
