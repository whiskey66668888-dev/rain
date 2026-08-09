import { useQueryHook } from '@/core/query';
import { ResponseData } from '@/core/sdk/request/model';
import requestFB from '@/core/sdk/requestFB';

import { MatchPlayType, SportTypes } from './common/constants';
import { formatFBMenuList } from './common/fbFormat';
import { MenuInfo } from '../commonSports/types';

export interface StatisticalParams {
  sportTypes?: SportTypes[]; //运动分类集合，默认为[1] , see enum: api_sport_type	false
  leagueId?: number; //联赛ID, 如果该参数不为null, 忽略参数allLeague, 只返回该联赛的统计, 只影响响应结果中的hls字段	false
  allLeague?: boolean; //是否返回所有联赛统计，为false则只返回顶级联赛统计，默认false, 只影响响应结果中的hls字段	false
  typeForLeagueStat?: number; //赛事分组类型，只影响响应结果中的hls字段 , see enum: match_play_type	false
}

/**
 * 赛事统计数据
 */
export interface MatchStatsResponse {
  /** 赛事个数（总计） */
  tc: number;

  /** 所有赛事对应的不同类型的场次集合 */
  sl: MatchTypeGroup[];

  /** 热门总数，包括竞彩赛事和热门联赛赛事 */
  ht: number;

  /** 热门联赛下的赛事个数统计 */
  hls: HotLeagueStats[];

  /** 盘口组合（盘口类型+阶段）下赛事个数统计 */
  mts: MarketTypeStats[];
}

/**
 * 某一种比赛类型（如滚球、今日、早盘等）的分组统计
 */
export interface MatchTypeGroup {
  /** 分类类型枚举值，例如滚球、今日、早盘等 */
  ty: MatchPlayType; // see enum: match_play_type

  /** 分类描述（中文或多语言） */
  des: string;

  /** 该类型下赛事总数 */
  tc: number;

  /** 每个类型下每个运动里的赛事统计信息 */
  ssl: SportStats[];
}

/**
 * 某运动在某个类型下的赛事统计
 */
export interface SportStats {
  /** 运动ID */
  sid: number; // see enum: sports

  /** 该运动在此类型下的赛事个数 */
  c: number;
}

/**
 * 热门联赛统计项
 */
export interface HotLeagueStats {
  /** 联赛ID */
  id: number;

  /** 该联赛下赛事总数 */
  mt: number;

  /** 联赛名称 */
  na: string;

  /** 运动种类ID */
  sid: number; // see enum: sports

  /** 联赛logo的URL地址 */
  lurl: string;

  /** 分联赛阶段统计 */
  ps: PhaseStats[];
}

/**
 * 联赛阶段统计
 */
export interface PhaseStats {
  /** 联赛阶段枚举值 */
  ph: number; // see enum: phase

  /** 该阶段赛事数量 */
  num: number;

  /** 阶段名称 */
  nm: string;
}

/**
 * 盘口组合（盘口类型+阶段）统计
 */
export interface MarketTypeStats {
  /** 盘口组合唯一ID（字符串形式） */
  id: string;

  /** 按赛事分组类型统计的集合 */
  tps: MatchTypePlayStats[];

  /** 运动种类ID */
  sid: number; // see enum: sports
}

/**
 * 某盘口类型下的赛事总数统计
 */
export interface MatchTypePlayStats {
  /** 赛事分组类型（滚球、今日、早盘等） */
  tp: MatchPlayType; // see enum: match_play_type

  /** 该类型下赛事总数 */
  mt: number;
}

//按运动、分类类型统计可投注的赛事个数
export const getStatisticalReq = (params: StatisticalParams): Promise<ResponseData<MenuInfo>> => {
  return requestFB.post<MatchStatsResponse, StatisticalParams, MenuInfo>('/v1/match/statistical', {
    // body: { sportTypes: [SportTypes.BALL, SportTypes.E_SPORT], ...params },
    // body: { ...{ typeForLeagueStat: 1 }, ...params },
    body: params,
    transformResponse: (data) => {
      return {
        ...data,
        data: formatFBMenuList(data.data),
      };
    },
  });
};

// 体育菜单和赛事分组类型数据查询
export const useGetStatisticalQuery = (params: StatisticalParams, enabled = true) => {
  return useQueryHook<MenuInfo, Error>({
    refetchInterval: 10000, // 10秒轮询
    queryKey: ['fb', 'match', 'statistical', params],
    queryFn: () => getStatisticalReq(params).then((res) => res.data),
    enabled,
  });
};
