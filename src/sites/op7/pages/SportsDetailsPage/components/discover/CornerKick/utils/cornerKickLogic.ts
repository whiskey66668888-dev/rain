import type {
  CornerKickBigSmallRate,
  CornerKickConnerData,
  CornerKickHistoryRow,
  CornerKickMatchRecord,
  CornerKickStatsRow,
} from '@/apis/origin/discover/cornerKickTypes';

const TOTAL_THRESHOLDS = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5];
const TEAM_THRESHOLDS = [2.5, 3.5, 4.5, 5.5];

const toInt = (value?: string | null): number | null => {
  const text = (value ?? '').trim();
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const toDouble = (value?: string | null): number | null => {
  const text = (value ?? '').trim();
  if (!text) return null;
  const parsed = Number.parseFloat(text);
  return Number.isNaN(parsed) ? null : parsed;
};

const round1 = (value: number): number => Math.round((value + 1e-8) * 10) / 10;

const round1JsLike = (value: number): number => Math.round(value * 10) / 10;

const roundThresholdPercent = (value: number): number => {
  const base = Math.floor(value);
  const decimal = value - base;
  return decimal >= 0.45 ? base + 1 : base;
};

const jsNumberLike = (value?: string | null, nullAsZero = false): number | null => {
  if (value == null) return nullAsZero ? 0 : null;
  const raw = String(value);
  if (raw === '' || raw.trim() === '') return 0;
  const parsed = Number.parseFloat(raw.trim());
  return Number.isNaN(parsed) ? null : parsed;
};

const isValidNumStrLikeH5 = (value?: string | null): boolean => jsNumberLike(value, false) != null;

const isValidHandicap = (value?: string | null): boolean => {
  const parsed = toDouble(value);
  return parsed != null && parsed !== 0;
};

export const mostFrequentTeamName = (list: CornerKickMatchRecord[]): string => {
  const counter = new Map<string, number>();

  list.forEach((match) => {
    const homeName = (match.homeTeamName ?? '').trim();
    const awayName = (match.awayTeamName ?? '').trim();
    if (homeName) counter.set(homeName, (counter.get(homeName) ?? 0) + 1);
    if (awayName) counter.set(awayName, (counter.get(awayName) ?? 0) + 1);
  });

  let best = '';
  let bestCount = 0;
  counter.forEach((count, name) => {
    if (count > bestCount) {
      bestCount = count;
      best = name;
    }
  });

  return best;
};

export const getCornerKickPageTeams = (conner: CornerKickConnerData | null) => {
  if (!conner) return { homeName: '', awayName: '' };
  return {
    homeName: mostFrequentTeamName(conner.homeRanking),
    awayName: mostFrequentTeamName(conner.awayRanking),
  };
};

const filterSameRole = ({
  matches,
  sameTeam,
  isHomeBlock,
  teamName,
}: {
  matches: CornerKickMatchRecord[];
  sameTeam: boolean;
  isHomeBlock: boolean;
  teamName: string;
}): CornerKickMatchRecord[] => {
  if (!sameTeam || !teamName) return matches;
  if (isHomeBlock) {
    return matches.filter((match) => (match.homeTeamName ?? '') === teamName);
  }
  return matches.filter((match) => (match.awayTeamName ?? '') === teamName);
};

const takeN = (list: CornerKickMatchRecord[], count: number): CornerKickMatchRecord[] =>
  list.length <= count ? list : list.slice(0, count);

const pickTotal = (match: CornerKickMatchRecord): number => {
  const home = toInt(match.homeConnerGoal);
  const away = toInt(match.awayConnerGoal);
  if (home == null || away == null) return -1;
  return home + away;
};

const pickForByTeam = (match: CornerKickMatchRecord, teamName: string): number => {
  const home = toInt(match.homeConnerGoal);
  const away = toInt(match.awayConnerGoal);
  if (home == null || away == null) return -1;
  return (match.homeTeamName ?? '').trim() === teamName.trim() ? home : away;
};

const pickAgainstByTeam = (match: CornerKickMatchRecord, teamName: string): number => {
  const home = toInt(match.homeConnerGoal);
  const away = toInt(match.awayConnerGoal);
  if (home == null || away == null) return -1;
  return (match.homeTeamName ?? '').trim() === teamName.trim() ? away : home;
};

const avgValue = (
  matches: CornerKickMatchRecord[],
  pick: (match: CornerKickMatchRecord) => number,
): number => {
  let total = 0;
  let count = 0;

  matches.forEach((match) => {
    const value = pick(match);
    if (value < 0) return;
    total += value;
    count += 1;
  });

  return count === 0 ? 0 : total / count;
};

const percentTotalLikeH5 = (matches: CornerKickMatchRecord[], threshold: number): number => {
  const validList = matches.filter(
    (match) =>
      isValidNumStrLikeH5(match.homeConnerGoal) && isValidNumStrLikeH5(match.awayConnerGoal),
  );

  if (validList.length === 0) return 0;

  const overCount = validList.filter((match) => {
    const home = jsNumberLike(match.homeConnerGoal, false) ?? 0;
    const away = jsNumberLike(match.awayConnerGoal, false) ?? 0;
    return home + away > threshold;
  }).length;

  return (overCount / validList.length) * 100;
};

const percentForLikeH5 = (
  matches: CornerKickMatchRecord[],
  threshold: number,
  teamName: string,
): number => {
  const values = matches
    .map((match) => {
      const homeName = (match.homeTeamName ?? '').trim();
      const home = jsNumberLike(match.homeConnerGoal, false);
      const away = jsNumberLike(match.awayConnerGoal, false);
      const value = homeName === teamName.trim() ? home : away;
      return value ?? Number.NaN;
    })
    .filter((value) => !Number.isNaN(value));

  if (values.length === 0) return 0;

  const totalSum = values.reduce((sum, value) => sum + value, 0);
  if (totalSum === 0) return 0;

  const overCount = values.filter((value) => value > threshold).length;
  return (overCount / values.length) * 100;
};

const percentAgainstLikeH5 = (
  matches: CornerKickMatchRecord[],
  threshold: number,
  teamName: string,
): number => {
  const values = matches
    .map((match) => {
      const homeName = (match.homeTeamName ?? '').trim();
      const home = jsNumberLike(match.homeConnerGoal, false);
      const away = jsNumberLike(match.awayConnerGoal, false);
      const value = homeName === teamName.trim() ? away : home;
      return value ?? Number.NaN;
    })
    .filter((value) => !Number.isNaN(value));

  if (values.length === 0) return 0;

  const totalSum = values.reduce((sum, value) => sum + value, 0);
  if (totalSum === 0) return 0;

  const overCount = values.filter((value) => value > threshold).length;
  return (overCount / values.length) * 100;
};

const buildTeamStatsRows = ({
  conner,
  teamName,
  sameTeam,
  isHomeBlock,
  matchCount,
  thresholds,
  avgLabel,
  pickAvg,
  pickPercent,
}: {
  conner: CornerKickConnerData;
  teamName: string;
  sameTeam: boolean;
  isHomeBlock: boolean;
  matchCount: number;
  thresholds: number[];
  avgLabel: string;
  pickAvg: (match: CornerKickMatchRecord) => number;
  pickPercent: (matches: CornerKickMatchRecord[], threshold: number, name: string) => number;
}): CornerKickStatsRow[] => {
  const matches = takeN(
    filterSameRole({
      matches: isHomeBlock ? conner.homeRanking : conner.awayRanking,
      sameTeam,
      isHomeBlock,
      teamName,
    }),
    matchCount,
  );

  const homeAvg = round1(avgValue(matches, pickAvg));
  const rows: CornerKickStatsRow[] = [
    {
      label: avgLabel,
      home: homeAvg,
      away: 0,
      avg: homeAvg,
      type: 'avg',
    },
  ];

  thresholds.forEach((threshold) => {
    const percent = pickPercent(matches, threshold, teamName);
    rows.push({
      label: `超过${threshold}`,
      home: roundThresholdPercent(percent),
      away: 0,
      avg: roundThresholdPercent(percent),
      type: 'percent',
    });
  });

  return rows;
};

const mergeTeamStatsRows = (
  homeRows: CornerKickStatsRow[],
  awayRows: CornerKickStatsRow[],
): CornerKickStatsRow[] =>
  homeRows.map((row, index) => {
    const awayRow = awayRows[index];
    const home = row.home;
    const away = awayRow?.home ?? 0;
    return {
      ...row,
      home,
      away,
      avg:
        row.type === 'avg'
          ? round1JsLike((home + away) / 2)
          : (Math.round(home) + Math.round(away)) / 2,
    };
  });

export const buildTotalStatsRows = ({
  conner,
  homeName,
  awayName,
  sameHomeAway,
  selectedTabId,
}: {
  conner: CornerKickConnerData;
  homeName: string;
  awayName: string;
  sameHomeAway: boolean;
  selectedTabId: number;
}): CornerKickStatsRow[] => {
  const matchCount = selectedTabId === 0 ? 10 : 20;
  const homeRows = buildTeamStatsRows({
    conner,
    teamName: homeName,
    sameTeam: sameHomeAway,
    isHomeBlock: true,
    matchCount,
    thresholds: TOTAL_THRESHOLDS,
    avgLabel: '场均角球',
    pickAvg: pickTotal,
    pickPercent: percentTotalLikeH5,
  });
  const awayRows = buildTeamStatsRows({
    conner,
    teamName: awayName,
    sameTeam: sameHomeAway,
    isHomeBlock: false,
    matchCount,
    thresholds: TOTAL_THRESHOLDS,
    avgLabel: '场均角球',
    pickAvg: pickTotal,
    pickPercent: percentTotalLikeH5,
  });
  return mergeTeamStatsRows(homeRows, awayRows);
};

export const buildForStatsRows = ({
  conner,
  homeName,
  awayName,
  sameHomeAway,
  selectedTabId,
}: {
  conner: CornerKickConnerData;
  homeName: string;
  awayName: string;
  sameHomeAway: boolean;
  selectedTabId: number;
}): CornerKickStatsRow[] => {
  const matchCount = selectedTabId === 0 ? 10 : 20;
  const homeRows = buildTeamStatsRows({
    conner,
    teamName: homeName,
    sameTeam: sameHomeAway,
    isHomeBlock: true,
    matchCount,
    thresholds: TEAM_THRESHOLDS,
    avgLabel: '场均获得角球',
    pickAvg: (match) => pickForByTeam(match, homeName),
    pickPercent: percentForLikeH5,
  });
  const awayRows = buildTeamStatsRows({
    conner,
    teamName: awayName,
    sameTeam: sameHomeAway,
    isHomeBlock: false,
    matchCount,
    thresholds: TEAM_THRESHOLDS,
    avgLabel: '场均获得角球',
    pickAvg: (match) => pickForByTeam(match, awayName),
    pickPercent: percentForLikeH5,
  });
  return mergeTeamStatsRows(homeRows, awayRows);
};

export const buildAgainstStatsRows = ({
  conner,
  homeName,
  awayName,
  sameHomeAway,
  selectedTabId,
}: {
  conner: CornerKickConnerData;
  homeName: string;
  awayName: string;
  sameHomeAway: boolean;
  selectedTabId: number;
}): CornerKickStatsRow[] => {
  const matchCount = selectedTabId === 0 ? 10 : 20;
  const homeRows = buildTeamStatsRows({
    conner,
    teamName: homeName,
    sameTeam: sameHomeAway,
    isHomeBlock: true,
    matchCount,
    thresholds: TEAM_THRESHOLDS,
    avgLabel: '场均获失角球',
    pickAvg: (match) => pickAgainstByTeam(match, homeName),
    pickPercent: percentAgainstLikeH5,
  });
  const awayRows = buildTeamStatsRows({
    conner,
    teamName: awayName,
    sameTeam: sameHomeAway,
    isHomeBlock: false,
    matchCount,
    thresholds: TEAM_THRESHOLDS,
    avgLabel: '场均获失角球',
    pickAvg: (match) => pickAgainstByTeam(match, awayName),
    pickPercent: percentAgainstLikeH5,
  });
  return mergeTeamStatsRows(homeRows, awayRows);
};

export const filterHistoryMatches = ({
  list,
  selectedIndex,
  teamName,
}: {
  list: CornerKickMatchRecord[];
  selectedIndex: number;
  teamName: string;
}): CornerKickMatchRecord[] => {
  if (!teamName) return list;
  if (selectedIndex === 0) return list;
  if (selectedIndex === 1) {
    return list.filter((match) => (match.homeTeamName ?? '') === teamName);
  }
  return list.filter((match) => (match.awayTeamName ?? '') === teamName);
};

export const calcBigSmallRate = (list: CornerKickMatchRecord[]): CornerKickBigSmallRate => {
  let big = 0;
  let small = 0;

  const totalMatches = list.filter((match) => isValidHandicap(match.handicap)).length;
  if (totalMatches === 0) return { bigRate: 0, smallRate: 0 };

  list.forEach((match) => {
    const handicap = toDouble(match.handicap);
    if (handicap == null || handicap === 0) return;

    const homeGoals = toInt(match.homeConnerGoal) ?? 0;
    const awayGoals = toInt(match.awayConnerGoal) ?? 0;
    const total = homeGoals + awayGoals;

    if (handicap > total) small += 1;
    else if (handicap < total) big += 1;
  });

  return {
    bigRate: (big / totalMatches) * 100,
    smallRate: (small / totalMatches) * 100,
  };
};

export const buildHistoryRow = (
  match: CornerKickMatchRecord,
  teamName: string,
): CornerKickHistoryRow => {
  const homeName = (match.homeTeamName ?? '').toString();
  const awayName = (match.awayTeamName ?? '').toString();
  const homeGoals = toInt(match.homeConnerGoal);
  const awayGoals = toInt(match.awayConnerGoal);

  let homeHighlight: CornerKickHistoryRow['homeHighlight'] = 'none';
  let awayHighlight: CornerKickHistoryRow['awayHighlight'] = 'none';

  if (homeGoals != null && awayGoals != null && teamName) {
    if (homeName === teamName) {
      if (homeGoals > awayGoals) homeHighlight = 'win';
      if (homeGoals < awayGoals) homeHighlight = 'lose';
    } else if (awayName === teamName) {
      if (awayGoals > homeGoals) awayHighlight = 'win';
      if (awayGoals < homeGoals) awayHighlight = 'lose';
    }
  }

  let bigSmallText = '-';
  let bigSmallTone: CornerKickHistoryRow['bigSmallTone'] = 'none';
  const handicap = toDouble(match.handicap);
  if (handicap != null && handicap !== 0) {
    const total = (toInt(match.homeConnerGoal) ?? 0) + (toInt(match.awayConnerGoal) ?? 0);
    const isSmall = handicap > total;
    bigSmallTone = isSmall ? 'small' : 'big';
    bigSmallText = `${match.handicap ?? ''}${isSmall ? '小' : '大'}`;
  }

  const matchTime = (match.matchTime ?? '').toString();
  const date = matchTime.length >= 10 ? matchTime.slice(2, 10) : matchTime;

  return {
    date,
    league: (match.tournamentName ?? '').toString(),
    home: homeName,
    away: awayName,
    corners: `${match.homeConnerGoal ?? '-'}:${match.awayConnerGoal ?? '-'}`,
    homeHighlight,
    awayHighlight,
    bigSmallText,
    bigSmallTone,
  };
};
