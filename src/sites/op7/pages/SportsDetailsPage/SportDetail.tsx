import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import clsx from 'clsx';
import { useParams, useLocation } from 'react-router-dom';

import type { MarketGroup } from '@/apis/fbSports/common/types';
import { useGetMatchDetailQuery } from '@/apis/fbSports/getMatchDetail';
import type { MatchRecord } from '@/apis/fbSports/getList';
import {
  getFBDetailHotMarketList,
  getFBDetailHandBigMarketList,
  getFBSportNameAndViewId,
  getFBScoreBySportId,
  formatFBSportItem,
} from '@/apis/fbSports/common/fbFormat';
import { useGetOBMatchDetailQuery } from '@/apis/obSports/getMatchDetail';
import { formatOBSportItem, getOBSportNameAndViewId } from '@/apis/obSports/common/obFormat';
import type { MatchShareInfo } from '@/core/sdk/IMManager';
import { buildMatchData } from '@/common/hooks/follow';
import {
  findOptionByMarketAndSelection,
  mapRecommendToDisplayItems,
  useGetSportRecommendQuery,
} from '@/apis/fbSports/getSportRecommend';
import { useGetSportVideoQuery } from '@/apis/fbSports/getSportVideo';
import {
  categoryMap,
  categoryGoalIds,
  categoryCSIds,
  categoryCornerIds,
  categoryPenaltyCardIds,
  categoryTimesIds,
  categorySpecialIds,
  categoryFullIds,
  categoryHalfIds,
  categoryNoodfIds,
  isFootballHandBigCategory,
  isFootballHalfCategory,
} from '@/apis/fbSports/common/constants/fbPlays';
import { TOP_MARKETS_KEY } from '@/utils/constants/cacheKey';
import SetTopStorage from '@/utils/storage/setTopStorage';
import { TClickBetItemPayload, useClickBetItem } from '@/common/hooks/bet/useClickBetItem';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { NoticeBar } from '@/common/components/NoticeBar';
import { toast } from '@/common/components/Toast';
import { useVenueService } from '@/apis/commonSports';
import { EVenue } from '@/apis/commonSports/constants';
import type { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';
import { PATHS } from '@/sites/op7/routes/paths';
import OptionBarPC from '../SportsPage/components/OptionBarPC';

import BettingMarket, { buildBaseBetItemFromOption } from './components/BettingMarket';
import OBBettingMarket from './components/OBBettingMarket';
import BettingTabs from './components/BettingTabs';
import MatchDetailsHeader from './components/MatchDetailsHeader';
import MatchInfo from './components/MatchInfo';
import MatchDrawer from './components/MatchDrawer';
import MatchShareSheet from './components/MatchShareSheet';

import Skeleton from '@/common/components/Skeleton';
import { MatchRecommendItem, VideoLine } from './type';
import type { MediaMode } from './hooks/useMedia';

// import FloatingActionButton from './components/FloatingActionButton';

import { useScrollTop } from './hooks/useScrollContainer';
import { useRetainedMatchRecord } from './hooks/useRetainedMatchRecord';

import styles from './MatchDetails.module.scss';
import { useAppSelector } from '@/core/store/hooks';
import { selectSelectedBetsForMatch } from '@/core/store/selectors/betSelectors';
import {
  selectRightSidebarVisible,
  selectScreenBreakpoint,
} from '@/core/store/selectors/configSelectors';
import { selectFollowMatch, selectSportVenue } from '@/core/store/selectors/sportSelectors';
import { selectIsLogin } from '@/core/store/selectors/userSelectors';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import Empty from '@/common/components/Empty';
import VideoPlayerMobile from './components/VideoPlayerMobile';
import HeaderWeb from './components/MatchDetailsHeader/headerWeb';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';
import { FBCompetitionMap, FBSportIdValue } from '@/apis/fbSports/common/constants';
import { ClientOnly } from '@/common/components/ClientOnly';
import FloatingButton from '@/common/components/FloatingButton';
import { DiscoverContent, DiscoverSubTabs } from './components/discover';
import { useDiscoverTab } from './hooks/useDiscoverTab';
import { useDiscoverBadge } from './hooks/useDiscoverBadge';

const getMarketGroupFixedKey = (marketGroup: Pick<MarketGroup, 'mty' | 'pe'>): string =>
  `${marketGroup.mty}-${marketGroup.pe}`;
const getMarketGroupLegacyFixedKey = (marketGroup: Pick<MarketGroup, 'mty' | 'pe'>): string =>
  String(Number(marketGroup.mty) + Number(marketGroup.pe));

/** 与列表项 key / data-market-anchor 一致（mks[0].id 缺省则用当前 Tab 下列表下标） */
const getBettingMarketAnchorKey = (
  marketGroup: MarketGroup,
  indexInProcessedList: number,
): string => {
  const mks = Array.isArray(marketGroup.mks) ? marketGroup.mks : [];
  const firstMarketId = mks.length > 0 && mks[0]?.id ? mks[0].id : indexInProcessedList;
  return `${marketGroup.mty}-${marketGroup.pe}-${firstMarketId}`;
};

export type SportDetailProps = {
  /** 赛事 id；传入时优先于路由参数 `:matchId`（便于在非路由场景复用） */
  id?: string | number;
  /** 侧边栏场景可关闭顶部 MatchInfo 区域 */
  hideMatchInfo?: boolean;
};

/**
 * 赛事详情页面
 */
const SportDetail: React.FC<SportDetailProps> = ({ id, hideMatchInfo = false }) => {
  const { useNoticeListQuery } = useVenueService();
  const { data: fbNoticeList = [] } = useNoticeListQuery({ limit: 10 });
  const pcNoticeItems = useMemo(
    () =>
      fbNoticeList
        .map((notice) => notice.co)
        .filter((co): co is string => typeof co === 'string' && co.trim() !== ''),
    [fbNoticeList],
  );
  const hasPcNotice = pcNoticeItems.length > 0;
  const { matchId: matchIdFromRoute } = useParams<{ matchId: string }>();
  const location = useLocation();
  const lastAppliedPickBetKeyRef = useRef<string | null>(null);
  const matchId =
    id !== undefined && id !== null && String(id).trim() !== ''
      ? String(id)
      : (matchIdFromRoute ?? '');
  const navigate = useNavigateWithLanguage();
  const { changeFollowMatchStatus } = useSportsMainListControl();
  const followMatch = useAppSelector(selectFollowMatch);
  const screenBreakpoint = useAppSelector(selectScreenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const rightSidebarVisible = useAppSelector(selectRightSidebarVisible);
  const isLogin = useAppSelector(selectIsLogin);
  const [activeTab, setActiveTab] = useState<string>('');
  /** 「分享至」弹窗开关 */
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const hasManualTabChangedRef = useRef(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  /** PC 顶栏「数据板」开关：主区域比分/轮播（与右侧视频/动画切换无关） */
  const [isDataBoardVisible, setIsDataBoardVisible] = useState(true);
  const [collapsedMarkets, setCollapsedMarkets] = useState<Set<string>>(new Set());
  const [isAllCollapseToggled, setIsAllCollapseToggled] = useState(false);
  const [fixedTopMarkets, setFixedTopMarkets] = useState<Set<string>>(new Set());
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [showSmallCard, setShowSmallCard] = useState(false);
  const [isMatchTeamHeader, setMatchTeamHeader] = useState(false);
  const [mediaMode, setMediaMode] = useState<MediaMode>('');
  const h5VideoVisible = isMobile && isVideoVisible;
  const [pcSmallCardBounds, setPcSmallCardBounds] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const marketsContainerRef = useRef<HTMLDivElement>(null);
  const matchDetailsRef = useRef<HTMLDivElement>(null);
  const processedMarketsRef = useRef<MarketGroup[]>([]);
  const fbCategoryTabs = useMemo(
    () =>
      Object.values(categoryMap).filter(
        (item) => item.tabType !== '全部' && item.tabType !== '热门',
      ),
    [],
  );
  const matchCategoryTab = useCallback(
    (group: MarketGroup, tabType: string, isFootball: boolean, isBasketball: boolean): boolean => {
      const categoryId = `${group.mty}_${group.pe}`;
      const marketName = String(group.nm || '');
      const hasType = (t: string) =>
        (Array.isArray(group.tps) ? group.tps : []).map((tag) => String(tag).trim()).includes(t);

      // 详情页保持与 Flutter 分桶一致：不同赛种走不同 categoryId 集合
      if (isFootball) {
        // 与 EMC setFootBallCategory 一致：各 Tab 独立判定；让球&大/小 可与其他 Tab 共存
        switch (tabType) {
          case '让球&大/小':
            return isFootballHandBigCategory(categoryId);
          case '半场':
            return isFootballHalfCategory(categoryId);
          case '总进球数':
            return categoryGoalIds.includes(categoryId);
          case '比分':
            return (
              categoryCSIds.includes(categoryId) ||
              marketName.includes('比分') ||
              marketName.includes('波胆')
            );
          case '角球':
            return categoryCornerIds.includes(categoryId);
          case '罚牌':
            return categoryPenaltyCardIds.includes(categoryId);
          case '时间类':
            return categoryTimesIds.includes(categoryId);
          case '特殊玩法':
            return categorySpecialIds.includes(categoryId) || hasType('i');
          default:
            return false;
        }
      }

      if (isBasketball) {
        switch (tabType) {
          case '全场':
            return categoryFullIds.includes(categoryId);
          case '半场':
            return categoryHalfIds.includes(categoryId);
          case '单节':
            return categoryNoodfIds.includes(categoryId);
          case '特殊玩法':
            return categorySpecialIds.includes(categoryId) || hasType('i');
          default:
            return false;
        }
      }

      const category = fbCategoryTabs.find((cat) => cat.tabType === tabType);
      if (!category?.type) return false;
      return hasType(category.type);
    },
    [fbCategoryTabs],
  );

  // 获取赛事详情数据（需早于 useScrollTop：骨架屏阶段无 ref，bindKey 就绪后需重绑滚动）
  const venue = useAppSelector(selectSportVenue);
  const isOb = venue === EVenue.OB;

  const {
    data: fbMatch,
    isLoading: isFbLoading,
    refetch: refetchFb,
    isFetching: isFbFetching,
  } = useGetMatchDetailQuery({
    // OB 场馆时传 -1 跳过 FB 详情请求
    matchId: !isOb && matchId ? matchId : '',
  });

  const {
    data: obDetail,
    isLoading: isObLoading,
    refetch: refetchOb,
    isFetching: isObFetching,
  } = useGetOBMatchDetailQuery({
    matchId: isOb ? matchId : '',
    enabled: isOb && !!matchId,
  });

  const isLoading = isOb ? isObLoading : isFbLoading;
  const isFetching = isOb ? isObFetching : isFbFetching;
  const refetch = isOb ? refetchOb : refetchFb;

  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    if (!isFetching) {
      setIsRefreshing(false);
    }
  }, [isFetching]);

  // 完赛后接口可能清空比分：停留详情页时本地保留最后一次有效数据，退出页即清理
  const fbRetainedMatch = useRetainedMatchRecord(matchId ? Number(matchId) : -1, fbMatch);
  /** FB 原始详情（盘口 mg / 推荐 / 分享仍依赖）；OB 详情走独立结构 */
  const matchData: MatchRecord | undefined = isOb ? undefined : fbRetainedMatch;
  /** 统一头部/比分信息（FB format 或 OB format） */
  const matchInfo: MatchBaseInfo | undefined = useMemo(() => {
    if (isOb) return obDetail?.matchInfo;
    if (!fbRetainedMatch?.id) return undefined;
    return formatFBSportItem(fbRetainedMatch);
  }, [isOb, obDetail?.matchInfo, fbRetainedMatch]);

  const obTypeList = useMemo(() => obDetail?.typeList ?? [], [obDetail?.typeList]);

  /** 聊天室「本场比赛」分享 payload（对齐 Flutter SportItemInfo，类型须可被 fromJson 解析） */
  const chatMatchShareInfo = useMemo<MatchShareInfo | null>(() => {
    if (isOb && matchInfo) {
      return {
        matchId: String(matchInfo.matchId),
        sportId: String(matchInfo.sportId),
        leagueName: matchInfo.leagueName ?? '',
        homeTeamName: matchInfo.homeName ?? '',
        awayTeamName: matchInfo.awayName ?? '',
        homeTeamIcon: matchInfo.homeLogo ?? '',
        awayTeamIcon: matchInfo.awayLogo ?? '',
        homeScore: String(matchInfo.homeScore ?? 0),
        awayScore: String(matchInfo.awayScore ?? 0),
        isLive: !!matchInfo.isLive,
        matchStatusId: String(matchInfo.matchStatusId ?? ''),
        homeTeam: matchInfo.homeName ?? '',
        awayTeam: matchInfo.awayName ?? '',
      };
    }
    if (!matchData) return null;
    const score = getFBScoreBySportId({
      sportId: matchData.sid,
      list: matchData.nsg,
    });
    return {
      matchId: String(matchData.id),
      // Flutter SportItemInfo.sportId 是 String，数字会导致 App fromJson 抛错丢消息
      sportId: String(matchData.sid),
      leagueName: matchData.lg?.na ?? '',
      homeTeamName: matchData.ts?.[0]?.na ?? '',
      awayTeamName: matchData.ts?.[1]?.na ?? '',
      homeTeamIcon: matchData.ts?.[0]?.lurl ?? '',
      awayTeamIcon: matchData.ts?.[1]?.lurl ?? '',
      homeScore: score.home,
      awayScore: score.away,
      isLive: matchData.ms === 5,
      matchStatusId: String(matchData.mc?.pe ?? matchData.ms ?? ''),
      homeTeam: matchData.ts?.[0]?.na ?? '',
      awayTeam: matchData.ts?.[1]?.na ?? '',
    };
  }, [isOb, matchInfo, matchData]);
  const chatMatchShareInfoRef = useRef(chatMatchShareInfo);
  chatMatchShareInfoRef.current = chatMatchShareInfo;

  const {
    showDiscoverTab,
    discoverTabLabel,
    chatConfig,
    isDiscoverBooting,
    discoverEnabledSubTabTitles,
    resultMatchId,
    discoverSubTabIndex,
    discoverSubTabs,
    onDiscoverSubTabChanged,
    clearDiscoverSubTabState,
  } = useDiscoverTab({
    matchId,
    sportId: matchInfo?.sportId,
    venue,
  });

  const isDiscoverTabActive = activeTab === discoverTabLabel;
  const { showDiscoverBadge, dismissDiscoverBadge } = useDiscoverBadge();

  useEffect(() => {
    lastAppliedPickBetKeyRef.current = null;
  }, [matchInfo?.matchId]);

  const handleScroll = useCallback(
    (scrollTop: number) => {
      // Web 赛事卡区高度与 H5 不同，仅调整 PC 侧悬浮小卡出现阈值，不影响 H5（md）的 156 头部逻辑
      const bannerHeight = screenBreakpoint === 'md' ? 192 : 228;
      const nextSmall = scrollTop >= bannerHeight;
      const nextHeader = scrollTop >= 156;
      setShowSmallCard((prev) => (prev === nextSmall ? prev : nextSmall));
      setMatchTeamHeader((prev) => (prev === nextHeader ? prev : nextHeader));
    },
    [screenBreakpoint],
  );

  // 监听滚动 设置h5 头部切换和pc matchCardSmall 显示（bindKey：骨架屏阶段 containerRef 未挂载，需数据就绪后重绑）
  useScrollTop(containerRef, handleScroll, matchInfo?.matchId);

  // PC：主区域不滚动、仅盘口列表滚动时，用列表容器的 scrollTop 驱动小卡/头部态
  useEffect(() => {
    if (screenBreakpoint === 'md') return;
    const el = marketsContainerRef.current;
    if (!el) return;
    const onScroll = () => handleScroll(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [screenBreakpoint, handleScroll, matchInfo?.matchId]);

  const syncH5HeaderByScroll = useCallback(() => {
    if (screenBreakpoint !== 'md') return;
    const pageScrollTop = containerRef.current?.scrollTop ?? 0;
    const detailScrollTop = matchDetailsRef.current?.scrollTop ?? 0;
    handleScroll(Math.max(pageScrollTop, detailScrollTop));
  }, [screenBreakpoint, handleScroll]);

  // H5：同时监听页面根容器和盘口容器，避免滚动容器切换时头部态不同步
  useEffect(() => {
    if (screenBreakpoint !== 'md') return;
    const scrollEls = [containerRef.current, matchDetailsRef.current].filter(
      (el): el is HTMLDivElement => Boolean(el),
    );
    if (scrollEls.length === 0) return;

    const onScroll = () => syncH5HeaderByScroll();
    // 首帧和下一帧各同步一次，兼容浏览器自动恢复滚动位置的时机差
    syncH5HeaderByScroll();
    const rafId = requestAnimationFrame(() => {
      syncH5HeaderByScroll();
    });
    scrollEls.forEach((el) => el.addEventListener('scroll', onScroll, { passive: true }));
    return () => {
      cancelAnimationFrame(rafId);
      scrollEls.forEach((el) => el.removeEventListener('scroll', onScroll));
    };
  }, [screenBreakpoint, syncH5HeaderByScroll, matchInfo?.matchId]);

  // PC 小卡 / headerWeb 固定定位：跟随主内容区宽度（含右侧栏展开时 flex 收窄、Framer 动画过程）
  useEffect(() => {
    if (screenBreakpoint === 'md') {
      setPcSmallCardBounds(null);
      return;
    }
    let rafId: number | null = null;
    const updateBounds = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPcSmallCardBounds({ left: rect.left, width: rect.width });
    };
    const scheduleUpdateBounds = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        updateBounds();
      });
    };

    scheduleUpdateBounds();
    const timeoutIds: number[] = [
      window.setTimeout(scheduleUpdateBounds, 80),
      window.setTimeout(scheduleUpdateBounds, 200),
      window.setTimeout(scheduleUpdateBounds, 480),
    ];
    window.addEventListener('resize', updateBounds);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            scheduleUpdateBounds();
          })
        : null;
    if (ro) {
      if (containerRef.current) {
        ro.observe(containerRef.current);
      }
      const mainEl = document.getElementById('layout-main-content');
      if (mainEl) {
        ro.observe(mainEl);
      }
    }
    return () => {
      window.removeEventListener('resize', updateBounds);
      timeoutIds.forEach((id) => window.clearTimeout(id));
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      ro?.disconnect();
    };
  }, [screenBreakpoint, hideMatchInfo, rightSidebarVisible]);

  // 从 Redux 同步本场已加入投注单的选项，用于赔率按钮高亮（与首页列表一致）
  // 必须用 matchInfo.matchId：下单写入的是这个值；OB 超长 mid 不能和路由/Number 混用
  const selectedBets = useAppSelector((state) =>
    selectSelectedBetsForMatch(state, matchInfo?.matchId),
  );

  const selectedBetItemIds = useMemo(
    () => new Set(selectedBets.map((b) => b.selectionId)),
    [selectedBets],
  );

  const isRecommendOddsSelected = useCallback(
    (item: MatchRecommendItem) => {
      if (!item.marketId || item.selectionId === undefined || item.selectionId === '') return false;
      const key = `${item.marketId}_${item.selectionId}`;
      return selectedBets.some(
        (b) => b.marketId === String(item.marketId) && b.selectionId === key,
      );
    },
    [selectedBets],
  );

  // 获取视频数据（OB mid 可能超长，必须用路由原始字符串，不能用 Number 截断后的 matchInfo.matchId）
  const videoParams = useMemo(() => {
    const id = String(matchId || matchInfo?.matchId || '').trim();
    if (!id || id === '0' || id === '-1') return null;
    return {
      gameType: isOb ? ('OB' as const) : ('FB' as const),
      matchId: id,
    };
  }, [matchId, matchInfo?.matchId, isOb]);

  const { data: videoData } = useGetSportVideoQuery(videoParams, {
    enabled: !!videoParams && !!matchInfo?.isLive,
  });

  // 将视频数据转换为 VideoLine 格式
  const videoLines = useMemo<VideoLine[]>(() => {
    if (
      !videoData?.data?.live ||
      !Array.isArray(videoData.data.live) ||
      videoData.data.live.length === 0
    ) {
      return [];
    }
    return videoData.data.live
      .filter((live) => live && live.url && live.url.trim() !== '') // 过滤掉无效的 URL
      .map((live) => ({
        url: live.url || '',
        refererUrl: live.refererUrl,
      }));
  }, [videoData]);

  // 获取动画 URL 列表
  const animationUrls = useMemo<string[]>(() => {
    if (
      !videoData?.data?.mlive ||
      !Array.isArray(videoData.data.mlive) ||
      videoData.data.mlive.length === 0
    ) {
      return [];
    }
    return videoData.data.mlive.filter((url) => url && url.trim() !== '');
  }, [videoData]);

  const handleToggleDataBoard = useCallback((): void => {
    setIsDataBoardVisible((v) => !v);
  }, []);

  // 推荐玩法请求参数（依赖赛事详情；OB 暂无 tips3）
  const recommendParams = useMemo(() => {
    if (isOb || !matchData) return null;
    return {
      matchId: matchData.id,
      upstream: 'FB' as const,
      homeTeamCn: matchData.ts?.[0]?.na ?? '',
      awayTeamCn: matchData.ts?.[1]?.na ?? '',
      leagueCn: matchData.lg?.na ?? '',
    };
  }, [isOb, matchData]);

  const { data: recommendTips = [] } = useGetSportRecommendQuery(recommendParams);

  /** 小卡显示仅跟随滚动阈值，不因“隐藏数据板”按钮被强制显示 */
  const showSmallCardForMatchInfo = useMemo(() => showSmallCard, [showSmallCard]);

  // 推荐玩法列表：tips3 结果 + 赛事盘口 mg 解析为展示项
  const recommendList = useMemo(
    () => (isOb ? [] : mapRecommendToDisplayItems(recommendTips, matchData)),
    [isOb, recommendTips, matchData],
  );

  // 从存储中加载置顶盘口
  useEffect(() => {
    const loadTopMarkets = (): void => {
      const key: string = TOP_MARKETS_KEY;
      const topData: string[] = SetTopStorage.getTopData(key);
      if (topData.length > 0) {
        setFixedTopMarkets(new Set(topData));
      }
    };
    loadTopMarkets();
  }, []);

  // 是否已收藏（与体育首页列表一致，从 Redux followMatch 派生）
  const isFavorite = useMemo(() => {
    if (!matchInfo?.matchId) return false;
    return followMatch.some((item) => item.matchId === matchInfo.matchId);
  }, [matchInfo?.matchId, followMatch]);

  // 处理收藏切换（与体育首页列表一致，调用 changeFollowMatchStatus）
  const handleToggleFavorite = useCallback((): void => {
    if (!matchInfo?.matchId || matchInfo.sportId == null) return;

    const viewId = isOb
      ? getOBSportNameAndViewId(String(matchInfo.sportId)).viewId
      : getFBSportNameAndViewId(Number(matchInfo.sportId)).viewId;
    const formatted = isOb
      ? obDetail?.raw
        ? formatOBSportItem(obDetail.raw)
        : matchInfo
      : matchData
        ? formatFBSportItem(matchData)
        : matchInfo;
    const snapshot = isFavorite ? undefined : buildMatchData(formatted);
    changeFollowMatchStatus(
      { matchId: matchInfo.matchId, sportId: viewId, bt: formatted.bt },
      isFavorite ? 'remove' : 'add',
      snapshot,
    );
    toast({
      type: isFavorite ? 'info' : 'success',
      description: isFavorite ? '取消关注' : '关注成功',
    });
  }, [matchInfo, matchData, isOb, obDetail?.raw, isFavorite, changeFollowMatchStatus]);

  // 处理返回：PC 回体育列表；H5 回上一页（如注单记录进详情）
  const handleBack = (): void => {
    if (h5VideoVisible) {
      setIsVideoVisible(false);
      return;
    }
    if (isMobile) {
      navigate(-1);
    } else {
      navigate(PATHS.sports);
    }
  };

  // 打开「分享至」弹窗
  const handleOpenShare = (): void => {
    setShareSheetOpen(true);
  };

  // 分享面板「聊天室」：切到发现-聊天子 tab 并触发发送本场比赛
  const handleShareToChat = useCallback((): void => {
    const chatIndex = discoverSubTabs.indexOf('聊天');
    if (chatIndex < 0) {
      toast({ type: 'info', description: '当前赛事暂不支持聊天室' });
      return;
    }
    void import('./components/share/shareMatchToChatRoom').then(({ shareMatchToChatRoom }) =>
      shareMatchToChatRoom(chatMatchShareInfoRef.current),
    );
    hasManualTabChangedRef.current = true;
    setActiveTab(discoverTabLabel);
    onDiscoverSubTabChanged(chatIndex);
  }, [discoverSubTabs, discoverTabLabel, onDiscoverSubTabChanged]);

  // 处理抽屉打开
  const handleDrawerOpen = (): void => {
    setIsDrawerVisible(true);
  };

  // 处理抽屉关闭
  const handleDrawerClose = (): void => {
    setIsDrawerVisible(false);
  };

  // 处理赛事选择
  const handleMatchSelect = (): void => {
    // 导航已在 MatchDrawer 组件中处理
    setIsDrawerVisible(false);
  };

  // 处理标签切换
  const handleTabChange = (tab: string): void => {
    hasManualTabChangedRef.current = true;
    if (tab === discoverTabLabel) {
      // 点击发现 tab 后隐藏引导红点，对齐 App
      dismissDiscoverBadge();
    }
    if (isDiscoverTabActive && tab !== discoverTabLabel) {
      clearDiscoverSubTabState();
    }
    setActiveTab(tab);
  };

  // 处理盘口展开/收起
  const handleToggleCollapse = (marketId: string): void => {
    setCollapsedMarkets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  };

  // 处理置顶
  const handleToggleFixed = (marketId: string, legacyMarketId?: string): void => {
    setFixedTopMarkets((prev) => {
      const newSet = new Set(prev);
      const hasCurrent =
        newSet.has(marketId) || (legacyMarketId ? newSet.has(legacyMarketId) : false);
      if (hasCurrent) {
        newSet.delete(marketId);
        if (legacyMarketId) {
          newSet.delete(legacyMarketId);
        }
      } else {
        newSet.add(marketId);
        if (legacyMarketId) {
          newSet.delete(legacyMarketId);
        }
      }
      // 同步到存储
      const topDataArray: string[] = Array.from(newSet);
      const key: string = TOP_MARKETS_KEY;
      SetTopStorage.setTopData(key, topDataArray);
      return newSet;
    });
  };

  // 投注方法：加入投注单并打开投注抽屉
  const { clickBetItem } = useClickBetItem();

  // 点击赔率：与首页列表一致，加入投注单并打开投注抽屉
  const handleToggleOdds = useCallback(
    (betItem: TBaseBetItem) => {
      if (!matchInfo) return;
      const baseMatch: TClickBetItemPayload['baseMatch'] = {
        sportId: matchInfo.sportId,
        matchId: matchInfo.matchId,
        leagueId: matchInfo.leagueId ?? 0,
        leagueName: matchInfo.leagueName ?? '',
        homeName: matchInfo.homeName ?? '',
        awayName: matchInfo.awayName ?? '',
        isLive: !!matchInfo.isLive,
        isChampion: !!matchInfo.isChampion,
        bt: matchInfo.bt,
      };
      clickBetItem({ baseMatch, baseBetItem: betItem });
    },
    [matchInfo, clickBetItem],
  );

  // 处理全部展开/收起（与 BettingMarket 的 uniqueKey 格式一致）
  const handleToggleAllCollapse = (): void => {
    if (!isAllCollapseToggled) {
      if (isOb) {
        const keys = obTypeList.flatMap((tab) => tab.markets.map((m) => m.marketId));
        setCollapsedMarkets(new Set(keys));
        setIsAllCollapseToggled(true);
        return;
      }
      // 全部收起
      if (!matchData?.mg) return;
      const mg: MarketGroup[] = Array.isArray(matchData.mg) ? matchData.mg : [];
      const allUniqueKeys = mg.map((group: MarketGroup, index: number) => {
        const mks = Array.isArray(group.mks) ? group.mks : [];
        const firstMarketId = mks.length > 0 && mks[0]?.id ? mks[0].id : index;
        return `${group.mty}-${group.pe}-${firstMarketId}`;
      });
      setCollapsedMarkets(new Set(allUniqueKeys));
      setIsAllCollapseToggled(true);
    } else {
      // 全部展开
      setCollapsedMarkets(new Set());
      setIsAllCollapseToggled(false);
    }
  };

  // OB 当前 Tab 下盘口
  const processedObMarkets = useMemo(() => {
    if (!isOb) return [];
    const tab =
      obTypeList.find((item) => item.label === activeTab) ??
      obTypeList.find((item) => item.label === '全部') ??
      obTypeList[0];
    let markets = tab?.markets ?? [];
    markets = [...markets].sort((a, b) => {
      const aFixed = fixedTopMarkets.has(a.marketId);
      const bFixed = fixedTopMarkets.has(b.marketId);
      if (aFixed && !bFixed) return -1;
      if (!aFixed && bFixed) return 1;
      return 0;
    });
    return markets;
  }, [isOb, obTypeList, activeTab, fixedTopMarkets]);

  // 过滤和排序盘口（FB）
  const processedMarkets = useMemo(() => {
    if (isOb || !matchData?.mg) return [];

    let markets: MarketGroup[] = Array.isArray(matchData.mg) ? matchData.mg : [];
    const sportId = Number(matchData.sid);
    const isFootball = sportId === Number(FBSportIdValue.Football);
    const isBasketball = sportId === Number(FBSportIdValue.Basketball);
    // 根据标签过滤
    if (activeTab === '热门') {
      if (isFootball || isBasketball) {
        markets = getFBDetailHotMarketList(markets, matchData.sid, Number(matchData.mc?.s) || 0);
      } else {
        markets = markets.filter((group: MarketGroup) =>
          (Array.isArray(group.tps) ? group.tps : [])
            .map((tag) => String(tag).trim())
            .includes('p'),
        );
      }
    } else if (activeTab !== '全部') {
      markets = markets.filter((group: MarketGroup) =>
        matchCategoryTab(group, activeTab, isFootball, isBasketball),
      );
      if (activeTab === '让球&大/小' && isFootball) {
        const sourceMg = Array.isArray(matchData.mg) ? matchData.mg : [];
        markets = getFBDetailHandBigMarketList(markets, sportId, sourceMg);
      }
    }

    // 排序：置顶的在前
    markets = markets.sort((a: MarketGroup, b: MarketGroup) => {
      const aFixed =
        fixedTopMarkets.has(getMarketGroupFixedKey(a)) ||
        fixedTopMarkets.has(getMarketGroupLegacyFixedKey(a));
      const bFixed =
        fixedTopMarkets.has(getMarketGroupFixedKey(b)) ||
        fixedTopMarkets.has(getMarketGroupLegacyFixedKey(b));
      if (aFixed && !bFixed) return -1;
      if (!aFixed && bFixed) return 1;
      return 0;
    });

    return markets;
  }, [
    isOb,
    matchData?.mg,
    matchData?.sid,
    matchData?.mc?.s,
    activeTab,
    fixedTopMarkets,
    matchCategoryTab,
  ]);

  processedMarketsRef.current = processedMarkets;

  const scrollMarketAnchorIntoView = useCallback((anchorKey: string) => {
    const root = containerRef.current;
    if (!root) return;
    const escaped =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(anchorKey)
        : anchorKey.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const el = root.querySelector(`[data-market-anchor="${escaped}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  // 推荐点击：复用「查找 + 与 OddBtn 一致的 baseBetItem 构建 + handleToggleOdds」，相当于点了 BettingMarket 里的 OddBtn
  const onRecommendOddsClick = useCallback(
    (item: MatchRecommendItem) => {
      if (!matchData?.mg || !item.marketId || !('selectionId' in item && item.selectionId)) return;
      const found = findOptionByMarketAndSelection(
        matchData.mg,
        String(item.marketId),
        String(item.selectionId),
      );
      if (!found) {
        console.warn('未找到对应的投注项数据', {
          marketId: item.marketId,
          selectionId: item.selectionId,
        });
        return;
      }
      const baseBetItem = buildBaseBetItemFromOption(found.marketGroup, found.market, found.option);
      handleToggleOdds(baseBetItem);
    },
    [matchData, handleToggleOdds],
  );

  /** 首页推荐赛事等：带 state.pickBet 进入时，与详情内推荐玩法一致加入投注单并高亮，并滚到盘口卡片可视区 */
  useEffect(() => {
    const pick = (location.state as { pickBet?: { marketId: string; selectionTy: string } } | null)
      ?.pickBet;
    if (!pick?.marketId || pick.selectionTy === '' || !matchData?.mg?.length) return;

    const key = `${location.key}-${matchData.id}-${pick.marketId}-${pick.selectionTy}`;
    if (lastAppliedPickBetKeyRef.current === key) return;

    const found = findOptionByMarketAndSelection(matchData.mg, pick.marketId, pick.selectionTy);
    if (!found) {
      lastAppliedPickBetKeyRef.current = key;
      return;
    }
    lastAppliedPickBetKeyRef.current = key;

    const visibleInCurrentTab = processedMarketsRef.current.some(
      (g) => g.mty === found.marketGroup.mty && g.pe === found.marketGroup.pe,
    );

    flushSync(() => {
      if (!visibleInCurrentTab) {
        setActiveTab('全部');
      }
    });

    const idx = processedMarketsRef.current.findIndex(
      (g) => g.mty === found.marketGroup.mty && g.pe === found.marketGroup.pe,
    );
    const anchorKey =
      idx >= 0
        ? getBettingMarketAnchorKey(found.marketGroup, idx)
        : getBettingMarketAnchorKey(found.marketGroup, 0);

    flushSync(() => {
      setCollapsedMarkets((prev) => {
        const next = new Set(prev);
        next.delete(anchorKey);
        return next;
      });
    });

    const baseBetItem = buildBaseBetItemFromOption(found.marketGroup, found.market, found.option);
    handleToggleOdds(baseBetItem);

    if (idx >= 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollMarketAnchorIntoView(anchorKey));
      });
    }
  }, [
    location.key,
    location.state,
    matchData?.id,
    matchData?.mg,
    handleToggleOdds,
    scrollMarketAnchorIntoView,
  ]);

  // 获取所有标签：FB 走本地分类；OB 走接口 formatObDetailList
  const allTabs = useMemo((): string[] => {
    if (isOb) {
      return obTypeList.map((item) => item.label);
    }
    const mg: MarketGroup[] = Array.isArray(matchData?.mg) ? matchData.mg : [];
    const sportId = Number(matchData?.sid);
    const isFootball = sportId === Number(FBSportIdValue.Football);
    const isBasketball = sportId === Number(FBSportIdValue.Basketball);
    const tabs: string[] = ['全部'];
    const seen = new Set<string>(tabs);
    const hotList =
      isFootball || isBasketball
        ? getFBDetailHotMarketList(mg, sportId, Number(matchData?.mc?.s) || 0)
        : mg.filter((group) =>
            (Array.isArray(group.tps) ? group.tps : [])
              .map((tag) => String(tag).trim())
              .includes('p'),
          );
    if (hotList.length > 0) {
      tabs.push('热门');
      seen.add('热门');
    }

    fbCategoryTabs.forEach((cat) => {
      if (seen.has(cat.tabType)) return;
      if (mg.some((group) => matchCategoryTab(group, cat.tabType, isFootball, isBasketball))) {
        tabs.push(cat.tabType);
        seen.add(cat.tabType);
      }
    });

    return tabs;
  }, [
    isOb,
    obTypeList,
    matchData?.mg,
    matchData?.sid,
    matchData?.mc?.s,
    fbCategoryTabs,
    matchCategoryTab,
  ]);

  const displayTabs = useMemo((): string[] => {
    if (!showDiscoverTab || allTabs.includes(discoverTabLabel)) {
      return allTabs;
    }
    return [discoverTabLabel, ...allTabs];
  }, [allTabs, discoverTabLabel, showDiscoverTab]);

  useEffect(() => {
    if (displayTabs.length === 0 || hasManualTabChangedRef.current) return;
    /** 首页推荐点盘口带 pickBet 进入时，由 pickBet effect 切 Tab，勿覆盖成「热门」 */
    if ((location.state as { pickBet?: { marketId?: string } } | null)?.pickBet?.marketId) {
      return;
    }
    if (displayTabs.includes('热门')) {
      setActiveTab('热门');
      return;
    }
    if (displayTabs.includes('全部')) {
      setActiveTab('全部');
      return;
    }
    setActiveTab(displayTabs[0] ?? '全部');
  }, [displayTabs, location.state]);

  const getSportBackgroundAsset = (id: number | string | undefined): string => {
    switch (Number(id)) {
      case FBCompetitionMap.football.id:
        return 'Img_football.png.webp';
      case FBCompetitionMap.basketball.id:
        return 'Img_basketball.png.webp';
      case FBCompetitionMap.tennis.id:
        return 'Img_tennis.png.webp';
      case FBCompetitionMap.volleyball.id:
      case FBCompetitionMap.beachVolleyball.id:
        return 'Img_vollyball.png.webp';
      case FBCompetitionMap.pingPong.id:
        return 'Img_table_tennis.png.webp';
      case FBCompetitionMap.snooker.id:
        return 'Img_snooker.png.webp';
      case FBCompetitionMap.badminton.id:
        return 'Img_badminton.png.webp';
      case FBCompetitionMap.cricket.id:
        return 'Img_generic.png.webp';
      default:
        return 'Img_generic.png.webp';
    }
  };
  const sportBgStyle = {
    backgroundImage: `url('/images/common/sportsDetails/${getSportBackgroundAsset(matchInfo?.sportId)}')`,
    backgroundSize: '100% 234px',
    backgroundPosition: 'left top',
    backgroundRepeat: 'no-repeat',
  };
  if (isLoading) {
    return <Skeleton type={hideMatchInfo ? 'sportsDetailsMarkets' : 'sportsDetails'} />;
  }

  if (!matchInfo) {
    return (
      <div className={styles.matchDetails}>
        <div className={styles.empty}>赛事不存在或已关闭</div>
      </div>
    );
  }

  const handlePullRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await refetch();
  };

  const bettingContent = (
    <>
      <div className={clsx(styles.content, hideMatchInfo && styles.embeddedSidebar)}>
        <div
          className={clsx(styles.marketsContainer, hideMatchInfo && styles.embeddedSidebar)}
          ref={marketsContainerRef}
        >
          {isOb ? (
            processedObMarkets.length === 0 ? (
              <div className={`${styles.emptyMarkets} _tf[14]`}>
                <Empty text="暂无盘口数据" />
              </div>
            ) : (
              processedObMarkets.map((market) => (
                <OBBettingMarket
                  key={market.marketId}
                  market={market}
                  collapsed={collapsedMarkets.has(market.marketId)}
                  fixed={fixedTopMarkets.has(market.marketId)}
                  selectedBetItemIds={selectedBetItemIds}
                  embeddedInSidebar={hideMatchInfo}
                  onToggleCollapse={handleToggleCollapse}
                  onToggleFixed={(marketId) => handleToggleFixed(marketId)}
                  onToggleOdds={handleToggleOdds}
                />
              ))
            )
          ) : processedMarkets.length === 0 ? (
            <div className={`${styles.emptyMarkets} _tf[14]`}>
              <Empty text="暂无盘口数据" />
            </div>
          ) : (
            processedMarkets.map((marketGroup: MarketGroup, index: number) => {
              const uniqueKey = getBettingMarketAnchorKey(marketGroup, index);
              return (
                <BettingMarket
                  key={uniqueKey}
                  scrollAnchorId={uniqueKey}
                  marketGroup={marketGroup}
                  isCollapsed={collapsedMarkets.has(uniqueKey)}
                  isFixed={
                    fixedTopMarkets.has(getMarketGroupFixedKey(marketGroup)) ||
                    fixedTopMarkets.has(getMarketGroupLegacyFixedKey(marketGroup))
                  }
                  selectedBets={selectedBets}
                  onToggleCollapse={() => handleToggleCollapse(uniqueKey)}
                  onToggleFixed={() => {
                    handleToggleFixed(
                      getMarketGroupFixedKey(marketGroup),
                      getMarketGroupLegacyFixedKey(marketGroup),
                    );
                  }}
                  onToggleOdds={handleToggleOdds}
                  embeddedInSidebar={hideMatchInfo}
                />
              );
            })
          )}
        </div>
      </div>
    </>
  );

  return (
    // <section className={styles.pageBox}>
    <div
      className={clsx(
        styles.sportDetailPage,
        hideMatchInfo && styles.embeddedSidebar,
        hasPcNotice && styles.hasPcNotice,
      )}
      ref={containerRef}
      data-sport-detail-page
      style={screenBreakpoint === 'md' ? sportBgStyle : undefined}
    >
      {h5VideoVisible && (
        <VideoPlayerMobile
          mediaMode={mediaMode}
          videoLines={videoLines}
          animationUrls={animationUrls}
        />
      )}
      {!hideMatchInfo && (
        <>
          {screenBreakpoint !== 'md' && (
            <div className={styles.pcTopArea}>
              <OptionBarPC />
              {hasPcNotice && (
                <NoticeBar
                  className={styles.noticeBar}
                  items={pcNoticeItems}
                  icon="/images/common/notice.svg"
                  speed={50}
                  iconColor="var(--Text-800)"
                  itemClick={(item, index) => {
                    console.log('NoticeBar clicked:', item, index);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
      {!hideMatchInfo && (
        <HeaderWeb
          matchInfo={matchInfo}
          onBack={handleBack}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          isDataBoardVisible={isDataBoardVisible}
          onToggleDataBoard={handleToggleDataBoard}
          onRefresh={() => {
            setIsRefreshing(true);
            void refetch();
          }}
          isRefreshing={isRefreshing}
          fixedStyle={undefined}
          onShare={isLogin ? handleOpenShare : undefined}
        />
      )}
      <div className={styles.matchDetailsHeader}>
        <MatchDetailsHeader
          isVideoVisible={h5VideoVisible}
          isDataBoardVisible={isDataBoardVisible}
          matchInfo={matchInfo}
          isMatchTeamHeader={isMatchTeamHeader}
          isFavorite={isFavorite}
          isRefreshing={isRefreshing}
          webHeaderFixedStyle={
            screenBreakpoint !== 'md' && pcSmallCardBounds
              ? { left: `${pcSmallCardBounds.left}px`, width: `${pcSmallCardBounds.width}px` }
              : undefined
          }
          hideWebHeader={hideMatchInfo}
          onBack={handleBack}
          onToggleFavorite={handleToggleFavorite}
          onToggleDataBoard={handleToggleDataBoard}
          onRefresh={() => {
            setIsRefreshing(true);
            void refetch();
          }}
          onDrawerOpen={handleDrawerOpen}
          onShare={isLogin ? handleOpenShare : undefined}
        />
        {!hideMatchInfo && (
          <div data-match-info>
            <MatchInfo
              matchInfo={matchInfo}
              enableWinnerQuery={!isOb}
              recommendList={recommendList}
              videoLines={videoLines}
              animationUrls={animationUrls}
              tabs={displayTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showSmallCard={showSmallCardForMatchInfo}
              pcSmallCardBounds={pcSmallCardBounds}
              meidaMode={mediaMode}
              isVideoVisible={h5VideoVisible}
              isDataBoardVisible={isDataBoardVisible}
              onMediaPlay={(mode) => {
                if (!isMobile) return;
                setMediaMode(mode);
                setIsVideoVisible(true);
              }}
              onRecommendOddsClick={onRecommendOddsClick}
              isRecommendOddsSelected={isRecommendOddsSelected}
            />
          </div>
        )}
      </div>

      <div
        className={clsx(styles.matchDetails, hideMatchInfo && styles.embeddedSidebar)}
        ref={matchDetailsRef}
      >
        <BettingTabs
          tabs={displayTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onToggleAllCollapse={handleToggleAllCollapse}
          isAllCollapsed={isAllCollapseToggled}
          onRefresh={() => {
            setIsRefreshing(true);
            void refetch();
          }}
          isRefreshing={isRefreshing}
          isVideoVisible={h5VideoVisible}
          isDataBoardVisible={isDataBoardVisible}
          embeddedInSidebar={hideMatchInfo}
          hideCollapseButton={isDiscoverTabActive}
          discoverTabLabel={showDiscoverTab ? discoverTabLabel : undefined}
          showDiscoverBadge={showDiscoverBadge}
        />
        {isDiscoverTabActive && (
          <DiscoverSubTabs
            tabs={discoverSubTabs}
            activeIndex={discoverSubTabIndex}
            onChange={onDiscoverSubTabChanged}
            isVideoVisible={h5VideoVisible}
            isDataBoardVisible={isDataBoardVisible}
            embeddedInSidebar={hideMatchInfo}
          />
        )}
        {isDiscoverTabActive ? (
          <DiscoverContent
            loading={isDiscoverBooting}
            sportId={matchInfo.sportId}
            chatConfig={chatConfig}
            enabledSubTabTitles={discoverEnabledSubTabTitles}
            resultMatchId={resultMatchId}
            venueMatchId={matchInfo.matchId}
            activeSubTabIndex={discoverSubTabIndex}
            onSubTabChange={onDiscoverSubTabChanged}
            homeTeam={{
              name: matchInfo.homeName,
              logo: matchInfo.homeLogo,
            }}
            awayTeam={{
              name: matchInfo.awayName,
              logo: matchInfo.awayLogo,
            }}
            homeTeamName={matchInfo.homeName}
            awayTeamName={matchInfo.awayName}
            homeTeamIcon={matchInfo.homeLogo}
            awayTeamIcon={matchInfo.awayLogo}
            matchShareInfo={chatMatchShareInfo}
            leagueName={matchInfo.leagueName ?? ''}
            embeddedInSidebar={hideMatchInfo}
          />
        ) : isMobile && !hideMatchInfo ? (
          <MyPullToRefresh onRefresh={handlePullRefresh}>{bettingContent}</MyPullToRefresh>
        ) : (
          bettingContent
        )}
        {/* {selectedBets.length > 0 && (
        <FloatingActionButton
          count={selectedBets.length}
          onClick={() => console.log('打开投注单')}
        />
      )} */}
        <MatchDrawer
          visible={isDrawerVisible}
          currentMatchId={matchInfo.matchId}
          currentLeagueId={matchInfo.leagueId}
          leagueName={matchInfo.leagueName || ''}
          onClose={handleDrawerClose}
          onMatchSelect={handleMatchSelect}
        />
      </div>
      <ClientOnly>
        <FloatingButton scrollContainerRef={containerRef} />
      </ClientOnly>
      {/* 分享面板收统一的 matchInfo，FB / OB 都能用（对齐 Flutter SportShareSheet 收 SportItemInfo） */}
      {isLogin && matchInfo && (
        <MatchShareSheet
          show={shareSheetOpen}
          onClose={() => setShareSheetOpen(false)}
          match={matchInfo}
          onShareToChat={handleShareToChat}
        />
      )}
    </div>
    // </section>
  );
};

export default SportDetail;
