import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { bigNB } from '@/utils/bet/bigMath';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import { ACCEPT_ODDS_PREFER_VALUE_MAP } from '@/apis/commonSports/constants';
import CopyButton from '@/sites/op7/components/CopyButton';
import { CopySvg } from '@/sites/op7/components/SvgIcons';

const OrdersPanelActionBar = () => {
  const { betOrders, acceptOddsPrefer, isParlay, venue, currPreBetOrder } = useBettingData();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const { confirmClick, hideBetDrawer, continueBetClick } = useBetMethods();

  const totalOrdersBetAmount = useMemo(() => {
    return betOrders
      .reduce((prev, curr) => {
        return prev.add(curr.orderBetAmount);
      }, bigNB(0))
      .toFixed(2);
  }, [betOrders]);

  const totalOrdersCanWinAmount = useMemo(() => {
    return betOrders
      .reduce((prev, curr) => {
        return prev.add(curr.orderMaxWinAmount);
      }, bigNB(0))
      .toFixed(2);
  }, [betOrders]);

  const handleConfirm = useCallback(() => {
    confirmClick({ venue, betOrders, isParlay });
    if (isMobile) {
      hideBetDrawer();
    }
  }, [confirmClick, venue, betOrders, isParlay, isMobile, hideBetDrawer]);
  return (
    <div
      className={clsx(
        'border-t border-t-solid border-[var(--Background-700)] bg-[var(--Background-300)] px-12px pt-12px pb-12px',
        'flex flex-col gap-8px',
      )}
    >
      {currPreBetOrder ? (
        <div className="flex flex-col gap-4px">
          <div className="flex items-center justify-between _tf[14] leading-[1.43]">
            <span className="text-[var(--Text-800)] ">预约投注</span>
            <span className="text-[var(--Text-Main-10)] din-pro">{totalOrdersBetAmount}</span>
          </div>
          <div className="flex items-center justify-between _tf[14] leading-[1.43]">
            <span className="text-[var(--Text-800)]">预约返还</span>
            <span className="text-[var(--Text-Main-10)] din-pro">{totalOrdersCanWinAmount}</span>
          </div>
          {!!currPreBetOrder?.orderId && (
            <div className="flex items-center justify-between _tf[14] leading-[1.43]">
              <span className="text-[var(--Text-800)]">预约单号</span>
              <CopyButton
                text={currPreBetOrder.orderId}
                className="flex items-center gap-4px max-w-[60%]"
              >
                <span className="_tf[14] din-pro text-[var(--Text-800)] truncate">
                  {currPreBetOrder.orderId}
                </span>
                <CopySvg className="w-14px h-14px shrink-0 text-[var(--Text-800)]" />
              </CopyButton>
            </div>
          )}
        </div>
      ) : (
        !isParlay && (
          <>
            <div className="_tf[12] leading-[1] text-[var(--Text-800)]">
              {ACCEPT_ODDS_PREFER_VALUE_MAP[acceptOddsPrefer]?.replace(/（.*?）|\(.*?\)/g, '')}
            </div>
            <div className="flex justify-between gap-4px lg:flex-col">
              <div className="flex gap-4px items-center justify-between">
                <div className="text-[var(--Text-800)] _tf[14] leading-[1.43]">投注:</div>
                <div className="text-[var(--Text-Main-10)] _tf[16] leading-[1.5] din-pro font-500">
                  {totalOrdersBetAmount}
                </div>
              </div>
              <div className="flex gap-4px items-center justify-between">
                <div className="text-[var(--Text-800)] _tf[14] leading-[1.43]">可返还:</div>
                <div className="text-[var(--Text-Main-10)] _tf[16] leading-[1.5] din-pro font-500">
                  {totalOrdersCanWinAmount}
                </div>
              </div>
            </div>
          </>
        )
      )}

      <button
        className={clsx(
          'h-44px rounded-full bg-[var(--Background-500)]',
          '_tf[16] leading-[1.5] text-[var(--Text-Main-10)]',
        )}
        onClick={continueBetClick}
      >
        保留选项继续投注
      </button>
      <button
        className={clsx(
          'h-44px rounded-full bg-[var(--ThemeColor-Main)]',
          '_tf[16] leading-[1.5] text-[var(--White-100)]',
        )}
        onClick={handleConfirm}
      >
        确认
      </button>
    </div>
  );
};

export default OrdersPanelActionBar;
