import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import request from '@/core/sdk/request';
import { querystringStringify } from '@/utils';

/**
 * 队名加粗方（初盘热门方）。
 * - 'home' 主队（左）加粗
 * - 'away' 客队（右）加粗
 *
 * 与 App(Flutter) 对齐：数据来自后端「初盘」计算结果，不随实时赔率变动。
 * 规则 1（胜平负胜赔低）/规则 2（让球、平手看水位）由后端计算；
 * 规则 3（后端给不了 → 默认左边主队）由前端兜底，见 resolveNameBold。
 */
export type WinnerSide = 'home' | 'away';

/** 直播/赛事服务域名（与 getSportVideo 使用同一 host） */
const LIVE_WINNER_URL = 'https://api.live336.com/api/match/live/check/winner';
// 测试环境：https://live-api-sit.test100.cc/api/match/live/check/winner

/** 单次请求最多携带的赛事 id 数量（与 App 的 maxBatch 保持一致） */
const MAX_BATCH = 100;

interface WinnerItem {
  matchId: string | number;
  winner?: string;
}

interface WinnerResponse {
  matchIdWinTeamId?: WinnerItem[];
}

/** 归一化后端返回的 winner 字段，未知/空值视为「未返回」返回 undefined */
const normalizeWinner = (v?: string): WinnerSide | undefined => {
  const s = (v ?? '').trim().toLowerCase();
  if (s === 'home' || s === 'h' || s === '1') return 'home';
  if (s === 'away' || s === 'a' || s === '2' || s === 'guest') return 'away';
  return undefined;
};

/**
 * 应用规则 3 兜底：后端未给出 winner 时，默认左边（主队）加粗。
 */
export const resolveNameBold = (winner: WinnerSide | undefined): WinnerSide => winner ?? 'home';

/** 请求单批 winner，返回 { matchId: 'home' | 'away' } */
const fetchWinnerBatch = async (
  gameType: string,
  matchIds: Array<string | number>,
): Promise<Record<string, WinnerSide>> => {
  const query = querystringStringify({
    matchId: matchIds.join(','),
    gameType,
  });
  try {
    // 响应为标准信封 { code:'0000', data:{ matchIdWinTeamId }, info }，
    // request 命中成功码后原样返回，故 res.data 即内层 { matchIdWinTeamId }。
    const res = await request.get<WinnerResponse, undefined, WinnerResponse>(
      `${LIVE_WINNER_URL}?${query}`,
      { isErrorToast: false },
    );
    const list = res?.data?.matchIdWinTeamId ?? [];
    const map: Record<string, WinnerSide> = {};
    for (const it of list) {
      const id = String(it?.matchId ?? '');
      if (!id) continue;
      const w = normalizeWinner(it?.winner);
      if (w) map[id] = w;
    }
    return map;
  } catch {
    // 网络/解析失败：整批当作「未返回」，交由 resolveNameBold 走规则 3 兜底
    return {};
  }
};

/**
 * 批量获取赛事初盘热门方（自动按 MAX_BATCH 分批）。
 * @param gameType 'FB' | 'OB' | 'BTI'
 * @param matchIds 赛事 id 列表
 */
export const getMatchWinnerReq = async (
  gameType: string,
  matchIds: Array<string | number>,
): Promise<Record<string, WinnerSide>> => {
  const ids = matchIds.map(String).filter(Boolean);
  if (ids.length === 0) return {};

  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += MAX_BATCH) {
    batches.push(ids.slice(i, i + MAX_BATCH));
  }

  const results = await Promise.all(batches.map((batch) => fetchWinnerBatch(gameType, batch)));
  return results.reduce<Record<string, WinnerSide>>((acc, cur) => Object.assign(acc, cur), {});
};

/**
 * 队名加粗 winner 查询 hook。
 * 「初盘、不做定时更新」→ staleTime 10 分钟，不随窗口聚焦/挂载刷新。
 */
export const useMatchWinnersQuery = (
  matchIds: Array<string | number>,
  gameType = 'FB',
): Record<string, WinnerSide> => {
  // 去重 + 排序，保证 queryKey 稳定，避免顺序变化触发重复请求
  const ids = useMemo(
    () => Array.from(new Set(matchIds.map(String).filter(Boolean))).sort(),
    [matchIds],
  );

  const { data } = useQuery<Record<string, WinnerSide>>({
    queryKey: ['fb', 'match', 'winner', gameType, ids],
    queryFn: () => getMatchWinnerReq(gameType, ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000, // 初盘，不做定时更新
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  return data ?? {};
};
