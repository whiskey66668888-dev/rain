/*
该文件为项目需要存入redis和indexDB以及localstorage的key值，三个地方保持一致
*/

export const OB_API_CONFIG_KEY = 'OB_API_CONFIG';
export const FB_API_CONFIG_KEY = 'FB_API_CONFIG';
export const ALL_THIRD_API_CONFIG_KEY = [OB_API_CONFIG_KEY, FB_API_CONFIG_KEY];
export const COOKIE_EXPIRES = 7;
export const IS_LOGIN_KEY = 'isLogin';
export const LOGIN_NAME_KEY = 'loginName';
export const PASSWORD_KEY = 'password';
export const KEEP_LOGIN_KEY = 'keepLogin';
export const MUST_SWITCH_KEY = 'mustSwitch';
export const TOKEN_KEY = 'token';
export const USER_NAME_KEY = 'userName';
export const IMPORTANT_SHOW_LOCK_KEY = 'importantShowLock';
export const NOTICE_SHOW_LOCK_KEY = 'noticeShowLock';
export const MSG_SAVE_ID_KEY = 'msgSaveId';
export const SYSTEM_CONFIG_KEY = 'SYSTEM_CONFIG';
export const FOLLOW_MATCH_IDS_KEY = 'FOLLOW_MATCH_IDS';
export const IS_SIMPLE_ODDS_KEY = 'IS_SIMPLE_ODDS';
export const IS_OPEN_GOAL_SOUND_KEY = 'IS_OPEN_GOAL_SOUND';
export const HIDE_BET_DRAWER_APP_DOWNLOAD_KEY = 'HIDE_BET_DRAWER_APP_DOWNLOAD';
export const PINNED_SPORT_IDS_KEY = 'PINNED_SPORT_IDS';
export const PINNED_MATCH_IDS_KEY = 'PINNED_MATCH_IDS';
export const TOP_MARKETS_KEY = 'TOP_MARKETS';
export const SYNC_SINGLE_PARLAY_KEY = 'SYNC_SINGLE_PARLAY';
export const ACCEPT_ODDS_PREFER_KEY = 'ACCEPT_ODDS_PREFER';
export const AUTO_FOLLOW_MATCH_KEY = 'AUTO_FOLLOW_MATCH';
export const USER_AVATAR_KEY = 'USER_AVATAR';
export const LOGIN_INFO_KEY = 'LOGIN_INFO';
export const AUTH_REDIRECT_PATH_KEY = 'AUTH_REDIRECT_PATH';
export const BET_DATA_KEY = 'BET_DATA';
export const BET_FLOATING_BUTTON_Y_KEY = 'BET_FLOATING_BUTTON_Y';
export const CURRENT_GAME_INFO_KEY = 'CURRENT_GAME_INFO';
export const SLOT_SEARCH_HISTORY_KEY = 'SLOT_SEARCH_HISTORY';
export const GUEST_MEMBER_SETTINGS_KEY = 'GUEST_MEMBER_SETTINGS';

export const needRemoveCookies: string[] = [
  IS_LOGIN_KEY /* 登录状态 */,
  LOGIN_NAME_KEY /*用户名 */,
  MUST_SWITCH_KEY /* 强推弹窗 */,
  TOKEN_KEY,
];

export const needRemoveSession: string[] = [
  IMPORTANT_SHOW_LOCK_KEY /*重要提醒*/,
  NOTICE_SHOW_LOCK_KEY /*平台公告*/,
  MSG_SAVE_ID_KEY /* 稍后查看公告*/,
  USER_NAME_KEY,
];
