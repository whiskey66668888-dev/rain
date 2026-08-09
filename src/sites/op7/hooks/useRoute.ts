import { UIMatch, useMatches as useMatchesOriginal } from 'react-router-dom';
import type { RouteHandle } from '@/common/router/config';

export function useMatches<Data = unknown, Handle = RouteHandle>() {
  return useMatchesOriginal() as UIMatch<Data, Handle>[];
}

export function useRoute() {
  const matches = useMatches();
  return matches[matches.length - 1];
}

/**
 * 获取当前匹配路由的 handle 元信息
 *
 * @example
 * ```ts
 * const handle = useHandle();
 * if (handle?.showBet) { ... }
 * ```
 */
export function useHandle() {
  const matches = useMatches();
  return matches.reduce<RouteHandle | undefined>((acc, match) => {
    if (!match.handle) return acc;
    return { ...acc, ...match.handle };
  }, undefined);
}
