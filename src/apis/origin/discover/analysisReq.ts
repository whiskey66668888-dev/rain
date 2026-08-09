import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import { discoverAnalysisQueryKey } from './constants';
import { getOpenImConfig } from './imConfig';
import { normalizeAnalysisData, type AnalysisData } from './analysisTypes';

/**
 * 获取赛事分析
 * 接口：POST /v2/sport/sd/match/analysis
 */
export const getDiscoverAnalysisReq = (params: {
  scheduleId: string;
  sportType: number;
}): Promise<AnalysisData | null> =>
  requestOpenIm
    .post<Record<string, unknown>, { schedule_id: string; sport_type: number }, AnalysisData>(
      '/v2/sport/sd/match/analysis',
      {
        body: {
          schedule_id: params.scheduleId,
          sport_type: params.sportType,
        },
        isErrorToast: false,
        transformResponse: (res) => ({
          ...res,
          data: normalizeAnalysisData(res.data ?? {}),
        }),
      },
    )
    .then((res) => res.data ?? null)
    .catch(() => null);

/** 发现页赛事分析 */
export const useDiscoverAnalysisQuery = (
  scheduleId: string | null,
  sportType: number | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<AnalysisData | null, Error>> =>
  useQueryHook<AnalysisData | null, Error>({
    queryKey:
      scheduleId && sportType !== null
        ? [...discoverAnalysisQueryKey(scheduleId, sportType)]
        : ['origin', 'discover', 'analysis'],
    enabled: enabled && !!scheduleId && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () =>
      getDiscoverAnalysisReq({
        scheduleId: scheduleId as string,
        sportType: sportType as number,
      }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
