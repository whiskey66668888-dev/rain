import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/hooks';
import { setMessageCenterVisible } from '@/core/store/slices/messageCenterSlice';

export const useCloseMessageCenter = () => {
  const dispatch = useAppDispatch();

  const closeMessageCenter = useCallback(() => {
    dispatch(setMessageCenterVisible({ visible: false }));
  }, [dispatch]);

  return { closeMessageCenter };
};
