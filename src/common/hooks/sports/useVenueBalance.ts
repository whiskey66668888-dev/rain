import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { venueBalanceThunk } from '@/core/store/thunks/userThunks';
import { EVenue } from '@/apis/commonSports/constants';
import { useQueryHook } from '@/core/query';

export const useVenueBalance = () => {
  const balance = useAppSelector((state) => state.user[state.sport.venue].balance);
  return { balance };
};

export const useVenueBalanceLoading = () => {
  const balanceLoading = useAppSelector((state) => state.user[state.sport.venue].balanceLoading);
  return { balanceLoading };
};

export const useGetVenueBalance = () => {
  const dispatch = useAppDispatch();
  const getVenueBalance = useCallback(
    async ({ venue, isLoading }: { venue: EVenue; isLoading?: boolean }) => {
      const res = await dispatch(venueBalanceThunk({ venue, isLoading }));
      if (venueBalanceThunk.fulfilled.match(res)) {
        return res.payload;
      }
      return Promise.reject(new Error('获取场馆余额失败'));
    },
    [dispatch],
  );
  return { getVenueBalance };
};

/** 用户场馆余额轮询间隔（毫秒） */
export const USER_BALANCE_POLL_INTERVAL = 30 * 1000;

export const useLoopVenueBalance = ({ enabled }: { enabled: boolean }) => {
  const venue = useAppSelector((state) => state.sport.venue);
  const { getVenueBalance } = useGetVenueBalance();

  useQueryHook<string, Error>({
    queryKey: ['user', venue, 'venueBalance'],
    queryFn: async () => {
      return getVenueBalance({ venue, isLoading: false });
    },
    enabled,
    refetchInterval: USER_BALANCE_POLL_INTERVAL,
    staleTime: 0, // 每次视为过期，便于轮询更新
  });
};
