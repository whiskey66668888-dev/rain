import request from '@/core/sdk/request';
import { useInfiniteQuery } from '@tanstack/react-query';
import { TradeMainStatus } from '@/apis/commonSports/constants';

export interface TMemberTransferParams {
  pageSize: number;
  pageNumber: number;
  beginTime: string;
  endTime: string;
  tradeMainStatus?: TradeMainStatus;
}

export interface TMemberTransferItem {
  transferListTitle: string;
  addTime: string;
  orderId: string;
  num: number;
  canCancelWithdraw: boolean;
  actionType: string;
  /** IN = 转入，OUT = 转出 */
  transferPerspective: 'IN' | 'OUT';
  memberTransfer: boolean;
  statusId: number;
  fromName: string;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  cash: number;
  status: string;
  canCancel: boolean;
}

export interface TMemberTransferStatusFilterOption {
  value: TradeMainStatus | '';
  label: string;
}

export interface TMemberTransferStatusFilter {
  filterTitle: string;
  transactionTypeName: string;
  defaultValue: string;
  selectedValue: string;
  selectedLabel: string;
  options: TMemberTransferStatusFilterOption[];
}

export interface TMemberTransferRes {
  totalAmount: number;
  statusFilter: TMemberTransferStatusFilter;
  totalSize: number;
  totalPage: number;
  list: TMemberTransferItem[];
}

/** 会员互转记录 */
export const getMemberTransferReq = (params: TMemberTransferParams) => {
  return request.post<TMemberTransferRes, TMemberTransferParams>(
    '/api/history/transferRecord/new/memberTransferWithdraw',
    {
      body: params,
    },
  );
};

/** 会员互转记录分页查询（React Query 无限滚动） */
// export const useMemberTransferQuery = (params: Omit<TMemberTransferParams, 'pageNumber'>) => {
//   return useInfiniteQuery({
//     queryKey: ['transaction', 'record', 'memberTransfer', params],
//     enabled: true,
//     initialPageParam: 1,
//     queryFn: async ({ pageParam }) => {
//       const res = await getMemberTransferReq({
//         ...params,
//         pageNumber: pageParam,
//       });
//       return res.data;
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       const currentPage = allPages.length;
//       if (lastPage.totalPage && lastPage.totalPage > currentPage) {
//         return currentPage + 1; // 下一页页码
//       }
//       return undefined; // 没有下一页
//     },
//     staleTime: 0,
//     retry: false,
//     refetchOnMount: 'always',
//   });
// };

export const useMemberTransferQuery = (params: Omit<TMemberTransferParams, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: ['transaction', 'record', 'memberTransfer', params],
    enabled: true,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getMemberTransferReq({
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
