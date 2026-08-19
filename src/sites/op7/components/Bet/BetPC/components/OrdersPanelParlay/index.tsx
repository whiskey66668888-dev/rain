import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import clsx from 'clsx';
import OrderStatusIcon from '../OrderStatusIcon';
import { LeftLine2x16Svg, LeftLine2x18Svg } from '@/sites/op7/components/SvgIcons';
import { useMemo } from 'react';
import { bigNB } from '@/utils/bet/bigMath';
import { EBetOrderStatus } from '@/apis/commonSports/constants';
import dayjs from 'dayjs';
import { useGoMatchDetail } from '@/sites/op7/hooks/useGoMatchDetail';
import { useOddsDisplay } from '@/common/hooks/sports/useOddsDisplay';

const OrdersPanelParlay = () => {
  const { betOrders, totalOrdersStatus } = useBettingData();
  const goMatchDetail = useGoMatchDetail();
  const { getOddsDisplay } = useOddsDisplay();

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

  const details = betOrders[0]?.orderDetails;

  return (
    <div
      data-desc="pc串关订单面板"
      className={clsx(
        'flex flex-col pt-8px gap-4px overflow-hidden',
        `[--status-color:${totalOrdersStatus.statusColor}]`,
      )}
    >
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
      <div className="overflow-y-auto overflow-x-hidden flex flex-col gap-4px px-12px">
        <div className="bg-[var(--Background-500)] rounded-6px px-10px py-8px flex flex-col gap-4px">
          {betOrders.map((order) => {
            return (
              <div key={order.orderId} className="flex items-center justify-between">
                <div className="flex items-center gap-4px _tf[12] leading-[1.33] text-[var(--Text-800)]">
                  <span>
                    {order.orderLabel}*{order.orderSum}
                  </span>
                  <span>@{bigNB(order.orderOdds).toFixed(2)}</span>
                </div>

                <div className="shrink-0 _tf[12] leading-[1.33] text-[var(--Text-800)]">
                  {order.orderStatus === EBetOrderStatus.Fail ? (
                    <div className="text-[var(--Red-300)]">投注失败</div>
                  ) : (
                    <div className="flex items-center gap-4px">
                      <span>本金</span>
                      <span className="din-pro font-medium">{order.orderBetAmount}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!!details &&
          details.map((detail) => {
            const canGoMatchDetail = Number(detail.matchId) > 0;
            const handleGoMatchDetail = () => {
              goMatchDetail(detail.matchId, { isChampion: detail.isChampion });
            };
            // 串关只支持欧洲盘（与下单参数 marketTypeFinally 同口径）
            const oddsDisplay = getOddsDisplay({
              baseOdds: detail.baseOdds,
              isSupportHK: detail.isSupportHK,
              isParlay: true,
            });

            return (
              <div key={detail.betItemId} className="bg-[var(--Background-500)] rounded-6px">
                <div
                  className={clsx(
                    'px-10px pb-8px flex flex-col gap-8px relative',
                    canGoMatchDetail && 'cursor-pointer',
                  )}
                  onClick={canGoMatchDetail ? handleGoMatchDetail : undefined}
                  role={canGoMatchDetail ? 'button' : undefined}
                  tabIndex={canGoMatchDetail ? 0 : undefined}
                >
                  <LeftLine2x18Svg className="text-[var(--ThemeColor-Main)] absolute left-0 top-6px" />
                  <div className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)] py-7px pl-4px">
                    {detail.isChampion ? '冠军' : `${detail.homeName} vs ${detail.awayName}`}
                  </div>
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
                      <span className="ml-2px text-[var(--Text-800)]">[{oddsDisplay.label}]</span>
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
                        <span>{oddsDisplay.odds}</span>
                      </div>
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
