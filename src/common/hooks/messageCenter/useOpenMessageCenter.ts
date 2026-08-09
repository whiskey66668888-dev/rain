import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/hooks';
import { ESubTabKey, setMessageCenterVisible } from '@/core/store/slices/messageCenterSlice';

interface IProps {
  initialSubTab: ESubTabKey;
}

export const useOpenMessageCenter = () => {
  const dispatch = useAppDispatch();

  const openMessageCenter = useCallback(
    (payload?: IProps) => {
      dispatch(setMessageCenterVisible({ visible: true, initialSubTab: payload?.initialSubTab }));
    },
    [dispatch],
  );

  return { openMessageCenter };
};
