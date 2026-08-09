import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query';

export interface DiscountDetail {
  addTime: number;
  beginTime: number;
  bonusTypeId: number;
  content: string;
  endTime: number;
  id: number;
  title: string;
  topImageApp: string;
  topImageWeb: string;
  url: string;
  wapImg: string;
  webImg: string;
  info: string;
}

export interface params {
  /** 活动 ID */
  id: string;
  isMobile: boolean;
  visitSource?: string;
}
export const getDiscountinfo = (params: params) => {
  return request.post<DiscountDetail, params>('/api/website/discount/get', {
    isErrorToast: false,
    tokenExpiresnotGoLogin: true,
    body: params,
    headers: {
      visitType: params.isMobile ? 'APP' : 'WEB',
      visitSource: params.visitSource ?? (params.isMobile ? 'H5' : 'PC'),
    },
  });
};

//
export const useDiscountinfoQuery = (id: string, isMobile: boolean, visitSource?: string) => {
  return useQueryHook({
    queryKey: ['discountInfo', id],
    queryFn: () => getDiscountinfo({ id, isMobile, visitSource }),
    // select: (response) => response.data,
  });
};
