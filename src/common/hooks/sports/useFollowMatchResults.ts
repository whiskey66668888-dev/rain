/**
 * 关注列表「完场赛事」赛果查询
 *
 * 背景：live 列表接口（getList）对已结束赛事不再返回数据，但关注的赛事在「开赛 + 24h」内
 * 仍需保留并展示赛果。这里对 live 查不到的关注赛事（**手动收藏 + 投注自动关注一视同仁**，
 * 只要能解析出快照），按其开赛时间窗口调用赛果接口（matchResultPage），命中后转换成
 * MatchBaseInfo（完场态）合并回关注列表；赛果未命中时用快照渲染完场占位，避免卡片消失。
 */

import { useEffect, useMemo, useRef } from 'react';

import type { MatchBaseInfo } from '@/apis/commonSports/types';
import {
  type MatchResultRecordItem,
  useFbMatchResultListQuery,
} from '@/apis/fbSports/betRecord/getFBResultList';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
import { FullPes } from '@/apis/fbSports/common/constants/period';
import { getFollowSnapshot, type FollowSnapshot } from '@/common/hooks/follow';
import type { TFollowMatch } from '@/core/store/slices/sportSlice';
import { toMillis } from '@/utils/dateHelper';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** viewId → FB 三方 sportId（赛果接口入参需要 FB sportId） */
const viewIdToFbSportId = (viewId: number): number => {
  const found = Object.values(FBCompetitionMap).find((c) => Number(c.viewId) === viewId);
  return found?.id ?? viewId;
};

/**
 * 取完场最终比分：优先该球种全场阶段（约定为 sportId*1000+1，足球 1001/篮球 3001…），
 * 该值对多数球种已包含在 FullPes 中，这里前置仅为提升命中优先级；
 * 再兜底通用 FullPes，最后取首个有效比分。冷门球种全场枚举不符时由后两级兜底。
 */
const getFinalScore = (record: MatchResultRecordItem, fbSportId: number): [number, number] => {
  const candidates = [fbSportId * 1000 + 1, ...FullPes];
  for (const pe of candidates) {
    const item = record.nsg.find((n) => n.tyg === 5 && n.pe === pe);
    if (item && item.sc?.length >= 2) return [item.sc[0]!, item.sc[1]!];
  }
  const first = record.nsg.find((n) => n.sc?.length >= 2);
  return first ? [first.sc[0]!, first.sc[1]!] : [0, 0];
};

/**
 * 将关注赛事转换为 MatchBaseInfo（完场态）。
 * - 传入 record（赛果接口命中）：用真实赛果 + 快照兜底；
 * - 未传 record（完赛后赛果尚未返回）：仅用快照渲染完场占位，比分留空，
 *   避免赛事在「掉出 live → 赛果到达」之间从列表消失，待真实赛果到达后替换。
 * 仅填充关注列表渲染所需字段，其余给安全默认值。
 */
const convertResultToMatch = (
  viewId: number,
  fbSportId: number,
  matchId: number,
  snap: FollowSnapshot,
  record?: MatchResultRecordItem,
): MatchBaseInfo => {
  const hasResult = !!record;
  const [homeScore, awayScore] = record ? getFinalScore(record, fbSportId) : [0, 0];
  const home = record?.ts?.[0];
  const away = record?.ts?.[1];

  const partial: MatchBaseInfo = {
    viewId,
    sportId: fbSportId,
    sportName: '',
    leagueId: record?.lg?.id ?? snap.leagueId ?? 0,
    leagueName: record?.lg?.na ?? snap.leagueName ?? '',
    leagueLogo: record?.lg?.lurl ?? '',
    matchId: record?.id ?? matchId,
    pageIndex: 1,
    matchNum: record?.fid ?? 0,
    matchPeriod: '',
    isChampion: false,
    // 完场态：matchStatusId=3 / matchStatus 含「完场」→ BettingOdds 锁盘
    matchStatusId: 3,
    matchStatus: '完场',
    matchTime: 0,
    bt: record?.bt ?? snap.bt ?? 0,
    matchDate: '',
    isLive: false,
    periodName: '完场',
    isCountdown: false,
    clockType: 'DESC',
    homeName: home?.na ?? snap.homeName ?? '',
    homeLogo: home?.lurl ?? '',
    awayName: away?.na ?? snap.awayName ?? '',
    awayLogo: away?.lurl ?? '',
    // 占位（无赛果）时不展示比分：score 留空 + scorePending=true，避免 0-0 被误显示为真实比分
    score: hasResult ? `${homeScore}-${awayScore}` : '',
    scorePending: !hasResult,
    homeScore,
    awayScore,
    detailHomeScore: homeScore,
    detailAwayScore: awayScore,
    firstHalfScore: '',
    halfTimeScore: '',
    scoreAll: [],
    children: [],
    canPreBet: false,
  };

  return partial;
};

interface UseFollowMatchResultsParams {
  /** 完整关注列表 */
  followMatch: TFollowMatch[];
  /** 当前关注页选中的赛种 viewId */
  sportId: number;
  /** 是否处于关注列表玩法 */
  enabled: boolean;
  /**
   * 当前 live 列表返回的赛事 id。不参与赛果查询过滤（查询仍按 leagueIds/sportId），
   * 仅用于：① 感知赛事「掉出 live = 完赛」从而触发赛果刷新；② 判定需渲染完场（占位）的赛事。
   */
  liveMatchIds: number[];
}

export const useFollowMatchResults = ({
  followMatch,
  sportId,
  enabled,
  liveMatchIds,
}: UseFollowMatchResultsParams) => {
  const fbSportId = viewIdToFbSportId(sportId);

  // 当前赛种下、能解析出快照的关注赛事（手动收藏 + 投注自动关注一视同仁）：统一查赛果
  const followWithSnap = useMemo(() => {
    if (!enabled) return [] as Array<{ item: TFollowMatch; snap: FollowSnapshot }>;
    return followMatch
      .filter((m) => m.sportId === sportId)
      .map((m) => ({ item: m, snap: getFollowSnapshot(m) }))
      .filter((x): x is { item: TFollowMatch; snap: FollowSnapshot } => x.snap !== null);
  }, [enabled, followMatch, sportId]);

  // 已掉出 live 的关注赛事（= 已完赛/下架）：需要展示赛果（命中）或完场占位（未命中）
  const endedFollowMatches = useMemo(() => {
    const liveSet = new Set(liveMatchIds);
    return followWithSnap.filter((x) => !liveSet.has(x.item.matchId));
  }, [followWithSnap, liveMatchIds]);

  // 按这些赛事的开赛时间推算赛果查询时间窗口
  const { beginTime, endTime } = useMemo(() => {
    const btList = followWithSnap.map((x) => toMillis(x.snap.bt)).filter((t) => t > 0);
    if (!btList.length) {
      const now = Date.now();
      return { beginTime: now - 3 * ONE_DAY_MS, endTime: now + ONE_DAY_MS };
    }
    const min = Math.min(...btList);
    const max = Math.max(...btList);
    // 向前/后各留出一天余量，覆盖跨天赛事
    return { beginTime: min - ONE_DAY_MS, endTime: max + ONE_DAY_MS };
  }, [followWithSnap]);

  // 赛果接口 sportId / leagueIds 二选一，优先用 leagueIds 精确缩小查询范围
  const leagueIds = useMemo(
    () => Array.from(new Set(followWithSnap.map((x) => x.snap.leagueId).filter((id) => !!id))),
    [followWithSnap],
  );

  const resultQuery = useFbMatchResultListQuery(
    {
      sportId: fbSportId,
      leagueIds: leagueIds.length ? leagueIds : undefined,
      beginTime,
      endTime,
      size: 300,
    },
    {
      enabled: enabled && followWithSnap.length > 0,
      // 赛果是终值不常变：60s 内反复进/出关注 tab 不重复请求；超 60s 才随挂载刷新。
      staleTime: 60_000,
      refetchOnMount: true,
    },
  );

  // 1A：赛事掉出 live（完赛）时刷新赛果。queryKey（sportId/leagueIds/时间窗）在完赛瞬间不变、
  // 又无轮询，故需主动 refetch。key 用「已完赛集合」的稳定串：仅在集合变化（有赛事新完赛）时触发，
  // 不会随 live 每 4s 轮询空跑。
  const { refetch: refetchResult } = resultQuery;
  const endedKey = useMemo(
    () =>
      endedFollowMatches
        .map((x) => x.item.matchId)
        .sort((a, b) => a - b)
        .join(','),
    [endedFollowMatches],
  );
  // 仅在「已完赛集合」真正变化（有赛事新完赛）时强制刷新一次；进/出关注 tab（enabled 翻转）
  // 但集合未变时不重复请求——避免每次切到关注 tab 都空跑一次赛果查询。
  const prevEndedKeyRef = useRef('');
  useEffect(() => {
    if (!enabled || !endedKey) return;
    if (prevEndedKeyRef.current === endedKey) return;
    prevEndedKeyRef.current = endedKey;
    refetchResult();
  }, [enabled, endedKey, refetchResult]);

  const endedMatches = useMemo<MatchBaseInfo[]>(() => {
    if (!endedFollowMatches.length) return [];
    const records: MatchResultRecordItem[] = [];
    resultQuery.data?.pages?.forEach((page) => {
      if (Array.isArray(page?.records)) records.push(...page.records);
    });
    const recordMap = new Map(records.map((r) => [r.id, r]));

    // 2：命中赛果→真实完场态；未命中（赛果尚未返回）→ 用快照渲染完场占位，避免卡片消失
    return endedFollowMatches.map((x) =>
      convertResultToMatch(
        sportId,
        fbSportId,
        x.item.matchId,
        x.snap,
        recordMap.get(x.item.matchId),
      ),
    );
  }, [endedFollowMatches, resultQuery.data, sportId, fbSportId]);

  return { endedMatches, isFetchingResults: resultQuery.isFetching };
};
