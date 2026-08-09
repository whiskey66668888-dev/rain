import { usePopupChannel } from '@/common/hooks/popupWindows/usePopupChannel';
import { EPopupWindowKey, getPopupChannelName } from '@/common/hooks/popupWindows/windowManager';
import useBetHistory from '@/common/hooks/betHistory/useBetHistory';
import { BetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { EBetHistoryType, tabListPC } from '@/common/hooks/betHistory/constants';
import PageHeader from './components/PageHeader';
import BetHistoryTable from './components/BetHistoryTable';
import TableFooter from './components/TableFooter';
import clsx from 'clsx';
import { EBetHistoryTab } from '@/apis/commonSports/constants';
import ReserveSubFilter from './components/ReserveSubFilter';
import SettledSubFilter from './components/SettledSubFilter';
import UnsettledSubFilter from './components/UnsettledSubFilter';
import EarlySettleConfirmModal from '../components/EarlySettleConfirmModal';
import ReserveEarlySettleConfirmModal from '../components/ReserveEarlySettleConfirmModal';
import CancelReserveEarlySettleConfirmModal from '../components/CancelReserveEarlySettleConfirmModal';
import ReserveEditConfirmModal from '../components/ReserveEditConfirmModal';
import CancelReserveBetConfirmModal from '../components/CancelReserveBetConfirmModal';

const BetHistoryPcPage = () => {
  usePopupChannel(getPopupChannelName(EPopupWindowKey.BetHistory));

  const all = useBetHistory(EBetHistoryType.PC_PAGE);
  const { activeTab, activeVenue, changeActiveTab } = all;

  return (
    <BetHistoryContext.Provider value={all}>
      <div className="h-full w-full bg-[var(--Background-700)] overflow-auto">
        <div className="h-full w-full flex-1-col-hidden min-h-560px min-w-960px">
          {/* 顶部 logo + 标题 */}
          <PageHeader />

          <div className="flex-1-col-hidden gap-20px p-20px">
            {/* 主 Tab 栏 */}
            <div className="shrink-0 flex gap-12px items-center">
              {tabListPC.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    className={clsx(
                      'px-20px _tf[14] h-32px rounded-full',
                      'transition-colors duration-150',
                      isActive
                        ? 'text-[var(--White-100)] font-medium bg-[var(--ThemeColor-Main)]'
                        : 'text-[var(--Text-Main-10)] bg-[var(--Background-300)]',
                    )}
                    onClick={() => changeActiveTab({ activeVenue, activeTab: tab.value })}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 二级筛选栏 */}
            <>
              {activeTab === EBetHistoryTab.UNSETTLED && <UnsettledSubFilter />}
              {activeTab === EBetHistoryTab.SETTLED && <SettledSubFilter />}
              {activeTab === EBetHistoryTab.RESERVE && <ReserveSubFilter />}
            </>

            {/* 数据表格（可滚动区域） */}
            <BetHistoryTable />
            {/* 分页器 */}
            <TableFooter />
          </div>
        </div>
      </div>
      <EarlySettleConfirmModal />
      <ReserveEarlySettleConfirmModal />
      <CancelReserveEarlySettleConfirmModal />
      <ReserveEditConfirmModal />
      <CancelReserveBetConfirmModal />
    </BetHistoryContext.Provider>
  );
};

export default BetHistoryPcPage;
