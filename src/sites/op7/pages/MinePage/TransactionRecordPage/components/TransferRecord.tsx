import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { useInViewport } from 'ahooks';
import { useTransferRecordQuery } from '@/apis/origin/transactionRecord/moneychange';
import dayjs from 'dayjs';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { TDateRange } from '@/utils/dateHelper';
import { formatNumber } from '../utils';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import { PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker-view';

interface TransferRecordProps {
  dateRange: TDateRange;
  setSimplePickerData: React.Dispatch<React.SetStateAction<PickerColumnItem[]>>;
  setTotalInfo?: React.Dispatch<React.SetStateAction<{ totalAmount: number; totalSize: number }>>;
  currentPickerType: PickerValue;
  onItemClick?: (orderId: string) => void;
}

export const TransferRecord = ({
  dateRange,
  setSimplePickerData,
  setTotalInfo,
  currentPickerType,
  onItemClick,
}: TransferRecordProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [inViewport] = useInViewport(sentinelRef);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTransferRecordQuery({
      beginTime: dayjs(dateRange[0]).format('YYYY-MM-DD'),
      endTime: dayjs(dateRange[1]).format('YYYY-MM-DD'),
      pageSize: 10,
      tradeMainStatus: currentPickerType as TradeMainStatus,
    });

  const list = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.list);
  }, [data]);
  useEffect(() => {
    const options = data?.pages[0]?.statusFilter?.options;
    if (options) {
      setSimplePickerData(options);
    }
    if (setTotalInfo) {
      setTotalInfo({
        totalAmount: data?.pages[0]?.totalAmount || 0,
        totalSize: data?.pages[0]?.totalSize || 0,
      });
    }
  }, [data, setSimplePickerData, setTotalInfo]);
  // 视口触底加载更多
  useEffect(() => {
    if (inViewport && hasNextPage && !isLoading && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inViewport]);

  if (!list.length && isLoading) {
    return [...Array(5).keys()].map((index) => (
      <Skeleton key={index} type="base" baseClassName="h-64px mb-1px" />
    ));
  }

  if (!list.length && !isLoading) {
    return <Empty />;
  }

  return (
    <div className="flex flex-col">
      {list.map((item, index) => (
        <div
          key={item.orderId}
          className={clsx('p-12px flex justify-between bg-[var(--Background-300)] cursor-pointer', {
            'border-b-solid border-b-0.5px border-[var(--Line-100)]': index !== list.length - 1,
          })}
          onClick={() => {
            if (item.walletTransfer) onItemClick?.(item.orderId);
          }}
        >
          <div className="flex flex-col gap-4px">
            <p className="_tf[14] font-500 leading-[1.43] text-[var(--Text-Main-10)]">
              {item.change}
            </p>
            <p className="_tf[12] leading-[1.33] text-[var(--Text-800)]">{item.addTime}</p>
          </div>
          <div className="flex items-center gap-8px">
            <div className="flex flex-col items-end gap-4px">
              <p className="_tf[16] font-500 leading-[1.5] din-pro text-[var(--Text-Main-10)]">
                {formatNumber(item.cash)}
              </p>
              <div className="flex items-center gap-4px">
                <span
                  className={clsx(
                    'inline-block w-6px h-6px rounded-full flex-shrink-0 bg-[var(--Green-300,#13bf30)]',
                  )}
                />
                <p className={clsx('_tf[12] leading-[1.33] text-[var(--Green-300,#13bf30)]')}>
                  已完成
                </p>
              </div>
            </div>
            <ArrowRightSvg className="w-14px h-14px flex-shrink-0 text-[var(--Text-700)]" />
          </div>
        </div>
      ))}

      {/* 分页加载 sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef}>
          <Skeleton type="base" baseClassName="h-56px" />
        </div>
      )}
    </div>
  );
};
