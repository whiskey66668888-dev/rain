import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { bigNB } from '@/utils/bet/bigMath';
import clsx from 'clsx';
import { calcEarlySettleStats } from '@/utils/betHistory';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';

const CardAmountRow = ({
  order,
  collapsed,
}: {
  order: TBetHistoryOrderItem;
  collapsed: boolean;
}) => {
  const { earlySettleMaxCount } = useBetHistoryContext();
  const { hasPartialEarlySettle, displayStake, remainingPayable } = calcEarlySettleStats(
    order,
    earlySettleMaxCount,
  );

  const stakeLabel = hasPartialEarlySettle ? '剩余本金' : '本金';
  const payableLabel = order.isPreBetOrder ? '预约返还' : order.isSettledOrder ? '返还' : '可返还';
  const payableAmount = hasPartialEarlySettle
    ? remainingPayable
    : order.isSettledOrder
      ? bigNB(order.orderSettledBackAmount)
          .plus(order.earlySettleTotalPayout ?? 0)
          .toString()
      : order.orderMaxWinAmount;

  return (
    <div
      className={clsx(
        'flex items-center justify-between p-10px',
        !collapsed
          ? 'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]'
          : 'shadow-[0_0.5px_0_0_var(--Line-100)_inset]',
      )}
    >
      <p className="_tf[14] leading-[1.43] font-medium text-[var(--Text-Main-10)]">
        {stakeLabel}: <span className="font-500">{bigNB(displayStake).toFixed(2)}</span>
      </p>
      <p className="_tf[14] leading-[1.43]">
        <span className="text-[var(--Text-800)">{payableLabel}：</span>
        <span className="font-medium text-[var(--ThemeColor-Main)]">
          {bigNB(payableAmount).toFixed(2)}
        </span>
      </p>
    </div>
  );
};

export default CardAmountRow;
