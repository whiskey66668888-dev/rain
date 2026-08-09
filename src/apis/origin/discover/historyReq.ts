import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import { discoverMatchAnalysisQueryKey } from './constants';
import { getOpenImConfig } from './imConfig';
import { normalizeMatchAnalysis, type MatchAnalysisData } from './historyTypes';

/**
 * 获取赛事分析（历史交锋/近期战绩/进球分布）
 * 接口：POST /v2/sport/sd/match/analysis
 */
export const getDiscoverMatchAnalysisReq = (params: {
  scheduleId: string;
  sportType: number;
}): Promise<MatchAnalysisData | null> =>
  requestOpenIm
    .post<
      Record<string, unknown>,
      { schedule_id: string; sport_type: number },
      MatchAnalysisData
    >('/v2/sport/sd/match/analysis', {
      body: { schedule_id: params.scheduleId, sport_type: params.sportType },
      isErrorToast: false,
      transformResponse: (res) => ({
        ...res,
        data: normalizeMatchAnalysis(res.data ?? {}),
      }),
    })
    .then((res) => res.data ?? null)
    .catch(() => null);

/** 发现页赛事分析 */
export const useDiscoverMatchAnalysisQuery = (
  scheduleId: string | null,
  sportType: number | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<MatchAnalysisData | null, Error>> =>
  useQueryHook<MatchAnalysisData | null, Error>({
    queryKey:
      scheduleId && sportType !== null
        ? [...discoverMatchAnalysisQueryKey(scheduleId, sportType)]
        : ['origin', 'discover', 'matchAnalysis'],
    enabled: enabled && !!scheduleId && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () =>
      getDiscoverMatchAnalysisReq({
        scheduleId: scheduleId as string,
        sportType: sportType as number,
      }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
