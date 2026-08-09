import request from '@/core/sdk/request';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EDepositStatusId, TradeMainStatus } from '@/apis/commonSports/constants';

export interface TDepositRecordParams {
  pageSize: number;
  pageNumber: number;
  beginTime: string;
  endTime: string;
  tradeMainStatus: TradeMainStatus;
}

export interface TDepositRecordItem {
  actionType: string;
  addTime: string;
  statusId: EDepositStatusId;
  orderId: string;
  num: number;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  cash: number;
  status: string;
  canCancel: boolean;
  groupName: string;
}

export interface TDepositStatusFilterOption {
  value: TradeMainStatus;
  label: string;
}

export interface TDepositStatusFilter {
  filterTitle: string;
  transactionTypeName: string;
  defaultValue: string;
  selectedValue: string;
  selectedLabel: string;
  options: TDepositStatusFilterOption[];
}

export interface TDepositRecordRes {
  totalAmount: number;
  statusFilter: TDepositStatusFilter;
  totalSize: number;
  totalPage: number;
  list: TDepositRecordItem[];
}

/** 充值记录 */
export const getDepositRecordReq = (params: TDepositRecordParams) => {
  return request.post<TDepositRecordRes, TDepositRecordParams>(
    '/api/history/transferRecord/new/deposit',
    {
      body: params,
    },
  );
};

/** 充值记录分页查询（React Query 无限滚动） */
export const useDepositRecordQuery = (params: Omit<TDepositRecordParams, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: ['transaction', 'record', 'deposit', params],
    enabled: true,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getDepositRecordReq({
        ...params,
        pageNumber: pageParam,
      });
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      if (lastPage.totalPage && lastPage.totalPage > currentPage) {
        return currentPage + 1; // 下一页页码
      }
      return undefined; // 没有下一页
    },
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};
