import { useCallback } from 'react';

import { useAppDispatch } from '@/core/store/hooks';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';

/**
 * @param mustShowCustomer 为 true 时不跳转帮助中心（帮助中心等场景，对应 emc-h5 Customer.open(true)）
 */
export function useOpenCustomerService(mustShowCustomer = false): () => void {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    dispatch(requestOpenCustomerService(mustShowCustomer ? { mustShowCustomer: true } : undefined));
  }, [dispatch, mustShowCustomer]);
}
