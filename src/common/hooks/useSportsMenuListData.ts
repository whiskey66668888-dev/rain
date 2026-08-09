/**
 * 获取体育菜单列表数据
 */

import { useVenueService } from '@/apis/commonSports';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';
import { MenuInfo, Menues } from '@/apis/commonSports/types';
import { HotSportId, LotterySportId, PlayType } from '@/apis/commonSports/constants';
import { useSportListByTypeQuery } from '@/apis/origin/sportListByType';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { FBCompetitionMap, FBSportId, FBSportIdValue } from '@/apis/fbSports/common/constants';
import { setMenus } from '@/core/store/slices/sportSlice';
import { isSSR } from '@/utils/env';

/** 赛种 ID 在 FBCompetitionMap 中的顺序，模块级只算一次，排序时 O(1) 查找 */
const SPORT_ID_ORDER_MAP = (() => {
  const map = new Map<number, number>();
  Object.values(FBCompetitionMap).forEach((c, index) => map.set(c.id, index));
  return map;
})();

const getSortKey = (sportId: number) => SPORT_ID_ORDER_MAP.get(sportId) ?? Number.MAX_SAFE_INTEGER;

/** 按 FBCompetitionMap 顺序排序菜单项（所有 playType 共用） */
const sortMenuByCompetitionOrder = <T extends { sportId: number }>(items: T[]): T[] =>
  _.sortBy(items, (item) => getSortKey(item.sportId));

export interface SportsMenuListData {
  menuInfo: MenuInfo;
}
export const useSportsMenuListData = (): void => {
  const venue = useAppSelector((state) => state.sport.venue);
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);
  const dispatch = useAppDispatch();
  const _playType = playType === PlayType.Living ? 'going' : playType;
  // 只有今天，早盘，滚球可以获取竞彩数据
  const allowedFetchLottery = [PlayType.Today, PlayType.Early, PlayType.Living].includes(playType);
  // 三方菜单数据
  const { data: sportsMenuInfo } = useVenueService().useGetMenuListQuery({});
  // 竞彩足球赛事列表数据
  const { data: footballLotteryList = { matchIdList: [], matchIdVsWeekMap: [] } } =
    useSportListByTypeQuery(
      {
        gameType: venue,
        sportName: FBSportId.Football, // RICO_TODO: 暂时写死fb的赛种
        type: _playType,
      },
      { enabled: allowedFetchLottery },
    );
  // 竞彩篮球赛事列表数据
  const { data: basketballLotteryList = { matchIdList: [], matchIdVsWeekMap: [] } } =
    useSportListByTypeQuery(
      {
        gameType: venue,
        sportName: FBSportId.Basketball, // RICO_TODO: 暂时写死fb的赛种
        type: _playType,
      },
      { enabled: allowedFetchLottery },
    );
  const menuInfo: MenuInfo = useMemo(() => {
    const menuInfoResult = _.cloneDeep(sportsMenuInfo);
    if (!menuInfoResult) {
      return {
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
    }
    const menuDatas: Menues = menuInfoResult.menus;
    const playTypes = menuInfoResult.playTypes;
    const hotSportMatchIds = menuInfoResult.hotSportMatchIds;
    if (allowedFetchLottery) {
      const lotteryCount =
        footballLotteryList.matchIdList?.length + basketballLotteryList?.matchIdList?.length;
      if (lotteryCount > 0) {
        // 插入到热门/足球/篮球的后面（如果有的话）
        const hotIndex = menuDatas[playType].findIndex((item) => item.sportId === HotSportId);
        const footballIndex = menuDatas[playType].findIndex(
          (item) => item.sportId === Number(FBSportIdValue.Football),
        );
        const basketballIndex = menuDatas[playType].findIndex(
          (item) => item.sportId === Number(FBSportIdValue.Basketball),
        );
        const insertIndex = Math.max(hotIndex, footballIndex, basketballIndex) + 1;
        menuDatas[playType].splice(insertIndex, 0, {
          sportId: LotterySportId,
          count: lotteryCount,
          name: '竞彩',
          viewId: LotterySportId,
          matchIds: [...footballLotteryList.matchIdList, ...basketballLotteryList.matchIdList],
          matchIdVsWeekMap: [
            ...footballLotteryList.matchIdVsWeekMap,
            ...basketballLotteryList.matchIdVsWeekMap,
          ],
        });

        // // 将当前 playType 下的 count 加上竞彩数量
        // playTypes = _.map(playTypes ?? [], (item) =>
        //   item.type === playType ? { ...item, count: item.count + lotteryCount } : item,
        // );
      }
    }

    // 将关注赛事菜单按赛种分组
    const followMenus = _(followMatch)
      .groupBy('sportId')
      .map((matches, sportId) => {
        const id = Number(sportId);
        const competition = Object.values(FBCompetitionMap).find((c) => c.id === id);
        return {
          sportId: id,
          count: matches.length,
          name: competition?.label ?? '',
          viewId: id,
        };
      })
      .value();

    // 所有 playType 的菜单均按 FBCompetitionMap 顺序排序
    const menus = _.mapValues(
      { ...menuDatas, [PlayType.Follow]: followMenus },
      sortMenuByCompetitionOrder,
    );
    const _menuInfo = {
      hotSportMatchIds,
      menus,
      playTypes,
    };
    return _menuInfo;
  }, [
    sportsMenuInfo,
    footballLotteryList,
    basketballLotteryList,
    allowedFetchLottery,
    playType,
    followMatch,
  ]);

  useEffect(() => {
    dispatch(setMenus(menuInfo));
  }, [menuInfo, dispatch]);
  if (isSSR()) {
    // 服务端渲染时，将体育首页需要的数据提前注入
    dispatch(setMenus(menuInfo));
  }
};
