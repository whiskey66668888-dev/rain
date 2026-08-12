import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import { EVenue, PlayType } from '@/apis/commonSports/constants';
import {
  FOLLOW_MATCH_IDS_KEY,
  PINNED_SPORT_IDS_KEY,
  PINNED_MATCH_IDS_KEY,
  SYNC_SINGLE_PARLAY_KEY,
  IS_SIMPLE_ODDS_KEY,
  IS_OPEN_GOAL_SOUND_KEY,
  HIDE_BET_DRAWER_APP_DOWNLOAD_KEY,
} from '@/utils/constants/cacheKey';
import { toMillis } from '@/utils/dateHelper';
import { MenuInfo } from '@/apis/commonSports/types';
import { FBCompetitionMap, FBSportIdValue, MatchPlayType } from '@/apis/fbSports/common/constants';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { ESportsLeftPanelType } from '@/apis/commonSports/constants';
import { clearUserInfo } from '@/core/store/slices/userSlice';

/**
 * 娱乐大厅State
 */
export interface PinnedMatch {
  matchId: number;
  sportId: number;
  playType: PlayType;
}
export interface TFollowMatch {
  matchId: number;
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
  return { matchId: Number(r.matchId), sportId: Number(r.sportId) || 0, bt, source, matchData };
};

/** 从 localStorage 读取并归一化关注列表（跳过脏数据），再按开赛+24h 过滤 */
const readFollowMatchFromStorage = (): TFollowMatch[] => {
  const list = JSON.parse(localStorage.getItem(FOLLOW_MATCH_IDS_KEY) ?? '[]') as unknown[];
  const normalized = list.reduce<TFollowMatch[]>((acc, item) => {
    const fm = normalizeFollowMatch(item);
    if (fm) acc.push(fm);
    return acc;
  }, []);
  return filterExpiredFollowMatch(normalized);
};

/** 过滤掉已过期的关注赛事 */
const filterExpiredFollowMatch = (list: TFollowMatch[]): TFollowMatch[] => {
  const now = Date.now();
  return list.filter((item) => !isFollowMatchExpired(item, now));
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
      filterByLeagueIds: number[];
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
  /** PC投注抽屉,是否隐藏app下载模块(默认不隐藏) */
  hideBetDrawerDownloadApp: boolean;
}

type TStorageSportState = Pick<
  SportState,
  'syncSingleParlay' | 'isOpenGoalSound' | 'hideBetDrawerDownloadApp'
>;

const getInitialState = (): TStorageSportState => {
  return {
    syncSingleParlay:
      localStorage.getItem(SYNC_SINGLE_PARLAY_KEY) === 'true' ||
      localStorage.getItem(SYNC_SINGLE_PARLAY_KEY) === null,
    isOpenGoalSound: localStorage.getItem(IS_OPEN_GOAL_SOUND_KEY) === 'true',
    hideBetDrawerDownloadApp: localStorage.getItem(HIDE_BET_DRAWER_APP_DOWNLOAD_KEY) === 'true',
  };
};

export const initialState: SportState = {
  venue: EVenue.FB,
  mainList: {
    settings: {
      sportId: FBSportIdValue.Football,
      // sportId: 1,
      favoriteSportId: 0,
      matchDateId: 0,
      playType: PlayType.Living,
      playTypeId: MatchPlayType.LIVE,
      filterByLeagueIds: [],
      filterLeaguePickerSynced: true,
      filterSearchText: '',
      collapsedAll: false,
      followMatch: readFollowMatchFromStorage(),
      simpleActiveItem: null,
      orderBy: 1, // 排序 0 按开赛时间排序，1 按联赛排序，传：0或1 默认 1 按联赛
      filterTime: [], // 早盘 时间筛选 空数组为全部 否则传13位时间戳
      isSimpleOdds: localStorage.getItem(IS_SIMPLE_ODDS_KEY) === 'true',
      hasHotList: false,
    },
    datas: {
      pinnedSportIds: JSON.parse(localStorage.getItem(PINNED_SPORT_IDS_KEY) ?? '[]') as number[],
      pinnedMatchs: JSON.parse(localStorage.getItem(PINNED_MATCH_IDS_KEY) ?? '[]') as PinnedMatch[],
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
  ...getInitialState(),
};

const sportSlice = createSlice({
  name: 'sport',
  initialState,
  reducers: {
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
        state.mainList.settings.followMatch = allMatchInfos;
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

      localStorage.setItem(
        FOLLOW_MATCH_IDS_KEY,
        JSON.stringify(state.mainList.settings.followMatch),
      );
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
      localStorage.setItem(FOLLOW_MATCH_IDS_KEY, JSON.stringify(filtered));

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
      localStorage.setItem(
        PINNED_SPORT_IDS_KEY,
        JSON.stringify(state.mainList.datas.pinnedSportIds),
      );
    },
    // 添加/移除置顶比赛
    setPinnedMatchIds: (
      state,
      action: PayloadAction<{
        type: 'add' | 'remove' | 'set';
        matchId?: number;
        allMatchInfos?: PinnedMatch[];
      }>,
    ) => {
      const { type, matchId, allMatchInfos } = action.payload;
      const { sportId, playType } = state.mainList.settings;
      switch (type) {
        case 'add':
          state.mainList.datas.pinnedMatchs.push({ matchId: matchId ?? 0, sportId, playType });
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
      localStorage.setItem(PINNED_MATCH_IDS_KEY, JSON.stringify(state.mainList.datas.pinnedMatchs));
    },
    // 设置菜单数据
    setMenus: (state, action: PayloadAction<MenuInfo>) => {
      if (!state.mainList.settings.simpleActiveItem) {
        // 简洁版初始化赔率玩法项
        state.mainList.settings.simpleActiveItem =
          Object.values(FBCompetitionMap).find(
            (item) => item.id === state.mainList.settings.sportId,
          )?.simpleList[0] ?? null;
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
      localStorage.setItem(SYNC_SINGLE_PARLAY_KEY, JSON.stringify(_syncSingleParlay));
    },
    // 直接设置同步单串状态，供游客配置/会员配置同步使用
    setSyncSingleParlayAction: (state, action: PayloadAction<boolean>) => {
      state.syncSingleParlay = action.payload;
      localStorage.setItem(SYNC_SINGLE_PARLAY_KEY, JSON.stringify(action.payload));
    },
    // #endregion

    // region PC投注展示APP下载
    toggleHideBetDrawerDownloadAppAction: (state) => {
      const _hideBetDrawerDownloadApp = !state.hideBetDrawerDownloadApp;
      state.hideBetDrawerDownloadApp = _hideBetDrawerDownloadApp;
      localStorage.setItem(
        HIDE_BET_DRAWER_APP_DOWNLOAD_KEY,
        JSON.stringify(_hideBetDrawerDownloadApp),
      );
    },
    // #endregion

    toggleIsOpenGoalSoundAction: (state) => {
      const _isOpenGoalSound = !state.isOpenGoalSound;
      state.isOpenGoalSound = _isOpenGoalSound;
      localStorage.setItem(IS_OPEN_GOAL_SOUND_KEY, JSON.stringify(_isOpenGoalSound));
    },
    // 直接设置进球铃声状态，供游客配置/会员配置同步使用
    setIsOpenGoalSoundAction: (state, action: PayloadAction<boolean>) => {
      state.isOpenGoalSound = action.payload;
      localStorage.setItem(IS_OPEN_GOAL_SOUND_KEY, JSON.stringify(action.payload));
    },
    // 直接设置盘口样式，供游客配置/会员配置同步使用
    setIsSimpleOddsAction: (state, action: PayloadAction<boolean>) => {
      state.mainList.settings.isSimpleOdds = action.payload;
      localStorage.setItem(IS_SIMPLE_ODDS_KEY, action.payload ? 'true' : 'false');
    },
  },
  extraReducers: (builder) => {
    // 退出登录 / 会话失效（clearUserInfo：手动登出 useLogin，或会话失效 request.ts 统一派发）：
    // 清空本地关注列表与 FOLLOW_MATCH_IDS，避免下一个游客/账号看到上一账号的关注数据。
    builder.addCase(clearUserInfo, (state) => {
      state.mainList.settings.followMatch = [];
      localStorage.removeItem(FOLLOW_MATCH_IDS_KEY);
      // 若正停在关注 tab，关注列表已空，把选中赛种归零，避免按 sportId 过滤后空列表卡住
      if (state.mainList.settings.playType === PlayType.Follow) {
        state.mainList.settings.sportId = 0;
      }
    });
  },
});

export const {
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
  setSportsLeftPanelType,
} = sportSlice.actions;

export default sportSlice.reducer;
