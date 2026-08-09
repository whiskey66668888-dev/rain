import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { EBetHistoryTab } from '@/apis/commonSports/constants';
import { fbList } from '@/apis/fbSports/common/constants';
import { useFbMatchResultListQuery } from '@/apis/fbSports/betRecord/getFBResultList';
import {
  createDefaultResultSearchConditionValue,
  type ResultSearchConditionValue,
} from '../components/ResultSearchCondition';
import {
  createResultLeagueOptionsFromLgs,
  getEffectiveResultLeagueIds,
  readResultLeagueFilterStorage,
  type ResultLeagueOption,
  writeResultLeagueFilterStorage,
} from '../utils/resultLeagueFilterStorage';

const createInitialResultSearchValue = (): ResultSearchConditionValue => {
  const defaultValue = createDefaultResultSearchConditionValue();
  const storage = readResultLeagueFilterStorage();
  if (!storage) return defaultValue;

  return {
    ...defaultValue,
    dateRange: storage.dateRange ?? defaultValue.dateRange,
    sportId: storage.sportId,
    leagueIds: getEffectiveResultLeagueIds(storage),
  };
};

export const useResultFilter = ({ activeTab }: { activeTab: EBetHistoryTab }) => {
  const location = useLocation();

  // #region state
  const [resultSearchValue, setResultSearchValue] = useState<ResultSearchConditionValue>(() =>
    createInitialResultSearchValue(),
  );
  const [resultLeagueOptions, setResultLeagueOptions] = useState<ResultLeagueOption[]>(() => {
    const storage = readResultLeagueFilterStorage();
    return storage?.leagueOptions ?? [];
  });
  const [resultListCollapsed, setResultListCollapsed] = useState(false);
  // #endregion

  const { data: resultLeagueData } = useFbMatchResultListQuery(
    {
      sportId: resultSearchValue.sportId,
      beginTime: resultSearchValue.dateRange.startTime,
      endTime: resultSearchValue.dateRange.endTime,
      leagueIds: [],
      size: 300,
    },
    { enabled: activeTab !== EBetHistoryTab.RESULTS || resultLeagueOptions.length === 0 },
  );

  // tab 切换或页面回跳时，从 storage 同步最新筛选状态
  useEffect(() => {
    if (activeTab !== EBetHistoryTab.RESULTS) return;

    const storage = readResultLeagueFilterStorage();
    if (!storage) return;

    setResultSearchValue((prev) => ({
      ...prev,
      dateRange: storage.dateRange ?? prev.dateRange,
      sportId: storage.sportId,
      leagueIds: getEffectiveResultLeagueIds(storage),
    }));
    setResultLeagueOptions(storage.leagueOptions ?? []);
  }, [activeTab, location.key]);

  // #region handlers
  const handleResultSearchChange = (value: ResultSearchConditionValue) => {
    setResultSearchValue(value);

    const shouldResetLeagueOptions =
      value.sportId !== resultSearchValue.sportId ||
      value.dateRange.startTime !== resultSearchValue.dateRange.startTime ||
      value.dateRange.endTime !== resultSearchValue.dateRange.endTime;

    if (shouldResetLeagueOptions) {
      setResultLeagueOptions([]);
    }

    const storage = readResultLeagueFilterStorage();
    const sportName =
      storage?.sportName ?? fbList.find((item) => item.id === value.sportId)?.label ?? '足球';

    writeResultLeagueFilterStorage({
      dateRange: value.dateRange,
      sportId: value.sportId,
      sportName,
      mode: value.leagueIds.length > 0 ? 'partial' : 'all',
      leagueIds: value.leagueIds,
      leagueOptions: shouldResetLeagueOptions ? [] : resultLeagueOptions,
      searchText: storage?.searchText ?? '',
      updatedAt: Date.now(),
    });
  };

  const handleResultLeagueOptionsChange = useCallback(
    (options: ResultLeagueOption[]) => {
      setResultLeagueOptions((prev) => {
        const prevKey = JSON.stringify(prev);
        const nextKey = JSON.stringify(options);
        if (prevKey === nextKey) return prev;
        return options;
      });

      const storage = readResultLeagueFilterStorage();
      const sportName =
        storage?.sportName ??
        fbList.find((item) => item.id === resultSearchValue.sportId)?.label ??
        '足球';

      writeResultLeagueFilterStorage({
        dateRange: resultSearchValue.dateRange,
        sportId: resultSearchValue.sportId,
        sportName,
        mode: resultSearchValue.leagueIds.length > 0 ? 'partial' : 'all',
        leagueIds: resultSearchValue.leagueIds,
        leagueOptions: options,
        searchText: storage?.searchText ?? '',
        updatedAt: Date.now(),
      });
    },
    [resultSearchValue],
  );

  const handleCloseResultSearchPanel = useCallback(() => {
    setResultSearchValue((prev) => ({ ...prev, collapsed: true }));
  }, []);

  const toggleResultListCollapsed = useCallback(() => {
    setResultListCollapsed((prev) => !prev);
  }, []);
  // #endregion

  useEffect(() => {
    const leagueOptions = createResultLeagueOptionsFromLgs(resultLeagueData?.pages[0]?.lgs);
    if (leagueOptions.length === 0) return;

    handleResultLeagueOptionsChange(leagueOptions);
  }, [handleResultLeagueOptionsChange, resultLeagueData?.pages]);

  return {
    resultSearchValue,
    resultLeagueOptions,
    resultListCollapsed,
    handleResultSearchChange,
    handleResultLeagueOptionsChange,
    handleCloseResultSearchPanel,
    toggleResultListCollapsed,
  };
};
