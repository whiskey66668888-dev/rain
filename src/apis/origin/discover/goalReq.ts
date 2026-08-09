import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import { discoverGoalQueryKey } from './constants';
import { getOpenImConfig } from './imConfig';
import { normalizeGoalData, type GoalData } from './goalTypes';
import { mockGoalData, USE_GOAL_MOCK_FALLBACK } from './goalMock';

/**
 * 获取赛事进球数据
 * 接口：POST /v2/sport/match/goal
 */
export const getGoalReq = (scheduleId: string): Promise<GoalData | null> =>
  requestOpenIm
    .post<Record<string, unknown>, { schedule_id: string }, GoalData | null>(
      '/v2/sport/match/goal',
      {
        body: { schedule_id: scheduleId },
        isErrorToast: false,
        transformResponse: (res) => ({
          ...res,
          data: normalizeGoalData(res.data ?? {}),
        }),
      },
    )
    .then((res) => res.data ?? (USE_GOAL_MOCK_FALLBACK ? mockGoalData : null))
    .catch(() => (USE_GOAL_MOCK_FALLBACK ? mockGoalData : null));

/** 发现页进球数据 */
export const useGoalQuery = (
  scheduleId: string | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<GoalData | null, Error>> =>
  useQueryHook<GoalData | null, Error>({
    queryKey: scheduleId ? [...discoverGoalQueryKey(scheduleId)] : ['origin', 'discover', 'goal'],
    enabled: enabled && !!scheduleId && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () => getGoalReq(scheduleId as string),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
