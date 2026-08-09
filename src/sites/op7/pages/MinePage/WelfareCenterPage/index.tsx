import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InfiniteScroll, Popover, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { ClientOnly } from '@/common/components/ClientOnly';
import styles from './index.module.scss';
import H5Header from '@/sites/op7/components/H5Header';
import { useAppSelector } from '@/core/store/hooks';
import Content from './components/content';
import ReceiveSuccessDialog from './components/ReceiveSuccessDialog';
import { ArrowBtmIcon } from './components/icons';
import {
  buildWelfareReceiveSuccessModalData,
  type WelfareReceiveSuccessModalData,
} from './receiveSuccessModal';
import {
  distributeBonusReq,
  getWelfareCenterReq,
  type WelfareCenterItem,
  type WelfareCenterResponse,
} from '@/apis/origin/welfareCenter';
import { getRebate } from '@/apis/origin/rebate';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';

const STATUS_OPTIONS = ['全部', '未领取', '已过期', '已领取'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const STATUS_MAP: Record<StatusOption, '' | 0 | -2 | 9> = {
  全部: '',
  未领取: 0,
  已过期: -2,
  已领取: 9,
};

export const DATE_RANGE_OPTIONS = [
  '今日',
  '昨日',
  '7天内',
  '上周',
  '30天内',
  '90天内',
  '自定义',
] as const;
export type DateRangeKey = (typeof DATE_RANGE_OPTIONS)[number];

function parseRebateAmountRaw(raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === 'string') {
    const normalized = raw.replace(/,/g, '').trim();
    const amount = parseFloat(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }
  if (raw !== null && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if ('amount' in o) return parseRebateAmountRaw(o.amount);
    if ('cash' in o) return parseRebateAmountRaw(o.cash);
  }
  return 0;
}

/**
 * 福利中心（三级路由）
 */
const WelfareCenterPage: React.FC = () => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const [status, setStatus] = useState<StatusOption>('全部');

  const [pageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [list, setList] = useState<WelfareCenterItem[]>([]);
  const [summary, setSummary] = useState<Pick<WelfareCenterResponse, 'totalSize' | 'totalCash'>>({
    totalSize: 0,
    totalCash: '0.00',
  });
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [showBannerDot, setShowBannerDot] = useState(false);
  const [receiveSuccessModal, setReceiveSuccessModal] =
    useState<WelfareReceiveSuccessModalData | null>(null);

  const [dateRangeKey, setDateRangeKey] = useState<DateRangeKey>('90天内');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>(() => {
    const end = dayjs();
    const start = end.subtract(89, 'day');
    return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
  });

  const { getMemberInfo } = useGetMemberInfo();

  const timeRange = useMemo(() => {
    const today = dayjs();
    switch (dateRangeKey) {
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
      default:
        return customRange;
    }
  }, [customRange, dateRangeKey]);

  const loadRebateAmount = useCallback(async () => {
    try {
      const res = await getRebate();
      const amount = parseRebateAmountRaw(res.data);
      setShowBannerDot(amount > 0);
    } catch {
      setShowBannerDot(false);
    }
  }, []);

  const fetchList = useCallback(
    async (nextPageNumber: number, merge: boolean) => {
      setLoading(true);
      const shouldSyncRebate = nextPageNumber === 1 && !merge;
      const rebatePromise = shouldSyncRebate ? getRebate() : null;
      try {
        const res = await getWelfareCenterReq({
          status: STATUS_MAP[status],
          pageSize,
          pageNumber: nextPageNumber,
          start: timeRange.start,
          end: timeRange.end,
        });

        const data = res.data;
        setSummary({ totalSize: data.totalSize, totalCash: data.totalCash });
        setPageNumber(nextPageNumber);
        setHasMore(nextPageNumber < data.totalPages);
        setList((prev) => (merge ? [...prev, ...data.dataList] : data.dataList));

        if (rebatePromise) {
          try {
            const rebateRes = await rebatePromise;
            const amount = parseRebateAmountRaw(rebateRes.data);
            setShowBannerDot(amount > 0);
          } catch {
            setShowBannerDot(false);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [pageSize, status, timeRange.end, timeRange.start],
  );

  useEffect(() => {
    fetchList(1, false);
  }, [fetchList, status, timeRange.end, timeRange.start]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadRebateAmount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadRebateAmount]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchList(pageNumber + 1, true);
  }, [fetchList, hasMore, loading, pageNumber]);

  const receiveLoading = useRef(false);
  const handleReceive = useCallback(
    async (item: WelfareCenterItem) => {
      if (receiveLoading.current) return;
      if (item.status !== 0) return;
      if (submittingId !== null) return;

      receiveLoading.current = true;
      setSubmittingId(item.id);
      const loadingToast = Toast.show({ icon: 'loading', content: '领取中...' });

      try {
        await distributeBonusReq({ id: item.id });
        loadingToast.close();
        const modalData = buildWelfareReceiveSuccessModalData(item);
        await Promise.all([getMemberInfo(), fetchList(1, false)]);
        setReceiveSuccessModal(modalData);
      } catch (e: unknown) {
        const info =
          typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { info?: string } }).response?.info
            : undefined;
        const content = info || (e instanceof Error ? e.message : undefined) || '领取失败';
        Toast.show({ icon: 'fail', content });
        await fetchList(1, false);
      } finally {
        loadingToast.close();
        setSubmittingId(null);
        receiveLoading.current = false;
      }
    },
    [fetchList, getMemberInfo, submittingId],
  );
  return (
    <ClientOnly>
      <div
        data-desc="promotion-center-page"
        className={clsx(
          'self-center w-full ',
          'flex-1 flex flex-col ',
          'overflow-y-auto lg:overflow-initial',
          'lg:max-w-[1220px]',
        )}
      >
        <H5Header
          title="福利中心"
          right={
            <Popover.Menu
              className={styles.popover}
              trigger="click"
              placement="bottom-end"
              actions={STATUS_OPTIONS.map((item) => ({
                key: item,
                text: (
                  <span className={clsx(item === status && 'text-[var(--ThemeColor-Main)]')}>
                    {item}
                  </span>
                ),
              }))}
              onAction={(action) => {
                setStatus(action.key as StatusOption);
              }}
            >
              <button className="flex items-center gap-4px">
                <span>{status}</span>
                <ArrowBtmIcon />
              </button>
            </Popover.Menu>
          }
        />
        <div className="flex flex-1 flex-col w-full  text-sm text-[var(--Text-800)]">
          {!isMobile && (
            <div className={styles.statusGroup}>
              {STATUS_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={clsx(styles.statusItem, item === status && styles.statusItemActive)}
                  onClick={() => setStatus(item)}
                >
                  <span
                    className={clsx(
                      styles.statusItemText,
                      item === status && styles.statusItemActiveText,
                      '_tf[14]',
                    )}
                  >
                    {item}
                  </span>
                </button>
              ))}
            </div>
          )}

          <Content
            isMobile={isMobile}
            status={status}
            showBannerDot={showBannerDot}
            dateRangeKey={dateRangeKey}
            customRange={customRange}
            onChangeDateRangeKey={(next) => setDateRangeKey(next)}
            onChangeCustomRange={(next) => {
              setCustomRange(next);
              setDateRangeKey('自定义');
            }}
            list={list}
            summary={summary}
            loading={loading}
            submittingId={submittingId}
            onReceive={(item) => {
              void handleReceive(item);
            }}
          />

          {list.length >= pageSize && <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />}
        </div>
      </div>

      <ReceiveSuccessDialog
        visible={receiveSuccessModal !== null}
        data={receiveSuccessModal}
        onClose={() => setReceiveSuccessModal(null)}
      />
    </ClientOnly>
  );
};

export default WelfareCenterPage;
