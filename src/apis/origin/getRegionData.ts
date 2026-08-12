import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';

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
export const useRegionDataQuery = () =>
  useQueryHook<TGetRegionData, Error>({
    queryKey: ['origin', 'region', 'data'],
    queryFn: async () => {
      const res = await getRegionDataReq();
      return res.data ?? [];
    },
    staleTime: 0,
    retry: false,
  });
