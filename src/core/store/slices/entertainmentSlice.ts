import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ENTERTAINMENT_MENU_ID, HomeListId } from '@/utils/constants/entertainment';
import { TGameList } from '@/apis/origin/gamePlay';
// import { CURRENT_GAME_INFO_KEY } from '@/utils/constants/cacheKey';
// import { isSSR } from '@/utils/env';

/**
 * 娱乐大厅State
 */

interface ICurrentGameInfo extends Partial<TGameList> {
  isSlotGame?: boolean;
  isTryPlay?: boolean;
  isFullscreen?: boolean;
  venueName?: string;
  venueMenu?: Record<string, unknown>;
  venueGameId?: number;
}
export interface EntertainmentState {
  expandedMenuId: HomeListId | number;
  activeGameHomeId: number | null; // 当前选中的游戏场馆id
  currentGameInfo: ICurrentGameInfo | null; // 当前打开的游戏信息
  isGamePlaying: boolean; // 是否正在游戏
  isFullscreen: boolean; // 是否全屏
}

export const initialState: EntertainmentState = {
  expandedMenuId: ENTERTAINMENT_MENU_ID, // 展开的娱乐类型id
  activeGameHomeId: null, // 选中的游戏场馆id
  // 当前打开的游戏信息
  currentGameInfo: null,
  // currentGameInfo: isSSR()
  //   ? null
  //   : (JSON.parse(
  //       localStorage.getItem(CURRENT_GAME_INFO_KEY) ?? 'null',
  //     ) as ICurrentGameInfo | null),
  isGamePlaying: false,
  isFullscreen: false,
};
const entertainmentSlice = createSlice({
  name: 'entertainment',
  initialState,
  reducers: {
    setExpandedMenuId: (state, action: PayloadAction<number>) => {
      state.expandedMenuId = action.payload;
    },
    setActiveGameHomeId: (state, action: PayloadAction<number | null>) => {
      state.activeGameHomeId = action.payload;
    },
    setCurrentGameInfo: (state, action: PayloadAction<ICurrentGameInfo | null>) => {
      state.currentGameInfo = action.payload;
      // localStorage.setItem(CURRENT_GAME_INFO_KEY, JSON.stringify(action.payload));
    },
    setIsGamePlaying: (state, action: PayloadAction<boolean>) => {
      state.isGamePlaying = action.payload;
    },
    setIsFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
  },
});

export const {
  setExpandedMenuId,
  setActiveGameHomeId,
  setCurrentGameInfo,
  setIsGamePlaying,
  setIsFullscreen,
} = entertainmentSlice.actions;

export default entertainmentSlice.reducer;
