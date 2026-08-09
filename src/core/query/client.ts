import { QueryClient } from '@tanstack/react-query';

/**
 * 创建服务端 QueryClient
 * SSR 模式下，查询失败时不重试，使用缓存数据
 */
export function createServerQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        throwOnError: false,
      },
    },
  });
}

/**
 * 创建客户端 QueryClient
 * 客户端模式下，使用正常的缓存策略
 */
export function createClientQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
