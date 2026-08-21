import { useQueryHook } from '@/core/query/hooks';
import { safeGetLocalJSON, safeSetLocalJSON } from '@/utils/storage/webStorage';
import { MatchBaseInfo } from '../commonSports/types';
import { ResponseData } from '@/core/sdk/request/model';
import requestFB from '@/core/sdk/requestFB';
import { LeagueGroup, LeagueItem } from './common/types';
import { formatFBLeagueGroup, formatFBSportItem } from './common/fbFormat';
import { MatchRecord } from './getList';
import { useState, Dispatch, SetStateAction } from 'react';

export interface PSRecord {
  // 联赛阶段 , see enum: phase
  ph: number;
  // 赛事数量
  num: number;
  // 名称
  nm: string;
}

export interface LeagueRecord {
  // 联赛id
  id: number;
  // 联赛名称
  na: string;
  // 联赛等级，可用于联赛排序，值越小，联赛等级越高
  or: number;
  // 联赛图标地址
  lurl: string;
  // 运动种类id , see enum: sports
  sid: number;
  // 区域id
  rid: number;
  // 区域名称
  rnm: string;
  // 区域logo
  rlg: string;
  // 是否热门
  hot: boolean;
  // 联赛分组
  slid: number;
  // 分联赛阶段统计
  ps: PSRecord[];
  // 该联赛开售的赛事统计
  mt: number;
}

/**
 * 获取联赛请求参数
 */
export interface GetLeaguesParams {
  type: number; // 滚球、今日、早盘等 , see enum: match_play_type
  sportId: number; // 运动ID，见 sports 枚举
}

/**
 * 获取联赛列表请求
 */
export const getLeaguesReq = (params: GetLeaguesParams): Promise<ResponseData<LeagueRecord[]>> => {
  return requestFB.post<LeagueRecord[], { sportId: number; type: number }, LeagueRecord[]>(
    '/v1/match/getOnSaleLeagues',
    {
      body: {
        sportId: params.sportId,
        type: params.type,
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
 * 获取联赛列表 React Query Hook
 */
export const useGetLeaguesQuery = (
  params: GetLeaguesParams,
  enabled = true,
): ReturnType<typeof useQueryHook<LeagueGroup[], Error>> => {
  return useQueryHook<LeagueGroup[], Error>({
    queryKey: ['fb', 'leagues', 'getLeagues', JSON.stringify(params)],
    queryFn: () =>
      getLeaguesReq(params)
        .then((res) => formatFBLeagueGroup(res.data))
        .catch(() => {
          // 返回一个空对象，避免类型错误
          return [] as LeagueGroup[];
        }),
    enabled,
  });
};

/**
 * 获取联赛请求参数
 */
export interface GetMatchRecommenParams {
  recommend: string; // 推荐词
  sportId: number;
}

/**
 * 根据关键字获取赛事请求
 */
export const getFBMatchByRecommendReq = (
  params: GetMatchRecommenParams,
): Promise<ResponseData<MatchBaseInfo[]>> => {
  return requestFB.post<MatchRecord[], { recommend: string }, MatchBaseInfo[]>(
    '/v1/match/queryMatchByRecommend',
    {
      body: {
        recommend: params.recommend,
      },
      transformResponse: (data) => {
        return {
          ...data,
          data: data.data
            .filter((obj) => obj.sid === params.sportId)
            .map((item) => formatFBSportItem(item, 1)),
        };
      },
    },
  );
};

/**
 * 获取联赛请求参数
 */
export interface GetHotLeaguesParams {
  type: number; // 滚球、今日、早盘等 , see enum: match_play_type
  sportIds: number[];
}

// 获取FB热门联赛列表
export const getHotLeagueListReq = (
  params: GetHotLeaguesParams,
): Promise<ResponseData<LeagueItem[]>> => {
  return requestFB.post<LeagueRecord[], { sportIds: number[]; type: number }, LeagueItem[]>(
    '/v1/match/getOnSaleLeagues',
    {
      body: {
        sportIds: params.sportIds,
        type: params.type,
      },
      transformResponse: (data) => {
        const list = data.data || [];
        return {
          ...data,
          data: list
            .map((record) => {
              return {
                sportId: record.sid,
                id: record.id,
                name: record.na,
                icon: record.lurl,
                hot: record.hot,
                mt: record.mt,
                or: record.or,
                rid: record.rid,
                rnm: record.rnm,
              };
            })
            .filter((item) => item.hot),
        };
      },
    },
  );
};

/**
 * 获取热门联赛 React Query Hook
 */
export const useGetHotLeagueList = (
  params: GetHotLeaguesParams,
  enabled = true,
): ReturnType<typeof useQueryHook<LeagueItem[], Error>> => {
  return useQueryHook<LeagueItem[], Error>({
    queryKey: ['fb', 'leagues', 'getHotLeagueListReq', JSON.stringify(params)],
    queryFn: () =>
      getHotLeagueListReq(params)
        .then((res) => res.data)
        .catch(() => {
          // 返回一个空对象，避免类型错误
          return [];
        }),
    enabled,
  });
};

/**
 * 自定义 Hook：操作 localStorage 的数据
 * @returns {[any, Function]} - [当前值, 更新值的函数]
 */
export function useLocalHistoryList(): [string[], Dispatch<SetStateAction<string[]>>] {
  const key = 'search_history_list';
  // 初始化状态：优先从 localStorage 读取，没有则用初始值
  const [storedValue, setStoredValue] = useState<string[]>(() => {
    const result = safeGetLocalJSON<unknown>(key, []);
    return Array.isArray(result)
      ? result.filter((item): item is string => typeof item === 'string')
      : [];
  });

  // 定义更新 localStorage 的函数
  const setValue: Dispatch<SetStateAction<string[]>> = (value) => {
    setStoredValue(value);
    safeSetLocalJSON(key, value);
  };

  return [storedValue, setValue];
}
