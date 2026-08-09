import { TBetItem, TBetOrderItem, TParlayItem } from '@/apis/commonSports/types';
import { singlePassFb, TSingleBetItem, TSingleBetOptionItem } from './singlePass';
import { EFbOddsFormatType } from '../common/constants/enum';
import { EFbSelectionType } from '../common/constants/selectionType';
import { bigNB } from '@/utils/bet/bigMath';
import { betOrderStatusFormatFb } from '../common/fbFormat';
import { betMultipleFb, TBetMultipleParams } from './betMultiple';
import { EAcceptOddsPrefer } from '@/apis/commonSports/constants';
import { acceptOddsPreferFormatFb } from '../common/fbFormat';

export const placeBetFb = async ({
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
    if (isParlay) {
      const betMultipleData: TBetMultipleParams['betMultipleData'] = parlayList.map((pItem) => {
        const item: TBetMultipleParams['betMultipleData'][0] = {
          seriesValue: pItem.parlayCombinationNum,
          unitStake: +pItem.betAmount,
          oddsChange: acceptOddsPreferFormatFb({ acceptOddsPrefer }),
          // 可以通过这里的remark，关联到订单
          thirdRemark: pItem.parlayCode,
        };
        return item;
      });
      const betOptionList: TBetMultipleParams['betOptionList'] = betItemList.map((bItem) => {
        const item: TBetMultipleParams['betOptionList'][0] = {
          marketId: +bItem.marketId,
          optionType: bItem.fb?.ty as EFbSelectionType,
          odds: +bItem.baseOdds,
          oddsFormat: EFbOddsFormatType.Europe,
        };
        return item;
      });
      const params: TBetMultipleParams = {
        betMultipleData,
        betOptionList,
      };
      const res = await betMultipleFb(params);
      if (res.data?.length) {
        betOrders = res.data.map((oItem) => {
          const findParlayItem = parlayList.find((pItem) => pItem.parlayCode === oItem.ops[0]?.tr);
          const order: TBetOrderItem = {
            orderBetAmount: bigNB(findParlayItem?.betAmount ?? '0')
              .times(findParlayItem?.parlaySum ?? 0)
              .toFixed(2),
            // marketType: 'EU',
            orderMaxWinAmount: bigNB(findParlayItem?.parlayOdds ?? 0)
              .times(findParlayItem?.betAmount ?? '0')
              .toFixed(2),
            orderId: oItem.id,
            orderStatus: betOrderStatusFormatFb({ st: oItem.st }),
            orderOdds: findParlayItem?.parlayOdds ?? 0,
            orderCode: findParlayItem?.parlayCode ?? 'not found',
            orderSum: findParlayItem?.parlaySum ?? 0,
            orderLabel: findParlayItem?.parlayLabel ?? 'not found',
            orderDetails: betItemList,
          };
          return order;
        });
      }
    } else {
      const singleBetList: TSingleBetItem[] = [];
      betItemList.forEach((bItem) => {
        const singleBetOptionItem: TSingleBetOptionItem = {
          marketId: +bItem.marketId,
          optionType: bItem.fb?.ty as EFbSelectionType,
          odds: +bItem.baseOdds,
          oddsFormat: EFbOddsFormatType.Europe,
        };

        const singleBetItem: TSingleBetItem = {
          unitStake: +bItem.betAmount,
          oddsChange: acceptOddsPreferFormatFb({ acceptOddsPrefer }),
          betOptionList: [singleBetOptionItem],
        };

        singleBetList.push(singleBetItem);
      });
      const res = await singlePassFb({ singleBetList });
      if (res.data?.length) {
        betOrders = res.data.map((oItem) => {
          const firstOption = oItem.ops[0];
          const findBetItem = betItemList.find((bItem) => bItem.marketId === firstOption?.mid);
          const order: TBetOrderItem = {
            orderBetAmount: findBetItem?.betAmount ?? '0',
            // marketType: 'EU',
            orderMaxWinAmount: bigNB(findBetItem?.baseOdds ?? 0)
              .times(findBetItem?.betAmount ?? '0')
              .toFixed(2),
            orderId: oItem.id,
            orderStatus: betOrderStatusFormatFb({ st: oItem.st }),
            orderDetails: findBetItem ? [findBetItem] : [],
            orderCode: '1',
            orderSum: 1,
            orderLabel: '单关',
            orderOdds: findBetItem?.baseOdds ?? 0,
          };
          return order;
        });
      }
    }
  } catch (error) {
    console.log('js---placeBetFb error', error);
  }

  return betOrders;
};
