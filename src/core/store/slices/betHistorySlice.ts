import { EVenue } from '@/apis/commonSports/constants';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TBetHistoryQueryParams } from '@/apis/commonSports/types';

export interface TReserveEditState {
  orderId: string;
  unitStake: string;
  odds: string;
  /** 打开编辑时存入，供确认弹窗展示 */
  matchName?: string;
  /** 确认弹窗是否显示 */
  confirming?: boolean;
  /** 提交 API 中 */
  loading?: boolean;
}

export interface TCancelReserveBetEntry {
  orderId: string;
  loading?: boolean;
}

interface TBetHistoryVenueState {
  queryParams?: TBetHistoryQueryParams;
  /** 当前开启修改状态的预约注单，同一时刻只有一个 */
  reserveEdit?: TReserveEditState;
  /** 取消预约投注确认弹窗条目 */
  cancelReserveBetEntry?: TCancelReserveBetEntry;
}

/** 当前场馆统一取 sport.venue，这里只按场馆分片存各自的查询/编辑状态 */
interface TBetHistoryState {
  [EVenue.FB]: TBetHistoryVenueState;
  [EVenue.OB]: TBetHistoryVenueState;
}

const initialState: TBetHistoryState = {
  [EVenue.FB]: {},
  [EVenue.OB]: {},
};

const betHistorySlice = createSlice({
  name: 'betHistory',
  initialState,
  reducers: {
    setBetHistoryQueryParams: (
      state,
      action: PayloadAction<{ activeVenue: EVenue; queryParams: TBetHistoryQueryParams }>,
    ) => {
      const { activeVenue, queryParams } = action.payload;
      state[activeVenue].queryParams = queryParams;
      state[activeVenue].reserveEdit = undefined;
    },
    updateBetHistoryQueryParams: (
      state,
      action: PayloadAction<{ activeVenue: EVenue; queryParams: Partial<TBetHistoryQueryParams> }>,
    ) => {
      const { activeVenue, queryParams } = action.payload;
      if (!state[activeVenue].queryParams) return;
      state[activeVenue].queryParams = { ...state[activeVenue].queryParams, ...queryParams };
      state[activeVenue].reserveEdit = undefined;
    },
    openReserveEdit: (state, action: PayloadAction<{ venue: EVenue } & TReserveEditState>) => {
      const { venue, orderId, unitStake, odds, matchName } = action.payload;
      state[venue].reserveEdit = { orderId, unitStake, odds, matchName };
    },
    closeReserveEdit: (state, action: PayloadAction<{ venue: EVenue }>) => {
      state[action.payload.venue].reserveEdit = undefined;
    },
    setReserveEditUnitStake: (
      state,
      action: PayloadAction<{ venue: EVenue; unitStake: string }>,
    ) => {
      const { venue, unitStake } = action.payload;
      if (!state[venue].reserveEdit) return;
      state[venue].reserveEdit.unitStake = unitStake;
    },
    setReserveEditOdds: (state, action: PayloadAction<{ venue: EVenue; odds: string }>) => {
      const { venue, odds } = action.payload;
      if (!state[venue].reserveEdit) return;
      state[venue].reserveEdit.odds = odds;
    },
    openReserveEditConfirmDialog: (state, action: PayloadAction<{ venue: EVenue }>) => {
      const edit = state[action.payload.venue].reserveEdit;
      if (!edit) return;
      edit.confirming = true;
    },
    closeReserveEditConfirmDialog: (state, action: PayloadAction<{ venue: EVenue }>) => {
      const edit = state[action.payload.venue].reserveEdit;
      if (!edit) return;
      edit.confirming = false;
      edit.loading = false;
    },
    setReserveEditLoading: (state, action: PayloadAction<{ venue: EVenue; loading: boolean }>) => {
      const edit = state[action.payload.venue].reserveEdit;
      if (!edit) return;
      edit.loading = action.payload.loading;
    },
    openCancelReserveBet: (state, action: PayloadAction<{ venue: EVenue; orderId: string }>) => {
      const { venue, orderId } = action.payload;
      state[venue].cancelReserveBetEntry = { orderId };
    },
    closeCancelReserveBet: (state, action: PayloadAction<{ venue: EVenue }>) => {
      state[action.payload.venue].cancelReserveBetEntry = undefined;
    },
    setCancelReserveBetLoading: (
      state,
      action: PayloadAction<{ venue: EVenue; loading: boolean }>,
    ) => {
      const entry = state[action.payload.venue].cancelReserveBetEntry;
      if (!entry) return;
      entry.loading = action.payload.loading;
    },
  },
});

export const {
  setBetHistoryQueryParams,
  updateBetHistoryQueryParams,
  openReserveEdit,
  closeReserveEdit,
  setReserveEditUnitStake,
  setReserveEditOdds,
  openReserveEditConfirmDialog,
  closeReserveEditConfirmDialog,
  setReserveEditLoading,
  openCancelReserveBet,
  closeCancelReserveBet,
  setCancelReserveBetLoading,
} = betHistorySlice.actions;

export default betHistorySlice.reducer;
