import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import {
  getMarketOddsHistoryReq,
  type MarketOddsEntryItem,
  type MarketOddsHistoryItem,
  type MarketOddsMatchScope,
} from '@/apis/origin/discover';
import Overlay from '@/common/components/Overlay';
import Skeleton from '@/common/components/Skeleton';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

import type { OddCellData, OddsTabKey } from '../types';
import {
  calcMatchProgressMinutes,
  cellsFromHistoryItem,
  companyIdToApiPlatform,
  formatFootballMinute,
  formatHistoryTime,
  getHeaderTitles,
} from '../utils/historyLogic';
import styles from '../index.module.scss';

interface Props {
  visible: boolean;
  companyId: string | null;
  companyName?: string;
  matchId: string;
  matchTime?: string;
  sportId: number;
  tabKey: OddsTabKey;
  playType: number;
  matchDataScope: MarketOddsMatchScope;
  entryItem?: MarketOddsEntryItem | null;
  onClose: () => void;
  /** PC 端与父级同宽时的 Overlay body 定位 */
  bodyStyle?: React.CSSProperties;
}

const HistoryOddCell: React.FC<{ cell: OddCellData; forceBlack?: boolean }> = ({
  cell,
  forceBlack,
}) => {
  if (cell.locked) {
    return (
      <div className={styles.historyOdd}>
        <img
          src="/images/common/sportsDetails/indexOdds/index-lock.png.webp"
          alt=""
          className={styles.lockIcon}
        />
      </div>
    );
  }

  const colorClass = forceBlack
    ? styles.valueMain
    : cell.change === 2
      ? styles.valueRed
      : cell.change === 3
        ? styles.valueGreen
        : styles.valueMain;

  return <div className={clsx(styles.historyOdd, colorClass)}>{cell.text}</div>;
};

const IndexOddsHistorySheet: React.FC<Props> = ({
  visible,
  companyId,
  companyName,
  matchId,
  matchTime = '',
  sportId,
  tabKey,
  playType,
  matchDataScope,
  entryItem,
  onClose,
  bodyStyle,
}) => {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;

  const [list, setList] = useState<MarketOddsHistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isShowTime, setIsShowTime] = useState(false);
  const requestingRef = useRef(false);
  const atTopRef = useRef(true);

  const headers = useMemo(() => getHeaderTitles(sportId, tabKey), [sportId, tabKey]);
  const middleIsOdds = sportId === 1 && tabKey === 'standard';
  const isCorner = tabKey === 'corner';
  const apiPlatform = companyId ? companyIdToApiPlatform(companyId) : '';
  const resolvedMatchTime = matchTime || entryItem?.matchTime || '';

  const icons = {
    time: `/images/${theme}/sportsDetails/indexOdds/index-time.png.webp`,
    formatTime: `/images/${theme}/sportsDetails/indexOdds/index-format-time.png.webp`,
    timeSwitch: '/images/common/sportsDetails/indexOdds/time-switch.png.webp',
    score: `/images/${theme}/sportsDetails/indexOdds/${isCorner ? 'cornor' : 'index-score'}.png.webp`,
  };

  const loadFirstPage = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = !!options?.silent;
      if (!matchId || !apiPlatform || requestingRef.current) return;
      requestingRef.current = true;
      // 对齐 App showLoading:false：轮询/静默刷新不清空列表、不展示骨架，避免弹窗闪烁
      if (!silent) {
        setLoading(true);
        setIsShowTime(false);
      }
      setPage(0);
      setNoMore(false);
      try {
        const res = await getMarketOddsHistoryReq({
          matchId,
          platform: apiPlatform,
          matchDataScope,
          playType,
          page: 0,
        });
        if (!res) {
          // 请求失败时保留已有列表，避免只剩「初/赛前」空窗
          return;
        }
        setList(res.content);
        setNoMore(res.last || res.content.length === 0);
        setPage(res.number + 1);
      } finally {
        if (!silent) setLoading(false);
        requestingRef.current = false;
      }
    },
    [apiPlatform, matchDataScope, matchId, playType],
  );

  const loadMore = useCallback(async () => {
    if (!matchId || !apiPlatform || noMore || requestingRef.current) return;
    requestingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await getMarketOddsHistoryReq({
        matchId,
        platform: apiPlatform,
        matchDataScope,
        playType,
        page,
      });
      if (!res) return;
      if (res.content.length) {
        setList((prev) => [...prev, ...res.content]);
      }
      setNoMore(res.last || res.content.length === 0);
      setPage(res.number + 1);
    } finally {
      setLoadingMore(false);
      requestingRef.current = false;
    }
  }, [apiPlatform, matchDataScope, matchId, noMore, page, playType]);

  // 仅在打开弹窗 / 查询条件变化时全量加载；避免 list 轮询导致依赖抖动重载闪烁
  useEffect(() => {
    if (!visible) return;
    void loadFirstPage({ silent: false });
  }, [visible, matchId, apiPlatform, matchDataScope, playType]); // eslint-disable-line react-hooks/exhaustive-deps

  // 对齐 App：仅在列表顶部时静默定时刷新
  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => {
      if (!atTopRef.current || requestingRef.current) return;
      void loadFirstPage({ silent: true });
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [visible, loadFirstPage]);

  const hasLiveProgress = useMemo(
    () =>
      list.some((item) => {
        const minute = calcMatchProgressMinutes(item.recordTime, resolvedMatchTime);
        return minute != null && minute > 0;
      }),
    [list, resolvedMatchTime],
  );

  const fixedRows = useMemo(() => {
    const rows: Array<{ label: string; item: MarketOddsHistoryItem | null; isInitial: boolean }> =
      [];
    if (entryItem) {
      rows.push({
        label: '初',
        isInitial: true,
        item: entryItem.initialOdds
          ? {
              recordTime: entryItem.initialOdds.recordTime,
              platform: entryItem.platform,
              matchId: entryItem.matchId,
              marketStatus: entryItem.marketStatus,
              score: '',
              odds1: entryItem.initialOdds.odds1,
              odds2: entryItem.initialOdds.odds2,
              odds3: entryItem.initialOdds.odds3,
              oddsChange1: entryItem.initialOdds.oddsChange1,
              oddsChange2: entryItem.initialOdds.oddsChange2,
              oddsChange3: entryItem.initialOdds.oddsChange3,
            }
          : null,
      });
    }
    if (entryItem?.preMatchOdds) {
      rows.push({
        label: '赛前',
        isInitial: false,
        item: {
          recordTime: entryItem.preMatchOdds.recordTime,
          platform: entryItem.platform,
          matchId: entryItem.matchId,
          marketStatus: entryItem.marketStatus,
          score: '',
          odds1: entryItem.preMatchOdds.odds1,
          odds2: entryItem.preMatchOdds.odds2,
          odds3: entryItem.preMatchOdds.odds3,
          oddsChange1: entryItem.preMatchOdds.oddsChange1,
          oddsChange2: entryItem.preMatchOdds.oddsChange2,
          oddsChange3: entryItem.preMatchOdds.oddsChange3,
        },
      });
    }
    return rows;
  }, [entryItem]);

  if (!visible) return null;

  return (
    <Overlay show={visible} close={onClose} position="bottom" maskClickClose bodyStyle={bodyStyle}>
      <div className={styles.historySheet}>
        <div className={styles.historyHeader}>
          <div className={styles.editorTitle}>{companyName || '指数详情'}</div>
          <ModalCloseButton onClick={onClose} className={styles.historyClose} />
        </div>

        <div className={styles.historyTableHeader}>
          <button
            type="button"
            className={styles.timeToggle}
            onClick={() => hasLiveProgress && setIsShowTime((prev) => !prev)}
          >
            <img
              src={isShowTime ? icons.formatTime : icons.time}
              alt=""
              className={styles.headerIcon}
            />
            {hasLiveProgress ? (
              <img src={icons.timeSwitch} alt="" className={styles.timeSwitchIcon} />
            ) : null}
          </button>
          <div className={styles.historyHeaderCell}>
            <img src={icons.score} alt="" className={styles.headerIcon} />
          </div>
          {headers.map((title: string) => (
            <div key={title} className={styles.historyHeaderCell}>
              {title}
            </div>
          ))}
        </div>

        <div
          className={styles.historyList}
          onScroll={(e) => {
            const el = e.currentTarget;
            atTopRef.current = el.scrollTop <= 8;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
              void loadMore();
            }
          }}
        >
          {loading ? (
            <Skeleton type="base" baseClassName="h-200px" />
          ) : (
            <>
              {fixedRows.map((row) => {
                const cells = cellsFromHistoryItem(row.item, middleIsOdds);
                return (
                  <div key={row.label} className={clsx(styles.historyRow, styles.historyFixedRow)}>
                    <div className={styles.historyTime}>{row.label}</div>
                    <div className={styles.historyScore}>-</div>
                    {cells.map((cell: OddCellData, idx: number) => (
                      <HistoryOddCell
                        key={`${row.label}-${idx}`}
                        cell={cell}
                        forceBlack={row.isInitial}
                      />
                    ))}
                  </div>
                );
              })}

              {list.map((item, index) => {
                const cells = cellsFromHistoryItem(item, middleIsOdds);
                const progress = calcMatchProgressMinutes(item.recordTime, resolvedMatchTime);
                const formatted = formatHistoryTime(item.recordTime);
                const isLiveMinute = progress != null && progress > 0;
                const timeText =
                  !isShowTime && isLiveMinute
                    ? sportId === 1
                      ? formatFootballMinute(progress)
                      : String(progress)
                    : isShowTime
                      ? formatted.time
                      : `${formatted.date}\n${formatted.time}`;

                return (
                  <div key={`${item.recordTime}-${index}`} className={styles.historyRow}>
                    <div
                      className={clsx(
                        styles.historyTime,
                        !isShowTime && isLiveMinute && styles.timeLive,
                        (isShowTime || !isLiveMinute) && styles.timeMeta,
                      )}
                    >
                      {timeText}
                    </div>
                    <div className={styles.historyScore}>{item.score || '-'}</div>
                    {cells.map((cell: OddCellData, idx: number) => (
                      <HistoryOddCell key={`${index}-${idx}`} cell={cell} />
                    ))}
                  </div>
                );
              })}

              {loadingMore ? <div className={styles.historyMore}>加载中...</div> : null}
              {noMore && list.length > 0 ? (
                <div className={styles.historyMore}>没有更多了</div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
};

export default IndexOddsHistorySheet;
