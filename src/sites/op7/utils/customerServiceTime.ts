import type { CustomerServiceHotlineItem } from '@/apis/origin/customerService';

/** phList[].workTime 格式：HH:mm-HH:mm */
export function getInWorkTimeByRange(time?: string): boolean {
  if (!time) return false;
  const [l, r] = time.split('-');
  if (!l || !r) return false;
  const start = l.replace(':', '');
  const end = r.replace(':', '');
  const now = new Date();
  const cur = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  return cur >= start && cur <= end;
}

/** phList 项 workStartTime / workEndTime */
export function isInHotlineWorkTime(item?: CustomerServiceHotlineItem): boolean {
  if (!item?.workStartTime || !item?.workEndTime) return true;
  try {
    const now = new Date();
    const [startHour, startMinute = '0'] = String(item.workStartTime).split(':');
    const [endHour, endMinute = '0'] = String(item.workEndTime).split(':');
    const start = new Date();
    start.setHours(Number(startHour), Number(startMinute), 0, 0);
    const end = new Date();
    end.setHours(Number(endHour), Number(endMinute), 0, 0);
    return now >= start && now <= end;
  } catch {
    return true;
  }
}

export function hasAvailableServiceData(serviceInfo?: {
  cusList?: unknown[];
  phList?: CustomerServiceHotlineItem[];
}): boolean {
  const cusList = serviceInfo?.cusList ?? [];
  const phList = serviceInfo?.phList ?? [];
  const cusListEmpty = cusList.length === 0;
  const hasAvailablePhList = phList.some((item) => isInHotlineWorkTime(item));
  return !cusListEmpty || hasAvailablePhList;
}
