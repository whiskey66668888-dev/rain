import { useQueryHook } from '@/core/query';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { querystringStringify } from '@/utils';

import { followQueryKeys } from './queryKeys';
import type { FollowItem, FollowListParams } from './types';

/**
 * 查询关注列表
 * 接口：GET /api/game/match/follow/v2/list
 * 获取当前用户在指定体育平台下的有效关注列表（按 matchTime 升序，matchTime 相同按 addTime 降序）。
 */
export const getFollowListReq = (params: FollowListParams): Promise<ResponseData<FollowItem[]>> => {
  const query = querystringStringify({ ...params });
  return request.get<FollowItem[], void>(`/api/game/match/follow/v2/list?${query}`);
};

/**
 * 查询关注列表 React Query Hook
 * @param params gameType 体育平台编码
 * @param config enabled 控制是否发起请求
 */
export function useFollowListQuery(params: FollowListParams, config?: { enabled?: boolean }) {
  return useQueryHook<FollowItem[], Error>({
    queryKey: followQueryKeys.list(params.gameType),
    queryFn: () =>
      getFollowListReq(params)
        .then((res) => res.data ?? [])
        .catch(() => []),
    staleTime: 10_000,
    retry: false,
    enabled: config?.enabled ?? true,
  });
}
