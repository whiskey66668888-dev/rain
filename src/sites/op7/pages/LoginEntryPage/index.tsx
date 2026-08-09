import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppDispatch } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';

/**
 * 兼容旧链接 /:lang/login：打开登录弹窗并回到上一级路径
 */
const LoginEntryPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openLoginModal());
  }, [dispatch]);

  return <Navigate to=".." replace />;
};

export default LoginEntryPage;
