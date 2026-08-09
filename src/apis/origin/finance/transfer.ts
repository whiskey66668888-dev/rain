import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

export interface GameItem {
  gameId: number;
  gameName: string;
  gameType: string;
  code: number | string; // 余额接口返回的code 用于判断接口是否完成
  balance: number | undefined; // 余额
  info: string; // 接口状态
}

interface TGameBalanceParams {
  gameId: number;
}

interface TEditMemberSetParams {
  modelName: string;
  flag?: boolean | null;
  value?: string;
}

interface EditMemberSetRes {
  appNotice: boolean | null;
  appearanceStyle: number | null;
  automaticFollow: number | null;
  autoCashMode: boolean | null;
  balanceSwitch: boolean | null;
  bettingOddsSettings: number | null;
  bettingSettings: number | null;
  bettingStyle: number | null;
  emailNotice: boolean | null;
  fontSize: number | null;
  goalBell: number | null;
  loginName: string;
  nightModel: boolean | null;
  pictureCardStyle: number | null;
  shock: number | null;
  smsStatus: boolean | null;
  sportsProbability: number | null;
  synchronousSingleString: number | null;
  testPlay: boolean | null;
  userAvatar: string | null;
}

interface TTransferCashParams {
  gameId: number;
  cash: number;
}

interface TDepositAndCashOutTopParams {
  gameId: number;
}

/**
 * 获取 游戏列表
 */
export const queryGameList = (): Promise<ResponseData<GameItem[]>> => {
  return request.post<GameItem[], object>('/api/game/list', { body: {} });
};

/**
 * 获取 游戏列表 React Query Hook
 * 使用 useSuspenseQuery，支持 SSR 自动收集请求数据
 */
export const useGameListQuery = (): ReturnType<typeof useQueryHook<GameItem[], Error>> => {
  return useQueryHook<GameItem[], Error>({
    queryKey: ['transfer', 'gameList'],
    queryFn: () =>
      queryGameList()
        // 过滤主账户
        .then((res) => (res.data || []).filter((obj) => obj.gameType !== 'ALL'))
        .catch(() => {
          return [];
        }),
    staleTime: 0,
    retry: false,
    refetchOnMount: false,
  });
};

// 获取场馆余额
export const queryBalanceByGameId = (params: TGameBalanceParams): Promise<ResponseData<number>> => {
  return request.post<number, TGameBalanceParams>('/api/game/balance', { body: params });
};

// 设置
export const editMemberSet = (
  params: TEditMemberSetParams,
): Promise<ResponseData<EditMemberSetRes>> => {
  return request.post<EditMemberSetRes, TEditMemberSetParams>('/api/member/editMemberSet', {
    body: params,
  });
};

// 给游戏上分(可填写金额)
export function doGameDeposit(data: TTransferCashParams) {
  return request.post<boolean, TTransferCashParams>('/api/game/deposit/cash', {
    body: data,
  });
}

// 场馆转出到中心钱包
export function doGameWithdraw(data: TTransferCashParams) {
  return request.post<boolean, TTransferCashParams>('/api/game/withdraw', {
    body: data,
  });
}

// 进入游戏后自动执行归集并转入当前场馆
export function depositAndCashOutTopReq(data: TDepositAndCashOutTopParams) {
  return request.post<boolean, TDepositAndCashOutTopParams>('/api/game/depositandcashouttop5', {
    body: data,
    isErrorToast: false,
  });
}

interface TCheckWeekStatusParams {
  gameType: string;
}

// 转账前检测流水是否满足
export function checkWeekStatus(data: TCheckWeekStatusParams) {
  return request.post<boolean, TCheckWeekStatusParams>('/api/game/check/platform/status', {
    body: data,
  });
}

interface TMemberTransferParams {
  loginName: string; // 会员账户
  cash: string; // 转账金额
  cashPassword: string; // 支付密码
  markInfo: string; // 备注
}

// 会员互转
export const doMemberTransfer = (data: TMemberTransferParams) => {
  return request.post<boolean, TMemberTransferParams>('/api/center/deposit/member', {
    body: data,
  });
};
