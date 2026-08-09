import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
export interface TUserBaseParams {
  languageType?: FB_LANGUAGE_TYPE;
}

export interface TUserBaseResponse {
  currencyId: number;
  uid: string;
  bl: string;
  cbs: {
    bl: string;
    cid: number;
  }[];
}

// 获取用户基础信息
export const getUserBaseFb = (params: TUserBaseParams) => {
  return requestFB.post<TUserBaseResponse, TUserBaseParams>('/v1/user/base', {
    body: params,
  });
};
