// /api/game/total/list
import { useQueryHook } from '@/core/query';
import request from '@/core/sdk/request';
import { isSSR } from '@/utils/env';

interface TTotalListParams {
  type: 'all';
  begin: string;
  end: string;
}

export interface TTotalListRes {
  total: {
    bet: string;
    valid: string;
    bonus: string;
    num: number;
    net: string;
    validUnMoney: string;
  };
  list: {
    gameId: number;
    img: string;
    gameBigType: string;
    bonus: string;
    num: number;
    sort: number;
    validUnMoney: number;
    switch: string;
    bet: string;
    valid: string;
    gameName: string;
    gamePlatform: string;
    net: string;
  }[];
}

export const getTotalListReq = (params: TTotalListParams) => {
  return request.post<TTotalListRes, TTotalListParams>('/api/game/total/settleList', {
    body: params,
  });
};

const defaultTotalListRes: TTotalListRes = {
  total: {
    bet: '0',
    valid: '0',
    bonus: '0',
    num: 0,
    net: '0',
    validUnMoney: '0',
  },
  list: [],
};

export const useGetTotalList = (params: TTotalListParams, config: { enabled?: boolean }) => {
  return useQueryHook({
    queryKey: ['origin', 'allBettingRecord', 'totalList', params],
    enabled: config?.enabled,
    queryFn: async (): Promise<TTotalListRes> => {
      if (isSSR()) {
        return defaultTotalListRes;
      }
      const res = await getTotalListReq(params);
      return res.data ?? defaultTotalListRes;
    },
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
};
