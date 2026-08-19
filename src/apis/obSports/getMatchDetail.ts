import { useQueryHook } from '@/core/query/hooks';
import { getOBTokenReq } from '@/apis/origin/system';
import { apiConfigManager } from '@/core/sdk/request/apiConfigManager';
import { ResponseData } from '@/core/sdk/request/model';
import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import { MatchBaseInfo } from '../commonSports/types';
import { formatOBSportItem, formatOBChampionItem } from './common/obFormat';
import { resolveObEuid } from './getList';

import {
  formatObDetailList,
  getObAllTypeMcid,
  type OBCategoryItem,
  type OBDetailTypeItem,
} from './common/obDetailFormat';

import type { GetMatchDetailParams } from '../fbSports/getMatchDetail';
import type { HPSItem, MatchRecord } from './common/types';

export type { OBDetailMarketItem, OBDetailTypeItem } from './common/obDetailFormat';

function getObCuid(): string {
  return getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '';
}

function emptyMatchInfo(): MatchBaseInfo {
  return { matchId: '' } as MatchBaseInfo;
}

export interface GetOBMatchDetailParams {
  matchId: string;
  /** 分类接口需要 sportId（csid）；缺省时从详情结果取 */
  sportId?: string | number;
  enabled?: boolean;
}

export interface OBMatchDetailData {
  matchInfo: MatchBaseInfo;
  typeList: OBDetailTypeItem[];
  raw: MatchRecord;
}

/**
 * OB 赛事基础信息
 * 对齐 Flutter getOBDetailReq → /yewu11/v1/w/matchDetail/getMatchDetailPB
 */
export async function getOBMatchDetailReq(matchId: string): Promise<MatchRecord | null> {
  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  const mid = String(matchId);
  if (!mid || mid === '0') return null;

  const query = new URLSearchParams({ mid });
  const res = await requestOB.get<MatchRecord, object, MatchRecord>(
    `/yewu11/v1/w/matchDetail/getMatchDetailPB?${query.toString()}`,
    {
      isErrorToast: false,
      transformResponse: (data) => ({
        ...data,
        data: data.data ?? {},
      }),
    },
  );

  const raw = res.data;
  if (!raw || !raw.mid) return null;
  return raw;
}

/**
 * OB 详情盘口 Tab 列表
 * 对齐 Flutter getObSportDetailListReq：
 * 1) getCategoryList
 * 2) getMatchOddsInfoPB（mcid=所有投注）
 * 3) formatObDetailList
 */
export async function getObSportDetailListReq(params: {
  matchId: string | number;
  sportId: string | number;
  competition: Pick<MatchBaseInfo, 'matchId' | 'homeName' | 'awayName' | 'matchTime'>;
}): Promise<OBDetailTypeItem[]> {
  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  const mid = String(params.matchId);
  const sportId = String(params.sportId);
  if (!mid || !sportId) return [];

  const cuid = getObCuid();
  if (!cuid) return [];

  const catQuery = new URLSearchParams({ sportId, mid });
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

  const categoryList = catRes.data ?? [];
  const mcid = getObAllTypeMcid(categoryList);
  if (!mcid) return [];

  const oddsQuery = new URLSearchParams({ mid, mcid, cuid });
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

  const detailList = oddsRes.data ?? [];
  return formatObDetailList({
    categoryList,
    detailList,
    competition: params.competition,
    sportId,
    matchTime: params.competition.matchTime,
  });
}

/** 拉取完整 OB 详情（头部 + 盘口 Tab） */
export async function fetchOBMatchDetail(
  params: GetOBMatchDetailParams,
): Promise<OBMatchDetailData | null> {
  const raw = await getOBMatchDetailReq(params.matchId);
  if (!raw) return null;

  const matchInfo = formatOBSportItem(raw, 0);
  const sportId = params.sportId ?? raw.csid ?? matchInfo.sportId;
  const typeList = await getObSportDetailListReq({
    matchId: params.matchId,
    sportId,
    competition: {
      matchId: matchInfo.matchId,
      homeName: matchInfo.homeName,
      awayName: matchInfo.awayName,
      matchTime: matchInfo.matchTime,
    },
  });

  return { matchInfo, typeList, raw };
}

/**
 * OB 赛事详情 React Query Hook
 * 对齐 FB useGetMatchDetailQuery：5s 轮询
 */
export const useGetOBMatchDetailQuery = (
  params: GetOBMatchDetailParams,
): ReturnType<typeof useQueryHook<OBMatchDetailData | null, Error>> => {
  const matchId = String(params.matchId ?? '');
  const enabled = params.enabled !== false && !!matchId && matchId !== '0' && matchId !== '-1';

  return useQueryHook<OBMatchDetailData | null, Error>({
    queryKey: ['ob', 'match', 'getDetail', matchId, String(params.sportId ?? '')],
    queryFn: async () => {
      try {
        return await fetchOBMatchDetail({
          matchId,
          sportId: params.sportId,
        });
      } catch {
        return null;
      }
    },
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
    refetchInterval: (query) => (query.state.data?.matchInfo?.matchId ? 5000 : false),
  });
};

/** 仅头部信息时的兜底（测试用） */
export function formatEmptyOBDetail(): OBMatchDetailData {
  return {
    matchInfo: emptyMatchInfo(),
    typeList: [],
    raw: {} as MatchRecord,
  };
}

/**
 * 获取赛事详情请求
 */
export const getChampionDetailReq = async (
  params: GetMatchDetailParams,
): Promise<ResponseData<MatchBaseInfo>> => {
  const euid = resolveObEuid(params.sportId);
  if (!euid) {
    return { code: 0, data: {} as MatchBaseInfo, message: '' };
  }

  // 与 getListReq 一致：先初始化 OB 配置，确保请求体中的 cuid 已就绪。
  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  const cuid = getObCuid();
  if (!cuid) {
    return { code: 0, data: {} as MatchBaseInfo, message: '' };
  }

  return requestOB.post<MatchRecord[] | { data?: MatchRecord[] }, object, MatchBaseInfo>(
    '/yewu11/v1/m/matchesPB',
    {
      body: { type: 100, device: 'v2_h5', euid, cuid },
      transformResponse: (data) => {
        const raw = data.data;
        const records = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray(raw.data)
            ? raw.data
            : [];
        const match = records.find((item) => String(item.mid) === String(params.matchId));

        return {
          ...data,
          data: match ? formatOBChampionItem(match) : ({} as MatchBaseInfo),
        };
      },
    },
  );
};

/**
 * 获取冠军详情的 React Query Hook
 */
export const useGetMatchChampionDetailQuery = (
  params: GetMatchDetailParams,
): ReturnType<typeof useQueryHook<MatchBaseInfo, Error>> => {
  return useQueryHook<MatchBaseInfo, Error>({
    queryKey: ['ob', 'match', 'ChampionDetail', params.matchId],
    queryFn: () =>
      getChampionDetailReq(params)
        .then((res) => res.data)
        .catch(() => {
          // 返回一个空对象，避免类型错误
          return {} as MatchBaseInfo;
        }),
    enabled: !!params.matchId,
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
    refetchInterval: 5000, // 每5秒刷新一次
  });
};
