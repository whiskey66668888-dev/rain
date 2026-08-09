import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';
import { isSSR } from '@/utils/env';

export interface TRegionDistrict {
  id: number;
  name: string;
}

export interface TRegionCity {
  id: number;
  name: string;
  districts: TRegionDistrict[];
}

export interface TRegionProvince {
  id: number;
  name: string;
  cities: TRegionCity[];
}

export type TGetRegionData = TRegionProvince[];

// 获取地区数据
export const getRegionDataReq = () =>
  request.post<TGetRegionData, void>('/api/region/getRegionData');

// React Query Hook：获取地区数据（省 / 市 / 区）
// SSR 不请求（queryFn 内直接返回 []，避免服务端调接口触发登录态校验）；客户端水合后再请求
export const useRegionDataQuery = () =>
  useQueryHook<TGetRegionData, Error>({
    queryKey: ['origin', 'region', 'data'],
    queryFn: async () => {
      if (isSSR()) return []; // 服务端不调接口，避免 9000 等登录态错误
      const res = await getRegionDataReq();
      return res.data ?? [];
    },
    staleTime: 0, // SSR 落盘为 []，客户端视为过期会 refetch 拿到真实数据
    retry: false,
  });
