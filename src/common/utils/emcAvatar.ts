/** 项目统一默认头像 */
export const DEFAULT_AVATAR_SRC = '/images/common/mine/avatar/avatar_default.webp';

export const DEFAULT_EMC_AVATAR_ID = '0';

/** @deprecated 请使用 DEFAULT_AVATAR_SRC */
export const DEFAULT_EMC_AVATAR_SRC = DEFAULT_AVATAR_SRC;

export type EmcAvatarTabKey = 'football' | 'basketball' | 'others';

export interface EmcAvatarCategory {
  key: EmcAvatarTabKey;
  label: string;
  avatarIds: string[];
}

export const EMC_AVATAR_CATEGORIES: EmcAvatarCategory[] = [
  {
    key: 'football',
    label: '足球',
    avatarIds: Array.from({ length: 10 }, (_, index) => `${index}`),
  },
  {
    key: 'basketball',
    label: '篮球',
    avatarIds: Array.from({ length: 12 }, (_, index) => `${index + 10}`),
  },
  {
    key: 'others',
    label: '其他',
    avatarIds: Array.from({ length: 29 }, (_, index) => `${index + 22}`),
  },
];

/**
 * 将 EMC 头像 id 转换为当前项目可展示的图片地址。
 * 无有效 id 时返回统一默认头像 avatar_default.webp。
 */
export const resolveEmcAvatarSrc = (avatarId?: string | null): string => {
  const trimmed = avatarId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return DEFAULT_AVATAR_SRC;
  }
  return `/images/common/mine/avatar-emc/header_${trimmed}.png`;
};

/**
 * 从当前图片地址中反解 EMC 头像 id。
 */
export const resolveEmcAvatarIdFromSrc = (src?: string | null): string | null => {
  if (!src) return null;
  const match = src.match(/header_(\d+)\.png$/);
  return match?.[1] ?? null;
};
