import Overlay from '@/common/components/Overlay';
import { memo, useCallback } from 'react';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import clsx from 'clsx';
import BetPanel from './components/BetPanel';
import OrdersPanel from './components/OrdersPanel';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import { zIndexMap } from '@/utils/constants/zIndex';

const BetH5 = memo(() => {
  const { showBetDrawer, showBetPanel, showOrdersPanel, currStep, venue, isParlay, betOrders } =
    useBettingData();
  const { hideBetDrawer, confirmClick } = useBetMethods();

  // #region 点击弹窗蒙层
  const betPopupMaskClick = useCallback(() => {
    if (currStep.fetching) return;
    hideBetDrawer();
    if (showOrdersPanel) {
      confirmClick({ venue, isParlay, betOrders, isMaskClick: true });
    }
  }, [currStep.fetching, venue, hideBetDrawer, showOrdersPanel, confirmClick, isParlay, betOrders]);
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
