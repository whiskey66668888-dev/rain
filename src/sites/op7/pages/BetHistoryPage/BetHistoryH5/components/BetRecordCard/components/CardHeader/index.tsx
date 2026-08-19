import clsx from 'clsx';
import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { EBetOrderStatus, EBetSettleResult } from '@/apis/commonSports/constants';
import { ArrowRightSvg, LeftLine2x16Svg } from '@/sites/op7/components/SvgIcons';
import { Icon } from '@/common/components/Icon';
import { SETTLED_RESULT_CONFIG, UNSETTLED_STATUS_CONFIG } from '../../../../constants';
import { getOrderDisplayOdds } from '@/utils/betHistory';

interface CardHeaderProps {
  order: TBetHistoryOrderItem;
  collapsed: boolean;
  onToggle: () => void;
}

const CardHeader = ({ order, collapsed, onToggle }: CardHeaderProps) => {
  const firstDetail = order.orderDetails[0];

  const renderRight = () => {
    // 未结算：icon + 文案（确认中/成功/失败）
    if (order.isUnsettledOrder) {
      const status = UNSETTLED_STATUS_CONFIG[order.orderStatus];
      const Icon = status.icon;
      return (
        <>
          <Icon className={clsx('w-16px h-16px', status.iconColorH5 ?? status.iconColor)} />
          <span className="_tf[14] leading-[1.43] text-[var(--Text-800)]">{status.label}</span>
        </>
      );
    }
    // 已结算：根据 orderSettleResult 显示对应结算图标
    if (order.isSettledOrder) {
      const icon =
        SETTLED_RESULT_CONFIG[order.orderSettleResult] ??
        SETTLED_RESULT_CONFIG[EBetSettleResult.NoResulted];
      return <Icon src={icon.icon} size="28px" color={icon.color} />;
    }
    // 预约：预约中 / 预约失败
    if (order.isPreBetOrder) {
      const reserving = order.orderStatus === EBetOrderStatus.Confirming;
      return (
        <span
          className={clsx(
            '_tf[14] leading-[1.43]',
            reserving ? 'text-[var(--ThemeColor-Main)]' : 'text-[var(--Red-300)]',
          )}
        >
          {reserving ? '预约中' : order.isManualCancel ? '取消' : '预约失败'}
        </span>
      );
    }
    return null;
  };

  if (!firstDetail) return null;

  return (
    <div
      className="flex items-center gap-8px pr-10px py-8px shadow-[0_-0.5px_0_0_var(--Line-100)_inset]"
      onClick={onToggle}
    >
      <div className="flex-1 flex items-center gap-8px overflow-hidden">
        <LeftLine2x16Svg className="text-[var(--ThemeColor-Main)]" />
        <p className="_tf[14] font-600 leading-[1.43] text-[var(--Text-Main-10)] truncate">
          {!order.isParlayOrder
            ? firstDetail.isChampion
              ? '冠军'
              : `${firstDetail.homeName} vs ${firstDetail.awayName}`
            : `串关投注`}
        </p>
        {!!order.isParlayOrder && (
          <>
            <p className="_tf[12] text-[var(--Text-800)]">{`${order.orderLabel}*${order.orderSum}`}</p>
            <p className="_tf[16] text-[var(--ThemeColor-Main)]">
              <span>@</span>
              <span className="din-pro">{getOrderDisplayOdds(order.orderOdds, order)}</span>
            </p>
          </>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-4px">
        {renderRight()}
        <button className="flex items-center justify-center">
          <ArrowRightSvg
            className={clsx(
              'w-14px h-14px text-[var(--Text-800)]  transition-transform duration-200',
              collapsed ? 'rotate-90' : 'rotate-[-90deg]',
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default CardHeader;
