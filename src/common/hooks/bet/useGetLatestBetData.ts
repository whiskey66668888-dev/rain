import { EVenue } from '@/apis/commonSports/constants';
import { TbetData, TBetItem } from '@/apis/commonSports/types';
import { getBetInfoFb } from '@/apis/fbSports/bet/getBetInfo';
import { getPreBetLimitFb } from '@/apis/fbSports/bet/getPreBetLimit';
import { useAppDispatch } from '@/core/store/hooks';
import {
  batchUpdateParlay,
  batchUpdateSingle,
  setFbPreBetLimitMap,
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
        const res = await getBetInfoFb({
          isParlay,
          betData,
        });
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

export const useGetFbPreBetLimit = () => {
  const dispatch = useAppDispatch();
  const getFbPreBetLimit = useCallback(
    async ({ venue, betItem }: { venue: EVenue; betItem?: TBetItem }) => {
      if (!betItem) return null;
      const res = await getPreBetLimitFb({ betItem });
      if (res) {
        dispatch(setFbPreBetLimitMap({ venue, preBetLimitMap: res }));
        return res;
      }
      return null;
    },
    [dispatch],
  );
  return { getFbPreBetLimit };
};
