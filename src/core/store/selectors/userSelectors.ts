import { createSelector } from '@reduxjs/toolkit';

import { EAcceptOddsPrefer, EVenue } from '@/apis/commonSports/constants';

import type { RootState } from '../index';
import { selectSportVenue } from './sportSelectors';

export const selectIsLogin = (state: RootState): boolean => state.user.userInfo.isLogin;
export const selectAcceptOddsPrefer = (state: RootState): EAcceptOddsPrefer =>
  state.user.acceptOddsPrefer;
export const selectMemberMoney = (state: RootState): string => state.user.memberInfo.money;

const selectVenueBalanceImpl = createSelector(
  [selectSportVenue, (state: RootState) => state.user],
  (venue: EVenue, user): string => user[venue].balance,
);

export function selectVenueBalance(state: RootState): string {
  return selectVenueBalanceImpl(state);
}
