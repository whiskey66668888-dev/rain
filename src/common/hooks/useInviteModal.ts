import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setInviteModalVisible } from '@/core/store/slices/userSlice';

export const useInviteModal = () => {
  const dispatch = useAppDispatch();
  const inviteModalVisible = useAppSelector((state) => state.user.inviteModalVisible);
  const openInviteModal = useCallback(() => dispatch(setInviteModalVisible(true)), [dispatch]);
  const closeInviteModal = useCallback(() => dispatch(setInviteModalVisible(false)), [dispatch]);
  return { inviteModalVisible, openInviteModal, closeInviteModal };
};
