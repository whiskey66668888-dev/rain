import { locales } from '@/utils/constants/local';
import { AUTH_REDIRECT_PATH_KEY } from '@/utils/constants/cacheKey';

const ensureLeadingSlash = (path: string): string => {
  if (!path) {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

export const stripLocalePrefix = (pathname: string): string => {
  const normalizedPathname = ensureLeadingSlash(pathname);
  const [, maybeLocale, ...rest] = normalizedPathname.split('/');

  if (maybeLocale && locales.includes(maybeLocale as (typeof locales)[number])) {
    return rest.length > 0 ? `/${rest.join('/')}` : '/';
  }

  return normalizedPathname;
};

export const normalizeAuthRedirectPath = (path: string): string => {
  if (!path) {
    return '/';
  }

  return stripLocalePrefix(ensureLeadingSlash(path));
};

export const buildAuthRedirectPath = (pathname: string, search = '', hash = ''): string =>
  `${stripLocalePrefix(pathname)}${search}${hash}`;

export const setAuthRedirectPath = (path: string): void => {
  sessionStorage.setItem(AUTH_REDIRECT_PATH_KEY, normalizeAuthRedirectPath(path));
};

export const getAuthRedirectPath = (): string | null => {
  return sessionStorage.getItem(AUTH_REDIRECT_PATH_KEY);
};

export const clearAuthRedirectPath = (): void => {
  sessionStorage.removeItem(AUTH_REDIRECT_PATH_KEY);
};

export const consumeAuthRedirectPath = (): string | null => {
  const path = getAuthRedirectPath();

  if (path) {
    clearAuthRedirectPath();
  }

  return path;
};
