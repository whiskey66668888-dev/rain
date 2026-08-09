import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

export interface WebsiteSwitchItem {
  FB?: string;
  maintenanceDesc?: string;
  [key: string]: string | undefined;
}

type WebsiteSwitchListResponse = WebsiteSwitchItem[] | Record<string, WebsiteSwitchItem> | null;

/**
 * 获取站点维护开关配置
 */
export const getWebsiteSwitchListReq = (): Promise<ResponseData<WebsiteSwitchListResponse>> => {
  return request.post<WebsiteSwitchListResponse, object>('/api/website/switch/list', {
    body: {},
  });
};

/**
 * @returns Promise<WebsiteSwitchItem[]>
 */
export const useWebsiteSwitchListQuery = (): ReturnType<
  typeof useQueryHook<WebsiteSwitchItem[], Error>
> => {
  return useQueryHook<WebsiteSwitchItem[], Error>({
    queryKey: ['origin', 'website', 'switch', 'list'],
    queryFn: () =>
      getWebsiteSwitchListReq()
        .then((res) => {
          const data = res.data;
          if (Array.isArray(data)) {
            return data;
          }
          if (data && typeof data === 'object') {
            return Object.values(data);
          }
          return [];
        })
        .catch(() => {
          return [];
        }),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
};
