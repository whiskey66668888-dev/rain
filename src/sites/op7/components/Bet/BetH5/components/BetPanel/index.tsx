import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import BetPanelActionBar from '../BetPanelActionBar';
import BetPanelParlay from '../BetPanelParlay';
import BetPanelSingle from '../BetPanelSingle';
import BetTabsBar from '../BetTabsBar';
import clsx from 'clsx';

const BetPanel = () => {
  const { isParlay, currStep } = useBettingData();

  return (
    <div
      className={clsx(
        'flex-1-col-hidden safe-b',
        '[background:var(--bg-gradient-image)_no-repeat_center_top/_100%_100px,var(--Background-300)] rounded-t-10px',
        currStep.fetching && 'pointer-events-none',
      )}
    >
      <div className="flex-1-col-hidden relative">
        <BetTabsBar />
        {isParlay ? <BetPanelParlay /> : <BetPanelSingle />}
        <BetPanelActionBar />
      </div>
    </div>
  );
};

export default BetPanel;
