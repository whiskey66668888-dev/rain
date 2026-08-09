import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postFollowJson } from './http';
import { followQueryKeys } from './queryKeys';
import type { FollowAddParams } from './types';

/**
 * 添加或更新关注
 * 接口：POST /api/game/match/follow/v2/add
 * 手动关注、投注成功自动关注、重复关注更新均走此接口。
 *
 * 特殊场景（后端静默成功，前端无需 toast）：
 * - 赛事已在关注列表：更新 matchData
 * - 投注自动关注（source=2）未开启 automaticFollow：不写入
 * - 冠军赛事 + source=2：不写入
 */
export const addFollowReq = (params: FollowAddParams) =>
  // JSON body 提交（后端按 JSON 解析，见 postFollowJson）；add/del/sync 均静默处理，出错不弹 toast
  postFollowJson<void>('/api/game/match/follow/v2/add', params);

/**
 * 添加/更新关注 mutation，成功后失效对应 gameType 的关注列表
 */
export function useAddFollowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: FollowAddParams) => addFollowReq(params),
    onSuccess: (_res, params) => {
      queryClient.invalidateQueries({ queryKey: followQueryKeys.list(params.gameType) });
    },
  });
}
