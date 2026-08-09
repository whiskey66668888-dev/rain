import request from '@/core/sdk/request';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import { useQueryHook } from '@/core/query';

export interface TMoneychangeDetailParams {
  orderId: string;
  version?: string;
}

/** 转账进度节点 state: done | active | wait */
export type TProgressNodeState = 'done' | 'active' | 'wait';

export interface TMoneychangeProgressNode {
  code: string;
  state: TProgressNodeState;
  title: string;
  /** 已完成步骤的时间 */
  completedTime?: string;
  /** 进行中步骤的提示文字 */
  hint?: string;
}

export interface TMoneychangeDetailData {
  orderId: string;
  /** 创建时间 */
  createTime: string;
  /** 完成时间 */
  completeTime?: string;
  /** 转出钱包名称，如"EB体育(新)" */
  transferOutWalletName?: string;
  /** 转入钱包名称，如"主账号" */
  transferInWalletName?: string;
  /** 转出金额 */
  transferOutAmount: number;
  /** 主账号余额 */
  mainAccountBalance?: number;
  /** 操作类型，如"下分" / "上分" */
  operateType?: string;
  /** 摘要提示文案，如"金额已从xxx钱包转入xxx钱包。" */
  transferSummaryHint?: string;
  /** 交易类型名称，如"交易-转账" */
  transactionType?: string;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  /** 是否显示进度时间线 */
  showProgressTimeline: boolean;
  /** 进度节点列表 */
  progressNodes?: TMoneychangeProgressNode[];
  /** 是否显示最终状态摘要 */
  showFinalStatusSummary: boolean;
  detailExtendVersion?: number;
}

/** 提现记录 */
export const getMoneychangeDetailReq = (params: TMoneychangeDetailParams) => {
  return request.post<TMoneychangeDetailData, TMoneychangeDetailParams>(
    '/api/history/transaction/detail/walletTransfer',
    {
      body: params,
    },
  );
};

export function useMoneychangeDetailQuery(params: TMoneychangeDetailParams) {
  return useQueryHook({
    queryKey: ['transaction', 'transactionRecordDetail', 'moneychange', params],
    enabled: !!params.orderId,
    queryFn: async () => {
      const res = await getMoneychangeDetailReq(params);
      return res.data;
    },
    staleTime: 0,
  });
}
