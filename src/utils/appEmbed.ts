import Cookies from 'js-cookie';

import { COOKIE_EXPIRES, TOKEN_KEY } from '@/utils/constants/cacheKey';
import { safeGetSessionString, safeSetSessionString } from '@/utils/storage/webStorage';

const EMBEDDED_SESSION_KEY = 'op7:embeddedInApp';

const TRUTHY = new Set(['1', 'true', 'yes']);

const isTruthyQuery = (value: string | null): boolean => {
  if (!value) return false;
  return TRUTHY.has(decodeURIComponent(value).trim().toLowerCase());
};

/** 当前 URL 是否带「App / 马甲包内嵌」标记 */
const hasEmbeddedQuery = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return (
    isTruthyQuery(params.get('isApp')) ||
    isTruthyQuery(params.get('hidePwa')) ||
    isTruthyQuery(params.get('inApp'))
  );
};

/**
 * H5 是否运行在 App / 马甲包 WebView 内（不绑定 Flutter，任意原生壳均可）
 *
 * 约定（满足其一即可）：
 * 1. 首屏 URL：`?isApp=1` / `?hidePwa=1` / `?inApp=1`（SPA 内跳转后会写入 sessionStorage）
 * 2. 原生注入：`window.__OP7_IN_APP__ = true` 或 `window.__OP7_HIDE_PWA__ = true`
 */
export const isEmbeddedInNativeApp = (): boolean => {
  if (window.__OP7_IN_APP__ === true || window.__OP7_HIDE_PWA__ === true) {
    return true;
  }

  if (safeGetSessionString(EMBEDDED_SESSION_KEY) === '1') {
    return true;
  }

  if (hasEmbeddedQuery()) {
    safeSetSessionString(EMBEDDED_SESSION_KEY, '1');
    return true;
  }

  return false;
};

/** 是否展示 PWA 安装入口（侧栏 + H5 底部横幅） */
export const shouldShowPwaInstallEntry = (): boolean => !isEmbeddedInNativeApp();

const APP_URL_TOKEN_SESSION_KEY = 'op7:appUrlToken';
const LEGACY_INVITE_FRIENDS_APP_TOKEN_KEY = 'op7:inviteFriendsAppToken';

/** 从 URL 解析 token */
export const getTokenFromSearch = (search?: string): string | null => {
  const params = new URLSearchParams((search ?? window.location.search).replace(/^\?/, ''));
  const token = params.get('token')?.trim();
  return token || null;
};

/**
 * URL 带 token 时写入 Cookie / session，供接口鉴权（SPA 跳转后 URL 可能不再带 token）
 */
export const persistAppAuthFromUrl = (search?: string): void => {
  const token = getTokenFromSearch(search);
  if (!token) return;
  safeSetSessionString(APP_URL_TOKEN_SESSION_KEY, token);
  Cookies.set(TOKEN_KEY, token, { expires: COOKIE_EXPIRES });
};

/** 当前是否具备 App token 会话（URL、Cookie 或 session 备份） */
export const hasAppAuthToken = (search?: string): boolean => {
  if (getTokenFromSearch(search)) return true;
  const fromCookie = Cookies.get(TOKEN_KEY)?.trim();
  if (fromCookie) return true;
  return !!(
    safeGetSessionString(APP_URL_TOKEN_SESSION_KEY)?.trim() ||
    safeGetSessionString(LEGACY_INVITE_FRIENDS_APP_TOKEN_KEY)?.trim()
  );
};
