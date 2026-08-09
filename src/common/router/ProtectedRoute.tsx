import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { buildAuthRedirectPath, setAuthRedirectPath } from '@/common/router/authRedirect';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * 受保护路由包装组件
 * - 已登录：直接渲染 children
 * - 未登录：打开登录弹窗，不渲染 children
 *
 * 用法：
 * ```tsx
 * <ProtectedRoute>
 *   <SecurityCenterPage />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, redirectTo = '/' }) => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const navigate = useNavigateWithLanguage();
  const location = useLocation();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!isClientReady) return;
    if (!isLogin) {
      setAuthRedirectPath(buildAuthRedirectPath(location.pathname, location.search, location.hash));
      dispatch(openLoginModal());
      // 目前只能重定向到首页
      navigate(redirectTo, { replace: true });
    }
  }, [
    dispatch,
    isClientReady,
    isLogin,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    redirectTo,
  ]);

  // SSR 与客户端首帧统一返回 null，避免登录态来源不一致导致水合不匹配。
  if (!isClientReady || !isLogin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
