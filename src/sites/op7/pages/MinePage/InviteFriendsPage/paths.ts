import Cookies from 'js-cookie';

import { appendPathSearch } from '@/utils/appendPathSearch';
import { isEmbeddedInNativeApp } from '@/utils/appEmbed';
import { COOKIE_EXPIRES, TOKEN_KEY } from '@/utils/constants/cacheKey';
import { safeGetSessionString, safeSetSessionString } from '@/utils/storage/webStorage';

/** 呼朋唤友静态资源（public/images/op7/inviteFriends） */
export function inviteFriendsImg(name: string): string {
  // return `/images/op7/inviteFriends/${name}`;
  return `/images/common/inviteFriends/${name}`;
}

/** 与 Flutter 返回上一呼朋唤友子页时同步的 localStorage 键 */
export const NEW_FRIEND_ROUTE_KEY = 'newFriendRoute';

/** App 内嵌打开呼朋唤友时 URL 携带的 token（sessionStorage 备份） */
export const INVITE_FRIENDS_APP_TOKEN_KEY = 'op7:inviteFriendsAppToken';

/**
 * 从 URL 持久化 App 传入的 token，供接口 Cookie 鉴权及子路由跳转携带
 * 例：/newFriend?isApp=1&token=xxx
 */
export function persistInviteFriendsAppQuery(searchParams: URLSearchParams): void {
  const token = searchParams.get('token')?.trim();
  if (!token) return;

  safeSetSessionString(INVITE_FRIENDS_APP_TOKEN_KEY, token);
  Cookies.set(TOKEN_KEY, token, { expires: COOKIE_EXPIRES });
}

/** 合并当前 URL query 与已持久化的 App token / isApp */
export function buildInviteFriendsSearch(base?: URLSearchParams | string): URLSearchParams {
  const params =
    typeof base === 'string'
      ? new URLSearchParams(base.replace(/^\?/, ''))
      : new URLSearchParams(base?.toString() ?? '');

  if (!params.get('token')) {
    const stored = safeGetSessionString(INVITE_FRIENDS_APP_TOKEN_KEY);
    if (stored) params.set('token', stored);
  }

  if (!params.get('isApp') && isEmbeddedInNativeApp()) {
    params.set('isApp', '1');
  }

  return params;
}

/** 子路由跳转时保留 query（含 App token、isApp） */
export function withInviteFriendsSearch(path: string, search?: URLSearchParams | string): string {
  const merged = buildInviteFriendsSearch(search ?? window.location.search);
  return appendPathSearch(path, merged);
}
