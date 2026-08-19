/**
 * 发现页「进球」mock 数据
 *
 * 近期比赛缺少真实进球数据时的兜底：构造与后端 /v2/sport/match/goal 完全一致的
 * snake_case 原始报文，再走真实的 normalizeGoalData，保证解析链路与九个 tab 视图
 * 都能正常渲染。数值为主强客弱的一套合理示例。
 */

import { normalizeGoalData, type GoalData } from './goalTypes';

/**
 * 进球数据 mock 兜底开关（仅影响 /goal 无数据时是否用 mock）。
 * 「进球」子 tab 是否展示一律以 /v2/sport/match/tab 接口为准，不做本地补 tab。
 */
export const USE_GOAL_MOCK_FALLBACK = false;

/** 发现子 tab 中进球的标题（与 DISCOVER_SUB_TAB_ORDER 保持一致） */
export const GOAL_SUB_TAB_TITLE = '进球';

const QUARTERS = [
  'first_quarter',
  'second_quarter',
  'third_quarter',
  'fourth_quarter',
  'fifth_quarter',
  'sixth_quarter',
] as const;

/** 把 [0-15, 15-30, ...] 的六段数组展开成 total_scored_first_quarter 之类的扁平 key */
const expandDist = (metrics: Record<string, number[]>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [metric, arr] of Object.entries(metrics)) {
    QUARTERS.forEach((q, i) => {
      out[`${metric}_${q}`] = String(arr[i] ?? 0);
    });
  }
  return out;
};

/** 主队进球分布（较强：进球多、失球少） */
const homeDist = expandDist({
  total_scored: [5, 7, 9, 6, 8, 11],
  home_scored: [3, 4, 5, 3, 4, 6],
  away_scored: [2, 3, 4, 3, 4, 5],
  total_conceded: [3, 4, 3, 5, 4, 6],
  home_conceded: [1, 2, 1, 2, 2, 3],
  away_conceded: [2, 2, 2, 3, 2, 3],
});

/** 客队进球分布（较弱：进球少、失球多） */
const awayDist = expandDist({
  total_scored: [3, 4, 5, 4, 5, 6],
  home_scored: [2, 2, 3, 2, 3, 3],
  away_scored: [1, 2, 2, 2, 2, 3],
  total_conceded: [4, 5, 6, 5, 6, 8],
  home_conceded: [2, 2, 3, 2, 3, 4],
  away_conceded: [2, 3, 3, 3, 3, 4],
});

/** /v2/sport/match/goal 的原始 data 报文（snake_case，未归一化） */
const rawGoalPayload: Record<string, unknown> = {
  goal: {
    goal_static_time_15_num: { home: homeDist, away: awayDist },

    goal_static_num: {
      home: {
        total_matches: '20',
        home_matches: '10',
        away_matches: '10',
        total_normal_05: '18',
        total_normal_15: '15',
        total_normal_25: '11',
        total_normal_35: '6',
      },
      away: {
        total_matches: '20',
        home_matches: '10',
        away_matches: '10',
        total_normal_05: '16',
        total_normal_15: '12',
        total_normal_25: '8',
        total_normal_35: '4',
      },
    },

    goal_static_num_avg: {
      home: {
        total_normal_goal_avg: '3.2',
        home_normal_goal_avg: '3.5',
        away_normal_goal_avg: '2.9',
        total_normal_loss_goal_avg: '1.3',
        home_normal_loss_goal_avg: '1.0',
        away_normal_loss_goal_avg: '1.6',
        total_normal_in_goal_avg: '1.9',
        home_normal_in_goal_avg: '2.2',
        away_normal_in_goal_avg: '1.5',
      },
      away: {
        total_normal_goal_avg: '2.6',
        home_normal_goal_avg: '2.9',
        away_normal_goal_avg: '2.3',
        total_normal_loss_goal_avg: '1.6',
        home_normal_loss_goal_avg: '1.3',
        away_normal_loss_goal_avg: '1.9',
        total_normal_in_goal_avg: '1.3',
        home_normal_in_goal_avg: '1.6',
        away_normal_in_goal_avg: '1.0',
      },
    },

    // 首球平均时间（秒）
    first_goal_time_avg: {
      home: {
        total_scored_first_time_avg: '1620',
        home_scored_first_time_avg: '1440',
        away_scored_first_time_avg: '1800',
        total_conceded_first_time_avg: '2040',
        home_conceded_first_time_avg: '2280',
        away_conceded_first_time_avg: '1860',
      },
      away: {
        total_scored_first_time_avg: '1980',
        home_scored_first_time_avg: '1740',
        away_scored_first_time_avg: '2160',
        total_conceded_first_time_avg: '1500',
        home_conceded_first_time_avg: '1680',
        away_conceded_first_time_avg: '1380',
      },
    },

    first_goal_grade: {
      home: {
        total_scored_first: '12',
        total_scored_first_win: '9',
        total_scored_first_draw: '2',
        total_scored_first_loss: '1',
        total_opponent_scored: '8',
        total_opponent_scored_win: '2',
        total_opponent_scored_draw: '3',
        total_opponent_scored_loss: '3',
      },
      away: {
        total_scored_first: '9',
        total_scored_first_win: '5',
        total_scored_first_draw: '2',
        total_scored_first_loss: '2',
        total_opponent_scored: '11',
        total_opponent_scored_win: '2',
        total_opponent_scored_draw: '3',
        total_opponent_scored_loss: '6',
      },
    },

    teach_handicap: {
      home: {
        total_as_win: '12',
        total_as_loss: '8',
        total_tl_over: '11',
        total_tl_under: '9',
        home_as_win: '7',
        home_as_loss: '3',
        home_tl_over: '6',
        home_tl_under: '4',
        away_as_win: '5',
        away_as_loss: '5',
        away_tl_over: '5',
        away_tl_under: '5',
        tournament_id: '36',
        season_id: '2024',
      },
      away: {
        total_as_win: '9',
        total_as_loss: '11',
        total_tl_over: '8',
        total_tl_under: '12',
        home_as_win: '5',
        home_as_loss: '5',
        home_tl_over: '5',
        home_tl_under: '5',
        away_as_win: '4',
        away_as_loss: '6',
        away_tl_over: '3',
        away_tl_under: '7',
        tournament_id: '36',
        season_id: '2024',
      },
    },

    tech_other: {
      home: {
        total_matches: '20',
        total_normal_bts: '12',
        total_normal_cs: '7',
        total_half_normal_goal: '9',
        total_half_normal_loss_goal: '6',
      },
      away: {
        total_matches: '20',
        total_normal_bts: '13',
        total_normal_cs: '4',
        total_half_normal_goal: '7',
        total_half_normal_loss_goal: '10',
      },
    },

    tech_state: {
      home: {
        total_normal_goal_avg: '1.9',
        total_normal_score_avg: '1.9',
        total_normal_concede_avg: '1.3',
        total_recent_goal_avg: '2.3',
        total_recent_score_avg: '2.2',
        total_recent_concede_avg: '1.0',
      },
      away: {
        total_normal_goal_avg: '1.3',
        total_normal_score_avg: '1.2',
        total_normal_concede_avg: '1.6',
        total_recent_goal_avg: '1.1',
        total_recent_score_avg: '1.0',
        total_recent_concede_avg: '1.9',
      },
    },

    vip_info: { is_vip: '1' },
  },
};

/** 归一化后的进球 mock 数据（供无真实数据时兜底展示进球 tab） */
export const mockGoalData: GoalData = normalizeGoalData(rawGoalPayload) as GoalData;
