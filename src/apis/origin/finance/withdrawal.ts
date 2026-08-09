import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData, ResponseError } from '@/core/sdk/request/model';
import { getAlipayListReq, type CardItemVo } from '@/apis/origin/bank';

export enum WithdrawType {
  // 银行卡充值
  bank = 'bank',
  // 虚拟币
  virtual = 'virtual',
  // 数字货币
  digital = 'aliwechat',
  // 数字货币
  zfb = 'zfb',
}

export interface AccountItem {
  id: number; // memberAccountId
  name: string; // memberCard
  cardName: string; // 卡片名称 bankName
  cardCode: string; // 卡片代码
  cardLogo: string; // 卡片logo memberLogoUrl
  info?: string; // 虚拟币信息 virtualInfo
  rate?: string; // 虚拟币汇率 virtualRate
  virtualTypeName: string; // 钱包平台
  virtualTypeId: number; // 钱包平台id
  isOwn: number; // 是否拥有
  username?: string; // 银行用户名 bankUserName
  remark?: string; // 备注
  isDefault: number; // 是否默认
  memberCardNum: string; // 卡号后4位
}

export interface WithdrawItem {
  code: WithdrawType; // 类型
  name: string; // 名称
  icon: string; // 图标
  explain: string; // 提示信息
  hot: number; // 是否热门
  money: string; // 最大可提
  minCash: string;
  maxCash: string;
  accountList: AccountItem[];
  hasCashPass: boolean;
  protocol?: string;
  cardMax: number; // cradMax
}

export interface WithdrawalResponse {
  withdrawList: WithdrawItem[]; // 提现渠道
  canWithdrawVirtual: boolean; // 是否能虚拟币
  bankCardNum: number; // 银行卡提款成功次数
  bankCardFlag: boolean; // 银行卡提款限制是否打开
}

interface AccountItemRes {
  memberVirtualId: number;
  memberAccountId: number; //
  memberCard: string; //
  memberCardName: string;
  memberBankId: number;
  memberBankCode: string;
  bankName: string; // 卡片名称
  cardName: string;
  memberLogoUrl: string; // 卡片logo
  zfbLogoUrl: string;
  digitalLogoUrl: string;
  virtualLogoUrl: string;
  virtualInfo?: string; // 虚拟币信息
  virtualRate?: string; // 虚拟币汇率
  virtualTypeName: string; // 钱包平台
  virtualTypeId: number; // 钱包平台id
  isOwn: number; // 是否拥有
  bankUserName?: string; // 银行用户名
  remark?: string; // 备注
  isDefault: number; // 是否默认
  memberCardNum: string; // 卡号后4位
  cardNum: string;
}

interface WithdrawChannelItem {
  explain: string;
  money: string;
  minCash: string | number;
  maxCash: string | number;
  haveCashPass?: boolean;
  hasCashPass?: boolean;
  hot: number;
  digitalList: AccountItemRes[];
  accountList: AccountItemRes[];
  zfbList: AccountItemRes[];
  cradMax?: number;
}

interface TimesFlag {
  bankCardWithdrawTimesFlag: boolean;
  bankCardWithdrawTimes: number;
}

interface WithdrawChannelResponse {
  digital?: WithdrawChannelItem;
  bank?: WithdrawChannelItem;
  trc20?: WithdrawChannelItem;
  alipay?: WithdrawChannelItem;
  topay?: TimesFlag;
  bankCardWithdrawTimesFlag?: TimesFlag;
  canWithdrawVirtual: boolean;
  hasCashPass: boolean;
}

const formatAlipayAccountsFromChannel = (list: AccountItemRes[] = []): AccountItem[] => {
  return list.map((obj) => ({
    ...obj,
    id: obj.memberVirtualId || obj.memberAccountId,
    name: obj.memberCard || obj.cardNum || '',
    cardName: obj.memberCardName || obj.bankName || '支付宝',
    cardCode: '',
    cardLogo: obj.zfbLogoUrl || obj.memberLogoUrl || '/images/common/finance/ic_zfb.svg',
    username: obj.cardName || obj.bankUserName || '',
    memberCardNum: obj.cardNum || obj.memberCardNum || '',
  }));
};

const formatAlipayAccountsFromList = (list: CardItemVo[] = []): AccountItem[] => {
  return list.map((obj) => ({
    id: obj.id,
    name: obj.cardNumber,
    cardName: obj.cardName || '支付宝',
    cardCode: '',
    cardLogo: obj.cardLogo || '/images/common/finance/ic_zfb.svg',
    virtualTypeName: '',
    virtualTypeId: 0,
    isOwn: 1,
    username: obj.username || '',
    remark: obj.remark || '',
    isDefault: 0,
    memberCardNum: obj.cardNumber,
  }));
};

export interface WithdrawWhiteListResponse {
  alreadyUseNum: number; // 已经使用的次数
  canOutMoney: number; // 普通额度
  canOutNums: number; // 普通剩余次数
  outNumsMax: number; // 每日普通提款最大次数
  isInWhiteList: boolean; // 是否在白名单
  remainAmount: number; // 白名单剩余额度
  remainNum: number; // 白名单剩余次数
  suggestToUsdt: boolean; // 是否推荐usdt提款
  whiteLimitAmount: number; // 白名单总额度
  whiteLimitNum: number; // 白名单总次数
}

export interface WithdrawRateResponse {
  buyRate: number;
  sellRate: number;
}

interface WithdrawFeePayload {
  cash?: string | number;
  rate?: string | number;
  fee?: string | number;
  data?: WithdrawFeePayload;
}

export interface WithdrawFeeResponse {
  code: string;
  cash: number;
  rate: number;
}

interface WithdrawFlowCheckPayload {
  remainCash?: string | number;
}

export interface WithdrawFlowCheckResponse {
  code: string;
  remainCash: number;
  message: string;
}

// fee 相关接口返回结构不稳定，这里统一做数值清洗。
const parseWithdrawFeeNum = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value !== 'string' && typeof value !== 'number') return 0;
  const parsed = Number(value.toString().replaceAll('%', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

// 部分环境会把真正的数据包在 data.data 里，这里做一次扁平化。
const unwrapWithdrawFeeData = (data: unknown): WithdrawFeePayload => {
  if (!data || typeof data !== 'object') return {};
  const payload = data as WithdrawFeePayload;
  if ('cash' in payload || 'rate' in payload || 'fee' in payload) {
    return payload;
  }
  if (payload.data && typeof payload.data === 'object') {
    return payload.data;
  }
  return payload;
};

// fee/get 与 fee/check 字段名不同，通过 rateKey 统一成前端消费结构。
const normalizeWithdrawFeeResponse = (
  res: ResponseData<WithdrawFeePayload>,
  rateKey: 'rate' | 'fee',
): WithdrawFeeResponse => {
  const payload = unwrapWithdrawFeeData(res?.data);
  const rawRate = rateKey === 'fee' ? (payload.fee ?? payload.rate) : (payload.rate ?? payload.fee);
  const code = String(
    (res as ResponseData<WithdrawFeePayload> & { code?: string | number })?.code ?? '0000',
  );

  return {
    code,
    cash: parseWithdrawFeeNum(payload.cash),
    rate: parseWithdrawFeeNum(rawRate),
  };
};

const normalizeWithdrawFeeErrorResponse = (
  error: unknown,
  rateKey: 'rate' | 'fee',
): WithdrawFeeResponse => {
  // fee 接口会用 6000/6001/6003 等非成功码驱动前端弹窗，不能在 catch 里吞成通用失败。
  if (error instanceof ResponseError) {
    const response = error.response;
    if (isWithdrawFeeResponseData(response)) {
      return normalizeWithdrawFeeResponse(response, rateKey);
    }
  }

  return { code: '9999', cash: 0, rate: 0 };
};

const isWithdrawFeeResponseData = (value: unknown): value is ResponseData<WithdrawFeePayload> => {
  return typeof value === 'object' && value !== null && 'code' in value;
};

const normalizeWithdrawFlowCheckResponse = (
  res?: Partial<ResponseData<WithdrawFlowCheckPayload>>,
): WithdrawFlowCheckResponse => {
  const payload: WithdrawFlowCheckPayload =
    res?.data && typeof res.data === 'object' ? res.data : {};
  const code = res?.code;
  const message = res?.info || res?.message || '';

  return {
    code: String(code ?? '0000'),
    remainCash: parseWithdrawFeeNum(payload.remainCash),
    message,
  };
};

const isWithdrawFlowCheckResponseData = (
  value: unknown,
): value is Partial<ResponseData<WithdrawFlowCheckPayload>> => {
  return typeof value === 'object' && value !== null;
};

/**
 * 获取 充值渠道列表
 */
export const getWithdrawalChannel = (): Promise<
  [
    ResponseData<WithdrawChannelResponse>,
    ResponseData<WithdrawChannelItem>,
    ResponseData<CardItemVo[]>,
  ]
> => {
  return Promise.all([
    request.post<WithdrawChannelResponse, object>('/api/withdraw/channels', { body: {} }),
    request.post<WithdrawChannelItem, object>('/api//center/withdraw/zfb/get', { body: {} }),
    getAlipayListReq(),
  ]);
};

const formatterChannels = ([res, res1, res2]: [
  ResponseData<WithdrawChannelResponse>,
  ResponseData<WithdrawChannelItem>,
  ResponseData<CardItemVo[]>,
]): WithdrawalResponse => {
  if (!res?.data) return {} as WithdrawalResponse;
  const result: WithdrawChannelResponse = res?.data ?? {};
  const zfbResult: WithdrawChannelItem = res1?.data ?? {};
  const alipayListResult = res2?.data ?? [];
  // 处理提款配置
  const timesFlag = result.bankCardWithdrawTimesFlag ?? result.topay ?? ({} as TimesFlag);
  const bankCardNum = timesFlag.bankCardWithdrawTimes;
  const bankCardFlag = timesFlag.bankCardWithdrawTimesFlag;
  const canWithdrawVirtual = result.canWithdrawVirtual;

  const withdrawList: WithdrawItem[] = [];

  // 银行卡
  const bank = result['bank'] ?? ({} as WithdrawChannelItem);
  if (Object.values(bank).length) {
    const bankAccountList = bank['accountList'] ?? [];
    withdrawList.push({
      code: WithdrawType.bank,
      name: '银行卡提现',
      icon: '/images/common/finance/ic_bank.svg',
      explain: bank.explain,
      hot: bank.hot,
      money: bank.money,
      minCash: String(bank.minCash),
      maxCash: String(bank.maxCash),
      accountList: bankAccountList.map((obj) => ({
        ...obj,
        id: obj['memberAccountId'],
        name: obj['memberCard'],
        cardName: obj['bankName'],
        cardCode: obj['memberBankCode'],
        cardLogo: obj['memberLogoUrl'],
        username: obj['bankUserName'] ?? '',
      })),
      hasCashPass: bank.hasCashPass ?? false,
      cardMax: bank?.cradMax ?? 0, // cradMax
    });
  }

  // 虚拟币类型
  const usdt = result['trc20'] ?? ({} as WithdrawChannelItem);
  if (Object.values(usdt).length) {
    const usdtAccountList = usdt['accountList'] ?? [];
    withdrawList.push({
      code: WithdrawType.virtual,
      name: '虚拟币提现',
      icon: '/images/common/finance/ic_usdt.svg',
      explain: usdt.explain,
      hot: usdt.hot,
      money: usdt.money,
      minCash: String(usdt.minCash),
      maxCash: String(usdt.maxCash),
      accountList: usdtAccountList.map((obj) => ({
        ...obj,
        id: obj['memberAccountId'],
        name: obj['memberCard'],
        cardName: 'TRC20',
        cardCode: '',
        cardLogo: obj['virtualLogoUrl'],
        info: obj['virtualInfo'],
        rate: obj['virtualRate'],
        username: obj['bankUserName'] ?? '',
      })),
      hasCashPass: usdt.hasCashPass ?? false,
      protocol: 'TRC20',
      cardMax: usdt?.cradMax ?? 0, // cradMax
    });
  }

  // 数字货币
  const digital = result['digital'] ?? ({} as WithdrawChannelItem);
  if (Object.values(digital).length) {
    const digitalAccountList = digital['digitalList'] ?? [];
    withdrawList.push({
      code: WithdrawType.digital,
      name: '数字币提现',
      icon: '/images/common/finance/ic_digital.svg',
      explain: digital.explain,
      hot: digital.hot,
      money: digital.money,
      minCash: String(digital.minCash),
      maxCash: String(digital.maxCash),
      accountList: digitalAccountList.map((obj) => ({
        ...obj,
        id: obj['memberVirtualId'],
        name: obj['memberCard'],
        cardName: obj['memberCardName'],
        cardCode: '',
        cardLogo: obj['digitalLogoUrl'],
        username: obj['bankUserName'] ?? '',
      })),
      hasCashPass: digital?.haveCashPass ?? false,
      cardMax: digital?.cradMax ?? 0, // cradMax
    });
  }

  // 支付宝类型
  const alipay1 = result['alipay'] ?? ({} as WithdrawChannelItem);
  if (Object.values(alipay1).length) {
    const alipay = { ...alipay1, ...zfbResult };
    const zfbAccountList = formatAlipayAccountsFromChannel(alipay['zfbList'] ?? []);
    const fallbackZfbAccountList =
      zfbAccountList.length > 0 ? zfbAccountList : formatAlipayAccountsFromList(alipayListResult);

    withdrawList.push({
      code: WithdrawType.zfb,
      name: '支付宝提现',
      icon: '/images/common/finance/ic_zfb.svg',
      explain: alipay.explain,
      hot: alipay.hot,
      money: alipay.money,
      minCash: String(alipay.minCash),
      maxCash: String(alipay.maxCash),
      accountList: fallbackZfbAccountList,
      hasCashPass: alipay?.hasCashPass ?? false,
      cardMax: alipay?.cradMax ?? 0, // cradMax
    });
  }

  return {
    withdrawList: withdrawList,
    canWithdrawVirtual: canWithdrawVirtual,
    bankCardNum: bankCardNum,
    bankCardFlag: bankCardFlag,
  };
};

/**
 * 获取 提现渠道列表 React Query Hook
 * 使用 useSuspenseQuery，支持 SSR 自动收集请求数据
 */
export const useWithdrawalChannelQuery = (): ReturnType<
  typeof useQueryHook<WithdrawalResponse, Error>
> => {
  return useQueryHook<WithdrawalResponse, Error>({
    queryKey: ['withdrawal', 'channels'],
    queryFn: () =>
      getWithdrawalChannel()
        .then((res) => {
          return formatterChannels(res);
        })
        .catch(() => {
          return {} as WithdrawalResponse;
        }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always',
  });
};

/**
 * 获取提现次数
 */
const getWhiteList = (): Promise<ResponseData<WithdrawWhiteListResponse>> => {
  return request.post<WithdrawWhiteListResponse, object>('/api/withdraw/whiteCheck', {
    body: {},
  });
};

export const useWhiteListQuery = (): ReturnType<
  typeof useQueryHook<WithdrawWhiteListResponse, Error>
> => {
  return useQueryHook<WithdrawWhiteListResponse, Error>({
    queryKey: ['withdrawal', 'whiteCheck'],
    queryFn: () =>
      getWhiteList()
        .then((res) => {
          return res.data;
        })
        .catch(() => {
          return {} as WithdrawWhiteListResponse;
        }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always',
  });
};

/**
 * 获取提现汇率
 */
export const getWithdrawRate = (): Promise<ResponseData<WithdrawRateResponse>> => {
  return request.post<WithdrawRateResponse, object>('/api/website/getRate', {
    body: {},
  });
};

/**
 * 获取提现手续费配置
 * type: 1=法币(银行卡/支付宝), 2=虚拟币, 3=数字币
 */
export const getWithdrawFee = (type: number): Promise<WithdrawFeeResponse> => {
  return request
    .post<WithdrawFeePayload, { type: number }>('/api/withdraw/fee/get', {
      body: { type },
      isErrorToast: false,
    })
    .then((res) => normalizeWithdrawFeeResponse(res, 'fee'))
    .catch((error: unknown) => normalizeWithdrawFeeErrorResponse(error, 'fee'));
};

/**
 * 检查提现手续费策略
 * type: 1=法币(银行卡/支付宝), 2=虚拟币, 3=数字币
 */
export const checkWithdrawFee = (type: number): Promise<WithdrawFeeResponse> => {
  return request
    .post<WithdrawFeePayload, { type: number }>('/api/withdraw/fee/check', {
      body: { type },
      isErrorToast: false,
    })
    .then((res) => normalizeWithdrawFeeResponse(res, 'rate'))
    .catch((error: unknown) => normalizeWithdrawFeeErrorResponse(error, 'rate'));
};

/**
 * 按金额重新校验白名单出款策略
 */
export const checkWhiteList = (cash?: string): Promise<ResponseData<WithdrawWhiteListResponse>> => {
  return request.post<WithdrawWhiteListResponse, { cash?: string }>('/api/withdraw/whiteCheck', {
    body: cash ? { cash } : {},
    isErrorToast: false,
  });
};

export const checkWithdrawFlow = (): Promise<WithdrawFlowCheckResponse> => {
  return request
    .post<WithdrawFlowCheckPayload, object>('/api/withdraw/flowCheck', {
      body: {},
      isErrorToast: false,
    })
    .then((res) => normalizeWithdrawFlowCheckResponse(res))
    .catch((error: unknown) => {
      if (error instanceof ResponseError) {
        const response = error.response;
        if (isWithdrawFlowCheckResponseData(response)) {
          return normalizeWithdrawFlowCheckResponse(response);
        }
      }
      return {
        code: '9999',
        remainCash: 0,
        message: '网络错误',
      };
    });
};

export const useWithdrawRateQuery = (): ReturnType<
  typeof useQueryHook<WithdrawRateResponse, Error>
> => {
  return useQueryHook<WithdrawRateResponse, Error>({
    queryKey: ['withdrawal', 'getRate'],
    queryFn: () =>
      getWithdrawRate()
        .then((res) => {
          return res.data;
        })
        .catch(() => {
          return {} as WithdrawRateResponse;
        }),
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};

export interface TWithdrawalParams {
  withdrawType: WithdrawType;
  memberBankId: number; // 卡id
  cash: string; // 支付金额
  cashPassword: string; // 支付密码
  virtualInfo?: string; // 虚拟币信息
  rate?: string; // 汇率
  num?: string; // 转化金额
  virtualTypeId?: number; // 钱包平台
  withdrawCurrency?: string; // 金额单位 USDT/RMB
}

/**
 * 提交 提现
 */
export const doWithdrawal = (params: TWithdrawalParams) => {
  const {
    withdrawType,
    memberBankId,
    cash,
    cashPassword,
    virtualInfo,
    rate,
    num,
    virtualTypeId,
    withdrawCurrency,
  } = params;
  if (withdrawType === WithdrawType.bank) {
    return request.post('/api/center/withdraw', {
      body: {
        memberBankId,
        cash,
        cashPassword,
      },
      isErrorToast: false,
    });
  } else if (withdrawType === WithdrawType.digital) {
    return request.post('/api/center/withdraw/digital', {
      body: {
        memberVirtualId: memberBankId,
        cash,
        cashPassword,
      },
      isErrorToast: false,
    });
  } else if (withdrawType === WithdrawType.zfb) {
    return request.post('/api/center/withdraw/zfb', {
      body: {
        memberVirtualId: memberBankId,
        cash,
        cashPassword,
      },
      isErrorToast: false,
    });
  } else {
    return request.post('/api/center/withdraw/virtual/trc20', {
      body: {
        memberVirtualId: memberBankId,
        cash,
        cashPassword,
        virtualInfo,
        rate,
        num,
        virtualTypeId,
        withdrawCurrency,
      },
      isErrorToast: false,
    });
  }
};

interface RiskBankItem {
  bankCode: string;
}

export interface RiskBankInfo {
  content1?: string; // 风险提示1
  content2?: string; // 风险提示2
  tipTime?: number; // 风险提示倒计时时间（秒）
  title?: string; // 风险提示标题
  tipBankList?: RiskBankItem[]; // 风险银行列表（需要提示的银行）
}

// 获取风险银行信息
export const queryBankRiskInfo = (): Promise<ResponseData<RiskBankInfo>> => {
  return request.post('/api/member/riskbank/info', { body: {} });
};

export const useBankRiskInfoQuery = (): ReturnType<typeof useQueryHook<RiskBankInfo, Error>> => {
  return useQueryHook<RiskBankInfo, Error>({
    queryKey: ['withdrawal', 'riskBank'],
    queryFn: () =>
      queryBankRiskInfo()
        .then((res) => {
          return res.data;
        })
        .catch(() => {
          return {};
        }),
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};
