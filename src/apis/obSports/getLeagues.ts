import { getOBTokenReq } from '@/apis/origin/system';
import { useQueryHook } from '@/core/query/hooks';
import { apiConfigManager } from '@/core/sdk/request/apiConfigManager';
import { ResponseData } from '@/core/sdk/request/model';
import requestOB from '@/core/sdk/requestOB';
import { useAppSelector } from '@/core/store/hooks';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { useMemo } from 'react';

import type { LeagueGroup, LeagueItem } from '../fbSports/common/types';
import type { GetHotLeaguesParams } from '../fbSports/getLeagues';
import { formatOBLeagueGroup } from './common/obFormat';
import type { OBFilterMatchGroup } from './common/types';
import { resolveObEuid } from './getList';

/** OB 筛选接口合法 type：1 滚球 / 3 今日 / 4 早盘 / 11 串关 / 100 冠军 */
const OB_FILTER_TYPES = new Set([1, 3, 4, 11, 100]);

export interface GetOBLeaguesParams {
  /** 菜单类型，见 OB_FILTER_TYPES */
  type: number;
  /** 球种 csid；内部解析为二级 menuId（euid） */
  sportId: number;
}

function getObCuid(): string {
  return getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.userId ?? '';
}

/** 兼容 data 为数组 / { data: [] } 的解密结果 */
function unwrapFilterGroups(raw: unknown): OBFilterMatchGroup[] {
  if (Array.isArray(raw)) return raw as OBFilterMatchGroup[];
  if (raw && typeof raw === 'object') {
    const nested = (raw as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as OBFilterMatchGroup[];
  }
  return [];
}

/**
 * OB 联赛筛选列表
 * 对齐 Flutter getOBLeagueList：GET /yewu11/v1/m/getFilterMatchListPB
 * euid = 二级 menuId（非 csid）
 */
export const getOBLeaguesReq = async (
  params: GetOBLeaguesParams & { euid: string },
): Promise<ResponseData<LeagueGroup[]>> => {
  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  const cuid = getObCuid();
  if (!cuid || !params.euid) {
    return { code: 0, data: [], message: '' };
  }

  const query = new URLSearchParams({
    device: 'v2_h5',
    type: String(params.type),
    euid: params.euid,
    cuid,
    inputText: '',
    md: '',
  });

  return requestOB.get<OBFilterMatchGroup[], object, LeagueGroup[]>(
    `/yewu11/v1/m/getFilterMatchListPB?${query.toString()}`,
    {
      isErrorToast: false,
      transformResponse: (data) => ({
        ...data,
        data: formatOBLeagueGroup(unwrapFilterGroups(data.data)),
      }),
    },
  );
};

/**
 * OB 联赛筛选 React Query Hook
 * 参数签名对齐 FB useGetLeaguesQuery，便于 VenueService 统一挂载
 */
export const useGetLeaguesQuery = (
  params: GetOBLeaguesParams,
  enabled = true,
): ReturnType<typeof useQueryHook<LeagueGroup[], Error>> => {
  const euid = resolveObEuid(params.sportId);
  const typeOk = OB_FILTER_TYPES.has(params.type);
  const canFetch = enabled && typeOk && !!euid && params.sportId > 0;

  return useQueryHook<LeagueGroup[], Error>({
    queryKey: ['ob', 'leagues', 'getFilterMatchListPB', params.type, euid ?? '', params.sportId],
    queryFn: () => {
      // 请求时再解析 euid，避免闭包拿到空值
      const resolvedEuid = resolveObEuid(params.sportId);
      if (!resolvedEuid) return Promise.resolve([] as LeagueGroup[]);
      return getOBLeaguesReq({ ...params, euid: resolvedEuid })
        .then((res) => res.data ?? [])
        .catch(() => [] as LeagueGroup[]);
    },
    enabled: canFetch,
    // 对齐 Flutter buildCacheOptions 5 分钟
    staleTime: 5 * 60_000,
  });
};

/**
 * OB 热门联赛（spell=HOT）
 * 对齐 Flutter getOBHotLeagueList；euid 可逗号拼接多球种 menuId
 */
export const getOBHotLeagueListReq = async (params: {
  type: number;
  /** 二级 menuId 列表 */
  euids: string[];
}): Promise<LeagueItem[]> => {
  if (!params.euids.length || !OB_FILTER_TYPES.has(params.type)) return [];

  await apiConfigManager.ensureConfig('ob', getOBTokenReq);
  const cuid = getObCuid();
  if (!cuid) return [];

  const query = new URLSearchParams({
    device: 'v2_h5',
    type: String(params.type),
    euid: params.euids.join(','),
    cuid,
    inputText: '',
    md: '',
  });

  const res = await requestOB.get<OBFilterMatchGroup[], object, OBFilterMatchGroup[]>(
    `/yewu11/v1/m/getFilterMatchListPB?${query.toString()}`,
    {
      isErrorToast: false,
      transformResponse: (data) => ({
        ...data,
        data: unwrapFilterGroups(data.data),
      }),
    },
  );

  const hotGroups = (res.data ?? []).filter((item) => String(item.spell ?? '') === 'HOT');
  return formatOBLeagueGroup(hotGroups).flatMap((group) => group.list);
};

/**
 * OB 热门联赛 React Query Hook
 * 签名对齐 FB useGetHotLeagueList（type + sportIds），挂到 VenueService
 * Flutter：euid = BallItem.sportId（menuId）；web 用 csid → resolveObEuid
 */
export const useGetHotLeagueList = (
  params: GetHotLeaguesParams,
  enabled = true,
): ReturnType<typeof useQueryHook<LeagueItem[], Error>> => {
  // 订阅菜单：euid 依赖二级 menuId，菜单未就绪时不请求，就绪后自动重算
  const menus = useAppSelector((s) => s.sport.mainList.datas.menuInfo.menus);
  const playType = useAppSelector((s) => s.sport.mainList.settings.playType);

  const euids = useMemo(() => {
    void menus;
    void playType;
    return params.sportIds.map((id) => resolveObEuid(id)).filter((id): id is string => !!id);
  }, [menus, playType, params.sportIds]);

  const typeOk = OB_FILTER_TYPES.has(params.type);
  const canFetch = enabled && typeOk && euids.length > 0;

  return useQueryHook<LeagueItem[], Error>({
    queryKey: ['ob', 'leagues', 'getHotLeagueList', params.type, euids.join(',')],
    queryFn: () => {
      const resolved = params.sportIds
        .map((id) => resolveObEuid(id))
        .filter((id): id is string => !!id);
      if (!resolved.length) return Promise.resolve([] as LeagueItem[]);
      return getOBHotLeagueListReq({ type: params.type, euids: resolved }).catch(
        () => [] as LeagueItem[],
      );
    },
    enabled: canFetch,
    staleTime: 5 * 60_000,
  });
};
