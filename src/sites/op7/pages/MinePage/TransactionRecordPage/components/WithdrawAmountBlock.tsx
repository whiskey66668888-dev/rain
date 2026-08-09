import clsx from 'clsx';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import LazyImage from '@/common/components/LazyImage';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import style from './WithdrawDetailModal.module.scss';

interface StatusIconProps {
  status: TradeMainStatus;
}

const StatusIcon = ({ status }: StatusIconProps) => {
  const map: Partial<Record<TradeMainStatus, { src: string; alt: string }>> = {
    [TradeMainStatus.COMPLETED]: {
      src: '/images/common/transactionRecord/completed.png',
      alt: 'Done',
    },
    [TradeMainStatus.CANCELLED]: {
      src: '/images/common/transactionRecord/cancelled.png',
      alt: 'Cancelled',
    },
    [TradeMainStatus.REJECTED]: {
      src: '/images/common/transactionRecord/rejected.png',
      alt: 'Rejected',
    },
    [TradeMainStatus.PROCESSING]: {
      src: '/images/common/transactionRecord/processing.png',
      alt: 'Processing',
    },
  };
  const item = map[status];
  if (!item) return null;
  return (
    <div className="w-18px h-18px">
      <LazyImage src={item.src} alt={item.alt} />
    </div>
  );
};

interface WithdrawAmountBlockProps {
  cash: number;
  /** 金额前缀符号，默认 "-" */
  cashPrefix?: string;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  /** 状态描述文案，由外部按业务类型传入 */
  statusText?: string;
  /** 是否显示「遇到问题?」入口 */
  showHelp?: boolean;
}

export const WithdrawAmountBlock = ({
  cash,
  cashPrefix = '-',
  tradeMainStatus,
  tradeMainStatusName,
  statusText,
  showHelp,
}: WithdrawAmountBlockProps) => {
  const openCustomerService = useOpenCustomerService();

  const statusClass = (() => {
    switch (tradeMainStatus) {
      case TradeMainStatus.COMPLETED:
        return style.completed;
      case TradeMainStatus.CANCELLED:
        return style.cancelled;
      case TradeMainStatus.REJECTED:
        return style.rejected;
      default:
        return style.processing;
    }
  })();

  return (
    <div className={style.amountBlock}>
      <div className={style.amountRow}>
        <span className={style.amountNum}>
          {cashPrefix}
          {cash?.toFixed(2)}
        </span>
        <span className={style.amountUnit}>元</span>
      </div>
      <div className="flex flex-col items-center gap-10px">
        <div className={clsx(style.statusRow, statusClass)}>
          <StatusIcon status={tradeMainStatus} />
          <span>{tradeMainStatusName}</span>
        </div>
        {statusText && (
          <div
            className="_tf[12] color-[var(--Text-800)] text-center"
            dangerouslySetInnerHTML={{ __html: statusText }}
          />
        )}
        {showHelp && (
          <div
            className="_tf[14] color-[var(--ThemeColor-Main)] text-center cursor-pointer"
            onClick={openCustomerService}
          >
            遇到问题?
          </div>
        )}
      </div>
    </div>
  );
};
