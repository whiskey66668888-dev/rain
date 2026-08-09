import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/hooks';
import { getInviterInfoThunk } from '@/core/store/thunks/userThunks';

export const useGetInviterInfo = () => {
  const dispatch = useAppDispatch();

  const getInviterInfo = useCallback(() => dispatch(getInviterInfoThunk()), [dispatch]);

  return { getInviterInfo };
};
