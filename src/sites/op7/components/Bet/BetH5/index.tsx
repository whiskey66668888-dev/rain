import Overlay from '@/common/components/Overlay';
import { memo, useCallback } from 'react';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import clsx from 'clsx';
import BetPanel from './components/BetPanel';
import OrdersPanel from './components/OrdersPanel';
import {
  shallowEqual,
  useBettingDataGet,
  useBettingDataSelector,
} from '@/common/hooks/bet/context/BettingDataContext';
import type { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';
import { zIndexMap } from '@/utils/constants/zIndex';

const BetH5 = memo(() => {
  const getBettingData = useBettingDataGet();
  const { showBetDrawer, showBetPanel, showOrdersPanel } = useBettingDataSelector(
    (state: TUseVenueBetData) => ({
      showBetDrawer: state.showBetDrawer,
      showBetPanel: state.showBetPanel,
      showOrdersPanel: state.showOrdersPanel,
    }),
    shallowEqual,
  );
  const { hideBetDrawer, confirmClick } = useBetMethods();

  // #region 点击弹窗蒙层
  const betPopupMaskClick = useCallback(() => {
    const data: TUseVenueBetData = getBettingData();
    if (data.currStep.fetching) return;
    hideBetDrawer();
    if (data.showOrdersPanel) {
      confirmClick({
        venue: data.venue,
        isParlay: data.isParlay,
        betOrders: data.betOrders,
        isMaskClick: true,
      });
    }
  }, [getBettingData, hideBetDrawer, confirmClick]);
  // #endregion

  return (
    <Overlay
      show={showBetDrawer}
      close={betPopupMaskClick}
      maskClickClose
      position="bottom"
      zIndex={zIndexMap.betPopup}
      containerClassname={clsx(
        '[--global-overlay-body-max-height:88%]',
        '[--bg-gradient-image:linear-gradient(var(--ThemeColor-Main),var(--ThemeColor-Main))]',
      )}
      bodyClassname={clsx('flex-1-col-hidden')}
    >
      {showBetPanel && <BetPanel />}
      {showOrdersPanel && <OrdersPanel />}
    </Overlay>
  );
});

BetH5.displayName = 'BetH5';

export default BetH5;
