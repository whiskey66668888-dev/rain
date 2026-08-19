import { InfiniteData, keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { useQueryHook } from '@/core/query/hooks';
import { ResponseData } from '@/core/sdk/request/model';
import requestFB from '@/core/sdk/requestFB';

import { popularEventsLiveReq } from '../origin/popularEventsLive';
import { League, MarketGroup, MatchClock, ScoreBoard, ScoreItem, Team } from './common/types';
import { MatchBaseInfo } from '../commonSports/types';
import { MatchPlayType, SportTypes } from './common/constants';
import { formatFBChampionItem, formatFBSportItem } from './common/fbFormat';
import { HotSportId, PlayTypeId } from '../commonSports/constants';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

/**
 *  根据不同条件查询赛事列表，返回赛事列表及热门玩法 1、通过 match ids 查询; 2、通过 type 查询; 3、通过 league id 查询.
 **/

// 联赛阶段对象
interface LeaguePhase {
  leagueId: number; // 联赛ID（必填）
  phase: number; // 联赛阶段（phase 枚举，必填）
}

// 组合盘口 + 阶段 对象
interface MarketFilter {
  marketType: number; // 盘口类型（market_type 枚举，必填）
  period?: number; // 阶段（period 枚举，可选）
}

export interface MatchListParams {
  /** 运动分类集合，默认 [1]，见 api_sport_type 枚举 */
  sportTypes?: SportTypes[];

  /** 盘口类型集合，个数必须在 0~4 之间，见 market_type 枚举 */
  marketTypes?: number[];

  /** 单个运动ID，见 sports 枚举 */
  sportId?: number;

  /** 运动ID集合，见 sports 枚举 */
  sportIds?: number[];

  /** 联赛ID，matchIds、leagueId、type 三者必传其一 */
  leagueId?: number;

  /** 赛事分组类型（1 滚球、3 今日等），见 match_play_type 枚举
   *  当不传 matchIds 或 leagueId 时，此字段必传
   */
  type?: number;

  /** 联赛ID集合，可批量查询多个联赛；OB tid 可能为超长字符串 */
  leagueIds?: Array<number | string>;

  /** 联赛阶段集合 */
  leaguePhases?: LeaguePhase[];

  /** 查询开始时间戳（13位毫秒），仅早盘或串关支持，与 endTime 组成闭区间 */
  beginTime?: number;

  /** 查询结束时间戳（13位毫秒） */
  endTime?: number;

  /** 赛事ID集合，批量查询指定赛事，matchIds、leagueId、type 三者必传其一 */
  matchIds?: string[];

  /** 当前页码，从 1 开始 */
  current?: number;

  /** 每页大小，默认 50，最大 50，必须 > 0 */
  size: number;

  /** 排序方式：0 按开赛时间，1 按联赛排序，见 get_match_list_order_by_enum */
  orderBy?: number;

  /** 是否为 PC 页面请求，App 不传，PC 传 true */
  isPC?: boolean;

  /** 赔率类型，见 odds_format_type_enum 枚举 */
  oddsType?: number;

  /** 组合盘口+阶段集合，个数必须在 0~50 之间 */
  markets?: MarketFilter[];

  /**
   * OB 列表必传：二级菜单 menuId（接口字段 euid）
   * FB 忽略；由消费方从 menus[playType].menuId 带入
   */
  euid?: string;
}

export interface MatchRecord {
  // 比分列表
  nsg?: ScoreItem[]; // 比分列表（可选）

  // 赔率列表
  mg?: MarketGroup[]; // 赔率列表（可选）

  tms?: number; // 单个赛事玩法总数（可选）
  tps?: string[]; // 盘口组标签集合（market_tag 枚举，可选）

  // 联赛信息
  lg: League;

  // 球队信息 [主队, 客队]
  ts: [Team, Team];

  // 比赛时钟（滚球）
  mc?: MatchClock; // 可选

  id: number; // 赛事ID
  bt: number; // 开赛时间（时间戳）
  ms: number; // 赛事进行状态（match_status 枚举）
  fid?: number; // 赛制场次/局数/节数（可选）
  fmt?: number; // 赛制（match_format 枚举，可选）
  ss: number; // 销售状态（match_sales_status_enum）
  ne: number; // 中立场标记（0 非中立，1 中立）
  as?: string[]; // 动画直播地址集合（可选）
  sid: number; // 运动ID（sports 枚举）
  ssi?: number; // 主/客发球（serving_side 枚举，可选）
  mp?: string; // 赛事辅助标记（如附加赛，phase 枚举，可选）
  smt?: number; // 滚球当前阶段（sub_match_type 枚举，可选）
  ty: number; // 赛事类型（1 冠军赛事，2 正常赛事，match_type 枚举）
  ye?: string; // 冠军赛事赛季（如 "2019年"，可选）
  nm?: string; // 冠军赛事名称（可选）
  vs?: {
    web: string;
    m3u8SD: string;
    m3u8HD: string;
    flvSD: string;
    have: boolean;
  };
  // 比分板（不同运动特有字段）
  sb?: ScoreBoard; // 可选

  pl?: number; // 是否可以开售滚球盘口（in_play_enum，可选）
}

export interface GetListResponseData {
  current: number; // 当前页码
  size: number; // 每页条数
  total: number; // 总条数
  pageTotal: number; // 总页数
  records: MatchRecord[]; // 赛事记录列表
}

export const getListReq = (params: MatchListParams): Promise<ResponseData<MatchBaseInfo[]>> => {
  const body: MatchListParams = {
    ...params,
    // FB 接口要 number[]；兼容上游 string id
    leagueIds: params.leagueIds?.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
  };
  return requestFB.post<GetListResponseData, MatchListParams, MatchBaseInfo[]>(
    '/v1/match/getList',
    {
      body,
      transformResponse: (data) => {
        return {
          ...data,
          data: data.data.records.map((item) =>
            params.type == MatchPlayType.OUTRIGHT
              ? formatFBChampionItem(item, params.current ?? 1)
              : formatFBSportItem(item, params.current ?? 1),
          ),
        };
      },
    },
  );
};

/**
 * 获取 FB 赛事列表的 React Query Hook
 */
export const useGetListQuery = (
  params: MatchListParams,
  config: { enabled: boolean; keepPreviousData?: boolean } = { enabled: true },
) => {
  // 三方接口有差异化的参数处理在各自的api里面，方便后续直接切换api

  const _params = { ...params };
  //从另外一个query查询热门联赛id
  const hotSportMatchIds =
    getGlobalStoreForApiRequest().getState().sport.mainList.datas.menuInfo.hotSportMatchIds;

  if (params.sportId === HotSportId) {
    // 热门时FB的接口没有提供直接查询，要从菜单里面获取热门联赛id去查。
    // 用户已经指定联赛时（固定联赛条 / 赛事筛选弹窗）以用户选择为准，
    // 否则筛选会被热门联赛 id 直接覆盖掉，点了没反应。
    const pickedLeagueIds = params.leagueIds ?? [];
    _params.leagueIds = pickedLeagueIds.length > 0 ? pickedLeagueIds : (hotSportMatchIds ?? []);
    _params.sportId = undefined;
  }
  if (!params.type) {
    // 默认初始化查询滚球赛事
    _params.type = MatchPlayType.LIVE;
  } else if (params.type === Number(PlayTypeId.Follow)) {
    // 关注赛事不传type
    _params.type = undefined;
  }
  const queryKey = ['fb', 'match', 'getList', JSON.stringify(_params)] as const;

  return useInfiniteQuery<
    MatchBaseInfo[],
    Error,
    InfiniteData<MatchBaseInfo[]>,
    readonly string[],
    number
  >({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params: MatchListParams = {
        ..._params,
        current: pageParam,
        isPC: true,
      };
      const result = await getListReq(params);
      return result.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // 如果最后一页数据少于每页大小，说明没有更多数据了
      if (lastPage.length < _params.size) {
        return undefined;
      }
      // 返回下一页页码
      return allPages.length + 1;
    },
    enabled: config.enabled,
    initialPageParam: 1,
    staleTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchInterval: 4000, // 4秒轮询
    ...(config.keepPreviousData ? { placeholderData: keepPreviousData } : {}),
  });
};

/**
 *  通过我们自己站点的live接口获取赛事id传入到三方赛事列表的matchIds参数中获取推荐赛事
 */
export const useGetListByPopularEventsLiveQuery = (params: MatchListParams) => {
  return useQueryHook<MatchBaseInfo[], Error>({
    queryKey: ['fb', 'match', 'getListByPopularEventsLive', params],
    queryFn: async () => {
      const res = await popularEventsLiveReq();
      const data = res.data;
      const list = await getListReq({
        matchIds: data.map((item) => item.mid),
        size: 20,
        current: 1,
      });
      const rows = list.data ?? [];
      /** popularEventsLive + getList 不保证开赛顺序；按 bt 升序与白名单列表展示一致（首页 / 落地页等） */
      return [...rows].sort((a, b) => (Number(a.bt) || 0) - (Number(b.bt) || 0));
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always', // 对于一些实效性比较高的数据，即使服务端注入了数据，客户端接手后也立即重新请求
  });
};
