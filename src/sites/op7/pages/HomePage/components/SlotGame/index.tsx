// import { useAppSelector } from '@/core/store/hooks';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useSlotGameListLayout } from '@/common/hooks/useSlotGameListLayout';
import styles from './SlotGame.module.scss';
import ListInfiniteFooter from '@/common/components/ListInfiniteFooter';
import {
  useGameFavoriteListInfiniteQuery,
  useGameSlotListInfiniteQuery,
  TGameList,
} from '@/apis/origin/gamePlay';
import Icon from '@/common/components/Icon';
import {
  ENTERTAINMENT_HOME_PAGE_TYPE,
  HomeListId,
  TRY_PLAY_VENUE_ID,
} from '@/utils/constants/entertainment';
import SearchModal from './components/SearchModal';
import GameList from './components/GameList';
import { useHomeList } from '@/common/hooks/useHomeList';
import clsx from 'clsx';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { generatePath } from 'react-router-dom';
import { useAppSelector } from '@/core/store/hooks';
import { HomeListSwitch } from '@/apis/origin/homeList';
// enum EDropdownVisibleType {
//   SORT_BY = 'sortBy', // 排序方式
//   GAME_TYPE = 'gameType', // 游戏类型
//   NONE = 'none', // 无
// }

// const MY_FAVORITE_VENUE_ID = -1;
// type SlotTabItemSlotTabItem = {
//   name: string;
//   gameId: number;
//   icon: string;
//   switch?: string | number;
//   maintenanceDesc?: string;
// };

const SORT_OPTIONS = [
  { id: 1, name: '全部' },
  { id: 2, name: '热门' },
  { id: 3, name: '收藏' },
] as const;

// const GAME_TYPE_OPTIONS = [
//   { id: 1, name: '高爆' },
//   { id: 2, name: '高倍' },
//   { id: 3, name: '高回报' },
//   { id: 4, name: '高赔率' },
//   { id: 5, name: '爆分' },
//   { id: 6, name: '大奖频出' },
// ] as const;

/**
 * @description 电子游戏
 */
const SlotGame: FC<{ venueId: number }> = ({ venueId }) => {
  const tabWarpRef = useRef<HTMLDivElement>(null);
  const { listContainerRef, pageSize } = useSlotGameListLayout();
  // const isMobile = useAppSelector((state) => state.config.isMobile);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const trialInterface = useAppSelector((state) => state.config.system.trialInterface);
  const { homeList } = useHomeList();
  const navigate = useNavigateWithLanguage();
  // const [dropdownVisibleType, setDropdownVisibleType] = useState(EDropdownVisibleType.NONE);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSortId, setSelectedSortId] = useState<number>(SORT_OPTIONS[0].id);
  const [listNormalVisible, setListNormalVisible] = useState<boolean>(true);
  // const [selectedGameTypeId, setSelectedGameTypeId] = useState<number>(GAME_TYPE_OPTIONS[0].id);
  const isFavoriteTab = selectedSortId === 3; //收藏tab
  const slotCategory = useMemo(
    () => homeList.find((item) => item.homeId === Number(HomeListId.SLOTS)),
    [homeList],
  );
  const slotChildren = useMemo(() => slotCategory?.children ?? [], [slotCategory]);
  const slotTabList = useMemo(
    () =>
      // [
      //   // {
      //   //   name: '我的收藏',
      //   //   gameId: MY_FAVORITE_VENUE_ID,
      //   //   icon: '/images/common/followed.svg',
      //   // },
      //   ...slotChildren,
      // ],
      trialInterface ? slotChildren : [...slotChildren.filter((item) => !item.isTryPlay)],
    [slotChildren, trialInterface],
  );

  const {
    data: slotData,
    fetchNextPage: fetchSlotNextPage,
    hasNextPage: hasSlotNextPage,
    isFetchingNextPage: isFetchingSlotNextPage,
    isLoading: isSlotLoading,
  } = useGameSlotListInfiniteQuery(
    {
      gameId: venueId,
      tryPlay: venueId === TRY_PLAY_VENUE_ID,
      pageSize,
      clType: selectedSortId === 1 ? '' : 'hot',
    },
    {
      enabled: !isFavoriteTab,
    },
  );

  const {
    data: favoriteData,
    fetchNextPage: fetchFavoriteNextPage,
    hasNextPage: hasFavoriteNextPage,
    isFetchingNextPage: isFetchingFavoriteNextPage,
    isLoading: isFavoriteLoading,
  } = useGameFavoriteListInfiniteQuery(
    {
      pageSize,
      sort: selectedSortId === 1 ? '' : 'hot',
      order: 'desc',
      search: '',
      category: '',
      subcategory: '',
    },
    {
      enabled: isFavoriteTab && isLogin,
    },
  );

  const activeData = isFavoriteTab ? favoriteData : slotData;
  const hasNextPage = isFavoriteTab ? hasFavoriteNextPage : hasSlotNextPage;
  const gameList = useMemo(() => {
    const pages = Array.isArray((activeData as { pages?: unknown })?.pages)
      ? ((activeData as { pages?: Array<{ gameList?: TGameList[] }> }).pages ?? [])
      : [];
    return pages.flatMap((page) => page.gameList ?? []);
  }, [activeData]);
  const isFetchingNextPage = isFavoriteTab ? isFetchingFavoriteNextPage : isFetchingSlotNextPage;
  const isLoading = isFavoriteTab ? isFavoriteLoading : isSlotLoading;
  const handleLoadMore = useCallback(() => {
    if (isFavoriteTab) {
      void fetchFavoriteNextPage();
      return;
    }
    void fetchSlotNextPage();
  }, [fetchFavoriteNextPage, fetchSlotNextPage, isFavoriteTab]);

  // const selectedSort = useMemo(
  //   () => SORT_OPTIONS.find((item) => item.id === selectedSortId) || SORT_OPTIONS[0],
  //   [selectedSortId],
  // );
  // const selectedGameType = useMemo(
  //   () => GAME_TYPE_OPTIONS.find((item) => item.id === selectedGameTypeId) || GAME_TYPE_OPTIONS[0],
  //   [selectedGameTypeId],
  // );
  const currentVenueName = useMemo(() => {
    if (isFavoriteTab) return '我的收藏';
    return slotChildren.find((item) => item.gameId === venueId)?.name ?? '';
  }, [isFavoriteTab, slotChildren, venueId]);
  const currentVenueMaintenance = useMemo(() => {
    const currentVenue = slotChildren.find((item) => item.gameId === venueId);
    return {
      switch: currentVenue?.switch,
      maintenanceDesc: currentVenue?.maintenanceDesc,
    };
  }, [slotChildren, venueId]);

  const scrollTabIntoCenter = useCallback((target: HTMLElement) => {
    const container = tabWarpRef.current;
    if (!container) return;
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const nextLeft = targetCenter - container.clientWidth / 2;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    container.scrollTo({
      left: Math.min(Math.max(0, nextLeft), maxScroll),
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const container = tabWarpRef.current;
    if (!container) return;
    const activeTab = container.querySelector<HTMLElement>(`[data-venue-id="${venueId}"]`);
    if (!activeTab) return;
    scrollTabIntoCenter(activeTab);
  }, [scrollTabIntoCenter, venueId]);

  // useEffect(() => {
  //   setSelectedSortId(SORT_OPTIONS[0].id);
  // }, [venueId]);

  return (
    <section className={`${styles.gamePage} base-main-background`}>
      <div className={styles.topArea}>
        <div className={styles.tabWarp} ref={tabWarpRef}>
          {slotTabList.map((item) => {
            const isActive = item.gameId === venueId;
            const normalizedSwitch = String(item.switch ?? HomeListSwitch.NORMAL) as HomeListSwitch;
            const isMaintenance = normalizedSwitch === HomeListSwitch.MAINTENANCE;
            const isExpect = normalizedSwitch === HomeListSwitch.EXPECT;
            const isDisabledTab = isMaintenance || isExpect;
            const displayName = isMaintenance ? '升级中' : isExpect ? '敬请期待' : item.name;

            return (
              <div
                key={item.gameId}
                data-venue-id={item.gameId}
                onClick={(e) => {
                  if (isDisabledTab) return;
                  scrollTabIntoCenter(e.currentTarget);
                  navigate(
                    generatePath(PATHS.entertainment, {
                      pageType: ENTERTAINMENT_HOME_PAGE_TYPE.SLOT_GAME,
                      id: item.gameId.toString(),
                    }),
                  );
                }}
                className={clsx({
                  [styles.tabItem as string]: true,
                  [styles.tabItemActive as string]: isActive,
                  [styles.tabItemDisabled as string]: isDisabledTab,
                })}
              >
                <Icon
                  src={item.icon}
                  size="30px"
                  color={
                    isDisabledTab
                      ? 'var(--Text-700)'
                      : isActive
                        ? 'var(--White-100)'
                        : 'var(--ThemeColor-Main)'
                  }
                />
                <div>{displayName}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.optionsWrapper}>
          <div className={clsx(styles.filterWrapper, '_tf[12]')}>
            {SORT_OPTIONS.map((option) => (
              <span
                key={option.id}
                className={clsx(option.id === selectedSortId && styles.active)}
                onClick={() => setSelectedSortId(option.id)}
              >
                {option.name}
              </span>
            ))}
          </div>
          <div className={styles.optionsRight}>
            <div className={styles.searchWrapper} onClick={() => setModalVisible(true)}>
              <Icon src="/images/common/ic_search.svg" size="16px" color="var(--Text-800)" />
              <span className="text-[var(--Text-700)] _tf[13] whitespace-nowrap">
                请输入游戏名称
              </span>
            </div>
            <Icon
              src="/images/common/game/ylfz.svg"
              size="18px"
              color={listNormalVisible ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
              onClick={() => setListNormalVisible(true)}
            />
            <div className={styles.line} />
            <Icon
              src="/images/common/game/yljd.svg"
              size="18px"
              color={listNormalVisible ? 'var(--Text-800)' : 'var(--ThemeColor-Main)'}
              onClick={() => setListNormalVisible(false)}
            />
          </div>
        </div>

        {/* <div className={clsx(styles.sortWrapper, '_tf[14]')}>
            <div
              onClick={() =>
                setDropdownVisibleType((prev) =>
                  prev === EDropdownVisibleType.SORT_BY
                    ? EDropdownVisibleType.NONE
                    : EDropdownVisibleType.SORT_BY,
                )
              }
            >
              <span>{`排序方式-${selectedSort.name}`}</span>
              <Icon
                className={clsx(
                  styles.sortIcon,
                  dropdownVisibleType === EDropdownVisibleType.SORT_BY && styles.active,
                )}
                src="/images/common/arrow_sports.svg"
                size="11px"
                color="var(--Text-700)"
              />
              {dropdownVisibleType === EDropdownVisibleType.SORT_BY && (
                <ul className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                  {SORT_OPTIONS.map((option) => (
                    <li
                      key={option.id}
                      className={clsx(option.id === selectedSortId && styles.activeSortItem)}
                      onClick={() => {
                        setSelectedSortId(option.id);
                        setDropdownVisibleType(EDropdownVisibleType.NONE);
                      }}
                    >
                      {option.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              onClick={() =>
                setDropdownVisibleType((prev) =>
                  prev === EDropdownVisibleType.GAME_TYPE
                    ? EDropdownVisibleType.NONE
                    : EDropdownVisibleType.GAME_TYPE,
                )
              }
            >
              <span>{`游戏类型-${selectedGameType.name}`}</span>
              <Icon
                className={clsx(
                  styles.sortIcon,
                  dropdownVisibleType === EDropdownVisibleType.GAME_TYPE && styles.active,
                )}
                src="/images/common/arrow_sports.svg"
                size="11px"
                color="var(--Text-700)"
              />
              {dropdownVisibleType === EDropdownVisibleType.GAME_TYPE && (
                <ul className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                  {GAME_TYPE_OPTIONS.map((option) => (
                    <li
                      key={option.id}
                      className={clsx(option.id === selectedGameTypeId && styles.activeSortItem)}
                      onClick={() => {
                        setSelectedGameTypeId(option.id);
                        setDropdownVisibleType(EDropdownVisibleType.NONE);
                      }}
                    >
                      {option.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div> */}
      </div>
      <div className={styles.mainArea} ref={listContainerRef}>
        {/* <div>
            <p>游戏数量：{gameList?.length}</p>
          </div> */}
        <GameList
          data={gameList}
          skeletonCount={pageSize}
          isLoading={isLoading}
          isTryPlay={venueId === TRY_PLAY_VENUE_ID}
          venueId={venueId}
          venueName={currentVenueName}
          venueSwitch={currentVenueMaintenance.switch}
          venueMaintenanceDesc={currentVenueMaintenance.maintenanceDesc}
          listSimpleView={!listNormalVisible}
          isFavoriteTab={isFavoriteTab}
        />
        <ListInfiniteFooter
          loading={isLoading || isFetchingNextPage}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
        />
      </div>
      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultHomeGameId={isFavoriteTab ? (slotChildren[0]?.gameId ?? TRY_PLAY_VENUE_ID) : venueId}
      />
    </section>
  );
};

export default SlotGame;
