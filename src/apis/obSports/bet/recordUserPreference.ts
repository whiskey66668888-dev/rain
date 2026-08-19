import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { EObAcceptOdds } from './constants';

interface TRecordUserPreferenceBody {
  userBetPrefer: EObAcceptOdds;
  cuid: string;
}

/**
 * 上报「是否自动接受赔率变化」偏好。
 * OB 要求调用该接口后，投注参数里的 useAcceptOdds 才会生效，
 * 对齐 Flutter recordUserPreference：投注前异步调用，失败不阻断投注。
 */
export const recordUserPreferenceOb = (userBetPrefer: EObAcceptOdds) => {
  return requestOB.post<unknown, TRecordUserPreferenceBody>(
    '/yewu13/v1/betOrder/recordUserPreference',
    {
      body: {
        userBetPrefer,
        cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
      },
      isErrorToast: false,
    },
  );
};
