import { TradeMainStatus } from '@/apis/commonSports/constants';
import request from '@/core/sdk/request';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface TBonusRecordParams {
  pageSize: number;
  pageNumber: number;
  beginTime: string;
  endTime: string;
  tradeMainStatus: TradeMainStatus;
}

export interface TBonusRecordItem {
  addTime: string;
  confirmTime?: string;
  platformType?: string;
  multiple?: number;
  statusId: number;
  orderId: string;
  bonusName: string;
  remark: string | null;
  tradeMainStatus: TradeMainStatus;
  tradeMainStatusName: string;
  cash: number;
  status: string;
}

export interface TStatusFilterOption {
  value: TradeMainStatus;
  label: string;
}

export interface TStatusFilter {
  filterTitle: string;
  transactionTypeName: string;
  defaultValue: string;
  selectedValue: string;
  selectedLabel: string;
  options: TStatusFilterOption[];
}

export interface TBonusRecordRes {
  totalAmount: number;
  statusFilter: TStatusFilter;
  totalSize: number;
  totalPage: number;
  list: TBonusRecordItem[];
}

/** 红利记录 */
export const getBonusRecordReq = (params: TBonusRecordParams) => {
  return request.post<TBonusRecordRes, TBonusRecordParams>(
    '/api/history/transferRecord/new/bonus',
    {
      body: params,
    },
  );
};

type TCustomerServiceBonusRecordParams = Pick<
  TBonusRecordParams,
  'pageSize' | 'pageNumber' | 'beginTime' | 'endTime'
>;

/** 我的设备弹框红利记录：与 EMC Flutter 的 recordNew 数据源保持一致。 */
export const getCustomerServiceBonusRecordReq = (params: TCustomerServiceBonusRecordParams) => {
  return request.post<
    Pick<TBonusRecordRes, 'list'> & Partial<Pick<TBonusRecordRes, 'totalPage' | 'totalSize'>>,
    TCustomerServiceBonusRecordParams
  >('/api/history/recordNew/bonus', {
    body: params,
  });
};

/** 红利记录分页查询（React Query 无限滚动） */
export const useBonusRecordQuery = (params: Omit<TBonusRecordParams, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: ['transaction', 'record', 'bonus', params],
    enabled: true,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getBonusRecordReq({
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
