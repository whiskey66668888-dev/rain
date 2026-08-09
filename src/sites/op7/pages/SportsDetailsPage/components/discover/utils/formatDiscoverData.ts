import type {
  IncidentItem,
  IncidentMsg,
  Player,
  LiveInfoItem,
  LiveSituationData,
  TeamStatItem,
} from '@/apis/origin/discover';

type TeamStatsData = NonNullable<LiveSituationData['team_stats']>;

export const toPercentNumber = (value: unknown, fallback = 0): number => {
  const text =
    typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint'
      ? String(value)
      : '';
  const next = Number(text.replace('%', '').trim());
  if (Number.isFinite(next)) return Math.max(0, Math.min(100, next));
  return fallback;
};

const textBroadcastTypeMap: Record<string, Set<string>> = {
  goal: new Set(['1', '8', '17']),
  corner: new Set(['2']),
  card: new Set(['3', '4', '15']),
  substitute: new Set(['9']),
};

const textBroadcastTabLabelMap: Record<string, string> = {
  goal: '进球',
  corner: '角球',
  card: '红黄牌',
  substitute: '换人',
};

const eventTypeTextMap: Record<string, string> = {
  '1': '进球',
  '2': '角球',
  '3': '黄牌',
  '4': '红牌',
  '8': '点球',
  '9': '换人',
  '15': '两黄变红',
  '17': '乌龙球',
  '29': '点球大战',
  '30': '点球未进',
};

const neutralEventTypes = new Set(['11', '12', '19', '27']);

const goalEventTypes = new Set(['1', '8', '17', '29']);

export interface BroadcastFilterTab {
  type: string;
  label: string;
}

export const getBroadcastFilterTabs = (list: LiveInfoItem[] = []): BroadcastFilterTab[] => {
  const availableTypes = new Set<string>();

  list.forEach((item) => {
    const itemType = item.type;
    Object.entries(textBroadcastTypeMap).forEach(([type, values]) => {
      if (values.has(itemType)) availableTypes.add(type);
    });
  });

  return [
    { type: 'all', label: '全部' },
    ...Object.keys(textBroadcastTypeMap)
      .filter((type) => availableTypes.has(type))
      .map((type) => ({ type, label: textBroadcastTabLabelMap[type] ?? type })),
  ];
};

export const filterBroadcastList = (list: LiveInfoItem[], filterType: string): LiveInfoItem[] => {
  if (filterType === 'all') return list;
  const values = textBroadcastTypeMap[filterType];
  if (!values) return list;
  return list.filter((item) => values.has(item.type));
};

export const shouldShowLiveItemBackground = (type: string): boolean =>
  ['0', '10', '11', '12'].includes(type);

const buildIncidentMessages = (item: IncidentItem): IncidentMsg[] => {
  const type = item.type;
  const messages: IncidentMsg[] = [];

  if (['1', '8', '17', '29'].includes(type)) {
    messages.push({
      text: `${item.home_score} - ${item.away_score}`,
      isTip: false,
    });
  }

  if (type === '1') {
    messages.push({ text: item.player_name ?? '', icon: eventTypeTextMap[type], isTip: false });
    if (item.assist1_name) {
      messages.push({ text: item.assist1_name, icon: '助攻', isAssist: true });
    }
  } else if (type === '3' || type === '4') {
    messages.push({ text: item.player_name ?? '', icon: eventTypeTextMap[type], isTip: false });
    if (item.reason) messages.push({ text: item.reason, isTip: true });
  } else if (type === '9') {
    messages.push({ text: item.in_player_name ?? '', icon: '上' });
    messages.push({ text: item.out_player_name ?? '', icon: '下' });
    messages.push({ text: '换人', isTip: true });
  } else if (type === '8' || type === '15') {
    messages.push({ text: item.player_name ?? '', icon: eventTypeTextMap[type], isTip: false });
    messages.push({ text: item.type_info ?? '', icon: eventTypeTextMap[type], isTip: true });
  } else if (type === '29') {
    messages.push({ text: item.type_info ?? '', icon: '得分', isTip: false });
  } else if (type === '30') {
    messages.push({ text: item.type_info ?? '', icon: '未进', isTip: false });
  } else if (item.position !== '0') {
    messages.push({ text: item.player_name ?? '', icon: eventTypeTextMap[type] });
    if (item.reason) messages.push({ text: item.reason, isTip: true });
  }

  return messages.filter((message) => message.text.trim().length > 0);
};

export const formatIncidentData = (list: IncidentItem[] = []): IncidentItem[] =>
  [...list].reverse().map((item) => ({
    ...item,
    list: buildIncidentMessages(item),
  }));

export const isGoalIncident = (item: IncidentItem): boolean => goalEventTypes.has(item.type);

export const getVisibleIncidentRows = (
  incidents: IncidentItem[] = [],
  onlyGoals = false,
): IncidentItem[] =>
  incidents.filter((item) => {
    const isVisibleNeutral = neutralEventTypes.has(item.type) && item.position === '0';
    const isTeamEvent = item.position !== '0';
    if (!isVisibleNeutral && !isTeamEvent) return false;
    if (!onlyGoals) return true;
    return isGoalIncident(item);
  });

export const getPenaltyShootoutScore = (incidents: IncidentItem[] = []): string => {
  const score = incidents.reduce(
    (acc, item) => {
      if (item.type !== '29') return acc;
      if (item.position === '1') acc.home += 1;
      if (item.position === '2') acc.away += 1;
      return acc;
    },
    { home: 0, away: 0 },
  );

  if (score.home === 0 && score.away === 0) return '';
  return `${score.home}-${score.away}`;
};

export const getScoreByIncidentTime = (
  targetItem: IncidentItem,
  incidents: IncidentItem[] = [],
): string => {
  if (targetItem.home_score && targetItem.away_score) {
    return `${targetItem.home_score}-${targetItem.away_score}`;
  }

  let targetSecond = Number(targetItem.second || 0);
  if (!Number.isFinite(targetSecond) || targetSecond === 0) {
    if (targetItem.type === '12' || targetItem.type_info?.includes('结束')) {
      targetSecond = 999999;
    } else if (targetItem.type === '11' || targetItem.type_info?.includes('中场')) {
      targetSecond = 45 * 60 + 3000;
    }
  }

  const sorted = [...incidents].sort((a, b) => Number(a.second || 0) - Number(b.second || 0));

  let lastScore = '';
  sorted.some((item) => {
    if (item.home_score && item.away_score) {
      lastScore = `${item.home_score}-${item.away_score}`;
    }

    const itemSecond = Number(item.second || 0);
    return Number.isFinite(itemSecond) && itemSecond > targetSecond;
  });

  return lastScore;
};

export const formatIncidentTime = (item: IncidentItem, incidents: IncidentItem[] = []): string => {
  if (item.type === '12') {
    const score = getScoreByIncidentTime(item, incidents);
    return score ? `FT ${score}` : 'FT';
  }

  if (item.type === '11') {
    const score = getScoreByIncidentTime(item, incidents);
    return score ? `HT ${score}` : 'HT';
  }

  if (item.type === '19') return item.type_info || '伤停补时';

  if (item.type === '27') {
    const score = getPenaltyShootoutScore(incidents);
    return score ? `点球大战结束 ${score}` : '点球大战结束';
  }

  const second = Number(item.second || 0);
  if (Number.isFinite(second) && second > 0) {
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;
    const displayMinutes = minutes + (seconds > 0 ? 1 : 0);
    if (displayMinutes > 90) return `90+${displayMinutes - 90}'`;
    if (displayMinutes > 45 && item.time === '45') return `45+${displayMinutes - 45}'`;
    return `${displayMinutes}'`;
  }

  if (['halftime', 'fulltime'].includes(item.type)) return item.type_info || item.type;
  return item.time ? `${item.time}'` : '';
};

export const groupPlayersByRow = (players: Player[] = [], invert = false): Player[][] => {
  const grouped = new Map<string, Player[]>();

  players.forEach((player) => {
    const y = player.player_y || '0';
    const group = grouped.get(y) ?? [];
    group.push(player);
    grouped.set(y, group);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, row]) =>
      [...row].sort((a, b) => {
        const left = Number(a.player_x || '0');
        const right = Number(b.player_x || '0');
        return invert ? right - left : left - right;
      }),
    );
};

export const getTeamStatRows = (items: TeamStatItem[] = []): TeamStatItem[] =>
  items.filter((item) => item.item_name || item.home || item.away);

export const getTeamStatValue = (item?: TeamStatItem, side: 'home' | 'away' = 'home'): string =>
  item?.[side] || '0';

export const getTeamStatDisplayValue = (item: TeamStatItem, side: 'home' | 'away'): string => {
  const value = item[side] || '0';
  const rate = side === 'home' ? item.home_rate : item.away_rate;
  return rate ? `${value}(${rate})` : value;
};

export const getTeamStatGroups = (teamStats?: TeamStatsData | null) => [
  { label: '全部', rows: teamStats?.full_state ?? [] },
  { label: '上半场', rows: teamStats?.before_half_state ?? [] },
];

export const shouldShowTeamStatDivider = (
  item: TeamStatItem,
  index: number,
  total: number,
): boolean =>
  item.item_name === '危险进攻' ||
  item.item_name === '红牌' ||
  item.item_name === '1对1拼抢成功' ||
  item.item_name === '1对1抢断成功' ||
  item.item_name === '有效阻挡' ||
  index === total - 1;

export interface PreparedTeamStats {
  ballControl?: TeamStatItem;
  rows: TeamStatItem[];
  shotOnTarget?: TeamStatItem;
  shotOffTarget?: TeamStatItem;
  hasShotSummary: boolean;
}

export const prepareTeamStatRows = (items: TeamStatItem[] = []): PreparedTeamStats => {
  const sourceRows = getTeamStatRows(items);
  const ballControl = sourceRows.find(
    (item) => item.item_name === '控球率' || item.item_id === '25',
  );
  const shotOnTarget = sourceRows.find(
    (item) => item.item_name === '射正' || item.item_id === '21',
  );
  const shotOffTarget = sourceRows.find(
    (item) => item.item_name === '射偏' || item.item_id === '22',
  );

  const rows = sourceRows.filter(
    (item) =>
      item !== ballControl &&
      item !== shotOnTarget &&
      item !== shotOffTarget &&
      item.item_name &&
      item.home !== '' &&
      item.away !== '',
  );

  rows.sort((a, b) => {
    if (a.item_name === '射门' || a.item_id === '83') return -1;
    if (b.item_name === '射门' || b.item_id === '83') return 1;
    return 0;
  });

  const offsideIndex = rows.findIndex((item) => item.item_name === '越位');
  if (offsideIndex !== -1) {
    const [offside] = rows.splice(offsideIndex, 1);
    if (offside) {
      const cornerIndex = rows.findIndex((item) => item.item_name === '角球');
      rows.splice(cornerIndex === -1 ? rows.length : cornerIndex + 1, 0, offside);
    }
  }

  return {
    ballControl,
    rows,
    shotOnTarget,
    shotOffTarget,
    hasShotSummary: Boolean(shotOnTarget || shotOffTarget),
  };
};
