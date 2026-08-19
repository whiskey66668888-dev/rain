import { useEffect, useMemo, useState } from 'react';

import type { MatchRecord } from '@/apis/fbSports/getList';

const hasScoreboardPayload = (match: MatchRecord | null | undefined): boolean =>
  !!match?.id && Array.isArray(match.nsg) && match.nsg.length > 0;

/**
 * 赛事详情比分板本地保留：
 * 完赛后详情接口可能不再返回有效比分（无 id / nsg 被清空）。
 * 停留在详情页期间沿用进入完赛前最后一次有效 MatchRecord；
 * 切换赛事或退出详情页（卸载）时清理。
 */
export function useRetainedMatchRecord(
  matchId: number,
  current: MatchRecord | undefined,
): MatchRecord | undefined {
  const [retained, setRetained] = useState<MatchRecord | null>(null);

  // 切换赛事时清理
  useEffect(() => {
    setRetained(null);
  }, [matchId]);

  // 退出详情页（卸载）时清理
  useEffect(() => {
    return () => {
      setRetained(null);
    };
  }, []);

  useEffect(() => {
    if (!current?.id) return;
    setRetained((prev) => {
      // 有比分数据：更新快照
      if (hasScoreboardPayload(current)) return current;
      // 尚无同场快照：先存一份（队名等基础信息）
      if (!prev || prev.id !== current.id) return current;
      // 同场且当前无比分：保留原快照，避免空 nsg 冲掉比分板
      return prev;
    });
  }, [current]);

  return useMemo(() => {
    if (current?.id) {
      if (hasScoreboardPayload(current)) return current;
      if (hasScoreboardPayload(retained) && retained!.id === current.id) {
        return {
          ...current,
          nsg: retained!.nsg,
          mc: current.mc ?? retained!.mc,
          sb: current.sb ?? retained!.sb,
        };
      }
      return current;
    }
    // 接口无有效 id：沿用本地快照
    return retained ?? current;
  }, [current, retained]);
}
