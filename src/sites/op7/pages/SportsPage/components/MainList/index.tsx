// 赛事分组类型选择器
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Empty from '@/common/components/Empty';
import Skeleton from '@/common/components/Skeleton';

import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { useSportsMainListData } from '@/common/hooks/useSportsMainListData';

import styles from './MainList.module.scss';
import { HotSportId, LotterySportId } from '@/apis/commonSports/constants';
import { useMemoizedFn } from 'ahooks';
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import MatchItem from '../MatchItem';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';
import {
  findH5SportsListScrollElement,
  H5_SPORTS_MAIN_LIST_SCROLL,
  type H5SportsMainListScrollDetail,
} from '@/utils/constants/layoutEvents';
import MatchItemSimple from '../MatchItemSimple';

interface MainListProps {
  /** 强制使用移动端样式，用于弹窗等场景 */
  forceMobile?: boolean;
  isSimpleOdds: boolean;
  /** 三行盘口在 OddBtn 内是否使用纵向布局 */
  threeLineColumn?: boolean;
  /** 仅当前实例：按时间由近到远排序（不改全局 orderBy） */
  localTimeOrder?: boolean;
  /** 仅当前实例：按联赛过滤赛事（如详情抽屉只看当前联赛） */
  leagueIdFilter?: number;
  /** 仅当前实例：隐藏底部“加载更多” */
  hideLoadMore?: boolean;
  hideMatchNum?: boolean;
  /** MatchItemSimple 左侧信息区缩为 150px（右侧栏） */
  compactLeftInfo?: boolean;
  onMatchClick?: (matchId: string | number) => void;
}

/** 同一 leagueId 可能出现在不同 matchStatus / sportId 分组下，折叠状态需用复合键区分 */
const leagueCollapseKey = (leagueId: number, matchStatus: string, sportId: number) =>
  `${matchStatus}:${sportId}:${leagueId}`;

const MainList: React.FC<MainListProps> = ({
  forceMobile,
  isSimpleOdds,
  threeLineColumn,
  localTimeOrder = false,
  leagueIdFilter,
  hideLoadMore = false,
  hideMatchNum,
  compactLeftInfo,
  onMatchClick,
}) => {
  //   const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const listScrollRootRef = useRef<HTMLUListElement>(null);
  const collapsedAll = useAppSelector((state) => state.sport.mainList.settings.collapsedAll);
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const menus = useAppSelector((state) => state.sport.mainList.datas.menuInfo.menus);

  // 当工具栏折叠所有联赛时，记录哪些联赛是展开的，反之记录哪些是折叠的
  const [collapsedOrNotCollapsedLeagueKeys, setCollapsedOrNotCollapsedLeagueKeys] = useState<
    Set<string>
  >(new Set());
  const { changeFollowMatchStatus, changePinnedSportStatus, changePinnedMatchStatus } =
    useSportsMainListControl();
  const {
    listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    sportId,
    // refetch,
  } = useSportsMainListData();

  const lotterySportWeekMap = useMemo(() => {
    if (sportId === LotterySportId) {
      return menus[playType].find((item) => item.sportId === LotterySportId)?.matchIdVsWeekMap;
    }
    return [];
  }, [menus, playType, sportId]);

  const renderFooter = useMemoizedFn(() => {
    if (hideLoadMore) return null;

    if (isFetchingNextPage) {
      return (
        <div className={styles.loading}>
          <LazyImage src="/images/common/loading.png" width={16} />
        </div>
      );
    }
    if (hasNextPage) {
      return (
        <div className={styles.loading} onClick={() => void fetchNextPage()}>
          加载更多
        </div>
      );
    }

    return <div className="text-[var(--Text-700)] _tf[12] text-center"></div>;
  });

  // 联赛展开/收起
  const handleToggleCollapse = (leagueId: number, matchStatus: string, sportId: number): void => {
    const key = leagueCollapseKey(leagueId, matchStatus, sportId);
    setCollapsedOrNotCollapsedLeagueKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };
  // 所有置顶的联赛展开/收起
  const handleToggleCollapsePinned = (leagueKeys: string[]): void => {
    setCollapsedOrNotCollapsedLeagueKeys((prev) => {
      const newSet = new Set(prev);
      const hasAny = _.some(leagueKeys, (k) => newSet.has(k));
      if (hasAny) {
        leagueKeys.forEach((k) => newSet.delete(k));
      } else {
        leagueKeys.forEach((k) => newSet.add(k));
      }
      return newSet;
    });
  };

  useEffect(() => {
    // 当工具栏折叠所有联赛时，记录哪些联赛是展开的，反之记录哪些是折叠的
    // 当折叠/展开所有联赛时，清空记录
    setCollapsedOrNotCollapsedLeagueKeys(new Set());
  }, [collapsedAll]);

  useLayoutEffect(() => {
    if (!isMobile) return;
    const scrollEl = findH5SportsListScrollElement(listScrollRootRef.current);
    if (!scrollEl) return;

    const emit = (): void => {
      window.dispatchEvent(
        new CustomEvent<H5SportsMainListScrollDetail>(H5_SPORTS_MAIN_LIST_SCROLL, {
          detail: { scrollTop: scrollEl.scrollTop },
        }),
      );
    };
    emit();
    scrollEl.addEventListener('scroll', emit, { passive: true });
    return () => scrollEl.removeEventListener('scroll', emit);
  }, [isMobile, isLoading, listData.length]);

  const filteredListData = useMemo(() => {
    if (!leagueIdFilter) return listData;

    return listData
      .map((statusGroup) => ({
        ...statusGroup,
        sportGroup: statusGroup.sportGroup
          .map((sportGroup) => ({
            ...sportGroup,
            leagueGroup: sportGroup.leagueGroup.filter(
              (leagueGroup) => leagueGroup.leagueId === leagueIdFilter,
            ),
          }))
          .filter((sportGroup) => sportGroup.leagueGroup.length > 0),
      }))
      .filter((statusGroup) => statusGroup.sportGroup.length > 0);
  }, [listData, leagueIdFilter]);

  const displayListData = useMemo(() => {
    if (!localTimeOrder) return filteredListData;

    return filteredListData.map((statusGroup) => ({
      ...statusGroup,
      sportGroup: statusGroup.sportGroup.map((sportGroup) => {
        const sortedLeagueGroup = [...sportGroup.leagueGroup]
          .map((leagueGroup) => ({
            ...leagueGroup,
            matches: [...leagueGroup.matches].sort((a, b) => a.bt - b.bt),
          }))
          .sort((a, b) => {
            const aMinBt = a.matches[0]?.bt ?? Number.MAX_SAFE_INTEGER;
            const bMinBt = b.matches[0]?.bt ?? Number.MAX_SAFE_INTEGER;
            return aMinBt - bMinBt;
          });

        return {
          ...sportGroup,
          leagueGroup: sortedLeagueGroup,
        };
      }),
    }));
  }, [filteredListData, localTimeOrder]);

  if (isLoading) {
    return <Skeleton type="sportsMainList" />;
  }
  if (displayListData.length === 0) {
    return <Empty className="h-[500px]" text="暂无数据" />;
  }
  return (
    <ul ref={listScrollRootRef} className={styles.mainList}>
      {displayListData.map((statusGroup) => (
        <li key={statusGroup.matchStatus} className={styles.wrapper}>
          {statusGroup.matchStatus === 'pinned' &&
            (() => {
              const leagueKeys = _.flatMap(statusGroup.sportGroup, (sg) =>
                _.map(sg.leagueGroup, (lg) =>
                  leagueCollapseKey(lg.leagueId, statusGroup.matchStatus, sg.sportId),
                ),
              );
              const isCollapsed = collapsedAll
                ? !_.some(leagueKeys, (k) => collapsedOrNotCollapsedLeagueKeys.has(k))
                : _.every(leagueKeys, (k) => collapsedOrNotCollapsedLeagueKeys.has(k));
              return (
                <div
                  className={clsx(styles.title, isCollapsed && styles.collapsed)}
                  onClick={() => handleToggleCollapsePinned(leagueKeys)}
                >
                  <span className="_tf[14]">置顶赛事（{statusGroup.count}）</span>
                  <Icon
                    src="/images/common/arrow_sports.svg"
                    size="12px"
                    color="var(--Text-700)"
                    className={clsx(
                      styles.collapsedIcon,
                      _.pickBy({ [styles.collapsed as string]: true }, () => isCollapsed),
                    )}
                  />
                </div>
              );
            })()}
          {statusGroup.sportGroup.map((sportGroup) => (
            <div key={sportGroup.sportId}>
              {sportId === HotSportId && (
                // 赛种标题（热门才有）
                <div
                  className={clsx(clsx(styles.title, 'important:border-none'), styles.sportTitle)}
                >
                  <div className="_tf[14]">
                    <Icon
                      src={`/images/common/sportsDetails/pin_status${sportGroup.sportPinned ? '_active' : ''}.svg`}
                      size={'15px'}
                      color={sportGroup.sportPinned ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
                      className={styles.titleIcon}
                      onClick={() =>
                        changePinnedSportStatus(
                          sportGroup.sportId,
                          sportGroup.sportPinned ? 'remove' : 'add',
                        )
                      }
                      // className={styles.fold}
                    />
                    <span>
                      {sportGroup.sportName}（{sportGroup.count}）
                    </span>
                  </div>
                </div>
              )}
              {sportGroup.leagueGroup.map((leagueGroup, leagueIndex) => {
                const rowKey = leagueCollapseKey(
                  leagueGroup.leagueId,
                  statusGroup.matchStatus,
                  sportGroup.sportId,
                );
                let isCollapsed;
                if (collapsedAll) {
                  isCollapsed = !collapsedOrNotCollapsedLeagueKeys.has(rowKey);
                } else {
                  isCollapsed = collapsedOrNotCollapsedLeagueKeys.has(rowKey);
                }
                return (
                  <div
                    key={rowKey}
                    className={clsx(
                      styles.leagueWrapper,
                      sportId === HotSportId && leagueIndex === 0 && styles.leagueNoBorderFirst,
                    )}
                  >
                    <div
                      className={clsx(styles.leagueTitle, isCollapsed && styles.collapsed)}
                      onClick={() =>
                        handleToggleCollapse(
                          leagueGroup.leagueId,
                          statusGroup.matchStatus,
                          sportGroup.sportId,
                        )
                      }
                    >
                      {/* // 联赛标题 */}
                      <div className="flex items-center gap-4px _tf[12]">
                        {/* <LazyImage
                          src={leagueGroup.leagueLogo || ''}
                          width={16}
                          className={styles.titleIcon}
                        /> */}
                        <span>{leagueGroup.leagueName}</span>
                      </div>
                      {/* {leagueGroup.matches.length} */}
                      <Icon
                        src="/images/common/arrow_sports.svg"
                        size="12px"
                        color="var(--Text-700)"
                        className={clsx(
                          styles.collapsedIcon,
                          _.pickBy({ [styles.collapsed as string]: true }, () => isCollapsed),
                        )}
                      />
                    </div>
                    {!isCollapsed && (
                      <div>
                        {leagueGroup.matches.map((match, index) => (
                          <div key={match.matchId}>
                            {isSimpleOdds ? (
                              <MatchItemSimple
                                match={match}
                                changePinnedMatchStatus={changePinnedMatchStatus}
                                forceMobile={forceMobile}
                                threeLineColumn={threeLineColumn}
                                hideMatchNum={hideMatchNum}
                                compactLeftInfo={compactLeftInfo}
                                isLast={index === leagueGroup.matches.length - 1}
                                lotterySportTips={
                                  lotterySportWeekMap &&
                                  lotterySportWeekMap.find(
                                    (item) => item.matchId === String(match.matchId),
                                  )?.jcWeek
                                }
                                onMatchClick={onMatchClick}
                              />
                            ) : (
                              <MatchItem
                                match={match}
                                changePinnedMatchStatus={changePinnedMatchStatus}
                                changeFollowMatchStatus={changeFollowMatchStatus}
                                forceMobile={forceMobile}
                                isLast={index === leagueGroup.matches.length - 1}
                                onMatchClick={onMatchClick}
                                lotterySportTips={
                                  lotterySportWeekMap &&
                                  lotterySportWeekMap.find(
                                    (item) => item.matchId === String(match.matchId),
                                  )?.jcWeek
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </li>
      ))}
      {renderFooter()}
    </ul>
  );
};

export default MainList;
