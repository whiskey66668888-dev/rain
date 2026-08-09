/**
 * PC 端体育模块右侧直播视频的音效偏好（静音 / 非静音）。
 * H5 不使用此会话，请勿在移动端读写。
 * 默认音效关闭（静音）；在体育模块路由之间切换时保留用户选择；离开体育模块后重置为默认。
 */

function normalizePathname(pathname: string): string {
  const path = pathname.toLowerCase();
  const withoutLocale = path.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/, '');
  return withoutLocale || '/';
}

/**
 * 是否与 MainLayout 中 sports 模块范畴一致（含赛事详情 handle.module === 'sports' 等）
 */
export function isOp7SportsModuleRoute(pathname: string, routeModule?: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  const isSportsByPath =
    normalizedPath.startsWith('/sports') ||
    normalizedPath.startsWith('/champion') ||
    normalizedPath.startsWith('/bet_history_h5') ||
    normalizedPath.startsWith('/bet_history_pc');
  if (isSportsByPath) return true;
  if (routeModule === 'sports') return true;
  return false;
}

/** true = 音效关闭（浏览器 muted） */
let sportVideoMutedPreference = true;

export function getSportVideoMutedPreference(): boolean {
  return sportVideoMutedPreference;
}

export function setSportVideoMutedPreference(muted: boolean): void {
  sportVideoMutedPreference = muted;
}

export function resetSportVideoSoundSession(): void {
  sportVideoMutedPreference = true;
}
