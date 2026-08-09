import request from '@/core/sdk/request';
import { EWithdrawStatusId, TradeMainStatus } from '@/apis/commonSports/constants';
import { useQueryHook } from '@/core/query';

export interface TWithdrawDetailParams {
  orderId: string;
  version?: string;
}

/** 提现进度节点 state: done | active | wait */
export type TProgressNodeState = 'done' | 'active' | 'wait';

export type CashType = 'CNY' | 'DIGITAL' | 'USDT' | 'ZFB';

export interface TWithdrawProgressNode {
  code: string;
  state: TProgressNodeState;
  title: string;
  /** 已完成步骤的时间 */
  completedTime?: string;
  /** 进行中步骤的提示文字 */
  hint?: string;
}

/** 提现方式 */
export interface TWithdrawMethod {
  name: string;
  logoUrl?: string;
}

export interface TWithdrawDetailData {
  orderId: string;
  createTime: string;
  addTime: string;
  cash: number;
  cashReal: number;
  cashFee: number;
  feeAmount: number;
  arrivalAmount: number;
  afterCash: number;
  beforeCash: number;
  accountBalance: number;
  virtualNum: number;
  virtualFee: number;
  virtualNumReal: number;
  cashType: CashType;
  withdrawExchangeRate: number;
  withdrawVirtualNetwork: string;
  statusId: EWithdrawStatusId;
  statusDesc: string;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  failInfo?: string | null;
  canCancelWithdraw: boolean;
  showCancelWithdrawEntry: boolean;
  memberTransferWithdraw: boolean;
  recipientNonSelf: boolean;
  /** 遮盖后的收款人姓名 */
  recipientNameMasked?: string;
  /** 遮盖后的收款账号 */
  recipientAddressMasked?: string;
  /** 交易类型名称 */
  transactionType?: string;
  /** 提现方式 */
  withdrawMethod?: TWithdrawMethod;
  /** 是否显示进度时间线 */
  showProgressTimeline: boolean;
  /** 进度节点列表 */
  progressNodes?: TWithdrawProgressNode[];
  /** 是否显示最终状态摘要 */
  showFinalStatusSummary: boolean;
  /** 处理中超时提示 */
  processingLongWait?: boolean;
  processingLongWaitMessage?: string;
  /** ETA 提示（资金处理中时显示） */
  processingEtaHint?: string;
  detailExtendVersion?: number;

  recipientAddressLogoUrl?: string;
}

/** 提现记录 */
export const getWithdrawDetailReq = (params: TWithdrawDetailParams) => {
  return request.post<TWithdrawDetailData, TWithdrawDetailParams>('/api/history/withdraw/detail', {
    body: params,
  });
};

export function useWithdrawDetailQuery(params: TWithdrawDetailParams) {
  return useQueryHook({
    queryKey: ['transaction', 'transactionRecordDetail', 'withdrawDetail', params],
    enabled: !!params.orderId,
    queryFn: async () => {
      const res = await getWithdrawDetailReq(params);
      return res.data;
    },
    staleTime: 0,
  });
}
