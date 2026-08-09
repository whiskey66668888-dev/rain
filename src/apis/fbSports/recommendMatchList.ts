import { useQueryHook } from '@/core/query/hooks';
import { ResponseData } from '@/core/sdk/request/model';
import requestFB from '@/core/sdk/requestFB';

/**
 *  根据玩家偏好，推荐赛事
 **/

export interface MatchListParams {
  size: number; //推荐的赛事数量	true	不能为null
  random: boolean; //是否随机	true	不能为null
  sortType?: number; //排序类型，默认按推荐 , see enum: recommend_match_sort_type	false	{com.yuanjing.newsports.common.validator.CodeOfEnum.message}
  oddsType?: number; //赔率类型 , see enum: odds_format_type_enum	false
  isPC?: boolean; //是否为PC页面请求，App接入不传该参数，PC页面传true	false
}

export interface RecommendMatchListResponseData {
  nsg: Array<{
    pe: number; // 赛事阶段 , see enum: period
    tyg: number; // 比分类型，如 比分、角球、红黄牌等类型 , see enum: result_type_group
    sc: number[]; // 比分，数组形式，数组的0号元素为主队分/1号球队分，1号元素是客队分/2号元素是3号球队分，以此类推
  }>;
  tms: number; // 单个赛事玩法总数
  tps: string[]; // 盘口组标签集合 , see enum: market_tag
  lg: {
    na: string; // 联赛名称
    id: number; // 联赛ID
    or: number; // 联赛等级，可用于联赛排序，值越小，联赛等级越高
    lurl: string; // 联赛图标地址
    sid: number; // 运动种类id , see enum: sports
    rid: number; // 区域id
    rnm: string; // 区域名称
    rlg: string; // 区域logo
    hot: boolean; // 是否热门
    slid: number; // 联赛分组
  };
  ts: Array<{
    na: string; // 球队名称
    id: number; // 球队id
    lurl: string; // 球队图标地址
  }>;
  mc: {
    s: number; // 走表时间，以秒为单位，如250秒，客户端用秒去转换成时分秒时间
  };
  id: number; // 赛事 ID
  bt: number; // 赛事开赛时间
  ms: number; // 赛事进行状态，返回赛事进行状态code，具体请对照枚举 , see enum: match_status
  fid: number; // 赛制的场次、局数、节数
  fmt: number; // 赛制 , see enum: match_format
  ss: number; // 销售状态，1 开售，2 暂停，其他状态都不展示 , see enum: match_sales_status_enum
  ne: number; // 中立场标记，0 非中立场 ，1 中立场
  as: string[]; // 动画直接地址集合
  sid: number; // 运动ID , see enum: sports
  ssi: number; // 主/客发球，1主队发球，2客队发球 , see enum: serving_side
  mp: string; // 赛事辅助标记，如附加赛、季前赛等，具体请看枚举 , see enum: phase
  smt: number; // 滚球赛事当前阶段标识：常规时间，加时赛，点球大战等 , see enum: sub_match_type
  ty: number; // 赛事类型 1 冠军投注赛事，2 正常赛事 , see enum: match_type
  ye: string; // 冠军赛事联赛赛季，返回赛季字符串，如：2019年
  nm: string; // 冠军赛赛事名称，用于展示名称
  sb: {
    ihs: number; // 冰球，主队当前被罚下场的人数
    ias: number; // 冰球，客队当前被罚下场的人数
    rp: string; // 橄榄球，进攻方
    rd: number; // 橄榄球，第几次进攻
    ry: number; // 橄榄球，本次进攻剩余的码数
    sv: string; // 斯诺克，谁在打球
    srr: number; // 斯诺克，剩余红球的数量
    bs: number; // 棒球，好球数量
    bb: number; // 棒球，坏球数量
    bo: number; // 棒球，出局人数
    bbs: string; // 棒球，上垒，数字表示三个垒的位置，0表示没有人，1表示有人
    hhs: number; // 手球，主队当前暂停的球员数量
    has: number; // 手球，客队当前暂停的球员数量
    co: number; // 板球，回合
    cd: number; // 板球，球
    pl: number; // 是否可以开售滚球盘口 , see enum: in_play_enum
  };
}

export const getRecommendMatchListReq = (
  params: MatchListParams,
): Promise<ResponseData<RecommendMatchListResponseData[]>> => {
  return requestFB.post('/v1/match/recommendMatchList', {
    body: params,
  });
};
/**
 * 获取 FB 推荐赛事列表的 React Query Hook
 * 只在客户端请求（需要登录token）
 * @param params 请求参数
 */
export const useRecommendMatchListQuery = (
  params: MatchListParams,
): ReturnType<typeof useQueryHook<RecommendMatchListResponseData[], Error>> => {
  return useQueryHook<RecommendMatchListResponseData[], Error>({
    queryKey: ['fb', 'match', 'recommendMatchList', params],
    queryFn: () =>
      getRecommendMatchListReq(params)
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    enabled: true, // 只在客户端执行查询，服务端跳过
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchInterval: 5000,
    refetchOnMount: 'always', // 对于一些实效性比较高的数据，即使服务端注入了数据，客户端接手后也立即重新请求
  });
};
