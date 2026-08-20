import { memo } from 'react';
import { useBettingDataFields } from '@/common/hooks/bet/context/BettingDataContext';
import OrdersPanelActionBar from '../OrdersPanelActionBar';
import OrdersPanelParlay from '../OrdersPanelParlay';
import OrdersPanelSingle from '../OrdersPanelSingle';
import clsx from 'clsx';

const OrdersPanel = () => {
  const { isParlay } = useBettingDataFields('isParlay');

  return (
    <div
      className={clsx(
        'flex-1-col-hidden safe-b',
        '[background:linear-gradient(var(--Background-300),var(--Background-300))_no-repeat_center_10px/100%_100%]',
      )}
    >
      {isParlay ? <OrdersPanelParlay /> : <OrdersPanelSingle />}
      <OrdersPanelActionBar />
    </div>
  );
};

export default memo(OrdersPanel);
