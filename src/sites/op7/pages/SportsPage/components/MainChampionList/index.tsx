// 冠军列表
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// components
import Empty from '@/common/components/Empty';
import Skeleton from '@/common/components/Skeleton';
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
// api
import { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';
// hooks
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';
import { useClickBetItem } from '@/common/hooks/bet/useClickBetItem';
import { useMemoizedFn } from 'ahooks';
import { useAppSelector } from '@/core/store/hooks';

// styles
import styles from './index.module.scss';
import { useSportsMainListData } from '@/common/hooks/useSportsMainListData';
import clsx from 'clsx';
import { getFirstLetterPinyin } from '@/apis/fbSports/common/fbFormat';
import { useChampionHotQuery } from '@/apis/origin/championHot';

/** 运营热门名出现在列表冠军赛事名（leagueName）中即视为命中 */
const isChampionHotMatch = (leagueName: string, hotName: string): boolean => {
  const key = hotName.trim();
  if (!key) return false;
  return leagueName.includes(key);
};

interface ChampionLetterGroup {
  letter: string;
  list: MatchBaseInfo[];
}

const getLeagueFirstLetter = (name: string): string => {
  const firstChar = name.trim().charAt(0);
  if (/^[a-z]$/i.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  const pinyinLetter = getFirstLetterPinyin(firstChar).charAt(0);
  if (/^[A-Z]$/.test(pinyinLetter)) {
    return pinyinLetter;
  }

  return '#';
};

const groupChampionListByLetter = (list: MatchBaseInfo[]): ChampionLetterGroup[] => {
  const groupMap = new Map<string, MatchBaseInfo[]>();

  list.forEach((item) => {
    const letter = getLeagueFirstLetter(item.leagueName);
    const group = groupMap.get(letter) ?? [];
    group.push(item);
    groupMap.set(letter, group);
  });

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(([letter, list]) => ({
      letter,
      list: list.sort((a, b) => a.leagueName.localeCompare(b.leagueName, 'zh-Hans-CN')),
    }));
};

const MainChampionList: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const { clickBetItem } = useClickBetItem();

  const [expandList, setExpandList] = useState<number[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<Record<string, HTMLElement | null>>({});

  const { collapsedAll, sportId } = useAppSelector((state) => state.sport.mainList.settings);

  const { isLoading, data } = useSportsMainListData();
  const allMainListData = data?.pages[0];

  const { data: hotLeagueNames = [] } = useChampionHotQuery(sportId);

  /** 热门：接口字段在列表 leagueName 中则归入热门；A-Z 列表排除已入选热门的项 */
  const { hotChampionList, restChampionList } = useMemo(() => {
    const list = allMainListData ?? [];
    if (!list.length) {
      return { hotChampionList: [], restChampionList: [] };
    }
    if (!hotLeagueNames.length) {
      return { hotChampionList: [], restChampionList: list };
    }

    const hotMatchIds = new Set<number>();
    const hotChampionList: MatchBaseInfo[] = [];

    // 每个热门名可命中多条列表（如「世界杯」→ 联合式世界杯 2027 + 联盟式世界杯 2026）
    for (const hotName of hotLeagueNames) {
      for (const item of list) {
        if (hotMatchIds.has(item.matchId)) continue;
        if (!isChampionHotMatch(item.leagueName, hotName)) continue;
        hotMatchIds.add(item.matchId);
        hotChampionList.push(item);
      }
    }

    const restChampionList = list.filter((item) => !hotMatchIds.has(item.matchId));
    return { hotChampionList, restChampionList };
  }, [allMainListData, hotLeagueNames]);

  const championLetterGroups = useMemo(
    () => groupChampionListByLetter(restChampionList),
    [restChampionList],
  );

  useEffect(() => {
    if (!collapsedAll && allMainListData) {
      const allMatchIds: number[] = allMainListData.map((item: MatchBaseInfo) => item.matchId);
      setExpandList(allMatchIds);
    } else {
      setExpandList([]);
    }
  }, [collapsedAll, allMainListData]);

  const getHeightByMatch = (match: MatchBaseInfo): number => {
    const marketTitleHeight = 28;
    const betItemHeight = 40;
    const marketPaddingY = 24;
    const marketListPaddingTop = 12;
    const marketListGap = 4;
    const borderWidth = 0.5;
    let totalHeight = 0;
    match.children.forEach((market, index) => {
      totalHeight += marketPaddingY + marketTitleHeight + marketListPaddingTop;
      if (index < match.children.length - 1) {
        totalHeight += borderWidth;
      }

      const betTypeItemCount = market.children.filter((betTypeItem) => {
        const lists = betTypeItem.lists;
        return lists && lists.length > 0;
      }).length;
      const rows = Math.ceil(betTypeItemCount / 2);
      totalHeight += rows * betItemHeight + Math.max(0, rows - 1) * marketListGap;
    });

    return totalHeight;
  };

  const toggleDetail = (item: MatchBaseInfo) => {
    navigate(generatePath(PATHS.champion, { id: String(item.matchId) }));
  };

  const toggleExpand = (matchId: number): void => {
    let list = [];
    if (expandList.includes(matchId)) {
      list = expandList.filter((id) => id !== matchId);
    } else {
      list = [...expandList, matchId];
    }
    setExpandList(list);
  };

  const getStickyOffset = useCallback((): number => {
    const listNode = listRef.current;
    const mainArea = listNode?.closest('#sports-page-main-area');
    const stickyNode =
      (mainArea?.firstElementChild as HTMLElement | null) ??
      (listNode?.closest('.adm-pull-to-refresh')?.previousElementSibling as HTMLElement | null);

    const stickyBottom = stickyNode?.getBoundingClientRect().bottom ?? 0;
    return Math.max(0, stickyBottom) + 4;
  }, []);

  const getScrollElement = useCallback((): HTMLElement | null => {
    let node: HTMLElement | null = listRef.current;

    while (node) {
      const overflowY = window.getComputedStyle(node).overflowY;
      const scrollableOverflow =
        overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

      if (scrollableOverflow && node.scrollHeight > node.clientHeight + 1) {
        return node;
      }

      node = node.parentElement;
    }

    return document.scrollingElement as HTMLElement | null;
  }, []);

  const isPageScrollElement = (node: HTMLElement | null): boolean =>
    node === document.documentElement || node === document.body;

  const handleLetterChange = (letter: string): void => {
    const groupNode = letterRefs.current[letter];
    if (!groupNode) return;

    const scrollElement = getScrollElement();
    const pageScrolling = isPageScrollElement(scrollElement);

    groupNode.scrollIntoView({ block: 'start', behavior: 'auto' });

    if (pageScrolling || !scrollElement) {
      const targetTop = getStickyOffset();
      const currentTop = groupNode.getBoundingClientRect().top;
      window.scrollBy({ top: currentTop - targetTop, behavior: 'auto' });
      return;
    }

    const targetTop = getStickyOffset();
    const currentTop = groupNode.getBoundingClientRect().top;
    scrollElement.scrollBy({ top: currentTop - targetTop, behavior: 'auto' });
  };

  const onBet = useMemoizedFn((match: MatchBaseInfo, betItem: TBaseBetItem) => {
    clickBetItem({ baseMatch: match, baseBetItem: betItem });
  });

  const renderChampionItem = (item: MatchBaseInfo) => (
    <button
      key={item.matchId}
      type="button"
      className={styles.championItem}
      onClick={() => toggleDetail(item)}
    >
      <span className={styles.leagueInfo}>
        <LazyImage
          className={styles.leagueIcon}
          src={item.leagueLogo ?? ''}
          fallback={'/images/common/logo_small.png'}
          placeholder={
            <img className={styles.leagueIcon} src="/images/common/logo_small.png" alt="icon" />
          }
          alt="icon"
        />
        <span className="_tf[14]">{item.leagueName}</span>
      </span>
    </button>
  );

  if (isLoading) {
    return <Skeleton type="sportsMainList" />;
  }
  if (allMainListData?.length === 0) {
    return <Empty />;
  }

  return (
    <>
      <div ref={listRef} className={styles.mainListMobile}>
        <div className={styles.wrapper}>
          {hotChampionList.length > 0 && (
            <section className={clsx(styles.hotSection, 'mt-[6px]')}>
              <h3 className="flex items-center gap-[4px]">
                <img
                  src="/images/common/menu/sports/sid/-2_active.svg"
                  className="w-[12px] h-[12px]"
                  alt=""
                />
                <span className="font-500 _tf[14]">热</span>
              </h3>
              <div className={styles.championList}>{hotChampionList.map(renderChampionItem)}</div>
            </section>
          )}
          {championLetterGroups.length > 0 && (
            <section className={styles.allSection}>
              <div className={styles.sectionTitle}>全部联赛 A-Z</div>
              {championLetterGroups.map((group) => (
                <section
                  key={group.letter}
                  ref={(node) => {
                    letterRefs.current[group.letter] = node;
                  }}
                  className={styles.letterGroup}
                >
                  <h3 className="_tf[14]">{group.letter}</h3>
                  <div className={styles.championList}>{group.list.map(renderChampionItem)}</div>
                </section>
              ))}
            </section>
          )}
        </div>

        {championLetterGroups.length > 0 && (
          <nav className={styles.letterIndex} aria-label="联赛字母索引">
            {championLetterGroups.map((group) => (
              <button
                key={group.letter}
                type="button"
                onClick={() => handleLetterChange(group.letter)}
              >
                {group.letter}
              </button>
            ))}
          </nav>
        )}
      </div>

      <ul className={styles.mainListPC}>
        {allMainListData?.map((item: MatchBaseInfo) => {
          const isExpand = expandList.includes(item.matchId);
          const height = isExpand ? getHeightByMatch(item) : 0;

          return (
            <li key={item.matchId} className={styles.championItem}>
              <div
                className={clsx(styles.championItemHeader, isExpand ? styles.isExpand : '')}
                onClick={() => {
                  toggleExpand(item.matchId);
                }}
              >
                <span className="_tf[14]">{item.leagueName}</span>
                <div className={styles.right}>
                  <span className="_tf[14] din-pro">{item.matchNum}</span>
                  <Icon
                    className={styles.icon}
                    src="/images/common/arrow_sports.svg"
                    size="12px"
                    color="var(--Text-800)"
                  />
                </div>
              </div>
              <div className={styles.championItemContent} style={{ height: height + 'px' }}>
                {item?.children.map((market) => {
                  return (
                    <div className={styles.championMarketItem} key={market.name}>
                      <div className={`${styles.marketHeader} _tf[14]`}>{market.name}</div>

                      <div className={styles.marketList}>
                        {market.children.map((betTypeItem) => {
                          const lists = betTypeItem.lists;
                          if (lists && lists.length > 0) {
                            const betItem = lists[0];
                            return (
                              <div
                                className={styles.betItem}
                                key={betItem?.betItemId}
                                onClick={() => (betItem?.betItemId ? onBet(item, betItem) : null)}
                              >
                                <div className={styles.teamInfo}>
                                  <LazyImage
                                    className={styles.teamIcon}
                                    src={betItem?.teamIcon ?? ''}
                                    alt="icon"
                                    fallback={'/images/common/logo_small.png'}
                                  />
                                  <span className="_tf[14]">{betItem?.betItemShortName}</span>
                                </div>
                                <div className={`${styles.oddsText} _tf[14]`}>
                                  {betItem?.baseOdds}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default MainChampionList;
