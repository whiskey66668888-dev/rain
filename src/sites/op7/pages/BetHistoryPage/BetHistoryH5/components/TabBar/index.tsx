import clsx from 'clsx';
import { useCallback } from 'react';
import { EBetHistoryTab } from '@/apis/commonSports/constants';
import SegmentedControl from '@/common/components/SegmentedControl';
import { DoubleArrowUpSvg } from '@/sites/op7/components/SvgIcons';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { tabListH5 } from '@/common/hooks/betHistory/constants';

interface TabBarProps {
  allCollapsed: boolean;
  onToggleAll: () => void;
}

const TabBar = ({ allCollapsed, onToggleAll }: TabBarProps) => {
  const { activeVenue, activeTab, changeActiveTab } = useBetHistoryContext();

  const handleChange = useCallback(
    (tab: EBetHistoryTab) => {
      changeActiveTab({ activeVenue: activeVenue, activeTab: tab });
    },
    [activeVenue, changeActiveTab],
  );

  return (
    <div className="flex gap-10px items-center py-6px">
      <SegmentedControl
        options={tabListH5.map((tab) => ({
          value: tab.value,
          label: <span className="_tf[14]">{tab.label_s}</span>,
        }))}
        value={activeTab}
        onChange={handleChange}
        className="w-full"
        height={36}
      />
      {activeTab !== EBetHistoryTab.RESULTS && (
        <button onClick={onToggleAll} className="shrink-0 flex items-center justify-center">
          <DoubleArrowUpSvg
            className={clsx(
              'w-14px h-14px text-[var(--Text-800)]',
              'transition-transform duration-200',
              allCollapsed && 'rotate-180',
            )}
          />
        </button>
      )}
    </div>
  );
};

export default TabBar;
