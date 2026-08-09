import { GUEST_MEMBER_SETTINGS_KEY } from '@/utils/constants/cacheKey';

export interface GuestMemberSettings {
  appNotice?: boolean;
  appearanceStyle?: number;
  automaticFollow?: number;
  autoCashMode?: boolean;
  balanceSwitch?: boolean;
  bettingOddsSettings?: number;
  bettingSettings?: number;
  bettingStyle?: number;
  emailNotice?: boolean;
  fontSize?: number;
  goalBell?: number;
  nightModel?: boolean;
  pictureCardStyle?: number;
  shock?: number;
  smsStatus?: boolean;
  sportsProbability?: number;
  synchronousSingleString?: number;
  testPlay?: boolean;
  userAvatar?: string | null;
}

/**
 * 读取未登录用户的系统配置草稿。
 */
export const readGuestMemberSettings = (): GuestMemberSettings => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(GUEST_MEMBER_SETTINGS_KEY);
  return raw ? (JSON.parse(raw) as GuestMemberSettings) : {};
};

/**
 * 覆盖保存未登录用户的系统配置草稿。
 */
export const writeGuestMemberSettings = (settings: GuestMemberSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_MEMBER_SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * 增量更新未登录用户的系统配置草稿。
 */
export const patchGuestMemberSettings = (
  patch: Partial<GuestMemberSettings>,
): GuestMemberSettings => {
  const nextSettings = {
    ...readGuestMemberSettings(),
    ...patch,
  };
  writeGuestMemberSettings(nextSettings);
  return nextSettings;
};
