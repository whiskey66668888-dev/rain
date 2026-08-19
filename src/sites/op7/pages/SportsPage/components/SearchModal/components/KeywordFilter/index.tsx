import type { FC, MutableRefObject } from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LeagueItem } from '@/apis/fbSports/common/types';
import { MatchBaseInfo } from '@/apis/commonSports/types';
import { EVenue, HotSportId, LotterySportId } from '@/apis/commonSports/constants';
import { useVenueService } from '@/apis/commonSports';
import Empty from '@/common/components/Empty';
import Icon from '@/common/components/Icon';
import Timing from '@/common/components/Timing';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { OBSportIdValue } from '@/apis/obSports/common/constants';
import Input from '@/common/components/SearchInput';
import HistoryList from './components/historyList';
import HotList from './components/hotList';
import { useAppSelector } from '@/core/store/hooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';

import { useLocalHistoryList, getFBMatchByRecommendReq } from '@/apis/fbSports/getLeagues';
import { filterMatchesByKeyword, getOBMatchByRecommendReq } from '@/apis/obSports/getSearch';
import { getListByMidsReq } from '@/apis/obSports/getList';
import { getListReq as getFBListReq } from '@/apis/fbSports/getList';

import styles from './index.module.scss';

interface KeywordFilterProps {
  imperativeSearchRef?: MutableRefObject<{ triggerSearch?: () => void }>;
  /** 搜索 Tab 输入框（SearchModal 升层，切换 Tab 卸载后仍可还原） */
  searchKeyword: string;
  onSearchKeywordChange: (value: string) => void;
  sportId: number;
  onChangeSport: (val: number) => void;
  /** 选中热门联赛：同步关键词 + 联赛筛选并关闭弹窗（对齐 Flutter onSelect） */
  onLeagueFilter: (sportId: number, leagueIds: Array<number | string>, searchText?: string) => void;
  /** 搜索框为空点「搜索」：清空列表筛选条件并关弹窗 */
  onClearFilterAndClose?: () => void;
}

const KeywordFilter: FC<KeywordFilterProps> = ({
  imperativeSearchRef,
  searchKeyword,
  onSearchKeywordChange,
  sportId,
  onChangeSport,
  onLeagueFilter,
  onClearFilterAndClose,
}) => {
  const navigate = useNavigateWithLanguage();
  const venue = useAppSelector((state) => state.sport.venue);
  const isOb = venue === EVenue.OB;
  const { useGetHotLeagueList } = useVenueService();
  const { playTypeId, playType, hasHotList } = useAppSelector(
    (state) => state.sport.mainList.settings,
  );
  const menus = useAppSelector((state) => state.sport.mainList.datas.menuInfo.menus);
  const [keywordList, setKeywordList] = useLocalHistoryList();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [matchList, setMatchList] = useState<MatchBaseInfo[]>([]);
  const [hotSearchList, setHotRearchList] = useState<LeagueItem[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  /** 防切 Tab 后旧请求回写（对齐 Flutter ballId 竞态校验） */
  const searchSeqRef = useRef(0);

  const isHotSport = useMemo(() => sportId === HotSportId, [sportId]);
  const menuList = useMemo(() => {
    if (hasHotList) {
      return menus[playType] || [];
    } else {
      // 固定获取热门赛事列表，如果没有一条数据就不展示热门
      return menus[playType]?.filter((item) => item.sportId !== HotSportId) || [];
    }
  }, [menus, playType, hasHotList]);

  /**
   * 热门联赛：对齐 Flutter search_new 父级始终拉足篮热门
   * - FB：sportIds = FB 足篮 id
   * - OB：sportIds = OB csid，hook 内 resolve 为 euid(menuId)
   */
  const hotLeagueParams = useMemo(() => {
    const type = playTypeId ?? 0;
    const football = isOb ? OBSportIdValue.Football : FBSportIdValue.Football;
    const basketball = isOb ? OBSportIdValue.Basketball : FBSportIdValue.Basketball;
    return { type, sportIds: [football, basketball] };
  }, [playTypeId, isOb]);

  const { data: hotListRaw = [] } = useGetHotLeagueList(hotLeagueParams);

  /** 展示用热门：热门 Tab 取前 10；其它 Tab 按当前球种过滤后再取 10（Flutter hotLeagueList） */
  const hotList = useMemo(() => {
    if (isHotSport) return hotListRaw.slice(0, 10);
    return hotListRaw.filter((item) => item.sportId === sportId).slice(0, 10);
  }, [hotListRaw, isHotSport, sportId]);

  const saveNewKeyword = useCallback(
    (keyword: string) => {
      const keywordMax = 5;
      let nextList = [...keywordList];
      const index = nextList.indexOf(keyword);

      if (index > -1) {
        nextList = nextList.filter((text) => text !== keyword);
      } else if (nextList.length >= keywordMax) {
        nextList.pop();
      }

      setKeywordList([keyword, ...nextList]);
    },
    [keywordList, setKeywordList],
  );

  /** 竞彩：菜单已注入 matchIds，拉详情后本地过滤（对齐 Flutter getJCIdListReq 分支） */
  const searchLotteryMatches = useCallback(
    async (trimmed: string): Promise<MatchBaseInfo[]> => {
      const matchIds =
        menus[playType]?.find((item) => item.sportId === LotterySportId)?.matchIds ?? [];
      if (!matchIds.length) return [];

      if (isOb) {
        // OB by-mids 单次约 40 个
        const ids = matchIds.map(String);
        const chunkSize = 40;
        const pages: MatchBaseInfo[] = [];
        for (let i = 0; i < ids.length; i += chunkSize) {
          const res = await getListByMidsReq({ mids: ids.slice(i, i + chunkSize).join(',') });
          pages.push(...(res.data ?? []));
        }
        return filterMatchesByKeyword(pages, trimmed);
      }

      // FB getList size 上限 50
      const ids = matchIds.filter((id) => id);
      const chunkSize = 50;
      const pages: MatchBaseInfo[] = [];
      for (let i = 0; i < ids.length; i += chunkSize) {
        const res = await getFBListReq({
          matchIds: ids.slice(i, i + chunkSize),
          size: chunkSize,
          current: 1,
          orderBy: 1,
        });
        pages.push(...(res.data ?? []));
      }
      return filterMatchesByKeyword(pages, trimmed);
    },
    [menus, playType, isOb],
  );

  const onSearch = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setIsSearched(false);
        setMatchList([]);
        setHotRearchList([]);
        return;
      }

      // 热门 Tab：本地从完整 hotList 模糊匹配，不走接口
      if (isHotSport) {
        const hotResult = hotListRaw.filter((item) =>
          item.name.toLowerCase().includes(trimmed.toLowerCase()),
        );
        setHotRearchList(hotResult);
        setIsSearched(true);
        saveNewKeyword(trimmed);
        return;
      }

      const requestSportId = sportId;
      const seq = ++searchSeqRef.current;
      setIsLoading(true);

      const run = async (): Promise<MatchBaseInfo[]> => {
        if (requestSportId === LotterySportId) {
          return searchLotteryMatches(trimmed);
        }
        if (isOb) {
          const res = await getOBMatchByRecommendReq({
            keyword: trimmed,
            searchSportType: requestSportId,
          });
          return res.data || [];
        }
        const res = await getFBMatchByRecommendReq({
          recommend: trimmed,
          sportId: requestSportId,
        });
        return res.data || [];
      };

      run()
        .then((list) => {
          if (searchSeqRef.current !== seq) return;
          setMatchList(list);
        })
        .catch(() => {
          if (searchSeqRef.current !== seq) return;
          setMatchList([]);
        })
        .finally(() => {
          if (searchSeqRef.current !== seq) return;
          setIsSearched(true);
          setIsLoading(false);
          saveNewKeyword(trimmed);
        });
    },
    [hotListRaw, isHotSport, isOb, saveNewKeyword, searchLotteryMatches, sportId],
  );

  const triggerSearch = useCallback(() => {
    if (isLoading) return;
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      onClearFilterAndClose?.();
      return;
    }
    onSearch(trimmed);
  }, [isLoading, searchKeyword, onSearch, onClearFilterAndClose]);

  useLayoutEffect(() => {
    if (!imperativeSearchRef) return;
    const api = imperativeSearchRef.current;
    api.triggerSearch = triggerSearch;
    return () => {
      delete api.triggerSearch;
    };
  }, [imperativeSearchRef, triggerSearch]);

  const onChangeTab = (nextSportId: number, index: number) => {
    // 切换球种使进行中请求失效；保留输入文案、清空结果（对齐 Flutter onChangeTab）
    searchSeqRef.current += 1;
    setIsSearched(false);
    setIsLoading(false);
    setMatchList([]);
    setHotRearchList([]);
    onChangeSport(nextSportId);

    if (!scrollRef.current) return;

    const item = scrollRef.current.children[index] as HTMLElement;
    const itemOffset = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const containerWidth = scrollRef.current.offsetWidth;
    const scrollTo = itemOffset - (containerWidth - itemWidth) / 2;

    scrollRef.current.scrollTo({
      left: scrollTo,
      behavior: 'smooth',
    });
  };

  const onClickHistoty = (text: string) => {
    onSearchKeywordChange(text);
    onSearch(text);
  };

  const onClickHotItem = (item: LeagueItem) => {
    saveNewKeyword(item.name);
    onLeagueFilter(item.sportId, [item.id], item.name);
  };

  const toSportDetail = (match: MatchBaseInfo) => {
    navigate(generatePath(PATHS.sportsDetail, { matchId: String(match.matchId) }));
  };

  const renderContent = () => {
    if (!isSearched) return null;

    if (isHotSport) {
      if (hotSearchList.length === 0) {
        return (
          <div className={styles.emptyWrapper}>
            <Empty type="search" variant="card" />
          </div>
        );
      }

      // 对齐 Flutter：热门搜索结果点选 = 联赛筛选回主列表（onSelect）
      return hotSearchList.map((obj) => (
        <div className={styles.leagueItem} key={obj.id} onClick={() => onClickHotItem(obj)}>
          <img className={styles.leagueIcon} src={obj.icon || undefined} alt="" />
          <span className={styles.leagueName}>{obj.name}</span>
        </div>
      ));
    }

    if (isLoading) {
      return null;
    }

    if (matchList.length === 0) {
      return (
        <div className={styles.emptyWrapper}>
          <Empty type="search" variant="card" />
        </div>
      );
    }
    return matchList.map((match) => (
      <div key={match.matchId} className={styles.matchItem} onClick={() => toSportDetail(match)}>
        <div className={styles.leagueInfo}>
          <div>{match.leagueName}</div>
          <div className={styles.matchMeta}>
            {match.isLive ? (
              <>
                <span>{match.periodName}</span>
                {match.matchTime !== 0 && (
                  <Timing
                    className="w-32px"
                    time={match.matchTime}
                    running={match.isCountdown}
                    isCountdown={match.clockType === 'DESC'}
                  />
                )}
              </>
            ) : (
              match.matchDate
            )}
          </div>
        </div>
        <div className={styles.teamInfo}>
          <div className={styles.teamName}>{`${match.homeName} VS ${match.awayName}`}</div>
          <Icon
            className={styles.iconRight}
            src="/images/common/arrow_down.svg"
            size="12px"
            color="var(--Text-800)"
          />
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.keywordFilter}>
      <div className={styles.inputWrapper}>
        <Input
          type="text"
          className={styles.searchInput}
          inputClassName={styles.searchInputElement}
          iconSize="16px"
          iconColor="var(--Text-700)"
          placeholder="请输入联赛名或地区名"
          value={searchKeyword}
          onChange={(value: string) => onSearchKeywordChange(value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              triggerSearch();
            }
          }}
        />
      </div>
      <div className={styles.tabList} ref={scrollRef}>
        {menuList.map((obj, index) => (
          <span
            key={obj.sportId}
            className={`${styles.tabItem} ${sportId === obj.sportId ? styles.active : ''}`}
            onClick={() => onChangeTab(obj.sportId, index)}
          >
            {obj.name}
          </span>
        ))}
      </div>
      <div className={styles.scrollWrapper}>
        {renderContent()}
        <HistoryList list={keywordList} setList={setKeywordList} onClick={onClickHistoty} />
        <HotList list={hotList} onClick={onClickHotItem} />
      </div>
    </div>
  );
};

KeywordFilter.displayName = 'KeywordFilter';

export default KeywordFilter;
