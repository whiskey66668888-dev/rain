import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderBetListFb } from '@/apis/fbSports/betHistory/orderBetListFb';
import { orderReserveBetListFb } from '@/apis/fbSports/betHistory/orderReserveBetListFb';
import type {
  TBetHistoryData,
  TBetHistoryOrderItem,
  TBetHistoryQueryParams,
} from '@/apis/commonSports/types';
import { EBetHistoryQueryType, EVenue } from '@/apis/commonSports/constants';
import {
  formatBetHistoryParamsFb,
  formatBetHistoryParamsReserveFb,
  formatBetHistoryRespFb,
  formatBetHistoryRespReserveFb,
} from '@/apis/fbSports/common/fbFormat';
import { useCallback } from 'react';
import { cancelReserveBetFb } from '@/apis/fbSports/betHistory/cancelReserveBetFb';
import { toast } from '@/common/components/Toast';
import { useQueryHook } from '@/core/query';
import { getListReq } from '@/apis/fbSports/getList';
import { EBetHistoryType } from './constants';

// ─── 公共类型 ──────────────────────────────────────────────────────────────────

const DEFAULT_STATS: TBetHistoryData['stats'] = {
  totalOrderCount: 0,
  totalBetAmount: 0,
  winOrLoseAmount: 0,
};

export type TBetListQueryResult = {
  list: TBetHistoryOrderItem[];
  total: number;
  stats: TBetHistoryData['stats'];
  isLoading: boolean;
  isFetching: boolean;
  /** 仅 infinite 模式（h5 / pc_sidebar）有值 */
  fetchNextPage?: ReturnType<typeof useInfiniteQuery>['fetchNextPage'];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

// ─── 共享请求逻辑（避免 infinite / page 两个 queryFn 重复写）──────────────────

const isReserveQuery = (queryType: EBetHistoryQueryType) =>
  queryType === EBetHistoryQueryType.RESERVE_IN_PROGRESS ||
  queryType === EBetHistoryQueryType.RESERVE_FAIL;

const fetchBetPage = async (
  params: TBetHistoryQueryParams,
  venue: EVenue,
  pageNum: number,
): Promise<TBetHistoryData | null> => {
  try {
    if (venue === EVenue.FB) {
      if (isReserveQuery(params.queryType)) {
        const res = await orderReserveBetListFb(formatBetHistoryParamsReserveFb(params));
        return formatBetHistoryRespReserveFb({ data: res.data });
      }
      const res = await orderBetListFb(formatBetHistoryParamsFb({ ...params, pageNum }));
      return formatBetHistoryRespFb({ data: res.data });
    }
    return null;
  } catch (error) {
    console.error('fetchBetPage error:', error);
    return null;
  }
};

// ─── useBetListQuery ──────────────────────────────────────────────────────────

export const useBetListQuery = ({
  params,
  venue,
  type,
  options,
}: {
  params?: TBetHistoryQueryParams;
  venue: EVenue;
  /** 决定使用无限滚动（h5/pc_sidebar）还是普通翻页（pc_page） */
  type: EBetHistoryType;
  options?: { enabled?: boolean };
}): TBetListQueryResult => {
  const { enabled = true } = options ?? {};
  const isPcPage = type === EBetHistoryType.PC_PAGE;

  // ── 无限滚动 query（h5 / pc_sidebar）──────────────────────────────────────
  const infiniteResult = useInfiniteQuery({
    queryKey: ['betHistorylist', venue, params],
    enabled: enabled && !isPcPage,
    queryFn: async ({ pageParam }) => {
      if (!params) return null;
      return fetchBetPage(params, venue, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current = 1, size = 1, total = 0 } = lastPage ?? {};
      return total > current * size ? current + 1 : undefined;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // ── 普通翻页 query（pc_page）──────────────────────────────────────────────
  // queryKey 包含 params（含 pageNum），换页时自动重新请求
  const pageResult = useQuery({
    queryKey: ['betHistorylist', 'pc', venue, params],
    enabled: enabled && isPcPage,
    queryFn: async () => {
      if (!params) return null;
      return fetchBetPage(params, venue, params.pageNum);
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // ── 统一返回 ──────────────────────────────────────────────────────────────
  if (isPcPage) {
    return {
      list: pageResult.data?.list ?? [],
      total: pageResult.data?.total ?? 0,
      stats: pageResult.data?.stats ?? DEFAULT_STATS,
      isLoading: pageResult.isLoading,
      isFetching: pageResult.isFetching,
    };
  }
  return {
    list: infiniteResult.data?.pages.flatMap((p) => p?.list ?? []) ?? [],
    total: infiniteResult.data?.pages[0]?.total ?? 0,
    stats: infiniteResult.data?.pages[0]?.stats ?? DEFAULT_STATS,
    isLoading: infiniteResult.isLoading,
    isFetching: infiniteResult.isFetching,
    fetchNextPage: infiniteResult.fetchNextPage,
    hasNextPage: infiniteResult.hasNextPage,
    isFetchingNextPage: infiniteResult.isFetchingNextPage,
  };
};

// ─── useCancelReserveBet ──────────────────────────────────────────────────────

export const useCancelReserveBet = () => {
  const queryClient = useQueryClient();

  const cancelReserveBet = useCallback(
    async ({ activeVenue, reserveId }: { activeVenue: EVenue; reserveId: string }) => {
      let success = false;
      try {
        if (activeVenue === EVenue.FB) {
          const res = await cancelReserveBetFb({ reserveId });
          success = res.data;
        }
        if (success) {
          toast({ title: '取消预约成功', type: 'success' });
          queryClient.invalidateQueries({ queryKey: ['betHistorylist'] });
        } else {
          toast({ title: '取消预约失败', type: 'error' });
        }
      } catch {
        toast({ title: '取消预约失败', type: 'error' });
      }
    },
    [queryClient],
  );

  return { cancelReserveBet };
};

// ─── useGetListByMatchIds ──────────────────────────────────────────────────────

/** 注单历史页面，未结算 tab，通过 matchIds 获取比赛进度信息 */
export const useGetListByMatchIds = (params: { venue: EVenue; ids: number[] }) => {
  return useQueryHook({
    queryKey: ['useGetListByMatchIds', params],
    queryFn: async () => {
      if (!params.ids.length) return [];
      try {
        if (params.venue === EVenue.FB) {
          const list = await getListReq({ matchIds: params.ids, size: 999 });
          return list.data;
        }
        return [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    staleTime: 5 * 1000,
    retry: false,
    refetchInterval: 7 * 1000,
    refetchOnMount: 'always',
  });
};
