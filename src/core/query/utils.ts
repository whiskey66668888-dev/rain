import type { QueryClient } from '@tanstack/react-query';

export type QueryKeyGroup = ReadonlyArray<ReadonlyArray<unknown>>;

export const clearQueryKeys = (queryClient: QueryClient, queryKeys: QueryKeyGroup): void => {
  queryKeys.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey: [...queryKey] });
  });
};

export const SECURITY_CENTER_QUERY_KEYS: QueryKeyGroup = [
  ['member', 'securityCenter2'],
  ['securityCenter'],
];

export const SOCIAL_CONFIG_QUERY_KEYS: QueryKeyGroup = [['origin', 'social', 'config']];

export const clearSecurityCenterQueries = (queryClient: QueryClient): void => {
  clearQueryKeys(queryClient, SECURITY_CENTER_QUERY_KEYS);
};

export const clearSocialConfigQueries = (queryClient: QueryClient): void => {
  clearQueryKeys(queryClient, SOCIAL_CONFIG_QUERY_KEYS);
};
