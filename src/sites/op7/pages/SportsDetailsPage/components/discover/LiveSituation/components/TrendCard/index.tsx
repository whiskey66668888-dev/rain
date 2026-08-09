import React, { useMemo } from 'react';

import LazyImage from '@/common/components/LazyImage';
import MatchTimelineChart from '../MatchTimelineChart';

import { match_evn_img_map } from '../../constants';

import type { TeamLite, LiveSituationData, Incident } from '@/apis/origin/discover';
import styles from './index.module.scss';

const fallbackLogo = '/images/common/logo_small.png';

interface TrendCardProps {
  liveSituationData?: LiveSituationData;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
}

const textLiveBottom = [
  { label: 1, img: match_evn_img_map[1] },
  { label: 21, img: match_evn_img_map[21] },
  { label: 22, img: match_evn_img_map[22] },
  { label: 8, img: match_evn_img_map[8] },
  { label: 16, img: match_evn_img_map[16] },
  { label: 17, img: match_evn_img_map[17] },
  { label: 18, img: match_evn_img_map[18] },
  { label: 3, img: match_evn_img_map[3] },
  { label: 4, img: match_evn_img_map[4] },
  { label: 15, img: match_evn_img_map[15] },
  { label: 9, img: match_evn_img_map[9] },
  { label: 2, img: match_evn_img_map[2] },
  { label: 5, img: match_evn_img_map[5] },
  { label: 28, img: match_evn_img_map[28] },
  { label: 69, img: match_evn_img_map[69] },
];

// 只用有走势图图标的事件类型校准图表旗帜数量。
// 走势图折线已经表达射正/射偏走势，不把 21/22 补成事件图标
const drawableLiveEventTypes = new Set(
  textLiveBottom.map((item) => String(item.label)).filter((type) => !['21', '22'].includes(type)),
);

const asNum = (val: number | string | undefined): number => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const parseLiveInfoMinute = (value?: string): string | null => {
  const match = value?.trim().match(/^(\d+)(?:\+(\d+))?\s*['’′`]/);
  if (!match) return null;
  const base = asNum(match[1]);
  const extra = asNum(match[2]);
  return String(base + extra);
};

const TrendCard: React.FC<TrendCardProps> = ({ homeTeam, awayTeam, liveSituationData }) => {
  // 走势图旗帜事件：基础事件来自 incidents；文字直播用于校准当前可绘制事件的数量。
  // 如果文字直播已更新但 incidents 滞后，就从 live_info 补；如果 incidents 多返回了重复项，就按 live_info 数量截断。
  const trendIncidents = useMemo<Incident[]>(() => {
    const fromTop = liveSituationData?.incidents ?? [];
    const fromTrend = liveSituationData?.trend?.incidents ?? [];
    const fromPage = liveSituationData?.incidents ?? [];
    const getKey = (item: Incident) =>
      [String(item.type), String(item.time), String(item.position)].join('_');
    const getCountKey = (item: Pick<Incident, 'type' | 'position'>) =>
      [String(item.type), String(item.position)].join('_');

    // 先合并接口事件源；不同字段可能有重叠，同一类型/时间/队伍只保留一条。
    const baseEvents: Incident[] = [];
    const seenBase = new Set<string>();
    for (const item of [...fromTop, ...fromTrend, ...fromPage]) {
      const key = getKey(item);
      if (seenBase.has(key)) continue;
      seenBase.add(key);
      baseEvents.push(item);
    }

    // live_info 通常更新更及时，但只有文本信息；这里用它作为数量基准，
    // 用来补齐滞后的 incidents，或截掉 incidents 里多返回的重复项。
    const liveInfo = liveSituationData?.live_info ?? [];
    const liveEventsByTypePosition = new Map<string, Incident[]>();
    for (const item of liveInfo) {
      const type = String(item.type);
      if (!drawableLiveEventTypes.has(type)) continue;
      const time = parseLiveInfoMinute(item.data);
      if (!time) continue;
      const position = String(item.position);
      const countKey = [type, position].join('_');
      const list = liveEventsByTypePosition.get(countKey) ?? [];
      list.push({
        time,
        type,
        position,
        type_name: item.data,
      });
      liveEventsByTypePosition.set(countKey, list);
    }

    // 优先保留 incidents 里的完整事件信息，但数量不能超过 live_info。
    const keptCountByTypePosition = new Map<string, number>();
    const merged: Incident[] = [];
    for (const item of baseEvents) {
      const countKey = getCountKey(item);
      const liveCount = liveEventsByTypePosition.get(countKey)?.length;
      const keptCount = keptCountByTypePosition.get(countKey) ?? 0;
      if (liveCount !== undefined && keptCount >= liveCount) continue;
      keptCountByTypePosition.set(countKey, keptCount + 1);
      merged.push(item);
    }

    // live_info 里有更新的可绘制事件，而 incidents 还没返回时，补充占位事件给图表绘制。
    liveEventsByTypePosition.forEach((liveEvents, countKey) => {
      const keptCount = keptCountByTypePosition.get(countKey) ?? 0;
      if (keptCount >= liveEvents.length) return;
      liveEvents.slice(0, liveEvents.length - keptCount).forEach((item) => {
        merged.push(item);
      });
    });

    return merged;
  }, [liveSituationData]);

  const hasTrendChartData = useMemo(() => {
    return Boolean(
      liveSituationData?.trend?.before_half_trend?.length ||
      liveSituationData?.trend?.after_half_trend?.length,
    );
  }, [liveSituationData]);

  if (!hasTrendChartData) return null;

  return (
    <section className={styles.trendCard}>
      <div className={styles.lineTimerChart}>
        <div className={styles.teamLogo}>
          <div className={styles.teamItem}>
            <LazyImage
              src={homeTeam.logo || fallbackLogo}
              alt={homeTeam.name || '主队'}
              width={24}
              height={24}
              fallback={fallbackLogo}
            />
          </div>
          <div className={styles.teamItem}>
            <LazyImage
              src={awayTeam.logo ?? fallbackLogo}
              alt={awayTeam.name ?? '客队'}
              width={24}
              height={24}
              fallback={fallbackLogo}
            />
          </div>
        </div>
        <div className={styles.matchTimelineChartBox}>
          <MatchTimelineChart trend={liveSituationData?.trend} incidents={trendIncidents} />
        </div>
      </div>
    </section>
  );
};

export default TrendCard;
