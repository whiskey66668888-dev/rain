import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import {
  BETTING_ODDS_SETTINGS_TO_ODDS_TYPE,
  EOddsType,
  EVenue,
  ODDS_TYPE_TO_BETTING_ODDS_SETTINGS,
  PlayType,
} from '@/apis/commonSports/constants';
import {
  FOLLOW_MATCH_IDS_EB_KEY,
  FOLLOW_MATCH_IDS_FB_KEY,
  PINNED_SPORT_IDS_KEY,
  PINNED_MATCH_IDS_KEY,
  SYNC_SINGLE_PARLAY_KEY,
  IS_SIMPLE_ODDS_KEY,
  IS_OPEN_GOAL_SOUND_KEY,
  BETTING_ODDS_SETTINGS_KEY,
  HIDE_BET_DRAWER_APP_DOWNLOAD_KEY,
  SPORT_VENUE_KEY,
} from '@/utils/constants/cacheKey';
import { toMillis } from '@/utils/dateHelper';
import { MenuInfo } from '@/apis/commonSports/types';
import { FBSportIdValue, MatchPlayType } from '@/apis/fbSports/common/constants';
import { OBSportIdValue } from '@/apis/obSports/common/constants';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { ESportsLeftPanelType } from '@/apis/commonSports/constants';
import { findVenueCompetition } from '@/apis/commonSports/venueCompetition';
import { clearUserInfo } from '@/core/store/slices/userSlice';
import {
  getFollowGameType,
  getFollowMatchStorageKey,
  type FollowGameType,
} from '@/common/hooks/follow/followGameType';
import {
  safeGetLocalJSON,
  safeGetLocalString,
  safeRemoveLocal,
  safeSetLocalJSON,
  safeSetLocalString,
} from '@/utils/storage/webStorage';

/**
 * 娱乐大厅State
 */
export interface PinnedMatch {
  matchId: string;
  sportId: number;
  playType: PlayType;
}
export interface TFollowMatch {
  matchId: string;
  /** 赛种 viewId */
  sportId: number;
  /**
   * 开赛时间戳（兼容 10 位秒 / 13 位毫秒）。
   * 用于「开赛时间 + 24h」过期判定，以及完场后查询赛果的时间窗口。
   */
  bt: number;
  /**
   * 关注来源（web 本地口径）：
   * - `tourist`：游客态收藏（手动或投注），登录跃迁时一次性 sync 上报服务器。
   * - `normal`：登录态手动收藏。
   * - `bet`：登录态投注自动关注。
   * 服务器 list 回填时按后端 source 映射：`2 → bet`、`1 → normal`。
   */
  source: 'tourist' | 'normal' | 'bet';
  /**
   * 收藏快照（App 约定的 SportItemInfo JSON 字符串），手动/投注、游客/登录均必填。
   * 游客态用于登录后 sync 一次性上报；登录态由服务器 list 回填。
   * 统一作为「按开赛+24h 过期、掉出 live 后查赛果、赛果缺失时完场占位」的唯一数据来源（见 getFollowSnapshot）。
   */
  matchData: string;
}

/** 关注赛事保留时长：开赛时间 + 24h（与 app 口径一致） */
const FOLLOW_MATCH_KEEP_MS = 24 * 60 * 60 * 1000;
const MAX_FOLLOW_MATCHES_PER_VENUE = 100;
const MAX_PINNED_SPORTS = 20;
const MAX_PINNED_MATCHES = 50;

/** 从 matchData 快照里解析开赛时间戳（解析失败返回 undefined） */
const parseSnapshotBt = (matchData?: string): number | undefined => {
  if (!matchData) return undefined;
  try {
    return (JSON.parse(matchData) as { bt?: number }).bt;
  } catch {
    return undefined;
  }
};

/**
 * 取关注赛事的开赛时间戳，用于过期判定。
 * 优先用 bt 字段（手动/投注、游客/登录均写入）；bt 缺失（如老数据）时从 matchData 快照回退解析。
 * 二者都取不到时返回 undefined，判过期时视为「无有效开赛时间」不删，防误删。
 */
const getFollowMatchBt = (item: TFollowMatch): number | undefined =>
  item.bt || parseSnapshotBt(item.matchData);

/** 判断关注赛事是否过期（开赛时间 + 24h）。无有效开赛时间时不删，防误删 */
const isFollowMatchExpired = (item: TFollowMatch, now: number): boolean => {
  const btMs = toMillis(getFollowMatchBt(item));
  if (btMs === 0) return false;
  return now > btMs + FOLLOW_MATCH_KEEP_MS;
};

/**
 * 兼容旧结构的 localStorage 关注数据（升级前无 bt/source、带 extraInfoFromBet、matchData 可选）。
 * 归一到新 TFollowMatch：bt 回退解析 matchData，source 缺失按游客(tourist)兜底，matchData 保证为字符串，
 * 丢弃已废弃的 extraInfoFromBet。避免老游客本地收藏在升级后崩溃或永不过期。
 */
const normalizeFollowMatch = (raw: unknown): TFollowMatch | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<TFollowMatch> & {
    extraInfoFromBet?: { bt?: number };
  };
  if (r.matchId == null) return null;
  const matchData = typeof r.matchData === 'string' ? r.matchData : '';
  const bt = Number(r.bt) || r.extraInfoFromBet?.bt || parseSnapshotBt(matchData) || 0;
  const source: TFollowMatch['source'] =
    r.source === 'normal' || r.source === 'bet' ? r.source : 'tourist';
  return { matchId: r.matchId, sportId: Number(r.sportId) || 0, bt, source, matchData };
};

const limitFollowMatches = (list: TFollowMatch[]): TFollowMatch[] =>
  list.slice(-MAX_FOLLOW_MATCHES_PER_VENUE);

const readArrayFromStorage = (key: string): unknown[] => {
  const value = safeGetLocalJSON<unknown>(key, []);
  return Array.isArray(value) ? value : [];
};

/** 从 localStorage 读取并归一化某场馆关注列表（跳过脏数据），再按开赛+24h 过滤 */
const readFollowMatchFromStorage = (gameType: FollowGameType): TFollowMatch[] => {
  const list = readArrayFromStorage(getFollowMatchStorageKey(gameType));
  const normalized = list.reduce<TFollowMatch[]>((acc, item) => {
    const fm = normalizeFollowMatch(item);
    if (fm) acc.push(fm);
    return acc;
  }, []);
  return limitFollowMatches(filterExpiredFollowMatch(normalized));
};

/** 把当前关注列表写入对应场馆本地桶 */
const persistFollowMatch = (gameType: FollowGameType, list: TFollowMatch[]) => {
  safeSetLocalJSON(getFollowMatchStorageKey(gameType), limitFollowMatches(list));
};

/** 过滤掉已过期的关注赛事 */
const filterExpiredFollowMatch = (list: TFollowMatch[]): TFollowMatch[] => {
  const now = Date.now();
  return list.filter((item) => !isFollowMatchExpired(item, now));
};

const readNumberArrayFromStorage = (key: string, maxItems: number): number[] =>
  readArrayFromStorage(key)
    .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
    .slice(-maxItems);

const normalizePinnedMatch = (raw: unknown): PinnedMatch | null => {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<PinnedMatch>;
  if (typeof item.matchId !== 'string' || !item.matchId) return null;
  if (typeof item.sportId !== 'number' || !Number.isFinite(item.sportId)) return null;
  if (!Object.values(PlayType).includes(item.playType as PlayType)) return null;
  return { matchId: item.matchId, sportId: item.sportId, playType: item.playType as PlayType };
};

const readPinnedMatchesFromStorage = (): PinnedMatch[] =>
  readArrayFromStorage(PINNED_MATCH_IDS_KEY)
    .reduce<PinnedMatch[]>((acc, item) => {
      const pinnedMatch = normalizePinnedMatch(item);
      if (pinnedMatch) acc.push(pinnedMatch);
      return acc;
    }, [])
    .slice(-MAX_PINNED_MATCHES);

const persistPinnedSports = (list: number[]) => {
  safeSetLocalJSON(PINNED_SPORT_IDS_KEY, _.uniq(list).slice(-MAX_PINNED_SPORTS));
};

const persistPinnedMatches = (list: PinnedMatch[]) => {
  safeSetLocalJSON(PINNED_MATCH_IDS_KEY, list.slice(-MAX_PINNED_MATCHES));
};

/** 取已过期（开赛 + 24h）的关注赛事，供调用方在本地移除前调用服务器删除接口 */
export const getExpiredFollowMatches = (
  list: TFollowMatch[],
  now: number = Date.now(),
): TFollowMatch[] => list.filter((item) => isFollowMatchExpired(item, now));
export interface SportState {
  venue: EVenue;
  mainList: {
    settings: {
      sportId: number;
      favoriteSportId: number;
      matchDateId: number;
      playType: PlayType;
      playTypeId: number | null;
      /** OB 联赛 tid 可能超长，保留 string；FB 一般为 number */
      filterByLeagueIds: Array<number | string>;
      /** 联赛筛选是否与「筛选」Tab 勾选同步；热门搜索生效的筛选为 false，仅搜索 Tab 回显 */
      filterLeaguePickerSynced: boolean;
      filterSearchText: string; // 赛事搜索的文字 只用于回显
      orderBy: number; // 排序 0 按开赛时间排序，1 按联赛排序， 传：0或1 默认 1 按联赛
      filterTime: number[]; // 早盘 时间筛选 空数组为全部 否则传13位时间戳
      followMatch: TFollowMatch[];
      collapsedAll: boolean;
      simpleActiveItem: LocalHandicapItem | null;
      isSimpleOdds: boolean; // 是否为简洁版盘口样式
      hasHotList: boolean; // 是否含有热门赛事列表
    };
    datas: {
      pinnedSportIds: number[]; // 置顶的赛种id（目前只有热门可以置顶）
      pinnedMatchs: Array<PinnedMatch>;
      menuInfo: MenuInfo;
    };
  };
  /** PC体育页面，左侧菜单展示内容 */
  sportsLeftPanelType: ESportsLeftPanelType;
  /** 是否开启同步单串 */
  syncSingleParlay?: boolean;
  /** 是否开启进球铃声 */
  isOpenGoalSound?: boolean;
  /**
   * 盘口设置：用户的选择，取值与后端 `bettingOddsSettings` 完全一致（1 欧洲盘 / 2 香港盘）。
   * 只用于「持久化 + 与后端同步」，展示/取数一律用下面的 `currentOddsType`。
   */
  bettingOddsSettings: number;
  /**
   * 当前实际生效的盘口类型（衍生值，已按场馆修正）：
   * FB 场馆不支持香港盘，恒为欧洲盘；EB(OB) 场馆跟随用户选择。
   * 消费方直接用它即可，不需要再判断场馆。
   */
  currentOddsType: EOddsType;
  /** PC投注抽屉,是否隐藏app下载模块(默认不隐藏) */
  hideBetDrawerDownloadApp: boolean;
}

type TStorageSportState = Pick<
  SportState,
  'syncSingleParlay' | 'isOpenGoalSound' | 'bettingOddsSettings' | 'hideBetDrawerDownloadApp'
>;

const DEFAULT_BETTING_ODDS_SETTINGS = ODDS_TYPE_TO_BETTING_ODDS_SETTINGS[EOddsType.EU];

/**
 * 由「用户选择 + 当前场馆」算出实际生效的盘口类型。
 * FB 场馆不支持香港盘，一律回落欧洲盘；脏值同样回落欧洲盘。
 */
const deriveCurrentOddsType = (venue: EVenue, bettingOddsSettings: number): EOddsType => {
  if (venue === EVenue.FB) return EOddsType.EU;
  return BETTING_ODDS_SETTINGS_TO_ODDS_TYPE[bettingOddsSettings] ?? EOddsType.EU;
};

/** 从 localStorage 恢复场馆；非法值回落 FB */
const readVenueFromStorage = (): EVenue => {
  const raw = safeGetLocalString(SPORT_VENUE_KEY);
  if (raw === EVenue.OB || raw === EVenue.FB) return raw;
  return EVenue.FB;
};

const persistVenue = (venue: EVenue) => {
  safeSetLocalString(SPORT_VENUE_KEY, venue);
};

const getInitialState = (): TStorageSportState => {
  const storedBettingOddsSettings = Number(safeGetLocalString(BETTING_ODDS_SETTINGS_KEY));
  return {
    syncSingleParlay:
      safeGetLocalString(SYNC_SINGLE_PARLAY_KEY) === 'true' ||
      safeGetLocalString(SYNC_SINGLE_PARLAY_KEY) === null,
    isOpenGoalSound: safeGetLocalString(IS_OPEN_GOAL_SOUND_KEY) === 'true',
    bettingOddsSettings:
      BETTING_ODDS_SETTINGS_TO_ODDS_TYPE[storedBettingOddsSettings] === undefined
        ? DEFAULT_BETTING_ODDS_SETTINGS
        : storedBettingOddsSettings,
    hideBetDrawerDownloadApp: safeGetLocalString(HIDE_BET_DRAWER_APP_DOWNLOAD_KEY) === 'true',
  };
};

const storageState = getInitialState();
const initialVenue = readVenueFromStorage();

export const initialState: SportState = {
  venue: initialVenue,
  mainList: {
    settings: {
      sportId: initialVenue === EVenue.OB ? OBSportIdValue.Football : FBSportIdValue.Football,
      // sportId: 1,
      favoriteSportId: 0,
      matchDateId: 0,
      playType: PlayType.Living,
      playTypeId: MatchPlayType.LIVE,
      filterByLeagueIds: [],
      filterLeaguePickerSynced: true,
      filterSearchText: '',
      collapsedAll: false,
      // 按恢复的场馆读对应收藏桶（FB 含旧单桶迁移）
      followMatch: readFollowMatchFromStorage(getFollowGameType(initialVenue)),
      simpleActiveItem: null,
      orderBy: 1, // 排序 0 按开赛时间排序，1 按联赛排序，传：0或1 默认 1 按联赛
      filterTime: [], // 早盘 时间筛选 空数组为全部 否则传13位时间戳
      isSimpleOdds: safeGetLocalString(IS_SIMPLE_ODDS_KEY) === 'true',
      hasHotList: false,
    },
    datas: {
      pinnedSportIds: readNumberArrayFromStorage(PINNED_SPORT_IDS_KEY, MAX_PINNED_SPORTS),
      pinnedMatchs: readPinnedMatchesFromStorage(),
      menuInfo: {
        hotSportMatchIds: [],
        menus: {
          [PlayType.Today]: [],
          [PlayType.Early]: [],
          [PlayType.Living]: [],
          [PlayType.Champion]: [],
          [PlayType.Follow]: [],
        },
        playTypes: [],
      },
    },
  },
  sportsLeftPanelType: ESportsLeftPanelType.MENU,
  ...storageState,
  // 衍生值：按恢复场馆重算；后续由 setVenue / setCurrentOddsTypeAction 更新
  currentOddsType: deriveCurrentOddsType(initialVenue, storageState.bettingOddsSettings),
};

const sportSlice = createSlice({
  name: 'sport',
  initialState,
  reducers: {
    /**
     * 切换体育三方场馆（FB / OB）
     * 清空菜单与筛选，重置到该场馆滚球+足球，避免沿用热门/冠军 typeId 或空 euid 打错接口
     */
    setVenue: (state, action: PayloadAction<EVenue>) => {
      const venue = action.payload;
      const prevGameType = getFollowGameType(state.venue);
      const nextGameType = getFollowGameType(venue);
      // 收藏按场馆分桶：先落盘当前场馆列表，再切换到目标场馆列表（对齐 Flutter FB/OB 各自 FavRx）
      if (prevGameType !== nextGameType) {
        persistFollowMatch(prevGameType, state.mainList.settings.followMatch);
        state.mainList.settings.followMatch = readFollowMatchFromStorage(nextGameType);
      }
      state.venue = venue;
      persistVenue(venue);
      // 盘口是场馆相关的衍生值：FB 不支持香港盘，切场馆时重算
      state.currentOddsType = deriveCurrentOddsType(venue, state.bettingOddsSettings);
      state.mainList.datas.menuInfo = {
        hotSportMatchIds: [],
        menus: {
          [PlayType.Today]: [],
          [PlayType.Early]: [],
          [PlayType.Living]: [],
          [PlayType.Champion]: [],
          [PlayType.Follow]: [],
        },
        playTypes: [],
      };
      state.mainList.settings.playType = PlayType.Living;
      state.mainList.settings.playTypeId = MatchPlayType.LIVE;
      state.mainList.settings.sportId =
        venue === EVenue.OB ? OBSportIdValue.Football : FBSportIdValue.Football;
      state.mainList.settings.filterByLeagueIds = [];
      state.mainList.settings.filterSearchText = '';
      state.mainList.settings.filterLeaguePickerSynced = true;
      state.mainList.settings.filterTime = [];
      state.mainList.settings.orderBy = 1;
      state.mainList.settings.simpleActiveItem = null;
      state.mainList.settings.hasHotList = false;
    },
    // 更改首页主列表相关设置
    changeMainListSettings: (
      state,
      action: PayloadAction<Partial<SportState['mainList']['settings']>>,
    ) => {
      state.mainList.settings = {
        ...state.mainList.settings,
        ...action.payload,
      };
    },
    // 添加/移除关注赛事
    setFollowMatchIds: (
      state,
      action: PayloadAction<{
        type: 'add' | 'remove' | 'set';
        matchInfos?: TFollowMatch[];
        allMatchInfos?: TFollowMatch[];
      }>,
    ) => {
      const { type, matchInfos, allMatchInfos } = action.payload;
      const isAdd = type === 'add';
      const isSet = type === 'set';

      if (isSet && allMatchInfos !== undefined) {
        state.mainList.settings.followMatch = limitFollowMatches(allMatchInfos);
      } else if (isAdd && matchInfos) {
        const existingIds = new Set(state.mainList.settings.followMatch.map((m) => m.matchId));
        matchInfos?.forEach((m) => {
          if (!existingIds.has(m.matchId)) {
            state.mainList.settings.followMatch.push(m);
            existingIds.add(m.matchId);
          }
        });
      } else if (!isAdd && matchInfos) {
        const removeIds = new Set(matchInfos?.map((m) => m.matchId));
        state.mainList.settings.followMatch = _.filter(
          state.mainList.settings.followMatch,
          (item) => !removeIds.has(item.matchId),
        );
      }

      state.mainList.settings.followMatch = limitFollowMatches(state.mainList.settings.followMatch);
      persistFollowMatch(getFollowGameType(state.venue), state.mainList.settings.followMatch);
      const { sportId, playType, followMatch } = state.mainList.settings;

      // remove（取消关注）与 set（从服务器整表回填）都可能让当前选中的赛种在关注列表里不复存在，
      // 此时若停留在关注 tab，需要把 sportId 切到关注列表里的第一个赛种，否则列表按
      // f.sportId === sportId 过滤后为空，出现「有数据却不显示」。add 不涉及赛种消失，无需处理。
      if (!isAdd && playType === PlayType.Follow) {
        const followMatchSportIds = _.map(followMatch, (item) => item.sportId);
        if (!followMatchSportIds.includes(sportId)) {
          state.mainList.settings.sportId = followMatchSportIds[0] ?? 0;
        }
      }
    },
    // 清理已过期（开赛时间 + 24h）的关注赛事
    cleanExpiredFollowMatch: (state) => {
      const filtered = filterExpiredFollowMatch(state.mainList.settings.followMatch);
      if (filtered.length === state.mainList.settings.followMatch.length) return;
      state.mainList.settings.followMatch = filtered;
      persistFollowMatch(getFollowGameType(state.venue), filtered);

      const { sportId, playType, followMatch } = state.mainList.settings;
      if (playType === PlayType.Follow) {
        const followMatchSportIds = _.map(followMatch, (item) => item.sportId);
        if (!followMatchSportIds.includes(sportId)) {
          state.mainList.settings.sportId = followMatchSportIds[0] ?? 0;
        }
      }
    },
    // 添加/移除置顶赛种
    setPinnedSportIds: (
      state,
      action: PayloadAction<{ type: 'add' | 'remove'; sportId: number }>,
    ) => {
      const { type, sportId } = action.payload;
      if (type === 'add') {
        state.mainList.datas.pinnedSportIds.push(sportId);
      } else {
        state.mainList.datas.pinnedSportIds = _.difference(state.mainList.datas.pinnedSportIds, [
          sportId,
        ]);
      }
      state.mainList.datas.pinnedSportIds = _.uniq(state.mainList.datas.pinnedSportIds).slice(
        -MAX_PINNED_SPORTS,
      );
      persistPinnedSports(state.mainList.datas.pinnedSportIds);
    },
    // 添加/移除置顶比赛
    setPinnedMatchIds: (
      state,
      action: PayloadAction<{
        type: 'add' | 'remove' | 'set';
        matchId?: string;
        allMatchInfos?: PinnedMatch[];
      }>,
    ) => {
      const { type, matchId, allMatchInfos } = action.payload;
      const { sportId, playType } = state.mainList.settings;
      switch (type) {
        case 'add':
          state.mainList.datas.pinnedMatchs.push({ matchId: matchId ?? '', sportId, playType });
          break;
        case 'remove':
          state.mainList.datas.pinnedMatchs = state.mainList.datas.pinnedMatchs.filter(
            (item) =>
              item.matchId !== matchId || item.sportId !== sportId || item.playType !== playType,
          );
          break;
        case 'set':
          state.mainList.datas.pinnedMatchs = allMatchInfos ?? [];
          break;
      }
      state.mainList.datas.pinnedMatchs =
        state.mainList.datas.pinnedMatchs.slice(-MAX_PINNED_MATCHES);
      persistPinnedMatches(state.mainList.datas.pinnedMatchs);
    },
    // 设置菜单数据
    setMenus: (state, action: PayloadAction<MenuInfo>) => {
      if (!state.mainList.settings.simpleActiveItem) {
        // 简洁版初始化赔率玩法项
        state.mainList.settings.simpleActiveItem =
          (findVenueCompetition(state.venue, state.mainList.settings.sportId)?.simpleList[0] as
            LocalHandicapItem | undefined) ?? null;
      }
      state.mainList.datas.menuInfo = { ...state.mainList.datas.menuInfo, ...action.payload };
    },

    // region 设置左侧菜单展示内容
    setSportsLeftPanelType: (state, action: PayloadAction<ESportsLeftPanelType>) => {
      state.sportsLeftPanelType = action.payload;
    },
    // #endregion

    // region 切换同步单串
    toggleSyncSingleParlayAction: (state) => {
      const _syncSingleParlay = !state.syncSingleParlay;
      state.syncSingleParlay = _syncSingleParlay;
      safeSetLocalJSON(SYNC_SINGLE_PARLAY_KEY, _syncSingleParlay);
    },
    // 直接设置同步单串状态，供游客配置/会员配置同步使用
    setSyncSingleParlayAction: (state, action: PayloadAction<boolean>) => {
      state.syncSingleParlay = action.payload;
      safeSetLocalJSON(SYNC_SINGLE_PARLAY_KEY, action.payload);
    },
    // #endregion

    // region PC投注展示APP下载
    toggleHideBetDrawerDownloadAppAction: (state) => {
      const _hideBetDrawerDownloadApp = !state.hideBetDrawerDownloadApp;
      state.hideBetDrawerDownloadApp = _hideBetDrawerDownloadApp;
      safeSetLocalJSON(HIDE_BET_DRAWER_APP_DOWNLOAD_KEY, _hideBetDrawerDownloadApp);
    },
    // #endregion

    toggleIsOpenGoalSoundAction: (state) => {
      const _isOpenGoalSound = !state.isOpenGoalSound;
      state.isOpenGoalSound = _isOpenGoalSound;
      safeSetLocalJSON(IS_OPEN_GOAL_SOUND_KEY, _isOpenGoalSound);
    },
    // 直接设置进球铃声状态，供游客配置/会员配置同步使用
    setIsOpenGoalSoundAction: (state, action: PayloadAction<boolean>) => {
      state.isOpenGoalSound = action.payload;
      safeSetLocalJSON(IS_OPEN_GOAL_SOUND_KEY, action.payload);
    },
    // 直接设置盘口样式，供游客配置/会员配置同步使用
    setIsSimpleOddsAction: (state, action: PayloadAction<boolean>) => {
      state.mainList.settings.isSimpleOdds = action.payload;
      safeSetLocalString(IS_SIMPLE_ODDS_KEY, action.payload ? 'true' : 'false');
    },
    /**
     * 设置盘口（欧洲盘/香港盘），供设置弹窗与游客配置/会员配置同步使用。
     * 入参是用户的选择，同时落两个字段：
     * - `bettingOddsSettings`：原样保存用户选择（与后端一致），并持久化；
     * - `currentOddsType`：按当前场馆算出的实际生效值，FB 场馆下恒为欧洲盘。
     */
    setCurrentOddsTypeAction: (state, action: PayloadAction<EOddsType>) => {
      const bettingOddsSettings = ODDS_TYPE_TO_BETTING_ODDS_SETTINGS[action.payload];
      state.bettingOddsSettings = bettingOddsSettings;
      state.currentOddsType = deriveCurrentOddsType(state.venue, bettingOddsSettings);
      safeSetLocalString(BETTING_ODDS_SETTINGS_KEY, String(bettingOddsSettings));
    },
  },
  extraReducers: (builder) => {
    // 退出登录 / 会话失效：清空当前内存列表与 FB/EB 本地桶（含旧单桶），避免串账号
    builder.addCase(clearUserInfo, (state) => {
      state.mainList.settings.followMatch = [];
      safeRemoveLocal(FOLLOW_MATCH_IDS_FB_KEY);
      safeRemoveLocal(FOLLOW_MATCH_IDS_EB_KEY);
      // 若正停在关注 tab，关注列表已空，把选中赛种归零，避免按 sportId 过滤后空列表卡住
      if (state.mainList.settings.playType === PlayType.Follow) {
        state.mainList.settings.sportId = 0;
      }
    });
  },
});

export const {
  setVenue,
  changeMainListSettings,
  setFollowMatchIds,
  cleanExpiredFollowMatch,
  setPinnedSportIds,
  setPinnedMatchIds,
  setMenus,
  toggleSyncSingleParlayAction,
  setSyncSingleParlayAction,
  toggleHideBetDrawerDownloadAppAction,
  toggleIsOpenGoalSoundAction,
  setIsOpenGoalSoundAction,
  setIsSimpleOddsAction,
  setCurrentOddsTypeAction,
  setSportsLeftPanelType,
} = sportSlice.actions;

export default sportSlice.reducer;
