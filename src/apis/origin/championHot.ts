import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';

export interface GetChampionHotParams {
  /** 场馆类型 */
  sportType: 'OP';
  sportId: number;
}

/** 解析接口 data：运营配置的热门冠军联赛名称列表 */
const parseChampionHotNames = (raw: unknown): string[] => {
  if (raw == null) return [];
  const list = Array.isArray(raw)
    ? raw
    : ((raw as { list?: unknown }).list ?? (raw as { records?: unknown }).records);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const record = item as { name?: string; na?: string; leagueName?: string };
        return (record.leagueName ?? record.na ?? record.name ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
};

export const getChampionHotReq = (
  params: GetChampionHotParams,
): Promise<ResponseData<string[]>> => {
  return request.post<unknown, GetChampionHotParams, string[]>('/api/website/champion/hot', {
    body: {
      sportType: params.sportType,
      sportId: params.sportId,
    },
    isErrorToast: false,
    transformResponse: (res) => ({
      ...res,
      data: parseChampionHotNames(res.data),
    }),
  });
};

export const useChampionHotQuery = (sportId: number) => {
  return useQueryHook<string[], Error>({
    queryKey: ['origin', 'champion', 'hot', sportId],
    queryFn: () =>
      getChampionHotReq({ sportType: 'OP', sportId })
        .then((res) => res.data ?? [])
        .catch(() => []),
    enabled: Number.isFinite(sportId) && sportId > 0,
    staleTime: 60 * 1000,
    retry: false,
  });
};
