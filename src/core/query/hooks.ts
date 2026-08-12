import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

/**
 * 通用 Query Hook 配置选项
 */
export interface UseQueryHookOptions<TData = unknown, TError = Error> extends Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  /**
   * 是否阻塞渲染等待接口返回
   * - true: 使用 useSuspenseQuery，阻塞渲染
   * - false 或不传: 使用 useQuery，不阻塞渲染
   * @default false
   */
  suspense?: boolean;
}

/**
 * 当 suspense 为 true 时的返回类型
 */
type SuspenseQueryResult<TData, TError> = ReturnType<typeof useSuspenseQuery<TData, TError>>;

/**
 * 当 suspense 为 false 时的返回类型
 */
type NormalQueryResult<TData, TError> = UseQueryResult<TData, TError>;

/**
 * 通用 Query Hook
 *
 * @example
 * const { data, isLoading } = useQueryHook({
 *   queryKey: ['key'],
 *   queryFn: () => fetchData(),
 * });
 */
export function useQueryHook<TData = unknown, TError = Error>(
  options: UseQueryHookOptions<TData, TError>,
): SuspenseQueryResult<TData, TError> | NormalQueryResult<TData, TError> {
  const { suspense = false, queryKey, queryFn, ...restOptions } = options;

  const queryOptions = {
    queryKey,
    queryFn,
    suspense,
    ...restOptions,
  } as UseQueryOptions<TData, TError>;

  return useQuery<TData, TError>(queryOptions);
}
