import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import type { BasketLiveData, BasketStatsData } from './basketballTypes';

export const discoverBasketStatsQueryKey = (scheduleId: string) =>
  ['origin', 'discover', 'basketStats', scheduleId] as const;

export const discoverBasketLiveQueryKey = (scheduleId: string, periodId: number) =>
  ['origin', 'discover', 'basketLive', scheduleId, periodId] as const;

export const getDiscoverBasketStatsReq = (scheduleId: string): Promise<BasketStatsData | null> =>
  requestOpenIm
    .post<BasketStatsData, { schedule_id: string }, BasketStatsData>(
      '/v2/sport/sd/basket/match/stats',
      {
        body: { schedule_id: scheduleId },
        isErrorToast: false,
      },
    )
    .then((res) => res.data ?? null)
    .catch(() => null);

export const getDiscoverBasketLiveReq = (
  scheduleId: string,
  periodId = 0,
): Promise<BasketLiveData | null> =>
  requestOpenIm
    .post<BasketLiveData, { schedule_id: string; period_id: number }, BasketLiveData>(
      '/v2/sport/sd/basket/match/live',
      {
        body: { schedule_id: scheduleId, period_id: periodId },
        isErrorToast: false,
      },
    )
    .then((res) => res.data ?? null)
    .catch(() => null);

export const useDiscoverBasketStatsQuery = (scheduleId: string | null, enabled: boolean) =>
  useQueryHook<BasketStatsData | null, Error>({
    queryKey: scheduleId
      ? [...discoverBasketStatsQueryKey(scheduleId)]
      : ['origin', 'discover', 'basketStats'],
    enabled: enabled && !!scheduleId,
    queryFn: () => getDiscoverBasketStatsReq(scheduleId as string),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: false,
  });

export const useDiscoverBasketLiveQuery = (
  scheduleId: string | null,
  periodId: number,
  enabled: boolean,
) =>
  useQueryHook<BasketLiveData | null, Error>({
    queryKey: scheduleId
      ? [...discoverBasketLiveQueryKey(scheduleId, periodId)]
      : ['origin', 'discover', 'basketLive'],
    enabled: enabled && !!scheduleId,
    queryFn: () => getDiscoverBasketLiveReq(scheduleId as string, periodId),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: false,
  });
