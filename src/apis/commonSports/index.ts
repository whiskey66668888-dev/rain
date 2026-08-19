// 所有的三方接口从这里抛出统一的 API，根据不同的场馆切换
import { useMemo } from 'react';

import { useAppSelector } from '@/core/store/hooks';

import { EVenue } from './constants';
import {
  useGetHotLeagueList as useGetHotLeagueListFB,
  useGetLeaguesQuery as useGetLeaguesQueryFB,
} from '../fbSports/getLeagues';
import { useGetListByPopularEventsLiveQuery as useGetListByPopularEventsLiveQueryFB } from '../fbSports/getList';
import { useGetListQuery as useGetListQueryFB } from '../fbSports/getList';
import { useGetStatisticalQuery as useGetStatisticalQueryFB } from '../fbSports/statistical';
import {
  useGetHotLeagueList as useGetHotLeagueListOB,
  useGetLeaguesQuery as useGetLeaguesQueryOB,
} from '../obSports/getLeagues';
import { useGetListByPopularEventsLiveQuery as useGetListByPopularEventsLiveQueryOB } from '../obSports/getList';
import { useGetListQuery as useGetListQueryOB } from '../obSports/getList';
import { useGetMenuListQuery as useGetMenuListQueryOB } from '../obSports/menu';
import { useFBNoticeListQuery } from '../origin/noticeList';
import { useGetMatchChampionDetailQuery as useGetMatchChampionDetailQueryFB } from '../fbSports/getMatchDetail';
import { useGetMatchChampionDetailQuery as useGetMatchChampionDetailQueryOB } from '../obSports/getMatchDetail';

/**
 * 场馆服务接口定义
 * 所有场馆都需要实现这个接口，确保 API 统一；UI 只消费统一结构
 */
export interface VenueService {
  /** 获取热门赛事列表 */
  useGetRecommendMatchQuery: typeof useGetListByPopularEventsLiveQueryFB;
  useGetMenuListQuery: typeof useGetStatisticalQueryFB;
  useGetMainListQuery: typeof useGetListQueryFB;
  /** 联赛筛选列表 */
  useGetLeaguesQuery: typeof useGetLeaguesQueryFB;
  /** 搜索弹窗热门联赛（签名：type + sportIds） */
  useGetHotLeagueList: typeof useGetHotLeagueListFB;
  useNoticeListQuery: typeof useFBNoticeListQuery;
  useGetMatchChampionDetailQuery: typeof useGetMatchChampionDetailQueryFB;
}

/** 模块级缓存：每个场馆的服务对象只创建一次 */
const venueServiceCache = new Map<string, VenueService>();

/**
 * 按 sport.venue 返回对应场馆 Hooks
 */
export const useVenueService = (): VenueService => {
  const venue = useAppSelector((state) => state.sport.venue);

  return useMemo(() => {
    if (venueServiceCache.has(venue)) {
      return venueServiceCache.get(venue)!;
    }

    const service: VenueService =
      venue === EVenue.OB
        ? {
            useGetRecommendMatchQuery: useGetListByPopularEventsLiveQueryOB,
            useGetMenuListQuery: useGetMenuListQueryOB,
            useGetMainListQuery: useGetListQueryOB,
            // OB 签名兼容 FB（type + sportId）；内部用 sportId→euid
            useGetLeaguesQuery: useGetLeaguesQueryOB,
            useGetHotLeagueList: useGetHotLeagueListOB,
            useNoticeListQuery: useFBNoticeListQuery,
            useGetMatchChampionDetailQuery: useGetMatchChampionDetailQueryOB,
          }
        : {
            useGetRecommendMatchQuery: useGetListByPopularEventsLiveQueryFB,
            useGetMenuListQuery: useGetStatisticalQueryFB,
            useGetMainListQuery: useGetListQueryFB,
            useGetLeaguesQuery: useGetLeaguesQueryFB,
            useGetHotLeagueList: useGetHotLeagueListFB,
            useNoticeListQuery: useFBNoticeListQuery,
            useGetMatchChampionDetailQuery: useGetMatchChampionDetailQueryFB,
          };

    venueServiceCache.set(venue, service);
    return service;
  }, [venue]);
};
