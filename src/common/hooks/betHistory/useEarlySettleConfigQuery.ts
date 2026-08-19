import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { EBetHistoryTab, EVenue } from '@/apis/commonSports/constants';
import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { getEarlySettlePriceFb } from '@/apis/fbSports/betHistory/getEarlySettlePriceFb';
import { getCashoutMaxAmountListOb } from '@/apis/obSports/betHistory/getCashoutMaxAmountListOb';
import type { EFbAskEarlySettleStatus } from '@/apis/fbSports/common/constants/enum';
import { bigNB } from '@/utils/bet/bigMath';

/** 清洗后的单订单提前结算配置，各场馆可复用 */
export type TEarlySettleConfigItem = {
  orderId: string;
  /** FB 才有的提前结算/订单状态 */
  status?: EFbAskEarlySettleStatus;
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

const EMPTY_CONFIG: TEarlySettleConfigData = { earlySettleConfigMap: {}, earlySettleMaxCount: 0 };

/** 支持提前结算的场馆 */
const EARLY_SETTLE_VENUES = [EVenue.FB, EVenue.OB];

/** OB 无「同时进行数」概念，每单一次全额结算，按 1 处理即可复用通用的次数校验 */
const OB_EARLY_SETTLE_MAX_COUNT = 1;

const fetchEarlySettleConfigFb = async (orderIds: string[]): Promise<TEarlySettleConfigData> => {
  const res = await getEarlySettlePriceFb({ orderIds });
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
};

/**
 * OB 报价接口按注单返回「结算本金 betAmount + 结算返还 preSettleMaxWin」，且只支持全额结算；
 * 换算成单位本金返还倍率后即可与 FB 共用同一套展示/计算逻辑（本金恒为注单全额 → 返还即 preSettleMaxWin）。
 * 报价列表里没有的注单代表当前不可提前结算。
 */
const fetchEarlySettleConfigOb = async (orderNos: string[]): Promise<TEarlySettleConfigData> => {
  const res = await getCashoutMaxAmountListOb({ orderNos });
  const earlySettleConfigMap: TEarlySettleConfigMap = {};
  for (const item of res.data ?? []) {
    if (!item?.orderNo || !item.betAmount || !item.preSettleMaxWin) continue;
    earlySettleConfigMap[item.orderNo] = {
      orderId: item.orderNo,
      cashOutRate: bigNB(item.preSettleMaxWin).div(item.betAmount).toNumber(),
      canEarlySettle: true,
    };
  }
  return { earlySettleConfigMap, earlySettleMaxCount: OB_EARLY_SETTLE_MAX_COUNT };
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
  const supported = EARLY_SETTLE_VENUES.includes(venue);

  return useQuery<TEarlySettleConfigData>({
    queryKey: ['earlySettlePrice', venue, eligibleIds.join(',')],
    queryFn: async () => {
      if (!eligibleIds.length || !supported) return EMPTY_CONFIG;
      return venue === EVenue.OB
        ? fetchEarlySettleConfigOb(eligibleIds)
        : fetchEarlySettleConfigFb(eligibleIds);
    },
    enabled: eligibleIds.length > 0 && supported,
    refetchInterval: 8_000,
    staleTime: 0,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
  });
};
