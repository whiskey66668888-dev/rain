// 所有的三方接口从这里抛出统一的API，根据不同的场馆切换api
import { useMemo } from 'react';

import { useGetListByPopularEventsLiveQuery as useGetListByPopularEventsLiveQueryFB } from '../fbSports/getList';
import { useGetListQuery as useGetListQueryFB } from '../fbSports/getList';
import { useGetStatisticalQuery as useGetStatisticalQueryFB } from '../fbSports/statistical';
import { useFBNoticeListQuery } from '../origin/noticeList';
/**
 * 场馆服务接口定义
 * 所有场馆都需要实现这个接口，确保 API 统一
 */
export interface VenueService {
  /** 获取热门赛事列表 */
  useGetRecommendMatchQuery: typeof useGetListByPopularEventsLiveQueryFB;
  useGetMenuListQuery: typeof useGetStatisticalQueryFB;
  useGetMainListQuery: typeof useGetListQueryFB;
  useNoticeListQuery: typeof useFBNoticeListQuery;
}

/**
 * 模块级缓存：存储每个场馆的服务对象
 */
const venueServiceCache = new Map<string, VenueService>();

/**
 * 获取场馆服务 Hook
 * @returns 场馆服务对象，包含所有统一的 API Hooks
 */
export const useVenueService = (): VenueService => {
  // RICO_TODO: 暂时写死为 'fb'，后续可以从 Redux 获取, 切换场馆后触发重新请求
  // 如果场馆过多，这里改为动态引入来拆包
  // const venue = useAppSelector((state) => {
  //   const config = state.thirdApiConfig;
  //   if (config.fb?.config && !config.fb.isMaintenance) return 'fb';
  //   if (config.ob?.config && !config.ob.isMaintenance) return 'ob';
  //   return 'fb'; // 默认
  // });
  const venue: 'fb' | 'ob' = 'fb';

  return useMemo(() => {
    // 检查缓存，如果已存在直接返回
    if (venueServiceCache.has(venue)) {
      return venueServiceCache.get(venue)!;
    }

    // 创建服务对象（每个场馆只创建一次）
    const service: VenueService = {
      useGetRecommendMatchQuery: useGetListByPopularEventsLiveQueryFB,
      useGetMenuListQuery: useGetStatisticalQueryFB,
      useGetMainListQuery: useGetListQueryFB,
      useNoticeListQuery: useFBNoticeListQuery,
    };

    // 缓存服务对象，避免重复创建
    venueServiceCache.set(venue, service);
    return service;
  }, [venue]); // venue 变化时才重新创建
};
