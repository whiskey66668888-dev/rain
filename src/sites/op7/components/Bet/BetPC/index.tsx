import { memo } from 'react';
import {
  shallowEqual,
  useBettingDataSelector,
} from '@/common/hooks/bet/context/BettingDataContext';
import type { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';
import BetPanel from './components/BetPanel';
import OrdersPanel from './components/OrdersPanel';
import './BetPC.scss';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';
import { ESportsLeftPanelType } from '@/apis/commonSports/constants';

const BetPc = () => {
  const sportsLeftPanelType = useAppSelector((state) => state.sport.sportsLeftPanelType);
  const { showBetDrawer, showBetPanel, showOrdersPanel, fetching } = useBettingDataSelector(
    (state: TUseVenueBetData) => ({
      showBetDrawer: state.showBetDrawer,
      showBetPanel: state.showBetPanel,
      showOrdersPanel: state.showOrdersPanel,
      fetching: state.currStep.fetching,
    }),
    shallowEqual,
  );

  if (!showBetDrawer || sportsLeftPanelType !== ESportsLeftPanelType.ORDER_CART) {
    return null;
  }

  return (
    <div
      className={clsx('flex-1-col-hidden bg-[var(--Background-300)] shrink-0 ', {
        'pointer-events-none': fetching,
      })}
    >
      {showBetPanel && <BetPanel />}
      {showOrdersPanel && <OrdersPanel />}
    </div>
  );
};

BetPc.displayName = 'BetPc';

export default memo(BetPc);
