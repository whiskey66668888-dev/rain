import type { BasketLiveItem } from '@/apis/origin/discover';
import type { DiscoverMatchInfo } from '@/apis/origin/discover';

export type LiveFilterType = 'all' | 'score' | 'foul' | 'substitution';

export interface BasketTeamFallback {
  homeName?: string;
  awayName?: string;
  homeLogo?: string;
  awayLogo?: string;
}

export interface ScoreTableRow {
  side: 'home' | 'away';
  name: string;
  logo: string;
  values: string[];
  highlights: boolean[];
}

export interface ScoreTableData {
  headers: string[];
  rows: ScoreTableRow[];
}

export interface LiveEventBuckets {
  all: BasketLiveItem[];
  score: BasketLiveItem[];
  foul: BasketLiveItem[];
  substitution: BasketLiveItem[];
}

export const LIVE_FILTER_LABELS: Record<LiveFilterType, string> = {
  all: '全部',
  score: '得分',
  foul: '犯规',
  substitution: '换人',
};

export const parsePair = (value?: string): [number, number] => {
  if (!value?.includes(',')) return [0, 0];
  const [home, away] = value.split(',');
  return [Number(home) || 0, Number(away) || 0];
};

export const formatStatValue = (value: number, keepRatio = false): string => {
  if (keepRatio) return value.toFixed(1);
  return value.toFixed(1).replace(/\.0$/, '');
};

export const hasOvertimeScore = (detail?: Partial<DiscoverMatchInfo> | null): boolean => {
  const home = detail?.home_over_time_score;
  const away = detail?.guest_over_time_score;
  return Boolean((home && home !== '0') || (away && away !== '0'));
};

export const getInitialBasketPeriod = (detail?: Partial<DiscoverMatchInfo> | null): number => {
  const name = detail?.match_state_name ?? '';
  if (name.includes('加时')) return 4;
  if (name.includes('第四')) return 3;
  if (name.includes('第三')) return 2;
  if (name.includes('第二')) return 1;
  if (name.includes('第一')) return 0;
  if (detail?.match_state === '8' || name.includes('完')) return hasOvertimeScore(detail) ? 4 : 3;
  return 0;
};

const getPeriodScore = (
  scores: string | undefined,
  overtime: string | undefined,
  index: number,
): string => {
  if (index === 4) return overtime && overtime !== '0' ? overtime : '';
  const value = (scores ?? '').split(',')[index] ?? '';
  return value === '-' ? '' : value;
};

export const buildScoreTable = (
  detail: Partial<DiscoverMatchInfo> | null | undefined,
  fallback: BasketTeamFallback,
): ScoreTableData => {
  const showOT = hasOvertimeScore(detail);
  const headers = ['Q1', 'Q2', 'Q3', 'Q4', ...(showOT ? ['OT'] : []), '总分'];
  const periodIndexes = [0, 1, 2, 3, ...(showOT ? [4] : [])];
  const homeValues = periodIndexes.map((index) =>
    getPeriodScore(detail?.home_scores, detail?.home_over_time_score, index),
  );
  const awayValues = periodIndexes.map((index) =>
    getPeriodScore(detail?.guest_scores, detail?.guest_over_time_score, index),
  );

  homeValues.push(detail?.home_score ?? '');
  awayValues.push(detail?.guest_score ?? '');

  const homeHighlights: boolean[] = [];
  const awayHighlights: boolean[] = [];
  homeValues.forEach((home, index) => {
    const away = awayValues[index] ?? '';
    const homeScore = Number.parseInt(home, 10);
    const awayScore = Number.parseInt(away, 10);
    const comparable = Number.isFinite(homeScore) && Number.isFinite(awayScore);
    homeHighlights.push(comparable && homeScore > awayScore);
    awayHighlights.push(comparable && awayScore > homeScore);
  });

  return {
    headers,
    rows: [
      {
        side: 'home',
        name: detail?.home_team_name || fallback.homeName || '',
        logo: detail?.home_logo || fallback.homeLogo || '',
        values: homeValues,
        highlights: homeHighlights,
      },
      {
        side: 'away',
        name: detail?.guest_team_name || fallback.awayName || '',
        logo: detail?.guest_logo || fallback.awayLogo || '',
        values: awayValues,
        highlights: awayHighlights,
      },
    ],
  };
};

export const getLiveEventBuckets = (items: BasketLiveItem[] = []): LiveEventBuckets => {
  const all = [...items].reverse();
  return {
    all,
    score: all.filter((item) => item.type === '1'),
    foul: all.filter((item) => item.type === '2'),
    substitution: all.filter((item) => item.type === '3'),
  };
};

export const getVisibleLiveFilters = (buckets: LiveEventBuckets): LiveFilterType[] => [
  'all',
  ...(buckets.score.length > 0 ? (['score'] as const) : []),
  ...(buckets.foul.length > 0 ? (['foul'] as const) : []),
  ...(buckets.substitution.length > 0 ? (['substitution'] as const) : []),
];

export const getLiveItemsByFilter = (
  buckets: LiveEventBuckets,
  filter: LiveFilterType,
): BasketLiveItem[] => buckets[filter];

export const reverseScoreText = (score?: string): string => {
  const parts = (score ?? '').split('-');
  return parts.length === 2 ? `${parts[1]}-${parts[0]}` : (score ?? '');
};

export const getDisplayName = (name?: string, englishName?: string): string =>
  name || englishName || '-';
