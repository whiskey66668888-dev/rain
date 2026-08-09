import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import OrdersPanelActionBar from '../OrdersPanelActionBar';
import OrdersPanelParlay from '../OrdersPanelParlay';
import OrdersPanelSingle from '../OrdersPanelSingle';

const OrdersPanel = () => {
  const { isParlay } = useBettingData();

  return (
    <div className="flex-1-col-hidden">
      {isParlay ? <OrdersPanelParlay /> : <OrdersPanelSingle />}
      <OrdersPanelActionBar />
    </div>
  );
};

export default OrdersPanel;
