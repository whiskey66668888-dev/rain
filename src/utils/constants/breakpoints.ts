/**
 * 屏幕断点（与 uno.config.ts theme.breakpoints 保持一致）
 * 用于 JS 中监听视口、与 UnoCSS 类名对齐
 */
export const BREAKPOINTS = {
  md: 375,
  lg: 768,
  xl: 1440,
  '2xl': 1920,
} as const;

export type TScreenBreakpoint = keyof typeof BREAKPOINTS;

/** 断点对应的 min-width 媒体查询（从大到小，用于 matchMedia） */
export const BREAKPOINT_MEDIA_QUERIES: { bp: TScreenBreakpoint; query: string }[] = [
  { bp: '2xl', query: `(min-width: ${BREAKPOINTS['2xl']}px)` },
  { bp: 'xl', query: `(min-width: ${BREAKPOINTS.xl}px)` },
  { bp: 'lg', query: `(min-width: ${BREAKPOINTS.lg}px)` },
  { bp: 'md', query: `(min-width: ${BREAKPOINTS.md}px)` },
];
