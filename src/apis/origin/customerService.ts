import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';
import type { QueryClient } from '@tanstack/react-query';

/** 在线客服线路 */
export interface CustomerServiceChannelItem {
  configureUrl?: string;
  customerLogo?: string;
  customerName?: string;
  workTime?: string;
}

/** 客服热线 */
export interface CustomerServiceHotlineItem {
  configureTel?: string;
  workTime?: string;
  workStartTime?: string;
  workEndTime?: string;
}

/** 新客服配置（与 emc-h5 getCustomerConfiguration 一致） */
export interface ServiceInfoResponse {
  isOpen?: boolean;
  cusList?: CustomerServiceChannelItem[];
  phList?: CustomerServiceHotlineItem[];
}

export const SERVICE_INFO_QUERY_KEY = ['origin', 'website', 'customerConfiguration'] as const;

/**
 * 新客服配置获取
 * 接口：POST /api/website/getCustomerConfiguration
 */
export const getServiceInfoReq = (
  belongingScene?: number,
): Promise<ResponseData<ServiceInfoResponse>> =>
  request.post('/api/website/getCustomerConfiguration', {
    isErrorToast: false,
    body: {
      belongingScene,
    },
  });

export const prefetchServiceInfo = (queryClient: QueryClient, belongingScene = 1): void => {
  queryClient.prefetchQuery({
    queryKey: [...SERVICE_INFO_QUERY_KEY, belongingScene],
    queryFn: () =>
      getServiceInfoReq(belongingScene)
        .then((res) => res.data ?? {})
        .catch(() => ({})),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 新客服配置 React Query Hook
 */
export const useServiceInfoQuery = (
  belongingScene = 1,
  enabled = true,
): ReturnType<typeof useQueryHook<ServiceInfoResponse, Error>> =>
  useQueryHook<ServiceInfoResponse, Error>({
    queryKey: [...SERVICE_INFO_QUERY_KEY, belongingScene],
    queryFn: () =>
      getServiceInfoReq(belongingScene)
        .then((res) => res.data ?? {})
        .catch(() => ({})),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled,
  });
