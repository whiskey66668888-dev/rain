import { EAcceptOddsPrefer, EBetOrderStatus } from '@/apis/commonSports/constants';
import type { TBetItem, TBetOrderItem, TParlayItem } from '@/apis/commonSports/types';
import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { bigNB } from '@/utils/bet/bigMath';

import {
  EObBetOrderStatusCode,
  EObMarketTypeFinally,
  OB_DEVICE_IMEI,
  OB_DEVICE_TYPE,
} from './constants';
import { recordUserPreferenceOb } from './recordUserPreference';
import type { TObBetParams, TObBetRespData, TObSeriesOrderParam } from './types';
import { acceptOddsPreferFormatOb, buildObOrderDetail, getObMarketTypeFinally } from './utils';

/** 下注接口返回的注单状态 → 通用注单状态 */
const betOrderStatusFormatOb = (code?: EObBetOrderStatusCode) => {
  switch (code) {
    case EObBetOrderStatusCode.Success:
      return EBetOrderStatus.Success;
    case EObBetOrderStatusCode.Confirming:
      return EBetOrderStatus.Confirming;
    default:
      return EBetOrderStatus.Fail;
  }
};

/**
 * 可返还 = 投注额 × 欧赔，恒含本金（香港盘也一样，与投注单、投注记录同口径）。
 *
 * 接口另有 maxWinMoney（单位「分」），与投注记录的 maxWinAmount 一样是纯盈利，
 * 直接拿来当可返还会少一份本金，所以这里一律本地算。
 */
const calcObReturnAmount = (betAmount: string, euOdds: number) =>
  bigNB(euOdds || 0)
    .times(betAmount || 0)
    .toFixed(2);

const betOb = (params: TObBetParams & { cuid: string }) => {
  return requestOB.post<TObBetRespData, TObBetParams & { cuid: string }>(
    '/yewu13/v1/betOrder/client/bet',
    { body: params, isErrorToast: true },
  );
};

/**
 * OB 投注。
 * 参数与返回结构对齐 placeBetFb，供 usePlaceBet 直接消费。
 * 对齐 Flutter doOBBetOrderReq：单关一个投注项一条 seriesOrders（seriesType=1），
 * 串关每个有金额的串关类型一条 seriesOrders，orderDetailList 为全部投注项。
 */
export const placeBetOb = async ({
  isParlay,
  betItemList,
  parlayList,
  acceptOddsPrefer,
}: {
  isParlay: boolean;
  betItemList: TBetItem[];
  parlayList: TParlayItem[];
  acceptOddsPrefer: EAcceptOddsPrefer;
}) => {
  let betOrders: TBetOrderItem[] | null = null;

  try {
    const seriesOrders: TObSeriesOrderParam[] = isParlay
      ? parlayList
          .filter((pItem) => +pItem.betAmount > 0)
          .map((pItem) => ({
            seriesType: Number(pItem.parlayCode),
            seriesSum: pItem.parlaySum,
            fullBet: 0,
            orderDetailList: betItemList.map((bItem) =>
              buildObOrderDetail({ betItem: bItem, betAmount: pItem.betAmount, isParlay: true }),
            ),
          }))
      : betItemList
          .filter((bItem) => +bItem.betAmount > 0)
          .map((bItem) => ({
            seriesType: 1,
            seriesSum: 1,
            fullBet: 0,
            orderDetailList: [
              buildObOrderDetail({ betItem: bItem, betAmount: bItem.betAmount, isParlay: false }),
            ],
          }));

    if (!seriesOrders.length) return null;

    const useAcceptOdds = acceptOddsPreferFormatOb(acceptOddsPrefer);
    // OB 要求先上报偏好，投注参数里的 useAcceptOdds 才生效；失败不阻断投注
    void recordUserPreferenceOb(useAcceptOdds).catch(() => {});

    const res = await betOb({
      useAcceptOdds,
      deviceType: OB_DEVICE_TYPE,
      deviceImei: OB_DEVICE_IMEI,
      preBet: 0,
      seriesOrders,
      cuid: getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '',
    });

    const { orderDetailRespList, seriesOrderRespList } = res.data ?? {};

    if (isParlay && seriesOrderRespList?.length) {
      betOrders = seriesOrderRespList.map((sItem) => {
        const findParlayItem =
          parlayList.find((pItem) => `${sItem.seriesCode ?? ''}` === pItem.parlayCode) ??
          parlayList.find((pItem) => sItem.seriesValue === pItem.parlayLabel);
        const betAmount = findParlayItem?.betAmount ?? '0';
        const orderBetAmount = bigNB(betAmount)
          .times(findParlayItem?.parlaySum ?? sItem.seriesSum ?? 0)
          .toFixed(2);
        return {
          orderId: sItem.orderNo,
          orderBetAmount,
          // 串关只支持欧洲盘，parlayOdds 即欧赔
          orderMaxWinAmount: calcObReturnAmount(betAmount, findParlayItem?.parlayOdds ?? 0),
          orderStatus: betOrderStatusFormatOb(sItem.orderStatusCode),
          orderOdds: findParlayItem?.parlayOdds ?? 0,
          orderCode: findParlayItem?.parlayCode ?? `${sItem.seriesCode ?? ''}`,
          orderSum: findParlayItem?.parlaySum ?? sItem.seriesSum ?? 0,
          orderLabel: findParlayItem?.parlayLabel ?? sItem.seriesValue ?? '',
          orderDetails: betItemList,
        } satisfies TBetOrderItem;
      });
    }

    if (!isParlay && orderDetailRespList?.length) {
      betOrders = orderDetailRespList.map((oItem) => {
        const findBetItem =
          betItemList.find((bItem) => bItem.ob?.oid === `${oItem.playOptionsId ?? ''}`) ??
          betItemList.find((bItem) => bItem.marketId === `${oItem.marketId ?? ''}`);
        const betAmount = findBetItem?.betAmount ?? '0';
        const isHK =
          !!findBetItem &&
          getObMarketTypeFinally({ betItem: findBetItem, isParlay: false }) ===
            EObMarketTypeFinally.HK;
        // 接口返回的是成交后的最终赔率，且是展示值（港盘为港赔），换回欧赔再算金额
        const respOdds = Number(oItem.oddsValues) || 0;
        const orderOdds = respOdds
          ? +bigNB(respOdds).plus(isHK ? 1 : 0)
          : (findBetItem?.baseOdds ?? 0);
        return {
          orderId: oItem.orderNo,
          orderBetAmount: betAmount,
          orderMaxWinAmount: calcObReturnAmount(betAmount, orderOdds),
          orderStatus: betOrderStatusFormatOb(oItem.orderStatusCode),
          orderOdds,
          orderCode: '1',
          orderSum: 1,
          orderLabel: '单关',
          // 成交赔率可能与下注时不同，同步进 detail（baseOdds 约定恒为欧赔）
          orderDetails: findBetItem ? [{ ...findBetItem, baseOdds: orderOdds }] : [],
        } satisfies TBetOrderItem;
      });
    }
  } catch (error) {
    console.log('js---placeBetOb error', error);
  }

  return betOrders;
};
