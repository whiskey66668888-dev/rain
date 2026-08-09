import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';

import clsx from 'clsx';
import BetItem from '../BetItem';
import OrderStatusIcon from '../OrderStatusIcon';
import { EBetOrderStatus } from '@/apis/commonSports/constants';
import { PreBetSuccessSvg, PreBetFailedSvg } from '@/sites/op7/components/SvgIcons';

const OrdersPanelSingle = () => {
  const { betOrders, totalOrdersStatus, currPreBetOrder } = useBettingData();

  // 预约投注成功/失败
  const preBetSuccess = currPreBetOrder?.orderStatus === EBetOrderStatus.Success;

  return (
    <div
      data-desc="h5/pc单关订单面板"
      className={clsx(
        'flex-1-col-hidden',
        `[--status-color:${totalOrdersStatus.statusColor}]`,
        '[background:linear-gradient(var(--status-color),var(--status-color))_no-repeat_center_top/100%_4px,var(--Background-300)]',
        'rounded-t-10px',
      )}
    >
      {currPreBetOrder ? (
        /* 预约投注：标题栏 */
        <div className="flex flex-col items-center gap-8px px-12px pt-20px pb-12px">
          {preBetSuccess ? (
            <PreBetSuccessSvg className="text-[var(--status-color)]" />
          ) : (
            <PreBetFailedSvg className="text-[var(--status-color)]" />
          )}
          <span className="_tf[16] font-600 leading-[1.5] text-[var(--Text-Main-10)]">
            {preBetSuccess ? '预约成功' : '预约失败'}
          </span>
          {preBetSuccess && (
            <p className="_tf[14] leading-[1.5] text-center text-[var(--status-color)]">
              预约成功并不代表下注成功，最终结果以实际注单为准
            </p>
          )}
        </div>
      ) : (
        /* 普通投注：标题栏 */
        <div className="flex items-center justify-center pt-20px pb-12px">
          <div
            className={clsx(
              '_tf[16] font-500 leading-[1.5] text-[var(--status-color)]',
              'flex items-center gap-4px',
            )}
          >
            <OrderStatusIcon orderStatus={totalOrdersStatus.status} />
            <span>{totalOrdersStatus.text.replace('全部', '')}</span>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {betOrders.map((order) => {
          const detail = order.orderDetails[0];
          return detail ? (
            <div key={order.orderId}>
              <BetItem betItem={detail} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default OrdersPanelSingle;
