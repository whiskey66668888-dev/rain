import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, DotLoading, InfiniteScroll } from 'antd-mobile';
import SegmentedControl from '@common/components/SegmentedControl';
import { ClientOnly } from '@/common/components/ClientOnly';
import List from '../components/list';
import styles from './index.module.scss';
import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import QuickTimeSelectSheet from '@/common/components/QuickTimeSelectSheet';
import { ArrowBtmIcon } from '../../WelfareCenterPage/components/icons';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import dayjs from 'dayjs';
import { getRebateList, type RebateListParams, type RebateTop10Item } from '@/apis/origin/rebate';
import H5Header from '@/sites/op7/components/H5Header';
import { requestOpenCustomerService } from '@core/store/slices/customerServiceUISlice';
import { KefuIcon } from '@/sites/op7/pages/MinePage/InviteFriendsPage/components/icons';

/**
 * 实时返水（三级路由）
 */
const tabItems = ['全部', '已领取', '未领取'] as const;
const statusMap: Record<(typeof tabItems)[number], RebateListParams['type']> = {
  全部: '0',
  已领取: '2',
  未领取: '1',
};
const RealtimeRebateRecordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector((state) => state.config.screenBreakpoint === 'md');
  const [activeKey, setActiveKey] = useState<string>(tabItems[0]);
  const dateOptions = ['今日', '昨日', '7天内', '上周', '30天内', '90天内', '自定义'] as const;
  type DateKey = (typeof dateOptions)[number];
  const [dateKey, setDateKey] = useState<DateKey>('今日');
  const [showDateOverlay, setShowDateOverlay] = useState(false);
  const [showCustomOverlay, setShowCustomOverlay] = useState(false);
  const [customRange, setCustomRange] = useState(() => {
    const d = dayjs().format('YYYY-MM-DD');
    return { start: d, end: d };
  });
  const [tempRange, setTempRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [list, setList] = useState<RebateTop10Item[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const loadingRef = useRef(false);
  const [stats, setStats] = useState({ totalSize: 0, totalCash: '0.00' });
  const pageSize = 15;

  const dateRange = useMemo(() => {
    const today = dayjs();
    switch (dateKey) {
      case '今日': {
        const d = today.format('YYYY-MM-DD');
        return { start: d, end: d };
      }
      case '昨日': {
        const d = today.subtract(1, 'day').format('YYYY-MM-DD');
        return { start: d, end: d };
      }
      case '7天内':
        return {
          start: today.subtract(6, 'day').format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD'),
        };
      case '上周': {
        const lastWeek = today.subtract(1, 'week');
        return {
          start: lastWeek.startOf('week').format('YYYY-MM-DD'),
          end: lastWeek.endOf('week').format('YYYY-MM-DD'),
        };
      }
      case '30天内':
        return {
          start: today.subtract(29, 'day').format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD'),
        };
      case '90天内':
        return {
          start: today.subtract(89, 'day').format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD'),
        };
      case '自定义':
      default: {
        return customRange;
      }
    }
  }, [customRange, dateKey]);

  const fetchList = useCallback(
    async (page: number, init = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setListLoading(true);
      try {
        const res = await getRebateList({
          type: statusMap[activeKey as (typeof tabItems)[number]] ?? '0',
          start: dateRange.start,
          end: dateRange.end,
          pageSize,
          pageNumber: page,
        });
        const pageData = res.data?.data ?? [];
        setList((prev) => (init ? pageData : prev.concat(pageData)));
        setStats({
          totalSize: Number(res.data?.totalSize ?? 0),
          totalCash: String(res.data?.totalCash ?? '0.00'),
        });

        const totalPage = Number(res.data?.totalPage ?? 0);
        const more = totalPage > page;
        setHasMore(more);
        setPageNumber(page + 1);
      } catch {
        if (init) {
          setList([]);
          setStats({ totalSize: 0, totalCash: '0.00' });
        }
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setListLoading(false);
      }
    },
    [activeKey, dateRange.end, dateRange.start],
  );

  useEffect(() => {
    setPageNumber(1);
    setHasMore(true);
    void fetchList(1, true);
  }, [activeKey, dateRange.end, dateRange.start, fetchList]);

  const loadMore = useCallback(async () => {
    await fetchList(pageNumber, false);
  }, [fetchList, pageNumber]);

  return (
    <div
      data-desc="realtime-rebate-page"
      className={clsx(
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-y-auto lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
    >
      <ClientOnly>
        <H5Header
          title="返水记录"
          right={
            <button
              type="button"
              className="flex items-center justify-center text-[var(--ThemeColor-Main)] rounded-full w-20px h-20px"
              onClick={() => dispatch(requestOpenCustomerService())}
            >
              <KefuIcon className="w-20px h-20px text-[var(--Text-Main-10)]" />
            </button>
          }
        />
        {/*tab 切换*/}
        <div className={clsx(isMobile && 'bg-[var(--Background-300)] px-14px py-6px')}>
          <SegmentedControl
            options={tabItems.map((item) => ({
              value: item,
              label: <span className="_tf[14]">{item}</span>,
            }))}
            value={activeKey}
            onChange={(v) => setActiveKey(String(v))}
            // className="w-full  text-[var(--Text-800)]"
            className={clsx(
              !isMobile && 'bg-[var(--Background-300)] px-14px py-6px',
              'w-full  text-[var(--Text-800)]',
            )}
            height={36}
          />
        </div>
        <div
          className={clsx(
            'text-sm text-[var(--Text-800)] flex-1 flex flex-col min-h-0',
            styles.record,
          )}
        >
          {/*筛选*/}
          <div className={styles.stats}>
            {isMobile ? (
              <div
                className={styles.statsFilter}
                role="button"
                tabIndex={0}
                onClick={() => setShowDateOverlay(true)}
                onKeyDown={(e) => e.key === 'Enter' && setShowDateOverlay(true)}
              >
                <div className={clsx(styles.statsFilterText, '_tf[14]')}>{dateKey}</div>
                <div className={styles.statsFilterIcon}>
                  <div
                    className={clsx(
                      styles.statsFilterIconShape,
                      showDateOverlay && styles.statsFilterIconOpen,
                    )}
                  >
                    <ArrowBtmIcon />
                  </div>
                </div>
              </div>
            ) : (
              <SegmentedControl
                className={styles.statsFilterTabs}
                height={32}
                tabButtonClassName="_tf[14]"
                options={dateOptions.map((label) => ({
                  value: label,
                  label,
                }))}
                value={dateKey}
                onChange={(key) => {
                  if (key === '自定义') {
                    setTempRange([new Date(customRange.start), new Date(customRange.end)]);
                    setShowCustomOverlay(true);
                    return;
                  }
                  setDateKey(key);
                }}
              />
            )}

            <div className={styles.statsRight}>
              <div className={styles.statsGroup}>
                <div className={styles.statsItem}>
                  <div className={clsx(styles.statsLabel, '_tf[14]')}>笔数</div>
                  <div className={clsx(styles.statsValue, '_tf[14]')}>{stats.totalSize}</div>
                </div>
              </div>
              <div className={styles.statsGroup}>
                <div className={styles.statsItem}>
                  <div className={clsx(styles.statsLabel, '_tf[14]')}>总金额</div>
                  <div className={clsx(styles.statsValue, '_tf[14]')}>{stats.totalCash}</div>
                </div>
              </div>
            </div>
          </div>

          <QuickTimeSelectSheet
            show={showDateOverlay}
            onClose={() => setShowDateOverlay(false)}
            options={dateOptions}
            value={dateKey}
            onConfirmSelection={(key) => {
              setDateKey(key as DateKey);
            }}
            onPickCustom={() => {
              setTempRange([new Date(customRange.start), new Date(customRange.end)]);
              setShowCustomOverlay(true);
            }}
          />
          <Overlay
            show={showCustomOverlay}
            close={() => setShowCustomOverlay(false)}
            position={isMobile ? 'bottom' : 'center'}
            className="[--global-overlay-body-max-height:95%]"
            bodyClassname={clsx(
              'flex flex-col gap-8px overflow-hidden bg-[var(--Background-300)]',
              isMobile ? 'rounded-t-10px safe-b' : 'rounded-12px w-300px',
            )}
            bodyStyle={{ width: isMobile ? '100%' : '400px' }}
          >
            <ModalHeader title="自定义时间" onClose={() => setShowCustomOverlay(false)} />
            <div className={clsx('px-12px pb-12px flex-1-col-hidden')}>
              <div className="text-[12px] text-[var(--Text-800)] mb-8px">* 仅支持最近90天</div>
              <div className={clsx('bg-[var(--Background-300)] rounded-12px p-8px')}>
                <Calendar
                  className={clsx('antd-mobile-calendar-custom')}
                  selectionMode="range"
                  min={dayjs().subtract(89, 'day').toDate()}
                  max={new Date()}
                  value={tempRange}
                  onChange={(val) => {
                    if (!val || !val[0]) return;
                    setTempRange([val[0], val[1] ?? val[0]]);
                  }}
                />
              </div>
              <button
                type="button"
                className="shrink-0 mt-12px h-40px rounded-full bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-600"
                onClick={() => {
                  const start = dayjs(tempRange[0]).format('YYYY-MM-DD');
                  const end = dayjs(tempRange[1]).format('YYYY-MM-DD');
                  setCustomRange({ start, end });
                  setDateKey('自定义');
                  setShowCustomOverlay(false);
                }}
              >
                确定
              </button>
            </div>
          </Overlay>

          {/*列表*/}
          <div className={clsx('flex flex-col', list.length === 0 && 'flex-1')}>
            <List hideTitle radius rows={list} loading={listLoading} grow={list.length === 0} />
          </div>
          {list.length > 0 && (
            <div className={clsx('py-12px text-center text-[var(--Text-800)] _tf[12]')}>
              <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                {hasMore ? (
                  <span className="inline-flex items-center gap-6px">
                    加载中
                    <DotLoading />
                  </span>
                ) : (
                  <span>- 到底啦 -</span>
                )}
              </InfiniteScroll>
            </div>
          )}
        </div>
      </ClientOnly>
    </div>
  );
};

export default RealtimeRebateRecordPage;
