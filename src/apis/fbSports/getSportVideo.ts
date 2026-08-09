import { useQuery } from '@tanstack/react-query';

import { ResponseData } from '@/core/sdk/request/model';
import request from '@/core/sdk/request';
import { querystringStringify } from '@/utils';

/**
 * 视频线路数据
 */
export interface VideoLive {
  /** 视频播放地址 */
  url: string;
  /** Referer 地址 */
  refererUrl?: string;
  /** 是否为 HTML 视频 */
  isHTML?: boolean;
}

/**
 * 视频数据实体
 */
export interface SportVideoEntity {
  /** 动画视频地址列表 */
  mlive?: string[];
  /** 视频线路列表 */
  live?: VideoLive[];
}

/**
 * 获取视频请求参数
 */
export interface GetSportVideoParams {
  /** 赛事类型：'FB' | 'OB' | 'BTI' */
  gameType: string;
  /** 赛事ID */
  matchId: string | number;
}

/**
 * 获取赛事视频数据请求
 */
export const getSportVideoReq = async (
  params: GetSportVideoParams,
): Promise<ResponseData<SportVideoEntity>> => {
  const { gameType, matchId } = params;

  const query = querystringStringify({
    gameType,
    matchId: String(matchId),
  });
  const testUrl = 'https://live-api-sit.test100.cc/api/match/live/get100Refactoring?';
  const liveUrl = 'https://api.live336.com/api/match/live/get100Refactoring?';
  try {
    const result = await request.get<SportVideoEntity, undefined, SportVideoEntity>(
      `${true ? liveUrl : testUrl}${query}`,
      {
        isErrorToast: false,
        transformResponse: (res) => {
          // 处理响应数据，确保返回正确的格式
          const data = res.data as unknown;
          if (data && typeof data === 'object') {
            const entity = data as Partial<SportVideoEntity>;
            return {
              ...res,
              data: {
                mlive: Array.isArray(entity.mlive) ? entity.mlive : [],
                live: Array.isArray(entity.live) ? entity.live : [],
              },
            };
          }
          return {
            ...res,
            data: {
              mlive: [],
              live: [],
            },
          };
        },
      },
    );
    return result;
  } catch (error) {
    // 请求失败时返回空数据
    console.error('获取视频数据失败:', error);
    return {
      data: {
        mlive: [],
        live: [],
      },
      code: -1,
      message: '获取视频数据失败',
    };
  }
};

/**
 * 获取赛事视频数据的 React Query Hook
 */
export const useGetSportVideoQuery = (
  params: GetSportVideoParams | null,
  config?: { enabled?: boolean },
) => {
  const isEnabled = config?.enabled !== false && params !== null;

  return useQuery<ResponseData<SportVideoEntity>>({
    queryKey: ['fb', 'sport', 'video', params?.gameType, params?.matchId],
    queryFn: () => {
      if (!params) {
        // 如果参数为空，返回空数据而不是抛出错误
        return Promise.resolve<ResponseData<SportVideoEntity>>({
          data: {
            mlive: [],
            live: [],
          },
          code: 0,
          message: '参数为空',
        });
      }
      return getSportVideoReq(params);
    },
    enabled: isEnabled,
    staleTime: 0,
    retry: false,
    refetchOnMount: false,
  });
};
