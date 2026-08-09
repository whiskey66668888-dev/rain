export type ThemeMode = 'light' | 'dark' | 'system';

export const VERSION = '6.0.7';
export enum FontScaleType {
  NORMAL = 0.9,
  MEDIUM = 1,
  LARGE = 1.15,
}
/**
 * 字体大小
 */
export const FONT_SIZE_OPTIONS = [
  { value: FontScaleType.NORMAL, label: '常规' },
  { value: FontScaleType.MEDIUM, label: '中' },
  { value: FontScaleType.LARGE, label: '大' },
];

/**
 * 外观样式
 */
export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '自动' },
  { value: 'light', label: '白天' },
  { value: 'dark', label: '黑夜' },
];
