import React, { useEffect, useRef } from 'react';

import { useAppSelector } from '@/core/store/hooks';
import { useOnlineCustomerService } from '@/sites/op7/hooks/useOnlineCustomerService';

/**
 * 全站唯一客服弹窗挂载点，由 Redux openSeq 触发打开
 */
const GlobalCustomerServiceHost: React.FC = () => {
  const openSeq = useAppSelector((s) => s.customerServiceUI.openSeq);
  const mustShowCustomer = useAppSelector((s) => s.customerServiceUI.mustShowCustomer);
  const prevSeq = useRef(0);
  const { openCustomerService, CustomerServiceModal } = useOnlineCustomerService();

  useEffect(() => {
    if (openSeq > prevSeq.current) {
      prevSeq.current = openSeq;
      openCustomerService({ mustShowCustomer });
    }
  }, [openSeq, mustShowCustomer, openCustomerService]);

  return <>{CustomerServiceModal}</>;
};

export default GlobalCustomerServiceHost;
