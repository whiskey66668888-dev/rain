import { useInfiniteQuery } from '@tanstack/react-query';

import requestFB from '@/core/sdk/requestFB';
import { League } from '../common/types';

export interface MatchResultRecordItem {
  id: number; // 赛事ID
  bt: number; // 赛事开赛时间
  ms: number; // 赛事进行状态 , see enum: match_status
  fid: number; // integer	赛制的场次、局数、节数
  fmt: number; //	赛制 , see enum: match_format
  ne: number; // integer	中立场 1:中立场 0:非中立场 , see enum: neutral_status
  sid: number; //	integer	运动ID , see enum: sports
  lg: League; // 联赛数据
  ts: TsItem[]; // 比赛的球队
  nsg: NsgItem[]; // 比分或者赛果
}

export interface MatchResultLeagueItem {
  id: number;
  nm: string;
  lg?: string;
}

export interface MatchResultResponse {
  current: number;
  size: number;
  total: number;
  lgs?: MatchResultLeagueItem[];
  records: MatchResultRecordItem[];
}

export interface FbMatchResultListParams {
  /** 运动ID，与leagueIds必选其一 , see enum: sports */
  sportId?: number;
  /** 开始时间，13位时间戳，按赛事开赛时间范围查询 */
  beginTime?: number;
  /** 结束时间，13位时间戳，按赛事开赛时间范围查询 */
  endTime?: number;
  /** 联赛id列表，与sportId必选其一 */
  leagueIds?: number[];
  orderBy?: number;
  current?: number;
  size?: number;
}

export interface NsgItem {
  pe: number;
  tyg: number;
  sc: number[];
}

export interface TsItem {
  na: string;
  id: number;
  lurl: string;
}

export interface MatchItem {
  id: number;
  bt: number;
  ms: number;
  fid: number;
  fmt: number;
  ne: number;
  ts: TsItem[];
  nsg: NsgItem[];
}

export interface MatchResultItem {
  leagueId: number;
  leagueName: string;
  leagueIcon: string;
  sort: number;
  List: MatchItem[];
}

export interface MatchResultData {
  current: number;
  size: number;
  total: number;
  records: MatchResultItem[];
}

/* ====================== */
/* ===== request ========= */
/* ====================== */

export const getFbMatchResultListReq = async (
  params: FbMatchResultListParams,
): Promise<MatchResultResponse> => {
  const res = await requestFB.post<
    MatchResultResponse,
    FbMatchResultListParams,
    MatchResultResponse
  >('/v1/match/matchResultPage', {
    body: params,
  });

  return {
    current: res.data?.current ?? params.current,
    size: res.data?.size ?? params.size,
    total: res.data?.total ?? 0,
    lgs: res.data?.lgs ?? [],
    records: res.data?.records ?? [],
  };
};

/* ====================== */
/* ====== hooks ========== */
/* ====================== */

/**
 * 分页查询（无限滚动）
 * ✅ records + sts 都保留
 * ✅ 切 tab / 参数变化一定从第 1 页重新来
 */
export const useFbMatchResultListQuery = (
  params: FbMatchResultListParams,
  options?: {
    enabled?: boolean;
    /** 数据新鲜期，命中期内重新挂载/enable 不再重复请求（默认 0 = 每次都请求） */
    staleTime?: number;
    /** 挂载时的刷新策略，默认 'always'（赛果记录页需要每次进页拉最新）；关注 tab 传 true 配合 staleTime 去重 */
    refetchOnMount?: boolean | 'always';
  },
) => {
  return useInfiniteQuery<MatchResultResponse, Error>({
    queryKey: ['fb', 'matchResult', JSON.stringify(params)],
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,

    queryFn: async ({ pageParam = 1 }) => {
      return getFbMatchResultListReq({
        ...params,
        current: pageParam as number,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current, size, total } = lastPage;
      return current * size < total ? current + 1 : undefined;
    },
    refetchOnMount: options?.refetchOnMount ?? 'always',
  });
};
