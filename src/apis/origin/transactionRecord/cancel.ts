import request from '@/core/sdk/request';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface TWithdrawCancelParams {
  orderId: string;
}

/** 取消提现请求 */
export const getWithdrawCancelReq = (params: TWithdrawCancelParams) => {
  return request.post<boolean, TWithdrawCancelParams>('/api/center/withdraw/cancel', {
    body: params,
  });
};

/**
 * 取消提现 mutation
 * 成功后自动 invalidate WithdrawRecord 列表，外层列表会自动刷新
 */
export function useWithdrawCancelMutation(callbacks?: { onSuccess?: (info?: string) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: TWithdrawCancelParams) => getWithdrawCancelReq(params).then((res) => res),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', 'record', 'withdraw'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', 'record', 'memberTransfer'] });
      callbacks?.onSuccess?.(res.info);
    },
  });
}
