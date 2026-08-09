import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { getMemberInfoThunk } from '@/core/store/thunks/userThunks';
import { useQueryHook } from '@/core/query';
import { hasAppAuthToken, persistAppAuthFromUrl } from '@/utils/appEmbed';
import { isSSR } from '@/utils/env';
import { TMemberInfoResp } from '@/apis/origin/member/membetInfo';

interface TParams {
  isLoading?: boolean;
}

export const useGetMemberInfo = () => {
  const dispatch = useAppDispatch();
  const getMemberInfo = useCallback(
    async (params?: TParams) => {
      const { isLoading = true } = params ?? {};
      const res = await dispatch(getMemberInfoThunk({ isLoading }));
      if (getMemberInfoThunk.fulfilled.match(res)) {
        return res.payload;
      }
      return Promise.reject(new Error('获取用户信息失败'));
    },
    [dispatch],
  );
  return { getMemberInfo };
};

/** 用户信息轮询间隔（毫秒） */
export const USER_MEMBER_INFO_POLL_INTERVAL = 5 * 60 * 1000;

export const useLoopMemberInfo = () => {
  const location = useLocation();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { getMemberInfo } = useGetMemberInfo();

  useEffect(() => {
    persistAppAuthFromUrl(location.search);
  }, [location.search]);

  const canFetchMemberInfo = useMemo(
    () => isLogin || hasAppAuthToken(location.search),
    [isLogin, location.search],
  );

  useQueryHook<Partial<TMemberInfoResp>, Error>({
    queryKey: ['user', 'memberInfo'],
    queryFn: async () => {
      if (isSSR()) {
        return {};
      }
      return getMemberInfo({ isLoading: false });
    },
    enabled: canFetchMemberInfo,
    refetchInterval: USER_MEMBER_INFO_POLL_INTERVAL,
    staleTime: 0, // 每次视为过期，便于轮询更新
  });
};
