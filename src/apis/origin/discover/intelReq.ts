import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import { discoverIntelQueryKey } from './constants';
import { getOpenImConfig } from './imConfig';
import { normalizeIntelData, type IntelData } from './intelTypes';

/** 情报类型：0-基础情报（默认） 1-精算师情报 */
export type IntelType = 0 | 1;

/**
 * 获取赛事情报
 * 接口：POST /v2/sport/sd/match/intel
 */
export const getDiscoverIntelReq = (params: {
  scheduleId: string;
  sportType: number;
  type: IntelType;
}): Promise<IntelData | null> =>
  requestOpenIm
    .post<
      Record<string, unknown>,
      { schedule_id: string; sport_type: number; type: IntelType },
      IntelData
    >('/v2/sport/sd/match/intel', {
      body: {
        schedule_id: params.scheduleId,
        sport_type: params.sportType,
        type: params.type,
      },
      isErrorToast: false,
      transformResponse: (res) => ({
        ...res,
        data: normalizeIntelData(res.data ?? {}),
      }),
    })
    .then((res) => res.data ?? null)
    .catch(() => null);

/** 发现页赛事情报 */
export const useDiscoverIntelQuery = (
  scheduleId: string | null,
  sportType: number | null,
  type: IntelType,
  enabled: boolean,
): ReturnType<typeof useQueryHook<IntelData | null, Error>> =>
  useQueryHook<IntelData | null, Error>({
    queryKey:
      scheduleId && sportType !== null
        ? [...discoverIntelQueryKey(scheduleId, sportType, type)]
        : ['origin', 'discover', 'intel'],
    enabled: enabled && !!scheduleId && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () =>
      getDiscoverIntelReq({
        scheduleId: scheduleId as string,
        sportType: sportType as number,
        type,
      }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
