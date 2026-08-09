/**
 * 获取体育主列表数据
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { MatchListParams } from '@/apis/fbSports/getList';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import _ from 'lodash';
import { HotSportId, LotterySportId, PlayType } from '@/apis/commonSports/constants';

import { useVenueService } from '@/apis/commonSports';
import { MatchBaseInfo } from '@/apis/commonSports/types';
import { useMatchWinnersQuery } from '@/apis/fbSports/getMatchWinner';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import {
  cleanExpiredFollowMatch,
  getExpiredFollowMatches,
  setFollowMatchIds,
  setPinnedMatchIds,
} from '@/core/store/slices/sportSlice';
import { delFollowReq } from '@/apis/origin/follow';
import { getFollowSnapshot } from '@/common/hooks/follow';
import { useFollowMatchResults } from '@/common/hooks/sports/useFollowMatchResults';

/** web 体育关注 tab 目前只对接 FB 平台 */
const FOLLOW_GAME_TYPE = 'FB';

type MatchStatus = 'pinned' | 'normal';
type LeagueGroupList = Array<{
  leagueId: number;
  count: number;
  leagueName: string;
  leagueLogo: string;
  matches: Array<MatchBaseInfo>;
}>;
// 主列表常规比赛分组
export type TMatchTypeGroupList = Array<{
  matchStatus: MatchStatus;
  count: number;
  leagueIds: number[];
  sportGroup: Array<{
    sportId: number;
    count: number;
    sportName: string;
    sportPinned: boolean;
    leagueGroup: LeagueGroupList;
  }>;
}>;

/**
 * 与 /sports 首页 MainList 渲染顺序一致：先置顶分组（pinned），再常规（normal）；
 * 每组内按 sportGroup → leagueGroup → matches[0] 取第一场。
 */
export function getFirstMatchIdFromListData(listData: TMatchTypeGroupList): number | undefined {
  for (const statusGroup of listData) {
    for (const sportGroup of statusGroup.sportGroup) {
      for (const leagueGroup of sportGroup.leagueGroup) {
        const first = leagueGroup.matches[0];
        if (first) return first.matchId;
      }
    }
  }
  return undefined;
}

/** 同上，返回完整 MatchBaseInfo（与 MainList 第一条赛事一致） */
export function getFirstMatchFromListData(
  listData: TMatchTypeGroupList,
): MatchBaseInfo | undefined {
  for (const statusGroup of listData) {
    for (const sportGroup of statusGroup.sportGroup) {
      for (const leagueGroup of sportGroup.leagueGroup) {
        const first = leagueGroup.matches[0];
        if (first) return first;
      }
    }
  }
  return undefined;
}

export const useSportsMainListData = () => {
  const { sportId, playTypeId, playType } = useAppSelector(
    (state) => state.sport.mainList.settings,
  );
  const pinnedSportIds = useAppSelector((state) => state.sport.mainList.datas.pinnedSportIds);
  const pinnedMatchs = useAppSelector((state) => state.sport.mainList.datas.pinnedMatchs);
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);
  const filterByLeagueIds = useAppSelector(
    (state) => state.sport.mainList.settings.filterByLeagueIds,
  );
  const orderBy = useAppSelector((state) => state.sport.mainList.settings.orderBy);
  const filterTime = useAppSelector((state) => state.sport.mainList.settings.filterTime);
  const menus = useAppSelector((state) => state.sport.mainList.datas.menuInfo.menus);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const dispatch = useAppDispatch();
  const followMatchIds = _.map(followMatch, (item) => item.matchId);
  /**
   * 仅在「本次已进入关注页且至少拿到过一次非占位的真实列表」后为 true。
   * 用于 keepPreviousData：首次从其他玩法切到关注时不要用上一玩法的数据占位；在关注页内取消/添加关注仍可保留上一屏。
   */
  const [followListReadyForPlaceholder, setFollowListReadyForPlaceholder] = useState(false);
  const { useGetMainListQuery } = useVenueService();
  const queryParams = useMemo(() => {
    const params: MatchListParams = {
      size: 50,
      sportId,
      type: playTypeId ?? undefined,
    };
    if (playType === PlayType.Follow) {
      params.matchIds = followMatch.map((item) => item.matchId);
      params.sportId = undefined;
    }
    if (sportId === LotterySportId) {
      // 竞彩赛事id，从菜单中获取赛事id(额外的接口获取的赛事id)
      params.matchIds =
        _.filter(menus[playType], (item) => item.sportId === LotterySportId)?.[0]?.matchIds?.map(
          (item) => Number(item),
        ) || [];
      params.sportIds = [FBSportIdValue.Football, FBSportIdValue.Basketball];
    }
    if (filterByLeagueIds.length > 0) {
      params.leagueIds = filterByLeagueIds;
    }
    // 联赛排序
    params.orderBy = orderBy;

    // 早盘 时间筛选
    if (filterTime && filterTime.length > 0 && playType === PlayType.Early) {
      params.beginTime = filterTime[0];
      params.endTime = filterTime[1];
    }

    return params;
  }, [sportId, playTypeId, playType, menus, filterByLeagueIds, orderBy, filterTime, followMatch]);

  // 主列表数据查询(关注列表没有数据时不查询)
  const mainListQuery = useGetMainListQuery(queryParams, {
    enabled: playType !== PlayType.Follow || followMatch.length > 0,
    keepPreviousData: playType === PlayType.Follow && followListReadyForPlaceholder,
  });

  useEffect(() => {
    if (playType !== PlayType.Follow) {
      setFollowListReadyForPlaceholder(false);
    }
  }, [playType]);

  useEffect(() => {
    if (playType !== PlayType.Follow) return;
    if (mainListQuery.isSuccess && !mainListQuery.isPlaceholderData) {
      setFollowListReadyForPlaceholder(true);
    }
  }, [playType, mainListQuery.isSuccess, mainListQuery.isPlaceholderData]);

  // 置顶赛种数据查询(有置顶赛种id时并且主列表有数据时才查询)置顶查询按照球种和赛事状态分类
  const pinnedMatchIds = pinnedMatchs
    .filter((item) => item.sportId === sportId && item.playType === playType)
    .map((item) => item.matchId);
  const pinnedSportQuery = useGetMainListQuery(
    // 置顶赛事直接通过置顶id去查询，其他条件按照和当前主列表查询数据一样
    { ...queryParams, matchIds: pinnedMatchIds },
    { enabled: pinnedMatchIds.length > 0 && (mainListQuery.data?.pages[0]?.length || 0) > 0 },
  );

  // live 接口返回的赛事 id：传给 useFollowMatchResults 作为「掉出 live → 刷新赛果 / 完场占位」的依据
  const liveMatchIds = useMemo(
    () => (mainListQuery.data?.pages.flat() ?? []).map((m) => m.matchId),
    [mainListQuery.data],
  );

  // 队名加粗：与 App 对齐，改用后端「初盘」winner（不随实时赔率变动）。
  // 后端给不到时，保留 formatFBSportItem 用 mg 算出的本地结果（其自身已含规则 3 兜底）。
  const matchWinners = useMatchWinnersQuery(liveMatchIds);
  const applyNameBold = useMemo(
    () =>
      <T extends MatchBaseInfo>(m: T): T => {
        const w = matchWinners[String(m.matchId)];
        return w ? { ...m, nameBold: w } : m;
      },
    [matchWinners],
  );

  // 关注列表中「投注自动关注」赛事的赛果（完场态/完场占位）：按 matchId 提供，
  // 在下方 listData 中按「live 优先、赛果兜底」合并展示
  const { endedMatches } = useFollowMatchResults({
    followMatch,
    sportId,
    enabled: playType === PlayType.Follow,
    liveMatchIds,
  });

  // 定时清理「开赛 + 24h」已过期的关注赛事：本地移除；登录态额外调删除接口清理服务器
  // （服务端不会按 matchEndTime 自动删，超 24h 主动删除避免 list 长期堆积已完赛事）。
  // 用 ref 读最新值，避免把 followMatch/isLogin 放进依赖导致每次变更都重建定时器。
  const followMatchRef = useRef(followMatch);
  followMatchRef.current = followMatch;
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;
  useEffect(() => {
    const runClean = () => {
      const expired = getExpiredFollowMatches(followMatchRef.current);
      if (expired.length > 0 && isLoginRef.current) {
        expired.forEach((m) => {
          void delFollowReq({
            gameType: FOLLOW_GAME_TYPE,
            matchId: String(m.matchId),
          }).catch(() => void 0);
        });
      }
      dispatch(cleanExpiredFollowMatch());
    };
    runClean();
    const timer = setInterval(runClean, 60 * 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const listData: TMatchTypeGroupList = useMemo(() => {
    const result: TMatchTypeGroupList = [];
    // 将主列表所有页面的数据合并成一个数组
    if (!mainListQuery.data?.pages) return result;

    const liveList = mainListQuery.data.pages.flat();
    let pinnedSportData = pinnedSportQuery.data?.pages.flat() ?? [];

    // 关注玩法：以 followMatch 为准重建列表（仅当前赛种）。每场优先取 live 数据，
    // 其次取赛果（完场态），两者都没有则丢弃。其它玩法直接用 live 列表。
    let allMainListData = liveList;
    if (playType === PlayType.Follow) {
      const liveMap = new Map(liveList.map((m) => [m.matchId, m]));
      const endedMap = new Map(endedMatches.map((m) => [m.matchId, m]));
      allMainListData = followMatch.reduce<MatchBaseInfo[]>((acc, f) => {
        if (f.sportId !== sportId) return acc;
        const match = liveMap.get(f.matchId) ?? endedMap.get(f.matchId);
        if (match) acc.push(match);
        return acc;
      }, []);
    }

    // 1. 按置顶 id 把主列表拆成「置顶」和「不置顶」两份
    const [pinnedFromMain, mainListData] = _.partition(allMainListData, (item) =>
      pinnedMatchIds.includes(item.matchId),
    );

    // 2. 主列表中的置顶数据合并进 pinnedSportData（按 matchId 去重）
    pinnedSportData = _.unionBy(pinnedSportData, pinnedFromMain, 'matchId');

    if (pinnedSportData.length > 0) {
      // 3. 后置顶的在前：id=[1,2,3,4] 则 4 最前；不在置顶 id 里的保持原序排在后面
      pinnedSportData = _.orderBy(
        pinnedSportData,
        (item) => _.indexOf(pinnedMatchIds, item.matchId),
        'desc', // index 越大（越后置顶）排越前，-1（未置顶）排最后
      );

      result.push({
        matchStatus: 'pinned',
        count: pinnedSportData.length,
        leagueIds: pinnedSportData.map((item) => item.leagueId),
        sportGroup: formatSportGroup(
          pinnedSportData.map(applyNameBold),
          sportId === HotSportId,
          pinnedSportIds,
          pinnedMatchIds,
          followMatchIds,
        ),
      });
    }

    if (mainListData.length > 0) {
      // 4. 常规比赛按照赛种分组
      result.push({
        matchStatus: 'normal',
        count: mainListData.length,
        leagueIds: mainListData.map((item) => item.leagueId),
        sportGroup: formatSportGroup(
          mainListData.map(applyNameBold),
          sportId === HotSportId,
          pinnedSportIds,
          pinnedMatchIds,
          followMatchIds,
        ),
      });
    }
    return result;
  }, [
    mainListQuery.data,
    pinnedSportQuery.data,
    pinnedMatchIds,
    followMatch,
    followMatchIds,
    sportId,
    pinnedSportIds,
    playType,
    endedMatches,
    applyNameBold,
  ]);

  // 关注列表中掉出 live 接口（已完赛/下架）的赛事：只要还能解析出快照（手动/投注均带 matchData），
  // 就保留下来交给 useFollowMatchResults 查赛果 / 完场占位展示，最终由「开赛 + 24h」过期逻辑统一清理
  // （登录态并会调删除接口）。只有连快照都取不到的脏数据才在此直接剔除。
  // keepPreviousData 占位期间 data 仍是上一轮请求结果，与当前 followMatch 可能不一致，不可据此写回 store
  useEffect(() => {
    if (playType !== PlayType.Follow || !mainListQuery.data?.pages?.length) return;
    if (mainListQuery.isPlaceholderData) return;
    const allReturnedMatches = mainListQuery.data.pages.flat();
    const returnedMatchIds = _.map(allReturnedMatches, (item) => item.matchId);
    const stillValidFollowMatch = _.filter(
      followMatch,
      (item) => returnedMatchIds.includes(item.matchId) || getFollowSnapshot(item) !== null,
    );
    if (stillValidFollowMatch.length < followMatch.length) {
      dispatch(setFollowMatchIds({ type: 'set', allMatchInfos: stillValidFollowMatch }));
    }
  }, [
    playType,
    sportId,
    mainListQuery.data,
    mainListQuery.isPlaceholderData,
    followMatch,
    dispatch,
  ]);

  // 当前查询条件下的置顶数据，如果置顶的比赛接口查不到了（已结束/下架），则将置顶的联赛从置顶数据中移除
  useEffect(() => {
    if (pinnedMatchIds.length > 0 && !pinnedSportQuery.data?.pages?.length) return;
    const allReturnedPinnedMatches = pinnedSportQuery.data?.pages.flat() ?? [];
    const returnedPinnedMatchIds = _.map(allReturnedPinnedMatches, (item) => item.matchId);
    const stillValidPinnedMatch = _.filter(pinnedMatchs, (item) =>
      returnedPinnedMatchIds.includes(item.matchId),
    );
    if (stillValidPinnedMatch.length < pinnedMatchIds.length) {
      dispatch(setPinnedMatchIds({ type: 'set', allMatchInfos: stillValidPinnedMatch }));
    }
  }, [pinnedMatchs, pinnedSportQuery.data, dispatch, pinnedMatchIds.length]);

  return {
    ...mainListQuery,
    listData,
    sportId,
  };
};

const formatSportGroup = (
  matches: MatchBaseInfo[],
  isHotSport: boolean,
  pinnedSportIds: number[],
  pinnedMatchIds: number[],
  followMatchIds: number[],
) => {
  // 按 sportId 分组，同时保持原始顺序
  const sportGroups = _.groupBy(matches, 'sportId');
  const sportIdOrder = _.uniq(matches.map((m) => m.sportId));

  const sportGroupArray = sportIdOrder.map((sportId) => {
    const sportMatches = sportGroups[sportId]!;
    // 按 leagueId 分组，同时保持原始顺序
    const leagueGroups = _.groupBy(sportMatches, 'leagueId');
    const leagueIdOrder = _.uniq(sportMatches.map((m) => m.leagueId));

    // 转换为 leagueGroup 数组
    const leagueGroupArray: LeagueGroupList = leagueIdOrder.map((leagueId) => {
      const leagueMatches = leagueGroups[leagueId]!;
      return {
        leagueId: Number(leagueId),
        count: leagueMatches.length,
        leagueName: leagueMatches[0]?.leagueName ?? '',
        leagueLogo: leagueMatches[0]?.leagueLogo ?? '',
        matches: leagueMatches.map((item) => ({
          ...item,
          matchPinned: pinnedMatchIds.includes(item.matchId),
          isFollow: followMatchIds.includes(item.matchId),
        })),
      };
    });

    return {
      sportId: Number(sportId),
      count: sportMatches.length,
      sportName: sportMatches[0]?.sportName ?? '',
      sportPinned: pinnedSportIds.includes(Number(sportId)),
      leagueGroup: leagueGroupArray,
    };
  });
  if (isHotSport) {
    // 后置顶的在前：id=[1,2,3,4] 则 sportId=4 最前；不在置顶 id 里的保持原序排在后面
    return _.orderBy(
      sportGroupArray,
      (item) => _.indexOf(pinnedSportIds, item.sportId),
      'desc', // index 越大（越后置顶）排越前，-1（未置顶）排最后
    );
  }
  return sportGroupArray;
};
