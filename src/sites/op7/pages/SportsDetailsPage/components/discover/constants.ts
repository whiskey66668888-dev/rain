/** 发现 tab 标识，与 App discoverTabId 一致 */
export const DISCOVER_TAB_ID = 'discover';

/** 发现 tab 展示文案 */
export const DISCOVER_TAB_LABEL = '发现';

/**
 * 发现 tab 引导红点的 sessionStorage 标记 key
 * 对齐 App appService.showDiscoverBadge：用户点过一次发现 tab 后隐藏，
 * 用 sessionStorage 保证「本次会话内不再出现」，会话结束（关标签页）后重置。
 */
export const DISCOVER_BADGE_SEEN_KEY = 'discover_tab_badge_seen';
