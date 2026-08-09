import type { TBetOrderItem } from '@/apis/commonSports/types';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import BetItem from '../BetItem';
import clsx from 'clsx';
import OrderStatusIcon from '../OrderStatusIcon';
import { bigNB } from '@/utils/bet/bigMath';

const OrdersPanelParlay = () => {
  const { venue, betOrders, expandedOrderIds, totalOrdersStatus } = useBettingData();
  const { toggleBetOrderExpanded } = useBetMethods();

  return (
    <div
      data-desc="pc串关订单面板"
      className={clsx(
        `[--status-color:${totalOrdersStatus.statusColor}]`,
        'flex-1-col-hidden',
        '[background:linear-gradient(var(--status-color),var(--status-color))_no-repeat_center_top/100%_4px,var(--Background-300)]',
        'rounded-t-10px',
      )}
    >
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {betOrders.map((order: TBetOrderItem) => {
          const isExpanded = expandedOrderIds.includes(order.orderId);
          return (
            <div key={order.orderId} className=" shadow-[0_0.5px_0_0_var(--Line-200)_inset]">
              <div
                className="flex items-center justify-between p-12px cursor-pointer bg-[var(--Background-500)]"
                onClick={toggleBetOrderExpanded.bind(null, {
                  venue,
                  orderId: order.orderId,
                })}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-8px">
                    <div className="_tf[16] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                      {order.orderSum}*{order.orderLabel}
                    </div>

                    <div className="font-500 leading-[1.25] text-[var(--Text-Main-10)]">
                      <span className="_tf[14]">@</span>
                      <span className="din-pro _tf[18]">{bigNB(order.orderOdds).toFixed(2)}</span>
                    </div>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={clsx(
                        'w-12px h-12px flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        isExpanded && 'rotate-180deg',
                        'text-[var(--Text-800)]',
                      )}
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.99246 8.7143C5.94184 8.76492 5.86326 8.77055 5.80642 8.73117L5.78622 8.7143L1.04271 3.97079C0.985762 3.91384 0.985762 3.8215 1.04271 3.76455L1.76455 3.04271C1.8215 2.98576 1.91384 2.98576 1.97079 3.04271L5.88934 6.96126L9.80789 3.04271C9.86484 2.98576 9.95718 2.98576 10.0141 3.04271L10.736 3.76455C10.7929 3.8215 10.7929 3.91384 10.736 3.97079L5.99246 8.7143Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  <div className="mt-4px flex flex-col gap-2px _tf[12] leading-[1.33] text-[var(--Text-800)]">
                    <div>
                      本金： <span className="din-pro">{order.orderBetAmount}</span>
                    </div>
                    <div>
                      可返还： <span className="din-pro">{order.orderMaxWinAmount}</span>
                    </div>
                  </div>
                </div>

                <OrderStatusIcon orderStatus={order.orderStatus} showText />
              </div>

              <div
                className={clsx(
                  'overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                  isExpanded ? 'max-h-[1000px]' : 'max-h-0',
                )}
              >
                <div>
                  <div>
                    {order.orderDetails.map((detail) => (
                      <div key={detail.betItemId}>
                        <BetItem betItem={detail} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPanelParlay;
