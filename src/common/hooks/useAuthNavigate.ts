import { useCallback } from 'react';
import type { NavigateOptions } from 'react-router-dom';

import { setAuthRedirectPath } from '@/common/router/authRedirect';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';

import { useNavigateWithLanguage, type TypeTo } from './useNavigateWithLanguage';

export const useAuthNavigate = (): ((to: TypeTo, options?: NavigateOptions) => boolean) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  return useCallback(
    (to: TypeTo, options?: NavigateOptions): boolean => {
      if (!isLogin) {
        const path =
          typeof to === 'string' ? to : `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}`;
        setAuthRedirectPath(path);
        dispatch(openLoginModal());
        return false;
      }

      navigate(to, options);
      return true;
    },
    [dispatch, isLogin, navigate],
  );
};
