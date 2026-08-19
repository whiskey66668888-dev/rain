import { createSelector, lruMemoize } from '@reduxjs/toolkit';
import type { EntityState } from '@reduxjs/toolkit';

import { EBetType, EVenue } from '@/apis/commonSports/constants';
import type { TBetItem } from '@/apis/commonSports/types';

import type { RootState } from '../index';
import type { TBetStore, TVenueBetState } from '../slices/betSlice';
import {
  isShallowEqualSelectedBets,
  isShallowEqualStringArray,
  type TSelectedBetHighlight,
} from './equality';
import { selectSportVenue } from './sportSelectors';

const EMPTY_IDS: string[] = [];
const EMPTY_SELECTED_BETS: TSelectedBetHighlight[] = [];

const selectVenueBetStateImpl = createSelector(
  [selectSportVenue, (state: RootState): TBetStore => state.bet],
  (venue: EVenue, bet): TVenueBetState => bet[venue],
);

const selectVenueBetTypeImpl = createSelector(
  [selectVenueBetStateImpl],
  (venueBet): EBetType => venueBet.betType,
);

const selectActiveBetDataImpl = createSelector(
  [selectVenueBetStateImpl],
  (venueBet): EntityState<TBetItem, string> =>
    venueBet.betType === EBetType.Parlay ? venueBet.parlayBetData : venueBet.singleBetData,
);

const selectBetItemIdsForMatchImpl = createSelector(
  [selectActiveBetDataImpl, (_state: RootState, matchId?: string | number) => matchId],
  (data: EntityState<TBetItem, string>, matchId?: string | number): string[] => {
    const ids = [...data.ids];
    if (matchId == null || matchId === '') {
      return ids;
    }
    const matchIdStr = String(matchId);
    const filtered = ids.filter((id) => {
      const entity = data.entities[id];
      return entity != null && String(entity.matchId) === matchIdStr;
    });
    return filtered.length === 0 ? EMPTY_IDS : filtered;
  },
  {
    memoize: lruMemoize,
    memoizeOptions: {
      maxSize: 256,
      resultEqualityCheck: isShallowEqualStringArray,
    },
  },
);

const selectSelectedBetsForMatchImpl = createSelector(
  [selectActiveBetDataImpl, (_state: RootState, matchId?: string | number) => matchId],
  (data: EntityState<TBetItem, string>, matchId?: string | number): TSelectedBetHighlight[] => {
    if (matchId == null || matchId === '') {
      return EMPTY_SELECTED_BETS;
    }
    const matchIdStr = String(matchId);
    const list: TSelectedBetHighlight[] = [];
    for (const id of data.ids) {
      const entity = data.entities[id];
      if (entity != null && String(entity.matchId) === matchIdStr) {
        list.push({ marketId: String(entity.marketId), selectionId: entity.betItemId });
      }
    }
    return list.length === 0 ? EMPTY_SELECTED_BETS : list;
  },
  {
    memoize: lruMemoize,
    memoizeOptions: {
      maxSize: 64,
      resultEqualityCheck: isShallowEqualSelectedBets,
    },
  },
);

/** 包装成普通函数，避免 Reselect OutputSelector 在 useAppSelector 里被推断成 unknown */
export function selectVenueBetState(state: RootState): TVenueBetState {
  return selectVenueBetStateImpl(state);
}

export function selectVenueBetType(state: RootState): EBetType {
  return selectVenueBetTypeImpl(state);
}

export function selectActiveBetData(state: RootState): EntityState<TBetItem, string> {
  return selectActiveBetDataImpl(state);
}

/**
 * 当前 tab 下用于赔率按钮高亮的 betItemId。
 * 传入 matchId 时只返回该场；不传则返回全部。
 */
export function selectBetItemIdsForMatch(state: RootState, matchId?: string | number): string[] {
  return selectBetItemIdsForMatchImpl(state, matchId);
}

/** 详情页高亮：本场已选注的 marketId + betItemId */
export function selectSelectedBetsForMatch(
  state: RootState,
  matchId?: string | number,
): TSelectedBetHighlight[] {
  return selectSelectedBetsForMatchImpl(state, matchId);
}
