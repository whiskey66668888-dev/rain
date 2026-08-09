import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { getUnreadInboxCountThunk } from '@/core/store/thunks/messageCenterThunks';

/** 登录后全局初始化未读站内信数量（仅触发一次） */
export const useInitUnreadCount = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  useEffect(() => {
    if (!isLogin) return;
    void dispatch(getUnreadInboxCountThunk());
  }, [dispatch, isLogin]);
};
