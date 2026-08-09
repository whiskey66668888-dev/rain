import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import { discoverCornerKickQueryKey } from './constants';
import { getOpenImConfig } from './imConfig';
import { normalizeCornerKickData, type CornerKickData } from './cornerKickTypes';

/**
 * 获取赛事角球数据
 * 接口：POST /v2/sport/match/conner
 */
export const getCornerKickReq = (scheduleId: string): Promise<CornerKickData | null> =>
  requestOpenIm
    .post<Record<string, unknown>, { schedule_id: string }, CornerKickData>(
      '/v2/sport/match/conner',
      {
        body: { schedule_id: scheduleId },
        isErrorToast: false,
        transformResponse: (res) => ({
          ...res,
          data: normalizeCornerKickData(res.data ?? {}),
        }),
      },
    )
    .then((res) => res.data ?? null)
    .catch(() => null);

/** 发现页角球数据 */
export const useCornerKickQuery = (
  scheduleId: string | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<CornerKickData | null, Error>> =>
  useQueryHook<CornerKickData | null, Error>({
    queryKey: scheduleId
      ? [...discoverCornerKickQueryKey(scheduleId)]
      : ['origin', 'discover', 'cornerKick'],
    enabled: enabled && !!scheduleId && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () => getCornerKickReq(scheduleId as string),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
