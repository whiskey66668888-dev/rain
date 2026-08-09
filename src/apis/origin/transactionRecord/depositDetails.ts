import request from '@/core/sdk/request';
import { EDepositStatusId, TradeMainStatus } from '@/apis/commonSports/constants';
import { useQueryHook } from '@/core/query';

export interface TDepositDetailParams {
  orderId: string;
  version?: string;
}

/** 提现进度节点 state: done | active | wait */
export type TProgressNodeState = 'done' | 'active' | 'wait';

export type CashType = 'CNY' | 'DIGITAL' | 'USDT' | 'ZFB';

export interface TDepositProgressNode {
  code: string;
  state: TProgressNodeState;
  title: string;
  /** 已完成步骤的时间 */
  completedTime?: string;
  /** 进行中步骤的提示文字 */
  hint?: string;
}

/** 提现方式 */
export interface TDepositMethod {
  name: string;
  logoUrl?: string;
}

export interface TDepositDetailData {
  orderId: string;
  createTime: string;
  addTime: number;
  cash: number;
  cashReal?: number;
  cashFee?: number;
  feeAmount: number;
  arrivalAmount: number;
  afterCash?: number;
  beforeCash?: number;
  accountBalance: number;
  virtualNum?: number;
  virtualFee?: number;
  virtualNumReal?: number;
  cashType: CashType;
  /** 充值通道 ID */
  depositId?: number;
  /** 充值通道名称 */
  depositName?: string;
  /** 充值方式 */
  depositMethod?: TDepositMethod;
  withdrawExchangeRate?: number;
  withdrawVirtualNetwork?: string;
  /** USDT 虚拟币转账地址 */
  virtualTransferAddress?: string | null;
  statusId?: EDepositStatusId;
  /** 状态描述文案 */
  statusDesc: string;
  /** 订单原始状态码 */
  status?: number;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  failInfo?: string | null;
  canCancelDeposit?: boolean;
  showCancelDepositEntry?: boolean;
  memberTransferDeposit?: boolean;
  recipientNonSelf?: boolean;
  /** 遮盖后的收款人姓名 */
  recipientNameMasked?: string;
  /** 遮盖后的收款账号 */
  recipientAddressMasked?: string;
  /** 交易类型名称（如"交易-充值"） */
  transactionType?: string;
  /** 是否显示进度时间线 */
  showProgressTimeline: boolean;
  /** 进度节点列表 */
  progressNodes?: TDepositProgressNode[];
  /** 是否显示最终状态摘要 */
  showFinalStatusSummary: boolean;
  /** 完成时间 */
  completeTime?: string;
  /** 处理中超时提示 */
  processingLongWait?: boolean;
  processingLongWaitMessage?: string;
  /** ETA 提示 */
  processingEtaHint?: string;
  detailExtendVersion?: number;
  /** 来源类型（如 "ADMIN"） */
  visitType?: string;
  /** 充值凭证图片 */
  img?: string;
}

/** 提现记录 */
export const getDepositDetailReq = (params: TDepositDetailParams) => {
  return request.post<TDepositDetailData, TDepositDetailParams>('/api/history/deposit/detail', {
    body: params,
  });
};

export function useDepositDetailQuery(params: TDepositDetailParams) {
  return useQueryHook({
    queryKey: ['transaction', 'transactionRecordDetail', 'deposit', params],
    enabled: !!params.orderId,
    queryFn: async () => {
      const res = await getDepositDetailReq(params);
      return res.data;
    },
    staleTime: 0,
  });
}
