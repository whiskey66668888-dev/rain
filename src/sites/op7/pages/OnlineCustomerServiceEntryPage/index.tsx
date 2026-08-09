import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppDispatch } from '@/core/store/hooks';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';

/**
 * 兼容旧链接 /:lang/onlineCustomerService：打开客服弹窗并回到语言根路径
 */
const OnlineCustomerServiceEntryPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(requestOpenCustomerService());
  }, [dispatch]);

  return <Navigate to=".." replace />;
};

export default OnlineCustomerServiceEntryPage;
