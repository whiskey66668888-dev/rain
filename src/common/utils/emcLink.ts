import { generatePath } from 'react-router-dom';

import { PATHS } from '@/sites/op7/routes/paths';

/** VIP 专属活动 ID 范围（346~350），用于隐藏收藏按钮 */
export const isVipExclusiveActivityId = (id: string | number): boolean => {
  const num = Number(id);
  return Number.isFinite(num) && num >= 346 && num <= 350;
};

/** 本地开发展示用域名：取 site.config 当前环境 baseUrl，避免展示 localhost */
const getEmcLinkOrigin = (): string => {
  const isLocalhost =
    typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  const isDev = typeof __NODE_ENV__ !== 'undefined' && __NODE_ENV__ === 'development';

  if (isLocalhost || isDev) {
    const baseUrl = (__SITE_CONFIG__?.api?.baseUrl || '').replace(/\/$/, '');
    if (baseUrl) return baseUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return (__SITE_CONFIG__?.api?.baseUrl || '').replace(/\/$/, '');
};

export interface BuildEmcActivityLinkOptions {
  activityId: string | number;
  isMobile: boolean;
  origin?: string;
}

export interface EmcActivityLink {
  activityId: string;
  href: string;
  path: string;
}

export const buildEmcActivityLink = ({
  activityId,
  isMobile,
  origin = getEmcLinkOrigin(),
}: BuildEmcActivityLinkOptions): EmcActivityLink => {
  const id = String(activityId);
  const path = isMobile
    ? generatePath(PATHS.discountDetail, { id })
    : generatePath(PATHS.PcDiscountDetail, { id });
  const href = `${origin.replace(/\/$/, '')}/zh${path}`;

  return { activityId: id, href, path };
};

export interface FormatEmcRichTextOptions {
  isMobile: boolean;
  origin?: string;
}

/**
 * 按路径识别活动详情链接，不绑定具体域名。
 * 兼容任意 host + trailing slash / query / hash，例如：
 * https://xxx.com/h5/discountDetails/349?channel=h5#detail
 */
export const parseEmcDiscountActivityId = (url: string): string | null => {
  const raw = url.trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const match = /^\/h5\/discountDetails\/(\d+)\/?$/i.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    const match =
      /^https?:\/\/[^/\s]+\/h5\/discountDetails\/(\d+)(?:\/)?(?:\?[^#\s]*)?(?:#.*)?$/i.exec(raw);
    return match?.[1] ?? null;
  }
};
