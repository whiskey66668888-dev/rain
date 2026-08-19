import { useQueryHook } from '@/core/query';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { querystringStringify } from '@/utils';

export interface PopularEventsLiveResponse {
  matchIdList: string[];
  matchIdVsWeekMap: Array<{
    jcWeek: string;
    jcId: string;
    matchId: string;
  }>;
}

export interface SportListByTypeParams {
  sportName?: string;
  gameType: string;
  type?: string;
}
export const popularEventsLiveReq = (
  params: SportListByTypeParams,
): Promise<ResponseData<PopularEventsLiveResponse>> => {
  const query = querystringStringify({ ...params });
  return request.get<PopularEventsLiveResponse, SportListByTypeParams, PopularEventsLiveResponse>(
    `https://api.live336.com/api/match/sport/listbytype?${query}`,
  );
};

/**
 * 获取 竞猜赛事列表的 React Query Hook
 * @returns 返回 竞猜赛事列表
 */
export function useSportListByTypeQuery(
  params: SportListByTypeParams,
  config: { enabled: boolean },
) {
  return useQueryHook<PopularEventsLiveResponse, Error>({
    queryKey: ['origin', 'sport', 'list', 'by', 'type', params],
    queryFn: () => popularEventsLiveReq(params).then((res) => res.data),
    staleTime: 10_000,
    retry: false,
    refetchInterval: 600000, // 60秒轮询
    enabled: config.enabled,
  });
}
