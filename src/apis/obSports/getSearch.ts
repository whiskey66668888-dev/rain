/**
 * OB 关键字搜索
 * 对齐 Flutter search_new/services.dart：
 * - 常规球种 POST /yewu11/v1/hotSearch/searchForAppPB
 * - 电竞 POST /yewu11/v1/m/esportsMatchesPB + 本地过滤
 */

import { getOBTokenReq } from '@/apis/origin/system';
import { apiConfigManager } from '@/core/sdk/request/apiConfigManager';
import { ResponseData } from '@/core/sdk/request/model';
import requestOB from '@/core/sdk/requestOB';

import type { MatchBaseInfo } from '../commonSports/types';
import { formatOBSportItem } from './common/obFormat';
import type { MatchRecord } from './common/types';

export interface OBMatchSearchParams {
  /** 搜索关键字 */
  keyword: string;
  /**
   * 球种 csid
   * 1 足球 / 2 篮球 / 3 棒球 / 4 冰球 / 5 网球 / 6 美式足球 /
   * 7 斯诺克 / 8 乒乓球 / 9 排球 / 10 羽毛球 / 18 政治娱乐
   */
  searchSportType: number;
}

function unwrapMatchList(raw: unknown): MatchRecord[] {
  if (Array.isArray(raw)) return raw as MatchRecord[];
  if (raw && typeof raw === 'object') {
    const nested = (raw as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as MatchRecord[];
  }
  return [];
}

/**
 * OB 模糊搜索赛事
 * 对齐 Flutter queryOBMatch（matchType/md 未启用，与 App 一致不传）
 */
export const getOBMatchByRecommendReq = async (
  params: OBMatchSearchParams,
): Promise<ResponseData<MatchBaseInfo[]>> => {
  const keyword = params.keyword.trim();
  if (!keyword || !params.searchSportType) {
    return { code: 0, data: [], message: '' };
  }

  await apiConfigManager.ensureConfig('ob', getOBTokenReq);

  return requestOB.post<
    MatchRecord[],
    { keyword: string; searchSportType: number },
    MatchBaseInfo[]
  >('/yewu11/v1/hotSearch/searchForAppPB', {
    body: {
      keyword,
      searchSportType: params.searchSportType,
    },
    isErrorToast: false,
    transformResponse: (data) => ({
      ...data,
      data: unwrapMatchList(data.data).map((item) => formatOBSportItem(item, 1)),
    }),
  });
};

export interface OBEsportSearchParams {
  keyword: string;
  /** 100 英雄联盟 / 101 DOTA2 / 102 CS2 / 103 王者荣耀 */
  csid: number;
}

/**
 * OB 电竞搜索：拉全量后本地过滤联赛/主客队名
 * 对齐 Flutter queryOBESportMatch（HTTP 缓存 3 分钟）
 */
export const getOBEsportMatchByRecommendReq = async (
  params: OBEsportSearchParams,
): Promise<ResponseData<MatchBaseInfo[]>> => {
  const keyword = params.keyword.trim().toLowerCase();
  if (!keyword || !params.csid) {
    return { code: 0, data: [], message: '' };
  }

  await apiConfigManager.ensureConfig('ob', getOBTokenReq);

  return requestOB.post<MatchRecord[], { csid: number }, MatchBaseInfo[]>(
    '/yewu11/v1/m/esportsMatchesPB',
    {
      body: { csid: params.csid },
      isErrorToast: false,
      transformResponse: (data) => {
        const list = unwrapMatchList(data.data)
          .map((item) => formatOBSportItem(item, 1))
          .filter((m) => {
            const league = (m.leagueName ?? '').toLowerCase();
            const home = (m.homeName ?? '').toLowerCase();
            const away = (m.awayName ?? '').toLowerCase();
            return league.includes(keyword) || home.includes(keyword) || away.includes(keyword);
          });
        return { ...data, data: list };
      },
    },
  );
};

/** 本地关键字匹配（竞彩等「先拉全量再过滤」场景） */
export function filterMatchesByKeyword(list: MatchBaseInfo[], keyword: string): MatchBaseInfo[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return list.filter((m) => {
    const league = (m.leagueName ?? '').toLowerCase();
    const home = (m.homeName ?? '').toLowerCase();
    const away = (m.awayName ?? '').toLowerCase();
    return league.includes(kw) || home.includes(kw) || away.includes(kw);
  });
}
