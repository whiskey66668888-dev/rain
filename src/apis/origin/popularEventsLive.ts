import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

export interface PopularEventsLiveResponse {
  mid: string;
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
