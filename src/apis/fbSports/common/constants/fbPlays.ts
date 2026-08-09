import { MatchMarket } from '@/apis/commonSports/types';
import { EFbMarketType } from './marketType';

// CategoryItem 类型
export interface CategoryItem {
  id: string;
  type: string;
  tabType: string;
  children?: MatchMarket[];
}

// categoryMap 映射
export const categoryMap: Record<string, CategoryItem> = {
  all: { id: '0', tabType: '全部', type: '-1', children: [] },
  featured: { id: '1', tabType: '热门', type: 'p', children: [] },
  handBig: { id: '11', tabType: '让球&大/小', type: 'h', children: [] },
  full: { id: '2', tabType: '全场', type: '', children: [] },
  half: { id: '3', tabType: '半场', type: 'f', children: [] },
  nood: { id: '4', tabType: '单节', type: 'q', children: [] },
  goal: { id: '5', tabType: '总进球数', type: 's', children: [] },
  cs: { id: '6', tabType: '比分', type: 'cs', children: [] },
  penaltyCard: { id: '7', tabType: '罚牌', type: 'b', children: [] },
  corner: { id: '8', tabType: '角球', type: 'c', children: [] },
  time: { id: '9', tabType: '时间类', type: 't', children: [] },
  special: { id: '10', tabType: '特殊玩法', type: 'i', children: [] },
};

// 需要取 nm 字段作为投注选项名称的 mty Set
export const mtyAnotherNameSet: Set<EFbMarketType> = new Set([
  EFbMarketType.soccer_half_time_full_time, // 足球半场全场胜平负
  EFbMarketType.soccer_winning_margin, // 足球胜分差
  EFbMarketType.soccer_double_chance, // 足球双重机会
  EFbMarketType.soccer_anytime_goalscorer, // 足球任何时间进球的球员
  EFbMarketType.soccer_1x2_and_over_under, // 足球胜平负和大小
  EFbMarketType.soccer_1x2_and_both_team_to_score, // 足球胜平负和双方均有进球
  EFbMarketType.soccer_1x2_and_xth_goal, // 足球独赢 & 第几个进球球队
  EFbMarketType.soccer_double_chance_and_both_team_to_score, // 足球双重机会和双方均有进球
  EFbMarketType.soccer_double_chance_and_over_under, // 足球双重机会和大小
  EFbMarketType.soccer_xth_goalscorer, // 足球第几个进球的球员
  EFbMarketType.soccer_last_goalscorer, // 足球最后一个进球的球员
  EFbMarketType.esoccer_double_chance, // 电子足球双重机会
  EFbMarketType.ebasketball_inner_and_over_under, // 电子篮球独赢和大小
  EFbMarketType.winner_and_over_under, // 篮球独赢和大小
  EFbMarketType.half_time_full_time_3017, // 篮球半/全场胜平负（常规时间）
  EFbMarketType.basketball_xth_point_scoring_type, // 篮球第x分的得分类型
  EFbMarketType.quarter_winner_margin, // 篮球单节胜分差
  EFbMarketType.tennis_double_result_1st_set_match, // 网球第一盘/整场比赛胜负
  EFbMarketType.baseball_winning_margin, // 棒球胜分差
  EFbMarketType.football_half_time_full_time, // 美式橄榄球半/全场
]);

// 需要取 li 字段的盘口
export const mtyLiNameSet: Set<EFbMarketType> = new Set([
  EFbMarketType.table_tennis_point_handicap, // 乒乓球让分
  EFbMarketType.table_tennis_points_over_under, // 乒乓球大小分
  EFbMarketType.soccer_over_under, // 足球亚盘大小球
  EFbMarketType.ebasketball_over_under_home, // 电子篮球主队总分大小
  EFbMarketType.ebasketball_over_under_away, // 电子篮球客队总分大小
  EFbMarketType.ebasketball_over_under, // 电子篮球大小分
  EFbMarketType.tennis_games_over_under, // 网球总局数
  EFbMarketType.tennis_games_over_under_home, // 网球选手1总局数
  EFbMarketType.tennis_games_over_under_away, // 网球选手2总局数
  EFbMarketType.baseball_over_under, // 棒球大小分
  EFbMarketType.baseball_over_under_home, // 棒球主队大小分
  EFbMarketType.baseball_over_under_away, // 棒球客队大小分
  EFbMarketType.football_over_under_away, // 美式橄榄球客队大小
  EFbMarketType.football_over_under_home, // 美式橄榄球主队大小
  EFbMarketType.football_over_under, // 美式橄榄球大小
  EFbMarketType.ice_hockey_over_under, // 冰球大小球
  EFbMarketType.ice_hockey_over_under_home, // 冰球主队大小球
  EFbMarketType.ice_hockey_over_under_away, // 冰球客队大小球
  EFbMarketType.over_under_away, // 篮球客队总分大小
  EFbMarketType.over_under_3003, // 篮球总分大小
  EFbMarketType.over_under_home, // 篮球主队总分大小
  EFbMarketType.esoccer_over_under, // 电子足球大小球
  EFbMarketType.soccer_bookings_over_under, // 足球罚牌大小
  EFbMarketType.soccer_corner_over_under, // 足球角球大小球
  EFbMarketType.soccer_over_under_home, // 足球主队大小球
  EFbMarketType.soccer_over_under_away, // 足球客队大小球
  EFbMarketType.volleyball_points_over_under, // 排球大小分
  EFbMarketType.badminton_points_over_under, // 羽毛球 总分大小分
]);

/** fb 让球/大小盘口类型 mty Set */
export const mtyHandBigSet: Set<EFbMarketType> = new Set([
  EFbMarketType.soccer_handicap, // 足球让球
  EFbMarketType.soccer_european_handicap, // 足球欧盘让球
  EFbMarketType.soccer_over_under, // 足球亚盘大小球
  EFbMarketType.soccer_corner_over_under, // 足球角球大小球
  EFbMarketType.soccer_conner_handicap, // 足球角球让球
  EFbMarketType.soccer_over_under_home, // 足球主队大小球
  EFbMarketType.soccer_over_under_away, // 足球客队大小球
  EFbMarketType.soccer_corners_over_under_home, // 足球主队角球数大小
  EFbMarketType.soccer_corners_over_under_away, // 足球客队角球数大小
  EFbMarketType.soccer_bookings_over_under, // 足球罚牌大小
  EFbMarketType.soccer_bookings_over_under_home, // 足球主队罚牌大小
  EFbMarketType.soccer_bookings_over_under_away, // 足球客队罚牌大小
  EFbMarketType.soccer_booking_handicap, // 足球得牌让牌（罚牌数:让牌）
  EFbMarketType.soccer_yellow_cards_handicap, // 足球黄牌让牌
  EFbMarketType.soccer_yellow_cards_over_under, // 足球黄牌大小
  EFbMarketType.soccer_red_cards_handicap, // 足球紅牌让牌
  EFbMarketType.soccer_red_cards_over_under, // 足球紅牌大小
  EFbMarketType.handicap, // 篮球让分
  EFbMarketType.over_under_3003, // 篮球总分大小
  EFbMarketType.over_under_home, // 篮球主队总分大小
  EFbMarketType.over_under_away, // 篮球客队总分大小
  EFbMarketType.ice_hockey_handicap, // 冰球让球
  EFbMarketType.ice_hockey_over_under, // 冰球大小球
  EFbMarketType.ice_hockey_over_under_home, // 冰球主队大小球
  EFbMarketType.ice_hockey_over_under_away, // 冰球客队大小球
  EFbMarketType.table_tennis_point_handicap, // 乒乓球让分
  EFbMarketType.table_tennis_points_over_under, // 乒乓球大小分
  EFbMarketType.volleyball_point_handicap, // 排球让分
  EFbMarketType.volleyball_points_over_under, // 排球大小分
  EFbMarketType.tennis_game_handicap, // 网球让局
  EFbMarketType.tennis_games_over_under, // 网球总局数
  EFbMarketType.tennis_set_handicap, // 网球让盘
  EFbMarketType.tennis_games_over_under_home, // 网球选手1总局数
  EFbMarketType.tennis_games_over_under_away, // 网球选手2总局数
  EFbMarketType.baseball_handicap, // 棒球让分
  EFbMarketType.baseball_over_under, // 棒球大小分
  EFbMarketType.baseball_over_under_home, // 棒球主队大小分
  EFbMarketType.baseball_over_under_away, // 棒球客队大小分
  EFbMarketType.baseball_hits_over_under, // 棒球安打大小分
  EFbMarketType.baseball_home_runs_over_under, // 棒球本垒打大小分
  EFbMarketType.badminton_point_handicap, // 羽毛球 让分
  EFbMarketType.badminton_points_over_under, // 羽毛球 总分大小分
  EFbMarketType.frame_handicap, // 斯诺克让局数
  EFbMarketType.frame_over_under, // 斯诺克局大小
  EFbMarketType.points_handicap, // 斯诺克单局让分
  EFbMarketType.points_over_under, // 斯诺克单局大小分
  EFbMarketType.football_handicap, // 美式橄榄球让球
  EFbMarketType.football_over_under, // 美式橄榄球大小
  EFbMarketType.football_over_under_home, // 美式橄榄球主队大小
  EFbMarketType.football_over_under_away, // 美式橄榄球客队大小
  EFbMarketType.football_touchdowns_over_under, // 美式橄榄球达阵大小
  EFbMarketType.football_field_goals_over_under, // 美式橄榄球射门大小
  EFbMarketType.esoccer_handicap, // 电子足球让球
  EFbMarketType.esoccer_over_under, // 电子足球大小球
  EFbMarketType.esoccer_over_under_home, // 电子足球主队大小球
  EFbMarketType.esoccer_over_under_away, // 电子足球客队大小球
  EFbMarketType.esoccer_european_handicap, // 电子足球足球欧盘让球
  EFbMarketType.ebasketball_handicap, // 电子篮球让分
  EFbMarketType.ebasketball_over_under, // 电子篮球大小分
  EFbMarketType.ebasketball_over_under_home, // 电子篮球主队总分大小
  EFbMarketType.ebasketball_over_under_away, // 电子篮球客队总分大小
]);

/** fb 让球，让分，让盘，让局 mty Set */
export const mtyHandicapSet: Set<EFbMarketType> = new Set([
  EFbMarketType.football_handicap, // 美式橄榄球让球
  EFbMarketType.badminton_point_handicap, // 羽毛球 让分
  EFbMarketType.badminton_game_handicap, // 羽毛球让盘
  EFbMarketType.baseball_handicap, // 棒球让分
  EFbMarketType.handicap, // 篮球让分
  EFbMarketType.european_handicap_3006, // 篮球欧盘让分(已删除)
  EFbMarketType.basketball_handicap_and_over_under, // 篮球让分大小组合
  EFbMarketType.series_handicap, // 篮球系列赛让分
  EFbMarketType.beach_volleyball_point_handicap, // 沙滩排球让分
  EFbMarketType.beach_volleyball_set_handicap, // 沙滩排球让盘
  EFbMarketType.counterstrike_2_handicap, // Counter-Strike 2 让分
  EFbMarketType.counterstrike_2_round_handicap, // Counter-Strike 2 回合数让分
  EFbMarketType.counterstrike_2_map_first_half_round_handicap, // Counter-Strike 2 地图上半场回合让分
  EFbMarketType.darts_set_handicap, // 飞镖让盘
  EFbMarketType.darts_leg_handicap, // 飞镖让局
  EFbMarketType.darts_180s_handicap, // 飞镖180分让分
  EFbMarketType.dota2_handicap, // DOTA2 让分
  EFbMarketType.dota2_kill_handicap, // DOTA2 击杀数让分
  EFbMarketType.ebasketball_handicap, // 电子篮球让分
  EFbMarketType.esoccer_handicap, // 电子足球让球
  EFbMarketType.esoccer_european_handicap, // 电子足球足球欧盘让球
  EFbMarketType.futsal_handicap, // 室内五人足球让球
  EFbMarketType.handball_handicap, // 手球让球
  EFbMarketType.ice_hockey_handicap, // 冰球让球
  EFbMarketType.king_of_glory_handicap, // King of Glory 让分
  EFbMarketType.king_of_glory_kill_handicap, // King of Glory 击杀数让分
  EFbMarketType.lol_handicap, // LOL 让分
  EFbMarketType.lol_kill_handicap, // LOL 击杀数让分
  EFbMarketType.valorant_handicap, // 无畏契约 让分
  EFbMarketType.valorant_round_handicap, // 无畏契约 回合数让分
  EFbMarketType.valorant_map_first_half_round_handicap, // 无畏契约 地图上半场回合让分
  EFbMarketType.rugby_handicap, // 橄榄球让球
  EFbMarketType.frame_handicap, // 斯诺克让局数
  EFbMarketType.points_handicap, // 斯诺克单局让分
  EFbMarketType.soccer_handicap, // 足球让球
  EFbMarketType.soccer_european_handicap, // 足球欧盘让球
  EFbMarketType.soccer_conner_handicap, // 足球角球让球
  EFbMarketType.soccer_booking_handicap, // 足球得牌让牌
  EFbMarketType.soccer_yellow_cards_handicap, // 足球黄牌让牌
  EFbMarketType.soccer_red_cards_handicap, // 足球紅牌让牌
  EFbMarketType.highest_scoring_half_has_line, // 足球最高得分半场让分
  EFbMarketType.table_tennis_point_handicap, // 乒乓球让分
  EFbMarketType.table_tennis_game_handicap, // 乒乓球让盘
  EFbMarketType.tennis_game_handicap, // 网球让局
  EFbMarketType.tennis_set_handicap, // 网球让盘
  EFbMarketType.asian_handicap, // 虚拟足球让球
  EFbMarketType.european_handicap_1001005, // 虚拟足球欧盘让球
  EFbMarketType.volleyball_point_handicap, // 排球让分
  EFbMarketType.volleyball_set_handicap, // 排球让盘
  EFbMarketType.water_polo_handicap, // 水球让球
]);

/** fb 独赢盘口类型 mty Set */
export const mtyWinSet: Set<EFbMarketType> = new Set([
  EFbMarketType.soccer_1x2, // 足球独赢（胜平负）
  EFbMarketType.soccer_draw_no_bet, // 足球平局退款
  EFbMarketType.soccer_corner_1x2, // 足球角球胜平负
  EFbMarketType.soccer_home_no_bet, // 足球主胜退款
  EFbMarketType.soccer_away_no_bet, // 足球客胜退款
  EFbMarketType.soccer_last_goal, // 足球最后的进球
  EFbMarketType.soccer_booking_1x2, // 足球得牌胜平负
  EFbMarketType.soccer_yellow_cards_1x2, // 足球黄牌胜平负
  EFbMarketType.soccer_red_cards_1x2, // 足球紅牌胜平负
  EFbMarketType.soccer_xth_goal, // 足球第几个进球球队
  EFbMarketType.soccer_which_team_wins_the_rest, // 足球剩余时间获胜球队
  EFbMarketType.basketball_1x2, // 篮球胜平负（3項）
  EFbMarketType.winner_3004, // 篮球独赢（2項）
  EFbMarketType.race_to_x_points_3008, // 篮球首次达到x分球队
  EFbMarketType.half_time_full_time_3017, // 篮球半/全场胜平负（常规时间）
  EFbMarketType.money_line, // 独赢（两项）
  EFbMarketType.last_point, // 篮球最后一分的球队
  EFbMarketType.basketball_quarter_race_to_x_points, // 篮球单节首次到达x分的球队
  EFbMarketType.basketball_xth_point, // 篮球第X分的球队
  EFbMarketType.basketball_xth_timeout, // 篮球第x个暂停球队
  EFbMarketType.basketball_xth_free_throw_scored, // 篮球第x个罚球得分球队
  EFbMarketType.basketball_which_team_wins_the_jump_ball, // 篮球哪对赢得争球
  EFbMarketType.ice_hockey_1x2, // 冰球胜平负
  EFbMarketType.ice_hockey_winner, // 冰球胜负
  EFbMarketType.ice_hockey_which_team_wins_the_rest, // 冰球剩余时间获胜球队
  EFbMarketType.ice_hockey_xth_goal, // 冰球第x粒进球
  EFbMarketType.ice_hockey_last_goal, // 冰球最后的进球
  EFbMarketType.table_tennis_winner, // 乒乓球独赢（两项）
  EFbMarketType.table_tennis_game_winner, // 乒乓球单局独赢（两项）
  EFbMarketType.volleyball_winner, // 排球独赢（两项）
  EFbMarketType.volleyball_set_winner, // 排球局独赢
  EFbMarketType.tennis_winner, // 网球独赢（两项）
  EFbMarketType.tennis_set_winner, // 网球盘独赢
  EFbMarketType.tennis_game_x_winner, // 网球第几局胜者
  EFbMarketType.baseball_winner, // 棒球独赢（两项）
  EFbMarketType.baseball_1x2, // 棒球独赢（三项）
  EFbMarketType.baseball_which_team_wins_the_rest, // 棒球剩余时间获胜
  EFbMarketType.badminton_winner, // 羽毛球 独赢（两项）
  EFbMarketType.badminton_game_winner, // 羽毛球 局独赢
  EFbMarketType.badminton_xth_point, // 羽毛球 局内第X分的球队
  EFbMarketType.winner_16003, // 斯诺克独赢（两项）
  EFbMarketType.frame_winner, // 斯诺克单局独赢（两项）
  EFbMarketType.race_to_x_frames, // 斯诺克最先赢得X局的选手
  EFbMarketType.which_player_wins_the_rest, // 斯诺克剩余时间获胜
  EFbMarketType.race_to_x_points_16012, // 斯诺克最先获得X分的选手
  EFbMarketType.layer_with_highest_break, // 斯诺克单杆最高分选手
  EFbMarketType.n_1x2_16014, // 斯诺克独赢（三项）
  EFbMarketType.n_1x2_frame_1_to, // 斯诺克前X局独赢（三项）
  EFbMarketType.football_winner, // 美式橄榄球胜负
  EFbMarketType.football_1x2, // 美式橄榄球独赢(三项)
  EFbMarketType.football_moneyline, // 美式足球平局退款
  EFbMarketType.football_xth_field_goal, // 美式橄榄球第x个射门球队
  EFbMarketType.football_next_score, // 美式橄榄球下一个得分的球队
  EFbMarketType.esoccer_1x2, // 电子足球独赢(胜平负)
  EFbMarketType.esoccer_the_first_few_goals, // 电子足球第X个进球
  EFbMarketType.esoccer_which_team_wins_the_rest, // 电子足球剩余时间获胜
  EFbMarketType.esoccer_draw_no_bet, // 电子足球平局退款
  EFbMarketType.esoccer_home_no_bet, // 电子足球主胜退款
  EFbMarketType.esoccer_away_no_bet, // 电子足球客胜退款
  EFbMarketType.ebasketball_winner, // 电子篮球独赢（2项
  EFbMarketType.ebasketball_1x2, // 电子篮球独赢（三项）
  EFbMarketType.ebasketball_draw_no_bet, // 电子篮球平局退款
]);

/** fb 比分盘口类型 mty Set */
export const mtyPointSet: Set<EFbMarketType> = new Set([
  EFbMarketType.soccer_correct_score_max_44, // 足球足球波胆（任意球队进球大于等于5判定选项"其他"赢）
  EFbMarketType.correct_score_dynamic, // 足球正确比分(动态选项)
  EFbMarketType.inverse_correct_score_dynamic, // 足球反波胆(动态选项)
  EFbMarketType.soccer_correct_score_max_22, // 足球波胆（任意球队进球大于等于3判定选项"其他"赢）
  EFbMarketType.soccer_correct_score_max_99, // 足球波胆（选项中任意球队进球小于等于9）
  EFbMarketType.soccer_correct_score_pen, // 足球点球波胆
  EFbMarketType.half_time_full_time_correct_score, // 半/全场正确比分（三列按序展示）
  EFbMarketType.correct_corners_ht, // 角球半场 正确比分
  EFbMarketType.correct_corners_ft, // 角球全场 正确比分
  EFbMarketType.ice_hockey_correct_score_max_7, // 冰球正确比分
  EFbMarketType.table_tennis_correct_score_bo5, // 乒乓球正确比分(BO5)
  EFbMarketType.table_tennis_correct_score_bo7, // 乒乓球正确比分(BO7)
  EFbMarketType.volleyball_correct_score_bo5, // 排球正确比分(BO5)
  EFbMarketType.volleyball_correct_score_bo7, // 排球正确比分(BO7)
  EFbMarketType.tennis_correct_score_bo3, // 网球正确比分(BO3)
  EFbMarketType.tennis_correct_score_bo5, // 网球正确比分(BO5)
  EFbMarketType.tennis_set_correct_score, // 网球正确盘分
  EFbMarketType.badminton_correct_score_bo3, // 羽毛球 正确比分(BO3)
  EFbMarketType.badminton_correct_score_bo5, // 羽毛球 正确比分(BO5)
  EFbMarketType.correct_score_bo5, // 斯诺克正确比分（BO5）
  EFbMarketType.correct_score_bo7, // 斯诺克正确比分（BO7）
  EFbMarketType.correct_score_bo9, // 斯诺克正确比分（BO9）
  EFbMarketType.correct_score_bo11, // 斯诺克正确比分（BO11）
]);

/** fb 2条数据展示 mty Set */
export const mtyTwoSet: Set<EFbMarketType> = new Set([
  EFbMarketType.soccer_handicap, // 足球让球
  EFbMarketType.soccer_draw_no_bet, // 足球平局退款
  EFbMarketType.soccer_over_under, // 足球亚盘大小球
  EFbMarketType.soccer_total_goals_odd_even, // 足球单双
  EFbMarketType.soccer_corner_over_under, // 足球角球大小球
  EFbMarketType.soccer_conner_handicap, // 足球角球让球
  EFbMarketType.soccer_corner_odd_even, // 足球角球数单双
  EFbMarketType.soccer_home_no_bet, // 足球主胜退款
  EFbMarketType.soccer_away_no_bet, // 足球客胜退款
  EFbMarketType.soccer_over_under_home, // 足球主队大小球
  EFbMarketType.soccer_over_under_away, // 足球客队大小球
  EFbMarketType.soccer_clean_sheet_home, // 足球主队零封对手
  EFbMarketType.soccer_clean_sheet_away, // 足球客队零封对手
  EFbMarketType.soccer_both_teams_to_score, // 足球双方均有进球
  EFbMarketType.soccer_1x2_and_over_under, // 足球胜平负和大小
  EFbMarketType.soccer_1x2_and_both_team_to_score, // 足球胜平负和双方均有进球
  EFbMarketType.soccer_both_halves_over_x, // 足球上/下半场均大于x
  EFbMarketType.soccer_both_halves_under_x, // 足球上/下半场均小于x
  EFbMarketType.soccer_home_to_score_in_both_halves, // 足球主队上/下半场均进球
  EFbMarketType.soccer_away_to_score_in_both_halves, // 足球客队上/下半场均进球
  EFbMarketType.soccer_home_to_win_both_halves, // 足球主队赢得所有半场
  EFbMarketType.soccer_home_to_win_either_halves, // 足球主队赢得任一半场
  EFbMarketType.soccer_away_to_win_both_halves, // 足球客队赢得所有半场
  EFbMarketType.soccer_away_to_win_either_half, // 足球客队赢得任一半场
  EFbMarketType.soccer_corners_over_under_home, // 足球主队角球数大小
  EFbMarketType.soccer_corners_over_under_away, // 足球客队角球数大小
  EFbMarketType.soccer_double_chance_and_over_under, // 足球双重机会和大小
  EFbMarketType.soccer_double_chance_and_both_team_to_score, // 足球双重机会和双方均有进球
  EFbMarketType.soccer_odd_even_home, // 足球主队单双
  EFbMarketType.soccer_odd_even_away, // 足球客队单双
  EFbMarketType.soccer_home_to_win, // 足球主队获胜
  EFbMarketType.soccer_away_to_win, // 足球客队获胜
  EFbMarketType.soccer_any_team_to_win, // 足球任意球队获胜
  EFbMarketType.soccer_1st_2nd_half_both_teams_to_score, // 足球上下半场双方是否进球
  EFbMarketType.soccer_goals_o_u_and_both_teams_to_score, // 足球大小&两队均进球
  EFbMarketType.soccer_which_team_kicks_off, // 足球哪队开球
  EFbMarketType.home_win_to_nil, // 足球主队零失球获胜
  EFbMarketType.away_win_to_nil, // 足球客队零失球获胜
  EFbMarketType.ice_hockey_handicap, // 冰球让球
  EFbMarketType.ice_hockey_over_under, // 冰球大小球
  EFbMarketType.ice_hockey_odd_even, // 冰球单双
  EFbMarketType.ice_hockey_over_under_home, // 冰球主队大小球
  EFbMarketType.ice_hockey_over_under_away, // 冰球客队大小球
  EFbMarketType.ice_hockey_will_there_be_overtime, // 冰球比赛会有加时
  EFbMarketType.handicap, // 篮球让分
  EFbMarketType.over_under_3003, // 篮球总分大小
  EFbMarketType.winner_3004, // 篮球独赢（2項）
  EFbMarketType.odd_even_3005, // 篮球单双
  EFbMarketType.race_to_x_points_3008, // 篮球首次达到x分球队
  EFbMarketType.over_under_home, // 篮球主队总分大小
  EFbMarketType.over_under_away, // 篮球客队总分大小
  EFbMarketType.winner_and_over_under, // 篮球独赢和大小
  EFbMarketType.will_there_be_overtime, // 篮球会有加时
  EFbMarketType.money_line, // 独赢（两项）
  EFbMarketType.basketball_correct_quarter_odd_even, // 篮球单节单双组合
  EFbMarketType.basketball_handicap_and_over_under, // 篮球让分大小组合
  EFbMarketType.tennis_winner, // 网球独赢（两项）
  EFbMarketType.tennis_game_handicap, // 网球让局
  EFbMarketType.tennis_games_over_under, // 网球总局数
  EFbMarketType.tennis_set_handicap, // 网球让盘
  EFbMarketType.tennis_games_over_under_home, // 网球选手1总局数
  EFbMarketType.tennis_games_over_under_away, // 网球选手2总局数
  EFbMarketType.tennis_double_result_1st_set_match, // 网球第一盘/整场比赛胜负
  EFbMarketType.tennis_games_odd_even, // 网球局数单双
  EFbMarketType.tennis_set_winner, // 网球盘独赢
  EFbMarketType.americanfootball_odd_even, // 美式橄榄球单双
  EFbMarketType.baseball_winner, // 棒球独赢（两项）
  EFbMarketType.baseball_odd_even, // 棒球单双
  EFbMarketType.handball_odd_even, // 手球单双
  EFbMarketType.volleyball_winner, // 排球独赢（两项）
  EFbMarketType.volleyball_point_handicap, // 排球让分
  EFbMarketType.volleyball_points_over_under, // 排球大小分
  EFbMarketType.volleyball_set_winner, // 排球局独赢
  EFbMarketType.volleyball_odd_even, // 排球单双
  EFbMarketType.cricket_winner, // 板球独赢
  EFbMarketType.cricket_over_under, // 板球大小
  EFbMarketType.cricket_over_under_home, // 板球大小
  EFbMarketType.cricket_over_under_away, // 板球大小
  EFbMarketType.cricket_odd_even, // 板球单双
  EFbMarketType.cricket_to_win_the_toss, // 板球抛币获胜
  EFbMarketType.table_tennis_winner, // 乒乓球独赢（两项）
  EFbMarketType.table_tennis_point_handicap, // 乒乓球让分
  EFbMarketType.table_tennis_points_over_under, // 乒乓球大小分
  EFbMarketType.table_tennis_game_odd_even, // 乒乓球单双
  EFbMarketType.table_tennis_game_winner, // 乒乓球单局独赢（两项）
  EFbMarketType.frame_over_under, // 斯诺克局大小
  EFbMarketType.winner_16003, // 斯诺克独赢（两项）
  EFbMarketType.points_odd_even, // 斯诺克总分单双
  EFbMarketType.mma_winner_18002, // 混合格斗独赢（两项
  EFbMarketType.boxing_over_under, // 拳击大小
  EFbMarketType.boxing_winner, // 拳击独赢（两项）
  EFbMarketType.badminton_winner, // 羽毛球 独赢（两项）
  EFbMarketType.badminton_point_handicap, // 羽毛球 让分
  EFbMarketType.badminton_points_over_under, // 羽毛球 总分大小分
  EFbMarketType.badminton_game_winner, // 羽毛球 局独赢
  EFbMarketType.badminton_game_odd_even, // 羽毛球 局单双
  EFbMarketType.beach_volleyball_odd_even, // 沙滩排球单双
  EFbMarketType.esoccer_odd_even, // 电子足球单双
  EFbMarketType.ebasketball_odd_even, // 电子篮球单双
  EFbMarketType.odd_even_1001009, // 虚拟足球单双
  EFbMarketType.odd_even_1020007, // 单双
  EFbMarketType.odd_even_1021007, // 单双
  EFbMarketType.odd_even_1023007, // 单双
]);

/** fb 三条结构 mty Set */
export const mtyTreeSet: Set<EFbMarketType> = new Set([
  EFbMarketType.soccer_european_handicap, // 足球欧盘让球
  EFbMarketType.soccer_1x2, // 足球独赢（胜平负）
  EFbMarketType.soccer_corner_1x2, // 足球角球胜平负
  EFbMarketType.soccer_double_chance, // 足球双重机会
  EFbMarketType.soccer_last_goal, // 足球最后的进球
  EFbMarketType.soccer_half_time_full_time, // 足球半场全场胜平负
  EFbMarketType.soccer_xth_goal, // 足球第几个进球球队
  EFbMarketType.soccer_correct_score_max_44, // 足球足球波胆（任意球队进球大于等于5判定选项"其他"赢）
  EFbMarketType.soccer_correct_score_max_22, // 足球波胆（任意球队进球大于等于3判定选项"其他"赢）
  EFbMarketType.soccer_correct_score_max_99, // 足球波胆（选项中任意球队进球小于等于9）
  EFbMarketType.soccer_correct_score_pen, // 足球点球波胆
  EFbMarketType.ice_hockey_1x2, // 冰球胜平负
  EFbMarketType.ice_hockey_correct_score_max_7, // 冰球正确比分
  EFbMarketType.tennis_correct_score_bo3, // 网球正确比分(BO3)
  EFbMarketType.tennis_correct_score_bo5, // 网球正确比分(BO5)
  EFbMarketType.tennis_set_correct_score, // 网球正确盘分
  EFbMarketType.volleyball_correct_score_bo5, // 排球正确比分(BO5)
  EFbMarketType.volleyball_correct_score_bo7, // 排球正确比分(BO7)
  EFbMarketType.cricket_1x2, // 板球独赢(胜平负)
  EFbMarketType.cricket_highest_opening_partnership, // 板球在每队第一人出局前得分最高球队
  EFbMarketType.cricket_most_fours, // 板球得四分最多的球队
  EFbMarketType.cricket_most_sixes, // 板球得六分最多的球队
  EFbMarketType.table_tennis_correct_score_bo5, // 乒乓球正确比分(BO5)
  EFbMarketType.table_tennis_correct_score_bo7, // 乒乓球正确比分(BO7)
  EFbMarketType.correct_score_bo5, // 斯诺克正确比分（BO5）
  EFbMarketType.correct_score_bo7, // 斯诺克正确比分（BO7）
  EFbMarketType.correct_score_bo9, // 斯诺克正确比分（BO9）
  EFbMarketType.correct_score_bo11, // 斯诺克正确比分（BO11）
  EFbMarketType.badminton_correct_score_bo3, // 羽毛球 正确比分(BO3)
  EFbMarketType.badminton_correct_score_bo5, // 羽毛球 正确比分(BO5)
]);

// 热门类型
export const categoryFeaturedIds: string[] = [
  '1000_1001',
  '1000_1002',
  '1000_1003',
  '1007_1001',
  '1007_1002',
  '1007_1003',
  '1005_1001',
  '1005_1002',
  '1005_1003',
];

// 总进球数
export const categoryGoalIds: string[] = [
  '1102_1001',
  '1103_1002',
  '1104_1003',
  '1101_1001',
  '1021_1001',
  '1021_1002',
  '1021_1003',
  '1022_1001',
  '1022_1002',
  '1022_1003',
  '1105_1001',
  '1105_1002',
  '1106_1001',
  '1106_1002',
];

/**
 * 足球让球&大/小 mty 前缀（与 EMC setFootBallCategory 一致）
 * 独立分类，可与总进球数/特殊玩法等 Tab 共存
 */
export const categoryHandBigMtyPrefixes: string[] = [
  '1000_', // 让球（含全场/上下半场/15分钟阶段）
  '1007_', // 大/小（含全场/上下半场/15分钟阶段）
  '1002_', // 让球胜平负
  '1021_', // 主队 进球: 大/小
  '1022_', // 客队 进球: 大/小
  '1030_', // 独赢 & 大/小
  '1078_', // 双重机会 & 大/小
  '1115_', // 大/小 & 双方球队进球
];

export const isFootballHandBigCategory = (categoryId: string): boolean =>
  categoryHandBigMtyPrefixes.some((prefix) => categoryId.startsWith(prefix));

/** 足球半场 Tab：上半场 pe=1002、下半场 pe=1003（与 EMC 一致，可与其他 Tab 共存） */
export const isFootballHalfCategory = (categoryId: string): boolean =>
  categoryId.endsWith('_1002') || categoryId.endsWith('_1003');

// 比分
export const categoryCSIds: string[] = ['1099_1001', '1100_1002', '1100_1003', '1186_1001'];

// 角球
export const categoryCornerIds: string[] = [
  '1011_1001',
  '1011_1002',
  '1010_1001',
  '1010_1002',
  '1009_1001',
  '1009_1002',
  '1107_1001',
  '1108_1002',
  '1015_1001',
  '1015_1002',
  '1109_1001',
  '1110_1001',
  '1094_1002',
  '1146_1001',
  '1147_1001',
  '1055_1001',
  '1055_1002',
];

// 罚牌
export const categoryPenaltyCardIds: string[] = [
  '1060_1001',
  '1060_1002',
  '1063_1001',
  '1063_1002',
  '1061_1001',
  '1061_1002',
  '1148_1001',
  '1149_1001',
  '1169_1001',
  '1169_1002',
  '1170_1001',
  '1171_1001',
  '1172_1001',
  '1173_1002',
  '1174_1002',
  '1175_1002',
  '1072_1001',
  '1073_1002',
  '1074_1002',
];

// 时间类
export const categoryTimesIds: string[] = [
  '1000_1007',
  '1007_1007',
  '1005_1007',
  '1000_1008',
  '1007_1008',
  '1005_1008',
  '1007_1009',
  '1005_1009',
  '1000_1010',
  '1007_1010',
  '1005_1010',
  '1000_1011',
  '1007_1011',
  '1005_1011',
];

// 特殊类型
export const categorySpecialIds: string[] = [
  '1127_1001',
  '1006_1001',
  '1006_1002',
  '1006_1003',
  '1016_1001',
  '1017_1001',
  '1027_1001',
  '1027_1002',
  '1027_1003',
  '1008_1001',
  '1008_1002',
  '1008_1003',
  '1082_1001',
  '1083_1001',
  '1019_1001',
  '1089_1001',
  '1093_1001',
  '1091_1001',
  '1092_1001',
  '1033_1001',
  '1018_1001',
  '1002_1001',
  '1002_1002',
  '1002_1003',
  '1012_1001',
  '1012_1002',
  '1012_1003',
  '1076_1001',
  '1075_1001',
  '1077_1001',
  '1025_1001',
  '1025_1002',
  '1025_1003',
  '1026_1001',
  '1026_1002',
  '1026_1003',
  '1167_1001',
  '1168_1001',
  '1030_1001',
  '1030_1002',
  '1030_1003',
  '1032_1001',
  '1032_1002',
  '1032_1003',
  '1115_1001',
  '1031_1001',
  '1150_1001',
  '1151_1001',
  '1028_1001',
  '1042_1001',
  '1043_1001',
  '1044_1001',
  '1034_1001',
  '1051_1001',
  '1035_1001',
  '1097_1001',
  '1036_1001',
  '1037_1001',
  '1038_1001',
  '1039_1001',
  '1040_1001',
  '1041_1001',
  '1078_1001',
  '1079_1001',
  '1079_1002',
  '1079_1003',
];

// 全场
export const categoryFullIds: string[] = [
  '3002_3001',
  '3003_3001',
  '3012_3001',
  '3013_3001',
  '3004_3001',
  '3005_3001',
];

// 半场
export const categoryHalfIds: string[] = [
  '3002_3003',
  '3003_3003',
  '3012_3003',
  '3013_3003',
  '3005_3003',
  '3020_3003',
];

// 单节
export const categoryNoodfIds: string[] = [
  '3002_3005',
  '3002_3006',
  '3002_3007',
  '3002_3008',
  '3003_3005',
  '3003_3006',
  '3003_3007',
  '3003_3008',
  '3012_3005',
  '3012_3006',
  '3012_3007',
  '3012_3008',
  '3013_3005',
  '3013_3006',
  '3013_3007',
  '3013_3008',
  '3005_3005',
  '3005_3006',
  '3005_3007',
  '3005_3008',
  '3020_3005',
  '3020_3006',
  '3020_3007',
  '3020_3008',
];
