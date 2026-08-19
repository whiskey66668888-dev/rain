import type { TBetItem } from '@/apis/commonSports/types';
import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import { EObAcceptOdds, OB_DEVICE_IMEI, OB_DEVICE_TYPE } from './constants';
import type { TObBetParams, TObBetRespData } from './types';
import { buildObOrderDetail } from './utils';

export interface TObPreBetResult {
  success: boolean;
  orderId: string;
}

/**
 * OB 预约投注：仍是投注接口，只是 preBet=1 且赔率用用户设定的预约赔率。
 * 对齐 Flutter doOBBetOrderReq(preBet: 1)——预约单只能单关（seriesType/seriesSum 恒为 1）。
 */
export const placePreBetOb = async ({
  betItem,
}: {
  betItem: TBetItem;
}): Promise<TObPreBetResult | null> => {
  const preBetOdds = Number(betItem.preBetInfo?.preBetOdds || 0);
  if (!(preBetOdds > 0)) return null;

  try {
    const params: TObBetParams & { cuid: string } = {
      // 预约投注按设定赔率成交，赔率变动策略固定为不自动接受
      useAcceptOdds: EObAcceptOdds.No,
      deviceType: OB_DEVICE_TYPE,
      deviceImei: OB_DEVICE_IMEI,
      preBet: 1,
      seriesOrders: [
        {
          seriesType: 1,
          seriesSum: 1,
          fullBet: 0,
          orderDetailList: [
            buildObOrderDetail({
              betItem,
              betAmount: betItem.betAmount,
              isParlay: false,
              overrideOdds: preBetOdds,
            }),
          ],
        },
      ],
      cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    };

    const res = await requestOB.post<TObBetRespData, typeof params>(
      '/yewu13/v1/betOrder/client/bet',
      { body: params, isErrorToast: true },
    );

    const detail = res.data?.orderDetailRespList?.[0];
    // 对齐 Flutter：预约单只要接口正常返回就算受理，orderStatusCode 不参与判定
    return { success: !!detail, orderId: detail?.orderNo ?? '' };
  } catch (error) {
    console.log('js---placePreBetOb error', error);
    return null;
  }
};
