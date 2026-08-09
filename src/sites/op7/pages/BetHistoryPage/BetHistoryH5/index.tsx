import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInViewport } from 'ahooks';
import { EBetHistoryTab } from '@/apis/commonSports/constants';
import TabBar from './components/TabBar';
import BetRecordCard from './components/BetRecordCard';
import useBetHistory from '@/common/hooks/betHistory/useBetHistory';
import { BetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import VenueTabBar from './components/VenueTabBar';
import AnnouncementBar from './components/AnnouncementBar';
import SubTabBarSettled from './components/SubTabBarSettled';
import SubTabBarReserve from './components/SubTabBarReserve';
import SubTabBarResults from './components/SubTabBarResults';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { ClientOnly } from '@/common/components/ClientOnly';
import ResultMatchList from './components/ResultMatchList';
import clsx from 'clsx';
import { EBetHistoryType } from '@/common/hooks/betHistory/constants';
import EarlySettleSheet from './components/BetRecordCard/components/EarlySettleSheet';
import EarlySettleConfirmModal from '../components/EarlySettleConfirmModal';
import ReserveEarlySettleSheet from './components/BetRecordCard/components/ReserveEarlySettleSheet';
import ReserveEarlySettleConfirmModal from '../components/ReserveEarlySettleConfirmModal';
import CancelReserveEarlySettleConfirmModal from '../components/CancelReserveEarlySettleConfirmModal';
import ReserveEditConfirmModal from '../components/ReserveEditConfirmModal';
import CancelReserveBetConfirmModal from '../components/CancelReserveBetConfirmModal';
import { useResultFilter } from './hooks/useResultFilter';

// ── 主页面 ──────────────────────────────────────────

const LIST_TABS = [EBetHistoryTab.UNSETTLED, EBetHistoryTab.SETTLED, EBetHistoryTab.RESERVE];

const BetHistoryH5 = () => {
  const all = useBetHistory(EBetHistoryType.H5);
  const { activeTab, list, isFetching, fetchNextPage, hasNextPage, isLoading } = all;

  const {
    resultSearchValue,
    resultLeagueOptions,
    resultListCollapsed,
    handleResultSearchChange,
    handleResultLeagueOptionsChange,
    handleCloseResultSearchPanel,
    toggleResultListCollapsed,
  } = useResultFilter({ activeTab });

  // #region 注单卡片折叠
  const [collapsedMap, setCollapsedMap] = useState<Record<string, true>>({});
  const allCollapsed = useMemo(
    () => list.length > 0 && list.every((o) => !!collapsedMap[o.orderId]),
    [list, collapsedMap],
  );

  const toggleOne = useCallback((orderId: string) => {
    setCollapsedMap((prev) => {
      const next = { ...prev };
      if (next[orderId]) {
        delete next[orderId];
      } else {
        next[orderId] = true;
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allCollapsed) {
      setCollapsedMap({});
    } else {
      const next: Record<string, true> = {};
      list.forEach((o) => {
        next[o.orderId] = true;
      });
      setCollapsedMap(next);
    }
  }, [allCollapsed, list]);
  // #endregion

  // #region 触底分页
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [inViewport] = useInViewport(sentinelRef);

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetching) {
      fetchNextPage?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inViewport]);
  // #endregion

  // #region 渲染注单列表
  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-12px px-10px pt-10px">
          {[...Array(5).keys()].map((i) => (
            <Skeleton key={i} type="base" baseClassName="h-120px" />
          ))}
        </div>
      );
    }

    if (!list.length) {
      return (
        <ClientOnly>
          <Empty />
        </ClientOnly>
      );
    }

    return (
      <div className="flex flex-col gap-12px px-10px pt-10px pb-20px">
        {list.map((order) => (
          <BetRecordCard
            key={order.orderId}
            order={order}
            collapsed={!!collapsedMap[order.orderId]}
            onToggle={() => toggleOne(order.orderId)}
          />
        ))}

        {/* 触底 sentinel：进入视口时自动加载下一页 */}
        {hasNextPage && (
          <div ref={sentinelRef}>
            <Skeleton type="base" baseClassName="h-120px" />
          </div>
        )}
      </div>
    );
  }, [isLoading, hasNextPage, list, collapsedMap, toggleOne]);
  // #endregion

  return (
    <BetHistoryContext.Provider value={all}>
      <div
        className={clsx(
          'flex-1-col-hidden',
          '[--circle-image:radial-gradient(circle,var(--Circle-Image-Color)_3.5px,var(--Background-300)_3.5px)]',
          {
            'lg:max-h-[min(100dvh,100vh)] lg:shrink-0 lg:overflow-hidden':
              activeTab === EBetHistoryTab.RESULTS,
          },
        )}
      >
        {/* 顶部区域 */}
        <div className="shrink-0 bg-[var(--Background-300)]">
          <div className="px-10px">
            {/* 场馆切换 */}
            <VenueTabBar />
            {/* 公告栏 */}
            <AnnouncementBar />
            {/* Tab 栏 */}
            <TabBar allCollapsed={allCollapsed} onToggleAll={toggleAll} />
          </div>
          {/* subTab 栏 */}
          {activeTab === EBetHistoryTab.SETTLED && <SubTabBarSettled />}
          {activeTab === EBetHistoryTab.RESERVE && <SubTabBarReserve />}
          {activeTab === EBetHistoryTab.RESULTS && (
            <SubTabBarResults
              value={resultSearchValue}
              leagueOptions={resultLeagueOptions}
              onChange={handleResultSearchChange}
              resultListCollapsed={resultListCollapsed}
              onToggleResultListCollapsed={toggleResultListCollapsed}
            />
          )}
        </div>

        {/* 注单列表内容区域 */}
        {LIST_TABS.includes(activeTab) && (
          <div className="flex-1 overflow-y-auto lg:overflow-initial" key={activeTab}>
            {renderContent()}
          </div>
        )}

        {/* 赛果内容区域 */}
        {activeTab === EBetHistoryTab.RESULTS && (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden" key={activeTab}>
            {!resultSearchValue.collapsed && (
              <button
                type="button"
                className="absolute inset-0 z-10 border-0 p-0"
                style={{ background: 'var(--Black-80, rgba(0, 0, 0, 0.80))' }}
                onClick={handleCloseResultSearchPanel}
                aria-label="关闭赛果筛选面板"
              />
            )}
            <ResultMatchList
              searchValue={resultSearchValue}
              collapsed={resultListCollapsed}
              onLeagueOptionsChange={handleResultLeagueOptionsChange}
            />
          </div>
        )}
      </div>

      {/* ── 单例弹层：立即提前结算 / 预约提前结算（自取 context，无需传 props） ── */}
      <EarlySettleSheet />
      <EarlySettleConfirmModal />
      <ReserveEarlySettleSheet />
      <ReserveEarlySettleConfirmModal />
      <CancelReserveEarlySettleConfirmModal />
      <ReserveEditConfirmModal />
      <CancelReserveBetConfirmModal />
    </BetHistoryContext.Provider>
  );
};

export default BetHistoryH5;
