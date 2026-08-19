import { EBetOrderStatus } from '@/apis/commonSports/constants';
import type { TBetOrderItem } from '@/apis/commonSports/types';
import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { bigNB } from '@/utils/bet/bigMath';

import { EObQueryOrderStatus } from './constants';
import type { TObOrderStatusRespItem } from './types';

/** 注单状态查询接口的 status → 通用注单状态（对齐 Flutter getOBBetOrder2BetStatus） */
const orderStatusFormatOb = (status: EObQueryOrderStatus) => {
  if (status === EObQueryOrderStatus.Fail || status === EObQueryOrderStatus.Cancel) {
    return EBetOrderStatus.Fail;
  }
  if (status === EObQueryOrderStatus.Confirming) {
    return EBetOrderStatus.Confirming;
  }
  return EBetOrderStatus.Success;
};

const queryOrderStatusOb = (orderNos: string) => {
  const query = new URLSearchParams({
    orderNos,
    cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    rdm: `${Date.now()}`,
  });
  return requestOB.get<TObOrderStatusRespItem[], object>(
    `/yewu13/v1/betOrder/queryOrderStatus?${query.toString()}`,
    { isErrorToast: false },
  );
};

/**
 * OB 批量查询注单状态，返回其中已不再是「确认中」的注单。
 * 返回结构对齐 getStakeOrderStatus(FB)，供 useGetConfirmingOrders 直接消费。
 */
export const getStakeOrderStatusOb = async ({ orders }: { orders: TBetOrderItem[] }) => {
  const confirmedOrders: TBetOrderItem[] = [];
  if (!orders.length) return confirmedOrders;

  try {
    const res = await queryOrderStatusOb(orders.map((o) => o.orderId).join(','));

    res.data?.forEach((item) => {
      const status = orderStatusFormatOb(item.status);
      if (status === EBetOrderStatus.Confirming) return;

      const findOrder = orders.find((prevOrder) => prevOrder.orderId === `${item.orderNo}`);
      if (!findOrder) return;

      // 最新可赢金额，接口返回单位为「分」，且与 maxWinMoney 一样是纯盈利，
      // 加回本金后才是「可返还」（与投注单、投注记录同口径）
      const newWinAmount = Number(item.newMaxWinAmount);
      confirmedOrders.push({
        ...findOrder,
        orderStatus: status,
        ...(Number.isFinite(newWinAmount) &&
          newWinAmount > 0 && {
            orderMaxWinAmount: bigNB(newWinAmount)
              .div(100)
              .plus(findOrder.orderBetAmount || 0)
              .toFixed(2),
          }),
      });
    });
  } catch (error) {
    console.log('js---getStakeOrderStatusOb error:', error);
  }

  return confirmedOrders;
};
