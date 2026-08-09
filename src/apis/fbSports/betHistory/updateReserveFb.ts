import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';

export interface TUpdateReserveFbParams {
  /** 预约订单ID */
  reserveId: string;
  /** 修改后的预约提前结算本金（须大于等于0） */
  unitStake: number;
  /** 修改后的预期单位金额派奖金额（末尾最多三位小数） */
  odds: number;
  /** 语言类型 */
  languageType?: FB_LANGUAGE_TYPE;
}

/** 修改预约订单 /v1/order/reserve/update */
export const updateReserveFb = (params: TUpdateReserveFbParams) => {
  return requestFB.post<boolean, TUpdateReserveFbParams>('/v1/order/reserve/update', {
    body: params,
  });
};
