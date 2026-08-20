import { memo } from 'react';
import { useBettingDataFields } from '@/common/hooks/bet/context/BettingDataContext';
import OrdersPanelActionBar from '../OrdersPanelActionBar';
import OrdersPanelParlay from '../OrdersPanelParlay';
import OrdersPanelSingle from '../OrdersPanelSingle';

const OrdersPanel = () => {
  const { isParlay } = useBettingDataFields('isParlay');

  return (
    <div className="flex-1-col-hidden">
      {isParlay ? <OrdersPanelParlay /> : <OrdersPanelSingle />}
      <OrdersPanelActionBar />
    </div>
  );
};

export default memo(OrdersPanel);
