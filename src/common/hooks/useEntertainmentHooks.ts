import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setActiveGameHomeId, setCurrentGameInfo } from '@/core/store/slices/entertainmentSlice';
import { useMemoizedFn } from 'ahooks';
import { MergedBaseList } from './useHomeList';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { HomeListResponse, HomeListSwitch } from '@/apis/origin/homeList';
import { useNavigateWithLanguage } from './useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { gamePlayReq, setFavoriteReq, TGameList } from '@/apis/origin/gamePlay';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';
import {
  ENTERTAINMENT_HOME_PAGE_TYPE,
  HomeListId,
  TRY_PLAY_VENUE_ID,
} from '@/utils/constants/entertainment';
import { toast } from '../components/Toast';
import { generatePath } from 'react-router-dom';
import { scrollToTopLayoutMainContent } from '@/utils';
import { useRoute } from '@/sites/op7/hooks/useRoute';
import { blockAgentVenueAccess } from '@/common/utils/openAgentVenueBlockedModal';

// 需要特殊处理的场馆id
export enum SpecificVenueId {
  OP_SPORTS = 89, //op体育
  EB_SPORTS = 79, //eb体育
  AI_SPORTS = 60, //ai体育
  CME_SPORTS = 30, // cme体育
  OP_ESPORTS = 81, //op电竞
  TC_LOTTERY = 63, //TC彩票
  OP_LOTTERY = 83, //OP彩票
}

/** 按游戏 id 覆盖收藏态：true=已收藏，false=未收藏，无则用接口的 isFavorite */
const useFavoriteOverrides = () => {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const setOverride = useMemoizedFn((id: number, value: boolean) => {
    setOverrides((prev) => ({ ...prev, [id]: value }));
  });
  const getDisplayFavorite = useMemoizedFn((id: number, serverFavorite: boolean) => {
    return id in overrides ? overrides[id] : serverFavorite;
  });
  return { overrides, getDisplayFavorite, setOverride };
};

/**
 * 娱乐大厅hooks
 */
export const useEntertainmentHooks = () => {
  const dispatch = useAppDispatch();
  const expandedMenuId = useAppSelector((state) => state.entertainment.expandedMenuId);
  const activeGameHomeId = useAppSelector((state) => state.entertainment.activeGameHomeId);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const isAgent = useAppSelector((state) => state.user.memberInfo.isAgent);
  const isRiskAccount = useAppSelector((state) => state.user.memberInfo.isRiskAccount);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const navigate = useNavigateWithLanguage();
  const { overrides, getDisplayFavorite, setOverride } = useFavoriteOverrides();
  const route = useRoute();

  const ensureAgentCanEnterVenue = useMemoizedFn(() =>
    blockAgentVenueAccess({ isAgent, isRiskAccount }),
  );

  // 处理场馆跳转
  const handleGameHomeClick = useMemoizedFn(
    (game: MergedBaseList['children'][number], homeId: HomeListId) => {
      // const isSlotGame = homeId === HomeListId.SLOTS;
      // if (!isLogin && !isSlotGame) {
      if (!isLogin) {
        dispatch(openLoginModal());
        return;
      }
      if (!ensureAgentCanEnterVenue()) {
        return;
      }
      if (game.switch === HomeListSwitch.MAINTENANCE) {
        // 维护中
        return;
      }
      const gameId = game.gameId ?? HomeListId.SLOTS;
      dispatch(setActiveGameHomeId(gameId));
      if (homeId === HomeListId.SLOTS) {
        // 电子游戏跳转slotGame页面
        navigate(
          generatePath(PATHS.entertainment, {
            pageType: ENTERTAINMENT_HOME_PAGE_TYPE.SLOT_GAME,
            id: gameId.toString(),
          }),
        );
        return;
      }
      const menuInfo = game?.menu?.[0];
      // TC 彩票(63) 等不支持内嵌的场馆仅 PC 外跳新窗口
      if (
        [
          56,
          78,
          16,
          18,
          55,
          110,
          71,
          84,
          88,
          SpecificVenueId.EB_SPORTS,
          SpecificVenueId.OP_SPORTS,
          SpecificVenueId.CME_SPORTS,
          SpecificVenueId.AI_SPORTS,
          SpecificVenueId.OP_ESPORTS,
          SpecificVenueId.TC_LOTTERY,
          SpecificVenueId.OP_LOTTERY,
        ].includes(game.gameId) &&
        !isMobile
      ) {
        // 不支持内嵌游戏
        handleOpenGameVenue(menuInfo, game, true);
      } else {
        // 支持内嵌游戏
        handleOpenGameVenue(menuInfo, game);
      }
    },
  );

  // 打开游戏场馆
  type VenueMenuInfo = HomeListResponse['childList'][number]['menu'][number];
  const handleOpenGameVenue = useMemoizedFn(
    (
      menuInfo: VenueMenuInfo | undefined,
      game: MergedBaseList['children'][number] | undefined,
      openNewTab: boolean = false,
    ) => {
      if (!ensureAgentCanEnterVenue()) {
        return;
      }
      // 移动端/浏览器对异步 window.open 有拦截风险：
      // 先在用户点击时同步打开空白页，待接口返回后再跳转真实地址。
      const pendingPopup = openNewTab ? window.open('about:blank', '_blank') : null;
      if (pendingPopup) {
        pendingPopup.opener = null;
      }

      const venueGameInfo = {
        gameUrl: '',
        // 场馆试玩：testUrl 是启动接口 path，需 POST 后才得到真实游戏地址
        gameTestUrl: menuInfo?.testUrl ?? '',
        isSlotGame: false,
        name: game?.name ?? menuInfo?.name ?? '',
        hideGameTransfer: game?.hideGameTransfer ?? false,
        backgroundColor: menuInfo?.backgroundColor ?? game?.backgroundColor ?? '',
        titleColor: menuInfo?.titleColor ?? game?.titleColor ?? '',
        transferId: game?.gameId,
        venueGameId: game?.gameId,
        venueName: game?.name ?? menuInfo?.name ?? '',
        venueMenu: menuInfo ? { ...menuInfo } : {},
      };

      if (!openNewTab) {
        if (route?.handle?.module !== 'entertainment') {
          navigate(
            generatePath(PATHS.entertainment, {
              pageType: ENTERTAINMENT_HOME_PAGE_TYPE.HOME,
              id: '',
            }),
          );
        }
        dispatch(setCurrentGameInfo(venueGameInfo));
        scrollToTopLayoutMainContent();
      }

      const clientType = isMobile ? 'APP' : 'WEB';
      // if (
      //   [
      //     // SpecificVenueId.OP_SPORTS,
      //     // SpecificVenueId.EB_SPORTS,
      //     // SpecificVenueId.AI_SPORTS,
      //     // SpecificVenueId.OP_ESPORTS,
      //     // SpecificVenueId.TC_LOTTERY,
      //   ].includes(game?.gameId ?? 0)
      // ) {
      //   // 以上场馆在web端内嵌展示有问题，强制使用h5的游戏地址进行pc内嵌
      //   clientType = 'APP';
      // }
      gamePlayReq({ gameId: game?.gameId ?? '', visitType: clientType, platform: clientType })
        .then((res) => {
          if (res.code === API_CODE_ORIGIN_SUCCESS) {
            if (openNewTab) {
              if (pendingPopup && !pendingPopup.closed) {
                pendingPopup.location.href = res.data;
              } else {
                window.open(res.data, '_blank');
              }
            } else {
              dispatch(
                setCurrentGameInfo({
                  ...venueGameInfo,
                  gameUrl: res.data,
                }),
              );
            }
          } else if (openNewTab) {
            if (pendingPopup && !pendingPopup.closed) {
              pendingPopup.close();
            }
          }
        })
        .catch(() => {
          if (openNewTab && pendingPopup && !pendingPopup.closed) {
            pendingPopup.close();
          }
        });
    },
  );

  // 打开电子游戏
  const handleOpenGame = useMemoizedFn((game: TGameList, isTryPlay: boolean = false) => {
    if (!isLogin && !isTryPlay) {
      dispatch(openLoginModal());
      return;
    }
    if (route?.handle?.module !== 'entertainment') {
      navigate(
        generatePath(PATHS.entertainment, {
          pageType: ENTERTAINMENT_HOME_PAGE_TYPE.SLOT_GAME,
          // 试玩并且未登录时跳转到试玩
          id: isTryPlay ? String(TRY_PLAY_VENUE_ID) : String(game.transferId),
        }),
      );
    }
    dispatch(setActiveGameHomeId(game.transferId));
    dispatch(setCurrentGameInfo({ ...game, isSlotGame: true, isTryPlay }));
    scrollToTopLayoutMainContent();
    // navigate(generatePath(PATHS.entertainment, { pageType: 'game', id: String(game.id) }));
  });

  // 收藏/取消收藏游戏
  const handleCollectGame = useMemoizedFn(async (sysId: number, currentIsFavorite: boolean) => {
    const res = await setFavoriteReq({ sysId });
    if (res.code === API_CODE_ORIGIN_SUCCESS) {
      toast({
        description: currentIsFavorite ? '取消收藏成功' : '收藏成功',
        type: 'success',
      });
      setOverride(sysId, !currentIsFavorite);
      return true;
    } else {
      toast({
        description: currentIsFavorite ? '取消收藏失败' : '收藏失败',
        type: 'error',
      });
      return false;
    }
  });

  return {
    expandedMenuId,
    activeGameHomeId,
    handleGameHomeClick,
    handleOpenGameVenue,
    handleCollectGame,
    favoriteOverrides: overrides,
    getDisplayFavorite,
    handleOpenGame,
  };
};
