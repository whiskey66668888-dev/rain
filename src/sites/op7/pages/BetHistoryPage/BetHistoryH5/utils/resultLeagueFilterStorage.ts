import type { MatchResultLeagueItem } from '@/apis/fbSports/betRecord/getFBResultList';
import type { ResultDateRange } from '../types/resultFilter';

export const RESULT_LEAGUE_FILTER_STORAGE_KEY = 'op7:betHistoryH5:resultLeagueFilter';

export type ResultLeagueFilterMode = 'all' | 'partial';

export interface ResultLeagueOption {
  leagueId: number;
  leagueName: string;
  leagueIcon?: string;
}

export interface ResultLeagueFilterStorage {
  dateRange?: ResultDateRange;
  sportId: number;
  sportName: string;
  mode: ResultLeagueFilterMode;
  leagueIds: number[];
  leagueOptions?: ResultLeagueOption[];
  searchText: string;
  updatedAt: number;
}

const isBrowser = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const normalizeDateRange = (value: unknown): ResultDateRange | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const startTime = Number((value as { startTime?: unknown }).startTime);
  const endTime = Number((value as { endTime?: unknown }).endTime);

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return undefined;
  }

  return { startTime, endTime };
};

const normalizeLeagueOptions = (value: unknown): ResultLeagueOption[] => {
  if (!Array.isArray(value)) return [];

  const normalized: ResultLeagueOption[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    const leagueId = Number((item as { leagueId?: unknown }).leagueId);
    const rawLeagueName = (item as { leagueName?: unknown }).leagueName;
    const rawLeagueIcon = (item as { leagueIcon?: unknown }).leagueIcon;
    const leagueName = typeof rawLeagueName === 'string' ? rawLeagueName.trim() : '';
    const leagueIcon = typeof rawLeagueIcon === 'string' ? rawLeagueIcon.trim() : '';

    if (!Number.isFinite(leagueId) || !leagueName) return;

    normalized.push({
      leagueId,
      leagueName,
      leagueIcon,
    });
  });

  return normalized;
};

export const readResultLeagueFilterStorage = (): ResultLeagueFilterStorage | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(RESULT_LEAGUE_FILTER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ResultLeagueFilterStorage>;
    if (typeof parsed.sportId !== 'number') return null;

    return {
      sportId: parsed.sportId,
      sportName: parsed.sportName || '足球',
      mode: parsed.mode === 'partial' ? 'partial' : 'all',
      leagueIds: Array.isArray(parsed.leagueIds)
        ? parsed.leagueIds.filter((item): item is number => typeof item === 'number')
        : [],
      leagueOptions: normalizeLeagueOptions(parsed.leagueOptions),
      searchText: parsed.searchText || '',
      dateRange: normalizeDateRange(parsed.dateRange),
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
};

export const writeResultLeagueFilterStorage = (value: ResultLeagueFilterStorage) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    RESULT_LEAGUE_FILTER_STORAGE_KEY,
    JSON.stringify({
      ...value,
      leagueIds: value.mode === 'all' ? [] : value.leagueIds,
      updatedAt: Date.now(),
    }),
  );
};

export const getEffectiveResultLeagueIds = (value: ResultLeagueFilterStorage | null) => {
  if (!value || value.mode === 'all') return [];
  return value.leagueIds;
};

// 联赛数据转换为联赛选项
export const createResultLeagueOptionsFromLgs = (
  leagues: MatchResultLeagueItem[] | undefined,
): ResultLeagueOption[] => {
  const leagueMap = new Map<number, ResultLeagueOption>();

  leagues?.forEach((league) => {
    const leagueId = Number(league.id);
    const leagueName = typeof league.nm === 'string' ? league.nm.trim() : '';
    if (!Number.isFinite(leagueId) || !leagueName || leagueMap.has(leagueId)) return;

    leagueMap.set(leagueId, {
      leagueId,
      leagueName,
      leagueIcon: typeof league.lg === 'string' ? league.lg.trim() : '',
    });
  });

  return Array.from(leagueMap.values());
};
