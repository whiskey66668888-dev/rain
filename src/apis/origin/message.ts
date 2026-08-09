import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

/**
 * 未读站内信响应
 */
export interface UnreadMessageResponse {
  id: number;
  title: string;
  content: string;
  addTime: string;
  /** 未读消息总数 */
  messageSum?: number;
}

/**
 * 强推站内信响应
 */
export interface MustMessageResponse {
  id: number;
  title: string;
  content: string;
}

/**
 * 获取未读站内信（需登录）
 */
export const getUnreadMessageReq = (): Promise<ResponseData<UnreadMessageResponse | null>> => {
  return request.post<UnreadMessageResponse | null, void>('/api/center/getTopUnread', {
    isErrorToast: false,
  });
};

/**
 * 获取强推站内信（需登录）
 */
export const getMustMessageReq = (): Promise<ResponseData<MustMessageResponse | null>> => {
  return request.post<MustMessageResponse | null, void>('/api/center/getTopMustMessage', {
    isErrorToast: false,
  });
};

/**
 * 停止强推站内信（永久不再提醒）
 * @param id 消息ID
 */
export const stopMustMessageReq = (id: number): Promise<ResponseData<void>> => {
  return request.post<void, { id: number }>('/api/center/stopMustMessage', {
    isErrorToast: false,
    body: { id },
  });
};

/**
 * 标记站内信已读
 * @param id 消息ID
 */
export const readSingleMessageReq = (id: number): Promise<ResponseData<void>> => {
  return request.post<void, { id: number }>('/api/center/readSingleMessage', {
    isErrorToast: false,
    body: { id },
  });
};

/**
 * Hook: 获取未读站内信
 * - 登录后立即请求
 * - 每次进入娱乐 tab 页重新请求
 */
export const useUnreadMessageQuery = (enabled = true) => {
  return useQueryHook<UnreadMessageResponse | null, Error>({
    queryKey: ['center', 'unreadMessage'],
    queryFn: () =>
      getUnreadMessageReq()
        .then((res) => res?.data ?? null)
        .catch(() => null),
    staleTime: 0, // 始终视为过期，确保每次进入页面都重新请求
    retry: false,
    enabled,
    refetchOnMount: 'always', // 组件挂载时始终重新请求
    refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
  });
};

/**
 * Hook: 获取强推站内信
 * - 登录后立即请求
 * - 每次进入娱乐 tab 页重新请求
 */
export const useMustMessageQuery = (enabled = true) => {
  return useQueryHook<MustMessageResponse | null, Error>({
    queryKey: ['center', 'mustMessage'],
    queryFn: () =>
      getMustMessageReq()
        .then((res) => res?.data ?? null)
        .catch(() => null),
    staleTime: 0, // 始终视为过期，确保每次进入页面都重新请求
    retry: false,
    enabled,
    refetchOnMount: 'always', // 组件挂载时始终重新请求
    refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
  });
};
