import { useQueryHook } from '@/core/query/hooks';
import { ResponseData } from '@/core/sdk/request/model';
import request from '@/core/sdk/request';
import { querystringStringify } from '@/utils';

import { normalizeFbMarketDisplayName } from './common/fbFormat';
import type { MarketGroup, MarketItem, OddsOption } from './common/types';
import type { MatchRecord } from './getList';

/**
 * 推荐玩法接口返回单条（tips3）
 */
export interface SportRecommendItemRaw {
  marketId: string;
  selectionId: string;
  tip: string;
  number: number;
}

/**
 * 获取赛事推荐玩法请求参数（与 emc tips3 对齐）
 */
export interface GetSportRecommendParams {
  matchId: string | number;
  /** 上游：FB */
  upstream?: string;
  homeTeamCn: string;
  awayTeamCn: string;
  leagueCn: string;
}

/**
 * 获取赛事推荐玩法请求（GET，与 popularEventsLive 同风格直连完整 URL）
 */
export const getSportRecommendReq = (
  params: GetSportRecommendParams,
): Promise<ResponseData<SportRecommendItemRaw[]>> => {
  const query = querystringStringify({
    matchId: String(params.matchId),
    upstream: params.upstream ?? 'FB',
    homeTeamCn: params.homeTeamCn || '',
    awayTeamCn: params.awayTeamCn || '',
    leagueCn: params.leagueCn || '',
  });
  return request.get<SportRecommendItemRaw[], undefined, SportRecommendItemRaw[]>(
    `https://api.live336.com/api/tips3?${query}`,
    {
      isErrorToast: false,
      transformResponse: (res) => {
        const raw = res.data as unknown;
        const list: unknown = Array.isArray(raw) ? raw : (res.data as { data?: unknown })?.data;
        const arr: SportRecommendItemRaw[] = Array.isArray(list)
          ? (list as SportRecommendItemRaw[])
          : [];
        return { ...res, data: arr };
      },
    },
  );
};

/**
 * 从赛事盘口 mg 中根据 marketId + selectionId 查找对应的 marketGroup、market、option
 * 与 BettingMarket 中 OddBtn 点击时使用的数据一致，便于复用 handleToggleOdds
 */
export function findOptionByMarketAndSelection(
  mg: MarketGroup[] | undefined,
  marketId: string,
  selectionId: string,
): { marketGroup: MarketGroup; market: MarketItem; option: OddsOption } | null {
  if (!mg || !Array.isArray(mg)) return null;
  const mid = String(marketId);
  const sid = String(selectionId);
  for (const group of mg) {
    const mks = group.mks ?? [];
    for (const mk of mks) {
      if (String(mk.id) !== mid) continue;
      const opList = mk.op ?? [];
      for (const opt of opList) {
        if (String(opt.ty) !== sid) continue;
        return { marketGroup: group, market: mk, option: opt };
      }
    }
  }
  return null;
}

/**
 * 从赛事盘口 mg 中根据 marketId + selectionId 解析玩法名称与盘口文案
 */
function resolveRecommendDisplay(
  marketId: string,
  selectionId: string,
  mg: MarketGroup[] | undefined,
  homeName: string,
  awayName: string,
): { betTypeName: string; handicap: string; odds: string } | null {
  const formatTeamName = (name: string): string => {
    const normalized = String(name || '').trim();
    return normalized.length > 6 ? `${normalized.slice(0, 6)}...` : normalized;
  };
  if (!mg || !Array.isArray(mg)) return null;
  const mid = String(marketId);
  const sid = String(selectionId);
  for (const group of mg) {
    const mks = group.mks ?? [];
    for (const mk of mks) {
      if (String(mk.id) !== mid) continue;
      const opList = mk.op ?? [];
      for (const opt of opList) {
        if (String(opt.ty) !== sid) continue;
        const betTypeName = normalizeFbMarketDisplayName(group.nm ?? '', group.mty);
        const baseHandicap = opt.nm ?? opt.na ?? opt.li ?? '';
        const isHandicapPlay = betTypeName.includes('让球');
        const selectionType = Number(opt.ty);
        const teamNameRaw = selectionType === 1 ? homeName : selectionType === 2 ? awayName : '';
        const teamName = formatTeamName(teamNameRaw);
        const handicap =
          isHandicapPlay && teamName && !baseHandicap.includes(teamName)
            ? `${teamName}\u2003${baseHandicap}`
            : baseHandicap;
        const odds = opt.od != null && opt.od > 0 ? String(opt.od) : '';
        return { betTypeName, handicap, odds };
      }
    }
  }
  return null;
}

/**
 * 推荐项（统计/洞察 + 快速投注），用于详情页轮播
 */
export interface MatchRecommendItem {
  tip: string;
  betTypeName: string;
  handicap: string;
  odds: string;
  marketId?: string;
  selectionId?: string;
}

/**
 * 将 tips3 返回列表 + 赛事详情 mg 转成详情页用的推荐列表
 */
export function mapRecommendToDisplayItems(
  tips: SportRecommendItemRaw[],
  match: MatchRecord | undefined,
): MatchRecommendItem[] {
  if (!match || !tips.length) return [];
  const mg = match.mg;
  const homeName = match.ts?.[0]?.na ?? '';
  const awayName = match.ts?.[1]?.na ?? '';
  const result: MatchRecommendItem[] = [];
  for (const item of tips) {
    const resolved = resolveRecommendDisplay(
      item.marketId,
      item.selectionId,
      mg,
      homeName,
      awayName,
    );
    const odds = resolved?.odds ?? (item.number > 0 ? String(item.number) : '');
    result.push({
      tip: item.tip ?? '',
      betTypeName: resolved?.betTypeName ?? '',
      handicap: resolved?.handicap ?? '',
      odds,
      marketId: item.marketId,
      selectionId: item.selectionId,
    });
  }
  return result.filter((item) => !!item.betTypeName);
}

/**
 * 获取赛事推荐玩法的 React Query Hook
 */
export const useGetSportRecommendQuery = (params: GetSportRecommendParams | null) => {
  return useQueryHook<SportRecommendItemRaw[], Error>({
    queryKey: ['fb', 'sport', 'recommend', params?.matchId, params?.homeTeamCn, params?.awayTeamCn],
    queryFn: () =>
      params
        ? getSportRecommendReq(params)
            .then((res) => res.data)
            .catch(() => [])
        : Promise.resolve([]),
    enabled: !!(
      params &&
      Number(params.matchId) > 0 &&
      (params.homeTeamCn || params.awayTeamCn || params.leagueCn)
    ),
    staleTime: 60 * 1000,
    retry: false,
  });
};
