import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppDispatch } from '@/core/store/hooks';
import { openRegisterModal } from '@/core/store/slices/authUISlice';

/**
 * 兼容旧链接 /:lang/register：打开注册弹窗并回到上一级路径
 */
const RegisterEntryPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openRegisterModal());
  }, [dispatch]);

  return <Navigate to=".." replace />;
};

export default RegisterEntryPage;
