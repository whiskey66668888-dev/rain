import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

export interface CarouselItem {
  id: number;
  isActivity: boolean;
  jumpType: number; // 跳转类型：0-不跳转，1-内部跳转，2-外部跳转
  imageUrl?: string;
  daytimeMaterialContent: string; // 日间图片
  nightMaterialContent: string; // 夜间图片
  resourceName: string;
  targetAddress: string; // 跳转地址
  webTargetAddress: string; // 新增PC端跳转地址
  appTargetAddress: string; // 新增移动端跳转地址
  sort: number;
}

export enum PidType {
  Mine = 1, // 我的
  MineBottom = 2, // 我的 底部banner
  Home = 3, // home
  Login = 8, // 登录
  HotEvent = 9, // 热门
}

export interface CarouselResParams {
  pid: PidType; // 位置ID
  isMobile?: boolean; // 是否为移动端，用于选择接口和 carrierEnd
}

interface QueryCarouselResParams {
  carrierEnd: 'WEB' | 'H5' | 'APP';
  pid: PidType;
}

export type CarouselResResponse = CarouselItem[];

/**
 * 获取 Banner 列表
 * @param params
 * @returns Promise<CarouselResResponse>
 */
export const getCarouselResReq = (
  params: CarouselResParams,
): Promise<ResponseData<CarouselResResponse>> => {
  // 根据设备类型设置 carrierEnd：PC端=WEB，移动端=H5
  const carrierEnd: 'WEB' | 'H5' | 'APP' = params.isMobile ? 'H5' : 'WEB';
  return request.post<CarouselResResponse, QueryCarouselResParams>(
    '/api/website/getCarouselResourceSlots',
    {
      body: {
        carrierEnd,
        pid: params.pid,
      },
      isErrorToast: false,
    },
  );
};

/**
 * 获取 Banner 列表的 React Query Hook
 */
export const useCarouselResQuery = (
  params: CarouselResParams,
): ReturnType<typeof useQueryHook<CarouselResResponse, Error>> => {
  return useQueryHook<CarouselResResponse, Error>({
    queryKey: ['website', 'getCarouselResourceSlots', params],
    queryFn: () => getCarouselResReq(params).then((res) => res.data || []),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
