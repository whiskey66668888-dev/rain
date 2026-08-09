import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/hooks';
import { setMsgEditorData } from '@/core/store/slices/messageCenterSlice';

export const useTransactionRecordMethods = () => {
  const dispatch = useAppDispatch();

  // #region 新增站内信

  const closeMsgEditor = useCallback(() => {
    dispatch(setMsgEditorData({ visible: false }));
  }, [dispatch]);
  // #endregion

  return {
    closeMsgEditor,
  };
};
