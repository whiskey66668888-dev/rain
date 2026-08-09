/** 与 theme.scss 一致，避免首屏 CSS 未加载时 var() 解析失败导致刘海区发白 */
const NOTCH_ENTERTAIN_LIGHT = 'rgb(236, 242, 255)';
const NOTCH_ENTERTAIN_DARK = 'rgb(1, 1, 1)';
const NOTCH_DEFAULT_LIGHT = 'rgb(255, 255, 255)';
const NOTCH_DEFAULT_DARK = 'rgb(30, 30, 33)';
const NOTCH_SPORTS_LIGHT = '#CBD8ED';
const NOTCH_SPORTS_DARK = '#18181B';

export type H5NotchPageKind = 'sports' | 'entertainment' | 'default';

export const normalizePathname = (pathname: string): string => {
  const path = pathname.toLowerCase();
  const withoutLocale = path.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/, '');
  return withoutLocale || '/';
};

export const getNotchPageKind = (pathname: string, module?: string): H5NotchPageKind => {
  const normalizedPath = normalizePathname(pathname);
  const isSportsByPath =
    normalizedPath.startsWith('/sports') ||
    normalizedPath.startsWith('/champion') ||
    normalizedPath.startsWith('/bet_history_h5');
  const isEntertainmentByPath =
    normalizedPath === '/' || normalizedPath === '' || normalizedPath.startsWith('/entertainment');

  if (isSportsByPath) return 'sports';
  if (isEntertainmentByPath) return 'entertainment';
  if (module === 'sports') return 'sports';
  if (module === 'entertainment' || module === 'landing') return 'entertainment';
  return 'default';
};

export function getH5NotchSolidColor(
  pageKind: H5NotchPageKind,
  isDark: boolean,
  options?: { isMobile?: boolean; isFBSportsMaintenance?: boolean },
): string {
  const { isMobile = true, isFBSportsMaintenance = false } = options ?? {};

  if (pageKind === 'sports') {
    if (!isMobile || isFBSportsMaintenance) {
      return isDark ? NOTCH_ENTERTAIN_DARK : NOTCH_ENTERTAIN_LIGHT;
    }
    return isDark ? NOTCH_SPORTS_DARK : NOTCH_SPORTS_LIGHT;
  }
  if (pageKind === 'entertainment') {
    return isDark ? NOTCH_ENTERTAIN_DARK : NOTCH_ENTERTAIN_LIGHT;
  }
  return isDark ? NOTCH_DEFAULT_DARK : NOTCH_DEFAULT_LIGHT;
}

/** 根据路径与主题解析首屏刘海色（供 index.html 内联脚本与运行时共用逻辑参考） */
export function getH5NotchSolidColorByPath(pathname: string, isDark: boolean): string {
  return getH5NotchSolidColor(getNotchPageKind(pathname), isDark, { isMobile: true });
}

/** 同步刘海区 CSS 变量与 theme-color（须为实色，不可使用 var()） */
export function applyH5NotchColor(solid: string): void {
  if (typeof document === 'undefined') return;

  document.documentElement.style.setProperty('--h5-safe-area-top-color', solid);
  document.body.style.setProperty('--h5-safe-area-top-color', solid);

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', solid);
}
