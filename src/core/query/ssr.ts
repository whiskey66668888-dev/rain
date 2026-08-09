import { dehydrate, type DehydratedState } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

/**
 * 序列化查询状态（用于 SSR）
 */
export function dehydrateQueryState(queryClient: QueryClient): DehydratedState {
  return dehydrate(queryClient);
}

/**
 * 获取 SSR 注水的查询状态（客户端）
 */
export function getSSRQueryState(): DehydratedState | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const state = window?.__REACT_QUERY_STATE__;
  if (state) {
    try {
      return typeof state === 'string' ? (JSON.parse(state) as DehydratedState) : state;
    } catch (error) {
      console.warn('Failed to parse SSR query state:', error);
      return undefined;
    }
  }

  return undefined;
}
