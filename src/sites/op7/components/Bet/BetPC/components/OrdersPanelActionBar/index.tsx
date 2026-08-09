import useBetMethods from '@/common/hooks/bet/useBetMethods';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import Button from '@/common/components/Button';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { ESportsLeftPanelType } from '@/apis/commonSports/constants';

const OrdersPanelActionBar = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const { clearBet, hideBetDrawer, continueBetClick } = useBetMethods();
  const { switchSportsLeftPanelType } = useSportsMainListControl();

  const handleConfirm = useCallback(() => {
    clearBet();
    if (isMobile) {
      hideBetDrawer();
    } else {
      switchSportsLeftPanelType(ESportsLeftPanelType.MENU);
      hideBetDrawer();
    }
  }, [clearBet, isMobile, hideBetDrawer, switchSportsLeftPanelType]);
  return (
    <div className={'pt-4px px-12px pb-12px'}>
      <div
        className={clsx('flex flex-col gap-10px', 'bg-[var(--Background-500)] rounded-6px p-10px')}
      >
        <Button
          type="primary"
          size="small"
          className="h-[32px] rounded-[4px]"
          onClick={handleConfirm}
        >
          确定
        </Button>
        <Button
          type="outline"
          size="small"
          className={clsx('h-[32px] rounded-[4px] text-[var(--ThemeColor-Main)]')}
          onClick={continueBetClick}
        >
          保留投注项
        </Button>
      </div>
    </div>
  );
};

export default OrdersPanelActionBar;
