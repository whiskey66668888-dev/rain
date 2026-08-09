/** 关注（v2）相关 React Query queryKey 工厂，统一管理便于失效 */
export const followQueryKeys = {
  all: ['origin', 'match', 'follow', 'v2'],
  list: (gameType: string): unknown[] => [...followQueryKeys.all, 'list', gameType],
};
