import request from '@/core/sdk/request';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import { useQueryHook } from '@/core/query';

export interface TBonusDetailParams {
  orderId: string;
  version?: string;
}

/** 红利进度节点 state: done | active | wait */
export type TProgressNodeState = 'done' | 'active' | 'wait';

export interface TBonusProgressNode {
  code: string;
  state: TProgressNodeState;
  title: string;
  /** 已完成步骤的时间 */
  completedTime?: string;
  /** 进行中步骤的提示文字 */
  hint?: string;
}

export interface TBonusDetailData {
  orderId: string;
  /** 创建时间（字符串格式） */
  createTime: string;
  /** 添加时间（字符串格式） */
  addTime: string;
  /** 红利金额 */
  cash: number;
  /** 实际红利金额（同 cash） */
  bonusAmount?: number;
  /** 到账后余额 */
  afterCash?: number;
  /** 到账前余额 */
  beforeCash?: number;
  /** 账户余额 */
  accountBalance: number;
  /** 状态 ID */
  statusId?: number;
  /** 状态描述文案 */
  statusDesc: string;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  failInfo?: string | null;
  /** 红利名称（如"彩蛋礼金"） */
  bonusName?: string;
  /** 红利类型名称 */
  bonusTypeName?: string;
  /** 交易类型名称（如"交易-红利"） */
  transactionType?: string;
  /** 流水倍数 */
  turnoverMultiple?: number;
  /** 备注 */
  remark?: string | null;
  /** 完成时间 */
  completeTime?: string;
  /** 确认时间 */
  confirmTime?: string;
  /** 审核时间 */
  checkTime?: string;
  /** 发放时间 */
  grantTime?: string;
  /** 是否显示进度时间线 */
  showProgressTimeline: boolean;
  /** 进度节点列表 */
  progressNodes?: TBonusProgressNode[];
  /** 是否显示最终状态摘要 */
  showFinalStatusSummary: boolean;
  detailExtendVersion?: number;
}

/** 提现记录 */
export const getBonusDetailReq = (params: TBonusDetailParams) => {
  return request.post<TBonusDetailData, TBonusDetailParams>('/api/history/bonus/detail', {
    body: params,
  });
};

export function useBonusDetailQuery(params: TBonusDetailParams) {
  return useQueryHook({
    queryKey: ['transaction', 'transactionRecordDetail', 'bonus', params],
    enabled: !!params.orderId,
    queryFn: async () => {
      const res = await getBonusDetailReq(params);
      return res.data;
    },
    staleTime: 0,
  });
}
