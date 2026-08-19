import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

/** 站内信/平台公告接口，支持 content/messageInfo、addTime/addTimed */
export interface TNoticeListResponse {
  lastModifiedTime?: string;
  addTime?: string;
  /** 老项目时间字段 */
  addTimed?: string;
  id: number;
  contentTitle?: string;
  label?: string;
  title: string;
  content?: string;
  /** 老项目正文字段（站内信） */
  messageInfo?: string;
}

export interface NoticeListParams {
  limit: number;
}

/**
 * 获取平台公告列表
 * @param params limit 建议 30，与老项目一致
 * @returns Promise<TNoticeListResponse[]>
 */
export const getNoticeListReq = (
  params: NoticeListParams,
): Promise<ResponseData<TNoticeListResponse[]>> => {
  return request.post<TNoticeListResponse[], NoticeListParams>('/api/website/notice/list', {
    body: params,
  });
};

/**
 * @returns Promise<TNoticeListResponse[]>
 */
export const useNoticeListQuery = (
  params: NoticeListParams,
): ReturnType<typeof useQueryHook<TNoticeListResponse[], Error>> => {
  return useQueryHook<TNoticeListResponse[], Error>({
    queryKey: ['origin', 'notice', 'list', params],
    queryFn: () => getNoticeListReq(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
    // 客户端挂载时始终请求一次，避免仅依赖 SSR 缓存导致 Network 里看不到请求或数据不刷新
    refetchOnMount: 'always',
  });
};

export interface TFBNoticeListResponse {
  co: string;
  id: string;
  pt: number;
  sid: number;
  ti: string;
}

/**
 * 获取 FB 公告数据
 * @param params
 * @returns Promise<TNoticeListResponse[]>
 */
export const getFBNoticeListReq = (params: NoticeListParams) => {
  return request.post<string, NoticeListParams, TFBNoticeListResponse[]>(
    '/api/website/notice/fbList',
    {
      body: params,
      transformResponse: (data) => {
        return {
          ...data,
          data: JSON.parse(data.data || '[]') as TFBNoticeListResponse[],
        };
      },
    },
  );
};

/**
 * @returns Promise<TNoticeListResponse[]>
 */
export const useFBNoticeListQuery = (params: NoticeListParams) => {
  return useQueryHook<TFBNoticeListResponse[], Error>({
    queryKey: ['origin', 'notice', 'fbList', params],
    queryFn: () => getFBNoticeListReq(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
