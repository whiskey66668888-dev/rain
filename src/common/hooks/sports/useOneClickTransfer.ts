import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { oneClickTransferThunk } from '@/core/store/thunks/userThunks';
import { EVenue } from '@/apis/commonSports/constants';

export const useOneClickTransferLoading = () => {
  const oneClickTransferLoading = useAppSelector(
    (state) => state.user[state.sport.venue].oneClickTransferLoading,
  );
  return { oneClickTransferLoading };
};

export const useOneClickTransfer = () => {
  const dispatch = useAppDispatch();

  const oneclickTransfer = useCallback(
    async (params: { venue: EVenue; gameId: number }) => {
      const res = await dispatch(oneClickTransferThunk(params));
      if (oneClickTransferThunk.fulfilled.match(res)) {
        return res.payload;
      }
      return null;
    },
    [dispatch],
  );

  return { oneclickTransfer };
};
