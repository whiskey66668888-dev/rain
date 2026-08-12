import { useInfiniteQuery } from '@tanstack/react-query';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { useQueryHook } from '@/core/query/hooks';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';

/**
 * 从游戏 URL（可能带域名或仅 path+query）中解析出 query 参数对象
 */
export function getGamePlayParamsFromUrl(url: string): TGamePlayParams {
  const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
  const urlObj = hasProtocol ? new URL(url) : new URL(url, 'http://dummy');
  return {
    gameId: urlObj.searchParams.get('gameId') ?? '',
    visitType: urlObj.searchParams.get('visitType') ?? '',
  };
}

/** 给相对/绝对 URL 追加 query（已存在则覆盖） */
export function appendUrlSearchParams(url: string, params: Record<string, string>): string {
  const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
  const urlObj = hasProtocol ? new URL(url) : new URL(url, 'http://dummy');
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });
  if (hasProtocol) return urlObj.toString();
  return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
}

/** 游戏试玩/进入游戏接口参数 */
export interface TGamePlayParams {
  gameId: string | number;
  visitType?: string;
  platform?: string;
  ignoreHeader?: boolean; // 是否忽略头部(接口会默认通过请求头的设备来返回游戏url，但是有些游戏需要在pc上用h5的地址)
}

/**
 * 进入游戏（试玩）
 * 接口：POST /api/game/play
 */
export const gamePlayReq = (params: TGamePlayParams): Promise<ResponseData<string>> => {
  return request.post<string, TGamePlayParams>('/api/game/play', {
    body: {
      ...params,
      ignoreHeader: true,
    },
  });
};

/**
 * 场馆 menu.url / menu.testUrl 为启动接口 path，POST 后返回真实游戏地址
 * 对齐 Flutter doLaunchGameReq
 */
export const launchGameByMenuUrlReq = async (
  menuUrl: string,
  platform: string,
): Promise<string> => {
  const trimmedUrl = menuUrl.trim();
  if (!trimmedUrl) {
    throw new Error('场馆启动地址为空');
  }
  const url = appendUrlSearchParams(trimmedUrl, { platform });
  const res = await request.post<string, Record<string, never>>(url, {
    body: {},
    isErrorToast: false,
  });
  if (String(res.code) === API_CODE_ORIGIN_SUCCESS && typeof res.data === 'string' && res.data) {
    return res.data;
  }
  throw new Error(res.message || res.info || '获取游戏地址失败');
};

//  电子列表
interface TGameSlotListParams {
  pageNumber: number;
  gameId?: number;
  pageSize: number;
  tryPlay?: boolean;
  clType?: string; // 列表模式：hot（热门）、recent/last（最近游戏，需登录）
  displaySize?: number; // 展示页数，前端传自适应
  isRefactoring?: boolean; // 是否是重构游戏（传入true会同时返回web和h5游戏地址）
}
export interface TGameList {
  backgroundColor: string; // e.g. "#422517"
  gameTestUrl: string; // 测试地址，空字符串常见
  gameUrl: string; // 真实游戏跳转地址
  webGameUrl?: string; // PC游戏地址
  webGameTestUrl?: string; // PC游戏测试地址
  haveTest: boolean; // 是否有试玩模式
  hideGameTransfer: boolean; // 是否隐藏转账入口
  hot: boolean; // 是否热门
  id: number; // 游戏唯一ID
  imageUrl: string; // 游戏图标/封面图
  isFavorite: boolean; // 当前用户是否收藏
  name: string; // 游戏名称（中文）
  openType: string | null; // 打开方式（可能为 null 或特定字符串）
  sort: number; // 排序权重（负数表示置顶靠前）
  titleColor: string; // 标题文字颜色 e.g. "#ffffff"
  transferId: number; // 场馆/供应商ID 或转账相关ID
  thumbnailImg: string; // 游戏缩略图
}
interface TGameSlotListResponse {
  gameList: Array<TGameList>;
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
  totalPage: number;
}

// export const gameSlotListReq = (params: TGameSlotListParams) => {
//   const query = querystringStringify({
//     ...params,
//   });
//   return request.get<TGameSlotListResponse, TGameSlotListParams>(
//     `/api/website/slot/list?${query}`,
//     {
//       isErrorToast: false,
//     },
//   );
// };
export const gameSlotListReq = (params: TGameSlotListParams) => {
  return request.post<TGameSlotListResponse, TGameSlotListParams>('/api/website/slot/list', {
    isErrorToast: false,
    body: {
      isRefactoring: true,
      ...params,
    },
  });
};

const emptySlotListResponse: TGameSlotListResponse = {
  gameList: [],
  pageNumber: 1,
  pageSize: 30,
  totalNumber: 0,
  totalPage: 0,
};

export const useGameSlotListQuery = (
  params: TGameSlotListParams,
  config: { enabled: boolean; suspense?: boolean } = { enabled: true },
) => {
  return useQueryHook({
    queryKey: ['origin', 'game', 'slot', 'list', params],
    queryFn: () =>
      gameSlotListReq(params)
        .then((res) => res.data ?? emptySlotListResponse)
        .catch(() => emptySlotListResponse),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always',
    enabled: config.enabled,
    suspense: config.suspense,
  });
};

/** 电子游戏列表无限分页（加载更多） */
export const useGameSlotListInfiniteQuery = (
  params: Omit<TGameSlotListParams, 'pageNumber'>,
  config: { enabled?: boolean } = {},
) => {
  return useInfiniteQuery<TGameSlotListResponse, Error>({
    queryKey: ['origin', 'game', 'slot', 'list', 'infinite', params],
    queryFn: async ({ pageParam }) => {
      const res = await gameSlotListReq({ ...params, pageNumber: pageParam as number });
      return res.data ?? emptySlotListResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPage ? lastPage.pageNumber + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always',
    enabled: config.enabled ?? true,
  });
};

interface TSetFavoriteParams {
  sysId: number;
}
//  收藏
export const setFavoriteReq = (params: TSetFavoriteParams) => {
  return request.post('/api/website/slot/favorite', {
    isErrorToast: true,
    body: {
      ...params,
    },
  });
};

export interface TGameFavoriteListParams {
  page: number;
  pageSize: number;
  sort: string;
  order: string;
  search: string;
  category: string;
  subcategory: string;
}
//  电子收藏列表
export const gameFavoriteListReq = (params: TGameFavoriteListParams) => {
  return request.post<TGameSlotListResponse, TGameFavoriteListParams>(
    '/api/website/slot/favorite/list',
    {
      isErrorToast: false,
      body: {
        ...params,
      },
    },
  );
};

/** 电子游戏收藏列表无限分页（加载更多） */
export const useGameFavoriteListInfiniteQuery = (
  params: Omit<TGameFavoriteListParams, 'page'>,
  config: { enabled?: boolean } = {},
) => {
  return useInfiniteQuery<TGameSlotListResponse, Error>({
    queryKey: ['origin', 'game', 'slot', 'favorite', 'list', 'infinite', params],
    queryFn: async ({ pageParam }) => {
      const res = await gameFavoriteListReq({ ...params, page: pageParam as number });
      return res.data ?? emptySlotListResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPage ? lastPage.pageNumber + 1 : undefined,
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
    enabled: config.enabled ?? true,
  });
};
interface TGameFilterListParams {
  likeGameName: string;
  gameId: number;
}
//  搜索电子游戏列表
export const gameFilterListReq = (params: TGameFilterListParams) => {
  return request.post<TGameSlotListResponse, TGameFilterListParams>(
    '/api/website/slot/filter/list',
    {
      isErrorToast: false,
      body: {
        ...params,
      },
    },
  );
};

interface TWebsiteSlotTop10Response {
  gameList: Array<TGameList>;
}
// 热门搜索
const getWebsiteSlotTop10Req = ({
  gameType,
  gameId,
}: {
  gameType: string;
  gameId: number;
}): Promise<ResponseData<TWebsiteSlotTop10Response>> => {
  return request.get<TWebsiteSlotTop10Response, { gameType: string; gameId: number }>(
    `/api/website/slot/top10?gameType=${gameType}&gameId=${gameId}`,
  );
};

export const useWebsiteSlotTop10Query = (params: { gameType: string; gameId: number }) => {
  return useQueryHook({
    queryKey: ['origin', 'game', 'slot', 'top10', params],
    queryFn: () =>
      getWebsiteSlotTop10Req(params)
        .then((res) => res.data ?? { gameList: [] })
        .catch(() => {
          return { gameList: [] };
        }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    // 只有以下游戏id才请求热门搜索
    enabled: [68, 70, 72, 9, 113].includes(params.gameId),
  });
};
