/**
 * 获取体育菜单列表数据
 */

import { useVenueService } from '@/apis/commonSports';
import { EVenue, HotSportId, LotterySportId, PlayType } from '@/apis/commonSports/constants';
import { MenuInfo, Menues } from '@/apis/commonSports/types';
import { FBCompetitionMap, FBSportIdValue } from '@/apis/fbSports/common/constants';
import { OBCompetitionMap, OBSportIdValue } from '@/apis/obSports/common/constants';
import { useSportListByTypeQuery } from '@/apis/origin/sportListByType';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { changeMainListSettings, setMenus } from '@/core/store/slices/sportSlice';
import { findVenueCompetition } from '@/apis/commonSports/venueCompetition';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';

type CompetitionLike = { id: number; label: string; viewId: number };

const buildSportIdOrderMap = (competitionMap: Record<string, CompetitionLike>) => {
  const map = new Map<number, number>();
  Object.values(competitionMap).forEach((c, index) => map.set(c.id, index));
  return map;
};

const FB_SPORT_ID_ORDER_MAP = buildSportIdOrderMap(FBCompetitionMap);
const OB_SPORT_ID_ORDER_MAP = buildSportIdOrderMap(OBCompetitionMap);

const sortMenuByCompetitionOrder = <T extends { sportId: number }>(
  items: T[],
  orderMap: Map<number, number>,
): T[] => _.sortBy(items, (item) => orderMap.get(item.sportId) ?? Number.MAX_SAFE_INTEGER);

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
  // 竞彩：对齐 Flutter getJCIdReq —— sportName 中文，gameType 大写 FB/OB
  const lotteryGameType = venue === EVenue.OB ? 'OB' : 'FB';
  const { data: footballLotteryList = { matchIdList: [], matchIdVsWeekMap: [] } } =
    useSportListByTypeQuery(
      {
        gameType: lotteryGameType,
        sportName: '足球',
        type: _playType,
      },
      { enabled: allowedFetchLottery },
    );
  const { data: basketballLotteryList = { matchIdList: [], matchIdVsWeekMap: [] } } =
    useSportListByTypeQuery(
      {
        gameType: lotteryGameType,
        sportName: '篮球',
        type: _playType,
      },
      { enabled: allowedFetchLottery },
    );

  const isOb = venue === EVenue.OB;
  const competitionMap = isOb ? OBCompetitionMap : FBCompetitionMap;
  const sportIdOrderMap = isOb ? OB_SPORT_ID_ORDER_MAP : FB_SPORT_ID_ORDER_MAP;
  const footballSportId = isOb ? OBSportIdValue.Football : FBSportIdValue.Football;
  const basketballSportId = isOb ? OBSportIdValue.Basketball : FBSportIdValue.Basketball;

  const menuInfo: MenuInfo = useMemo(() => {
    if (!sportsMenuInfo) {
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

    // 只浅拷贝当前玩法数组（插入竞彩时才需要可变副本），避免整树 cloneDeep
    const menuDatas: Menues = {
      ...sportsMenuInfo.menus,
      [playType]: [...(sportsMenuInfo.menus[playType] ?? [])],
    };
    const playTypes = sportsMenuInfo.playTypes;
    const hotSportMatchIds = sportsMenuInfo.hotSportMatchIds ?? [];

    if (allowedFetchLottery) {
      const lotteryCount =
        (footballLotteryList.matchIdList?.length ?? 0) +
        (basketballLotteryList.matchIdList?.length ?? 0);
      if (lotteryCount > 0) {
        const hotIndex = menuDatas[playType].findIndex((item) => item.sportId === HotSportId);
        const footballIndex = menuDatas[playType].findIndex(
          (item) => item.sportId === Number(footballSportId),
        );
        const basketballIndex = menuDatas[playType].findIndex(
          (item) => item.sportId === Number(basketballSportId),
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
      }
    }

    // 将关注赛事菜单按赛种分组
    const followMenus = _(followMatch)
      .groupBy('sportId')
      .map((matches, sportId) => {
        const id = Number(sportId);
        const competition = (Object.values(competitionMap) as CompetitionLike[]).find(
          (c) => c.id === id,
        );
        return {
          sportId: id,
          count: matches.length,
          name: competition?.label ?? '',
          viewId: competition?.viewId ?? id,
        };
      })
      .value();

    const withFollow: Menues = { ...menuDatas, [PlayType.Follow]: followMenus };
    const menus = (Object.keys(withFollow) as PlayType[]).reduce<Menues>((acc, key) => {
      const items = withFollow[key] ?? [];
      acc[key] =
        isOb && key !== PlayType.Follow
          ? items
          : sortMenuByCompetitionOrder(items, sportIdOrderMap);
      return acc;
    }, {} as Menues);

    return {
      hotSportMatchIds,
      menus,
      playTypes,
    };
  }, [
    sportsMenuInfo,
    footballLotteryList,
    basketballLotteryList,
    allowedFetchLottery,
    playType,
    followMatch,
    competitionMap,
    sportIdOrderMap,
    footballSportId,
    basketballSportId,
    isOb,
  ]);

  useEffect(() => {
    dispatch(setMenus(menuInfo));
  }, [menuInfo, dispatch]);

  /**
   * OB：当前选中球种不在菜单（或没有 menuId）时，切到该玩法第一个有效球种
   * 切场馆默认足球若 count=0 会被 filter 掉，否则列表永远拿不到 euid
   * 竞彩 / 热门是本地插入或特殊项，本身没有 menuId，不能被当成无效球种踢走
   */
  const sportId = useAppSelector((state) => state.sport.mainList.settings.sportId);
  useEffect(() => {
    if (!isOb || playType === PlayType.Follow) return;
    if (sportId === LotterySportId || sportId === HotSportId) return;
    const list = menuInfo.menus[playType] ?? [];
    if (!list.length) return;
    const current = list.find((item) => item.sportId === sportId);
    if (current?.menuId) return;
    const next = list.find((item) => !!item.menuId);
    if (!next) return;
    const playTypeId = menuInfo.playTypes.find((p) => p.type === playType)?.typeId;
    dispatch(
      changeMainListSettings({
        sportId: next.sportId,
        ...(playTypeId != null ? { playTypeId } : {}),
        simpleActiveItem:
          (findVenueCompetition(EVenue.OB, next.sportId)?.simpleList[0] as never) ?? null,
      }),
    );
  }, [isOb, playType, menuInfo, sportId, dispatch]);
};
