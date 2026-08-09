import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import clsx from 'clsx';
import { CopySvg, LeftLine2x16Svg, LeftLine2x18Svg } from '@/sites/op7/components/SvgIcons';
import { bigNB } from '@/utils/bet/bigMath';
import { useMemo } from 'react';
import OrderStatusIcon from '../OrderStatusIcon';
import dayjs from 'dayjs';
import { EBetOrderStatus } from '@/apis/commonSports/constants';
import { useGoMatchDetail } from '@/sites/op7/hooks/useGoMatchDetail';
import CopyButton from '@/sites/op7/components/CopyButton';

const OrdersPanelSingle = () => {
  const { betOrders, totalOrdersStatus, currPreBetOrder } = useBettingData();
  const goMatchDetail = useGoMatchDetail();

  const { totalBetAmount, totalCanWinAmount } = useMemo(() => {
    return {
      totalBetAmount: betOrders
        .reduce((prev, curr) => prev.add(curr.orderBetAmount), bigNB(0))
        .toFixed(2),
      totalCanWinAmount: betOrders
        .reduce((prev, curr) => prev.add(curr.orderMaxWinAmount), bigNB(0))
        .toFixed(2),
    };
  }, [betOrders]);

  return (
    <div
      data-desc="h5/pc单关订单面板"
      className={clsx(
        'flex flex-col pt-8px gap-4px overflow-hidden',
        `[--status-color:${totalOrdersStatus.status === EBetOrderStatus.Confirming ? 'var(--ThemeColor-Main)' : totalOrdersStatus.statusColor}]`,
      )}
    >
      {/* 预约投注结果不展示总状态与统计栏 */}
      {!currPreBetOrder && (
        <div className="mx-12px bg-[var(--Background-500)] rounded-6px">
          {/* 总状态 */}
          <div
            className={clsx(
              'h-32px pr-10px flex items-center gap-8px',
              'shadow-[0_-0.5px_0_0_var(--Line-200)_inset]',
              'text-[var(--status-color)]',
            )}
          >
            <LeftLine2x16Svg />
            <p className="flex-1 _tf[12] font-medium leading-[1.33]">{totalOrdersStatus.text}</p>
            <OrderStatusIcon orderStatus={totalOrdersStatus.status} />
          </div>
          {/*  总投注额 总可赢额 */}
          <div className="flex h-50px">
            <div className="flex-1 flex gap-2px flex-col items-center justify-center">
              <p className="_tf[10] leading-[1.2] text-[var(--Text-Main-10)]">总投注额</p>
              <p className="_tf[12] leading-[1.17] din-pro font-medium text-[var(--ThemeColor-Main)]">
                {totalBetAmount}
              </p>
            </div>
            <div className="flex-1 flex gap-2px flex-col items-center justify-center">
              <p className="_tf[10] leading-[1.2] text-[var(--Text-Main-10)]">总可返还</p>
              <p className="_tf[12] leading-[1.17] din-pro font-medium text-[var(--ThemeColor-Main)]">
                {totalCanWinAmount}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-y-auto overflow-x-hidden flex flex-col gap-4px px-12px">
        {betOrders.map((order) => {
          const detail = order.orderDetails[0];
          if (!detail) return null;
          const canGoMatchDetail = Number(detail.matchId) > 0;
          const handleGoMatchDetail = () => {
            goMatchDetail(detail.matchId, { isChampion: detail.isChampion });
          };

          return (
            <div key={order.orderId} className="bg-[var(--Background-500)] rounded-6px">
              {/* 主客队 + 订单状态（头部，不跳转） */}
              <div className="px-10px flex gap-8px justify-between relative py-7px">
                <LeftLine2x18Svg className="absolute left-0 top-6px text-[var(--ThemeColor-Main)]" />
                <div className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)]">
                  {detail.isChampion ? '冠军' : `${detail.homeName} vs ${detail.awayName}`}
                </div>
                {order.isPreBetOrder ? (
                  <span
                    className={clsx(
                      'shrink-0 _tf[12] font-medium leading-[1.33]',
                      order.orderStatus === EBetOrderStatus.Success
                        ? 'text-[var(--Green-300)]'
                        : 'text-[var(--Red-300)]',
                    )}
                  >
                    {order.orderStatus === EBetOrderStatus.Success ? '预约成功' : '预约失败'}
                  </span>
                ) : (
                  <OrderStatusIcon orderStatus={order.orderStatus} />
                )}
              </div>
              <div
                className={clsx(
                  'flex flex-col gap-8px px-10px pb-8px',
                  canGoMatchDetail && 'cursor-pointer',
                )}
                onClick={canGoMatchDetail ? handleGoMatchDetail : undefined}
                role={canGoMatchDetail ? 'button' : undefined}
                tabIndex={canGoMatchDetail ? 0 : undefined}
              >
                {/* 联赛名称 + 开赛时间 */}
                <div className="flex gap-4px justify-between">
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">
                    {detail.leagueName}
                  </div>
                  <div className="shrink-0 _tf[12] font-medium leading-[1.33] din-pro text-[var(--Text-800)]">
                    {dayjs(detail.matchStartTime).format('MM/DD HH:mm')}
                  </div>
                </div>
                {/* 卡片中带背景色的内容 */}
                <div
                  className={clsx(
                    'flex flex-col gap-8px bg-[var(--Background-300)] rounded-6px px-10px py-8px',
                  )}
                >
                  {/* 第一行：是否滚球 + 玩法名称 + 盘口类型 */}
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-Main-10)]">
                    {detail.isLive && <span className="mr-2px">滚球</span>}
                    <span className="">{detail.playName}</span>
                    <span className="ml-2px text-[var(--Text-800)]">[欧洲盘]</span>
                  </div>

                  {/* 第二行：投注项名称 + 赔率 */}
                  <div
                    className={clsx(
                      '_tf[12] text-[var(--Text-Main-10)] leading-[1.3333] font-medium',
                      'flex gap-16px justify-between',
                    )}
                  >
                    <div>
                      <span>{detail.betItemFullName}</span>
                      {detail.score && <span>({detail.score})&nbsp;</span>}
                    </div>
                    <div>
                      <span>@</span>
                      <span>{bigNB(detail.baseOdds).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-8px px-10px pb-8px">
                <div className="flex items-center justify-between gap-4px">
                  <span className="_tf[12] leading-[1.33] text-[var(--Text-800)]">
                    {order.isPreBetOrder ? '预约金额' : '投注额'}
                  </span>
                  <span className="_tf[12] leading-[1.33] text-[var(--ThemeColor-Main)] din-pro">
                    {bigNB(order.orderBetAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4px">
                  <span className="_tf[12] leading-[1.33] text-[var(--Text-800)]">
                    {order.isPreBetOrder ? '预约返还' : '可返还'}
                  </span>
                  <span className="_tf[12] leading-[1.33] text-[var(--ThemeColor-Main)] din-pro">
                    {bigNB(order.orderMaxWinAmount).toFixed(2)}
                  </span>
                </div>
                {/* 注单号 + 复制：普通单关与预约结果都展示 */}
                {!!order.orderId && (
                  <div className="flex items-center justify-between gap-8px">
                    <span className="_tf[12] din-pro text-[var(--Text-800)] truncate">
                      {order.orderId}
                    </span>
                    <CopyButton text={order.orderId} className="shrink-0">
                      <CopySvg className="w-14px h-14px text-[var(--Text-800)]" />
                    </CopyButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPanelSingle;
