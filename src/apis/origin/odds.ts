import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import request from '@/core/sdk/request';
import { WSStatus, createWSClient } from '@/core/sdk/WebSocketClient';

interface TeamInfo {
  id: string;
  name: string;
}

interface MatchOdds {
  matchId: string;
  league: string;
  startTime: number;
  home: TeamInfo;
  away: TeamInfo;
  odds: {
    europe: {
      home: number;
      draw: number;
      away: number;
    };
  };
}

interface OddsPage {
  list: MatchOdds[];
  nextPage: number | null;
}

interface OddsUpdateMessage {
  type: 'odds_update';
  payload: MatchOdds[];
}

export const getOddsPageReq = (page: number): Promise<OddsPage> => {
  return request
    .get<OddsPage, { page: number }>('/sports/odds', { body: { page } })
    .then((res) => res.data);
};

export const useOddsListQuery = (): ReturnType<
  typeof useInfiniteQuery<OddsPage, Error, InfiniteData<OddsPage>, readonly string[], number>
> =>
  useInfiniteQuery<OddsPage, Error, InfiniteData<OddsPage>, readonly string[], number>({
    queryKey: ['origin', 'odds', 'list'],
    queryFn: ({ pageParam }) => getOddsPageReq(pageParam),
    getNextPageParam: (last): number | null => last.nextPage,
    initialPageParam: 1,
    staleTime: 10_000,
  });

/**
 * 更新赔率列表缓存
 * @param queryClient - QueryClient
 * @param updater - 更新函数，接收 MatchOdds 并返回更新后的 MatchOdds
 *
 * @example
 * // 更新特定比赛的赔率
 * patchOddsListCache(queryClient, (odds) => {
 *   if (odds.matchId === 'match123') {
 *     return { ...odds, odds: { ...odds.odds, europe: { home: 2.0, draw: 3.0, away: 4.0 } } };
 *   }
 *   return odds;
 * });
 */
export const patchOddsListCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (m: MatchOdds) => MatchOdds,
): void => {
  queryClient.setQueryData<InfiniteData<OddsPage>>(
    ['origin', 'odds', 'list'],
    (old: InfiniteData<OddsPage> | undefined) => {
      if (!old) {
        return undefined;
      }
      const pages = old.pages.map((page) => ({
        ...page,
        list: page.list.map(updater),
      }));
      return { ...old, pages };
    },
  );
};

export const useOddsStream = (): {
  status: WSStatus;
  retryCount: number;
} => {
  const [status, setStatus] = useState<WSStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const wsRef = useRef<ReturnType<typeof createWSClient> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = createWSClient('/odds', {
      debug: false,
      onOpen: () => {
        setStatus('open');
        setRetryCount(0);
        client.send({ action: 'subscribe', channel: 'odds_all' });
      },
      onReconnect: (attempt) => {
        setStatus('reconnecting');
        setRetryCount(attempt);
      },
      onClose: () => setStatus('closed'),
      onMessage: (evt) => {
        try {
          const data = JSON.parse(evt.data as string) as OddsUpdateMessage;
          if (data.type === 'odds_update') {
            const updates = data.payload;
            patchOddsListCache(queryClient, (old) => {
              const found = updates.find((u) => u.matchId === old.matchId);
              return found ? { ...old, ...found } : old;
            });
          }
        } catch (e) {
          console.error('parse odds ws error', e);
        }
      },
    });

    wsRef.current = client;
    client.connect();

    return () => {
      client.destroy();
      wsRef.current = null;
    };
  }, [queryClient]);

  return { status, retryCount };
};
