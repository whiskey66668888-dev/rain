import { memo } from 'react';
import { useBettingDataFields } from '@/common/hooks/bet/context/BettingDataContext';
import BetPanelActionBar from '../BetPanelActionBar';
import BetPanelParlay from '../BetPanelParlay';
import BetPanelSingle from '../BetPanelSingle';
import BetTabsBar from '../BetTabsBar';

const BetPanel = () => {
  const { isParlay } = useBettingDataFields('isParlay');

  return (
    <div className="flex-1-col-hidden">
      <BetTabsBar />
      {isParlay ? <BetPanelParlay /> : <BetPanelSingle />}
      <BetPanelActionBar />
    </div>
  );
};

export default memo(BetPanel);
