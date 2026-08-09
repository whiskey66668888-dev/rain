import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/hooks';
import { setIsSimpleOddsAction } from '@/core/store/slices/sportSlice';
import { setAcceptOddsPreferAction, setAutoFollowMatchAction } from '@/core/store/slices/userSlice';
import type { EAcceptOddsPrefer } from '@/apis/commonSports/constants';
import { useMemoizedFn } from 'ahooks';
import {
  mapAcceptOddsPreferToBettingSettings,
  mapBooleanToAutomaticFollow,
  mapBooleanToGoalBell,
  mapBooleanToSynchronousSingleString,
  mapIsSimpleOddsToBettingStyle,
  useMemberSettingActions,
} from '../memberSettingsBridge';

export const useSportSettings = () => {
  const dispatch = useAppDispatch();
  const { updateManagedSetting } = useMemberSettingActions();

  const toggleSyncSingleParlay = useCallback(
    (syncSingleParlay: boolean) => {
      void updateManagedSetting(
        'synchronousSingleString',
        mapBooleanToSynchronousSingleString(syncSingleParlay),
      );
    },
    [updateManagedSetting],
  );

  const setAcceptOddsPrefer = useCallback(
    (value: EAcceptOddsPrefer) => {
      dispatch(setAcceptOddsPreferAction(value));
      void updateManagedSetting('bettingSettings', mapAcceptOddsPreferToBettingSettings(value));
    },
    [dispatch, updateManagedSetting],
  );

  // 更改专业版赔率状态
  const toggleIsSimpleOdds = useMemoizedFn((isSimpleOdds: boolean) => {
    dispatch(setIsSimpleOddsAction(isSimpleOdds));
    void updateManagedSetting('bettingStyle', mapIsSimpleOddsToBettingStyle(isSimpleOdds));
  });

  // 更改进球铃声状态
  const toggleIsOpenGoalSound = useMemoizedFn((isOpenGoalSound: boolean) => {
    void updateManagedSetting('goalBell', mapBooleanToGoalBell(isOpenGoalSound));
  });

  // 更改投注成功后自动关注赛事状态
  const toggleAutoFollowMatch = useMemoizedFn((autoFollowMatch: boolean) => {
    dispatch(setAutoFollowMatchAction(autoFollowMatch));
    void updateManagedSetting('automaticFollow', mapBooleanToAutomaticFollow(autoFollowMatch));
  });

  return {
    toggleSyncSingleParlay,
    setAcceptOddsPrefer,
    toggleIsSimpleOdds,
    toggleIsOpenGoalSound,
    toggleAutoFollowMatch,
  };
};
