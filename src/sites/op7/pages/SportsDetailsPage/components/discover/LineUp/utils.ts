import type { LineUpData, Player, TeamLite } from '@/apis/origin/discover';

import type { PlayerOption } from './types';

type CoachStats = LineUpData['info']['coach']['home'];
type EnvInfo = LineUpData['info']['env'];
type TeamInfoCell = { image?: string; text?: string };
export type NationalityStat = { logo: string; count: number };
export type CountryPlayer = Pick<
  Player,
  'player_id' | 'player' | 'player_logo' | 'shirt_num' | 'position'
>;
export type CountryGroup = {
  logo: string;
  country: string;
  count: number;
  players: CountryPlayer[];
};
export type LineUpInfoRow =
  | { label: ''; home: TeamInfoCell; away: TeamInfoCell; isHeader: true }
  | { label: string; home: string; away: string; isHeader?: false };

export const getPlayerValue = (player: Player, option: PlayerOption): string => {
  if (option === 'rating') return formatRating(player.rating);
  if (option === 'national_logo') return player.national_logo || '';
  if (option === 'age') return formatNumericSuffix(player.age, '岁');
  if (option === 'height') return formatNumericSuffix(player.height, 'cm');
  return normalizeMarketValue(player.market_value);
};

export const hasLineUpData = (data?: LineUpData | null): boolean =>
  Boolean(data?.info?.lineup?.home?.length || data?.info?.lineup?.away?.length);

export const hasValidPitchPlayer = (players?: Player[] | null): boolean =>
  (players ?? []).some(
    (player) => Number(player.player_x || 0) > 0 && Number(player.player_y || 0) > 0,
  );

export const hasPitchLineup = (home?: Player[] | null, away?: Player[] | null): boolean =>
  hasValidPitchPlayer(home) && hasValidPitchPlayer(away);

export const groupPitchPlayersByRow = (players: Player[] = [], isAway = false): Player[][] => {
  const normalized = players
    .map((player, index) => ({
      player,
      index,
      x: Number(player.player_x || 0),
      y: Number(player.player_y || 0),
    }))
    .filter((item) => item.x > 0 && item.y > 0)
    .sort((a, b) => {
      const ay = isAway ? 100 - a.y : a.y;
      const by = isAway ? 100 - b.y : b.y;
      if (ay !== by) return ay - by;
      const ax = isAway ? 100 - a.x : a.x;
      const bx = isAway ? 100 - b.x : b.x;
      if (ax !== bx) return ax - bx;
      return a.index - b.index;
    });

  const rows: Array<typeof normalized> = [];
  const yThreshold = 5;

  normalized.forEach((item) => {
    const rowY = isAway ? 100 - item.y : item.y;
    const current = rows[rows.length - 1];
    const currentY = current?.[0] ? (isAway ? 100 - current[0].y : current[0].y) : undefined;
    if (!current || currentY === undefined || Math.abs(rowY - currentY) > yThreshold) {
      rows.push([item]);
      return;
    }
    current.push(item);
  });

  return rows.map((row) =>
    row
      .sort((a, b) => {
        const ax = isAway ? 100 - a.x : a.x;
        const bx = isAway ? 100 - b.x : b.x;
        if (ax !== bx) return ax - bx;
        return a.index - b.index;
      })
      .slice(0, 7)
      .map((item) => item.player),
  );
};

export const formatRating = (rating?: string): string => {
  const trimmed = (rating ?? '').trim();
  if (!trimmed || trimmed === '-' || trimmed === '--') return '-';
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return '-';
  return (Math.trunc(value * 10) / 10).toFixed(1);
};

export const formatNumericSuffix = (raw: string | undefined, suffix: string): string => {
  const value = Number((raw ?? '').trim());
  if (!Number.isFinite(value) || value <= 0) return '-';
  const text = Number.isInteger(value) ? `${value}` : trimTrailingZeros(value.toFixed(1));
  return `${text}${suffix}`;
};

export const normalizeMarketValue = (raw?: string): string => {
  if (!raw || raw === '-') return '-';
  const text = raw.replaceAll('€', '').replaceAll('欧', '').trim();
  const yiWan = text.match(/^([\d.]+)\s*亿\s*([\d.]+)\s*万$/);
  if (yiWan)
    return `${trimTrailingZeros(yiWan[1] ?? '')}亿${trimTrailingZeros(yiWan[2] ?? '')}万欧`;
  const yi = text.match(/^([\d.]+)\s*亿$/);
  if (yi) return `${trimTrailingZeros(yi[1] ?? '')}亿欧`;
  const wan = text.match(/^([\d.]+)\s*万$/);
  if (wan) {
    const value = Number(wan[1]);
    if (value >= 10000) return `${trimTrailingZeros((value / 10000).toFixed(1))}亿欧`;
    return `${trimTrailingZeros(wan[1] ?? '')}万欧`;
  }
  const numeric = Number(text);
  if (Number.isFinite(numeric)) {
    if (numeric >= 10000) return `${trimTrailingZeros((numeric / 10000).toFixed(1))}亿欧`;
    return `${trimTrailingZeros(numeric.toFixed(1))}万欧`;
  }
  if (text.includes('万') || text.includes('亿')) return `${text}欧`;
  return `${text}万欧`;
};

export const getRatingTone = (rating?: string): string => {
  const value = Number((rating ?? '').trim());
  if (!Number.isFinite(value)) return 'default';
  if (value >= 9) return 'elite';
  if (value >= 8) return 'great';
  if (value >= 7) return 'good';
  if (value >= 6.5) return 'warning';
  if (value >= 6) return 'low';
  return 'bad';
};

export const getLineUpInfoRows = (
  data: LineUpData | null | undefined,
  homeTeam: TeamLite,
  awayTeam: TeamLite,
): LineUpInfoRow[] => {
  const home = data?.info?.coach?.home;
  const away = data?.info?.coach?.away;
  return [
    {
      label: '',
      home: { image: homeTeam.logo, text: homeTeam.name },
      away: { image: awayTeam.logo, text: awayTeam.name },
      isHeader: true,
    },
    {
      label: '阵型',
      home: valueOrDash(home?.team_formation),
      away: valueOrDash(away?.team_formation),
    },
    {
      label: '教练',
      home: formatCoach(home),
      away: formatCoach(away),
    },
    {
      label: '教练胜率',
      home: formatCoachRate(home),
      away: formatCoachRate(away),
    },
    {
      label: '身价',
      home: valueOrDash(home?.team_market_value),
      away: valueOrDash(away?.team_market_value),
    },
    {
      label: '场上身价',
      home: valueOrDash(home?.present_market_value),
      away: valueOrDash(away?.present_market_value),
    },
  ];
};

export const getEnvRows = (env?: EnvInfo) => {
  if (!env) return [];
  const rows: Array<{ label: string; value: string }> = [];
  if (env.referee_name) rows.push({ label: '裁判', value: env.referee_name });
  if (env.venue || env.capacity) {
    rows.push({ label: '场馆', value: `${env.venue || '-'} (${env.capacity || '-'}人)` });
  }
  rows.push({
    label: '天气',
    value:
      env.temperature || env.pressure || env.wind
        ? `${env.temperature || '-'} 气压${env.pressure || '-'} 风速${env.wind || '-'}`
        : '-',
  });
  return rows;
};

export const getHeaderCenterText = (
  option: PlayerOption,
  players: Player[],
  coach?: CoachStats,
): string => {
  if (option === 'rating' || option === 'national_logo') return '';
  if (option === 'age') return `平均年龄 ${average(players, 'age')}`;
  if (option === 'height') {
    const value = average(players, 'height');
    return value === '-' ? '平均身高 -' : `平均身高 ${value}cm`;
  }
  return `场上身价 ${coach?.present_market_value || sumMarket(players) || '-'}`;
};

export const getHeaderNationalityStats = (
  data: LineUpData | null | undefined,
  side: 'home' | 'away',
  players: Player[],
): NationalityStat[] => {
  const statistic = data?.info?.statistic?.[side];
  const top3Statistics = statistic?.country_top3_statistics ?? [];
  const countryStatistics = statistic?.country_statistics ?? [];
  const source = top3Statistics.length > 0 ? top3Statistics : countryStatistics;

  if (source.length) {
    return source
      .map((item) => ({
        logo: item.country_logo || '',
        count: Number(item.count || 0),
      }))
      .filter((item) => item.logo && item.count > 0)
      .slice(0, 3);
  }

  const flagMap = players.reduce<Map<string, number>>((map, player) => {
    const logo = player.national_logo || '';
    if (!logo) return map;
    map.set(logo, (map.get(logo) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return Array.from(flagMap.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, 3)
    .map(([logo, count]) => ({ logo, count }));
};

export const getCountryGroups = (
  data: LineUpData | null | undefined,
  side: 'home' | 'away',
  players: Player[],
): CountryGroup[] => {
  const statistic = data?.info?.statistic?.[side];
  const countryStatistics = statistic?.country_statistics ?? [];
  const top3Statistics = statistic?.country_top3_statistics ?? [];
  const source = countryStatistics.length > 0 ? countryStatistics : top3Statistics;

  if (source.length) {
    return source
      .map((item) => ({
        logo: item.country_logo || '',
        country: item.country_name || '',
        count: Number(item.count || 0) || item.players?.length || 0,
        players: (item.players ?? []).map(toCountryPlayer),
      }))
      .filter((item) => item.logo && item.count > 0)
      .sort(sortCountryGroups);
  }

  const groupMap = players.reduce<Map<string, CountryGroup>>((map, player) => {
    const logo = player.national_logo || '';
    if (!logo) return map;

    const group =
      map.get(logo) ??
      ({
        logo,
        country: '',
        count: 0,
        players: [],
      } satisfies CountryGroup);

    group.count += 1;
    group.players.push(toCountryPlayer(player));
    map.set(logo, group);
    return map;
  }, new Map<string, CountryGroup>());

  return Array.from(groupMap.values()).sort(sortCountryGroups);
};

const valueOrDash = (value?: string) => (value && value.trim() ? value : '-');

const toCountryPlayer = (player: Player): CountryPlayer => ({
  player_id: player.player_id,
  player: player.player,
  player_logo: player.player_logo,
  shirt_num: player.shirt_num,
  position: player.position,
});

const sortCountryGroups = (a: CountryGroup, b: CountryGroup): number => {
  if (b.count !== a.count) return b.count - a.count;
  return (a.country || a.logo).localeCompare(b.country || b.logo);
};

const formatCoach = (coach?: CoachStats): string => {
  if (!coach) return '-';
  const name = valueOrDash(coach.coach);
  const country = valueOrDash(coach.country);
  if (name === '-' && country === '-') return '-';
  return `${name}(${country})`;
};

const formatCoachRate = (coach?: CoachStats): string => {
  if (!coach) return '-';
  const rate = valueOrDash(coach.win_rate);
  const win = valueOrDash(coach.win);
  const draw = valueOrDash(coach.draw);
  const lose = valueOrDash(coach.lose);
  if ([rate, win, draw, lose].every((item) => item === '-')) return '-';
  return `${rate}%(${win}/${draw}/${lose})`;
};

const average = (players: Player[], key: 'age' | 'height'): string => {
  const values = players.map((player) => Number(player[key])).filter((value) => value > 0);
  if (values.length === 0) return '-';
  const rounded =
    Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
};

const parseMarketToEuro = (value?: string): number => {
  const text = (value ?? '').replaceAll('€', '').replaceAll('欧', '').trim();
  if (!text || text === '-') return 0;
  const yi = text.match(/([\d.]+)\s*亿/);
  const wan = text.match(/([\d.]+)\s*万/);
  if (yi || wan) {
    return (Number(yi?.[1] ?? 0) || 0) * 100000000 + (Number(wan?.[1] ?? 0) || 0) * 10000;
  }
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric * 10000 : 0;
};

const sumMarket = (players: Player[]): string => {
  const total = players.reduce((sum, player) => sum + parseMarketToEuro(player.market_value), 0);
  if (total <= 0) return '-';
  if (total >= 100000000) {
    const yi = Math.floor(total / 100000000);
    const wan = Math.round((total % 100000000) / 10000);
    return `${yi}亿${wan}万欧`;
  }
  return `${Math.round(total / 10000)}万欧`;
};

const trimTrailingZeros = (value: string): string =>
  value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
