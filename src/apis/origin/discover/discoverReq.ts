import { useQueryHook } from '@/core/query/hooks';
import requestOpenIm from '@/core/sdk/requestOpenIm';

import {
  DISCOVER_VENUE_TYPE_FB,
  discoverChatConfigQueryKey,
  discoverMatchTabsQueryKey,
  discoverNmMatchIdQueryKey,
} from './constants';
import { getOpenImConfig, OPEN_IM_CONFIG_QUERY_KEY, useOpenImConfigQuery } from './imConfig';
import {
  isDiscoverEnabled,
  normalizeChatConfigInfo,
  normalizeMatchDiscoverTabs,
  type ChatConfigInfo,
  type DiscoverIndexOddsResponse,
} from './types';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';

import { GOAL_SUB_TAB_TITLE, USE_GOAL_MOCK_FALLBACK } from './goalMock';

/**
 * 兜底：近期足球比赛后端 tab 列表常缺「进球」，与 goalMock 同一开关下补进该 tab。
 * 只对足球、且已有其他 tab 的列表补全，避免篮球误入或发现整体不可用时凭空冒出 tab。
 */
const withGoalTabFallback = (tabs: string[], sportType: number): string[] => {
  if (
    !USE_GOAL_MOCK_FALLBACK ||
    sportType !== Number(FBSportIdValue.Football) ||
    tabs.length === 0 ||
    tabs.includes(GOAL_SUB_TAB_TITLE)
  ) {
    return tabs;
  }
  if (USE_GOAL_MOCK_FALLBACK) {
    return [...tabs, GOAL_SUB_TAB_TITLE];
  }
  return tabs;
};

/**
 * 获取聊天/发现配置
 * 接口：POST /v1/emc/config/info
 */
export const getChatConfigReq = (sportType: number): Promise<ChatConfigInfo | null> =>
  requestOpenIm
    .post<ChatConfigInfo, { sport_type: number }, ChatConfigInfo>('/v1/emc/config/info', {
      body: { sport_type: sportType },
      isErrorToast: false,
      transformResponse: (res) => ({
        ...res,
        data: normalizeChatConfigInfo(res.data ?? {}),
      }),
    })
    .then((res) => res.data ?? null)
    .catch(() => null);

/**
 * 通过 FB matchId 换取纳米 schedule_id
 * 接口：POST /v1/game/search/nm_match_id
 */
export const getNmMatchIdReq = (
  matchId: string,
  venueType: number = DISCOVER_VENUE_TYPE_FB,
): Promise<string | null> =>
  requestOpenIm
    .post<{ nm_match_id?: string }, { match_id: string; type: number }, string | null>(
      '/v1/game/search/nm_match_id',
      {
        body: { match_id: matchId, type: venueType },
        isErrorToast: false,
        transformResponse: (res) => ({
          ...res,
          data: res.data?.nm_match_id?.trim() || null,
        }),
      },
    )
    .then((res) => res.data ?? null)
    .catch(() => null);

/**
 * 获取发现页可用子 tab
 * 接口：POST /v2/sport/match/tab
 */
export const getMatchDiscoverTabsReq = (
  scheduleId: string,
  sportType: number,
): Promise<string[] | null> =>
  requestOpenIm
    .post<Record<string, unknown>, { sport_type: number; schedule_id: string }, string[]>(
      '/v2/sport/match/tab',
      {
        body: { sport_type: sportType, schedule_id: scheduleId },
        isErrorToast: false,
        transformResponse: (res) => {
          const tabs = withGoalTabFallback(normalizeMatchDiscoverTabs(res.data), sportType);
          return { ...res, data: tabs };
        },
      },
    )
    .then((res) => res.data ?? null)
    .catch(() => null);

/** 发现页聊天配置 */
export const useDiscoverChatConfigQuery = (
  sportType: number | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<ChatConfigInfo | null, Error>> =>
  useQueryHook<ChatConfigInfo | null, Error>({
    queryKey:
      sportType === null
        ? [...OPEN_IM_CONFIG_QUERY_KEY, 'chatConfig']
        : [...discoverChatConfigQueryKey(sportType)],
    enabled: enabled && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () => getChatConfigReq(sportType as number),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

/** 纳米 schedule_id */
export const useDiscoverNmMatchIdQuery = (
  matchId: string,
  enabled: boolean,
): ReturnType<typeof useQueryHook<string | null, Error>> =>
  useQueryHook<string | null, Error>({
    queryKey: [...discoverNmMatchIdQueryKey(matchId)],
    enabled: enabled && !!matchId && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () => getNmMatchIdReq(matchId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

/** 发现页子 tab 列表 */
export const useDiscoverMatchTabsQuery = (
  scheduleId: string | null,
  sportType: number | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<string[] | null, Error>> =>
  useQueryHook<string[] | null, Error>({
    queryKey:
      scheduleId && sportType !== null
        ? [...discoverMatchTabsQueryKey(scheduleId, sportType)]
        : ['origin', 'discover', 'matchTabs'],
    enabled: enabled && !!scheduleId && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () => getMatchDiscoverTabsReq(scheduleId as string, sportType as number),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const discoverIndexOddsQueryKey = (
  scheduleId: string,
  sportType: number,
  period: number,
  oddsType: number,
) => ['origin', 'discover', 'indexOdds', scheduleId, sportType, period, oddsType] as const;

export const getDiscoverIndexOddsReq = (params: {
  scheduleId: string;
  sportType: number;
  period: number;
  oddsType: number;
}): Promise<DiscoverIndexOddsResponse | null> =>
  requestOpenIm
    .post<
      DiscoverIndexOddsResponse,
      { schedule_id: string; sport_id: number; period: number; odds_type: number },
      DiscoverIndexOddsResponse
    >('/v2/sport/sd/match/odds', {
      body: {
        schedule_id: params.scheduleId,
        sport_id: params.sportType,
        period: params.period,
        odds_type: params.oddsType,
      },
      isErrorToast: false,
    })
    .then((res) => res.data ?? null)
    .catch(() => null);

export const useDiscoverIndexOddsQuery = (
  scheduleId: string | null,
  sportType: number | null,
  period: number,
  oddsType: number,
  enabled: boolean,
): ReturnType<typeof useQueryHook<DiscoverIndexOddsResponse | null, Error>> =>
  useQueryHook<DiscoverIndexOddsResponse | null, Error>({
    queryKey:
      scheduleId && sportType !== null
        ? [...discoverIndexOddsQueryKey(scheduleId, sportType, period, oddsType)]
        : ['origin', 'discover', 'indexOdds'],
    enabled: enabled && !!scheduleId && sportType !== null && !!getOpenImConfig()?.reqApiUrl,
    queryFn: () =>
      getDiscoverIndexOddsReq({
        scheduleId: scheduleId as string,
        sportType: sportType as number,
        period,
        oddsType,
      }),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: false,
  });

export { isDiscoverEnabled, useOpenImConfigQuery };
