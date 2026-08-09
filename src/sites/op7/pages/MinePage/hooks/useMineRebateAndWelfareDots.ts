import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAppSelector } from '@/core/store/hooks';
import { getRebate } from '@/apis/origin/rebate';
import { getWelfareCenterReq } from '@/apis/origin/welfareCenter';

function parseRebateAmount(raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === 'string') {
    const n = Number(raw.replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if ('amount' in o) return parseRebateAmount(o.amount);
    if ('cash' in o) return parseRebateAmount(o.cash);
  }
  return 0;
}

/**
 * H5 我的宫格 / PC 左侧导航：实时返水红点（可领返水）；福利中心红点（可领返水或近 90 天有待领福利）
 */
export function useMineRebateAndWelfareDots() {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const [hasRealtimeRebateDot, setHasRealtimeRebateDot] = useState(false);
  const [hasWelfareCenterDot, setHasWelfareCenterDot] = useState(false);

  const refreshDots = useCallback(async () => {
    if (!isLogin) {
      setHasRealtimeRebateDot(false);
      setHasWelfareCenterDot(false);
      return;
    }

    const end = dayjs();
    const start = end.subtract(89, 'day');
    const startStr = start.format('YYYY-MM-DD');
    const endStr = end.format('YYYY-MM-DD');

    const [rebatePositive, welfareUnclaimed] = await Promise.all([
      getRebate()
        .then((res) => parseRebateAmount(res.data) > 0)
        .catch(() => false),
      getWelfareCenterReq({
        status: 0,
        pageSize: 1,
        pageNumber: 1,
        start: startStr,
        end: endStr,
      })
        .then((res) => (res.data?.totalSize ?? 0) > 0)
        .catch(() => false),
    ]);

    setHasRealtimeRebateDot(rebatePositive);
    /** 福利中心内包含实时返水入口 + 礼金列表，两者任一有可领即提示 */
    setHasWelfareCenterDot(rebatePositive || welfareUnclaimed);
  }, [isLogin]);

  useEffect(() => {
    void refreshDots();
  }, [refreshDots]);

  return { hasRealtimeRebateDot, hasWelfareCenterDot, refreshDots };
}
