import { getOBTokenReq } from '@/apis/origin/system';
import { apiConfigManager } from '@/core/sdk/request/apiConfigManager';
import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import type { MatchMarket } from '../commonSports/types';
import { getOBScoreOdds } from './common/obFormat';
import type { HPSItem } from './common/types';

interface OBCategoryItem {
  id?: string | number;
  marketName?: string;
}

/** 列表专业版懒加载：按 mid 缓存，避免滑页重复打详情 */
const detailMarketsCache = new Map<string, MatchMarket[]>();
const detailMarketsInflight = new Map<string, Promise<MatchMarket[]>>();
/** 「所有投注」mcid，轮询时复用，避免每次打 category */
const detailMcidCache = new Map<string, string>();
const detailMcidInflight = new Map<string, Promise<string | null>>();

function cacheKey(matchId: string | number, sportId: number) {
  return `${matchId}_${sportId}`;
}

function getObCuid(): string {
  return getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '';
}

async function resolveAllBetMcid(matchId: string, sportId: number): Promise<string | null> {
  const key = cacheKey(matchId, sportId);
  const cached = detailMcidCache.get(key);
  if (cached) return cached;

  const inflight = detailMcidInflight.get(key);
  if (inflight) return inflight;

  const task = (async () => {
    const catQuery = new URLSearchParams({
      sportId: String(sportId),
      mid: matchId,
    });
    const catRes = await requestOB.get<OBCategoryItem[], object, OBCategoryItem[]>(
      `/yewu11/v1/w/category/getCategoryList?${catQuery.toString()}`,
      {
        isErrorToast: false,
        transformResponse: (data) => ({
          ...data,
          data: Array.isArray(data.data) ? data.data : [],
        }),
      },
    );

    const allType = (catRes.data ?? []).find((item) => item.marketName === '所有投注')?.id;
    if (allType == null || allType === '') return null;
    const mcid = String(allType);
    detailMcidCache.set(key, mcid);
    return mcid;
  })().finally(() => {
    detailMcidInflight.delete(key);
  });

  detailMcidInflight.set(key, task);
  return task;
}

/**
 * 拉 OB 详情盘口并格式化为列表 MatchMarket
 * 对齐 Flutter getObSportDetailListReq：
 * 1) getCategoryList 取「所有投注」mcid
 * 2) getMatchOddsInfoPB 拉全量 hps
 */
export async function fetchOBListDetailMarkets(params: {
  matchId: string | number;
  sportId: number;
  /** 轮询时跳过盘口缓存强制刷新（mcid 仍复用） */
  force?: boolean;
}): Promise<MatchMarket[]> {
  const { matchId, sportId, force = false } = params;
  const key = cacheKey(matchId, sportId);

  if (!force) {
    const cached = detailMarketsCache.get(key);
    if (cached) return cached;
  }

  // 非 force / force 均合并同 key 并发，避免轮询叠请求互相 finally 清掉 inflight
  const inflight = detailMarketsInflight.get(key);
  if (inflight) return inflight;

  const task = (async () => {
    await apiConfigManager.ensureConfig('ob', getOBTokenReq);
    const cuid = getObCuid();
    if (!cuid) return [];

    const mid = String(matchId);
    const mcid = await resolveAllBetMcid(mid, sportId);
    if (!mcid) return [];

    const oddsQuery = new URLSearchParams({
      mid,
      mcid,
      cuid,
    });
    const oddsRes = await requestOB.get<HPSItem[], object, HPSItem[]>(
      `/yewu11/v1/m/matchDetail/getMatchOddsInfoPB?${oddsQuery.toString()}`,
      {
        isErrorToast: false,
        transformResponse: (data) => ({
          ...data,
          data: Array.isArray(data.data) ? data.data : [],
        }),
      },
    );

    const hps = oddsRes.data ?? [];
    const markets = getOBScoreOdds({ sportId, list: hps, matchId: mid });
    // 空结果不写缓存，保留上次有效盘口（对齐 Flutter keep last）
    if (markets.length) {
      detailMarketsCache.set(key, markets);
    }
    return markets;
  })().finally(() => {
    detailMarketsInflight.delete(key);
  });

  detailMarketsInflight.set(key, task);
  return task;
}

/** 测试/切场馆时可清缓存 */
export function clearOBListDetailMarketsCache(matchId?: string | number) {
  if (matchId == null) {
    detailMarketsCache.clear();
    detailMcidCache.clear();
    detailMcidInflight.clear();
    detailMarketsInflight.clear();
    return;
  }
  const prefix = `${matchId}_`;
  for (const key of [...detailMarketsCache.keys()]) {
    if (key.startsWith(prefix)) detailMarketsCache.delete(key);
  }
  for (const key of [...detailMcidCache.keys()]) {
    if (key.startsWith(prefix)) detailMcidCache.delete(key);
  }
  for (const key of [...detailMcidInflight.keys()]) {
    if (key.startsWith(prefix)) detailMcidInflight.delete(key);
  }
  for (const key of [...detailMarketsInflight.keys()]) {
    if (key.startsWith(prefix)) detailMarketsInflight.delete(key);
  }
}
