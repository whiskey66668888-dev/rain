import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

export const DepositPayTypeV2 = {
  Cny: 'CNY',
  Usdt: 'USDT',
  Digital: 'DIGITAL',
  DigitalCny: 'digital_cny',
  Alipay: 'alipay',
  WeChat: 'weChat',
  Artificial: 'customer',
  AliWechat: 'aliwechat',
} as const;

export interface ActiveItemV2 {
  id: number;
  image: string;
}

export interface ChannelItemV2 {
  minAmount: number;
  maxAmount: number;
  img: string;
  helpId: string;
  groupId: number;
  payId: number;
  name: string;
  cashList: string[];
  sort: number;
  info: string;
  itemPayType: string;
  needRealName: boolean;
  channelTutorialOpen: number;
  isLock: number;
  lockTime: number;
  hasRealName: boolean;
  bonusRate: number;
}

export interface PayItemV2 {
  name: string;
  logoUrl: string;
  code: string;
  hot: number;
  status: boolean;
  bonusRate: number;
  activeList: ActiveItemV2[];
  channelList: ChannelItemV2[];
  groupId: number;
  groupCode: string;
  info: string;
  currency: string;
}

interface RawDepositGroupV2 {
  name?: string;
  currency?: string;
  groupId?: number;
  groupCode?: string;
  info?: string;
  hot?: number;
  sort?: number;
  helpId?: string;
  childList?: RawDepositChannelV2[];
}

interface RawDepositChannelV2 {
  minAmount?: number;
  maxAmount?: number;
  img?: string;
  helpId?: string;
  groupId?: number;
  name?: string;
  cashList?: string;
  sort?: number;
  info?: string;
  itemPayType?: string;
  needRealName?: boolean;
  channelTutorialOpen?: number;
  isLock?: number;
  lockTime?: number;
  hasRealName?: boolean;
  bonusRate?: number;
}

export interface UsdtRateInfoV2 {
  oyBuyRate: string;
  saleRate: string;
  oySaleRate: string;
  buyRate: string;
}

export interface DepositPayResultV2 {
  orderCash: string;
  orderId: string;
  orderTime: string;
  showPost: boolean;
  type: string;
  url: string;
  payqrcode: string;
  virtualAddress: string;
  actionImg: string;
  actionName: string;
  virtualNum: string;
  virtualChain: string;
  channel: string;
}

export interface DepositSaveParamsV2 {
  groupId: number;
  cash: string;
  num: string;
  rate: string;
}

export type DepositVersionType = 'new' | 'old';

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return '';
  return '';
};

const normalizeChannel = (item: RawDepositChannelV2, group: RawDepositGroupV2): ChannelItemV2 => {
  const inheritedInfo = item.info || group.info || '';
  const inheritedHelpId = item.helpId || group.helpId || '';

  return {
    minAmount: toNumber(item.minAmount),
    maxAmount: toNumber(item.maxAmount),
    img: toStringValue(item.img),
    helpId: inheritedHelpId,
    groupId: toNumber(item.groupId),
    payId: toNumber(group.groupId),
    name: item.name || '',
    cashList: item.cashList ? item.cashList.split(',').filter(Boolean) : [],
    sort: toNumber(item.sort),
    info: inheritedInfo,
    itemPayType: item.itemPayType || 'bank',
    needRealName: item.needRealName ?? true,
    channelTutorialOpen: item.channelTutorialOpen ?? 1,
    isLock: item.isLock ?? 0,
    lockTime: item.lockTime ?? 0,
    hasRealName: item.hasRealName ?? true,
    bonusRate: toNumber(item.bonusRate),
  };
};

const normalizeDepositGroups = (data: RawDepositGroupV2[]): PayItemV2[] => {
  return [...data]
    .sort((a, b) => toNumber(a.sort).valueOf() - toNumber(b.sort).valueOf())
    .map((group) => {
      const currency = group.currency || '';
      const channelList = (group.childList ?? [])
        .map((channel) => normalizeChannel(channel, group))
        .sort((a, b) => a.sort - b.sort);

      return {
        name: group.name || '',
        logoUrl: '',
        code: currency,
        hot: toNumber(group.hot),
        status: true,
        bonusRate: 0,
        activeList:
          currency === DepositPayTypeV2.Usdt
            ? [
                { image: '/images/common/finance/deposit-activity/194.webp', id: 194 },
                { image: '/images/common/finance/deposit-activity/286.webp', id: 286 },
              ]
            : [],
        channelList,
        groupId: toNumber(group.groupId),
        groupCode: group.groupCode || '',
        currency,
        info: group.info || '',
      };
    });
};

export const getDepositGroupV2 = (): Promise<ResponseData<PayItemV2[]>> => {
  return request.post<RawDepositGroupV2[], { version: string }, PayItemV2[]>(
    '/v3/pay/deposit/group',
    {
      body: { version: '3.0.0' },
      transformResponse: (res) => ({
        ...res,
        data: Array.isArray(res.data) ? normalizeDepositGroups(res.data) : [],
      }),
    },
  );
};

export const useDepositGroupV2Query = (): ReturnType<typeof useQueryHook<PayItemV2[], Error>> => {
  return useQueryHook<PayItemV2[], Error>({
    queryKey: ['pay', 'depositGroupV2'],
    queryFn: () =>
      getDepositGroupV2()
        .then((res) => res.data)
        .catch(() => []),
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};

export const getUsdtRateV2 = (): Promise<ResponseData<UsdtRateInfoV2>> => {
  return request.get<UsdtRateInfoV2, object>('/api/pay/usdtrate', { isErrorToast: false });
};

export const doDepositV2 = (
  params: DepositSaveParamsV2,
): Promise<ResponseData<DepositPayResultV2>> => {
  return request.post<DepositPayResultV2, DepositSaveParamsV2 & { version: string }>(
    '/v3/pay/deposit/save',
    {
      body: {
        version: '3.0.0',
        ...params,
      },
    },
  );
};

export const getDepositVersionV2 = (): Promise<ResponseData<string>> => {
  return request.post<string, object>('/v3/pay/deposit/version', {
    body: {},
    isErrorToast: false,
  });
};
