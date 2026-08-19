import { EOddsType, EVenue, PlayType } from '@/apis/commonSports/constants';
import type { Menues } from '@/apis/commonSports/types';
import type { LocalHandicapItem } from '@/apis/fbSports/common/types';

import type { RootState } from '../index';
import type { PinnedMatch, TFollowMatch } from '../slices/sportSlice';

export const selectSportVenue = (state: RootState): EVenue => state.sport.venue;
export const selectCurrentOddsType = (state: RootState): EOddsType => state.sport.currentOddsType;
export const selectSyncSingleParlay = (state: RootState): boolean => !!state.sport.syncSingleParlay;

export const selectMainListSportId = (state: RootState): number =>
  state.sport.mainList.settings.sportId;
export const selectMainListPlayType = (state: RootState): PlayType =>
  state.sport.mainList.settings.playType;
export const selectMainListPlayTypeId = (state: RootState): number | null =>
  state.sport.mainList.settings.playTypeId;
export const selectFollowMatch = (state: RootState): TFollowMatch[] =>
  state.sport.mainList.settings.followMatch;
export const selectFilterByLeagueIds = (state: RootState): Array<number | string> =>
  state.sport.mainList.settings.filterByLeagueIds;
export const selectOrderBy = (state: RootState): number => state.sport.mainList.settings.orderBy;
export const selectFilterTime = (state: RootState): number[] =>
  state.sport.mainList.settings.filterTime;
export const selectSimpleActiveItem = (state: RootState): LocalHandicapItem | null =>
  state.sport.mainList.settings.simpleActiveItem;
export const selectSimpleActiveItemName = (state: RootState): string | undefined =>
  state.sport.mainList.settings.simpleActiveItem?.name;

export const selectPinnedSportIds = (state: RootState): number[] =>
  state.sport.mainList.datas.pinnedSportIds;
export const selectPinnedMatchs = (state: RootState): PinnedMatch[] =>
  state.sport.mainList.datas.pinnedMatchs;
export const selectMenus = (state: RootState): Menues => state.sport.mainList.datas.menuInfo.menus;
