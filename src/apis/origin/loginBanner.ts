import type { QueryClient } from '@tanstack/react-query';

import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

export interface LoginBannerItem {
  bannerId?: number;
  imageUrl?: string;
  daytimeMaterialContent?: string; // 日间图片
  nightMaterialContent?: string; // 夜间图片
  jumpType?: number; // 跳转类型：0-不跳转，1-内部跳转，2-外部跳转
  targetAddress?: string; // 跳转地址
  title?: string;
}

export interface GetLoginBannerParams {
  pid?: number; // 位置ID，登录注册页面使用 8
  isMobile?: boolean; // 是否为移动端，用于选择接口和 carrierEnd
}

export const LOGIN_BANNER_STALE_MS = 15 * 60 * 1000;

export const LOGIN_BANNER_DEFAULT_PARAMS: GetLoginBannerParams[] = [
  { pid: 8, isMobile: false },
  { pid: 8, isMobile: true },
];

export interface GetLoginBannerRequestBody {
  carrierEnd: 'WEB' | 'H5' | 'APP';
  pid?: number;
}

export type GetLoginBannerResponse = LoginBannerItem[];

/**
 * 获取登录注册页面 Banner 列表
 * @param params
 * @returns Promise<GetLoginBannerResponse>
 */
export const getLoginBannerReq = (
  params: GetLoginBannerParams = { pid: 8, isMobile: false },
): Promise<ResponseData<GetLoginBannerResponse>> => {
  // PC端使用 webjson 接口，移动端使用 website 接口
  //   const apiPath = params.isMobile
  //     ? '/api/website/getCarouselResourceSlots'
  //     : '/webjson/getCarouselResourceSlots';
  const apiPath = '/api/website/getCarouselResourceSlots';

  // 根据设备类型设置 carrierEnd：PC端=WEB，移动端=H5
  const carrierEnd: 'WEB' | 'H5' | 'APP' = params.isMobile ? 'H5' : 'WEB';

  return request.post<GetLoginBannerResponse, GetLoginBannerRequestBody>(apiPath, {
    body: {
      carrierEnd,
      ...(params.pid !== undefined && { pid: params.pid }),
    },
    isErrorToast: false,
  });
};

const fetchLoginBannerData = (params: GetLoginBannerParams): Promise<GetLoginBannerResponse> =>
  getLoginBannerReq(params).then((res) => res.data || []);

/**
 * 获取登录注册页面 Banner 列表的 React Query Hook
 */
export const useLoginBannerQuery = (
  params: GetLoginBannerParams = { pid: 8, isMobile: false },
): ReturnType<typeof useQueryHook<GetLoginBannerResponse, Error>> => {
  return useQueryHook<GetLoginBannerResponse, Error>({
    queryKey: ['origin', 'loginBanner', params],
    queryFn: () => fetchLoginBannerData(params),
    staleTime: LOGIN_BANNER_STALE_MS,
    retry: false,
  });
};

/**
 * 应用启动时预取登录/注册弹窗 Banner
 */
export function prefetchLoginBanners(queryClient: QueryClient): void {
  for (const params of LOGIN_BANNER_DEFAULT_PARAMS) {
    void queryClient.prefetchQuery({
      queryKey: ['origin', 'loginBanner', params],
      queryFn: () => fetchLoginBannerData(params),
      staleTime: LOGIN_BANNER_STALE_MS,
      retry: false,
    });
  }
}
