export const ENTERTAINMENT_MENU_ID = 0;

// 场馆id
export enum HomeListId {
  NONE = 0,
  SPORTS = 1,
  ESPORTS = 2,
  LIVE = 3,
  SLOTS = 4,
  POKER = 23,
  LOTTERY = 5,
}

// 电子游戏默认id为pg场馆id
export const DEFAULT_SLOTS_ID = 68;

// 试玩场馆id
export const TRY_PLAY_VENUE_ID = -1;

// 娱乐大厅页面type
export enum ENTERTAINMENT_HOME_PAGE_TYPE {
  HOME = 'home',
  SLOT_GAME = 'slot',
  GAME = 'game',
}
