import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';

import DateRangePicker from '@/common/components/DateRangePicker';
import Button from '@/common/components/Button';
import CircleCheck from '@/common/components/CircleCheck';
import Icon from '@/common/components/Icon';
import {
  getFbMatchResultListReq,
  type MatchItem,
  type MatchResultRecordItem,
  type NsgItem,
} from '@/apis/fbSports/betRecord/getFBResultList';
import { useAppSelector } from '@/core/store/hooks';
import { FullPes } from '@/apis/fbSports/common/constants/period';
import { fbList } from '@/apis/fbSports/common/constants';

import styles from './index.module.scss';
import { EDateRangeType, TDateRange } from '@/utils/dateHelper';
import { todayRange } from '@/utils/dateHelper';
import Empty from '@/common/components/Empty';

type GroupedLeague = {
  leagueId: number;
  leagueName: string;
  leagueIcon: string;
  list: MatchItem[];
};

type LeagueOption = {
  leagueId: number;
  leagueName: string;
  leagueIcon: string;
};

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

const PcResultPage = () => {
  const location = useLocation();
  const { playType } = useAppSelector((state) => state.sport.mainList.settings);
  const menus = useAppSelector((state) => state.sport.mainList.datas.menuInfo.menus);

  const sportList = useMemo(() => {
    const list = (menus[playType] ?? []).filter((item) => item.sportId > 0);
    if (list.length > 0) {
      return list;
    }

    return fbList.map((item) => ({
      sportId: item.id,
      name: item.label,
    }));
  }, [menus, playType]);
  const [sportId, setSportId] = useState<number>(sportList[0]?.sportId ?? 1);
  const [leagueIds, setLeagueIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<TDateRange>(todayRange());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(50);
  const [orderBy, setOrderBy] = useState<0 | 1>(0);
  const [isShowSports, setShowSports] = useState(false);
  const [isShowLeague, setShowLeague] = useState(false);
  const [isShowPageSize, setShowPageSize] = useState(false);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const [pendingLeagueIds, setPendingLeagueIds] = useState<number[]>([]);
  const [leagueAction, setLeagueAction] = useState<'all' | 'invert' | null>(null);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const pageSizeRef = useRef<HTMLDivElement | null>(null);

  const currentSport = useMemo(
    () => sportList.find((item) => item.sportId === sportId) ?? sportList[0],
    [sportId, sportList],
  );

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['fb', 'pcResultPage', sportId, leagueIds, orderBy, pageSize, dateRange, page],
    queryFn: () =>
      getFbMatchResultListReq({
        sportId,
        leagueIds,
        orderBy,
        beginTime: dateRange[0].getTime(),
        endTime: dateRange[1].getTime(),
        current: page,
        size: pageSize,
      }),
  });

  const { data: leagueFilterData } = useQuery({
    queryKey: ['fb', 'pcResultPageLeagueFilter', sportId, dateRange],
    queryFn: () =>
      getFbMatchResultListReq({
        sportId,
        orderBy,
        beginTime: dateRange[0].getTime(),
        endTime: dateRange[1].getTime(),
        current: 1,
        size: 1000,
      }),
  });

  const leagues = useMemo<GroupedLeague[]>(() => {
    const source = data?.records ?? [];
    const map = new Map<number, GroupedLeague>();

    source.forEach((item: MatchResultRecordItem) => {
      const group = map.get(item.lg.id) ?? {
        leagueId: item.lg.id,
        leagueName: item.lg.na,
        leagueIcon: item.lg.lurl ?? '',
        list: [],
      };

      group.list.push({
        id: item.id,
        bt: item.bt,
        ms: item.ms,
        fid: item.fid,
        fmt: item.fmt,
        ne: item.ne,
        ts: item.ts,
        nsg: item.nsg,
      });
      map.set(item.lg.id, group);
    });

    return Array.from(map.values());
  }, [data]);

  const leagueOptions = useMemo<LeagueOption[]>(() => {
    const source = leagueFilterData?.records ?? [];
    const map = new Map<number, LeagueOption>();

    source.forEach((item: MatchResultRecordItem) => {
      if (!map.has(item.lg.id)) {
        map.set(item.lg.id, {
          leagueId: item.lg.id,
          leagueName: item.lg.na,
          leagueIcon: item.lg.lurl ?? '',
        });
      }
    });

    return Array.from(map.values());
  }, [leagueFilterData]);

  const currentLeagueLabel = useMemo(() => {
    if (leagueIds.length === 0) {
      return '联赛';
    }
    const firstLeague = leagueOptions.find((item) => item.leagueId === leagueIds[0]);
    if (!firstLeague) {
      return `联赛 +${leagueIds.length}`;
    }
    return leagueIds.length === 1
      ? firstLeague.leagueName
      : `${firstLeague.leagueName} +${leagueIds.length - 1}`;
  }, [leagueIds, leagueOptions]);

  const currentLeagueIcon = useMemo(() => {
    if (leagueIds.length === 0) return '';
    return leagueOptions.find((item) => item.leagueId === leagueIds[0])?.leagueIcon ?? '';
  }, [leagueIds, leagueOptions]);

  useEffect(() => {
    if (!sportList.length) return;
    const hasCurrentSport = sportList.some((item) => item.sportId === sportId);
    const firstSportId = sportList[0]?.sportId;
    if (!hasCurrentSport && firstSportId) {
      setSportId(firstSportId);
    }
  }, [sportId, sportList]);

  useEffect(() => {
    setExpandedSet(new Set(leagues.map((item) => item.leagueId)));
  }, [leagues]);

  useEffect(() => {
    setPage(1);
  }, [dateRange]);

  useEffect(() => {
    setPendingLeagueIds(leagueIds);
  }, [leagueIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!filtersRef.current) return;
      if (filtersRef.current.contains(event.target as Node)) return;

      setShowSports(false);
      setShowLeague(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!pageSizeRef.current) return;
      if (pageSizeRef.current.contains(event.target as Node)) return;

      setShowPageSize(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLeagueAction(null);
  }, [sportId, dateRange, orderBy]);

  useEffect(() => {
    setLeagueIds([]);
    setPendingLeagueIds([]);
    setLeagueAction(null);
    setShowLeague(false);
    setPage(1);
  }, [location.key]);

  useEffect(() => {
    setPage(1);
  }, [orderBy, pageSize]);

  const totalPage = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const pageNumbers = useMemo(() => {
    const list: number[] = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPage, start + 3);
    for (let i = start; i <= end; i += 1) {
      list.push(i);
    }
    return list;
  }, [page, totalPage]);

  const formatScore = (nsg: NsgItem[], index: number) => {
    const fullScore = nsg.find((item) => item.tyg === 5 && FullPes.includes(item.pe));
    const score = fullScore?.sc?.[index];
    return typeof score === 'number' ? String(score) : '';
  };

  const onSelectSport = (nextSportId: number) => {
    setSportId(nextSportId);
    setLeagueIds([]);
    setPendingLeagueIds([]);
    setPage(1);
    setShowSports(false);
    setShowLeague(false);
  };

  const onRefresh = () => {
    void refetch();
  };

  const onOpenLeaguePanel = () => {
    setPendingLeagueIds(
      leagueIds.length === 0 ? leagueOptions.map((item) => item.leagueId) : leagueIds,
    );
    setLeagueAction(null);
    setShowLeague(true);
    setShowSports(false);
  };

  const onToggleLeague = (leagueId: number) => {
    setLeagueAction(null);
    setPendingLeagueIds((prev) =>
      prev.includes(leagueId) ? prev.filter((item) => item !== leagueId) : [...prev, leagueId],
    );
  };

  const onSelectAllLeagues = () => {
    setLeagueAction('all');
    setPendingLeagueIds(leagueOptions.map((item) => item.leagueId));
  };

  const onInvertLeagues = () => {
    setLeagueAction('invert');
    setPendingLeagueIds((prev) =>
      leagueOptions.map((item) => item.leagueId).filter((leagueId) => !prev.includes(leagueId)),
    );
  };

  const onCancelLeaguePanel = () => {
    setPendingLeagueIds(leagueIds);
    setLeagueAction(null);
    setShowLeague(false);
  };

  const onConfirmLeaguePanel = () => {
    const isAllSelected =
      leagueOptions.length > 0 && pendingLeagueIds.length === leagueOptions.length;
    setLeagueIds(isAllSelected ? [] : pendingLeagueIds);
    setPage(1);
    setLeagueAction(null);
    setShowLeague(false);
  };

  const toggleLeague = (leagueId: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(leagueId)) {
        next.delete(leagueId);
      } else {
        next.add(leagueId);
      }
      return next;
    });
  };

  const isAllActionChecked =
    leagueAction === 'all' ||
    (leagueOptions.length > 0 && pendingLeagueIds.length === leagueOptions.length);
  const isInvertActionChecked = leagueAction === 'invert';

  const onSelectPageSize = (size: (typeof PAGE_SIZE_OPTIONS)[number]) => {
    setPageSize(size);
    setShowPageSize(false);
  };

  return (
    <div className={styles.pcResultPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageLogo} />
        <span className={styles.pageTitle}>赛果</span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button type="button" className={clsx(styles.tab, styles.active)}>
            体育赛果
          </button>
          {/* <button type="button" className={styles.tab} onClick={() => navigate(PATHS.betHistoryH5)}>
            冠军
          </button> */}
        </div>

        <div className={styles.filters} ref={filtersRef}>
          <div className={styles.searchCondition}>
            <button
              type="button"
              className={clsx(
                styles.searchConditionItem,
                orderBy === 0 && styles.searchConditionActive,
              )}
              onClick={() => setOrderBy(0)}
            >
              时间
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9"
              height="11"
              viewBox="0 0 9 11"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 3.47822C9 3.61629 8.88807 3.72822 8.75 3.72822L0.25 3.72822C0.111929 3.72822 0 3.61629 0 3.47822V2.97822C0 2.88824 0.0475359 2.80937 0.118866 2.76534C0.127686 2.75106 0.138653 2.73746 0.151243 2.72487L2.80289 0.0732233C2.90052 -0.0244078 3.05882 -0.0244078 3.15645 0.0732233L3.51 0.426777C3.60763 0.524408 3.60763 0.682699 3.51 0.78033L1.56225 2.728L8.75 2.72822C8.88807 2.72822 9 2.84015 9 2.97822V3.47822ZM9 7.47822C9 7.5679 8.95279 7.64655 8.88186 7.69066C8.87304 7.70478 8.8623 7.71804 8.85 7.73033L6.19835 10.382C6.10072 10.4796 5.94243 10.4796 5.8448 10.382L5.49124 10.0284C5.39361 9.9308 5.39361 9.77251 5.49124 9.67487L7.438 7.728L0.25 7.72822C0.111929 7.72822 0 7.6163 0 7.47822V6.97822C0 6.84015 0.111929 6.72822 0.25 6.72822L8.75 6.72822C8.88807 6.72822 9 6.84015 9 6.97822V7.47822Z"
                fill="var(--Text-800)"
              />
            </svg>
            <button
              type="button"
              className={clsx(
                styles.searchConditionItem,
                orderBy === 1 && styles.searchConditionActive,
              )}
              onClick={() => setOrderBy(1)}
            >
              联赛
            </button>
          </div>

          <div className={styles.sportFilterWrap}>
            <button
              type="button"
              className={clsx(
                styles.filterButton,
                styles.sportFilterButton,
                isShowSports && styles.active,
              )}
              onClick={() => {
                setShowSports((prev) => !prev);
                setShowLeague(false);
              }}
            >
              <span>{currentSport?.name ?? '足球'}</span>
              <Icon
                src="/images/common/arrow_down.svg"
                size="12px"
                color="currentColor"
                className={clsx(styles.filterArrow, isShowSports && styles.expanded)}
              />
            </button>

            {isShowSports && (
              <div className={styles.sportDropdown}>
                {sportList.map((item) => (
                  <button
                    type="button"
                    key={item.sportId}
                    className={clsx(styles.dropdownItem, item.sportId === sportId && styles.active)}
                    onClick={() => onSelectSport(item.sportId)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.leagueFilterWrap}>
            <button
              type="button"
              className={clsx(
                styles.filterButton,
                styles.leagueFilterButton,
                isShowLeague && styles.active,
              )}
              onClick={onOpenLeaguePanel}
            >
              <span className={styles.leagueFilterValue}>
                {currentLeagueIcon ? <img src={currentLeagueIcon} alt="" /> : null}
                <span>{currentLeagueLabel}</span>
              </span>
              <Icon
                src="/images/common/arrow_down.svg"
                size="12px"
                color="currentColor"
                className={clsx(styles.filterArrow, isShowLeague && styles.expanded)}
              />
            </button>

            {isShowLeague && (
              <div className={styles.leagueDropdown}>
                <div className={styles.leagueDropdownHeader}>
                  <button
                    type="button"
                    className={styles.selectionAction}
                    onClick={onSelectAllLeagues}
                  >
                    <CircleCheck checked={isAllActionChecked} className={styles.selectionDot} />
                    <span>全选</span>
                  </button>
                  <button
                    type="button"
                    className={styles.selectionAction}
                    onClick={onInvertLeagues}
                  >
                    <CircleCheck checked={isInvertActionChecked} className={styles.selectionDot} />
                    <span>反选</span>
                  </button>
                </div>

                <div className={styles.leagueDropdownList}>
                  {leagueOptions.map((league) => {
                    const checked = pendingLeagueIds.includes(league.leagueId);
                    return (
                      <button
                        type="button"
                        key={league.leagueId}
                        className={styles.leagueOption}
                        onClick={() => onToggleLeague(league.leagueId)}
                      >
                        <CircleCheck checked={checked} className={styles.optionCheck} />
                        <span className={styles.optionLabel}>
                          {league.leagueIcon ? (
                            <img src={league.leagueIcon} alt="" />
                          ) : (
                            <img src="/images/common/logo_small.png" alt="" />
                          )}
                          <span>{league.leagueName}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.leagueDropdownFooter}>
                  <Button
                    type="second"
                    size="middle"
                    className={styles.cancelButton}
                    onClick={onCancelLeaguePanel}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    size="middle"
                    className={styles.confirmButton}
                    onClick={onConfirmLeaguePanel}
                  >
                    确定
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DateRangePicker
            closeButtonClassName="!right-0"
            value={dateRange}
            onChange={setDateRange}
            quickDateRangeTypes={[EDateRangeType.LAST_7_DAYS]}
            min={dayjs().subtract(6, 'day').startOf('day').toDate()}
            max={dayjs().endOf('day').toDate()}
            className={styles.timeFilterWrap}
            text="当前系统支持查询最近一周的体育赛果"
          >
            {() => (
              <button
                type="button"
                className={clsx(styles.filterButton, styles.dateButton, styles.timeFilterButton)}
              >
                <span>
                  {`${dayjs(dateRange[0]).format('YYYY/MM/DD')}~${dayjs(dateRange[1]).format(
                    'YYYY/MM/DD',
                  )}`}
                </span>
                <Icon src="/images/common/calendar.svg" size="14px" color="currentColor" />
              </button>
            )}
          </DateRangePicker>

          <button
            type="button"
            className={clsx(styles.filterButton, styles.refreshButton)}
            onClick={onRefresh}
          >
            刷新
          </button>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.sportTitle}>
          <Icon src="/images/common/menu/result.svg" size="18px" color="var(--ThemeColor-Main)" />
          <span>{currentSport?.name ?? '足球'}</span>
        </div>

        <div className={styles.leagueList}>
          {leagues.map((league) => {
            const expanded = expandedSet.has(league.leagueId);

            return (
              <section key={league.leagueId} className={styles.leagueSection}>
                <button
                  type="button"
                  className={styles.leagueHeader}
                  onClick={() => toggleLeague(league.leagueId)}
                >
                  <div className={styles.leagueName}>
                    {league.leagueIcon ? (
                      <img src={league.leagueIcon} alt="" />
                    ) : (
                      <img src="/images/common/logo_small.png" alt="" />
                    )}
                    <span>{league.leagueName}</span>
                  </div>
                  <Icon
                    src="/images/common/arrow_down.svg"
                    size="12px"
                    color="var(--Text-700)"
                    className={clsx(styles.leagueArrow, expanded && styles.expanded)}
                  />
                </button>

                {expanded && (
                  <div className={styles.matchList}>
                    {league.list.map((match) => (
                      <div key={match.id} className={styles.matchRow}>
                        <div className={styles.time}>{dayjs(match.bt).format('MM/DD HH:mm')}</div>
                        <div className={styles.team}>
                          {match.ts[0]?.lurl ? <img src={match.ts[0].lurl} alt="" /> : null}
                          <span>{match.ts[0]?.na ?? '-'}</span>
                        </div>
                        <div className={styles.vs}>-</div>
                        <div className={styles.team}>
                          {match.ts[1]?.lurl ? <img src={match.ts[1].lurl} alt="" /> : null}
                          <span>{match.ts[1]?.na ?? '-'}</span>
                        </div>
                        <div className={styles.score}>
                          {formatScore(match.nsg, 0) && formatScore(match.nsg, 1)
                            ? `${formatScore(match.nsg, 0)}-${formatScore(match.nsg, 1)}`
                            : ''}
                        </div>
                        {/* <div className={styles.rowArrow}>
                          <Icon
                            src="/images/common/arrow_down.svg"
                            size="12px"
                            color="var(--Text-700)"
                          />
                        </div> */}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {!isFetching && leagues.length === 0 && <Empty type="data" />}
        </div>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageButtons}>
          <button
            type="button"
            className={styles.pageArrow}
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <Icon
              src="/images/common/arrow_down.svg"
              size="12px"
              color="currentColor"
              className={styles.prevIcon}
            />
          </button>

          <div className={styles.pageNumberGroup}>
            {pageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={clsx(styles.pageNumber, pageNumber === page && styles.active)}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.pageArrow}
            disabled={page >= totalPage}
            onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
          >
            <Icon
              src="/images/common/arrow_down.svg"
              size="12px"
              color="currentColor"
              className={styles.nextIcon}
            />
          </button>
        </div>

        <div className={styles.pageSizeWrap} ref={pageSizeRef}>
          <button
            type="button"
            className={styles.pageSize}
            onClick={() => setShowPageSize((prev) => !prev)}
          >
            <span>{pageSize} 条/页</span>
            <Icon src="/images/common/arrow_down.svg" size="12px" color="currentColor" />
          </button>

          {isShowPageSize && (
            <div className={styles.pageSizeDropdown}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={clsx(styles.pageSizeOption, size === pageSize && styles.active)}
                  onClick={() => onSelectPageSize(size)}
                >
                  {size} 条/页
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PcResultPage;
