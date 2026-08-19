import { EVenue } from '@/apis/commonSports/constants';
import { TbetData, TBetItem } from '@/apis/commonSports/types';
import { getBetInfoFb } from '@/apis/fbSports/bet/getBetInfo';
import { getPreBetLimitFb } from '@/apis/fbSports/bet/getPreBetLimit';
import { getBetInfoOb } from '@/apis/obSports/bet/getBetInfo';
import { getPreBetLimitOb } from '@/apis/obSports/bet/getPreBetLimit';
import { useAppDispatch } from '@/core/store/hooks';
import {
  batchUpdateParlay,
  batchUpdateSingle,
  setFbPreBetLimitMap,
  setObPreBetLimit,
} from '@/core/store/slices/betSlice';
import { useCallback } from 'react';

export const useGetLatestBetData = () => {
  const dispatch = useAppDispatch();
  const getLatestBetData = useCallback(
    async ({
      venue,
      isParlay,
      parlayBetData,
      singleBetData,
    }: {
      venue: EVenue;
      isParlay: boolean;
      singleBetData: TbetData;
      parlayBetData: TbetData;
    }) => {
      const betData = isParlay ? parlayBetData : singleBetData;
      if (!betData.ids.length) return null;
      try {
        const res =
          venue === EVenue.OB
            ? await getBetInfoOb({ isParlay, betData })
            : await getBetInfoFb({ isParlay, betData });
        // console.log('js---getLatestBetData--res', res);
        if (!res) {
          return null;
        }
        if (isParlay) {
          dispatch(
            batchUpdateParlay({
              venue,
              betData: res.newBetData,
              parlayList: res.newParlayList ?? [],
            }),
          );
        } else {
          dispatch(
            batchUpdateSingle({
              venue,
              betData: res.newBetData,
            }),
          );
        }
        return res;
      } catch (error) {
        console.error('getLatestBetData error', error);
        return null;
      }
    },
    [dispatch],
  );
  return { getLatestBetData };
};

/**
 * 预约投注限额轮询。
 * FB 返回一整套投注参数（mis/mly/mms/mod），OB 只有 minBet/orderMaxPay，
 * 两边结构差太多，各存各的，消费方在 useVenueBetData 里按场馆换算。
 */
export const useGetPreBetLimit = () => {
  const dispatch = useAppDispatch();
  const getPreBetLimit = useCallback(
    async ({ venue, betItem }: { venue: EVenue; betItem?: TBetItem }) => {
      if (!betItem) return null;

      if (venue === EVenue.OB) {
        const res = await getPreBetLimitOb({ betItem });
        dispatch(setObPreBetLimit({ venue, preBetLimit: res }));
        return res;
      }

      const res = await getPreBetLimitFb({ betItem });
      if (res) {
        dispatch(setFbPreBetLimitMap({ venue, preBetLimitMap: res }));
        return res;
      }
      return null;
    },
    [dispatch],
  );
  return { getPreBetLimit };
};
