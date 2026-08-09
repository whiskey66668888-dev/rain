/**
 * 关注（v2）数据映射层。
 *
 * 后端只存/取 matchData 字符串（App 端 SportItemInfo 的 JSON），三端共享。
 * web 侧关注列表用的是「索引 + 实时列表渲染」模型（TFollowMatch = {matchId, sportId(viewId), bt, source, matchData}），
 * 因此这里负责两个方向的转换：
 *  - 收藏时：web MatchBaseInfo / 投注项  →  matchData 字符串（存 SportItemInfo，附带 viewId 供 web 还原分组）
 *  - 读取时：后端 FollowItem            →  web TFollowMatch 索引（source 后端 2→'bet' / 1→'normal'，matchData 原样保留）
 *
 * 参考 App：emc/lib/pages/home_sport/home_components/favorite/favorite_repository.dart
 */
import type { MatchBaseInfo } from '@/apis/commonSports/types';
import type { TBetItem } from '@/apis/commonSports/types';
import { SportItemInfo } from '@/apis/commonSports/sportItemInfo';
import { getFBSportNameAndViewId } from '@/apis/fbSports/common/fbFormat';
import type { TFollowMatch } from '@/core/store/slices/sportSlice';

import {
  EFollowSource,
  type FollowAddParams,
  type FollowItem,
  type FollowSyncItem,
} from '@/apis/origin/follow';

/** 兼容 10 位秒 / 13 位毫秒时间戳，统一转毫秒（0 表示无有效时间） */
const toMillis = (bt?: number): number => {
  if (!bt || bt <= 0) return 0;
  return String(bt).length <= 10 ? bt * 1000 : bt;
};

/** 把开赛时间戳格式化成后端要求的 `yyyy-MM-dd HH:mm:ss`（无有效时间返回 undefined） */
const formatMatchTime = (bt?: number): string | undefined => {
  const ms = toMillis(bt);
  if (ms === 0) return undefined;
  const d = new Date(ms);
  const p = (v: number) => String(v).padStart(2, '0');
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
};

/** 收藏一场赛事时，把 web MatchBaseInfo 序列化成后端 matchData（App 约定的 SportItemInfo 结构） */
export const buildMatchData = (match: MatchBaseInfo): string =>
  JSON.stringify(SportItemInfo.fromMatch(match));

/** 手动收藏（source=1）：由 MatchBaseInfo 构造 add 接口入参 */
export const matchToAddParams = (gameType: string, match: MatchBaseInfo): FollowAddParams => {
  const params: FollowAddParams = {
    gameType,
    matchId: String(match.matchId),
    matchData: buildMatchData(match),
    source: EFollowSource.Manual,
  };
  const matchTime = formatMatchTime(match.bt);
  if (matchTime) params.matchTime = matchTime;
  return params;
};

/**
 * 由投注项构造收藏快照 matchData（SportItemInfo JSON）。
 *
 * 投注项没有完整赛事结构，这里只回填能拿到的字段，够列表分组与完场占位即可。
 * viewId 用 sportId 兜底，保持与 web 现有 betItemToFollowSnapshot 的分组口径一致。
 */
export const betItemToMatchData = (detail: TBetItem): string => {
  const snapshot = new SportItemInfo();
  snapshot.matchId = String(detail.matchId);
  snapshot.sportId = String(detail.sportId);
  snapshot.viewId = Number(detail.sportId);
  snapshot.leagueId = String(detail.leagueId);
  snapshot.leagueName = detail.leagueName;
  snapshot.homeTeamName = detail.homeName;
  snapshot.awayTeamName = detail.awayName;
  snapshot.bt = detail.matchStartTime;
  return JSON.stringify(snapshot);
};

/** 投注自动关注（source=2）：由投注项构造 add 接口入参 */
export const betItemToAddParams = (gameType: string, detail: TBetItem): FollowAddParams => {
  const params: FollowAddParams = {
    gameType,
    matchId: String(detail.matchId),
    matchData: betItemToMatchData(detail),
    source: EFollowSource.Betting,
  };
  const matchTime = formatMatchTime(detail.matchStartTime);
  if (matchTime) params.matchTime = matchTime;
  // 冠军赛事 + source=2 后端会静默跳过；只有冠军才传，避免干扰后端判断
  if (detail.isChampion) params.champion = true;
  return params;
};

/** 从 matchData 快照里解析开赛时间戳（解析失败返回 undefined） */
const parseSnapshotBt = (matchData?: string): number | undefined => {
  if (!matchData) return undefined;
  try {
    return (JSON.parse(matchData) as { bt?: number }).bt;
  } catch {
    return undefined;
  }
};

/**
 * 游客本地收藏 → sync 数组项。
 *
 * 仅处理 source==='tourist'（游客态收藏，含手动/投注）的项：由其 matchData 快照上报，
 * 并从 bt（回退解析快照）生成 matchTime，让服务器能对同步上来的收藏做「开赛 + 24h」过期
 * （对齐 App 的 _buildSyncItems）。上报统一按后端 source=1（手动）——游客态不再区分投注来源。
 */
export const guestFollowMatchToSyncItem = (m: TFollowMatch): FollowSyncItem => {
  const item: FollowSyncItem = {
    matchId: String(m.matchId),
    matchData: m.matchData ?? '',
    source: EFollowSource.Manual,
  };
  const matchTime = formatMatchTime(m.bt || parseSnapshotBt(m.matchData));
  if (matchTime) item.matchTime = matchTime;
  return item;
};

/** 关注赛事快照：过期判定、查赛果、完场占位渲染统一取用的最小字段集 */
export interface FollowSnapshot {
  /** 开赛时间戳（兼容秒/毫秒，调用方按需归一化） */
  bt: number;
  leagueId: number;
  leagueName: string;
  homeName: string;
  awayName: string;
}

/**
 * 取关注赛事快照：解析 matchData（SportItemInfo，手动/投注、游客/登录回填均必带）。
 * 解析失败（脏数据）时返回 null，调用方据此剔除。手动收藏与投注自动关注共用同一套
 * 「掉出 live → 查赛果 → 完场占位 → 开赛+24h 清理」管线。
 */
export const getFollowSnapshot = (item: TFollowMatch): FollowSnapshot | null => {
  if (!item.matchData) return null;
  try {
    const s = JSON.parse(item.matchData) as Partial<SportItemInfo>;
    return {
      bt: Number(s.bt ?? 0),
      leagueId: Number(s.leagueId ?? 0),
      leagueName: s.leagueName ?? '',
      homeName: s.homeTeamName ?? '',
      awayName: s.awayTeamName ?? '',
    };
  } catch {
    return null;
  }
};

/**
 * 后端关注项 → web TFollowMatch 索引。
 *
 * - sportId 取快照里的 viewId（web 分组口径），回退到 sportId。
 * - bt 取快照 bt（供 bt+24h 过期与查赛果时间窗）。
 * - source 按后端 source 映射：2（投注自动）→ 'bet'，其余 → 'normal'（登录态手动）。
 * - matchData 原样保留：登录态收藏同样能按 bt+24h 过期、掉出 live 后查赛果/完场占位。
 * - matchData 解析失败或无 matchId 时返回 null，调用方跳过，避免脏数据污染列表。
 */
export const serverItemToFollowMatch = (item: FollowItem): TFollowMatch | null => {
  try {
    const snap = JSON.parse(item.matchData) as Partial<SportItemInfo>;
    const matchId = Number(snap.matchId ?? item.matchId);
    if (!matchId) return null;

    // 分组用 viewId：web 存的快照带 viewId 直接用；App 存的快照没有 viewId，
    // 由其 sportId(=FB sid) 反查 viewId，保证跨端加载后归到正确赛种 tab。
    const rawSportId = Number(snap.sportId ?? 0);
    const sportId = Number(snap.viewId) || getFBSportNameAndViewId(rawSportId).viewId || rawSportId;
    return {
      matchId,
      sportId,
      bt: Number(snap.bt ?? 0),
      source: item.source === EFollowSource.Betting ? 'bet' : 'normal',
      matchData: item.matchData,
    };
  } catch {
    return null;
  }
};

/** 批量：后端列表 → web TFollowMatch[]（跳过解析失败项） */
export const serverListToFollowMatches = (list: FollowItem[]): TFollowMatch[] =>
  list.reduce<TFollowMatch[]>((acc, item) => {
    const fm = serverItemToFollowMatch(item);
    if (fm) acc.push(fm);
    return acc;
  }, []);
