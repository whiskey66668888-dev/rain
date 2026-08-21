import { useCallback, useEffect, useRef } from 'react';

import {
  BETTING_ODDS_SETTINGS_TO_ODDS_TYPE,
  EAcceptOddsPrefer,
  EOddsType,
  ODDS_TYPE_TO_BETTING_ODDS_SETTINGS,
} from '@/apis/commonSports/constants';
import { editMemberSet } from '@/apis/origin/finance/transfer';
import { MemberSettingVo, memberSettingInitializeReq } from '@/apis/origin/member/memberSetting';
import type { TMemberInfoResp } from '@/apis/origin/member/membetInfo';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import {
  GuestMemberSettings,
  patchGuestMemberSettings,
  readGuestMemberSettings,
} from '@/common/hooks/guestMemberSettings';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setSystemConfig, ThemeMode } from '@/core/store/slices/configSlice';
import {
  setSyncSingleParlayAction,
  setIsSimpleOddsAction,
  setIsOpenGoalSoundAction,
  setCurrentOddsTypeAction,
} from '@/core/store/slices/sportSlice';
import {
  setAcceptOddsPreferAction,
  setAutoFollowMatchAction,
  setUserAvatar,
} from '@/core/store/slices/userSlice';
import {
  DEFAULT_EMC_AVATAR_ID,
  resolveEmcAvatarIdFromSrc,
  resolveEmcAvatarSrc,
} from '@/common/utils/emcAvatar';
import { safeSetLocalString } from '@/utils/storage/webStorage';
import { FontScaleType } from '@/utils/constants/system';
import { hasAppAuthToken } from '@/utils/appEmbed';
import { getSystemTheme } from '@/utils';

export type ManagedMemberSettingKey = keyof GuestMemberSettings;

type MemberSettingValue = GuestMemberSettings[ManagedMemberSettingKey];

const MEMBER_SETTING_KEYS: ManagedMemberSettingKey[] = [
  'appNotice',
  'appearanceStyle',
  'automaticFollow',
  'autoCashMode',
  'balanceSwitch',
  'bettingOddsSettings',
  'bettingSettings',
  'bettingStyle',
  'emailNotice',
  'fontSize',
  'goalBell',
  'nightModel',
  'pictureCardStyle',
  'shock',
  'smsStatus',
  'sportsProbability',
  'synchronousSingleString',
  'testPlay',
  'userAvatar',
];

const FLAG_SETTING_KEYS: ManagedMemberSettingKey[] = [
  'smsStatus',
  'appNotice',
  'emailNotice',
  'testPlay',
  'nightModel',
  'balanceSwitch',
  'autoCashMode',
];

/**
 * 判断当前配置字段在 editMemberSet 中应走 flag 还是 value 传参。
 */
export const isFlagSettingKey = (key: ManagedMemberSettingKey): boolean =>
  FLAG_SETTING_KEYS.includes(key);

/**
 * 将后端字号枚举转换为前端实际使用的字体缩放值。
 */
export const mapMemberFontSizeToFontScaleType = (fontSize?: number | null): FontScaleType => {
  switch (fontSize) {
    case 2:
      return FontScaleType.MEDIUM;
    case 3:
      return FontScaleType.LARGE;
    case 1:
    default:
      return FontScaleType.NORMAL;
  }
};

/**
 * 将前端字体缩放值转换为后端保存的字号枚举。
 */
export const mapFontScaleTypeToMemberFontSize = (fontScaleType: FontScaleType): number => {
  switch (fontScaleType) {
    case FontScaleType.MEDIUM:
      return 2;
    case FontScaleType.LARGE:
      return 3;
    case FontScaleType.NORMAL:
    default:
      return 1;
  }
};

/**
 * 将后端外观样式枚举转换为前端主题模式。
 */
export const mapMemberAppearanceStyleToThemeMode = (appearanceStyle?: number | null): ThemeMode => {
  const style =
    appearanceStyle === null || appearanceStyle === undefined ? null : Number(appearanceStyle);
  if (Number.isNaN(style)) return 'system';
  switch (style) {
    case 2:
      return 'light';
    case 3:
      return 'dark';
    case 1:
    default:
      return 'system';
  }
};

/**
 * 将前端主题模式转换为后端外观样式枚举。
 */
export const mapThemeModeToMemberAppearanceStyle = (themeMode: ThemeMode): number => {
  switch (themeMode) {
    case 'light':
      return 2;
    case 'dark':
      return 3;
    case 'system':
    default:
      return 1;
  }
};

/**
 * 将前端主题模式转换为后端夜间模式布尔值。
 * 约定：只有 dark 视为开启夜间模式，其余模式都按关闭处理。
 */
export const mapThemeModeToNightModel = (themeMode: ThemeMode): boolean => themeMode === 'dark';

/**
 * 将后端夜间模式布尔值转换为前端主题模式。
 */
export const mapNightModelToThemeMode = (nightModel?: boolean | null): ThemeMode =>
  nightModel ? 'dark' : 'light';

/**
 * 将后端投注设置映射为现有投注偏好枚举。
 */
export const mapBettingSettingsToAcceptOddsPrefer = (
  bettingSettings?: number | null,
): EAcceptOddsPrefer => {
  switch (bettingSettings) {
    case 2:
      return EAcceptOddsPrefer.No;
    case 3:
      return EAcceptOddsPrefer.Any;
    case 1:
    default:
      return EAcceptOddsPrefer.Better;
  }
};

/**
 * 将投注偏好枚举映射为后端投注设置值。
 */
export const mapAcceptOddsPreferToBettingSettings = (
  acceptOddsPrefer: EAcceptOddsPrefer,
): number => {
  switch (acceptOddsPrefer) {
    case EAcceptOddsPrefer.No:
      return 2;
    case EAcceptOddsPrefer.Any:
      return 3;
    case EAcceptOddsPrefer.Better:
    default:
      return 1;
  }
};

/**
 * 后端盘口设置（1 欧洲盘 / 2 香港盘）→ 前端盘口枚举，脏值一律回落欧洲盘。
 */
export const mapBettingOddsSettingsToOddsType = (value?: number | null): EOddsType =>
  BETTING_ODDS_SETTINGS_TO_ODDS_TYPE[Number(value)] ?? EOddsType.EU;

/**
 * 前端盘口枚举 → 后端盘口设置值。
 */
export const mapOddsTypeToBettingOddsSettings = (oddsType: EOddsType): number =>
  ODDS_TYPE_TO_BETTING_ODDS_SETTINGS[oddsType];

export const mapBooleanToGoalBell = (checked: boolean): number => (checked ? 1 : 0);
export const mapGoalBellToBoolean = (goalBell?: number | null): boolean => goalBell === 1;
export const mapBooleanToAutomaticFollow = (checked: boolean): number => (checked ? 1 : 0);
export const mapAutomaticFollowToBoolean = (value?: number | null): boolean => value === 1;
export const mapBooleanToSynchronousSingleString = (checked: boolean): number => (checked ? 1 : 0);
export const mapSynchronousSingleStringToBoolean = (value?: number | null): boolean => value === 1;
export const mapBooleanToShock = (checked: boolean): number => (checked ? 1 : 0);
export const mapShockToBoolean = (value?: number | null): boolean => value === 1;
export const mapBooleanToSportsProbability = (checked: boolean): number => (checked ? 1 : 0);
export const mapSportsProbabilityToBoolean = (value?: number | null): boolean => value === 1;
export const mapIsSimpleOddsToBettingStyle = (isSimpleOdds: boolean): number =>
  isSimpleOdds ? 2 : 1;
export const mapBettingStyleToIsSimpleOdds = (bettingStyle?: number | null): boolean =>
  bettingStyle === 2;
export const mapEntertainmentCardStyleToPictureCardStyle = (value: 'color' | 'mono'): number =>
  value === 'mono' ? 1 : 2;
export const mapPictureCardStyleToEntertainmentCardStyle = (
  pictureCardStyle?: number | null,
): 'color' | 'mono' => (pictureCardStyle === 1 ? 'mono' : 'color');

/**
 * 将字体缩放同步到文档根节点。
 */
export const applyFontScaleTypeToDocument = (fontScaleType: FontScaleType): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--text-scale', fontScaleType.toString());
  document.documentElement.setAttribute('data-text-scale', fontScaleType.toString());
};

/**
 * 将主题模式同步到文档根节点。
 */
export const applyThemeModeToDocument = (
  themeMode: ThemeMode,
  resolvedThemeMode: Exclude<ThemeMode, 'system'>,
): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolvedThemeMode);
  document.documentElement.setAttribute('data-prefers-color-scheme', resolvedThemeMode);
  safeSetLocalString('themeMode', resolvedThemeMode);
  safeSetLocalString('memberThemeMode', themeMode);
};

/**
 * 将某个设置值同步回现有 sport/user/config 运行态。
 */
export const applyMemberSettingToRuntime = (
  dispatch: ReturnType<typeof useAppDispatch>,
  modelName: ManagedMemberSettingKey,
  value: MemberSettingValue,
): void => {
  switch (modelName) {
    case 'appearanceStyle': {
      const themeMode = mapMemberAppearanceStyleToThemeMode(value as number | null | undefined);
      const resolvedThemeMode: Exclude<ThemeMode, 'system'> =
        themeMode === 'system' ? getSystemTheme() : themeMode;
      void dispatch(setSystemConfig({ themeMode }));
      applyThemeModeToDocument(themeMode, resolvedThemeMode);
      return;
    }
    case 'nightModel': {
      const themeMode = mapNightModelToThemeMode(value as boolean | null | undefined);
      const resolvedThemeMode: Exclude<ThemeMode, 'system'> =
        themeMode === 'system' ? getSystemTheme() : themeMode;
      void dispatch(setSystemConfig({ themeMode }));
      applyThemeModeToDocument(themeMode, resolvedThemeMode);
      return;
    }
    case 'fontSize': {
      const fontScaleType = mapMemberFontSizeToFontScaleType(
        (value as number | null | undefined) ?? 1,
      );
      void dispatch(setSystemConfig({ fontScaleType }));
      applyFontScaleTypeToDocument(fontScaleType);
      return;
    }
    case 'appNotice':
      void dispatch(setSystemConfig({ appNotification: Boolean(value) }));
      return;
    case 'emailNotice':
      void dispatch(setSystemConfig({ emailNotification: Boolean(value) }));
      return;
    case 'smsStatus':
      void dispatch(setSystemConfig({ smsNotification: Boolean(value) }));
      return;
    case 'testPlay':
      void dispatch(setSystemConfig({ trialInterface: Boolean(value) }));
      return;
    case 'pictureCardStyle':
      void dispatch(
        setSystemConfig({
          entertainmentCardStyle: mapPictureCardStyleToEntertainmentCardStyle(
            value as number | null | undefined,
          ),
        }),
      );
      return;
    case 'bettingSettings':
      dispatch(
        setAcceptOddsPreferAction(
          mapBettingSettingsToAcceptOddsPrefer(value as number | null | undefined),
        ),
      );
      return;
    case 'automaticFollow':
      dispatch(
        setAutoFollowMatchAction(mapAutomaticFollowToBoolean(value as number | null | undefined)),
      );
      return;
    case 'goalBell':
      dispatch(setIsOpenGoalSoundAction(mapGoalBellToBoolean(value as number | null | undefined)));
      return;
    case 'bettingStyle':
      dispatch(
        setIsSimpleOddsAction(mapBettingStyleToIsSimpleOdds(value as number | null | undefined)),
      );
      return;
    case 'bettingOddsSettings':
      dispatch(
        setCurrentOddsTypeAction(
          mapBettingOddsSettingsToOddsType(value as number | null | undefined),
        ),
      );
      return;
    case 'synchronousSingleString':
      dispatch(
        setSyncSingleParlayAction(
          mapSynchronousSingleStringToBoolean(value as number | null | undefined),
        ),
      );
      return;
    case 'userAvatar':
      dispatch(setUserAvatar(resolveEmcAvatarSrc(value as string | null | undefined)));
      return;
    default:
      return;
  }
};

const isNil = (value: unknown): value is null | undefined => value === null || value === undefined;

/**
 * 将会员信息里已设置的配置同步回现有运行态 store。
 */
export const syncMemberInfoToRuntime = (
  dispatch: ReturnType<typeof useAppDispatch>,
  memberInfo: TMemberInfoResp,
): void => {
  MEMBER_SETTING_KEYS.forEach((key) => {
    if (key === 'nightModel' && !isNil(memberInfo.appearanceStyle)) {
      return;
    }
    if (!isNil(memberInfo[key])) {
      applyMemberSettingToRuntime(dispatch, key, memberInfo[key]);
    }
  });
};

/**
 * 基于游客配置构建初始化后端所需的字段列表。
 */
export const buildInitializeParams = (
  memberInfo: TMemberInfoResp,
  guestSettings: GuestMemberSettings,
): MemberSettingVo[] => {
  return MEMBER_SETTING_KEYS.reduce<MemberSettingVo[]>((acc, key) => {
    if (isNil(memberInfo[key]) && !isNil(guestSettings[key])) {
      const rawValue =
        key === 'userAvatar'
          ? (resolveEmcAvatarIdFromSrc(guestSettings[key]) ??
            guestSettings[key] ??
            DEFAULT_EMC_AVATAR_ID)
          : guestSettings[key];
      acc.push({
        modelName: key,
        value: String(rawValue),
      });
    }
    return acc;
  }, []);
};

/**
 * 统一处理系统配置更新：未登录写游客草稿，已登录写会员接口。
 */
export function useMemberSettingActions() {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { getMemberInfo } = useGetMemberInfo();

  const updateManagedSetting = useCallback(
    async (modelName: ManagedMemberSettingKey, value: MemberSettingValue) => {
      applyMemberSettingToRuntime(dispatch, modelName, value);

      if (!isLogin) {
        patchGuestMemberSettings({ [modelName]: value });
        return;
      }

      if (isFlagSettingKey(modelName)) {
        await editMemberSet({ modelName, flag: Boolean(value) });
      } else {
        const normalizedValue =
          modelName === 'userAvatar'
            ? (resolveEmcAvatarIdFromSrc(value as string | null | undefined) ??
              (value as string | null | undefined) ??
              DEFAULT_EMC_AVATAR_ID)
            : String(value ?? '');
        await editMemberSet({ modelName, value: normalizedValue });
      }
      await getMemberInfo({ isLoading: false });
    },
    [dispatch, getMemberInfo, isLogin],
  );

  return {
    updateManagedSetting,
  };
}

/**
 * 登录后：后端有值则覆盖运行态；后端为空且游客曾设置，则初始化后端后重新拉取。
 */
/** 是否已具备会员身份，可将 /api/member/info 同步到本地 SYSTEM_CONFIG */
export const canSyncMemberSettingsFromInfo = (
  memberInfo: Pick<TMemberInfoResp, 'id'>,
  isLogin: boolean,
): boolean => !!memberInfo.id && (isLogin || hasAppAuthToken());

export function useSyncMemberSettingsFromInfo(): void {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const memberInfo = useAppSelector((state) => state.user.memberInfo);
  const lastAttemptRef = useRef('');
  const initializingRef = useRef(false);
  const { getMemberInfo } = useGetMemberInfo();

  useEffect(() => {
    if (!canSyncMemberSettingsFromInfo(memberInfo, isLogin)) return;

    syncMemberInfoToRuntime(dispatch, memberInfo);

    const guestSettings = readGuestMemberSettings();
    const params = buildInitializeParams(memberInfo, guestSettings);
    if (params.length === 0) return;

    const signature = `${memberInfo.loginName}:${JSON.stringify(params)}`;
    if (initializingRef.current || lastAttemptRef.current === signature) {
      return;
    }

    lastAttemptRef.current = signature;
    initializingRef.current = true;

    memberSettingInitializeReq(params)
      .then(async () => {
        await getMemberInfo({ isLoading: false });
      })
      .finally(() => {
        initializingRef.current = false;
      });
  }, [dispatch, getMemberInfo, isLogin, memberInfo]);
}
