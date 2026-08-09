import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { EBetHistoryTab, EVenue } from '@/apis/commonSports/constants';
import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { getEarlySettlePriceFb } from '@/apis/fbSports/betHistory/getEarlySettlePriceFb';
import type { EFbAskEarlySettleStatus } from '@/apis/fbSports/common/constants/enum';

/** 清洗后的单订单提前结算配置，各场馆可复用 */
export type TEarlySettleConfigItem = {
  orderId: string;
  status: EFbAskEarlySettleStatus;
  /** 单位本金对应的结算返还倍率；存在时说明该注单当前开启了提前结算 */
  cashOutRate?: number;
  singleMinStake?: number;
  parlayMinStake?: number;
  reserveCashOutAmount?: string;
  canEarlySettle: boolean;
};

export type TEarlySettleConfigMap = Partial<Record<string, TEarlySettleConfigItem>>;

export type TEarlySettleConfigData = {
  earlySettleConfigMap: TEarlySettleConfigMap;
  earlySettleMaxCount: number;
};

/**
 * 批量拉取未结算订单的提前结算报价，每 8 秒刷新一次。
 * 仅在"未结算"Tab 且订单 canEarlySettle=true 时启用。
 */
export const useEarlySettleConfigQuery = ({
  venue,
  list,
  activeTab,
}: {
  venue: EVenue;
  list: TBetHistoryOrderItem[];
  activeTab: EBetHistoryTab;
}) => {
  const eligibleIds =
    activeTab === EBetHistoryTab.UNSETTLED
      ? list.filter((o) => o.supportEarlySettle).map((o) => o.orderId)
      : [];

  return useQuery<TEarlySettleConfigData>({
    queryKey: ['earlySettlePrice', venue, eligibleIds.join(',')],
    queryFn: async () => {
      if (!eligibleIds.length || venue !== EVenue.FB)
        return { earlySettleConfigMap: {}, earlySettleMaxCount: 0 };
      const res = await getEarlySettlePriceFb({ orderIds: eligibleIds });
      const earlySettleConfigMap: TEarlySettleConfigMap = {};
      for (const item of res.data?.pr ?? []) {
        earlySettleConfigMap[item.oid] = {
          orderId: item.oid,
          status: item.st,
          cashOutRate: item.amt,
          singleMinStake: item.smis,
          parlayMinStake: item.pmis,
          reserveCashOutAmount: item.rcs,
          canEarlySettle: item.amt !== undefined,
        };
      }
      return { earlySettleConfigMap, earlySettleMaxCount: res.data?.mxc ?? 0 };
    },
    enabled: eligibleIds.length > 0 && venue === EVenue.FB,
    refetchInterval: 8_000,
    staleTime: 0,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
  });
};
