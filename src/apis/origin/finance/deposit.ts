import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { useEffect, useState } from 'react';

export interface DiscountItem {
  dicountId: number;
  discountImg: string;
}

export interface PayItem {
  cashMax: number;
  cashMin: number;
  cashType: number;
  explain: string;
  firstLineName: string;
  hot: boolean;
  oyBuyRate: number;
  payId: number;
  payImage: string;
  payName: string;
  payType: string;
  payUrl: string;
  suggestAmountList: string[];
  thirdRate: string;
}

export interface ChannelItem {
  code: string;
  hot: number;
  logoUrl: string;
  name: string;
  sort: number;
  status: boolean;
  payList: PayItem[];
  discountList: DiscountItem[];
}

export type DepositChannelResponse = ChannelItem[];

export interface DepositResponse {
  orderCash: number;
  orderId: string;
  orderTime: string;
  payqrcode?: string;
  showPost: boolean;
  type: string;
  url: string;
  virtualAddress: string;
  virtualChain: string;
  virtualNum?: number;
}

export interface TDepositParams {
  payId: number;
  cash: string;
}

const formatChannelData = (data: DepositChannelResponse): DepositChannelResponse => {
  return data.map((obj) => ({
    ...obj,
    payList:
      obj.code === 'virtual'
        ? [
            ...obj.payList,
            {
              cashMax: 0,
              cashMin: 0,
              cashType: 0,
              explain: '',
              firstLineName: '',
              hot: false,
              oyBuyRate: 1,
              payId: -1,
              payImage: '/images/common/finance/ic_trc20.svg',
              payName: '虚拟币教程',
              payType: '',
              payUrl: '',
              suggestAmountList: [],
              thirdRate: '',
            },
          ]
        : obj.payList,
  }));
};

/**
 * 获取 充值渠道列表
 */
export const getDepositChannel = (): Promise<ResponseData<DepositChannelResponse>> => {
  return request.post<DepositChannelResponse, object>('/api/pay/channels/v2', { body: {} });
};

/**
 * 获取 充值渠道列表 React Query Hook
 * 使用 useSuspenseQuery，支持 SSR 自动收集请求数据
 */
export const useDepositChannelQuery = (): ReturnType<typeof useQueryHook<ChannelItem[], Error>> => {
  return useQueryHook<DepositChannelResponse, Error>({
    queryKey: ['pay', 'channels'],
    queryFn: () =>
      getDepositChannel()
        .then((res) => formatChannelData(res.data))
        .catch(() => {
          return [];
        }),
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};

interface BankLock {
  failNumber: number;
  hours?: number;
  isCashInLock: boolean;
  isWebPayLock: boolean;
  maxNumber: number;
}

const getDepositBankLock = (): Promise<ResponseData<BankLock>> => {
  return request.post<BankLock, object>('/api/pay/bank/lock', { body: {} });
};

export const useDepositBankLockQuery = (): ReturnType<typeof useQueryHook<BankLock, Error>> => {
  return useQueryHook<BankLock, Error>({
    queryKey: ['pay', 'bankLock'],
    queryFn: () =>
      getDepositBankLock()
        .then((res) => res.data)
        .catch(() => {
          return {} as BankLock;
        }),
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};

// 立即存款按钮 点击后 是否弹出提示框hook
export const useDepositReminderlHooks = () => {
  // 是否显示
  const [isRemembered, setRemembered] = useState(false);
  //
  useEffect(() => {
    let status;
    if (document.cookie.length > 0) {
      const arr: string[] = document.cookie.split('; '); //显示的格式需要切割
      for (let i = 0; i < arr.length; i++) {
        const arr2 = arr[i]!.split('='); //再次切割
        //判断查找相对应的值
        if (arr2[0] === 'normalDepositSub') {
          status = arr2[1]; //
        }
      }
    }

    if (status == 'true') {
      setRemembered(true);
    }
  }, []);

  //设置提交弹框cookie
  const setDepositRemembered = () => {
    setRemembered(true);
    const exdate = new Date(); //获取时间
    exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * 1); //保存的天数
    //字符串拼接cookie
    window.document.cookie = 'normalDepositSub=true;path=/;expires=' + exdate.toString();
  };

  return {
    isRemembered, // 是否已记住
    setDepositRemembered,
  };
};

/**
 * 提交 充值
 */
export const doDeposit = (params: TDepositParams): Promise<ResponseData<DepositResponse>> => {
  return request.post<DepositResponse, TDepositParams>('/api/center/deposit/online', {
    body: params,
  });
};
