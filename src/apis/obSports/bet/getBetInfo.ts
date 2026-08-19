import { EOddsChange } from '@/apis/commonSports/constants';
import type { TbetData, TBetItem, TParlayItem } from '@/apis/commonSports/types';
import { buildParlayList } from '@/utils/bet/parlay';

import { queryLatestMarketInfoOb } from './queryLatestMarketInfo';
import { queryMarketMaxMinBetMoneyOb } from './queryMarketMaxMinBetMoney';
import type {
  TObBetMoneyRespItem,
  TObLatestMarketReqItem,
  TObLatestMarketRespItem,
  TObMarketOddsItem,
} from './types';
import { buildObBetMoneyReqItems, fromObRawOdds, getObMatchType, getObOddsStatus } from './utils';

interface TFormatResponse {
  newBetData: TbetData;
  newParlayList: TParlayItem[] | null;
}

/** 在最新盘口列表里找到该投注项对应的盘口 */
const findMarket = (list: TObLatestMarketRespItem[], betItem: TBetItem) =>
  list.find((item) => {
    if (`${item.matchInfoId}` !== betItem.matchId) return false;
    if (`${item.playId}` !== `${betItem.playId}`) return false;
    // 坑位（主盘/副盘）参与匹配，接口未返回时不做限制
    if (
      item.placeNum !== undefined &&
      Number(item.placeNum) !== Number(betItem.ob?.placeNum ?? 0)
    ) {
      return false;
    }
    return true;
  });

/** 在盘口的投注项列表里找到当前投注项：优先按投注项类型(ot)，其次按原始id，最后取第一条 */
const findOdds = (
  marketOddsList: TObMarketOddsItem[] | undefined,
  betItem: TBetItem,
): TObMarketOddsItem | undefined => {
  if (!marketOddsList?.length) return undefined;
  return (
    marketOddsList.find((o) => !!betItem.ob?.ot && `${o.oddsType}` === betItem.ob.ot) ??
    marketOddsList.find((o) => !!betItem.ob?.oid && `${o.id}` === betItem.ob.oid) ??
    marketOddsList[0]
  );
};

/** 单关限额回填：优先按投注项id匹配，其次按盘口id，最后按下标 */
const findBetMoney = (
  list: TObBetMoneyRespItem[],
  betItem: TBetItem,
  index: number,
): TObBetMoneyRespItem | undefined =>
  list.find((item) => !!item.playOptionId && `${item.playOptionId}` === betItem.ob?.oid) ??
  list.find((item) => !!item.marketId && `${item.marketId}` === betItem.marketId) ??
  list[index];

/**
 * OB 投注项最新数据：赔率 / 封盘状态 / 限额 / 串关组合。
 *
 * OB 需要两个接口才等价于 FB 的一个：
 * - queryLatestMarketInfo  拿最新赔率与盘口状态
 * - queryMarketMaxMinBetMoney 拿限额（串关时同时拿到各串关类型的限额）
 *
 * 返回结构与 getBetInfoFb 保持一致，供 useGetLatestBetData 直接消费。
 */
export const getBetInfoOb = async (params: {
  isParlay: boolean;
  betData: TbetData;
}): Promise<TFormatResponse | null> => {
  const { isParlay, betData } = params;
  const betItems = Object.values(betData.entities);
  if (!betItems.length) return null;

  const idList: TObLatestMarketReqItem[] = betItems.map((item) => ({
    matchInfoId: item.matchId,
    marketId: item.marketId,
    oddsId: item.ob?.oid ?? '',
    oddsType: item.ob?.ot ?? '',
    playId: `${item.playId}`,
    placeNum: item.ob?.placeNum ?? 0,
    matchType: getObMatchType(item),
  }));

  const orderMaxBetMoney = buildObBetMoneyReqItems({ betItems, isParlay });

  const [marketRes, moneyRes] = await Promise.allSettled([
    queryLatestMarketInfoOb(idList),
    queryMarketMaxMinBetMoneyOb(orderMaxBetMoney),
  ]);

  const marketList =
    marketRes.status === 'fulfilled' && Array.isArray(marketRes.value.data)
      ? marketRes.value.data
      : null;
  const moneyList =
    moneyRes.status === 'fulfilled' && Array.isArray(moneyRes.value.data)
      ? moneyRes.value.data
      : null;

  // 两个接口都失败，保持原数据不动
  if (!marketList && !moneyList) return null;

  const newEntities: TbetData['entities'] = {};

  betItems.forEach((betItem, index) => {
    let newItem: TBetItem = { ...betItem, isNewlyAdded: false };

    // #region 最新赔率 / 盘口状态
    const market = marketList ? findMarket(marketList, betItem) : undefined;
    if (market) {
      const odds = findOdds(market.marketOddsList, betItem);
      const newBaseOdds = odds ? fromObRawOdds(Number(odds.oddsValue)) : 0;

      let oddsChange = EOddsChange.None;
      if (newBaseOdds > 0 && betItem.baseOdds > 0) {
        if (newBaseOdds > betItem.baseOdds) {
          oddsChange = EOddsChange.Up;
        } else if (newBaseOdds < betItem.baseOdds) {
          oddsChange = EOddsChange.Down;
        }
      }

      // 盘口值：让球取 playOptions，大小球取 marketValue
      const newMarketValue = `${odds?.playOptions || market.marketValue || ''}`.trim();

      newItem = {
        ...newItem,
        // 赔率为 0 视为无效数据，保留上一次的值（对齐 Flutter）
        baseOdds: newBaseOdds > 0 ? newBaseOdds : betItem.baseOdds,
        oddsChange,
        oddsStatus: getObOddsStatus(market, odds),
        marketId: `${market.id ?? betItem.marketId}`,
        ...(newMarketValue && {
          marketValue: newMarketValue,
          marketValueChange: !!betItem.marketValue && newMarketValue !== betItem.marketValue,
        }),
        ob: {
          ...betItem.ob,
          hmt: betItem.ob?.hmt ?? 0,
          ot: betItem.ob?.ot ?? '',
          placeNum: market.placeNum ?? betItem.ob?.placeNum ?? 0,
          oid: `${odds?.id ?? betItem.ob?.oid ?? ''}`,
        },
        // 是否支持预约投注只有这个接口能给（1:支持，0/null:不支持），对齐 Flutter isSupportReserve
        canPreBet: Number(market.pendingOrderStatus) === 1,
      };
    }
    // #endregion

    // #region 单关限额
    if (!isParlay && moneyList?.length) {
      const money = findBetMoney(moneyList, betItem, index);
      if (money) {
        newItem = {
          ...newItem,
          minBet: Number(money.minBet ?? 0),
          maxBet: Number(money.orderMaxPay ?? 0),
        };
      }
    }
    // #endregion

    newEntities[betItem.betItemId] = newItem;
  });

  const newBetData: TbetData = { ids: [...betData.ids], entities: newEntities };

  // #region 串关：组合与赔率本地计算，限额取接口返回（type 与本地 parlayCode 同为 2001/3004/… 口径）
  let newParlayList: TParlayItem[] | null = null;
  if (isParlay) {
    newParlayList = buildParlayList(Object.values(newEntities));
    if (moneyList?.length) {
      const limitMap = new Map<string, TObBetMoneyRespItem>();
      moneyList.forEach((item) => {
        if (item.type) limitMap.set(`${item.type}`, item);
      });
      newParlayList = newParlayList.map((item) => {
        const limit = limitMap.get(item.parlayCode);
        return {
          ...item,
          minBet: Number(limit?.minBet ?? 0),
          maxBet: Number(limit?.orderMaxPay ?? 0),
        };
      });
    }
  }
  // #endregion

  return { newBetData, newParlayList };
};
