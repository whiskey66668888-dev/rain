import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Empty from '@/common/components/Empty';
import Icon from '@/common/components/Icon';
import SearchInput from '@/common/components/SearchInput';
import styles from './index.module.scss';
import { useHomeList, type MergedBaseList } from '@/common/hooks/useHomeList';
import { HomeListId, TRY_PLAY_VENUE_ID } from '@/utils/constants/entertainment';
import { gameFilterListReq, TGameList, useWebsiteSlotTop10Query } from '@/apis/origin/gamePlay';
import LazyImage from '@/common/components/LazyImage';
import { useAppSelector } from '@/core/store/hooks';
import { ThemeMode } from '@/core/store/slices/configSlice';
import { SLOT_SEARCH_HISTORY_KEY } from '@/utils/constants/cacheKey';
import { useMemoizedFn } from 'ahooks';
import GameList from '../GameList';

type SearchHistoryItem = Record<string, string[]>;

// 读取当前 gameId 的搜索历史（value 为 string[]）
function readKeywordListByGameId(gameId: number): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SLOT_SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;

    // 兼容旧结构：直接存的是 string[]
    if (Array.isArray(parsed)) return parsed as string[];

    if (parsed && typeof parsed === 'object') {
      const dict = parsed as SearchHistoryItem;
      return dict[String(gameId)] ?? [];
    }
  } catch {}
  return [];
}

// 写入当前 gameId 的搜索历史
function writeKeywordListByGameId(gameId: number, nextList: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(SLOT_SEARCH_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};

    const dict: SearchHistoryItem = Array.isArray(parsed)
      ? {}
      : parsed && typeof parsed === 'object'
        ? (parsed as SearchHistoryItem)
        : {};

    dict[String(gameId)] = nextList;
    window.localStorage.setItem(SLOT_SEARCH_HISTORY_KEY, JSON.stringify(dict));
  } catch {}
}

export type KeywordFilterHandle = {
  /** 外部（SearchModal）触发：用当前输入框内容执行一次搜索 */
  triggerSearch: () => void;
};

type KeywordFilterProps = { defaultHomeGameId: number };

const KeywordFilter = forwardRef<KeywordFilterHandle, KeywordFilterProps>(
  ({ defaultHomeGameId }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSearched, setIsSearched] = useState(false);
    const [gameList, setGameList] = useState<TGameList[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number>(defaultHomeGameId);
    const { homeList } = useHomeList();

    const [keywordList, setKeywordList] = useState<string[]>(() =>
      readKeywordListByGameId(defaultHomeGameId),
    );

    // 切换 tab 后，重新从 localStorage 读取对应 gameId 的搜索历史
    useEffect(() => {
      setKeywordList(readKeywordListByGameId(currentGameId));
    }, [currentGameId]);

    const updateKeywordListForCurrentGameId = (nextList: string[]) => {
      setKeywordList(nextList);
      writeKeywordListByGameId(currentGameId, nextList);
    };
    const themeMode = useAppSelector((state) => state.config.system.themeMode) ?? 'light';
    const theme = useMemo<ThemeMode>(() => {
      if (themeMode !== 'system') return themeMode;
      if (typeof document === 'undefined') return 'light';
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }, [themeMode]);

    /** 电子游戏分类下的所有子菜单（PG SOFT、DAYUN SOFT 等） */
    const slotMenuList = useMemo(() => {
      const slotsCategory = homeList.find(
        (item: MergedBaseList) => Number(item.homeId) === Number(HomeListId.SLOTS),
      );
      return slotsCategory?.children ?? [];
    }, [homeList]);
    const [baseParams, setBaseParams] = useState<{ gameType: string; gameId: number }>(() => {
      return {
        gameType: slotMenuList.find((item) => item.gameId === currentGameId)?.gameType ?? '',
        gameId: currentGameId,
      };
    });

    // 创建一个ref来访问滚动容器
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const [searchText, setSearchText] = useState('');

    const { data: hotList } = useWebsiteSlotTop10Query(baseParams);

    const onSearch = useMemoizedFn((text: string) => {
      // 关键字为空不搜索
      if (!text) return;
      setIsLoading(true);
      setIsSearched(true);
      updateKeywordListForCurrentGameId(_.uniq([text, ...keywordList]));
      gameFilterListReq({ likeGameName: text, gameId: currentGameId })
        .then((res) => {
          const normalizedGameList = (res.data?.gameList ?? []).map((item) => {
            return {
              ...item,
              // 搜索是“当前场馆内搜索”，转账 id 强制对齐当前场馆
              transferId: currentGameId,
            };
          });
          setGameList(normalizedGameList);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    useImperativeHandle(
      ref,
      () => ({
        triggerSearch: () => onSearch(searchText),
      }),
      [onSearch, searchText],
    );

    const onChangeTab = (gameId: number, index: number) => {
      setSearchText('');
      setIsSearched(false);
      setGameList([]);
      setBaseParams({
        gameType: slotMenuList.find((item) => item.gameId === gameId)?.gameType ?? '',
        gameId: gameId,
      });
      setCurrentGameId(gameId);
      if (scrollRef.current) {
        const item = scrollRef.current.children[index] as HTMLElement;
        // 获取该项的偏移位置
        const itemOffset = item.offsetLeft;
        const itemWidth = item.offsetWidth;
        const containerWidth = scrollRef.current.offsetWidth;

        // 计算滚动到中间的偏移量
        const scrollTo = itemOffset - (containerWidth - itemWidth) / 2;

        scrollRef.current.scrollTo({
          left: scrollTo,
          behavior: 'smooth', // 平滑滚动
        });
      }
    };

    const onClickHistoty = (text: string) => {
      setSearchText(text);
      onSearch(text);
    };
    const onClear = () => {
      updateKeywordListForCurrentGameId([]);
    };

    const onDelete = (text: string) => {
      const newList = keywordList.filter((item) => item !== text);
      updateKeywordListForCurrentGameId(newList);
    };

    const onClickHotItem = (item: TGameList) => {
      setSearchText(item.name);
      onSearch(item.name);
    };

    const renderContent = () => {
      if (!isSearched) return null;

      if (gameList.length == 0 && !isLoading)
        return (
          <div className={styles.emptyWrapper}>
            <Empty type="search" variant="card" />
          </div>
        );

      return (
        <GameList
          data={gameList}
          isLoading={isLoading}
          isTryPlay={currentGameId === TRY_PLAY_VENUE_ID}
        />
      );
    };

    return (
      <div className={styles.keywordFilter}>
        <div className={styles.inputWrapper}>
          <div className={styles.input}>
            <SearchInput
              type="text"
              placeholder="请输入游戏名称"
              value={searchText}
              onFocus={() => {
                setIsSearched(false);
              }}
              onChange={(value: string) => setSearchText(value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  onSearch(searchText);
                }
              }}
            />
          </div>
        </div>
        <div className={styles.tabList} ref={scrollRef}>
          {slotMenuList.map((obj, index) => (
            <span
              key={obj.gameId}
              className={`${styles.tabItem} ${currentGameId === obj.gameId ? styles.active : ''}`}
              onClick={() => onChangeTab(obj.gameId, index)}
            >
              {obj.name}
            </span>
          ))}
        </div>
        <div className={styles.scrollWrapper}>
          {renderContent()}
          {!isSearched && (
            <>
              {keywordList.length > 0 && (
                <div className={styles.historyWapper}>
                  <div className={styles.title}>
                    <span>搜索历史</span>
                    <span className={styles.clear} onClick={onClear}>
                      清空
                    </span>
                  </div>
                  <div className={styles.list}>
                    {keywordList.map((item, index) => (
                      <div className={styles.item} key={index}>
                        <div className={styles.left} onClick={() => onClickHistoty(item)}>
                          <Icon src="/images/common/time.svg" size="14px" color="var(--Text-800)" />
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.clearButton}
                          onClick={() => onDelete(item)}
                          aria-label="清除"
                        >
                          <LazyImage
                            lazy={false}
                            src={`/images/${theme}/bn_close.svg`}
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hotList?.gameList && hotList?.gameList.length > 0 && (
                <div className={styles.hotWrapper}>
                  <div className={styles.title}>热门搜索</div>
                  <div className={styles.list}>
                    {hotList?.gameList.slice(0, 10).map((item, index) => (
                      <div
                        key={item.id}
                        className={styles.item}
                        onClick={() => onClickHotItem(item)}
                      >
                        <span>{index + 1}</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

export default KeywordFilter;
