import { useQueryHook } from '@/core/query/hooks';
import { ResponseData } from '@/core/sdk/request/model';
import requestFB from '@/core/sdk/requestFB';
import { MatchBaseInfo } from '../commonSports/types';
import { formatFBChampionItem } from './common/fbFormat';
import { MatchRecord } from './getList';

/**
 * 获取赛事详情请求参数
 */
export interface GetMatchDetailParams {
  matchId: number;
}

/**
 * 获取赛事详情响应数据
 */
export interface GetMatchDetailResponseData {
  records: MatchRecord[];
}

/**
 * 获取赛事详情请求
 */
export const getMatchDetailReq = (
  params: GetMatchDetailParams,
): Promise<ResponseData<MatchRecord>> => {
  return requestFB.post<MatchRecord, { matchId: number; oddsType: number }, MatchRecord>(
    '/v1/match/getMatchDetail',
    {
      body: {
        matchId: params.matchId,
        oddsType: 1,
      },
      transformResponse: (data) => {
        return {
          ...data,
          data: data.data,
        };
      },
    },
  );
};

/**
 * 获取赛事详情的 React Query Hook
 */
export const useGetMatchDetailQuery = (
  params: GetMatchDetailParams,
): ReturnType<typeof useQueryHook<MatchRecord, Error>> => {
  return useQueryHook<MatchRecord, Error>({
    queryKey: ['fb', 'match', 'getDetail', params.matchId],
    queryFn: async () => {
      if (params.matchId <= 0) {
        return {} as MatchRecord;
      }
      return getMatchDetailReq(params)
        .then((res) => res.data)
        .catch(() => {
          // 返回一个空对象，避免类型错误
          return {} as MatchRecord;
        });
    },
    enabled: params.matchId > 0,
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
    // matchData 无效（无 id）时不轮询，避免无效请求
    refetchInterval: (query) => (query.state.data?.id ? 5000 : false),
  });
};

/**
 * 获取冠军详情的 React Query Hook
 */
export const useGetMatchChampionDetailQuery = (
  params: GetMatchDetailParams,
): ReturnType<typeof useQueryHook<MatchBaseInfo, Error>> => {
  return useQueryHook<MatchBaseInfo, Error>({
    queryKey: ['fb', 'match', 'ChampionDetail', params.matchId],
    queryFn: () =>
      getMatchDetailReq(params)
        .then((res) => formatFBChampionItem(res.data))
        .catch(() => {
          // 返回一个空对象，避免类型错误
          return {} as MatchBaseInfo;
        }),
    enabled: params.matchId > 0,
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
    refetchInterval: 5000, // 每5秒刷新一次
  });
};
