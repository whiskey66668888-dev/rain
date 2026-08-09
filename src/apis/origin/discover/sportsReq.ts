import { useQueryHook, type UseQueryHookOptions } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import type { DiscoverMatchInfo, LineUpData, LiveSituationData, PlayerStat } from './sportsTypes';

type DiscoverMatchInfoQueryOptions = Pick<
  UseQueryHookOptions<DiscoverMatchInfo, Error>,
  'gcTime' | 'refetchInterval' | 'refetchIntervalInBackground' | 'refetchOnMount' | 'staleTime'
>;

export const discoverLineUpQueryKey = (scheduleId: string) =>
  ['origin', 'discover', 'lineUp', scheduleId] as const;

export const discoverLiveSituationQueryKey = (scheduleId: string) =>
  ['origin', 'discover', 'liveSituation', scheduleId] as const;

export const discoverPlayerStatsQueryKey = (scheduleId: string, teamId: string) =>
  ['origin', 'discover', 'playerStats', scheduleId, teamId] as const;

export const discoverMatchInfoQueryKey = (scheduleId: string) =>
  ['origin', 'discover', 'matchInfo', scheduleId] as const;

export const getDiscoverMatchInfoReq = (
  scheduleId: string,
  sportType: number = 1,
): Promise<DiscoverMatchInfo> =>
  requestOpenIm
    .post<DiscoverMatchInfo, { schedule_id: string; sport_type: number }, DiscoverMatchInfo>(
      '/v2/sport/sd/match/byId',
      {
        body: { schedule_id: scheduleId, sport_type: sportType },
        isErrorToast: false,
      },
    )
    .then((res) => res.data);

export const getDiscoverLineUpReq = (
  scheduleId: string,
  homeTeamId?: string,
  awayTeamId?: string,
): Promise<LineUpData> =>
  requestOpenIm
    .post<LineUpData, Record<string, string>, LineUpData>('/v2/sport/sd/foot/match/lineup', {
      body: {
        schedule_id: scheduleId,
        ...(homeTeamId ? { home_team_id: homeTeamId } : {}),
        ...(awayTeamId ? { guest_team_id: awayTeamId } : {}),
      },
      isErrorToast: false,
    })
    .then((res) => res.data);

export const getDiscoverLiveSituationReq = (scheduleId: string): Promise<LiveSituationData> =>
  requestOpenIm
    .post<LiveSituationData, { schedule_id: string }, LiveSituationData>(
      '/v2/sport/sd/foot/match/stats',
      {
        body: { schedule_id: scheduleId },
        isErrorToast: false,
      },
    )
    .then((res) => res.data);

export const getDiscoverPlayerStatsReq = (
  scheduleId: string,
  teamId: string,
): Promise<PlayerStat[]> =>
  requestOpenIm
    .post<{ list?: PlayerStat[] }, { schedule_id: string; team_id: string }, PlayerStat[]>(
      '/v2/sport/sd/foot/match/playerStats',
      {
        body: { schedule_id: scheduleId, team_id: teamId },
        isErrorToast: false,
        transformResponse: (res) => ({
          ...res,
          data: res.data?.list ?? [],
        }),
      },
    )
    .then((res) => res.data ?? [])
    .catch(() => []);

export const useDiscoverLineUpQuery = (
  scheduleId: string | null,
  enabled: boolean,
  homeTeamId?: string,
  awayTeamId?: string,
) =>
  useQueryHook({
    queryKey: scheduleId
      ? [...discoverLineUpQueryKey(scheduleId), homeTeamId, awayTeamId]
      : ['origin', 'discover', 'lineUp'],
    enabled: enabled && !!scheduleId,
    queryFn: () => getDiscoverLineUpReq(scheduleId as string, homeTeamId, awayTeamId),
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
    retry: false,
  });

export const useDiscoverMatchInfoQuery = (
  scheduleId: string | null,
  enabled: boolean,
  sportType: number = 1,
  queryOptions?: DiscoverMatchInfoQueryOptions,
) =>
  useQueryHook({
    queryKey: scheduleId
      ? [...discoverMatchInfoQueryKey(scheduleId), sportType]
      : ['origin', 'discover', 'matchInfo'],
    enabled: enabled && !!scheduleId,
    queryFn: () => getDiscoverMatchInfoReq(scheduleId as string, sportType),
    staleTime: 5 * 60 * 1000,
    ...queryOptions,
  });

export const useDiscoverLiveSituationQuery = (scheduleId: string | null, enabled: boolean) =>
  useQueryHook({
    queryKey: scheduleId
      ? [...discoverLiveSituationQueryKey(scheduleId)]
      : ['origin', 'discover', 'liveSituation'],
    enabled: enabled && !!scheduleId,
    queryFn: () => getDiscoverLiveSituationReq(scheduleId as string),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });

export const useDiscoverPlayerStatsQuery = (
  scheduleId: string | null,
  teamId: string | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<PlayerStat[], Error>> =>
  useQueryHook<PlayerStat[], Error>({
    queryKey:
      scheduleId && teamId
        ? [...discoverPlayerStatsQueryKey(scheduleId, teamId)]
        : ['origin', 'discover', 'playerStats'],
    enabled: enabled && !!scheduleId && !!teamId,
    queryFn: () => getDiscoverPlayerStatsReq(scheduleId as string, teamId as string),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: false,
  });
