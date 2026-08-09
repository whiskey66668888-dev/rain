import request from '@/core/sdk/request';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EWithdrawStatusId, TradeMainStatus } from '@/apis/commonSports/constants';

export interface TWithdrawRecordParams {
  pageSize: number;
  pageNumber: number;
  beginTime: string;
  endTime: string;
  tradeMainStatus: TradeMainStatus;
}

export interface TWithdrawRecordItem {
  addTime: string;
  card: string | null;
  cashTypeDesc?: string;
  cash: number;
  canCancel?: boolean;
  failInfo?: string | null;
  info?: string;
  num: number;
  orderId: string;
  showType: number;
  status: string;
  statusId: EWithdrawStatusId;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  canCancelWithdraw: boolean;
  memberTransfer: boolean;
  groupName: string;
}

export interface TWithdrawStatusFilterOption {
  value: TradeMainStatus | '';
  label: string;
}

export interface TWithdrawStatusFilter {
  filterTitle: string;
  transactionTypeName: string;
  defaultValue: string;
  selectedValue: string;
  selectedLabel: string;
  options: TWithdrawStatusFilterOption[];
}

export interface TWithdrawRecordRes {
  totalAmount: number;
  statusFilter: TWithdrawStatusFilter;
  totalSize: number;
  totalPage: number;
  list: TWithdrawRecordItem[];
}

/** 提现记录 */
export const getWithdrawRecordReq = (params: TWithdrawRecordParams) => {
  return request.post<TWithdrawRecordRes, TWithdrawRecordParams>(
    '/api/history/transferRecord/new/withdraw',
    {
      body: params,
    },
  );
};

type TCustomerServiceWithdrawRecordParams = Pick<
  TWithdrawRecordParams,
  'pageSize' | 'pageNumber' | 'beginTime' | 'endTime'
>;

/** 我的设备弹框提现记录：与 EMC Flutter 的 recordNew 数据源保持一致。 */
export const getCustomerServiceWithdrawRecordReq = (
  params: TCustomerServiceWithdrawRecordParams,
) => {
  return request.post<
    Pick<TWithdrawRecordRes, 'list'> & Partial<Pick<TWithdrawRecordRes, 'totalPage' | 'totalSize'>>,
    TCustomerServiceWithdrawRecordParams
  >('/api/history/recordNew/withdraw', {
    body: params,
  });
};

/** 提现记录分页查询（React Query 无限滚动） */
export const useWithdrawRecordQuery = (params: Omit<TWithdrawRecordParams, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: ['transaction', 'record', 'withdraw', params],
    enabled: true,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getWithdrawRecordReq({
        ...params,
        pageNumber: pageParam,
      });
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      if (lastPage.totalPage && lastPage.totalPage > currentPage) {
        return currentPage + 1;
      }
      return undefined;
    },
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};
