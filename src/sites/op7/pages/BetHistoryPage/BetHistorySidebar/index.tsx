import { useCallback, useEffect, useRef } from 'react';
import { useInViewport } from 'ahooks';
import { EBetHistoryQueryType, EBetHistoryTab } from '@/apis/commonSports/constants';
import useBetHistory from '@/common/hooks/betHistory/useBetHistory';
import { BetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { EBetHistoryType, reserveTabs, tabListSidebar } from '@/common/hooks/betHistory/constants';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { bigNB } from '@/utils/bet/bigMath';
import SidebarBetCard from './SidebarBetCard';
import EarlySettleConfirmModal from '../components/EarlySettleConfirmModal';
import ReserveEarlySettleConfirmModal from '../components/ReserveEarlySettleConfirmModal';
import CancelReserveEarlySettleConfirmModal from '../components/CancelReserveEarlySettleConfirmModal';
import ReserveEditConfirmModal from '../components/ReserveEditConfirmModal';
import CancelReserveBetConfirmModal from '../components/CancelReserveBetConfirmModal';
import clsx from 'clsx';

const BetHistorySidebar = () => {
  const all = useBetHistory(EBetHistoryType.PC_SIDEBAR);
  const {
    activeTab,
    activeVenue,
    list,
    stats,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoading,
    queryParams,
    changeActiveTab,
  } = all;
  const { changeQueryType } = useBetHistoryBaseMethods();

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [inViewport] = useInViewport(sentinelRef);

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetching) fetchNextPage?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inViewport]);

  const handleTabChange = useCallback(
    (tab: EBetHistoryTab) => {
      changeActiveTab({ activeVenue, activeTab: tab });
    },
    [activeVenue, changeActiveTab],
  );

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-8px p-10px">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} type="base" baseClassName="h-120px" />
          ))}
        </div>
      );
    }
    if (!list.length) {
      return <Empty variant="card" />;
    }
    return (
      <div className="flex flex-col gap-4px">
        {list.map((order) => (
          <SidebarBetCard key={order.orderId} order={order} />
        ))}
        {hasNextPage && (
          <div ref={sentinelRef}>
            <Skeleton type="base" baseClassName="h-100px" />
          </div>
        )}
      </div>
    );
  };

  return (
    <BetHistoryContext.Provider value={all}>
      <div className="flex-1-col-hidden gap-4px pt-8px px-12px pb-12px">
        {/* Tab bar: 未结算 / 预约投注 */}
        <div className="shrink-0 flex rounded-4px overflow-hidden">
          {tabListSidebar.map((item) => {
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleTabChange(item.value)}
                className={clsx('flex-1 shrink-0 h-30px _tf[12]', {
                  'bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-medium pointer-events-none':
                    isActive,
                  'bg-[var(--Background-500)] text-[var(--Text-800)]': !isActive,
                })}
              >
                {item.label_s}
              </button>
            );
          })}
        </div>

        {/* Stats row: 总计 | 总投注额 */}
        <div className="shrink-0 bg-[var(--Background-500)] rounded-6px">
          {activeTab === EBetHistoryTab.RESERVE && (
            <div
              className={clsx(
                'flex ',
                queryParams?.queryType !== EBetHistoryQueryType.RESERVE_FAIL &&
                  'shadow-[0_-0.5px_0_0_var(--Line-200)_inset]',
              )}
            >
              {reserveTabs.map((i) => (
                <button
                  key={i.value}
                  className={clsx(
                    'flex-1 shrink-0 h-32px relative _tf[12] font-400 text-[var(--Text-800)]',
                    {
                      'text-[var(--ThemeColor-Main)] font-medium pointer-events-none after:content-empty after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[32px] after:h-[2px] after:bg-[var(--ThemeColor-Main)]':
                        queryParams?.queryType === i.value,
                    },
                  )}
                  type="button"
                  onClick={() => changeQueryType({ activeVenue, queryType: i.value })}
                >
                  {i.label}
                </button>
              ))}
            </div>
          )}
          {queryParams?.queryType !== EBetHistoryQueryType.RESERVE_FAIL && (
            <div className="flex gap-8px p-8px">
              <div className="shrink-0 flex-1 flex flex-col items-center gap-4px">
                <p className="_tf[10] leading-[1.2] text-[var(--Text-Main-10)]">总计</p>
                <p className="_tf[12] leading-[1.17]">
                  <span className="text-[var(--ThemeColor-Main)] font-medium din-pro">
                    {stats.totalOrderCount}
                  </span>
                  <span className="text-[var(--Text-800)] ml-2px">单</span>
                </p>
              </div>
              <div className="w-0.5px bg-[var(--Line-200)]" />
              <div className="shrink-0 flex-1 flex flex-col items-center gap-4px">
                <p className="_tf[10] leading-[1.2] text-[var(--Text-Main-10)]">总投注额</p>
                <p className="_tf[12] leading-[1.17] font-medium din-pro text-[var(--ThemeColor-Main)]">
                  {bigNB(stats.totalBetAmount).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order list */}
        <div className="flex-1-col-hidden overflow-y-auto">{renderList()}</div>
      </div>

      {/* 全局确认弹窗（立即结算 / 预约结算 / 取消预约） */}
      <EarlySettleConfirmModal />
      <ReserveEarlySettleConfirmModal />
      <CancelReserveEarlySettleConfirmModal />
      <ReserveEditConfirmModal />
      <CancelReserveBetConfirmModal />
    </BetHistoryContext.Provider>
  );
};

export default BetHistorySidebar;
