import { EBetHistoryQueryType, EBetHistoryTab } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { bigNB } from '@/utils/bet/bigMath';
import { useCallback } from 'react';

const StatItem = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div className="flex items-center gap-8px _tf[14]">
    <span className="text-[var(--Text-800)]">{label}</span>
    <span className="din-pro font-medium" {...(color && { style: { color } })}>
      {value}
    </span>
  </div>
);

const TableStats = () => {
  const { activeTab, stats, queryParams } = useBetHistoryContext();
  const { totalOrderCount, totalBetAmount, winOrLoseAmount } = stats;

  const isWin = bigNB(winOrLoseAmount).gt(0);
  const isLose = bigNB(winOrLoseAmount).lt(0);

  const renderContent = useCallback(() => {
    if (activeTab === EBetHistoryTab.UNSETTLED) {
      return (
        <>
          <StatItem label="总计单数：" value={String(totalOrderCount)} />

          <StatItem label="总投注额：" value={bigNB(totalBetAmount).toFixed(2)} />
        </>
      );
    }

    if (activeTab === EBetHistoryTab.SETTLED) {
      return (
        <div className="flex items-center gap-16px">
          <StatItem label="总计单数：" value={String(totalOrderCount)} />

          <StatItem label="总投注额：" value={bigNB(totalBetAmount).toFixed(2)} />

          <StatItem
            label="总输赢："
            value={(isWin ? '+' : '') + bigNB(winOrLoseAmount).toFixed(2)}
            color={isWin ? 'var(--Red-300)' : isLose ? 'var(--Green-300)' : ''}
          />
        </div>
      );
    }

    // RESERVE
    return (
      <>
        <StatItem label="总预约单数：" value={String(totalOrderCount)} />

        <StatItem label="总预约投注额：" value={bigNB(totalBetAmount).toFixed(2)} />
      </>
    );
  }, [activeTab, isLose, isWin, totalBetAmount, totalOrderCount, winOrLoseAmount]);

  if (queryParams?.queryType === EBetHistoryQueryType.RESERVE_FAIL) {
    return null;
  }

  return (
    <div className="h-48px shrink-0 flex gap-48px items-center justify-end">{renderContent()}</div>
  );
};

export default TableStats;
