import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInViewport } from 'ahooks';

import type {
  CustomerServiceBetRecord,
  CustomerServiceBetRecordPage,
} from '@/apis/origin/customerServiceRecords';
import { getCustomerServiceBetRecordPage } from '@/apis/origin/customerServiceRecords';
import { useHomeListQuery } from '@/apis/origin/homeList';
import type { HomeListResponse } from '@/apis/origin/homeList';
import { EWithdrawStatusId, TradeMainStatus } from '@/apis/commonSports/constants';
import {
  getDepositRecordReq,
  type TDepositRecordItem,
} from '@/apis/origin/transactionRecord/deposit';
import {
  getCustomerServiceWithdrawRecordReq,
  type TWithdrawRecordItem,
} from '@/apis/origin/transactionRecord/withdraw';
import {
  getCustomerServiceBonusRecordReq,
  type TBonusRecordItem,
} from '@/apis/origin/transactionRecord/bonus';
import Empty from '@/common/components/Empty';
import Icon from '@/common/components/Icon';
import Overlay from '@/common/components/Overlay';
import Popover from '@/common/components/Popover';
import Skeleton from '@/common/components/Skeleton';
import { toast } from '@/common/components/Toast';
import { useAppSelector } from '@/core/store/hooks';
import { CircleTipDownSvg } from '@/sites/op7/components/SvgIcons';
import { getSystemTheme } from '@/utils';
import { HomeListId } from '@/utils/constants/entertainment';
import { zIndexMap } from '@/utils/constants/zIndex';

export type CustomerServiceRecordModalType = 'betting' | 'transaction';

interface CustomerServiceRecordModalProps {
  type: CustomerServiceRecordModalType;
  show: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const CATEGORY_ORDER = [
  HomeListId.SPORTS,
  HomeListId.ESPORTS,
  HomeListId.LIVE,
  HomeListId.SLOTS,
  HomeListId.POKER,
  HomeListId.LOTTERY,
];

const CATEGORY_LABELS: Partial<Record<HomeListId, string>> = {
  [HomeListId.SPORTS]: '体育',
  [HomeListId.ESPORTS]: '电竞',
  [HomeListId.LIVE]: '真人',
  [HomeListId.SLOTS]: '电子',
  [HomeListId.POKER]: '棋牌',
  [HomeListId.LOTTERY]: '彩票',
};

// 与 EMC Flutter `home_full_site/game_list/constants/cardList` 的场馆顺序保持一致。
// 未出现在 Flutter 配置中的场馆不在投注记录的二级 Tab 中展示。
const VENUE_ORDER: Partial<Record<HomeListId, number[]>> = {
  [HomeListId.SPORTS]: [89, 30, 79, 78, 60],
  [HomeListId.ESPORTS]: [81, 84, 88],
  [HomeListId.LIVE]: [43, 5, 31, 20],
  [HomeListId.SLOTS]: [68, 70, 72, 77, 9, 113, 116, 117, 120],
  [HomeListId.POKER]: [38, 55, 18, 74, 118],
  [HomeListId.LOTTERY]: [83, 110, 71, 63],
};

const BET_STATUS_ICONS: Record<number, { name: string; themed?: boolean; label: string }> = {
  0: { name: 'bet_record_unsettled.webp', themed: true, label: '未结算' },
  1: { name: 'bet_record_win.webp', label: '赢' },
  2: { name: 'bet_record_lose.webp', themed: true, label: '输' },
  3: { name: 'bet_record_tie.webp', label: '和' },
  4: { name: 'bet_record_cancel.webp', themed: true, label: '取消' },
  5: { name: 'bet_record_win_half.webp', label: '赢半' },
  6: { name: 'bet_record_lose_half.webp', label: '输半' },
  7: { name: 'bet_record_advance.webp', label: '提前结算' },
  8: { name: 'bet_record_return.webp', label: '退本金' },
  9: { name: 'bet_record_fail.webp', themed: true, label: '投注失败' },
  10: { name: 'bet_record_bunch.webp', label: '串关' },
};

type ResolvedTheme = 'light' | 'dark';
const BET_RECORD_PAGE_SIZE = 20;

function sortVenues(category?: HomeListResponse) {
  if (!category) return [];
  const venueMap = new Map(category.childList.map((venue) => [venue.gameId, venue]));
  return (VENUE_ORDER[category.homeId] ?? [])
    .map((gameId) => venueMap.get(gameId))
    .filter((venue): venue is HomeListResponse['childList'][number] => !!venue);
}

const CustomerServiceRecordModal: React.FC<CustomerServiceRecordModalProps> = ({
  type,
  show,
  isMobile,
  onClose,
}) => {
  const title = type === 'betting' ? '投注记录' : '交易记录';

  return (
    <Overlay
      show={show}
      close={onClose}
      position={isMobile ? 'bottom' : 'center'}
      zIndex={zIndexMap.customerServiceModal + 10}
      bodyClassname={clsx(
        'flex min-h-0 flex-col overflow-hidden bg-[var(--Background-400)]',
        type === 'transaction' ? 'h-[502px]' : 'h-[540px]',
        isMobile
          ? 'max-h-[90vh] w-full rounded-t-12px'
          : 'max-h-[90vh] w-[520px] max-w-[90vw] rounded-16px',
      )}
    >
      <div className="relative flex h-52px shrink-0 items-center justify-center px-12px">
        <div className="flex items-center gap-4px">
          <h2 className="text-16px font-600 text-[var(--Text-Main-10)]">{title}</h2>
          <button
            type="button"
            className="flex size-18px items-center justify-center"
            aria-label={`${title}说明`}
            onClick={() =>
              toast({
                type: 'info',
                description: `仅支持查看近3个月${title}`,
              })
            }
          >
            <Icon
              src="/images/common/information.svg"
              size={18}
              color="var(--Text-800)"
              aria-hidden
            />
          </button>
        </div>
        <button
          type="button"
          className="absolute right-12px top-1/2 flex size-28px -translate-y-1/2 items-center justify-center text-24px font-300 text-[var(--Text-Main-10)]"
          aria-label={`关闭${title}`}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {type === 'betting' ? <BettingRecordsContent /> : <TransactionRecordsContent />}
      </div>
    </Overlay>
  );
};

const BettingRecordsContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: homeList = [], isLoading: venueLoading } = useHomeListQuery();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme: ResolvedTheme = themeMode === 'system' ? getSystemTheme() : (themeMode ?? 'light');
  const categoryButtonRefs = useRef(new Map<HomeListId, HTMLButtonElement>());
  const recordScrollRef = useRef<HTMLDivElement | null>(null);
  const recordSentinelRef = useRef<HTMLDivElement | null>(null);
  const recordSentinelEnteredRef = useRef(false);
  const [recordHasUserScrolled, setRecordHasUserScrolled] = useState(false);
  const [recordSentinelInViewport] = useInViewport(recordSentinelRef);
  const categories = useMemo(
    () =>
      CATEGORY_ORDER.map((homeId) => homeList.find((item) => item.homeId === homeId)).filter(
        (item): item is HomeListResponse => !!item,
      ),
    [homeList],
  );
  const [activeHomeId, setActiveHomeId] = useState<HomeListId>();
  const [activeGameId, setActiveGameId] = useState<number>();

  const activeCategory = useMemo(
    () => categories.find((item) => item.homeId === activeHomeId) ?? categories[0],
    [activeHomeId, categories],
  );
  const activeVenues = useMemo(() => sortVenues(activeCategory), [activeCategory]);

  useEffect(() => {
    if (!categories.length) return;
    setActiveHomeId((current) =>
      current && categories.some((item) => item.homeId === current)
        ? current
        : categories[0]?.homeId,
    );
  }, [categories]);

  useEffect(() => {
    setActiveGameId((current) =>
      current && activeVenues.some((item) => item.gameId === current)
        ? current
        : activeVenues[0]?.gameId,
    );
  }, [activeVenues]);

  useEffect(() => {
    if (!activeCategory) return;
    const frame = requestAnimationFrame(() => {
      categoryButtonRefs.current.get(activeCategory.homeId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeCategory]);

  const {
    data: recordData,
    fetchNextPage: fetchNextRecordPage,
    hasNextPage: hasNextRecordPage,
    isError: recordError,
    isFetchNextPageError: isFetchNextRecordPageError,
    isFetchingNextPage: isFetchingNextRecordPage,
    isLoading: recordLoading,
  } = useInfiniteQuery<CustomerServiceBetRecordPage, Error>({
    queryKey: ['customer-service', 'bet-records', activeGameId],
    enabled: !!activeGameId,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      activeGameId
        ? getCustomerServiceBetRecordPage(activeGameId, Number(pageParam), BET_RECORD_PAGE_SIZE)
        : Promise.resolve({ records: [], pageNumber: 1 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.totalPage && lastPage.totalPage > 0) {
        return lastPage.pageNumber < lastPage.totalPage ? lastPage.pageNumber + 1 : undefined;
      }
      if (lastPage.totalSize !== undefined) {
        return lastPage.pageNumber * BET_RECORD_PAGE_SIZE < lastPage.totalSize
          ? lastPage.pageNumber + 1
          : undefined;
      }
      return lastPage.records.length === BET_RECORD_PAGE_SIZE ? lastPage.pageNumber + 1 : undefined;
    },
    staleTime: 0,
    retry: false,
  });
  const records = useMemo(
    () => recordData?.pages.flatMap((page) => page.records) ?? [],
    [recordData],
  );

  useEffect(() => {
    if (!activeGameId) return;
    const queryKey = ['customer-service', 'bet-records', activeGameId] as const;

    return () => {
      void queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.setQueryData<InfiniteData<CustomerServiceBetRecordPage>>(queryKey, (current) =>
        current
          ? {
              ...current,
              pages: current.pages.slice(0, 1),
              pageParams: current.pageParams.slice(0, 1),
            }
          : current,
      );
    };
  }, [activeGameId, queryClient]);

  useEffect(() => {
    recordScrollRef.current?.scrollTo({ top: 0 });
    recordSentinelEnteredRef.current = false;
    setRecordHasUserScrolled(false);
  }, [activeGameId]);

  useEffect(() => {
    if (!recordSentinelInViewport) {
      recordSentinelEnteredRef.current = false;
      return;
    }
    if (!recordHasUserScrolled) return;
    if (recordSentinelEnteredRef.current) return;
    recordSentinelEnteredRef.current = true;

    if (
      hasNextRecordPage &&
      !recordLoading &&
      !isFetchingNextRecordPage &&
      !isFetchNextRecordPageError
    ) {
      void fetchNextRecordPage();
    }
  }, [
    fetchNextRecordPage,
    hasNextRecordPage,
    isFetchNextRecordPageError,
    isFetchingNextRecordPage,
    recordHasUserScrolled,
    recordLoading,
    recordSentinelInViewport,
  ]);

  return (
    <>
      <div className="mx-12px flex h-36px shrink-0 gap-8px overflow-x-auto rounded-full bg-[var(--Background-300)] p-2px">
        {categories.map((category) => {
          const active = category.homeId === activeCategory?.homeId;
          return (
            <button
              key={category.homeId}
              ref={(element) => {
                if (element) {
                  categoryButtonRefs.current.set(category.homeId, element);
                } else {
                  categoryButtonRefs.current.delete(category.homeId);
                }
              }}
              type="button"
              className={clsx(
                'h-32px min-w-62px shrink-0 rounded-full px-12px text-14px',
                active
                  ? 'bg-[var(--ThemeColor-Main)] font-600 text-[var(--White-100)]'
                  : 'text-[var(--Text-800)]',
              )}
              onClick={() => setActiveHomeId(category.homeId)}
            >
              {CATEGORY_LABELS[category.homeId] ?? category.name}
            </button>
          );
        })}
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-10px px-12px py-10px">
        {activeVenues.map((venue) => {
          const active = venue.gameId === activeGameId;
          return (
            <button
              key={venue.gameId}
              type="button"
              className={clsx(
                'h-32px truncate rounded-5px border px-4px text-12px',
                active
                  ? 'border-[var(--ThemeColor-Main)] bg-[var(--ThemeColor-Main)] font-600 text-[var(--White-100)]'
                  : 'border-[var(--Line-100)] bg-[var(--Background-300)] text-[var(--Text-800)]',
              )}
              onClick={() => setActiveGameId(venue.gameId)}
            >
              {venue.name}
            </button>
          );
        })}
      </div>

      <div
        ref={recordScrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-12px pb-12px"
        onScroll={(event) => {
          if (!recordHasUserScrolled && event.currentTarget.scrollTop > 0) {
            setRecordHasUserScrolled(true);
          }
        }}
      >
        {venueLoading || recordLoading ? (
          <RecordSkeleton />
        ) : recordError && records.length === 0 ? (
          <RecordState text="加载失败，请重试" />
        ) : activeVenues.length === 0 ? (
          <RecordState text="该分类暂无场馆" />
        ) : records.length === 0 ? (
          <Empty className="h-full min-h-180px" />
        ) : (
          <div className="flex flex-col gap-10px">
            {records.map((record) => (
              <BetRecordCard
                key={record.orderId}
                record={record}
                theme={theme}
                isSport={activeCategory?.homeId === HomeListId.SPORTS}
              />
            ))}
            {isFetchNextRecordPageError ? (
              <button
                type="button"
                className="h-40px text-12px text-[var(--ThemeColor-Main)]"
                onClick={() => void fetchNextRecordPage()}
              >
                加载失败，点击重试
              </button>
            ) : hasNextRecordPage ? (
              <div ref={recordSentinelRef}>
                <Skeleton type="base" baseClassName="h-56px rounded-12px" />
              </div>
            ) : (
              <p className="py-4px text-center text-12px text-[var(--Text-800)]">
                - 我是有底线的 -
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const BetRecordCard: React.FC<{
  record: CustomerServiceBetRecord;
  theme: ResolvedTheme;
  isSport: boolean;
}> = ({ record, theme, isSport }) => {
  if (record.isParlay) {
    return (
      <div className="overflow-hidden rounded-12px bg-[var(--Background-300)]">
        <div className="flex h-40px items-center gap-8px border-b border-b-solid border-[var(--Line-100)] px-12px">
          <span className="text-14px font-600 text-[var(--Text-Main-10)]">串关投注</span>
          <span className="text-12px text-[var(--Text-800)]">{record.parlayType}</span>
          {!!Number(record.odds) && (
            <span className="text-12px text-[var(--ThemeColor-Main)]">@{record.odds}</span>
          )}
          <BetStatus status={record.betStatus} theme={theme} />
        </div>
        {(record.details ?? []).map((detail, index) => (
          <div
            key={`${detail.matchName}-${index}`}
            className="border-b border-b-solid border-[var(--Line-100)] px-12px py-10px"
          >
            <div className="flex items-start justify-between gap-8px">
              <p className="min-w-0 flex-1 truncate text-14px font-600 text-[var(--Text-Main-10)]">
                {detail.matchName || '—'}
              </p>
              <BetStatus status={detail.betStatus ?? record.betStatus} theme={theme} />
            </div>
            <p className="mt-8px text-12px text-[var(--Text-Main-10)]">
              {detail.marketName || '—'}
              {oddsTypeText(detail.oddsType) ? ` | ${oddsTypeText(detail.oddsType)}` : ''}
            </p>
            <MetaLine label="投注场馆" value={detail.vendor || record.vendor || '—'} />
            <MetaLine
              label="投注时间"
              value={formatRecordTime(detail.createTime ?? record.createTime)}
            />
          </div>
        ))}
        <div className="px-12px py-12px">
          <CopyMetaLine label="投注单号" value={record.orderId} />
          <div className="mt-8px flex justify-between gap-12px">
            <MetaLine label="投注本金" value={formatAmount(record.betAmount)} inline />
            <MetaLine label="返还" value={formatAmount(record.netAmount)} inline highlight />
          </div>
        </div>
      </div>
    );
  }

  const detail = record.details?.[0];
  return (
    <div className="rounded-12px bg-[var(--Background-300)] px-14px py-12px">
      <div className="flex items-center justify-between gap-12px">
        <p className="min-w-0 flex-1 truncate text-14px font-600 text-[var(--Text-Main-10)]">
          {detail?.matchName || record.matchName || '—'}
        </p>
        <BetStatus status={record.betStatus} theme={theme} />
      </div>
      {isSport && (
        <p className="mt-2px text-12px text-[var(--Text-Main-10)]">
          {detail?.marketName || record.marketName || '—'}
          {oddsTypeText(detail?.oddsType ?? record.oddsType)
            ? ` | ${oddsTypeText(detail?.oddsType ?? record.oddsType)}`
            : ''}
        </p>
      )}
      <div className="mt-8px">
        <CopyMetaLine label="投注单号" value={record.orderId} />
        <MetaLine label="投注场馆" value={detail?.vendor || record.vendor || '—'} />
        <MetaLine label="投注时间" value={formatRecordTime(record.createTime)} />
        <div className="mt-8px flex justify-between gap-12px">
          <MetaLine label="投注本金" value={formatAmount(record.betAmount)} inline />
          <MetaLine label="返还" value={formatAmount(record.netAmount)} inline highlight />
        </div>
      </div>
    </div>
  );
};

const TRANSACTION_TABS = [
  { id: 'deposit', label: '存款' },
  { id: 'withdraw', label: '提现' },
  { id: 'bonus', label: '红利' },
] as const;

type TransactionTab = (typeof TRANSACTION_TABS)[number]['id'];

interface TransactionDisplayRecord {
  id: string;
  type: TransactionTab;
  title: string;
  status: string;
  statusTone: 'success' | 'warning' | 'default';
  orderId?: string;
  timeLabel: string;
  time: string;
  amountLabel: string;
  amount: number;
  platformType?: string;
  multiple?: number;
  usdtAmount?: number;
  showUsdtAmount?: boolean;
  failureTip?: string;
}

const TRANSACTION_PAGE_SIZE = 20;

interface TransactionRecordPage {
  records: TransactionDisplayRecord[];
  pageNumber: number;
  totalPage?: number;
  totalSize?: number;
}

async function getTransactionRecordPage(
  activeTab: TransactionTab,
  pageNumber: number,
): Promise<TransactionRecordPage> {
  const params = {
    pageSize: TRANSACTION_PAGE_SIZE,
    pageNumber,
    beginTime: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
    endTime: dayjs().format('YYYY-MM-DD'),
    tradeMainStatus: '' as TradeMainStatus,
  };

  if (activeTab === 'deposit') {
    const response = await getDepositRecordReq(params);
    return {
      records: mapDepositRecords(response.data?.list ?? []),
      pageNumber,
      totalPage: response.data?.totalPage,
      totalSize: response.data?.totalSize,
    };
  }

  if (activeTab === 'withdraw') {
    const response = await getCustomerServiceWithdrawRecordReq({
      pageSize: params.pageSize,
      pageNumber: params.pageNumber,
      beginTime: params.beginTime,
      endTime: params.endTime,
    });
    return {
      records: mapWithdrawRecords(response.data?.list ?? []),
      pageNumber,
      totalPage: response.data?.totalPage,
      totalSize: response.data?.totalSize,
    };
  }

  const response = await getCustomerServiceBonusRecordReq({
    pageSize: params.pageSize,
    pageNumber: params.pageNumber,
    beginTime: params.beginTime,
    endTime: params.endTime,
  });
  return {
    records: mapBonusRecords(response.data?.list ?? []),
    pageNumber,
    totalPage: response.data?.totalPage,
    totalSize: response.data?.totalSize,
  };
}

const TransactionRecordsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransactionTab>('deposit');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sentinelEnteredRef = useRef(false);
  const [inViewport] = useInViewport(sentinelRef);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<TransactionRecordPage, Error>({
    queryKey: ['customer-service', 'transaction-records', activeTab],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getTransactionRecordPage(activeTab, Number(pageParam)),
    getNextPageParam: (lastPage) => {
      if (lastPage.totalPage && lastPage.totalPage > 0) {
        return lastPage.pageNumber < lastPage.totalPage ? lastPage.pageNumber + 1 : undefined;
      }
      if (lastPage.totalSize !== undefined) {
        return lastPage.pageNumber * TRANSACTION_PAGE_SIZE < lastPage.totalSize
          ? lastPage.pageNumber + 1
          : undefined;
      }
      return lastPage.records.length === TRANSACTION_PAGE_SIZE
        ? lastPage.pageNumber + 1
        : undefined;
    },
    staleTime: 0,
    retry: false,
  });
  const records = useMemo(() => data?.pages.flatMap((page) => page.records) ?? [], [data]);

  useEffect(() => {
    if (!inViewport) {
      sentinelEnteredRef.current = false;
      return;
    }
    if (sentinelEnteredRef.current) return;
    sentinelEnteredRef.current = true;

    if (inViewport && hasNextPage && !isLoading && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inViewport, isFetchNextPageError, isFetchingNextPage, isLoading]);

  return (
    <>
      <div className="mx-10px mt-4px flex h-30px shrink-0 rounded-full bg-[var(--Background-300)] p-2px">
        {TRANSACTION_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={clsx(
                'h-26px flex-1 rounded-full text-14px',
                active
                  ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)]'
                  : 'text-[var(--Text-800)]',
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-10px min-h-0 flex-1 overflow-y-auto px-10px pb-12px">
        {isLoading ? (
          <RecordSkeleton />
        ) : isError && records.length === 0 ? (
          <RecordState text="加载失败，请重试" />
        ) : records.length === 0 ? (
          <Empty className="h-full min-h-180px" />
        ) : (
          <div className="flex flex-col gap-10px">
            {records.map((record) => (
              <TransactionRecordCard key={record.id} record={record} />
            ))}
            {isFetchNextPageError ? (
              <button
                type="button"
                className="h-40px text-12px text-[var(--ThemeColor-Main)]"
                onClick={() => void fetchNextPage()}
              >
                加载失败，点击重试
              </button>
            ) : hasNextPage ? (
              <div ref={sentinelRef}>
                <Skeleton type="base" baseClassName="h-56px rounded-8px" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};

const TransactionRecordCard: React.FC<{ record: TransactionDisplayRecord }> = ({ record }) => (
  <div className="rounded-8px bg-[var(--Background-300)] px-12px py-12px">
    <div className="flex items-start justify-between gap-12px">
      <p className="min-w-0 flex-1 truncate text-14px font-600 text-[var(--Text-Main-10)]">
        {record.title}
      </p>
      <div className="flex shrink-0 items-center">
        <p
          className={clsx(
            'text-14px font-400 leading-[1.43]',
            transactionStatusColor(record.statusTone),
          )}
        >
          {record.status}
        </p>
        {record.failureTip && (
          <Popover
            trigger="click"
            placement="bottom-end"
            content={
              <p className="max-w-[50vw] px-2px py-4px text-12px font-400 leading-[1.5] text-[var(--Text-800)]">
                {record.failureTip}
              </p>
            }
          >
            <button
              type="button"
              className="ml-4px flex size-18px items-center justify-center text-[var(--Text-700)]"
              aria-label="查看审核拒绝原因"
            >
              <CircleTipDownSvg className="size-18px" />
            </button>
          </Popover>
        )}
      </div>
    </div>
    {record.type === 'bonus' ? (
      <>
        <div className="mt-12px flex justify-between gap-8px">
          <MetaLine label="适用场馆" value={record.platformType || '—'} inline />
          <MetaLine label="红利金额" value={formatAmount(record.amount)} inline highlight />
        </div>
        <div className="mt-8px">
          <MetaLine label="取款流水" value={`${record.multiple ?? 0}倍`} inline />
        </div>
        <div className="mt-8px">
          <MetaLine label="发放时间" value={record.time || '—'} inline />
        </div>
      </>
    ) : (
      <>
        {record.orderId && (
          <div className={record.type === 'withdraw' ? 'mt-12px' : 'mt-8px'}>
            <TransactionOrderLine value={record.orderId} />
          </div>
        )}
        <div className="mt-8px">
          <MetaLine label={record.timeLabel} value={record.time || '—'} inline />
        </div>
        <div className="mt-8px">
          <MetaLine
            label={record.amountLabel}
            value={formatAmount(record.amount)}
            inline
            highlight
          />
        </div>
        {record.showUsdtAmount && (
          <p
            className={clsx(
              'mt-6px text-right text-12px font-600',
              transactionStatusColor(record.statusTone),
            )}
          >
            ({record.usdtAmount}USDT)
          </p>
        )}
      </>
    )}
  </div>
);

const TransactionOrderLine: React.FC<{ value: string }> = ({ value }) => (
  <div className="flex min-w-0 items-center text-12px">
    <span className="shrink-0 text-[var(--Text-Main-10)]">订单号:</span>
    <span className="ml-4px min-w-0 truncate text-[var(--Text-800)]" title={value}>
      {value || '—'}
    </span>
    {!!value && (
      <button
        type="button"
        className="ml-2px flex size-16px shrink-0 items-center justify-center"
        aria-label="复制订单号"
        onClick={() => {
          void navigator.clipboard.writeText(value).then(() => {
            toast({ type: 'success', description: '复制成功' });
          });
        }}
      >
        <Icon src="/images/common/copy.svg" size={16} color="var(--Text-800)" aria-hidden />
      </button>
    )}
  </div>
);

function transactionStatusColor(tone: TransactionDisplayRecord['statusTone']): string {
  switch (tone) {
    case 'success':
      return 'text-[var(--Green-400)]';
    case 'warning':
      return 'text-[var(--Warning-100)]';
    default:
      return 'text-[var(--Text-Main-10)]';
  }
}

function depositStatusText(item: TDepositRecordItem): string {
  if (item.status) return item.status;
  const labels: Partial<Record<number, string>> = {
    2: '成功',
    9: '成功',
    1: '处理中',
    [-1]: '已取消',
    [-3]: '已取消',
    [-2]: '失败',
  };
  return labels[item.statusId] ?? '—';
}

function withdrawStatusText(item: TWithdrawRecordItem): string {
  if (item.status) return item.status;
  const labels: Partial<Record<number, string>> = {
    2: '成功',
    9: '成功',
    1: '处理中',
    0: '处理中',
    [-3]: '已取消',
    [-1]: '失败',
    [-2]: '失败',
  };
  return labels[item.statusId] ?? '—';
}

function bonusStatusText(item: TBonusRecordItem): string {
  if (item.status) return item.status;
  const labels: Partial<Record<number, string>> = {
    2: '已发放',
    9: '已发放',
    1: '处理中',
    [-1]: '失败',
    [-2]: '失败',
  };
  return labels[item.statusId] ?? '—';
}

function statusTone(
  type: TransactionTab,
  statusId: number,
): TransactionDisplayRecord['statusTone'] {
  if (statusId === 2 || statusId === 9) return 'success';
  if (type === 'bonus') {
    return statusId === -1 || statusId === -2 || statusId === 0 ? 'warning' : 'default';
  }
  return statusId === 0 || statusId === 1 ? 'warning' : 'default';
}

function maskAccount(value?: string | null): string {
  if (!value) return '***';
  if (value.length < 2) return `${value}***`;
  if (value.length < 5) return `${value.slice(0, 2)}***${value.slice(-2)}`;
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function mapDepositRecords(list: TDepositRecordItem[]): TransactionDisplayRecord[] {
  return list.map((item) => ({
    id: item.orderId,
    type: 'deposit',
    title: item.actionType || '—',
    status: depositStatusText(item),
    statusTone: statusTone('deposit', item.statusId),
    orderId: item.orderId,
    timeLabel: '充值时间',
    time: item.addTime,
    amountLabel: '充值金额',
    amount: item.cash,
  }));
}

function mapWithdrawRecords(list: TWithdrawRecordItem[]): TransactionDisplayRecord[] {
  return list.map((item) => ({
    id: item.orderId,
    type: 'withdraw',
    title: item.cashTypeDesc || `提款至: ${maskAccount(item.card)}`,
    status: withdrawStatusText(item),
    statusTone: statusTone('withdraw', item.statusId),
    orderId: item.orderId,
    timeLabel: '提款时间',
    time: item.addTime,
    amountLabel: '提款金额',
    amount: item.cash,
    usdtAmount: item.num,
    showUsdtAmount: item.canCancel === false && item.num !== 0,
    failureTip:
      (item.statusId === EWithdrawStatusId.AuditFailed ||
        item.statusId === EWithdrawStatusId.Rejected) &&
      item.failInfo?.trim()
        ? item.failInfo
        : undefined,
  }));
}

function mapBonusRecords(list: TBonusRecordItem[]): TransactionDisplayRecord[] {
  return list.map((item) => ({
    id: item.orderId,
    type: 'bonus',
    title: item.bonusName || '红利',
    status: bonusStatusText(item),
    statusTone: statusTone('bonus', item.statusId),
    timeLabel: '发放时间',
    time: item.addTime,
    amountLabel: '红利金额',
    amount: item.cash,
    platformType: item.platformType,
    multiple: item.multiple,
  }));
}

const MetaLine: React.FC<{
  label: string;
  value: string;
  inline?: boolean;
  highlight?: boolean;
}> = ({ label, value, inline, highlight }) => (
  <div className={clsx('flex min-w-0 items-center text-12px', inline ? 'mt-0' : 'mt-8px')}>
    <span className="shrink-0 text-[var(--Text-Main-10)]">{label}：</span>
    <span
      className={clsx(
        'min-w-0 truncate din-pro',
        highlight ? 'text-[var(--ThemeColor-Main)]' : 'text-[var(--Text-800)]',
      )}
      title={value}
    >
      {value}
    </span>
  </div>
);

const CopyMetaLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex min-w-0 items-center text-12px">
    <span className="shrink-0 text-[var(--Text-Main-10)]">{label}：</span>
    <span className="min-w-0 truncate text-[var(--Text-800)]" title={value}>
      {value || '—'}
    </span>
    {!!value && (
      <button
        type="button"
        className="ml-2px flex size-16px shrink-0 items-center justify-center"
        aria-label={`复制${label}`}
        onClick={() => {
          void navigator.clipboard.writeText(value).then(() => {
            toast({ type: 'success', description: '复制成功' });
          });
        }}
      >
        <Icon src="/images/common/copy.svg" size={16} color="var(--Text-800)" aria-hidden />
      </button>
    )}
  </div>
);

const BetStatus: React.FC<{
  status: number;
  theme: ResolvedTheme;
}> = ({ status, theme }) => {
  const icon = BET_STATUS_ICONS[status] ?? {
    name: 'bet_record_anomaly.webp',
    label: '异常',
  };
  const directory = icon.themed ? theme : 'common';

  return (
    <img
      className="ml-auto size-28px shrink-0 object-contain"
      src={`/images/${directory}/record/${icon.name}`}
      alt={icon.label}
      title={icon.label}
    />
  );
};

const RecordSkeleton = () => (
  <div className="flex flex-col gap-10px">
    {[0, 1, 2].map((item) => (
      <Skeleton key={item} type="base" baseClassName="h-116px rounded-12px" />
    ))}
  </div>
);

const RecordState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex h-full min-h-180px items-center justify-center text-14px text-[var(--Text-800)]">
    {text}
  </div>
);

function formatAmount(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

function formatRecordTime(value?: string | number): string {
  if (value === undefined || value === null || value === '') return '—';
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const timestamp = String(Math.trunc(numeric)).length <= 10 ? numeric * 1000 : numeric;
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : String(value);
}

function oddsTypeText(value?: string | number): string {
  const labels: Record<number, string> = {
    1: '欧洲盘',
    2: '香港盘',
    3: '马来盘',
    4: '印尼盘',
  };
  return labels[Number(value)] ?? '';
}

export default CustomerServiceRecordModal;
