import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ResponseData } from '@/core/sdk/request/model';

import { postFollowJson } from './http';
import { followQueryKeys } from './queryKeys';
import type { FollowSyncParams, FollowSyncResult } from './types';

/**
 * App 本地数据批量同步
 * 接口：POST /api/game/match/follow/v2/sync
 * App 首次升级或登录后，将本地关注列表一次性上报到云端，返回合并后的最终列表。
 *
 * 合并策略：仅本地有→新增；仅云端有→保留；双方都有→比较 updateTime 较新者覆盖
 * （本地无 updateTime 时直接覆盖）。
 *
 * 以 JSON body 提交，`list` 作为 JSON 数组随 body 一起发送（与 App 端一致，不再单独 stringify 成字符串字段）。
 */
export const syncFollowReq = (params: FollowSyncParams): Promise<ResponseData<FollowSyncResult>> =>
  postFollowJson<FollowSyncResult>('/api/game/match/follow/v2/sync', {
    gameType: params.gameType,
    list: params.list,
  });

/**
 * 批量同步 mutation，成功后以返回的云端列表回填缓存并失效对应列表
 */
export function useSyncFollowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: FollowSyncParams) => syncFollowReq(params),
    onSuccess: (res, params) => {
      queryClient.invalidateQueries({ queryKey: followQueryKeys.list(params.gameType) });
      // 同步接口直接返回最终列表，回填缓存避免额外请求
      if (res.data?.list) {
        queryClient.setQueryData(followQueryKeys.list(params.gameType), res.data.list);
      }
    },
  });
}
