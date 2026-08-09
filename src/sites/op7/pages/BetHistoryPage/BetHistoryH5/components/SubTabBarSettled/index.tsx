import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { cn } from '@/utils';
import { bigNB } from '@/utils/bet/bigMath';
import { calcValidBetAmout } from '@/utils/betHistory';
import { useMemo } from 'react';

const baseClass = 'min-w-[25%] text-center _tf[12] text-[var(--Text-800)] relative';
const afterClass =
  'after:content-empty after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[0.5px] after:h-[80%] after:bg-[var(--Line-200)]';

const SubTabBarSettled = () => {
  const { stats, list } = useBetHistoryContext();

  const isWin = stats.winOrLoseAmount > 0;

  const validAmout = useMemo(() => calcValidBetAmout({ list }), [list]);

  return (
    <div className="flex items-center py-8px overflow-x-auto">
      <div className={cn(baseClass, afterClass)}>
        <span>{stats.totalOrderCount}</span>
        <span>单</span>
      </div>
      <div className={cn(baseClass, afterClass)}>
        <span>投注:</span>
        <span>{stats.totalBetAmount}</span>
      </div>
      <div className={cn(baseClass, afterClass)}>
        <span>有效:</span>
        <span>{bigNB(validAmout).toFixed(2)}</span>
      </div>
      <div className={cn(baseClass, isWin ? 'text-[var(--Red-300)]' : 'text-[var(--Green-300)]')}>
        {isWin
          ? `+${bigNB(stats.winOrLoseAmount).toFixed(2)}`
          : bigNB(stats.winOrLoseAmount).toFixed(2)}
      </div>
    </div>
  );
};

export default SubTabBarSettled;
