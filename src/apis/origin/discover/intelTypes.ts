/**
 * 赛事情报（/v2/sport/sd/match/intel）类型与归一化
 * 对齐 App intel_entity.dart
 */

/** 单条情报（有利/不利/中立） */
export interface IntelItem {
  /** 重要度，用于排序（数值越大越靠前） */
  level: number;
  text: string;
}

/** 主/客两侧情报 */
export interface IntelSide {
  home: IntelItem[];
  away: IntelItem[];
}

// ---------- 精算师报告 jss_intel ----------

export interface JssTeamInfo {
  teamName: string;
  formation: string;
}

export interface JssTeams {
  home: JssTeamInfo | null;
  away: JssTeamInfo | null;
}

export interface JssTacticalSide {
  team: string;
  coachPlan: string;
  formationStrategy: string;
  clubGoal: string;
}

export interface JssTacticalPlan {
  title: string;
  home: JssTacticalSide | null;
  away: JssTacticalSide | null;
}

export interface JssKeyPlayerItem {
  playerName: string;
  type: string;
  description: string;
}

export interface JssKeyPlayers {
  title: string;
  home: JssKeyPlayerItem[];
  away: JssKeyPlayerItem[];
}

export interface JssTrainingSide {
  summary: string;
  detail: string;
}

export interface JssTrainingStatus {
  title: string;
  home: JssTrainingSide | null;
  away: JssTrainingSide | null;
}

export interface JssLineupSide {
  formation: string;
  goalkeeper: string[];
  defenders: string[];
  midfielders: string[];
  forwards: string[];
}

export interface JssLineups {
  title: string;
  home: JssLineupSide | null;
  away: JssLineupSide | null;
}

export interface JssEvents {
  title: string;
  home: string;
  away: string;
}

export interface JssMetricItem {
  dimension: string;
  home: string;
  away: string;
  note: string;
}

export interface JssDataComparison {
  title: string;
  metrics: JssMetricItem[];
}

export interface JssPrediction {
  title: string;
  content: string;
}

export interface JssAnalyst {
  name: string;
  role: string;
}

export interface JssAnalysis {
  tacticalPlan: JssTacticalPlan | null;
  keyPlayers: JssKeyPlayers | null;
  trainingStatus: JssTrainingStatus | null;
}

export interface JssIntel {
  teams: JssTeams | null;
  analysis: JssAnalysis | null;
  lineups: JssLineups | null;
  events: JssEvents | null;
  dataComparison: JssDataComparison | null;
  prediction: JssPrediction | null;
  analyst: JssAnalyst | null;
}

/** 归一化后的赛事情报 */
export interface IntelData {
  good: IntelSide;
  bad: IntelSide;
  neutral: IntelItem[];
  jss: JssIntel | null;
}

// ---------- 归一化 ----------

type Json = Record<string, unknown>;

const asObject = (raw: unknown): Json | null =>
  raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Json) : null;

const asString = (raw: unknown): string => (typeof raw === 'string' ? raw : '');

/** level 在接口里是字符串，转数值用于排序 */
const asLevel = (raw: unknown): number => {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

const asStringList = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];

const toIntelItem = (raw: unknown): IntelItem => {
  const json = asObject(raw) ?? {};
  return { level: asLevel(json.level), text: asString(json.text) };
};

const toIntelItemList = (raw: unknown): IntelItem[] =>
  Array.isArray(raw) ? raw.map(toIntelItem) : [];

const toIntelSide = (raw: unknown): IntelSide => {
  const json = asObject(raw) ?? {};
  return { home: toIntelItemList(json.home), away: toIntelItemList(json.away) };
};

const toJssTeamInfo = (raw: unknown): JssTeamInfo | null => {
  const json = asObject(raw);
  if (!json) return null;
  return { teamName: asString(json.team_name), formation: asString(json.formation) };
};

const toJssTacticalSide = (raw: unknown): JssTacticalSide | null => {
  const json = asObject(raw);
  if (!json) return null;
  return {
    team: asString(json.team),
    coachPlan: asString(json.coach_plan),
    formationStrategy: asString(json.formation_strategy),
    clubGoal: asString(json.club_goal),
  };
};

const toJssKeyPlayerItem = (raw: unknown): JssKeyPlayerItem => {
  const json = asObject(raw) ?? {};
  return {
    playerName: asString(json.player_name),
    type: asString(json.type),
    description: asString(json.description),
  };
};

const toJssTrainingSide = (raw: unknown): JssTrainingSide | null => {
  const json = asObject(raw);
  if (!json) return null;
  return { summary: asString(json.summary), detail: asString(json.detail) };
};

const toJssLineupSide = (raw: unknown): JssLineupSide | null => {
  const json = asObject(raw);
  if (!json) return null;
  return {
    formation: asString(json.formation),
    goalkeeper: asStringList(json.goalkeeper),
    defenders: asStringList(json.defenders),
    midfielders: asStringList(json.midfielders),
    forwards: asStringList(json.forwards),
  };
};

const toJssMetricItem = (raw: unknown): JssMetricItem => {
  const json = asObject(raw) ?? {};
  return {
    dimension: asString(json.dimension),
    home: asString(json.home),
    away: asString(json.away),
    note: asString(json.note),
  };
};

const toJssAnalysis = (raw: unknown): JssAnalysis | null => {
  const json = asObject(raw);
  if (!json) return null;
  const tactical = asObject(json.tactical_plan);
  const keyPlayers = asObject(json.key_players);
  const training = asObject(json.training_status);
  return {
    tacticalPlan: tactical
      ? {
          title: asString(tactical.title),
          home: toJssTacticalSide(tactical.home),
          away: toJssTacticalSide(tactical.away),
        }
      : null,
    keyPlayers: keyPlayers
      ? {
          title: asString(keyPlayers.title),
          home: Array.isArray(keyPlayers.home) ? keyPlayers.home.map(toJssKeyPlayerItem) : [],
          away: Array.isArray(keyPlayers.away) ? keyPlayers.away.map(toJssKeyPlayerItem) : [],
        }
      : null,
    trainingStatus: training
      ? {
          title: asString(training.title),
          home: toJssTrainingSide(training.home),
          away: toJssTrainingSide(training.away),
        }
      : null,
  };
};

const toJssIntel = (raw: unknown): JssIntel | null => {
  const json = asObject(raw);
  if (!json) return null;

  const teams = asObject(json.teams);
  const lineups = asObject(json.lineups);
  const events = asObject(json.events);
  const comparison = asObject(json.data_comparison);
  const prediction = asObject(json.prediction);
  const analyst = asObject(json.analyst);

  return {
    teams: teams ? { home: toJssTeamInfo(teams.home), away: toJssTeamInfo(teams.away) } : null,
    analysis: toJssAnalysis(json.analysis),
    lineups: lineups
      ? {
          title: asString(lineups.title),
          home: toJssLineupSide(lineups.home),
          away: toJssLineupSide(lineups.away),
        }
      : null,
    events: events
      ? {
          title: asString(events.title),
          home: asString(events.home),
          away: asString(events.away),
        }
      : null,
    dataComparison: comparison
      ? {
          title: asString(comparison.title),
          metrics: Array.isArray(comparison.metrics) ? comparison.metrics.map(toJssMetricItem) : [],
        }
      : null,
    prediction: prediction
      ? { title: asString(prediction.title), content: asString(prediction.content) }
      : null,
    analyst: analyst ? { name: asString(analyst.name), role: asString(analyst.role) } : null,
  };
};

export const normalizeIntelData = (raw: unknown): IntelData => {
  const json = asObject(raw) ?? {};
  return {
    good: toIntelSide(json.good),
    bad: toIntelSide(json.bad),
    neutral: toIntelItemList(json.neutral),
    jss: toJssIntel(json.jss_intel),
  };
};

/** jss 报告是否有可展示内容 */
export const hasJssContent = (jss: JssIntel | null): boolean => {
  if (!jss) return false;
  const a = jss.analysis;
  return Boolean(
    a?.tacticalPlan ||
    a?.keyPlayers ||
    a?.trainingStatus ||
    jss.lineups ||
    jss.events ||
    jss.dataComparison ||
    jss.prediction,
  );
};
