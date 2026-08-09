import request from '@/core/sdk/request';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import { useQueryHook } from '@/core/query';

export interface TMemberTransferDetailParams {
  orderId: string;
  version?: string;
}

/** 会员互转进度节点 state: done | active | wait */
export type TProgressNodeState = 'done' | 'active' | 'wait';

export interface TMemberTransferProgressNode {
  code: string;
  state: TProgressNodeState;
  title: string;
  /** 已完成步骤的时间 */
  completedTime?: string;
  /** 进行中步骤的提示文字 */
  hint?: string;
}

/** 提现/互转方式 */
export interface TMemberTransferMethod {
  name: string;
  logoUrl?: string;
}

export interface TMemberTransferDetailData {
  orderId: string;
  /** 创建时间 */
  createTime: string;
  /** 添加时间 */
  addTime: string;
  /** 到账时间 */
  arrivalTime?: string;
  /** 互转金额 */
  cash: number;
  /** 实际扣款金额 */
  cashReal?: number;
  /** 手续费（金额） */
  cashFee?: number;
  /** 手续费 */
  feeAmount?: number;
  /** 转出金额 */
  transferOutAmount?: number;
  /** 到账后余额 */
  afterCash?: number;
  /** 到账前余额 */
  beforeCash?: number;
  /** 账户余额 */
  accountBalance?: number;
  /** 虚拟币数量 */
  virtualNum?: number;
  /** 虚拟币手续费 */
  virtualFee?: number;
  /** 实际虚拟币数量 */
  virtualNumReal?: number;
  /** 货币类型 */
  cashType?: string;
  /** 状态 ID */
  statusId?: number;
  /** 状态描述文案 */
  statusDesc?: string;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  failInfo?: string | null;
  /** 是否可以取消 */
  canCancelWithdraw?: boolean;
  /** 是否显示取消入口 */
  showCancelWithdrawEntry?: boolean;
  /** 是否为会员互转 */
  memberTransfer?: boolean;
  memberTransferWithdraw?: boolean;
  /** 视角：OUT=转出，IN=转入 */
  transferPerspective?: 'OUT' | 'IN';
  /** 列表标题，如"转给ar***33" */
  transferListTitle?: string;
  /** 附言 */
  postscript?: string;
  /** 遮盖后的收款账号 */
  recipientAccountMasked?: string;
  /** 遮盖后的转出账号 */
  transferOutAccountMasked?: string;
  /** 转入方头像（OUT 转出详情） */
  transferInAvatarUrl?: string;
  /** 转出方头像（IN 转入详情） */
  transferOutAvatarUrl?: string;
  /** 交易类型名称，如"交易-互转" */
  transactionType?: string;
  /** 提现/互转方式 */
  withdrawMethod?: TMemberTransferMethod;
  /** 是否显示进度时间线 */
  showProgressTimeline: boolean;
  /** 进度节点列表 */
  progressNodes?: TMemberTransferProgressNode[];
  /** 是否显示最终状态摘要 */
  showFinalStatusSummary: boolean;
  /** 处理中超时提示 */
  processingLongWait?: boolean;
  processingLongWaitMessage?: string;
  /** ETA 提示 */
  processingEtaHint?: string;
  detailExtendVersion?: number;
}

/** 提现记录 */
export const getMemberTransferDetailReq = (params: TMemberTransferDetailParams) => {
  return request.post<TMemberTransferDetailData, TMemberTransferDetailParams>(
    '/api/history/memberTransfer/detail',
    {
      body: params,
    },
  );
};

export function useMemberTransferDetailQuery(params: TMemberTransferDetailParams) {
  return useQueryHook({
    queryKey: ['transaction', 'transactionRecordDetail', 'memberTransferDetail', params],
    enabled: !!params.orderId,
    queryFn: async () => {
      const res = await getMemberTransferDetailReq(params);
      return res.data;
    },
    staleTime: 0,
  });
}
