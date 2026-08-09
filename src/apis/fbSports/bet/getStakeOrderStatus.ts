import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbOrderStatus } from '@/apis/fbSports/common/constants/enum';
import { TBetOrderItem } from '@/apis/commonSports/types';
import { betOrderStatusFormatFb } from '../common/fbFormat';
import { EBetOrderStatus } from '@/apis/commonSports/constants';

export interface TGetStakeOrderStatusParams {
  /** 订单ID集合 */
  orderIds: string[];
  /** 语言类型，see enum: language_type */
  languageType?: FB_LANGUAGE_TYPE;
}

export interface TGetStakeOrderStatusOrderItem {
  /** 预约订单ID */
  oid: string;
  /** 订单状态，see enum: order_status */
  st: EFbOrderStatus;
  /** 拒单原因码，see enum: order_reject_type */
  rj: number;
  /** 拒单原因 */
  rjs: string;
}

const getStakeOrderStatusApi = (params: TGetStakeOrderStatusParams) => {
  return requestFB.post<TGetStakeOrderStatusOrderItem[], TGetStakeOrderStatusParams>(
    '/v1/order/getStakeOrderStatus',
    { body: params },
  );
};

/** 轮询一组订单ID，返回其中已不再是确认中状态的ID列表 */
export const checkConfirmingOrderIds = async (orderIds: string[]): Promise<string[]> => {
  const changedIds: string[] = [];
  try {
    const res = await getStakeOrderStatusApi({ orderIds });
    res.data.forEach((oItem) => {
      const status = betOrderStatusFormatFb({ st: oItem.st });
      if (status !== EBetOrderStatus.Confirming) {
        changedIds.push(oItem.oid);
      }
    });
  } catch {
    // ignore
  }
  return changedIds;
};

/** 批量获取投注订单状态接口 /v1/order/getStakeOrderStatus */
export const getStakeOrderStatus = async ({ orders }: { orders: TBetOrderItem[] }) => {
  const confirmedOrders: TBetOrderItem[] = [];
  try {
    const res = await getStakeOrderStatusApi({ orderIds: orders.map((o) => o.orderId) });

    if (res.data.length) {
      res.data.forEach((oItem) => {
        const status = betOrderStatusFormatFb({ st: oItem.st });

        if (status !== EBetOrderStatus.Confirming) {
          const findOrder = orders.find((prevOrder) => prevOrder.orderId === oItem.oid);

          if (findOrder) {
            confirmedOrders.push({
              ...findOrder,
              orderStatus: status,
            });
          }
        }
      });
    }
  } catch (error) {
    console.log('js---getStakeOrderStatus error:', error);
  }
  return confirmedOrders;
};
