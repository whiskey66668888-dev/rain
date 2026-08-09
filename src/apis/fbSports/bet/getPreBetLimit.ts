import { TBetItem, TFbPreBetLimitMap } from '@/apis/commonSports/types';
import { getBetParameterFb, TGetBetParameterParams } from './getBetParameter';

// 获取预约投注限额配置
export const getPreBetLimitFb = async ({ betItem }: { betItem: TBetItem }) => {
  const params: TGetBetParameterParams = {
    matchId: +betItem.matchId,
    marketId: +betItem.marketId,
    optionType: betItem.fb?.ty,
  };

  const [res] = await Promise.allSettled([getBetParameterFb(params)]);

  let newPreBetLimitMap: TFbPreBetLimitMap | null = null;

  if (res.status === 'fulfilled' && res.value.success && res.value.data) {
    newPreBetLimitMap = {
      [betItem.betItemId]: res.value.data,
    };
  }

  return newPreBetLimitMap;
};
