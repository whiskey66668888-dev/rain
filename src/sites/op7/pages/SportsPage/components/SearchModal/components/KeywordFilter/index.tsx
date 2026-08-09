import type { FC, MutableRefObject } from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LeagueItem } from '@/apis/fbSports/common/types';
import { MatchBaseInfo } from '@/apis/commonSports/types';
import { HotSportId, LotterySportId } from '@/apis/commonSports/constants';
import Empty from '@/common/components/Empty';
import Icon from '@/common/components/Icon';
import Timing from '@/common/components/Timing';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import Input from '@/common/components/SearchInput';
import HistoryList from './components/historyList';
import HotList from './components/hotList';
import { useAppSelector } from '@/core/store/hooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';

import {
  useGetHotLeagueList,
  useLocalHistoryList,
  getFBMatchByRecommendReq,
} from '@/apis/fbSports/getLeagues';

import styles from './index.module.scss';

interface KeywordFilterProps {
  imperativeSearchRef?: MutableRefObject<{ triggerSearch?: () => void }>;
  /** 搜索 Tab 输入框（SearchModal 升层，切换 Tab 卸载后仍可还原） */
  searchKeyword: string;
  onSearchKeywordChange: (value: string) => void;
  sportId: number;
  onChangeSport: (val: number) => void;
  /** 选中热门联赛：同步关键词 + 联赛筛选并关闭弹窗（对齐 Flutter onSelect） */
  onLeagueFilter: (sportId: number, leagueIds: number[], searchText?: string) => void;
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

  const isHotSport = useMemo(() => sportId === HotSportId, [sportId]);
  const menuList = useMemo(() => {
    if (hasHotList) {
      return menus[playType] || [];
    } else {
      // 固定获取热门赛事列表，如果没有一条数据就不展示热门
      return menus[playType]?.filter((item) => item.sportId !== HotSportId) || [];
    }
  }, [menus, playType, hasHotList]);
  /** 热门联赛接口 sportIds：热门/竞彩拉足篮，其它 Tab 传当前赛种 */
  const hotLeagueParams = useMemo(() => {
    const type = playTypeId ?? 0;
    if (sportId === HotSportId || sportId === LotterySportId) {
      return {
        type,
        sportIds: [FBSportIdValue.Football, FBSportIdValue.Basketball],
      };
    }
    if (sportId > 0) {
      return { type, sportIds: [sportId] };
    }
    return {
      type,
      sportIds: [FBSportIdValue.Football, FBSportIdValue.Basketball],
    };
  }, [playTypeId, sportId]);

  const { data } = useGetHotLeagueList(hotLeagueParams);

  const hotList = useMemo<LeagueItem[]>(() => data ?? [], [data]);

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

  const onSearch = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setIsSearched(false);
        setMatchList([]);
        setHotRearchList([]);
        return;
      }

      if (isHotSport) {
        const hotResult = hotList.filter((item) =>
          item.name.toLowerCase().includes(trimmed.toLowerCase()),
        );
        setHotRearchList(hotResult);
        setIsSearched(true);
        saveNewKeyword(trimmed);
        return;
      }

      setIsLoading(true);
      getFBMatchByRecommendReq({
        recommend: trimmed,
        sportId,
      })
        .then((res) => {
          setMatchList(res.data || []);
        })
        .catch(() => {
          setMatchList([]);
        })
        .finally(() => {
          setIsSearched(true);
          setIsLoading(false);
          saveNewKeyword(trimmed);
        });
    },
    [hotList, isHotSport, saveNewKeyword, sportId],
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
    onSearchKeywordChange('');
    setIsSearched(false);
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

      return hotSearchList.map((obj) => (
        <div className={styles.leagueItem} key={obj.id} onClick={() => onClickHistoty(obj.name)}>
          <img className={styles.leagueIcon} src={obj.icon} />
          <span className={styles.leagueName}>{obj.name}</span>
        </div>
      ));
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
