/**
 * OB（App 文案「EB」）提前结算提交流程
 * 对齐 Flutter lib/pages/mine/record/betting/sport/eb/ob/index.dart 的 confirmCashOutAmountReq + getPreOrderState。
 *
 * 与 FB 的差异：OB 只有「全额提前结算」，没有部分结算与预约提前结算，
 * 因此不需要金额面板，也不需要 cashOutId 轮询，成功与否由结算单状态接口给出。
 */
import { getCashoutMaxAmountOb } from '@/apis/obSports/betHistory/getCashoutMaxAmountOb';
import { orderPreSettleOb } from '@/apis/obSports/betHistory/orderPreSettleOb';
import { queryOrderPreSettleConfirmOb } from '@/apis/obSports/betHistory/queryOrderPreSettleConfirmOb';
import type { ResponseError } from '@/core/sdk/request/model';
import { API_CODE_OB_PRE_SETTLE_CONFIRMING } from '@/utils/constants/apiCodeOB';

/** 结算单状态：0 确认中，1 接单（成功），2 拒单（失败） */
const PRE_SETTLE_ACCEPTED = 1;
const PRE_SETTLE_REFUSED = 2;

/** 查询结算单状态的最大次数与间隔（对齐 Flutter attempt >= 5 + 800ms） */
const CONFIRM_MAX_ATTEMPTS = 6;
const CONFIRM_INTERVAL = 800;

export type TObEarlySettleResult =
  /** 已接单 */
  | { status: 'settled' }
  /** 拒单或接口报错 */
  | { status: 'failed'; message: string }
  /** 查询次数用尽仍是确认中，最终结果以列表为准 */
  | { status: 'pending'; message: string };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 轮询提前结算单状态，直到拿到接单/拒单，或次数用尽 */
const waitPreSettleResult = async (orderNo: string): Promise<TObEarlySettleResult> => {
  for (let attempt = 0; attempt < CONFIRM_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await delay(CONFIRM_INTERVAL);

    const list = await queryOrderPreSettleConfirmOb()
      .then((res) => res.data ?? [])
      .catch(() => []);
    const item = list.find((o) => o.orderNo === orderNo);

    if (item?.preSettleOrderStatus === PRE_SETTLE_ACCEPTED) {
      return { status: 'settled' };
    }
    if (item?.preSettleOrderStatus === PRE_SETTLE_REFUSED) {
      return { status: 'failed', message: item.msg || '提前结算失败' };
    }
    // 确认中(0) 或查不到结算单：继续等，不能当成成功
  }

  return { status: 'pending', message: '提前结算处理中，请稍后在注单列表查看结果' };
};

/**
 * 提交 OB 提前结算：先取最新报价，再按最新报价提交。
 * 服务端以 0400524 表示「已受理」，此时转为查询结算单状态。
 */
export const submitObEarlySettle = async (orderNo: string): Promise<TObEarlySettleResult> => {
  try {
    const price = (await getCashoutMaxAmountOb({ orderNo })).data;
    await orderPreSettleOb({
      orderNo,
      settleAmount: price?.betAmount ?? 0,
      frontSettleAmount: price?.preSettleMaxWin ?? 0,
    });
    return { status: 'settled' };
  } catch (error) {
    const { code, message } = (error ?? {}) as ResponseError<string>;
    if (code === API_CODE_OB_PRE_SETTLE_CONFIRMING) {
      return waitPreSettleResult(orderNo);
    }
    return { status: 'failed', message: message || '提前结算失败' };
  }
};
