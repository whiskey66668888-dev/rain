import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';

export interface MemberSettingVo {
  modelName: string;
  value: string;
}

// export const memberSettingInitializeTestParams: MemberSettingVo[] = [
//   { modelName: 'userAvatar', value: '113131' },
// ];

export const memberSettingInitializeReq = (
  msv: MemberSettingVo[],
): Promise<ResponseData<unknown>> => {
  return request.post<unknown, string>('/api/member/memberSettingInitialize', {
    isErrorToast: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msv),
  });
};
