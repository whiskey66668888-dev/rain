import { TBetItem } from '@/apis/commonSports/types';
import { EFbOddsFormatType } from '../common/constants/enum';
import { EFbSelectionType } from '../common/constants/selectionType';
import { reserveBetFb, TReserveBetParams } from './reserveBet';
import { toast } from '@/common/components/Toast';

export const placePreBetFb = async ({ betItem }: { betItem: TBetItem }) => {
  try {
    const params: TReserveBetParams = {
      unitStake: +betItem.betAmount,
      betOptionList: [
        {
          marketId: +betItem.marketId,
          optionType: betItem.fb?.ty as EFbSelectionType,
          odds: +(betItem.preBetInfo?.preBetOdds ?? 0),
          oddsFormat: EFbOddsFormatType.Europe,
        },
      ],
    };
    const res = await reserveBetFb(params);
    return res;
  } catch (error) {
    console.log('js---placePreBetFb error', error);
    toast({
      title: '网络异常',
      description: '网络异常，请稍后重试！',
      type: 'error',
    });
    return null;
  }
};
