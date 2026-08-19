import { useMemoizedFn } from 'ahooks';

import { ESportsLeftPanelType, EVenue, HotSportId, PlayType } from '@/apis/commonSports/constants';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
  changeMainListSettings,
  setFollowMatchIds,
  SportState,
  setPinnedSportIds,
  setPinnedMatchIds,
  TFollowMatch,
  setSportsLeftPanelType,
} from '@/core/store/slices/sportSlice';
import { addFollowReq, delFollowReq } from '@/apis/origin/follow';
import { getFollowGameType } from '@/common/hooks/follow';
import { scrollToSportsPageMainAreaIfNeeded } from '@/utils';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { OBSportIdValue } from '@/apis/obSports/common/constants';
import { findVenueCompetition } from '@/apis/commonSports/venueCompetition';
import { setShowBetDrawer } from '@/core/store/slices/betSlice';

const useSportsMainListControl = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const venue = useAppSelector((state) => state.sport.venue);

  // 更改主列表数据显示相关设置
  const setMainListSettings = useMemoizedFn(
    (settings: Partial<SportState['mainList']['settings']> = {}, scrollToTop = true) => {
      void dispatch(changeMainListSettings(settings));
      if (scrollToTop) {
        scrollToSportsPageMainAreaIfNeeded();
      }
    },
  );

  // 获取当前赛种的简洁版赔率玩法项
  const getCurrentSimpleActiveItem = useMemoizedFn((sportId: number) => {
    return (
      (findVenueCompetition(venue, sportId)?.simpleList[0] as LocalHandicapItem | undefined) ?? null
    );
  });

  // 切换赛种类型id
  const switchSportId = useMemoizedFn((sportId: number) => {
    setMainListSettings({
      sportId,
      filterByLeagueIds: [],
      filterSearchText: '',
      filterLeaguePickerSynced: true,
      orderBy: 1,
      filterTime: [],
      simpleActiveItem: getCurrentSimpleActiveItem(sportId),
    });
  });

  // 切换赛种类型
  const switchPlayType = useMemoizedFn(
    (playType: PlayType, sportId: number, playTypeId: number) => {
      if (sportId === HotSportId) {
        // 切换赛种类型的时候默认切换到足球赛种（场馆各自足球 id）
        sportId = venue === EVenue.OB ? OBSportIdValue.Football : FBSportIdValue.Football;
      }
      setMainListSettings({
        playType,
        sportId,
        playTypeId,
        filterByLeagueIds: [],
        filterSearchText: '',
        filterLeaguePickerSynced: true,
        orderBy: 1,
        filterTime: [],
        simpleActiveItem: getCurrentSimpleActiveItem(sportId),
      });
    },
  );

  // 更改关注赛事状态
  //
  // 入参 base 为赛事基础信息（matchId / sportId=viewId / bt 开赛时间戳）；matchData 为收藏快照
  // （SportItemInfo JSON，由调用方通过 buildMatchData(match) 生成，remove 时可不传）。
  // source 按登录态自动判定：登录=normal（手动），游客=tourist（登录时再 sync 上报）。
  //
  // 登录态：redux 乐观更新（星标即时响应）+ 镜像到服务器（add 传 matchData 快照，del 只需 matchId）。
  //         服务器为权威来源；若 add/del 请求失败则回滚该条（失败自愈），下次进 tab/登录仍以服务器列表兜底。
  // 游客态：把完整 TFollowMatch（含 matchData 快照）写进 redux/localStorage，登录时再 sync 上报服务器。
  const changeFollowMatchStatus = useMemoizedFn(
    (
      base: { matchId: string; sportId: number; bt: number },
      type: 'add' | 'remove',
      matchData?: string,
    ) => {
      const matchInfo: TFollowMatch = {
        ...base,
        source: isLogin ? 'normal' : 'tourist',
        matchData: matchData ?? '',
      };

      if (isLogin) {
        // 先乐观更新 redux，再镜像服务器；请求失败时回滚这一条（add→移除 / remove→重新加入）
        dispatch(setFollowMatchIds({ type, matchInfos: [matchInfo] }));
        const revert = () =>
          dispatch(
            setFollowMatchIds({
              type: type === 'add' ? 'remove' : 'add',
              matchInfos: [matchInfo],
            }),
          );

        const gameType = getFollowGameType(venue);
        if (type === 'add' && matchData) {
          addFollowReq({
            gameType,
            matchId: String(base.matchId),
            matchData,
            source: 1,
          }).catch(revert);
        } else if (type === 'remove') {
          delFollowReq({
            gameType,
            matchId: String(base.matchId),
          }).catch(revert);
        }
        return;
      }

      // 游客态：写完整快照，供登录后 sync 上报
      dispatch(setFollowMatchIds({ type, matchInfos: [matchInfo] }));
    },
  );

  // 更改置顶赛种状态
  const changePinnedSportStatus = useMemoizedFn((sportId: number, type: 'add' | 'remove') => {
    dispatch(setPinnedSportIds({ type, sportId }));
  });

  // 更改置顶比赛状态
  const changePinnedMatchStatus = useMemoizedFn((matchId: string, type: 'add' | 'remove') => {
    dispatch(setPinnedMatchIds({ type, matchId }));
  });

  // 更改过滤联赛id（syncLeaguePicker：是否与筛选 Tab 勾选/再次打开默认 Tab 对齐，热门搜索传 false）
  const changeFilterByLeagueIds = useMemoizedFn(
    (
      leagueIds: Array<number | string>,
      sportId: number,
      searchText: string,
      options?: { syncLeaguePicker?: boolean },
    ) => {
      const cleared = leagueIds.length === 0;
      const syncLeaguePicker = cleared ? true : (options?.syncLeaguePicker ?? true);
      setMainListSettings({
        filterByLeagueIds: leagueIds,
        sportId,
        filterSearchText: searchText,
        filterLeaguePickerSynced: syncLeaguePicker,
      });
    },
  );

  // 更改折叠所有联赛状态
  const changeCollapsedAll = useMemoizedFn((collapsedAll: boolean) => {
    setMainListSettings({ collapsedAll });
  });

  // 更改列表排序方式
  const changeOrderBy = useMemoizedFn((orderBy: number) => {
    setMainListSettings({ orderBy });
  });

  // 早盘更改日期排序方式
  const changeFilterTime = useMemoizedFn((filterTime: number[]) => {
    setMainListSettings({ filterTime });
  });

  // 更改简洁版赔率玩法项
  const changeSimpleActiveItem = useMemoizedFn((simpleActiveItem: LocalHandicapItem) => {
    setMainListSettings({ simpleActiveItem });
  });

  // 更改左侧菜单展示内容
  const switchSportsLeftPanelType = useMemoizedFn((sportsLeftPanelType: ESportsLeftPanelType) => {
    if (sportsLeftPanelType === ESportsLeftPanelType.ORDER_CART) {
      dispatch(setShowBetDrawer({ venue, showBetDrawer: true }));
    } else {
      dispatch(setShowBetDrawer({ venue, showBetDrawer: false }));
    }
    dispatch(setSportsLeftPanelType(sportsLeftPanelType));
  });

  // 设置当前查询条件下是否含有热门赛事列表
  const setHasHotList = useMemoizedFn((hasHotList: boolean) => {
    setMainListSettings({ hasHotList }, false);
  });

  return {
    switchSportId,
    switchPlayType,
    changeFollowMatchStatus,
    changePinnedSportStatus,
    changePinnedMatchStatus,
    changeFilterByLeagueIds,
    changeCollapsedAll,
    changeOrderBy,
    changeFilterTime,
    changeSimpleActiveItem,
    switchSportsLeftPanelType,
    setHasHotList,
  };
};

export default useSportsMainListControl;
