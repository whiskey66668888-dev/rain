/** 进球模块共用计算，对齐 App detail_goal_logic.dart */

/** 比值（保留两位小数，0~1） */
export const calcRatio = (numerator?: string, denominator?: string): number => {
  const num = Number.parseFloat(numerator ?? '');
  const den = Number.parseFloat(denominator ?? '');
  if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return 0;
  return Number.parseFloat((num / den).toFixed(2));
};

/** 百分比文案：入参为百分数值（如 66.66） */
export const formatPercent = (value: number): string => {
  const fixed = Number.parseFloat(value.toFixed(2));
  if (fixed % 1 === 0) return `${Math.trunc(fixed)}%`;
  return `${fixed.toFixed(2)}%`;
};

/** 安全转整数 */
export const toInt = (value?: string, fallback = 0): number => {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

/** 首球平均时间（秒 → 分钟文案） */
export const formatFirstGoalMinute = (secondsStr?: string): string => {
  if (!secondsStr) return '-';
  const seconds = Number.parseFloat(secondsStr);
  if (!Number.isFinite(seconds) || seconds <= 0) return '-';
  const minute = Math.round(seconds / 60 + 1);
  return `${minute}'`;
};

/** 状态对比涨跌文案，如 +12 / -8 / 0 */
export const calcPercentChangeText = (
  recentStr?: string,
  normalStr?: string,
  reverse = false,
): string => {
  const recent = Number.parseFloat(recentStr ?? '0') || 0;
  const normal = Number.parseFloat(normalStr ?? '0') || 0;
  if (normal === 0) return '0';
  let change = (recent - normal) / normal;
  if (reverse) change = -change;
  const percent = Math.round(change * 100);
  if (percent > 0) return `+${percent}`;
  if (percent < 0) return `${percent}`;
  return '0';
};
