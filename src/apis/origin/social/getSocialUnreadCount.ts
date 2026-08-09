import { useEffect, useSyncExternalStore } from 'react';

import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';
import type { AppDispatch } from '@/core/store';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setSocialUnreadCount } from '@/core/store/slices/messageCenterSlice';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import {
  getSocialUnreadCountSnapshot,
  setSocialUnreadCountSnapshot,
  subscribeSocialUnreadCount,
} from './socialUnreadCountStore';

let syncSeq = 0;

/** 将接口返回值规范为非负整数 */
export const normalizeSocialUnreadCount = (value: unknown): number => {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.floor(count);
};

/** 同步未读数到 Redux + 外部 store（保证 UI 订阅方立即更新） */
export const syncSocialUnreadCount = (dispatch: AppDispatch, value: unknown): number => {
  const count = normalizeSocialUnreadCount(value);
  dispatch(setSocialUnreadCount(count));
  setSocialUnreadCountSnapshot(count);
  return count;
};

/**
 * 获取朋友圈未读消息数
 * 接口：GET /api/social/message/unreadCount
 */
export const getSocialUnreadCountReq = (): Promise<ResponseData<number>> =>
  request.get('/api/social/message/unreadCount', {
    isErrorToast: false,
  });

/** 拉取未读数并同步（带序号，避免并发请求旧结果覆盖新结果） */
export const fetchAndSyncSocialUnreadCount = async (dispatch: AppDispatch): Promise<number> => {
  const seq = ++syncSeq;

  try {
    const res = await getSocialUnreadCountReq();
    const count = normalizeSocialUnreadCount(res.data);
    if (seq !== syncSeq) return count;
    return syncSocialUnreadCount(dispatch, count);
  } catch {
    if (seq === syncSeq) {
      return syncSocialUnreadCount(dispatch, 0);
    }
    return getSocialUnreadCountSnapshot();
  }
};

/** 立即刷新朋友圈未读数（登录后、进入页面、iframe 通知时调用） */
export const refetchSocialUnreadCount = (): Promise<number> =>
  fetchAndSyncSocialUnreadCount(getGlobalStoreForApiRequest().dispatch);

/** 朋友圈未读数（useSyncExternalStore，刷新后视图必定更新） */
export const useSocialUnreadCount = (): number => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const count = useSyncExternalStore(
    subscribeSocialUnreadCount,
    getSocialUnreadCountSnapshot,
    getSocialUnreadCountSnapshot,
  );

  return isLogin ? count : 0;
};

/** @deprecated 使用 useSocialUnreadCount */
export const useSocialUnreadCountQuery = (): { data: number } => ({
  data: useSocialUnreadCount(),
});

/** 登录后及首次进入应用时立即拉取朋友圈未读数 */
export const useInitSocialUnreadCount = (): void => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  useEffect(() => {
    if (!isLogin) {
      syncSocialUnreadCount(dispatch, 0);
      return;
    }
    void fetchAndSyncSocialUnreadCount(dispatch);
  }, [dispatch, isLogin]);
};
