// /api/history/record/moneychange

import { TradeMainStatus } from '@/apis/commonSports/constants';
import request from '@/core/sdk/request';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface TMoneyChangeRecordParams {
  pageSize: number;
  pageNumber: number;
  beginTime: string;
  endTime: string;
  tradeMainStatus: TradeMainStatus;
}

export interface TMoneyChangeRecordItem {
  addTime: string;
  orderId: string;
  afterCash: number;
  change: string;
  cash: number;
  walletTransfer: boolean;
}

export interface TMoneyChangeStatusFilterOption {
  value: string;
  label: string;
}

export interface TMoneyChangeStatusFilter {
  filterTitle: string;
  transactionTypeName: string;
  defaultValue: string;
  selectedValue: string;
  selectedLabel: string;
  options: TMoneyChangeStatusFilterOption[];
}

export interface TMoneyChangeRecordRes {
  totalAmount: number;
  statusFilter: TMoneyChangeStatusFilter;
  totalSize: number;
  totalPage: number;
  list: TMoneyChangeRecordItem[];
}

/** 转账记录 */
export const getMoneyChangeRecordReq = (params: TMoneyChangeRecordParams) => {
  return request.post<TMoneyChangeRecordRes, TMoneyChangeRecordParams>(
    '/api/history/transferRecord/new/moneychange',
    {
      body: params,
    },
  );
};

/** 转账记录分页查询（React Query 无限滚动） */
export const useTransferRecordQuery = (params: Omit<TMoneyChangeRecordParams, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: ['transaction', 'record', 'transfer', params],
    enabled: true,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getMoneyChangeRecordReq({
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
