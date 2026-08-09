import { BetFailedPCSvg, BetSuccessPCSvg, LoadingIcon } from '@/sites/op7/components/SvgIcons';
import { EBetOrderStatus } from '@/apis/commonSports/constants';
import clsx from 'clsx';

interface Props {
  orderStatus: EBetOrderStatus;
  className?: string;
}

const OrderStatusIcon = ({ orderStatus, className }: Props) => {
  switch (orderStatus) {
    case EBetOrderStatus.Success:
      return (
        <BetSuccessPCSvg
          className={clsx(className ? className : 'w-14px h-14px text-[var(--Green-300)]')}
        />
      );
    case EBetOrderStatus.Confirming:
      return (
        <LoadingIcon className={clsx('animate-spin', className ? className : 'w-14px h-14px')} />
      );
    case EBetOrderStatus.Fail:
      return (
        <BetFailedPCSvg
          className={clsx(className ? className : 'w-14px h-14px text-[var(--Red-300)]')}
        />
      );
    default:
      return null;
  }
};

export default OrderStatusIcon;
