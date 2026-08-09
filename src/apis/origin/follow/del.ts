import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postFollowJson } from './http';
import { followQueryKeys } from './queryKeys';
import type { FollowDelParams } from './types';

/**
 * 取消关注
 * 接口：POST /api/game/match/follow/v2/del
 * 用户点击取消关注（星星）时调用，软删除该赛事。记录不存在或已取消时仍返回成功（幂等）。
 */
export const delFollowReq = (params: FollowDelParams) =>
  postFollowJson<void>('/api/game/match/follow/v2/del', params);

/**
 * 取消关注 mutation，成功后失效对应 gameType 的关注列表
 */
export function useDelFollowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: FollowDelParams) => delFollowReq(params),
    onSuccess: (_res, params) => {
      queryClient.invalidateQueries({ queryKey: followQueryKeys.list(params.gameType) });
    },
  });
}
