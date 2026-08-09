import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';
import { ResponseData } from '@/core/sdk/request/model';

/**
 * 获取三方FB api配置
 **/
export interface FBTokenResponse {
  appUrl: string;
  token: string;
  apiList: string[];
}
export const getFBTokenReq = (isLogin: boolean): Promise<ResponseData<FBTokenResponse>> => {
  return request.post(`/api/${isLogin ? 'game' : 'website'}/fb/token`, {
    body: {
      action: 'token',
      platform: 'h5',
    },
    tokenExpiresnotGoLogin: false,
    isErrorToast: false,
  });
};

/**
 * 获取三方OB api配置
 **/
export interface OBTokenResponse {
  loginUrlArr: [string];
  apiDomain: string;
  loginUrl: string;
  domain: string;
  apiDomainList: string;
  imgDomain: string;
  userId: string;
  url: string;
  token: string;
}
export const getOBTokenReq = (isLogin: boolean): Promise<ResponseData<OBTokenResponse>> => {
  return request.post(`/api/${isLogin ? 'game' : 'website'}/obsport/token`, {
    body: {},
    tokenExpiresnotGoLogin: false,
    isErrorToast: false,
  });
};

/**
 * 获取所有三方api配置
 */
export interface AllThirdPartyApiResponse {
  fb: ResponseData<FBTokenResponse>;
  ob: ResponseData<OBTokenResponse>;
}
export const getAllThirdPartyApiReq = (isLogin: boolean): Promise<AllThirdPartyApiResponse> => {
  return Promise.all([getFBTokenReq(isLogin), getOBTokenReq(isLogin)]).then(([fb, ob]) => ({
    fb,
    ob,
  }));
};

// // 场馆公告提示
export const getInfoSlide = () => {
  return request.post('/api/home/text/info/slide', {
    isErrorToast: false,
    body: {
      visitType: 'WAP',
    },
  });
};

export interface InfoSlideItem {
  id?: number;
  infoType?: string;
  sort?: number | string;
  title?: string;
  content?: string;
}

export const useInfoSlideQuery = (
  enabled = true,
): ReturnType<typeof useQueryHook<InfoSlideItem[], Error>> =>
  useQueryHook<InfoSlideItem[], Error>({
    queryKey: ['origin', 'infoSlide'],
    queryFn: async () => {
      const res = await getInfoSlide();
      const grouped = (res?.data ?? {}) as Record<string, InfoSlideItem[]>;
      return Object.entries(grouped).flatMap(([infoType, list]) =>
        (Array.isArray(list) ? list : []).map((item) => ({
          ...item,
          infoType: String(item.infoType ?? infoType),
        })),
      );
    },
    staleTime: 60 * 1000,
    retry: false,
    enabled,
  });

// 获取场馆余额
export const getBalance = () => {
  return request.post('/api/game/balance', {
    isErrorToast: false,
    body: {
      gameId: 1,
    },
  });
};
