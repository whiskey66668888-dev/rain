import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../index';

export type AuthModalType = 'login' | 'register' | null;

export interface AuthUIState {
  activeModal: AuthModalType;
}

const initialState: AuthUIState = {
  activeModal: null,
};

const authUISlice = createSlice({
  name: 'authUI',
  initialState,
  reducers: {
    openLoginModalState: (state) => {
      state.activeModal = 'login';
    },
    openRegisterModalState: (state) => {
      state.activeModal = 'register';
    },
    closeAuthModal: (state) => {
      state.activeModal = null;
    },
    setActiveModal: (state, action: PayloadAction<AuthModalType>) => {
      state.activeModal = action.payload;
    },
  },
});

const { openLoginModalState, openRegisterModalState } = authUISlice.actions;

const shouldSkipAuthModal = (state: RootState) => state.user.userInfo.isLogin;

export const openLoginModal = () => (dispatch: AppDispatch, getState: () => RootState) => {
  if (shouldSkipAuthModal(getState())) return;
  dispatch(openLoginModalState());
};

export const openRegisterModal = () => (dispatch: AppDispatch, getState: () => RootState) => {
  if (shouldSkipAuthModal(getState())) return;
  dispatch(openRegisterModalState());
};

export const { closeAuthModal, setActiveModal } = authUISlice.actions;

export default authUISlice.reducer;
