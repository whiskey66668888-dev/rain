import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export enum EDateRangeType {
  TODAY = 0,
  YESTERDAY = 1,
  LAST_WEEK = 2,
  LAST_7_DAYS = 3,
  LAST_30_DAYS = 4,
  LAST_90_DAYS = 5,
}

export type TDateRange = [Date, Date];

export interface TDateRangeItem {
  name: string;
  rangeType: EDateRangeType;
  range: TDateRange;
}

// 今日
export const todayRange = (): TDateRange => {
  const start = dayjs().startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();
  return [start, end];
};
// 昨日
export const yeastodayRange = (): TDateRange => {
  const start = dayjs().subtract(1, 'days').startOf('day').toDate();
  const end = dayjs().subtract(1, 'days').endOf('day').toDate();
  return [start, end];
};
// 近7日
export const last7DaysRange = (): TDateRange => {
  const start = dayjs().subtract(6, 'days').startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();
  return [start, end];
};
// 上周
export const lastWeekRange = (): TDateRange => {
  const start = dayjs().subtract(1, 'week').startOf('isoWeek').toDate();
  const end = dayjs().subtract(1, 'week').endOf('isoWeek').toDate();
  return [start, end];
};
// 近30日
export const last30DaysRange = (): TDateRange => {
  const start = dayjs().subtract(29, 'day').startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();
  return [start, end];
};
// 近90日
export const last90DaysRange = (): TDateRange => {
  const start = dayjs().subtract(89, 'day').startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();
  return [start, end];
};

/** 每次调用都返回当前时间的新鲜区间，避免模块加载后日期固化 */
export const getDateRangeTabs = (): TDateRangeItem[] => [
  { name: 'common.today', rangeType: EDateRangeType.TODAY, range: todayRange() },
  { name: 'common.yesterday', rangeType: EDateRangeType.YESTERDAY, range: yeastodayRange() },
  { name: 'common.last_7_days', rangeType: EDateRangeType.LAST_7_DAYS, range: last7DaysRange() },
  { name: '上周', rangeType: EDateRangeType.LAST_WEEK, range: lastWeekRange() },
  { name: 'common.last_30_days', rangeType: EDateRangeType.LAST_30_DAYS, range: last30DaysRange() },
  { name: 'common.last_90_days', rangeType: EDateRangeType.LAST_90_DAYS, range: last90DaysRange() },
];

export const buildQuickDateRangeTabs = (
  rangeType: EDateRangeType[] = [
    EDateRangeType.TODAY,
    EDateRangeType.YESTERDAY,
    EDateRangeType.LAST_7_DAYS,
    EDateRangeType.LAST_WEEK,
    EDateRangeType.LAST_30_DAYS,
    EDateRangeType.LAST_90_DAYS,
  ],
): TDateRangeItem[] => {
  if (!rangeType?.length) return [];
  return getDateRangeTabs().filter((item) => rangeType.includes(item.rangeType));
};

/** 兼容秒(10位)/毫秒(13位)时间戳，统一归一化为毫秒；无效值返回 0 */
export const toMillis = (ts?: number): number => {
  if (!ts || ts <= 0) return 0;
  return String(ts).length <= 10 ? ts * 1000 : ts;
};
