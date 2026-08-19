import {
  InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getOBTokenReq } from '@/apis/origin/system';
import { useQueryHook } from '@/core/query/hooks';
import { apiConfigManager } from '@/core/sdk/request/apiConfigManager';
import { ResponseData } from '@/core/sdk/request/model';
import requestOB from '@/core/sdk/requestOB';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

import { HotSportId, PlayTypeId } from '../commonSports/constants';
import type { MatchBaseInfo } from '../commonSports/types';
import type { MatchListParams } from '../fbSports/getList';
import { popularEventsLiveReq } from '../origin/popularEventsLive';
import { formatOBChampionItem, formatOBSportItem } from './common/obFormat';
import type { MatchRecord } from './common/types';

export type { HPSItem, HLRes, MatchRecord, OLRes } from './common/types';

/** popularEventsLive.threeParty：2 = OB（与 Flutter 一致） */
const THREE_PARTY_OB = 2;

const LIVE_URL = '/yewu11/v1/m/matchesPagePB';
const NO_LIVE_URL = '/yewu11/v1/m/noLiveMatchesPagePB';
const CHAMPION_URL = '/yewu11/v1/m/matchesPB';
const BY_MIDS_URL = '/yewu11/v1/m/getMatchBaseInfoByMidsPB';

/** OB 列表请求体（对齐 Flutter OBMatchRepository；euid = 二级 menuId） */
interface OBMatchListBody {
  type?: number;
  sort?: number;
  euid?: string;
  cpn?: number;
  cps?: number;
  device: string;
  tid?: string;
  beginTime?: number;
  endTime?: number;
  md?: string;
  mids?: string;
  cuid?: string;
}

interface MatchListByMidsParams {
  euid?: string;
  sort?: number;
  /** 赛事 id，逗号分隔，最多约 40 个 */
  mids: string;
  cuid?: string;
  device?: string;
}

/** orderBy 0 时间 → OB sort=2；1 联赛 → sort=1 */
const toOBSort = (orderBy?: number) => (orderBy === 0 ? 2 : 1);

/**
 * 早盘 md：对齐 Flutter _buildMdParam
 * ≤7 天用 timestamp-1；更早用 -(timestamp-1)
 */
function buildMdParam(timestamp?: number): string | undefined {
  if (timestamp == null || timestamp === 0) return undefined;
  const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return String(timestamp - 1);
  return `-${timestamp - 1}`;
}

function getObCuid(): string {
  return getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '';
}

/**
 * 解析列表 euid（接口侧叫 menuId）
 * 优先用入参；否则按当前玩法 + sportId(csid) 从菜单取二级 menuId
 */
export function resolveObEuid(sportId?: number, euidFromParams?: string): string | undefined {
  if (euidFromParams) return String(euidFromParams);
  if (sportId == null) return undefined;
  const mainList = getGlobalStoreForApiRequest().getState().sport.mainList;
  const playType = mainList.settings.playType;
  const menus = mainList.datas.menuInfo.menus;
  const menuId = menus[playType]?.find((item) => item.sportId === sportId)?.menuId;
  return menuId ? String(menuId) : undefined;
}

function unwrapRecords(raw: unknown): MatchRecord[] {
  if (Array.isArray(raw)) return raw as MatchRecord[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: MatchRecord[] }).data;
  }
  return [];
}

function emptyListResponse(): ResponseData<MatchBaseInfo[]> {
  return { code: 0, data: [], message: '' };
}

/** 按赛事 id 批量拉取 OB 赛事基础信息 */
export const getListByMidsReq = async (
  params: MatchListByMidsParams,
): Promise<ResponseData<MatchBaseInfo[]>> => {
  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  return requestOB.post<MatchRecord[], MatchListByMidsParams, MatchBaseInfo[]>(BY_MIDS_URL, {
    body: {
      ...params,
      cuid: params.cuid || getObCuid(),
      device: params.device ?? 'v2_h5',
    },
    transformResponse: (data) => {
      const records = unwrapRecords(data.data);
      // OB 可能返回重复 mid
      const seen = new Set<string>();
      const unique = records.filter((item) => {
        const id = String(item.mid ?? '');
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      return {
        ...data,
        data: unique.map((item) => formatOBSportItem(item, 1)),
      };
    },
  });
};

/**
 * OB 主列表请求
 * - matchIds → getMatchBaseInfoByMidsPB（不需要 euid）
 * - type=1 滚球 → matchesPagePB（必传 euid）
 * - type=100 冠军 → matchesPB（必传 euid）
 * - 今日/早盘 → noLiveMatchesPagePB（必传 euid + cuid，缺 cuid 会 0401026）
 */
export const getListReq = async (
  params: MatchListParams,
): Promise<ResponseData<MatchBaseInfo[]>> => {
  const pageIndex = params.current ?? 1;
  const isChampion = params.type === 100;

  if (params.matchIds?.length) {
    return getListByMidsReq({
      mids: params.matchIds.map(String).join(','),
      sort: toOBSort(params.orderBy),
    });
  }

  // OB 非 by-ids 列表：euid 为空会返回 0408006「参数menuId不能为空」
  const euid = resolveObEuid(params.sportId, params.euid);
  if (!euid) {
    return emptyListResponse();
  }

  // 早于 requestOB 内 ensureConfig 组装 body，需先保证 token/userId 就绪
  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  const cuid = getObCuid();
  if (!cuid) {
    return emptyListResponse();
  }

  const body: OBMatchListBody = {
    type: params.type,
    sort: isChampion ? 2 : toOBSort(params.orderBy),
    device: 'v2_h5',
    euid,
    cuid,
  };

  if (!isChampion) {
    body.cpn = pageIndex;
    body.cps = params.size ?? 50;
  }

  // 对齐 Flutter：有联赛筛选才传 tid；冠军接口不能带 tid
  if (!isChampion && Array.isArray(params.leagueIds) && params.leagueIds.length > 0) {
    const tid = params.leagueIds
      .map((id) => String(id).trim())
      .filter((id) => id && id !== '0')
      .join(',');
    if (tid) body.tid = tid;
  }

  if (params.beginTime != null) body.beginTime = params.beginTime;
  if (params.endTime != null) body.endTime = params.endTime;

  // 早盘 md
  if (params.type === PlayTypeId.Early && params.beginTime != null) {
    const md = buildMdParam(params.beginTime);
    if (md) body.md = md;
  }

  const url =
    params.type === PlayTypeId.Living ? LIVE_URL : isChampion ? CHAMPION_URL : NO_LIVE_URL;

  return requestOB.post<MatchRecord[] | { data?: MatchRecord[] }, OBMatchListBody, MatchBaseInfo[]>(
    url,
    {
      body,
      isErrorToast: false,
      transformResponse: (data) => {
        const records = unwrapRecords(data.data);
        const formatted: MatchBaseInfo[] = [];
        for (const item of records) {
          try {
            formatted.push(
              isChampion
                ? formatOBChampionItem(item, pageIndex)
                : formatOBSportItem(item, pageIndex),
            );
          } catch {
            // 单条格式化失败不拖垮整页（避免筛选后整表变空）
          }
        }
        return {
          ...data,
          data: formatted,
        };
      },
    },
  );
};

/**
 * OB 赛事列表 Infinite Query（签名对齐 FB useGetListQuery）
 * 无 euid 时不发起请求，避免 0408006
 */
export const useGetListQuery = (
  params: MatchListParams,
  config: { enabled: boolean; keepPreviousData?: boolean } = { enabled: true },
) => {
  const queryClient = useQueryClient();
  const _params: MatchListParams = { ...params };

  // OB 无热门菜单：热门直接空列表，避免误打接口
  const isHot = params.sportId === HotSportId;
  const hasMatchIds = !!params.matchIds?.length;
  const euid = resolveObEuid(params.sportId, params.euid);
  _params.euid = euid;

  if (!params.type) {
    _params.type = PlayTypeId.Living;
  } else if (params.type === Number(PlayTypeId.Follow)) {
    _params.type = undefined;
  }

  // 关注 / 按 id：不传 type、sportId
  if (hasMatchIds) {
    _params.type = undefined;
    _params.sportId = undefined;
  }

  const canRequest = hasMatchIds || !!euid;
  const queryKey = ['ob', 'match', 'getList', JSON.stringify(_params)] as const;

  return useInfiniteQuery<
    MatchBaseInfo[],
    Error,
    InfiniteData<MatchBaseInfo[]>,
    readonly string[],
    number
  >({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (isHot || !canRequest) return [];

      // 冠军接口不分页：仅首页请求
      if (_params.type === 100 && pageParam > 1) return [];

      const reqParams: MatchListParams = {
        ..._params,
        current: pageParam,
      };
      try {
        const result = await getListReq(reqParams);
        return result.data ?? [];
      } catch {
        const cache = queryClient.getQueryData<InfiniteData<MatchBaseInfo[]>>(queryKey);
        if (cache?.pages?.length) {
          const currentPageData = cache.pages[pageParam - 1];
          if (currentPageData?.length) return currentPageData;
          const latestPageData = cache.pages[cache.pages.length - 1];
          if (latestPageData?.length) return latestPageData;
        }
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (_params.type === 100) return undefined;
      if (hasMatchIds) return undefined;
      if (lastPage.length < _params.size) return undefined;
      return allPages.length + 1;
    },
    enabled: config.enabled && !isHot && canRequest,
    initialPageParam: 1,
    staleTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchInterval: canRequest ? 4000 : false,
    ...(config.keepPreviousData ? { placeholderData: keepPreviousData } : {}),
  });
};

/**
 * 站点 popularEventsLive 取 OB mid，再调三方 by-mids，转为统一 MatchBaseInfo
 */
export const useGetListByPopularEventsLiveQuery = (params: MatchListParams) => {
  return useQueryHook<MatchBaseInfo[], Error>({
    queryKey: ['ob', 'match', 'getListByPopularEventsLive', params],
    queryFn: async () => {
      const res = await popularEventsLiveReq();
      const mids = (res.data ?? [])
        .filter((item) => item.threeParty === THREE_PARTY_OB)
        .map((item) => String(item.mid))
        .filter(Boolean)
        .slice(0, 40);

      if (!mids.length) return [];

      const list = await getListByMidsReq({ mids: mids.join(',') });
      const rows = list.data ?? [];
      return [...rows].sort((a, b) => (Number(a.bt) || 0) - (Number(b.bt) || 0));
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always',
  });
};
