import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { toggleMessageCenterVisible } from '@/core/store/slices/messageCenterSlice';
import { setRightSidebarVisible } from '@/core/store/slices/configSlice';

export const useToggleMessageCenter = () => {
  const rightSidebarVisible = useAppSelector((state) => state.config.rightSidebarVisible);
  const dispatch = useAppDispatch();

  const toggleMessageCenter = useCallback(() => {
    dispatch(toggleMessageCenterVisible());
    if (!rightSidebarVisible) {
      dispatch(setRightSidebarVisible(true));
    }
  }, [dispatch, rightSidebarVisible]);

  return { toggleMessageCenter };
};
