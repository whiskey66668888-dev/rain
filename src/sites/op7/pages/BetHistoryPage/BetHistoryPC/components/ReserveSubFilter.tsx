import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { reserveTabs } from '@/common/hooks/betHistory/constants';
import SegmentedControl from '@/common/components/SegmentedControl';

const ReserveSubFilter = () => {
  const { activeVenue, queryParams } = useBetHistoryContext();
  const { changeQueryType } = useBetHistoryBaseMethods();

  return (
    <SegmentedControl
      options={reserveTabs}
      value={queryParams?.queryType as unknown as number}
      onChange={(val) => {
        changeQueryType({ activeVenue, queryType: val });
      }}
      height={28}
      className="shrink-0 self-start bg-[var(--Background-300)]"
    />
  );
};

export default ReserveSubFilter;
