import { useCallback, useEffect, useMemo, useState } from 'react';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { OBSportIdValue } from '@/apis/obSports/common/constants';
import {
  getDiscoverVenueType,
  useDiscoverChatConfigQuery,
  useDiscoverMatchTabsQuery,
  useDiscoverNmMatchIdQuery,
  useOpenImConfigQuery,
  type ChatConfigInfo,
} from '@/apis/origin/discover';

import { DISCOVER_TAB_LABEL } from '../components/discover/constants';
import {
  getDefaultDiscoverSubTabIndex,
  getDiscoverSubTabs,
} from '../components/discover/utils/getDiscoverSubTabs';

export interface UseDiscoverTabOptions {
  matchId: string;
  sportId?: number;
  /** 场馆：决定 nm_match_id 的 type（1=OB 2=FB） */
  venue?: string | null;
}

export interface UseDiscoverTabResult {
  /** 是否展示一级「发现」tab（与 App 3.14 需求一致，固定展示） */
  showDiscoverTab: boolean;
  discoverTabLabel: string;
  chatConfig: ChatConfigInfo | null | undefined;
  /** 接口返回的可用子 tab；null=未加载/失败时默认全部展示 */
  discoverEnabledSubTabTitles: string[] | null;
  /** 纳米 schedule_id，供发现页各子模块使用 */
  resultMatchId: string | null;
  isDiscoverBooting: boolean;
  isDiscoverStateReady: boolean;
  discoverSubTabIndex: number;
  discoverSubTabs: string[];
  onDiscoverSubTabChanged: (index: number) => void;
  clearDiscoverSubTabState: () => void;
}

const getDiscoverSportType = (sportId?: number): number | null => {
  const normalizedSportId = Number(sportId);
  if (
    normalizedSportId === Number(FBSportIdValue.Football) ||
    normalizedSportId === Number(OBSportIdValue.Football)
  ) {
    return 1;
  }
  if (
    normalizedSportId === Number(FBSportIdValue.Basketball) ||
    normalizedSportId === Number(OBSportIdValue.Basketball)
  ) {
    return 2;
  }
  return null;
};

/**
 * 赛事详情「发现」tab 逻辑
 */
export const useDiscoverTab = ({
  matchId,
  sportId,
  venue,
}: UseDiscoverTabOptions): UseDiscoverTabResult => {
  const discoverSportType = getDiscoverSportType(sportId);
  const discoverVenueType = getDiscoverVenueType(venue);
  const isSupportedSport = discoverSportType !== null && !!matchId;
  // 对齐 Flutter getSportType：全站只有一个公共聊天室，配置统一用足球 sport_type=1
  const chatConfigSportType = isSupportedSport ? 1 : null;

  const { data: openImReady, isLoading: isOpenImLoading } = useOpenImConfigQuery(isSupportedSport);

  const { data: chatConfig, isLoading: isChatConfigLoading } = useDiscoverChatConfigQuery(
    chatConfigSportType,
    isSupportedSport && openImReady === true,
  );

  const shouldFetchNmMatchId = isSupportedSport && openImReady === true;
  const shouldFetchMatchTabs = shouldFetchNmMatchId;

  const { data: resultMatchId, isLoading: isNmMatchIdLoading } = useDiscoverNmMatchIdQuery(
    matchId,
    discoverVenueType,
    shouldFetchNmMatchId,
  );

  const { data: discoverEnabledSubTabTitles, isLoading: isMatchTabsLoading } =
    useDiscoverMatchTabsQuery(
      resultMatchId ?? null,
      discoverSportType,
      shouldFetchMatchTabs && !!resultMatchId,
    );

  const [discoverSubTabIndex, setDiscoverSubTabIndex] = useState(0);

  const isDiscoverBooting = useMemo(
    () =>
      isSupportedSport &&
      (isOpenImLoading || isChatConfigLoading || isNmMatchIdLoading || isMatchTabsLoading),
    [
      isSupportedSport,
      isOpenImLoading,
      isChatConfigLoading,
      isNmMatchIdLoading,
      isMatchTabsLoading,
    ],
  );

  const isDiscoverStateReady = !isSupportedSport || !isDiscoverBooting;

  const resolvedSubTabTitles = useMemo((): string[] | null => {
    if (!isSupportedSport) return null;
    if (!shouldFetchMatchTabs) return [];
    if (discoverEnabledSubTabTitles === undefined) return null;
    return discoverEnabledSubTabTitles;
  }, [discoverEnabledSubTabTitles, isSupportedSport, shouldFetchMatchTabs]);

  const discoverSubTabs = useMemo(
    () =>
      getDiscoverSubTabs({
        enabledSubTabTitles: resolvedSubTabTitles,
        sportId,
        resultMatchId: resultMatchId ?? null,
      }),
    [resolvedSubTabTitles, resultMatchId, sportId],
  );

  const clearDiscoverSubTabState = useCallback(() => {
    setDiscoverSubTabIndex(getDefaultDiscoverSubTabIndex(discoverSubTabs));
  }, [discoverSubTabs]);

  useEffect(() => {
    setDiscoverSubTabIndex(getDefaultDiscoverSubTabIndex(discoverSubTabs));
  }, [matchId, discoverSubTabs]);

  const onDiscoverSubTabChanged = useCallback((index: number) => {
    setDiscoverSubTabIndex((prev) => (prev === index ? prev : index));
  }, []);

  return {
    showDiscoverTab: true,
    discoverTabLabel: DISCOVER_TAB_LABEL,
    chatConfig,
    discoverEnabledSubTabTitles: resolvedSubTabTitles,
    resultMatchId: resultMatchId ?? null,
    isDiscoverBooting,
    isDiscoverStateReady,
    discoverSubTabIndex,
    discoverSubTabs,
    onDiscoverSubTabChanged,
    clearDiscoverSubTabState,
  };
};
