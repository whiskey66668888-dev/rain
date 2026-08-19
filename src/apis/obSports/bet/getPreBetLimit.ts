import type { TBetItem, TObPreBetLimit } from '@/apis/commonSports/types';

import { queryMarketMaxMinPreBetMoneyOb } from './queryMarketMaxMinPreBetMoney';
import { buildObBetMoneyReqItems } from './utils';

/**
 * OB 预约投注限额。
 * 接口按投注项返回 minBet（最小本金）与 orderMaxPay（最大可赢金额），
 * 最大本金要再按预约赔率换算，换算放在 useVenueBetData，这里只透传原始值。
 * 对齐 Flutter getSportReserveBetInfo。
 */
export const getPreBetLimitOb = async ({
  betItem,
}: {
  betItem: TBetItem;
}): Promise<TObPreBetLimit | null> => {
  try {
    const res = await queryMarketMaxMinPreBetMoneyOb(
      buildObBetMoneyReqItems({ betItems: [betItem], isParlay: false }),
    );
    const limit = res.data?.[0];
    if (!limit) return null;
    return {
      betItemId: betItem.betItemId,
      minBet: Number(limit.minBet ?? 0),
      orderMaxPay: Number(limit.orderMaxPay ?? 0),
    };
  } catch (error) {
    console.log('js---getPreBetLimitOb error', error);
    return null;
  }
};
