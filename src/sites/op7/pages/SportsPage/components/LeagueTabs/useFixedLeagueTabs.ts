/**
 * 固定联赛快捷筛选的共用逻辑（H5 / PC 两套外壳共用）
 *
 * 联赛清单是写死的白名单，不是「热门联赛」接口的结果：
 * 热门联赛接口带 hot=true 过滤，返回的是运营配置的热门项，内容随时会变，
 * 拿它当固定 tab 会出现设计稿之外的联赛（如「欧足联欧洲会议联赛」）。
 * 这里改成：白名单决定显示哪些、按什么顺序；getOnSaleLeagues 只用来判断
 * 本次玩法/赛种下哪些白名单联赛真的有在售赛事（对应 App 的 ensureProbeFixedLeagues）。
 *
 * 与「赛事筛选」弹窗共用 filterByLeagueIds，是同一份筛选状态的快捷入口，
 * 因此选中态需要兼容弹窗里的多选结果（见 activeId）。
 */
import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

import { PlayType } from '@/apis/commonSports/constants';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { useGetLeaguesQuery } from '@/apis/fbSports/getLeagues';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { useAppSelector } from '@/core/store/hooks';

/**
 * 固定联赛白名单（id 取自 App FB 场馆的 fixedLeagues，都是足球联赛）。
 * 顺序即展示顺序，「全部」由外壳插在最前面。
 * TODO 设计稿里还有「世界杯」，FB 侧没有对应的固定联赛 id，待后端提供后补进来。
 */
const FIXED_LEAGUES: { id: number; name: string }[] = [
  { id: 11140, name: '欧冠' },
  { id: 11062, name: '英超' },
  { id: 10815, name: '西甲' },
  { id: 10807, name: '德甲' },
  { id: 11018, name: '意甲' },
  { id: 10983, name: '法甲' },
];

/** 「全部」项的哨兵 id，真实联赛 id 不会为 0 */
export const ALL_LEAGUE_ID = 0;

/** 支持快捷联赛筛选的玩法，与 App 保持一致 */
const SUPPORTED_PLAY_TYPES: PlayType[] = [PlayType.Living, PlayType.Today, PlayType.Early];

export interface FixedLeagueTab {
  id: number;
  name: string;
}

export interface UseFixedLeagueTabsResult {
  /** 是否渲染整条，联赛一条都没在售时为 false */
  visible: boolean;
  /** 含「全部」的完整 tab 列表 */
  items: FixedLeagueTab[];
  /** 当前高亮项；null 表示筛选状态无法用单个 tab 表达（弹窗多选） */
  activeId: string | number | null;
  /** 点击某个 tab */
  select: (leagueId: number) => void;
}

export const useFixedLeagueTabs = (options?: { enabled?: boolean }): UseFixedLeagueTabsResult => {
  const enabled = options?.enabled ?? true;
  const { sportId, playType, playTypeId, filterByLeagueIds } = useAppSelector(
    (state) => state.sport.mainList.settings,
  );
  const { changeFilterByLeagueIds } = useSportsMainListControl();

  /**
   * 仅足球展示（对齐 App `L4InlineFilterBarFB._isSoccerNow()`：严格 `sportId == '1'`）。
   * 热门是聚合 tab（App 侧 sportId `88888`，web 侧 -2），混着多个球种，
   * 用足球联赛白名单去筛会得到与所选赛种不符的结果，App 同样不展示。
   */
  const isSupported =
    enabled &&
    SUPPORTED_PLAY_TYPES.includes(playType) &&
    sportId === Number(FBSportIdValue.Football);

  // 与「赛事筛选」弹窗的联赛列表同一个 queryKey，弹窗开过就直接命中缓存
  const { data: leagueGroups } = useGetLeaguesQuery(
    { type: playTypeId ?? 0, sportId },
    isSupported,
  );

  /** 本次玩法/赛种下真的有在售赛事的白名单联赛，按白名单顺序 */
  const leagues = useMemo(() => {
    if (!leagueGroups?.length) return [];
    const availableIds = new Set<string | number>();
    leagueGroups.forEach((group) => {
      group.list.forEach((item) => {
        if (item.mt > 0) availableIds.add(item.id);
      });
    });
    return FIXED_LEAGUES.filter((item) => availableIds.has(item.id));
  }, [leagueGroups]);

  const items = useMemo<FixedLeagueTab[]>(
    () => (leagues.length === 0 ? [] : [{ id: ALL_LEAGUE_ID, name: '全部' }, ...leagues]),
    [leagues],
  );

  /**
   * 未筛选 → 高亮「全部」；单选且命中可见项 → 高亮该联赛；
   * 弹窗多选等无法用单个 tab 表达的情况 → 不高亮任何项。
   */
  const activeId = useMemo(() => {
    if (filterByLeagueIds.length === 0) return ALL_LEAGUE_ID;
    const only = filterByLeagueIds.length === 1 ? filterByLeagueIds[0] : undefined;
    if (only === undefined) return null;
    return leagues.some((item) => item.id === only) ? only : null;
  }, [filterByLeagueIds, leagues]);

  const select = useMemoizedFn((leagueId: number) => {
    // 第三个入参清空弹窗的搜索关键词，避免「赛事筛选」文案与实际筛选结果不一致
    changeFilterByLeagueIds(leagueId === ALL_LEAGUE_ID ? [] : [leagueId], sportId, '');
  });

  return {
    visible: isSupported && items.length > 0,
    items,
    activeId,
    select,
  };
};

export default useFixedLeagueTabs;
