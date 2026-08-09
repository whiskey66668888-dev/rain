import { useEffect, useMemo, useState } from 'react';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import {
  useDiscoverMatchInfoQuery,
  useMarketOddsListQuery,
  type MarketOddsMatchScope,
} from '@/apis/origin/discover';
import type { MarketOddsListParams } from '@/apis/origin/discover/marketOddsTypes';
import { useAppSelector } from '@/core/store/hooks';

import { BASKETBALL_TABS, FOOTBALL_TABS, INDEX_COMPANIES } from '../constants';
import type { EntryOddRowType } from '../types';
import {
  buildDisplayRowTypes,
  buildVisibleCompanyRows,
  defaultSelectedCompanyIds,
  getHeaderTitles,
  venueToApiPlatform,
} from '../utils/indexOddsLogic';

export const useIndexOdds = (
  scheduleId: string | null,
  sportId?: number,
  matchId?: string | null,
) => {
  const venue = useAppSelector((state) => state.sport.venue);
  const resolvedSportId = sportId === Number(FBSportIdValue.Basketball) ? 2 : 1;
  const tabs = resolvedSportId === 1 ? FOOTBALL_TABS : BASKETBALL_TABS;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullTime, setIsFullTime] = useState(true);
  const [initialSelected, setInitialSelected] = useState(false);
  const [preMatchSelected, setPreMatchSelected] = useState(false);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(() =>
    defaultSelectedCompanyIds(),
  );
  const [displayEditorVisible, setDisplayEditorVisible] = useState(false);
  const [historyCompanyId, setHistoryCompanyId] = useState<string | null>(null);

  const activeTab = tabs[Math.min(activeIndex, tabs.length - 1)] ?? tabs[0]!;
  const matchDataScope: MarketOddsMatchScope = isFullTime ? 'full' : 'half';
  const apiPlatform = venueToApiPlatform(venue);
  // marketOdds 与 App 一致：使用场馆 matchId，而不是纳米 scheduleId
  const marketMatchId = matchId || scheduleId;

  const listParams = useMemo((): MarketOddsListParams | null => {
    if (!marketMatchId) return null;
    return {
      matchId: marketMatchId,
      platform: apiPlatform,
      matchDataScope,
      playType: activeTab.playType,
    };
  }, [activeTab.playType, apiPlatform, matchDataScope, marketMatchId]);

  const {
    data: oddsList = [],
    isPending,
    isFetching,
  } = useMarketOddsListQuery(listParams, !!marketMatchId);
  // 仅首次无数据时展示骨架；轮询 refetch 用 isFetching，避免整页/弹窗闪烁
  const isLoading = isPending && isFetching;
  const { data: matchInfo } = useDiscoverMatchInfoQuery(scheduleId, !!scheduleId, resolvedSportId);

  const isLive = matchInfo?.match_state !== '1';

  useEffect(() => {
    if (activeIndex >= tabs.length) setActiveIndex(0);
  }, [activeIndex, tabs.length]);

  const rowTypes = useMemo<EntryOddRowType[]>(
    () => buildDisplayRowTypes(!!isLive, initialSelected, preMatchSelected),
    [initialSelected, isLive, preMatchSelected],
  );

  const companyRows = useMemo(
    () =>
      buildVisibleCompanyRows({
        list: oddsList,
        venue,
        selectedCompanyIds,
        sportId: resolvedSportId,
        tabKey: activeTab.key,
      }),
    [activeTab.key, oddsList, resolvedSportId, selectedCompanyIds, venue],
  );

  const headerTitles = useMemo(
    () => getHeaderTitles(resolvedSportId, activeTab.key),
    [activeTab.key, resolvedSportId],
  );

  const historyEntry = useMemo(() => {
    if (!historyCompanyId) return null;
    return companyRows.find((row) => row.companyId === historyCompanyId) ?? null;
  }, [companyRows, historyCompanyId]);

  const historyOddsItem = useMemo(() => {
    if (!historyCompanyId) return null;
    const company = INDEX_COMPANIES.find((item) => item.id === historyCompanyId);
    if (!company) return null;
    return oddsList.find((item) => item.platform === company.apiPlatform) ?? null;
  }, [historyCompanyId, oddsList]);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const handlePeriodChange = (fullTime: boolean) => {
    setIsFullTime(fullTime);
  };

  const toggleCompanySelected = (companyId: string) => {
    setSelectedCompanyIds((prev) => {
      if (prev.includes(companyId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== companyId);
      }
      return [...prev, companyId];
    });
  };

  return {
    resolvedSportId,
    tabs,
    activeIndex,
    activeTab,
    isFullTime,
    isLive: !!isLive,
    isLoading,
    rowTypes,
    companyRows,
    headerTitles,
    initialSelected,
    preMatchSelected,
    setInitialSelected,
    setPreMatchSelected,
    selectedCompanyIds,
    toggleCompanySelected,
    displayEditorVisible,
    setDisplayEditorVisible,
    historyCompanyId,
    setHistoryCompanyId,
    historyEntry,
    historyOddsItem,
    matchDataScope: matchDataScope,
    playType: activeTab.playType,
    handleTabChange,
    handlePeriodChange,
  };
};
