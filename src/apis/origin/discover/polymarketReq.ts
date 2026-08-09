import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import { discoverPolymarketBackgroundQueryKey } from './constants';
import { getOpenImConfig } from './imConfig';
import { normalizePolymarketBackground, type PolymarketBackgroundData } from './polymarketTypes';

/**
 * 获取盘口背景（Polymarket 市场背景）
 * 接口：POST /v2/sport/sd/match/polymarket/background
 */
export const getDiscoverPolymarketBackgroundReq = (params: {
  scheduleId: string;
  sportType: number;
}): Promise<PolymarketBackgroundData | null> =>
  requestOpenIm
    .post<
      Record<string, unknown>,
      { schedule_id: string; sport_type: number; include_review: boolean },
      PolymarketBackgroundData
    >('/v2/sport/sd/match/polymarket/background', {
      body: {
        schedule_id: params.scheduleId,
        sport_type: params.sportType,
        include_review: false,
      },
      isErrorToast: false,
      transformResponse: (res) => ({
        ...res,
        data: normalizePolymarketBackground(res.data ?? {}),
      }),
    })
    .then((res) => res.data ?? null)
    .catch(() => null);

/** 发现页盘口背景 */
export const useDiscoverPolymarketBackgroundQuery = (
  scheduleId: string | null,
  sportType: number | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<PolymarketBackgroundData | null, Error>> =>
  useQueryHook<PolymarketBackgroundData | null, Error>({
    queryKey:
      scheduleId && sportType !== null
        ? [...discoverPolymarketBackgroundQueryKey(scheduleId, sportType)]
        : ['origin', 'discover', 'polymarketBackground'],
    enabled: enabled && !!scheduleId && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () =>
      getDiscoverPolymarketBackgroundReq({
        scheduleId: scheduleId as string,
        sportType: sportType as number,
      }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
