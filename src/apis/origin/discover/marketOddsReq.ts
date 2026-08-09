import { useQueryHook } from '@/core/query/hooks';
import { querystringStringify } from '@/utils';

import {
  normalizeMarketOddsHistoryPage,
  normalizeMarketOddsList,
  type MarketOddsEntryItem,
  type MarketOddsHistoryPage,
  type MarketOddsHistoryParams,
  type MarketOddsListParams,
} from './marketOddsTypes';

const getOddsDomain = (): string => {
  const domain = __SITE_CONFIG__.api.oddsDomain?.replace(/\/$/, '');
  return domain || 'https://api.test100.cc';
};

const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`marketOdds request failed: ${response.status}`);
  }
  return response.json();
};

/** GET {oddsDomain}/api/match/marketOdds/list */
export const getMarketOddsListReq = async (
  params: MarketOddsListParams,
): Promise<MarketOddsEntryItem[]> => {
  const query = querystringStringify({ ...params });
  const raw = await fetchJson(`${getOddsDomain()}/api/match/marketOdds/list?${query}`);
  return normalizeMarketOddsList(raw);
};

/** GET {oddsDomain}/api/match/marketOdds/history */
export const getMarketOddsHistoryReq = async (
  params: MarketOddsHistoryParams,
): Promise<MarketOddsHistoryPage | null> => {
  try {
    const query = querystringStringify({ ...params });
    const raw = await fetchJson(`${getOddsDomain()}/api/match/marketOdds/history?${query}`);
    return normalizeMarketOddsHistoryPage(raw);
  } catch {
    return null;
  }
};

export const marketOddsListQueryKey = (
  matchId: string,
  platform: string,
  matchDataScope: string,
  playType: number,
) =>
  [
    'origin',
    'discover',
    'marketOdds',
    'list',
    matchId,
    platform,
    matchDataScope,
    playType,
  ] as const;

export const useMarketOddsListQuery = (
  params: MarketOddsListParams | null,
  enabled: boolean,
): ReturnType<typeof useQueryHook<MarketOddsEntryItem[], Error>> =>
  useQueryHook<MarketOddsEntryItem[], Error>({
    queryKey: params
      ? [
          ...marketOddsListQueryKey(
            params.matchId,
            params.platform,
            params.matchDataScope,
            params.playType,
          ),
        ]
      : ['origin', 'discover', 'marketOdds', 'list'],
    enabled: enabled && !!params?.matchId,
    queryFn: () => getMarketOddsListReq(params as MarketOddsListParams),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    // 轮询失败时保留上一份数据，避免列表被清空导致弹层内容闪空
    placeholderData: (previousData) => previousData,
    retry: false,
  });
