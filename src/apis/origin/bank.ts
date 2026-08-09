import { useQueryHook } from '@/core/query';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
export interface CardItemVo {
  id: number; // 卡id
  cardName: string; // 卡名称
  cardLogo: string; // 卡icon
  cardDesc: string; // 卡描述 前端写死
  username: string; // 持有人
  remark: string; // 备注
  cardNumber: string; // 卡号
  shortCarNumber: string;
}

interface BankItemRes {
  bankImage: string;
  bankName: string;
  cardNumber: string;
  memberBankId: number;
  realName: string;
  shortCarNumber: string;
  status: boolean;
}

const formatBankData = (list: BankItemRes[]): CardItemVo[] => {
  return list.map(
    (obj): CardItemVo => ({
      id: obj.memberBankId,
      cardName: obj.bankName,
      cardLogo: obj.bankImage,
      cardDesc: '储蓄卡',
      cardNumber: obj.cardNumber,
      shortCarNumber: obj.shortCarNumber,
      username: obj.realName,
      remark: '',
    }),
  );
};

// 银行卡
export const getBankListReq = (): Promise<ResponseData<CardItemVo[]>> => {
  return request.post<BankItemRes[], void, CardItemVo[]>('/api/member/bank/list', {
    isErrorToast: true,
    transformResponse: (data) => {
      return {
        ...data,
        data: formatBankData(data.data || []),
      };
    },
  });
};

interface virtualItemRes {
  shortCarNumber?: string;
  cardName: string;
  virtualName: string;
  memberVirtualId: number;
  remark: string;
  platformName: string;
  cardNumber: string;
  status: boolean;
  virtualImage: string;
}

const formatVirtualData = (list: virtualItemRes[], cardDesc: string): CardItemVo[] => {
  return list.map(
    (obj): CardItemVo => ({
      id: obj.memberVirtualId,
      cardName: obj.virtualName,
      cardLogo: obj.virtualImage,
      cardDesc: cardDesc,
      cardNumber: obj.cardNumber,
      shortCarNumber: obj.shortCarNumber ?? '',
      username: obj.cardName,
      remark: obj.remark,
    }),
  );
};

// 虚拟币
export const getVirtualListReq = (): Promise<ResponseData<CardItemVo[]>> => {
  return request.post<virtualItemRes[], void, CardItemVo[]>('/api/member/virtual/list', {
    isErrorToast: false,
    transformResponse: (data) => {
      return {
        ...data,
        data: formatVirtualData(data.data || [], ''),
      };
    },
  });
};

// 数字货币
export const getDigitalListReq = (): Promise<ResponseData<CardItemVo[]>> => {
  return request.post<virtualItemRes[], void, CardItemVo[]>('/api/member/digital/list', {
    isErrorToast: false,
    transformResponse: (data) => {
      return {
        ...data,
        data: formatVirtualData(data.data || [], '数字货币'),
      };
    },
  });
};

// 支付宝
export const getAlipayListReq = (): Promise<ResponseData<CardItemVo[]>> => {
  return request.post<virtualItemRes[], void, CardItemVo[]>('/api/member/zfb/list', {
    isErrorToast: false,
    transformResponse: (data) => {
      return {
        ...data,
        data: formatVirtualData(data.data || [], 'Alipay'),
      };
    },
  });
};

export interface SysBankItem {
  bankCode: string;
  bankImage: string;
  bankName: string;
  sysBankId: number;
}

// 个银行卡列表
export const getSysbankListReq = (): Promise<ResponseData<SysBankItem[]>> => {
  return request.post<SysBankItem[], object>('/api/center/sysbank/list', {
    isErrorToast: false,
    body: {},
  });
};

export const useSysbankListQuery = (): ReturnType<typeof useQueryHook<SysBankItem[], Error>> => {
  return useQueryHook<SysBankItem[], Error>({
    queryKey: ['origin', 'sysbank', 'list'],
    queryFn: () =>
      getSysbankListReq()
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
  });
};

interface addBankParams {
  realName: string;
  province: string;
  city: string;
  cardNumber: string;
  rcardNumber: string;
  bankAddress: string;
  sysBankId: number;
  cardRealName: string;
  token: string;
}

// 绑定个银行卡列表
export const addBankReq = (params: addBankParams) => {
  return request.post<void, addBankParams>('/api/member/bank/add', {
    isErrorToast: true,
    body: {
      ...params,
    },
  });
};

// 绑定非本人的银行卡
export const addOtherBankAccountReq = (params: addBankParams) => {
  return request.post<void, addBankParams>('/v3/pay/bindOtherBankAccount', {
    isErrorToast: true,
    body: {
      ...params,
    },
  });
};

export interface DigitalItem {
  id: number;
  name: string;
}
// 数字货币选择
export const getDigitaltTypeReq = (): Promise<ResponseData<DigitalItem[]>> => {
  return request.post<DigitalItem[], object>('/api/center/digital/type', {
    isErrorToast: false,
    body: {},
  });
};

export const useDigitalTypeListQuery = (): ReturnType<
  typeof useQueryHook<DigitalItem[], Error>
> => {
  return useQueryHook<DigitalItem[], Error>({
    queryKey: ['origin', 'digital', 'type'],
    queryFn: () =>
      getDigitaltTypeReq()
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
  });
};

export interface ChainItem {
  chainCode: string;
  chainName: string;
  chainImage: string;
}

// 虚拟币币种选择
export const getSysvirtuaChainlReq = (): Promise<ResponseData<ChainItem[]>> => {
  return request.post<ChainItem[], object>('/api/center/sysvirtual/chain', {
    isErrorToast: false,
    body: {},
  });
};

export const useVirtuaChainListQuery = (): ReturnType<typeof useQueryHook<ChainItem[], Error>> => {
  return useQueryHook<ChainItem[], Error>({
    queryKey: ['origin', 'sysvirtual', 'chain'],
    queryFn: () =>
      getSysvirtuaChainlReq()
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
  });
};

export interface ExchangeItem {
  addTime: number;
  del: boolean;
  delTime: number | null;
  id: number;
  isDefault: boolean;
  isRiskControl: boolean;
  sort: number;
  virtualTypeLogo: string | null;
  virtualTypeName: string;
}

// 获取虚拟币交易所
export const getjysListReq = (): Promise<ResponseData<ExchangeItem[]>> => {
  return request.get<ExchangeItem[], object>('/v3/pay/getVirtualTypeSelect', {
    isErrorToast: true,
  });
};

export const useVirtuaExchangeListQuery = (): ReturnType<
  typeof useQueryHook<ExchangeItem[], Error>
> => {
  return useQueryHook<ExchangeItem[], Error>({
    queryKey: ['origin', 'pay', 'getVirtualTypeSelect'],
    queryFn: () =>
      getjysListReq()
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
  });
};

interface addVirtualParams {
  chainCode: string;
  cardNumber: string;
  remark: string;
  token: string;
  virtualTypeId: number;
}

//  绑定虚拟币
export const addVirtualReq = (params: addVirtualParams) => {
  return request.post('/v3/pay/bindVirtualAccount', {
    isErrorToast: true,
    body: params,
  });
};

interface addDigitalParams {
  sysVirtualId: number;
  cardNumber: string;
  remark: string;
  token: string;
}

//  绑定数字币
export const addDigitalReq = (params: addDigitalParams) => {
  return request.post('/v3/pay/bindDigitalAccount', {
    isErrorToast: true,
    body: params,
  });
};
/** 解绑时验证支付密码的 type：13=银行卡 15=虚拟币 17=数字货币 24=支付宝 */
export const UNBIND_VERIFY_TYPE_MAP = {
  bank: 13,
  virtual: 15,
  digital: 17,
  alipay: 24,
} as const;

// 解绑虚拟币/数字币/支付宝（解绑前要先验证支付密码
export const unBindVirtualAddressReq = (params: {
  token?: string;
  virtualId?: number | string;
  type?: number;
  [key: string]: unknown;
}): Promise<ResponseData<unknown>> => {
  return request.post('/v3/pay/unBindVirtualAddress', {
    isErrorToast: true,
    body: params,
  });
};

// 解绑银行卡（解绑前要先验证支付密码
export const unBindBankAccountReq = (params: {
  token?: string;
  bankId?: number | string;
  type?: number;
  [key: string]: unknown;
}): Promise<ResponseData<unknown>> => {
  return request.post('/v3/pay/unBindBankAccount', {
    isErrorToast: true,
    body: params,
  });
};

interface addAlipayParam {
  cardNumber: string;
  token: string;
  cardName: string;
}
// 绑定支付宝
export function addAlipayReq(params: addAlipayParam) {
  return request.post('/v3/pay/bindZfbAccount', {
    isErrorToast: true,
    body: {
      ...params,
      code: 'alipay',
    },
  });
}
