/**
 * 专业版赔率：根据 OddsMap 展示玩法，匹配到接口 scoreId 则渲染该 score 的 list（赔率项），能一页显示完则单页，否则按 maxRows 分页（Swiper）
 * OB：当前页含半场等「详情列」时才懒加载+5s 轮询；离开该页 / 卸载 / 切赛事则停轮询
 * FB：不走详情懒加载 / 轮询，分页与原先一致
 */

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import type { TBaseBetItem, MatchMarket } from '@/apis/commonSports/types';
import styles from './OddListPro.module.scss';
import 'swiper/css';
import 'swiper/css/pagination';
import { OddBtn } from './OddBtn';
import { EFbPeriod } from '@/apis/fbSports/common/constants/period';
import { EOddsStatus, EVenue } from '@/apis/commonSports/constants';
import { findVenueCompetition, type VenueHandicapItem } from '@/apis/commonSports/venueCompetition';
import { OBSportIdValue } from '@/apis/obSports/common/constants';
import { fetchOBListDetailMarkets } from '@/apis/obSports/getMatchOddsInfo';
import LazyImage from '@/common/components/LazyImage';
import { useAllBetItemIds } from '@/common/hooks/bet/useAllBetItemIds';
import { useAppSelector } from '@/core/store/hooks';
import { selectIsMobile } from '@/core/store/selectors/configSelectors';
import { selectSportVenue } from '@/core/store/selectors/sportSelectors';

/** 对齐 Flutter ProOddsBlueSlider 详情轮询间隔 */
const OB_DETAIL_POLL_MS = 5000;

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0 || !arr.length) return arr.length ? [arr] : [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function marketHasOpenOdds(market?: MatchMarket): boolean {
  const lists = market?.children?.[0]?.lists ?? [];
  return lists.some((o) => !!o?.baseOdds && o.oddsStatus === EOddsStatus.Open);
}

/** itemType 主键：hpid 或 hpid_period 的前半段 */
function marketTypeKey(itemType: string) {
  return itemType.split('_')[0] ?? itemType;
}

function findMarketByCode(
  markets: MatchMarket[],
  id: string | number,
  period: number,
): MatchMarket | undefined {
  const idStr = String(id);
  return markets.find((item) => {
    const [type, pe] = item.itemType.split('_');
    return type === idStr && (!period || Number(pe) === period);
  });
}

/** 列表盘口 + 详情盘口按 itemType 合并（详情有开盘数据时覆盖）——仅 OB 使用 */
function mergeMatchMarkets(
  listMarkets: MatchMarket[],
  detailMarkets: MatchMarket[],
): MatchMarket[] {
  const map = new Map<string, MatchMarket>();
  for (const m of listMarkets) {
    map.set(marketTypeKey(m.itemType), m);
  }
  for (const d of detailMarkets) {
    const key = marketTypeKey(d.itemType);
    if (marketHasOpenOdds(d) || !map.has(key)) {
      map.set(key, d);
    }
  }
  return Array.from(map.values());
}

function isObDetailOnlyCol(item: VenueHandicapItem, sportId?: number) {
  const name = String(item.name);
  if (sportId === OBSportIdValue.Football) return name.startsWith('半场');
  if (sportId === OBSportIdValue.Tennis) return name === '让局' || name === '局大小';
  return false;
}

/**
 * OB 足球/网球：列表玩法与详情玩法分页隔离，详情列永远不进第 0 页
 * （对齐 Flutter：page0=列表，page1+=规则/详情页）
 */
function buildObDetailSplitPages(
  allOdds: VenueHandicapItem[],
  colsPerPage: number,
  sportId?: number,
): VenueHandicapItem[][] {
  const listCols: VenueHandicapItem[] = [];
  const detailCols: VenueHandicapItem[] = [];
  for (const item of allOdds) {
    if (item.name === '占位') {
      listCols.push(item);
    } else if (isObDetailOnlyCol(item, sportId)) {
      detailCols.push(item);
    } else {
      listCols.push(item);
    }
  }
  const listPages = listCols.length ? chunk(listCols, colsPerPage) : [];
  const detailPages = detailCols.length ? chunk(detailCols, colsPerPage) : [];
  return [...listPages, ...detailPages];
}

export interface ProOddListProps {
  matchId: string | number;
  sportId?: number;
  /** 每页最多展示的列数（md=2，lg=4，xl+=8） */
  maxRows?: number;
  periodName?: string;
  matchMarket: MatchMarket[];
  isEnded: boolean;
  threeLineColumn?: boolean;
  onToggleOdds: (betItem: TBaseBetItem) => void;
  /** 可选的过滤市场类型列表，只显示这些类型的玩法 */
  filterMarketTypes?: number[];
}

const ProOddList: React.FC<ProOddListProps> = ({
  matchId,
  sportId,
  maxRows = 2,
  matchMarket,
  periodName,
  isEnded,
  threeLineColumn,
  onToggleOdds,
  filterMarketTypes,
}) => {
  const isMobile = useAppSelector(selectIsMobile);
  const venue = useAppSelector(selectSportVenue);
  const allBetItemIds = useAllBetItemIds(matchId);
  const swiperRef = useRef<SwiperRef>(null);
  const [nav, setNav] = useState({ canGoPrev: false, canGoNext: false });
  const [activePage, setActivePage] = useState(0);
  const [detailMarkets, setDetailMarkets] = useState<MatchMarket[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailLoadedRef = useRef(false);
  const detailPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detailFetchInflightRef = useRef(false);
  const mountedRef = useRef(true);
  const colsPerPage = Math.max(1, maxRows ?? 2);

  /** 仅 OB 足球/网球需要详情补盘（对齐 Flutter _needDetail）；FB 恒为 false */
  const needObDetail =
    venue === EVenue.OB &&
    (sportId === OBSportIdValue.Football || sportId === OBSportIdValue.Tennis);

  const stopDetailPoll = useCallback(() => {
    if (detailPollTimerRef.current) {
      clearInterval(detailPollTimerRef.current);
      detailPollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopDetailPoll();
    };
  }, [stopDetailPoll]);

  // 切赛事 / 场馆：停轮询并重置（FB 下仅清空本地 OB 状态，不发请求）
  useEffect(() => {
    stopDetailPoll();
    setDetailMarkets(null);
    setDetailLoading(false);
    detailLoadedRef.current = false;
    detailFetchInflightRef.current = false;
    setActivePage(0);
  }, [matchId, sportId, venue, stopDetailPoll]);

  const syncNav = useCallback((swiper: { isBeginning: boolean; isEnd: boolean }) => {
    setNav({ canGoPrev: !swiper.isBeginning, canGoNext: !swiper.isEnd });
  }, []);

  const mergedMarkets = useMemo(() => {
    if (!needObDetail || !detailMarkets?.length) return matchMarket;
    return mergeMatchMarkets(matchMarket, detailMarkets);
  }, [needObDetail, matchMarket, detailMarkets]);

  /** 按当前能显示的总数分页 */
  const pages = useMemo(() => {
    let allOdds = [...(findVenueCompetition(venue, sportId)?.list ?? [])];
    if (!allOdds.length) return [];
    // 下半场不展示半场盘口（对齐 Flutter odds_blue_slider _footballRulesFiltered）
    if (periodName === '下半场') {
      if (venue === EVenue.FB && sportId === FBSportIdValue.Football) {
        allOdds = allOdds.filter((item) => item.period !== EFbPeriod.soccerFirstHalf);
      } else if (venue === EVenue.OB && sportId === OBSportIdValue.Football) {
        allOdds = allOdds.filter((item) => !isObDetailOnlyCol(item, sportId));
      }
    }
    if (allOdds.length === 3 && isMobile) {
      allOdds.push({ name: '占位', idList: [99999], period: EFbPeriod.basketballFullTime });
    }
    if (filterMarketTypes && filterMarketTypes.length > 0) {
      const filterSet = new Set(filterMarketTypes.map(String));
      allOdds = allOdds.filter((item) => {
        const marketTypeId = item.idList[0];
        return marketTypeId != null && filterSet.has(String(marketTypeId));
      });
    }
    // OB 足球/网球：详情玩法与列表玩法分页隔离（FB / 其他球种保持原 chunk）
    if (
      needObDetail &&
      (sportId === OBSportIdValue.Football || sportId === OBSportIdValue.Tennis)
    ) {
      return buildObDetailSplitPages(allOdds, colsPerPage, sportId);
    }
    if (allOdds.length <= colsPerPage) return [allOdds];
    return chunk(allOdds, colsPerPage);
  }, [venue, sportId, periodName, isMobile, filterMarketTypes, colsPerPage, needObDetail]);

  /** 仅用列表 matchMarket 判断缺数（未合并详情），避免合并后误判 */
  const pageLacksListOdds = useCallback(
    (page: VenueHandicapItem[]) =>
      page.some((item) => {
        if (item.name === '占位') return false;
        const market = findMarketByCode(matchMarket, item.idList[0] ?? 0, item.period ?? 0);
        return !marketHasOpenOdds(market);
      }),
    [matchMarket],
  );

  /** 当前页是否含需详情补盘的列（足球半场* / 网球让局·局大小） */
  const pageNeedsDetailFetch = useCallback(
    (page: VenueHandicapItem[] | undefined) => {
      if (!page?.length) return false;
      if (sportId === OBSportIdValue.Football || sportId === OBSportIdValue.Tennis) {
        return page.some((item) => isObDetailOnlyCol(item, sportId));
      }
      if (sportId == null) return false;
      return pageLacksListOdds(page);
    },
    [sportId, pageLacksListOdds],
  );

  const loadObDetail = useCallback(
    async (opts?: { force?: boolean; showLoading?: boolean }) => {
      if (!needObDetail || sportId == null) return;
      if (detailFetchInflightRef.current) return;
      const showLoading = opts?.showLoading ?? false;
      const force = opts?.force ?? false;
      detailFetchInflightRef.current = true;
      if (showLoading) setDetailLoading(true);
      try {
        const markets = await fetchOBListDetailMarkets({ matchId, sportId, force });
        if (!mountedRef.current) return;
        // 空结果保留上次有效数据（对齐 Flutter keep last）
        if (markets.length) {
          setDetailMarkets(markets);
        }
      } catch {
        // 失败也标记完成，避免滑页死循环重试（对齐 Flutter firstDetailDone）
      } finally {
        detailLoadedRef.current = true;
        detailFetchInflightRef.current = false;
        if (showLoading && mountedRef.current) setDetailLoading(false);
      }
    },
    [needObDetail, sportId, matchId],
  );

  /** 停在需详情补盘的页才请求/轮询（按玩法列判断，不按页码）；FB 下恒 false */
  const shouldPollDetail = useMemo(
    () => needObDetail && !isEnded && pageNeedsDetailFetch(pages[activePage]),
    [needObDetail, isEnded, pageNeedsDetailFetch, pages, activePage],
  );

  // 进入半场等详情页：首拉 + 5s 轮询；离开 / 卸载 / 切走 → 停轮询（仅 OB）
  useEffect(() => {
    if (!shouldPollDetail) {
      stopDetailPoll();
      return;
    }

    void loadObDetail({
      force: detailLoadedRef.current,
      showLoading: !detailLoadedRef.current,
    });

    stopDetailPoll();
    detailPollTimerRef.current = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void loadObDetail({ force: true, showLoading: false });
    }, OB_DETAIL_POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') return;
      void loadObDetail({ force: true, showLoading: false });
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopDetailPoll();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [shouldPollDetail, loadObDetail, stopDetailPoll]);

  const getOddsByCode = useCallback(
    (id: string | number, period: number): MatchMarket | undefined =>
      findMarketByCode(mergedMarkets, id, period),
    [mergedMarkets],
  );

  /** OB 详情首拉中：空位显示小 loading（FB 下 needObDetail=false，恒不展示） */
  const showSlotLoading =
    needObDetail && detailLoading && !detailLoadedRef.current && shouldPollDetail;

  const renderRow = (item: VenueHandicapItem, index: number) => {
    const odds = getOddsByCode(item.idList[0] ?? 0, item.period ?? 0);
    const title = item.name;
    const list = odds?.children[0]?.lists ?? [];
    const rowCount = item.row ?? 2;
    return (
      <div className={styles.row} key={`${item.idList[0]}-${index}`}>
        <div className={clsx(styles.title, title === '占位' && 'opacity-0')}>{title}</div>
        <div className={styles.oddBtns}>
          {list.length > 0
            ? list.map((o, idx) => {
                const isEmptySlot = !o?.baseOdds || o.oddsStatus !== EOddsStatus.Open;
                const isLocked = !o || isEmptySlot || isEnded;
                const isActive = allBetItemIds.includes(o.betItemId);
                return (
                  <OddBtn
                    key={o.betItemId ?? idx}
                    betItem={o}
                    isLocked={isLocked}
                    isLoading={showSlotLoading && isEmptySlot && !isEnded}
                    threeLine={item.row === 3}
                    threeLineColumn={threeLineColumn}
                    onClick={onToggleOdds}
                    active={isActive}
                  />
                );
              })
            : Array.from({ length: rowCount }, (_, idx) => (
                <OddBtn
                  key={idx}
                  isLocked={isEnded || !showSlotLoading}
                  isLoading={showSlotLoading && !isEnded}
                />
              ))}
        </div>
      </div>
    );
  };

  const renderPage = (odds: VenueHandicapItem[]) => (
    <div className={styles.pageBlock}>{odds.map((item, index) => renderRow(item, index))}</div>
  );

  if (!pages.length) return null;

  const useSwiper = pages.length > 1;
  return (
    <div className={clsx(styles.wrap, '_tf[12]')}>
      {useSwiper ? (
        <div className={styles.swiperContainer}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className={styles.swiper}
            ref={swiperRef}
            onSwiper={(swiper) => {
              syncNav(swiper);
              setActivePage(swiper.activeIndex);
            }}
            onSlideChange={(swiper) => {
              syncNav(swiper);
              setActivePage(swiper.activeIndex);
            }}
          >
            {pages.map((page, i) => (
              <SwiperSlide key={i}>{renderPage(page)}</SwiperSlide>
            ))}
          </Swiper>
          {nav.canGoPrev && (
            <LazyImage
              src={'/images/common/arrows.png'}
              className={styles.swiperPrev}
              lazy={false}
              width={16}
              height={16}
              onClick={() => swiperRef.current?.swiper?.slidePrev()}
            />
          )}
          {nav.canGoNext && (
            <LazyImage
              src={'/images/common/arrows.png'}
              className={styles.swiperNext}
              lazy={false}
              width={16}
              height={16}
              onClick={() => swiperRef.current?.swiper?.slideNext()}
            />
          )}
        </div>
      ) : (
        renderPage(pages[0] ?? [])
      )}
    </div>
  );
};

export default React.memo(ProOddList);
