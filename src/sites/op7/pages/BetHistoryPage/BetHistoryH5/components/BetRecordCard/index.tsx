import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import CardHeader from './components/CardHeader';
import BetDetailRow from './components/BetDetailRow';
import CardAmountRow from './components/CardAmountRow';
import CardFooter from './components/CardFooter';
import clsx from 'clsx';
import { Fragment } from 'react/jsx-runtime';

interface BetRecordCardProps {
  order: TBetHistoryOrderItem;
  collapsed: boolean;
  onToggle: () => void;
}

const BetRecordCard = ({ order, collapsed, onToggle }: BetRecordCardProps) => (
  <div
    className={clsx(
      'rounded-t-6px shadow-[0px_1px_4px_0px_var(--Shadow-300)]',
      'bg-[var(--Background-300)]',
      '',
    )}
  >
    <CardHeader order={order} collapsed={collapsed} onToggle={onToggle} />
    {(!collapsed || order.isParlayOrder) && (
      <>
        {order.orderDetails.map((detail, i) => (
          <Fragment key={detail.betItemId + i}>
            <BetDetailRow order={order} detail={detail} collapsed={collapsed} />
            {order.isParlayOrder && i < order.orderDetails.length - 1 && (
              <div
                className={clsx(
                  'h-17px mx-4px',
                  'bg-[image:var(--circle-image)] bg-[length:10px_10px] bg-repeat-x bg-[position:center_8px]',
                )}
              ></div>
            )}
          </Fragment>
        ))}
      </>
    )}
    {(!collapsed || order.isParlayOrder) && <CardAmountRow order={order} collapsed={collapsed} />}
    <CardFooter order={order} collapsed={collapsed} />
    <div
      className={clsx(
        'h-5px w-full',
        'bg-[image:var(--circle-image)] bg-[length:10px_10px] bg-repeat-x bg-[position:center_1px]',
      )}
    />
  </div>
);

export default BetRecordCard;
