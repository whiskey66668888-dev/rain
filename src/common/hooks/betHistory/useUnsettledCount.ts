import { EBetHistoryQueryType } from '@/apis/commonSports/constants';
import { orderBetListFb } from '@/apis/fbSports/betHistory/orderBetListFb';
import { formatBetHistoryParamsFb } from '@/apis/fbSports/common/fbFormat';
import { useQueryHook } from '@/core/query';
import { useAppSelector } from '@/core/store/hooks';

export const useUnsettledCount = () => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const res = useQueryHook({
    queryKey: ['leagues', 'getUnsettledCount'],
    suspense: false,
    enabled: !isMobile && isLogin,
    queryFn: () =>
      orderBetListFb(
        formatBetHistoryParamsFb({
          queryType: EBetHistoryQueryType.UNSETTLED,
          // startTime?: number;
          // endTime?: number;
          pageSize: 1,
          pageNum: 1,
        }),
      ),
    refetchOnMount: 'always',
    refetchInterval: 60 * 1000,
  });

  return { unsettledCount: res.data?.data.total ?? 0 };
};
