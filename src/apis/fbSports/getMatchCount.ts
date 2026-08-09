import { useQueryHook } from '@/core/query';
import { ResponseData } from '@/core/sdk/request/model';
import requestFB from '@/core/sdk/requestFB';

/** 组合（盘口 + 阶段），见 market_type / period 枚举 */
export interface MatchCountMarket {
  marketType: number;
  period?: number;
}

/**
 * 获取赛事未来天数的赛事数量
 * @see PATH /v1/match/matchCount
 */
export interface MatchCountParams {
  /** 运动 ID，必填 */
  sportId: number;
  /** 天数，默认 7（不包含今天）；最小 1，最大 30 */
  days?: number;
  /** 组合（盘口+阶段）集合，个数 0～50 */
  markets?: MatchCountMarket[];
  timeZone?: string;
}

/** 单日统计：bt 开始时间，c 赛事数量 */
export interface MatchCountDayStat {
  bt: number;
  c: number;
}

export interface MatchCountData {
  /** 天数 d */
  d: number;
  /** 未来 d 天的赛事统计数据 */
  dl: MatchCountDayStat[];
  /** 超过 d 天后的赛事（结构同 dl 单项，以服务端为准） */
  o?: MatchCountDayStat | MatchCountDayStat[];
}

export const getMatchCountReq = (
  params: MatchCountParams,
): Promise<ResponseData<MatchCountData>> => {
  return requestFB.post<MatchCountData, MatchCountParams, MatchCountData>('/v1/match/matchCount', {
    body: { ...params, days: 7 },
  });
};

export const useGetMatchCountQuery = (params: MatchCountParams, enabled = true) => {
  return useQueryHook<MatchCountData, Error>({
    queryKey: ['fb', 'match', 'matchCount', params, enabled],
    queryFn: () => getMatchCountReq(params).then((res) => res.data),
    enabled,
  });
};
