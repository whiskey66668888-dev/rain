import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

/** popularEventsLive 三方来源：与 Flutter 一致 */
export enum PopularEventsLiveThreeParty {
  FB = 1,
  OB = 2,
}

export interface PopularEventsLiveResponse {
  mid: string;
  /** 1=FB，2=OB */
  threeParty?: number;
}

export const popularEventsLiveReq = (): Promise<ResponseData<PopularEventsLiveResponse[]>> => {
  return request.post<PopularEventsLiveResponse[], object>(
    'https://api.live336.com/api/popularEventsLive',
    {
      isErrorToast: true,
      body: {},
    },
  );
};
