import { BetConfirmingSvg, BetFailedSvg, BetSuccessSvg } from '@/sites/op7/components/SvgIcons';
import { EBetOrderStatus } from '@/apis/commonSports/constants';
import { cn } from '@/utils';

interface Props {
  orderStatus: EBetOrderStatus;
  className?: string;
  showText?: boolean;
}

const OrderStatusIcon = ({ orderStatus, className, showText }: Props) => {
  switch (orderStatus) {
    case EBetOrderStatus.Success:
      return (
        <div
          className={cn('shrink-0 flex items-center gap-6px text-[var(--Green-300)]', className)}
        >
          <BetSuccessSvg className={cn('w-[20px] h-[20px]')} />
          {showText && <span>投注成功</span>}
        </div>
      );
    case EBetOrderStatus.Confirming:
      return (
        <div
          className={cn('shrink-0 flex items-center gap-6px text-[var(--Warning-100)]', className)}
        >
          <BetConfirmingSvg className={cn('w-[20px] h-[20px]')} />
          {showText && <span>投注确认中</span>}
        </div>
      );
    case EBetOrderStatus.Fail:
      return (
        <div className={cn('shrink-0 flex items-center gap-6px text-[var(--Red-300)]', className)}>
          <BetFailedSvg className={cn('w-[20px] h-[20px]')} />
          {showText && <span>投注失败</span>}
        </div>
      );
    default:
      return null;
  }
};

export default OrderStatusIcon;
