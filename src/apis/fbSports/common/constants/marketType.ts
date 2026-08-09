/** 盘口类型  see enum: market_type */
export enum EFbMarketType {
  /** 美式橄榄球让球 */
  football_handicap = 6001,
  /** 美式橄榄球大小 */
  football_over_under = 6002,
  /** 美式橄榄球胜负 */
  football_winner = 6003,
  /** 美式橄榄球主队大小 */
  football_over_under_home = 6004,
  /** 美式橄榄球客队大小 */
  football_over_under_away = 6005,
  /** 美式橄榄球单双 */
  americanfootball_odd_even = 6006,
  /** 美式橄榄球主队单双 */
  football_odd_even_home = 6007,
  /** 美式橄榄球客队单双 */
  football_odd_even_away = 6008,
  /** 美式橄榄球独赢(三项) */
  football_1x2 = 6009,
  /** 美式足球平局退款 */
  football_moneyline = 6010,
  /** 美式橄榄球是否有加时 */
  football_will_there_be_overtime = 6011,
  /** 美式橄榄球最高得分节 */
  football_the_highest_scoring_quarter = 6012,
  /** 美式橄榄球最高得分半场 */
  football_the_highest_scoring_half = 6013,
  /** 美式橄榄球最先到达x分 */
  football_race_to_x_points = 6014,
  /** 美式橄榄球半/全场 */
  football_half_time_full_time = 6015,
  /** 美式橄榄球达阵大小 */
  football_touchdowns_over_under = 6016,
  /** 美式橄榄球射门大小 */
  football_field_goals_over_under = 6017,
  /** 美式橄榄球第x个射门球队 */
  football_xth_field_goal = 6018,
  /** 美式橄榄球下一个得分的球队 */
  football_next_score = 6019,
  /** 美式橄榄球下一个得分类型 */
  football_next_scoring_type = 6020,
  /** 美式足球冠军赛事冠军 */
  americanfootball_dynamic_outright_market = 6999,
  /** 美式足球冠军赛事冠军 */
  americanfootball_winner = 6998,
  /** 美式足球亚足联会议获胜者 */
  americanfootball_afc_conference_winner = 6997,
  /** 美式足球NFC会议获胜者 */
  americanfootball_nfc_conference_winner = 6996,
  /** 美式足球亚足联分区东部冠军 */
  americanfootball_afc_division_east_winner = 6995,
  /** 美式足球亚足联分区南冠军 */
  americanfootball_afc_division_south_winner = 6994,
  /** 美式足球亚足联西区冠军 */
  americanfootball_afc_division_west_winner = 6993,
  /** 美式足球亚足联赛区北冠军 */
  americanfootball_afc_division_north_winner = 6992,
  /** 美式足球NFC 部门东部冠军 */
  americanfootball_nfc_division_east_winner = 6991,
  /** 美式足球NFC 部门南优胜者 */
  americanfootball_nfc_division_south_winner = 6990,
  /** 美式足球NFC 部门西部冠军 */
  americanfootball_nfc_division_west_winner = 6989,
  /** 美式足球NFC 部门北获胜者 */
  americanfootball_nfc_division_north_winner = 6988,
  /** 美式足球获胜联盟 */
  americanfootball_winning_conference = 6987,
  /** 美式足球获胜赛区 */
  americanfootball_winning_division = 6986,
  /** 亚运会冠军赛事冠军 */
  asian_game_winner = 101998,
  /** 亚运会冠军赛事冠军 */
  asian_game_dynamic_outright_market = 101999,
  /** 羽毛球 独赢（两项） */
  badminton_winner = 47001,
  /** 羽毛球 让分 */
  badminton_point_handicap = 47002,
  /** 羽毛球 总分大小分 */
  badminton_points_over_under = 47003,
  /** 羽毛球 正确比分(BO3) */
  badminton_correct_score_bo3 = 47004,
  /** 羽毛球 正确比分(BO5) */
  badminton_correct_score_bo5 = 47005,
  /** 羽毛球 局独赢 */
  badminton_game_winner = 47006,
  /** 羽毛球 局单双 */
  badminton_game_odd_even = 47007,
  /** 羽毛球 局内第X分的球队 */
  badminton_xth_point = 47008,
  /** 羽毛球让盘 */
  badminton_game_handicap = 47009,
  /** 羽毛球总盘数 */
  badminton_games_over_under = 47010,
  /** 羽毛球主队大小分 */
  badminton_points_over_under_home = 47011,
  /** 羽毛球客队大小分 */
  badminton_points_over_under_away = 47012,
  /** 羽毛球精确盘数(BO3) */
  badminton_exact_sets_bo3 = 47013,
  /** 羽毛球精确盘数(BO5) */
  badminton_exact_sets_bo5 = 47014,
  /** 羽毛球冠军赛事冠军 */
  dynamic_outright_market_47999 = 47999,
  /** 羽毛球冠军赛事冠军 */
  winner_47998 = 47998,
  /** 棒球让分 */
  baseball_handicap = 7001,
  /** 棒球大小分 */
  baseball_over_under = 7002,
  /** 棒球独赢（两项） */
  baseball_winner = 7003,
  /** 棒球主队大小分 */
  baseball_over_under_home = 7004,
  /** 棒球客队大小分 */
  baseball_over_under_away = 7005,
  /** 棒球独赢（三项） */
  baseball_1x2 = 7006,
  /** 棒球单双 */
  baseball_odd_even = 7007,
  /** 棒球剩余时间获胜 */
  baseball_which_team_wins_the_rest = 7008,
  /** 棒球是否有加时 */
  will_there_be_an_extra_inning = 7009,
  /** 棒球胜分差 */
  baseball_winning_margin = 7010,
  /** 棒球安打大小分 */
  baseball_hits_over_under = 7011,
  /** 棒球本垒打大小分 */
  baseball_home_runs_over_under = 7012,
  /** 棒球独赢（两项） */
  baseball_moneyline = 7013,
  /** 棒球独赢&大小 */
  baseball_winner_and_over_under = 7014,
  /** 棒球先得X分的队伍 */
  baseball_race_to_x_runs = 7016,
  /** 棒球主队安打大小分 */
  baseball_hits_over_under_home = 7017,
  /** 棒球客队安打大小分 */
  baseball_hits_over_under_away = 7018,
  /** 棒球最高得分局 */
  baseball_highest_scoring_inning = 7019,
  /** 棒球精确得分数(3+) */
  baseball_exact_runs = 7020,
  /** 棒球冠军赛事冠军 */
  dynamic_outright_market_7999 = 7999,
  /** 棒球冠军赛事冠军 */
  winner_7998 = 7998,
  /** 棒球冠军赛事美國聯盟冠军 */
  american_league_winner = 7997,
  /** 棒球冠军赛事國家聯盟冠军 */
  national_league_winner = 7996,
  /** 棒球冠军赛事美國聯盟中區冠军 */
  american_league_central_winner = 7995,
  /** 棒球冠军赛事美國聯盟東區冠军 */
  american_league_east_winner = 7994,
  /** 棒球冠军赛事美國聯盟西區冠军 */
  american_league_west_winner = 7993,
  /** 棒球冠军赛事國家聯盟中區冠军 */
  national_league_central_winner = 7992,
  /** 棒球冠军赛事國家聯盟東區冠军 */
  national_league_east_winner = 7991,
  /** 棒球冠军赛事國家聯盟西區冠军 */
  national_league_west_winner = 7990,
  /** 篮球胜平负（3項） */
  basketball_1x2 = 3001,
  /** 篮球让分 */
  handicap = 3002,
  /** 篮球总分大小 */
  over_under_3003 = 3003,
  /** 篮球独赢（2項） */
  winner_3004 = 3004,
  /** 篮球单双 */
  odd_even_3005 = 3005,
  /** 篮球欧盘让分(已删除) */
  european_handicap_3006 = 3006,
  /** 篮球胜分差（选项 主胜1-5，主胜6-10，主胜11-15，主胜16-20，主胜21-25，主胜26+，客胜1-5，客胜6-10，客胜11-15，客胜16-20，客胜21-25，客胜26+） */
  winning_margin_26 = 3007,
  /** 篮球首次达到x分球队 */
  race_to_x_points_3008 = 3008,
  /** 篮球主队总分大小 */
  over_under_home = 3012,
  /** 篮球客队总分大小 */
  over_under_away = 3013,
  /** 篮球独赢和大小 */
  winner_and_over_under = 3014,
  /** 篮球会有加时 */
  will_there_be_overtime = 3015,
  /** 篮球最高得分的节 */
  the_highest_scoring_quarter = 3016,
  /** 篮球半/全场胜平负（常规时间） */
  half_time_full_time_3017 = 3017,
  /** 独赢（两项） */
  money_line = 3020,
  /** 篮球最后一分的球队 */
  last_point = 3021,
  /** 篮球主队总得分单双 */
  odd_even_home = 3022,
  /** 篮球客队总得分单双 */
  odd_even_away = 3023,
  /** 篮球全场大小（包含精确） */
  total_overexactunder = 3026,
  /** 篮球单节胜分差 */
  quarter_winner_margin = 3027,
  /** 篮球半/全场(包含加时) */
  half_time_full_time_incl_ot = 3028,
  /** 篮球单节首次到达x分的球队 */
  basketball_quarter_race_to_x_points = 3029,
  /** 篮球第x分的得分类型 */
  basketball_xth_point_scoring_type = 3030,
  /** 篮球任意球队第X分的得分类型 */
  basketball_any_team_xth_point_scoring_type = 3031,
  /** 篮球第X分的球队 */
  basketball_xth_point = 3032,
  /** 篮球最高得分半场 */
  basketball_the_highest_scoring_half = 3033,
  /** 篮球第x个暂停球队 */
  basketball_xth_timeout = 3034,
  /** 篮球第x个罚球得分球队 */
  basketball_xth_free_throw_scored = 3035,
  /** 篮球哪对赢得争球 */
  basketball_which_team_wins_the_jump_ball = 3036,
  /** 篮球得分最后一位数 */
  basketball_last_digit = 3037,
  /** 篮球主队得分最后一位数 */
  basketball_last_digit_home = 3038,
  /** 篮球得分最后一位数 */
  basketball_last_digit_away = 3039,
  /** 篮球单节单双组合 */
  basketball_correct_quarter_odd_even = 3040,
  /** 篮球让分大小组合 */
  basketball_handicap_and_over_under = 3041,
  /** 篮球主客队尾数组合 */
  basketball_last_digit_homeaway = 3042,
  /** 篮球冠军赛事动态玩法 */
  dynamic_outright_market_3999 = 3999,
  /** 篮球系列赛冠军 */
  dynamic_outright_market_3900 = 3900,
  /** 篮球系列赛让分 */
  series_handicap = 3901,
  /** 篮球系列赛正确比分 */
  series_correct_score = 3902,
  /** 篮球常规赛胜利 */
  regular_season_wins = 3903,
  /** 篮球是否进入季后赛 */
  to_reach_the_playoffs = 3904,
  /** 篮球系列赛第几场结束 */
  series_game_end = 3905,
  /** 篮球系列赛第三场比赛后比分 */
  series_correct_score_after_game_3 = 3906,
  /** 篮球系列赛第四场比赛后比分 */
  series_correct_score_after_game_4 = 3907,
  /** 篮球系列赛总比赛数 */
  series_total_games = 3908,
  /** 篮球系列赛精确淘汰回合 */
  series_exact_round_of_elimination = 3909,
  /** 篮球得分最多的球员 */
  series_most_points_player = 3910,
  /** 篮球三分最多的球员 */
  series_most_3p_made_player = 3911,
  /** 篮球最多篮板的球员 */
  series_most_rebounds_player = 3912,
  /** 篮球最多助攻的球员 */
  series_most_assists_player = 3913,
  /** 篮球最多盖帽的球员 */
  series_most_blocks_player = 3914,
  /** 篮球最多抢断的球员 */
  series_most_steals_player = 3915,
  /** 篮球冠军赛事动获胜者 */
  dynamic_outright_market_3998 = 3998,
  /** 篮球冠军赛事A组前2名球队 */
  top_2_3997 = 3997,
  /** 篮球冠军赛事A组前3名球队 */
  top_3_3996 = 3996,
  /** 篮球冠军赛事A组前4名球队 */
  top_4_3995 = 3995,
  /** 篮球冠军赛事A组胜者 */
  group_a_winner_3994 = 3994,
  /** 篮球冠军赛事B组胜者 */
  group_b_winner_3993 = 3993,
  /** 篮球冠军赛事C组胜者 */
  group_c_winner_3992 = 3992,
  /** 篮球冠军赛事D组胜者 */
  group_d_winner_3991 = 3991,
  /** 篮球冠军赛事E组胜者 */
  group_e_winner_3990 = 3990,
  /** 篮球冠军赛事F组胜者 */
  group_f_winner_3989 = 3989,
  /** 篮球冠军赛事G组胜者 */
  group_g_winner_3988 = 3988,
  /** 篮球冠军赛事H组胜者 */
  group_h_winner_3987 = 3987,
  /** 篮球冠军赛事西部冠军 */
  western_conference_winner_3986 = 3986,
  /** 篮球冠军赛事东部冠军 */
  eastern_conference_winner_3985 = 3985,
  /** 篮球冠军赛事中部冠军 */
  division_central_winner = 3984,
  /** 篮球冠军赛事西南南冠军 */
  division_southwest_winner = 3983,
  /** 篮球冠军赛事东南冠军 */
  division_southeast_winner = 3982,
  /** 篮球冠军赛事西北冠军 */
  division_northwest_winner = 3981,
  /** 篮球冠军赛事太平洋区冠军 */
  division_pacific_winner = 3980,
  /** 篮球冠军赛事大西洋区冠军 */
  division_atlantic_winner = 3979,
  /** 篮球冠军赛事年度最佳教练 */
  awards_coach_of_the_year = 3978,
  /** 篮球冠军赛事年度最佳防守球员 */
  group_h_winner_3977 = 3977,
  /** 篮球冠军赛事Regular Season MVP */
  group_h_winner_3976 = 3976,
  /** 篮球冠军赛事年度最佳新秀 */
  awards_rookie_of_the_year = 3975,
  /** 篮球冠军赛事最具进步的球员 */
  awards_most_improved_player = 3974,
  /** 篮球冠军赛事年度最佳第六人奖 */
  awards_sixth_man_of_the_year = 3973,
  /** 篮球冠军赛事年度最佳第六人奖 */
  regular_season_rebounds_per_game_leader = 3971,
  /** 篮球冠军赛事常规赛每场篮板数冠军 */
  regular_season_three_pointers_made_per_game_leader = 3970,
  /** 篮球冠军赛事年度常规赛每场得分领先者 */
  regular_season_points_per_game_leader = 3969,
  /** 篮球冠军赛事常规赛每场助攻王 */
  regular_season_assists_per_game_leader = 3968,
  /** 篮球冠军赛事常规赛冠军 */
  regular_season_winner = 3967,
  /** 篮球冠军赛事总决赛MVP */
  finals_mvp = 3966,
  /** 篮球获胜联盟 */
  winning_conference = 3965,
  /** 篮球获胜赛区 */
  winning_division = 3964,
  /** 篮球第一二名预测 */
  straight_forecast_12 = 3963,
  /** 篮球I组冠军 */
  group_i_winner_3962 = 3962,
  /** 篮球J组冠军 */
  group_j_winner_3961 = 3961,
  /** 篮球K组冠军 */
  group_k_winner_3960 = 3960,
  /** 篮球L组冠军 */
  group_l_winner_3959 = 3959,
  /** 篮球M组冠军 */
  group_m_winner = 3958,
  /** 篮球N组冠军 */
  group_n_winner = 3957,
  /** 篮球O组冠军 */
  group_o_winner = 3956,
  /** 篮球P组冠军 */
  group_p_winner = 3955,
  /** 篮球西部决赛MVP */
  western_conference_finals_mvp_3954 = 3954,
  /** 篮球东部决赛MVP */
  western_conference_finals_mvp_3953 = 3953,
  /** 沙滩排球独赢（两项） */
  beach_volleyball_winner = 51001,
  /** 沙滩排球让分 */
  beach_volleyball_point_handicap = 51002,
  /** 沙滩排球大小分 */
  beach_volleyball_points_over_under = 51003,
  /** 沙滩排球正确比分(BO5) */
  beach_volleyball_correct_score_bo5 = 51004,
  /** 沙滩排球正确比分(BO3) */
  beach_volleyball_correct_score_bo3 = 51005,
  /** 沙滩排球局独赢 */
  beach_volleyball_set_winner = 51006,
  /** 沙滩排球单双 */
  beach_volleyball_odd_even = 51007,
  /** 沙滩排球让盘 */
  beach_volleyball_set_handicap = 51008,
  /** 沙滩排球总盘数 */
  beach_volleyball_sets_over_under = 51009,
  /** 沙滩排球主队大小分 */
  beach_volleyball_points_over_under_home = 51010,
  /** 沙滩排球客队大小分 */
  beach_volleyball_points_over_under_away = 51011,
  /** 沙滩排球精确盘数(BO3) */
  beach_volleyball_exact_sets_bo3 = 51012,
  /** 沙滩排球精确盘数(BO5) */
  beach_volleyball_exact_sets_bo5 = 51013,
  /** 沙滩排球冠军赛事冠军 */
  beachvolleyball_dynamic_outright_market = 51999,
  /** 沙滩排球冠军赛事冠军 */
  beachvolleyball_winner = 51998,
  /** BOWLS冠军赛事冠军 */
  dynamic_outright_market_21999 = 21999,
  /** 保龄球冠军赛事冠军 */
  winner_21998 = 21998,
  /** 拳击大小 */
  boxing_over_under = 19001,
  /** 拳击独赢（两项） */
  boxing_winner = 19002,
  /** 拳击是否会奋战到底 */
  boxing_fight_to_go_the_distance = 19003,
  /** 拳击获胜方式 */
  boxing_winning_method = 19004,
  /** 拳击冠军赛事冠军 */
  dynamic_outright_market_19999 = 19999,
  /** 拳击冠军赛事冠军 */
  winner_19998 = 19998,
  /** 板球独赢(胜平负) */
  cricket_1x2 = 14001,
  /** 板球独赢 */
  cricket_winner = 14002,
  /** 板球大小 */
  cricket_over_under = 14003,
  /** 板球大小 */
  cricket_over_under_home = 14004,
  /** 板球大小 */
  cricket_over_under_away = 14005,
  /** 板球单双 */
  cricket_odd_even = 14006,
  /** 板球在每队第一人出局前得分最高球队 */
  cricket_highest_opening_partnership = 14007,
  /** 板球是否有加时 */
  cricket_will_there_be_a_super_over = 14008,
  /** 板球是否有平局 */
  cricket_will_there_be_a_tie = 14009,
  /** 板球抛币获胜 */
  cricket_to_win_the_toss = 14010,
  /** 板球得四分最多的球队 */
  cricket_most_fours = 14011,
  /** 板球得六分最多的球队 */
  cricket_most_sixes = 14012,
  /** 板球第X回合大小 */
  cricket_xth_over_over_under = 14013,
  /** 板球第X出局方式 */
  cricket_xth_dismissal_method_2_way = 14015,
  /** 板球第X出局方式(6项) */
  cricket_xth_dismissal_method_6_way = 14016,
  /** 板球得四分大小 */
  cricket_over_under_fours = 14017,
  /** 板球得六分大小 */
  cricket_over_under_sixes = 14018,
  /** 板球主队得四分大小 */
  cricket_over_under_fours_home = 14019,
  /** 板球客队得四分大小 */
  cricket_over_under_fours_away = 14020,
  /** 板球主队得六分大小 */
  cricket_over_under_sixes_home = 14021,
  /** 板球客队得六分大小 */
  cricket_over_under_sixes_away = 14022,
  /** 板球三柱门大小 */
  cricket_over_under_wickets = 14023,
  /** 板球额外分大小 */
  cricket_over_under_extras = 14024,
  /** 板球个人最高得分 */
  cricket_highest_individual_score = 14025,
  /** 板球冠军赛事冠军 */
  winner_14998 = 14998,
  /** 板球冠军赛事冠军 */
  dynamic_outright_market_14999 = 14999,
  /** CSGO 独赢（两项） */
  csgo_2way = 179001,
  /** Counter-Strike 2 让分 */
  counterstrike_2_handicap = 179002,
  /** Counter-Strike 2 大小 */
  counterstrike_2_over_under = 179003,
  /** Counter-Strike 2 回合数让分 */
  counterstrike_2_round_handicap = 179004,
  /** Counter-Strike 2 回合数大小 */
  counterstrike_2_round_over_under = 179005,
  /** Counter-Strike 2 回合数单双 */
  counterstrike_2_round_odd_even = 179006,
  /** Counter-Strike 2 波胆(BO2) */
  counterstrike_2_correct_score_bo2 = 179007,
  /** Counter-Strike 2 波胆(BO3) */
  counterstrike_2_correct_score_bo3 = 179008,
  /** Counter-Strike 2 波胆(BO5) */
  counterstrike_2_correct_score_bo5 = 179009,
  /** Counter-Strike 2 波胆(BO7) */
  counterstrike_2_correct_score_bo7 = 179010,
  /** Counter-Strike 2 独赢 */
  counterstrike_2_map_winner = 179011,
  /** Counter-Strike 2 1x2 */
  counterstrike_2_map_1x2 = 179012,
  /** Counter-Strike 2 第X回合独赢 */
  counterstrike_2_xth_round_winner = 179013,
  /** Counter-Strike 2 手枪第X回合独赢 */
  counterstrike_2_pistol_xth_round_winner = 179014,
  /** Counter-Strike 2 获胜回合数先到达X的队伍 */
  counterstrike_2_round_race_to_x = 179015,
  /** Counter-Strike 2 上半场独赢 */
  counterstrike_2_map_first_half_winner = 179016,
  /** Counter-Strike 2 上半场1x2 */
  counterstrike_2_map_first_half_1x2 = 179017,
  /** Counter-Strike 2 下半场独赢 */
  counterstrike_2_map_second_half_winner = 179018,
  /** Counter-Strike 2 下半场1x2 */
  counterstrike_2_map_second_half_1x2 = 179019,
  /** Counter-Strike 2 是否有加时 */
  counterstrike_2_will_there_be_overtime = 179020,
  /** Counter-Strike 2 主队至少赢一局 */
  counterstrike_2_home_wins_at_least_one_map = 179021,
  /** Counter-Strike 2 客队至少赢一局 */
  counterstrike_2_away_wins_at_least_one_map = 179022,
  /** Counter-Strike 2 双重机会 */
  counterstrike_2_double_chance = 179023,
  /** Counter-Strike 2 地图单双 */
  counterstrike_2_map_odd_even = 179024,
  /** Counter-Strike 2 全场胜负/第X图胜负 */
  counterstrike_2_match_winner_map_x_winner = 179025,
  /** Counter-Strike 2 玩家击杀对决 */
  counterstrike_2_duel_of_player_kills = 179026,
  /** Counter-Strike 2 玩家击杀对决平局退款 */
  counterstrike_2_duel_of_player_kills_draw_no_bet = 179027,
  /** Counter-Strike 2 胜者/回合大小 */
  counterstrike_2_map_winner_round_over_under = 179028,
  /** Counter-Strike 2 手枪回合正确比分 */
  counterstrike_2_pistol_round_correct_score = 179029,
  /** Counter-Strike 2 地图胜者/第一个手枪回合胜者 */
  counterstrike_2_map_winner_first_pistol_round_winner = 179030,
  /** Counter-Strike 2 地图胜者/上半场胜者 */
  counterstrike_2_map_winner_first_half_winner = 179031,
  /** Counter-Strike 2 地图上半场回合让分 */
  counterstrike_2_map_first_half_round_handicap = 179032,
  /** Counter-Strike 2 主队回合数大小 */
  counterstrike_2_home_round_over_under = 179033,
  /** Counter-Strike 2 客队回合数大小 */
  counterstrike_2_away_round_over_under = 179034,
  /** Counter-Strike 2 主队上半场回合数大小 */
  counterstrike_2_home_first_half_round_over_under = 179035,
  /** Counter-Strike 2 客队上半场回合数大小 */
  counterstrike_2_away_first_half_round_over_under = 179036,
  /** Counter-Strike 2 胜分差 */
  counterstrike_2_winning_margin = 179037,
  /** Counter-Strike 2 地图上半场回合正确比分 */
  counterstrike_2_map_first_half_round_correct_score = 179038,
  /** Counter-Strike 2 地图回合正确比分 */
  counterstrike_2_map_round_correct_score = 179039,
  /** Counter-Strike 2 反恐部队地图回合大小(不包含加时) */
  counterstrike_2_counter_terrorist_round_over_under_excl_overtime = 179040,
  /** Counter-Strike 2 恐怖分子地图回合大小(不包含加时) */
  counterstrike_2_terrorist_round_over_under_excl_overtime = 179041,
  /** Counter-Strike 2 地图是否有刀击杀 */
  counterstrike_2_will_there_be_a_knife_kill = 179042,
  /** Counter-Strike 2 地图是否有宙斯X27电击枪击杀 */
  counterstrike_2_will_there_be_a_zeus_x27_kill = 179043,
  /** Counter-Strike 2 地图是否有高爆手雷击杀 */
  counterstrike_2_will_there_be_a_high_explosive_grenade_kill = 179044,
  /** Counter-Strike 2 地图是否有燃烧瓶/燃烧弹击杀 */
  counterstrike_2_will_there_be_a_molotov_incendiary_kill = 179045,
  /** Counter-Strike 2 选手击杀大小 */
  counterstrike_2_player_kill_over_under = 179046,
  /** Counter-Strike 2 选手爆头大小 */
  counterstrike_2_player_headshots_over_under = 179047,
  /** Counter-Strike 2 独赢三项 */
  counterstrike_2_1x2 = 179048,
  /** Counter-Strike 2 第几个加时独赢 */
  counterstrike_2_xth_overtime_winner = 179049,
  /** CSGO冠军赛事冠军 */
  dynamic_outright_market_179999 = 179999,
  /** CSGO冠军赛事冠军 */
  winner_179998 = 179998,
  /** Counter-Strike 2 进入总决赛 */
  counterstrike_2_to_reach_the_finals = 179997,
  /** 自行车冠军赛事冠军 */
  cycling_dynamic_outright_market = 25999,
  /** 自行车冠军赛事冠军 */
  cycling_winner = 25998,
  /** 飞镖让盘 */
  darts_set_handicap = 20001,
  /** 飞镖盘大小 */
  darts_sets_over_under = 20002,
  /** 飞镖独赢（两项） */
  darts_winner = 20003,
  /** 飞镖盘单双 */
  darts_sets_odd_even = 20004,
  /** 飞镖让局 */
  darts_leg_handicap = 20005,
  /** 飞镖局大小 */
  darts_legs_over_under = 20006,
  /** 飞镖盘独赢 */
  darts_set_winner = 20007,
  /** 飞镖单双 */
  darts_legs_odd_even = 20008,
  /** 飞镖单局正确比分(BO5) */
  darts_legs_correct_score_bo5 = 20009,
  /** 飞镖单局正确比分(BO7) */
  darts_legs_correct_score_bo7 = 20010,
  /** 飞镖单局正确比分(BO9) */
  darts_legs_correct_score_bo9 = 20011,
  /** 飞镖单局正确比分(BO11) */
  darts_legs_correct_score_bo11 = 20012,
  /** 飞镖单局正确比分(BO12) */
  darts_legs_correct_score_bo12 = 20013,
  /** 飞镖单局正确比分(BO13) */
  darts_legs_correct_score_bo13 = 20014,
  /** 飞镖单局正确比分(BO15) */
  darts_legs_correct_score_bo15 = 20015,
  /** 飞镖单局正确比分(BO17) */
  darts_legs_correct_score_bo17 = 20016,
  /** 飞镖单局正确比分(BO19) */
  darts_legs_correct_score_bo19 = 20017,
  /** 飞镖单局正确比分(BO21) */
  darts_legs_correct_score_bo21 = 20018,
  /** 飞镖单节正确比分(BO3) */
  darts_sets_correct_score_bo3 = 20019,
  /** 飞镖单节正确比分(BO5) */
  darts_sets_correct_score_bo5 = 20020,
  /** 飞镖单节正确比分(BO7) */
  darts_sets_correct_score_bo7 = 20021,
  /** 飞镖单节正确比分(BO9) */
  darts_sets_correct_score_bo9 = 20022,
  /** 飞镖单节正确比分(BO11) */
  darts_sets_correct_score_bo11 = 20023,
  /** 飞镖单节正确比分(BO13) */
  darts_sets_correct_score_bo13 = 20024,
  /** 飞镖单节正确比分(BO15) */
  darts_sets_correct_score_bo15 = 20025,
  /** 飞镖180分让分 */
  darts_180s_handicap = 20026,
  /** 飞镖180分大小 */
  darts_180s_over_under = 20027,
  /** 飞镖哪队选手180分更多 */
  darts_most_180s = 20028,
  /** 飞镖主队180分大小 */
  darts_home_180s_over_under = 20029,
  /** 飞镖客队180分大小 */
  darts_away_180s_over_under = 20030,
  /** 飞镖第X个得180分的选手 */
  darts_xth_player_to_score_180 = 20031,
  /** 飞镖最高决胜镖的球员 */
  darts_player_with_highest_checkout = 20032,
  /** 飞镖最高决胜镖大小 */
  darts_highest_checkout_in_match = 20033,
  /** 飞镖170分结束比赛 */
  darts_170_checkout_in_match = 20034,
  /** 飞镖三合一 */
  darts_king_of_the_oche = 20035,
  /** 飞镖比赛独赢&最高决胜镖 */
  darts_match_winner_and_highest_checkout = 20036,
  /** 飞镖比赛独赢&最多180分 */
  darts_match_winner_and_most_180s = 20037,
  /** 飞镖最高决胜镖&最多180分 */
  darts_highest_checkout_and_most_180s = 20038,
  /** 飞镖第X局独赢 */
  darts_xth_leg_winner = 20039,
  /** 飞镖第X局大小 */
  darts_xth_leg_over_under_darts = 20040,
  /** 飞镖第X局第Y次投掷最高得分球员 */
  darts_xth_leg_highest_scoring_player_on_yth_visits = 20041,
  /** 飞镖第X局第Y次投掷得分范围 */
  darts_xth_leg_point_range_on_yth_visit = 20042,
  /** 飞镖第X局最高决胜镖颜色 */
  darts_xth_leg_checkout_colour = 20043,
  /** 飞镖第X局最高决胜镖大小 */
  darts_xth_leg_checkout_over_under = 20044,
  /** 飞镖第X局最高决胜镖Y+ */
  darts_xth_leg_checkout_score_y = 20045,
  /** 飞镖第X局任一球员得180分 */
  darts_xth_leg_any_player_to_score_a_180 = 20046,
  /** 飞镖第X局主队球员得180分 */
  darts_xth_leg_home_to_score_a_180 = 20047,
  /** 飞镖第X局客队球员得180分 */
  darts_xth_leg_away_to_score_a_180 = 20048,
  /** 飞镖冠军赛事冠军 */
  dynamic_outright_market_20999 = 20999,
  /** 飞镖冠军赛事冠军 */
  winner_20998 = 20998,
  /** DOTA2 独赢 */
  dota2_winner = 164001,
  /** DOTA2 让分 */
  dota2_handicap = 164002,
  /** DOTA2 大小 */
  dota2_over_under = 164003,
  /** DOTA2 击杀数让分 */
  dota2_kill_handicap = 164004,
  /** DOTA2 击杀数大小 */
  dota2_kill_over_under = 164005,
  /** DOTA2 击杀数单双 */
  dota2_kill_odd_even = 164006,
  /** DOTA2 游戏持续时间 */
  dota2_map_duration = 164007,
  /** DOTA2 第一个不朽盾 */
  dota2_first_aegis = 164008,
  /** DOTA2 一血 */
  dota2_first_blood = 164009,
  /** DOTA2 一塔 */
  dota2_first_tower = 164010,
  /** DOTA2 第一个军营 */
  dota2_first_barracks = 164011,
  /** DOTA2 胜平负 */
  dota2_1x2 = 164012,
  /** DOTA2 击杀数先到达 */
  dota2_kill_race_to = 164013,
  /** DOTA2 波胆(BO2) */
  dota2_correct_score_bo2 = 164014,
  /** DOTA2 波胆(BO3) */
  dota2_correct_score_bo3 = 164015,
  /** DOTA2 波胆(BO5) */
  dota2_correct_score_bo5 = 164016,
  /** DOTA2 波胆(BO7) */
  dota2_correct_score_bo7 = 164017,
  /** DOTA2 第X杀 */
  dota2_xth_kill = 164018,
  /** DOTA2 出现超级兵 */
  dota2_mega_creeps = 164019,
  /** DOTA2 四杀 */
  dota2_ultra_kill = 164020,
  /** DOTA2 超神 */
  dota2_beyond_godlike = 164021,
  /** DOTA2 暴走 */
  dota2_rampage = 164022,
  /** DOTA2 主队至少赢一局 */
  dota2_home_wins_at_least_one_map = 164023,
  /** DOTA2 客队至少赢一局 */
  dota2_away_wins_at_least_one_map = 164024,
  /** DOTA2 搭大小 */
  dota2_towers_over_under = 164025,
  /** DOTA2 第X分钟激活的神符类型 */
  dota2_activated_rune_type_spawned_at_x_minute = 164026,
  /** DOTA2 双重机会 */
  dota2_double_chance = 164027,
  /** DOTA2 全场胜负/第X图胜负 */
  dota2_match_winner_map_x_winner = 164028,
  /** DOTA2 玩家击杀对决 */
  dota2_duel_of_player_kills = 164029,
  /** DOTA2 玩家击杀对决平局退款 */
  dota2_duel_of_player_kills_draw_no_bet = 164030,
  /** DOTA2 胜者/持续时间 */
  dota2_map_winner_map_duration = 164031,
  /** DOTA2 胜者/击杀大小 */
  dota2_map_winner_kill_over_under = 164032,
  /** DOTA2 肉山大小 */
  dota2_roshans_over_under = 164033,
  /** DOTA2 主队击杀数大小 */
  dota2_kill_over_under_home = 164034,
  /** DOTA2 客队击杀数大小 */
  dota2_kill_over_under_away = 164035,
  /** DOTA2冠军赛事冠军 */
  dynamic_outright_market_164999 = 164999,
  /** DOTA2冠军赛事冠军 */
  winner_164998 = 164998,
  /** DOTA2 进入总决赛 */
  to_reach_the_finals_164997 = 164997,
  /** 电子篮球让分 */
  ebasketball_handicap = 178001,
  /** 电子篮球大小分 */
  ebasketball_over_under = 178002,
  /** 电子篮球独赢（2项 */
  ebasketball_winner = 178003,
  /** 电子篮球主队总分大小 */
  ebasketball_over_under_home = 178004,
  /** 电子篮球客队总分大小 */
  ebasketball_over_under_away = 178005,
  /** 电子篮球单双 */
  ebasketball_odd_even = 178006,
  /** 电子篮球独赢（三项） */
  ebasketball_1x2 = 178007,
  /** 电子篮球平局退款 */
  ebasketball_draw_no_bet = 178008,
  /** 电子篮球独赢和大小 */
  ebasketball_inner_and_over_under = 178009,
  /** 电子篮球首次达到x分球队 */
  race_x_points = 178010,
  /** 电子篮球单节首次到达x分的球队 */
  ebasketball_quarter_race_to_x_points = 178011,
  /** 电子篮球冠军赛事冠军 */
  dynamic_outright_market_178999 = 178999,
  /** 电子篮球冠军赛事冠军 */
  winner_178998 = 178998,
  /** 电子足球让球 */
  esoccer_handicap = 177001,
  /** 电子足球大小球 */
  esoccer_over_under = 177002,
  /** 电子足球独赢(胜平负) */
  esoccer_1x2 = 177003,
  /** 电子足球主队大小球 */
  esoccer_over_under_home = 177004,
  /** 电子足球客队大小球 */
  esoccer_over_under_away = 177005,
  /** 电子足球第X个进球 */
  esoccer_the_first_few_goals = 177006,
  /** 电子足球单双 */
  esoccer_odd_even = 177007,
  /** 电子足球剩余时间获胜 */
  esoccer_which_team_wins_the_rest = 177008,
  /** 电子足球平局退款 */
  esoccer_draw_no_bet = 177009,
  /** 电子足球主胜退款 */
  esoccer_home_no_bet = 177010,
  /** 电子足球客胜退款 */
  esoccer_away_no_bet = 177011,
  /** 电子足球双重机会 */
  esoccer_double_chance = 177012,
  /** 电子足球足球欧盘让球 */
  esoccer_european_handicap = 177013,
  /** 电子足球主队精确进球数（选项0，1，2，3+） */
  esoccer_exact_goals_home_3 = 177014,
  /** 电子足球客队精确进球数（选项0，1，2，3+） */
  esoccer_exact_goals_away_3 = 177015,
  /** 电子足球足球主队是否获胜 */
  esoccer_home_to_win = 177016,
  /** 电子足球足球客队是否获胜 */
  esoccer_away_to_win = 177017,
  /** 电子足球任意球队获胜 */
  esoccer_any_team_to_win = 177018,
  /** 电子足球波胆（任意球队进球大于等于5判定选项”其他“赢） */
  esoccer_correct_score_max_33 = 177019,
  /** 电子足球波胆（任意球队进球大于等于5判定选项”其他“赢） */
  esoccer_correct_score_max_44 = 177020,
  /** 电子足球双方均有进球 */
  esoccer_both_teams_to_score = 177021,
  /** 电子足球半场全场胜平负 */
  esoccer_half_time_full_time = 177022,
  /** 电子足球大小&两队均进球 */
  esoccer_goals_o_u_and_both_teams_to_score = 177023,
  /** 电子足球胜平负和双方均有进球 */
  esoccer_1x2_and_both_team_to_score = 177024,
  /** 电子足球胜平负和大小 */
  esoccer_1x2_and_over_under = 177025,
  /** 电子足球双重机会和双方均有进球 */
  esoccer_double_chance_and_both_team_to_score = 177026,
  /** 电子足球双重机会和大小 */
  esoccer_double_chance_and_over_under = 177027,
  /** 电子足球进球单双和总进球数 */
  esoccer_odd_even_and_over_under_177028 = 177028,
  /** 电子足球进球单双和总进球数 */
  esoccer_odd_even_and_over_under_177029 = 177029,
  /** 电子足球主队精确进球数（选项0，1，2，3，4+） */
  exact_goals_home_4_177031 = 177031,
  /** 电子足球客队精确进球数（选项0，1，2，3，4+） */
  exact_goals_away_4_177032 = 177032,
  /** 电子足球冠军赛事冠军 */
  dynamic_outright_market_177999 = 177999,
  /** 电子足球冠军赛事冠军 */
  winner_177998 = 177998,
  /** 地板球冠军赛事冠军 */
  floor_ball_dynamic_outright_market = 10999,
  /** 地板球冠军赛事冠军 */
  floor_ball_winner = 10998,
  /** F1赛车对垒赛 */
  formula_1_head_to_head = 92001,
  /** F1车手冠军(不包含最低赔率) */
  formula_1_drivers_champion_without_lowest_odds = 92994,
  /** F1赛车冠军赛事冠军 */
  formula_1_dynamic_outright_market = 92999,
  /** F1赛车车手冠军 */
  formula_1_drivers_champion = 92998,
  /** F1赛车车队冠军 */
  formula_1_constructors_winner = 92997,
  /** F1最快圈数冠军 */
  formula_1_fastest_lap_winner = 92996,
  /** F1前三 */
  formula_1_top_3 = 92995,
  /** 室内五人足球让球 */
  futsal_handicap = 17001,
  /** 室内五人足球大小球 */
  futsal_over_under = 17002,
  /** 室内五人足球独赢(胜平负) */
  futsal_1x2 = 17003,
  /** 室内五人足球平局退款 */
  futsal_draw_no_bet = 17004,
  /** 室内五人足球单双 */
  futsal_odd_even = 17005,
  /** 室内五人足球双重机会 */
  futsal_double_chance = 17006,
  /** 室内五人足球双方均有进球 */
  futsal_both_teams_to_score = 17007,
  /** 室内五人足球剩余时间获胜 */
  futsal_which_team_wins_the_rest = 17008,
  /** 室内五人足球第X个进球 */
  futsal_xth_goal = 17009,
  /** 室内五人足球胜负 */
  futsal_winner = 17010,
  /** 室内五人足球主队大小球 */
  futsal_over_under_home = 17011,
  /** 室内五人足球客队大小球 */
  futsal_over_under_away = 17012,
  /** 五人足球冠军赛事冠军 */
  dynamic_outright_market_17999 = 17999,
  /** 五人足球冠军赛事冠军 */
  winner_17998 = 17998,
  /** 高尔夫冠军赛事冠军 */
  dynamic_outright_market_12999 = 12999,
  /** 高尔夫冠军赛事冠军 */
  winner_12998 = 12998,
  /** 手球让球 */
  handball_handicap = 8001,
  /** 手球大小 */
  handball_over_under = 8002,
  /** 手球主队大小 */
  handball_over_under_home = 8003,
  /** 手球客队大小 */
  handball_over_under_away = 8004,
  /** 手球胜平负 */
  handball_1x2 = 8005,
  /** 手球平局退款 */
  handball_moneyline = 8006,
  /** 手球单双 */
  handball_odd_even = 8007,
  /** 手球胜负 */
  handball_winner = 8008,
  /** 手球双重机会 */
  handball_double_chance = 8009,
  /** 手球半场全场胜平负 */
  handball_half_time_full_time = 8010,
  /** 手球得分最高的半场 */
  handball_the_highest_scoring_half = 8011,
  /** 手球晋级球队 */
  handball_to_qualify = 8012,
  /** 手球冠军赛事冠军 */
  dynamic_outright_market_8999 = 8999,
  /** 手球冠军赛事冠军 */
  winner_8998 = 8998,
  /** 冰球让球 */
  ice_hockey_handicap = 2001,
  /** 冰球大小球 */
  ice_hockey_over_under = 2002,
  /** 冰球胜平负 */
  ice_hockey_1x2 = 2003,
  /** 冰球单双 */
  ice_hockey_odd_even = 2004,
  /** 冰球主队大小球 */
  ice_hockey_over_under_home = 2005,
  /** 冰球客队大小球 */
  ice_hockey_over_under_away = 2006,
  /** 冰球胜负 */
  ice_hockey_winner = 2007,
  /** 冰球胜分差 */
  ice_hockey_winning_margin_3 = 2008,
  /** 冰球剩余时间获胜球队 */
  ice_hockey_which_team_wins_the_rest = 2009,
  /** 冰球第x粒进球 */
  ice_hockey_xth_goal = 2010,
  /** 冰球最后的进球 */
  ice_hockey_last_goal = 2011,
  /** 冰球正确比分 */
  ice_hockey_correct_score_max_7 = 2012,
  /** 冰球比赛会有加时 */
  ice_hockey_will_there_be_overtime = 2013,
  /** 冰球最高得分节 */
  ice_hockey_the_highest_scoring_period = 2014,
  /** 冰球双重机会 */
  ice_hockey_double_chance = 2015,
  /** 冰球独赢&大小 */
  ice_hockey_1x2_and_over_under = 2016,
  /** 冰球最先达到x分球队 */
  ice_hockey_race_to_x = 2017,
  /** 冰球精确进球数(10+) */
  ice_hockey_exact_goals_10 = 2018,
  /** 冰球双方均有进球 */
  ice_hockey_both_teams_to_score = 2019,
  /** 冰球独赢和双方均有进球 */
  ice_hockey_1x2_and_both_team_to_score = 2020,
  /** 冰球冠军赛事冠军 */
  icehockey_dynamic_outright_market = 2999,
  /** 冰球冠军赛事冠军 */
  icehockey_winner = 2998,
  /** 冰球冠军赛事冠军 */
  icehockey_western_conference_winner = 2997,
  /** 冰球东部冠军 */
  icehockey_eastern_conference_winner = 2996,
  /** 冰球大都会赛区冠军 */
  icehockey_metropolitan_division_winner = 2995,
  /** 冰球太平洋赛区冠军 */
  icehockey_pacific_division_winner = 2994,
  /** 冰球中央赛区冠军 */
  icehockey_central_division_winner = 2993,
  /** 冰球大西洋赛区冠军 */
  icehockey_atlantic_division_winner = 2992,
  /** King of Glory 独赢 */
  king_of_glory_winner = 180001,
  /** King of Glory 让分 */
  king_of_glory_handicap = 180002,
  /** King of Glory 大小 */
  king_of_glory_over_under = 180003,
  /** King of Glory 击杀数让分 */
  king_of_glory_kill_handicap = 180004,
  /** King of Glory 击杀数大小 */
  king_of_glory_kill_over_under = 180005,
  /** King of Glory 击杀数单双 */
  king_of_glory_kill_odd_even = 180006,
  /** King of Glory 游戏持续时间 */
  king_of_glory_map_duration = 180007,
  /** King of Glory 波胆(BO2) */
  king_of_glory_correct_score_bo2 = 180008,
  /** King of Glory 波胆(BO3) */
  king_of_glory_correct_score_bo3 = 180009,
  /** King of Glory 波胆(BO5) */
  king_of_glory_correct_score_bo5 = 180010,
  /** King of Glory 波胆(BO7) */
  king_of_glory_correct_score_bo7 = 180011,
  /** 独赢(三项) */
  n_1x2_180012 = 180012,
  /** King of Glory 主队至少赢一局 */
  king_of_glory_home_wins_at_least_one_map = 180013,
  /** King of Glory 客队至少赢一局 */
  king_of_glory_away_wins_at_least_one_map = 180014,
  /** King of Glory 双重机会 */
  king_of_glory_double_chance = 180015,
  /** King of Glory 全场胜负/第X图胜负 */
  king_of_glory_match_winner_map_x_winner = 180016,
  /** 王者荣耀冠军赛事冠军 */
  dynamic_outright_market_180999 = 180999,
  /** 王者荣耀冠军赛事冠军 */
  winner_180998 = 180998,
  /** LOL 独赢 */
  lol_winner = 165001,
  /** LOL 让分 */
  lol_handicap = 165002,
  /** LOL 大小 */
  lol_over_under_165003 = 165003,
  /** LOL 击杀数让分 */
  lol_kill_handicap = 165004,
  /** LOL 击杀数大小 */
  lol_kill_over_under = 165005,
  /** LOL 击杀数单双 */
  lol_kill_odd_even = 165006,
  /** LOL 游戏持续时间 */
  lol_map_duration = 165007,
  /** LOL 第一条大龙 */
  lol_first_baron = 165009,
  /** LOL 一血 */
  lol_first_blood = 165010,
  /** LOL 第一个水晶 */
  lol_first_inhibitor = 165012,
  /** LOL 小龙大小 */
  lol_dragon_slain_over_under = 165013,
  /** LOL 大龙大小 */
  lol_baron_slain_over_under = 165014,
  /** LOL 推塔大小 */
  lol_turret_destroyed_over_under = 165015,
  /** LOL 击杀数先到达 */
  lol_kill_race_to_x = 165016,
  /** LOL 胜平负 */
  lol_1x2 = 165017,
  /** LOL 波胆(BO2) */
  lol_correct_score_bo2 = 165018,
  /** LOL 波胆(BO3) */
  lol_correct_score_bo3 = 165019,
  /** LOL 波胆(BO5) */
  lol_correct_score_bo5 = 165020,
  /** LOL 第X杀 */
  lol_xth_kill = 165021,
  /** LOL 四杀 */
  lol_quadra_kill = 165022,
  /** LOL 五杀 */
  lol_penta_kill = 165023,
  /** LOL 主队至少赢一局 */
  lol_home_wins_at_least_one_map = 165024,
  /** LOL 客队至少赢一局 */
  lol_away_wins_at_least_one_map = 165025,
  /** LOL 双重机会 */
  lol_double_chance = 165026,
  /** LOL 第X小龙类型 */
  lol_xth_dragon_type = 165027,
  /** LOL 龙魂 */
  lol_dragon_soul_type = 165028,
  /** LOL 全场胜负/第X图胜负 */
  lol_match_winner_map_x_winner = 165029,
  /** LOL 玩家击杀对决 */
  lol_duel_of_player_kills = 165030,
  /** LOL 玩家击杀对决平局退款 */
  lol_duel_of_player_kills_draw_no_bet = 165031,
  /** LOL 胜者/持续时间 */
  lol_map_winner_map_duration = 165032,
  /** LOL 胜者/击杀大小 */
  lol_map_winner_kill_over_under = 165033,
  /** LOL 主队击杀数大小 */
  lol_kill_over_under_home = 165034,
  /** LOL 客队击杀数大小 */
  lol_kill_over_under_away = 165035,
  /** LOL 波胆(BO7) */
  lol_correct_score_bo7 = 165036,
  /** LOL 炼金龙是否被击杀 */
  lol_will_be_chemtech_dragon_slayed = 165037,
  /** LOL 风龙是否被击杀 */
  lol_will_be_cloud_dragon_slayed = 165038,
  /** LOL 海克斯龙是否被击杀 */
  lol_will_be_hextech_dragon_slayed = 165039,
  /** LOL 火龙是否被击杀 */
  lol_will_be_infernal_dragon_slayed = 165040,
  /** LOL 土龙是否被击杀 */
  lol_will_be_mountain_dragon_slayed = 165041,
  /** LOL 水龙是否被击杀 */
  lol_will_be_ocean_dragon_slayed = 165042,
  /** LOL冠军赛事冠军 */
  dynamic_outright_market_165999 = 165999,
  /** 英雄联盟冠军赛事冠军 */
  winner_165998 = 165998,
  /** LOL冠军地区 */
  region_of_winner = 165997,
  /** LOL进入总决赛 */
  to_reach_the_finals_165996 = 165996,
  /** LOL决赛MVP */
  fmvp = 165995,
  /** LOL冠军（不包含最低赔率） */
  winner_without_lowest_odds = 165994,
  /** LOL进入总决赛名单 */
  name_the_finalists = 165993,
  /** 无畏契约 独赢 */
  valorant_winner_169001 = 169001,
  /** 无畏契约 让分 */
  valorant_handicap = 169002,
  /** 无畏契约 大小 */
  lol_over_under_169003 = 169003,
  /** 无畏契约 回合数让分 */
  valorant_round_handicap = 169004,
  /** 无畏契约 回合数大小 */
  valorant_round_over_under = 169005,
  /** 无畏契约 回合数单双 */
  valorant_round_odd_even = 169006,
  /** 无畏契约 波胆(BO2) */
  valorant_correct_score_bo2 = 169007,
  /** 无畏契约 波胆(BO3) */
  valorant_correct_score_bo3 = 169008,
  /** 无畏契约 波胆(BO5) */
  valorant_correct_score_bo5 = 169009,
  /** 无畏契约 波胆(BO7) */
  valorant_correct_score_bo7 = 169010,
  /** 无畏契约 独赢 */
  valorant_map_winner = 169011,
  /** 无畏契约 第X回合独赢 */
  valorant_xth_round_winner = 169013,
  /** 无畏契约 手枪第X回合独赢 */
  valorant_pistol_xth_round_winner = 169014,
  /** 无畏契约 获胜回合数先到达X的队伍 */
  valorant_round_race_to_x = 169015,
  /** 无畏契约 上半场独赢 */
  valorant_map_first_half_winner = 169016,
  /** 无畏契约 上半场1x2 */
  valorant_map_first_half_1x2 = 169017,
  /** 无畏契约 下半场独赢 */
  valorant_map_second_half_winner = 169018,
  /** 无畏契约 下半场1x2 */
  valorant_map_second_half_1x2 = 169019,
  /** 无畏契约 是否有加时 */
  valorant_will_there_be_overtime = 169020,
  /** 无畏契约 主队至少赢一局 */
  valorant_home_wins_at_least_one_map = 169021,
  /** 无畏契约 客队至少赢一局 */
  valorant_away_wins_at_least_one_map = 169022,
  /** 无畏契约 双重机会 */
  valorant_double_chance = 169023,
  /** 无畏契约 地图单双 */
  valorant_map_odd_even = 169024,
  /** 无畏契约 全场胜负/第X图胜负 */
  valorant_match_winner_map_x_winner = 169025,
  /** 无畏契约 玩家击杀对决 */
  valorant_duel_of_player_kills = 169026,
  /** 无畏契约 玩家击杀对决平局退款 */
  valorant_duel_of_player_kills_draw_no_bet = 169027,
  /** 无畏契约 胜者/回合大小 */
  valorant_map_winner_round_over_under = 169028,
  /** 无畏契约 手枪回合正确比分 */
  valorant_pistol_round_correct_score = 169029,
  /** 无畏契约 地图胜者/第一个手枪回合胜者 */
  valorant_map_winner_first_pistol_round_winner = 169030,
  /** 无畏契约 地图胜者/上半场胜者 */
  valorant_map_winner_first_half_winner = 169031,
  /** 无畏契约 地图上半场回合让分 */
  valorant_map_first_half_round_handicap = 169032,
  /** 无畏契约 主队回合数大小 */
  valorant_home_round_over_under = 169033,
  /** 无畏契约 客队回合数大小 */
  valorant_away_round_over_under = 169034,
  /** 无畏契约 主队上半场回合数大小 */
  valorant_home_first_half_round_over_under = 169035,
  /** 无畏契约 客队上半场回合数大小 */
  valorant_away_first_half_round_over_under = 169036,
  /** 无畏契约 胜分差 */
  valorant_winning_margin = 169037,
  /** 无畏契约 地图上半场回合正确比分 */
  valorant_map_first_half_round_correct_score = 169038,
  /** 无畏契约 地图回合正确比分 */
  valorant_map_round_correct_score = 169039,
  /** 无畏契约 进攻方地图回合大小(不包含加时) */
  valorant_attacker_round_over_under_excl_overtime = 169040,
  /** 无畏契约 防守方地图回合大小(不包含加时) */
  valorant_defender_round_over_under_excl_overtime = 169041,
  /** 无畏契约 独赢三项 */
  valorant_1x2 = 169048,
  /** 无畏契约 第几个加时独赢 */
  valorant_xth_overtime_winner = 169049,
  /** 无畏契约 动态冠军玩法 */
  valorant_dynamic_outright_market = 169999,
  /** 无畏契约 冠军 */
  valorant_winner_169998 = 169998,
  /** 无畏契约 进入总决赛 */
  to_reach_the_finals_169997 = 169997,
  /** 无畏契约 组 A */
  group_a = 169996,
  /** 无畏契约 组 B */
  group_b = 169995,
  /** 无畏契约 组 C */
  group_c = 169994,
  /** 无畏契约 组 D */
  group_d = 169993,
  /** 无畏契约 组 Alpha */
  group_alpha = 169992,
  /** 无畏契约 组 Omega */
  group_omega = 169991,
  /** 无畏契约 组 A 晋级 */
  to_qualify_group_a = 169990,
  /** 无畏契约 组 B 晋级 */
  to_qualify_group_b = 169989,
  /** 无畏契约 组 C 晋级 */
  to_qualify_group_c = 169988,
  /** 无畏契约 组 D 晋级 */
  to_qualify_group_d = 169987,
  /** 混合格斗大小 */
  mma_over_under = 18001,
  /** 混合格斗独赢（两项 */
  mma_winner_18002 = 18002,
  /** 混合格斗是否会奋战到底 */
  mma_fight_to_go_the_distance = 18003,
  /** 混合格斗获胜方式 */
  mma_winning_method = 18004,
  /** 格斗冠军赛事冠军 */
  mma_dynamic_outright_market = 18999,
  /** 格斗冠军赛事冠军 */
  mma_winner_18998 = 18998,
  /** 摩托车赛动态冠军赛事玩法 */
  motorcycle_racing_dynamic_outright_market = 95999,
  /** 摩托车赛冠军赛事冠军 */
  motorcycle_racing_winner = 95998,
  /** 奥林匹克冠军赛事冠军 */
  olympic_dynamic_outright_market = 100999,
  /** 奥林匹克冠军赛事冠军 */
  olympic_winner = 100998,
  /** 奥林匹克冠军最多金牌 */
  olympic_most_gold_medals = 100997,
  /** 奥林匹克冠军大多数奖牌 */
  olympic_most_medals = 100996,
  /** 橄榄球让球 */
  rugby_handicap = 4001,
  /** 橄榄球大小 */
  rugby_over_under = 4002,
  /** 橄榄球独赢(三项) */
  rugby_1x2 = 4003,
  /** 橄榄球平局退款 */
  rugby_moneyline = 4004,
  /** 橄榄球主队大小 */
  rugby_over_under_home = 4005,
  /** 橄榄球客队大小 */
  rugby_over_under_away = 4006,
  /** 橄榄球单双 */
  rugby_odd_even = 4007,
  /** 橄榄球晋级球队 */
  rugby_to_qualify = 4008,
  /** 橄榄球冠军赛事冠军 */
  dynamic_outright_market_4999 = 4999,
  /** 橄榄球冠军赛事冠军 */
  winner_4998 = 4998,
  /** 斯诺克让局数 */
  frame_handicap = 16001,
  /** 斯诺克局大小 */
  frame_over_under = 16002,
  /** 斯诺克独赢（两项） */
  winner_16003 = 16003,
  /** 斯诺克单局让分 */
  points_handicap = 16004,
  /** 斯诺克单局大小分 */
  points_over_under = 16005,
  /** 斯诺克单局独赢（两项） */
  frame_winner = 16006,
  /** 斯诺克局数单双 */
  frame_odd_even = 16007,
  /** 斯诺克最先赢得X局的选手 */
  race_to_x_frames = 16008,
  /** 斯诺克剩余时间获胜 */
  which_player_wins_the_rest = 16009,
  /** 斯诺克是否会有决胜局 */
  will_there_be_a_deciding_frame = 16010,
  /** 斯诺克总分单双 */
  points_odd_even = 16011,
  /** 斯诺克最先获得X分的选手 */
  race_to_x_points_16012 = 16012,
  /** 斯诺克单杆最高分选手 */
  layer_with_highest_break = 16013,
  /** 斯诺克独赢（三项） */
  n_1x2_16014 = 16014,
  /** 斯诺克是否有单杆得分50+ */
  break_50 = 16015,
  /** 斯诺克是否有单杆得分100+ */
  break_100 = 16016,
  /** 斯诺克前X局独赢（三项） */
  n_1x2_frame_1_to = 16017,
  /** 斯诺克是否会有犯规 */
  will_there_be_a_foul_committed = 16018,
  /** 斯诺克打第X个球的选手 */
  player_to_pot_xth_ball = 16019,
  /** 斯诺克打最后球的选手 */
  player_to_pot_last_ball = 16020,
  /** 斯诺克最后得分的类型 */
  last_points_scored = 16021,
  /** 斯诺克正确比分（BO5） */
  correct_score_bo5 = 16022,
  /** 斯诺克正确比分（BO7） */
  correct_score_bo7 = 16023,
  /** 斯诺克正确比分（BO9） */
  correct_score_bo9 = 16024,
  /** 斯诺克正确比分（BO11） */
  correct_score_bo11 = 16025,
  /** 斯诺克冠军赛事冠军 */
  dynamic_outright_market_16999 = 16999,
  /** 斯诺克冠军赛事冠军 */
  winner_16998 = 16998,
  /** 足球让球 */
  soccer_handicap = 1000,
  /** 足球欧盘让球 */
  soccer_european_handicap = 1002,
  /** 足球独赢（胜平负） */
  soccer_1x2 = 1005,
  /** 足球平局退款 */
  soccer_draw_no_bet = 1006,
  /** 足球亚盘大小球 */
  soccer_over_under = 1007,
  /** 足球单双 */
  soccer_total_goals_odd_even = 1008,
  /** 足球角球胜平负 */
  soccer_corner_1x2 = 1009,
  /** 足球角球大小球 */
  soccer_corner_over_under = 1010,
  /** 足球角球让球 */
  soccer_conner_handicap = 1011,
  /** 足球双重机会 */
  soccer_double_chance = 1012,
  /** 足球角球数单双 */
  soccer_corner_odd_even = 1015,
  /** 足球主胜退款 */
  soccer_home_no_bet = 1016,
  /** 足球客胜退款 */
  soccer_away_no_bet = 1017,
  /** 足球胜分差 */
  soccer_winning_margin = 1018,
  /** 足球最后的进球 */
  soccer_last_goal = 1019,
  /** 足球主队大小球 */
  soccer_over_under_home = 1021,
  /** 足球客队大小球 */
  soccer_over_under_away = 1022,
  /** 足球主队零封对手 */
  soccer_clean_sheet_home = 1025,
  /** 足球客队零封对手 */
  soccer_clean_sheet_away = 1026,
  /** 足球双方均有进球 */
  soccer_both_teams_to_score = 1027,
  /** 足球哪支球队进球 */
  soccer_which_team_to_score = 1028,
  /** 足球胜平负和大小 */
  soccer_1x2_and_over_under = 1030,
  /** 足球独赢 & 第几个进球球队 */
  soccer_1x2_and_xth_goal = 1031,
  /** 足球胜平负和双方均有进球 */
  soccer_1x2_and_both_team_to_score = 1032,
  /** 足球半场全场胜平负 */
  soccer_half_time_full_time = 1033,
  /** 足球上/下半场均大于x */
  soccer_both_halves_over_x = 1034,
  /** 足球上/下半场均小于x */
  soccer_both_halves_under_x = 1035,
  /** 足球主队上/下半场均进球 */
  soccer_home_to_score_in_both_halves = 1036,
  /** 足球客队上/下半场均进球 */
  soccer_away_to_score_in_both_halves = 1037,
  /** 足球主队赢得所有半场 */
  soccer_home_to_win_both_halves = 1038,
  /** 足球主队赢得任一半场 */
  soccer_home_to_win_either_halves = 1039,
  /** 足球客队赢得所有半场 */
  soccer_away_to_win_both_halves = 1040,
  /** 足球客队赢得任一半场 */
  soccer_away_to_win_either_half = 1041,
  /** 足球得分最高的半场 */
  soccer_the_highest_scoring_half = 1042,
  /** 足球主队得分最高的半场 */
  soccer_the_highest_scoring_half_home = 1043,
  /** 足球客队得分最高的半场 */
  soccer_the_highest_scoring_half_away = 1044,
  /** 足球晋级球队 */
  soccer_to_qualify = 1046,
  /** 足球比赛结束形式 */
  soccer_how_exactly_will_the_match_be_decided = 1047,
  /** 足球比赛会有加时 */
  soccer_will_there_be_overtime = 1048,
  /** 足球比赛会进球 */
  soccer_will_there_be_a_goal = 1049,
  /** 足球比赛会有点球大战 */
  soccer_will_there_be_a_penalty_shootout = 1050,
  /** 足球第一个进球时间(15分钟以内) */
  soccer_when_will_the_1st_goal_be_scored_15_min_interval = 1051,
  /** 足球最先达到x个角球球队 */
  soccer_corner_race_to_x = 1054,
  /** 足球最后的角球 */
  soccer_last_corner = 1055,
  /** 足球主队角球数大小 */
  soccer_corners_over_under_home = 1057,
  /** 足球客队角球数大小 */
  soccer_corners_over_under_away = 1058,
  /** 足球得牌让牌 */
  soccer_booking_handicap = 1060,
  /** 足球得牌胜平负 */
  soccer_booking_1x2 = 1061,
  /** 足球罚牌大小 */
  soccer_bookings_over_under = 1063,
  /** 足球主队罚牌大小 */
  soccer_bookings_over_under_home = 1065,
  /** 足球客队罚牌大小 */
  soccer_bookings_over_under_away = 1066,
  /** 足球黄牌让牌 */
  soccer_yellow_cards_handicap = 1067,
  /** 足球黄牌大小 */
  soccer_yellow_cards_over_under = 1068,
  /** 足球黄牌胜平负 */
  soccer_yellow_cards_1x2 = 1069,
  /** 足球罚牌时间 */
  soccer_total_booking_points = 1070,
  /** 足球是否有球员被罚下 */
  soccer_sending_off = 1072,
  /** 足球主队有球员罚下 */
  soccer_player_sent_off_home = 1073,
  /** 足球客队有球员罚下 */
  soccer_player_sent_off_away = 1074,
  /** 足球第几个进球的球员 */
  soccer_xth_goalscorer = 1075,
  /** 足球任何时间进球的球员 */
  soccer_anytime_goalscorer = 1076,
  /** 足球最后一个进球的球员 */
  soccer_last_goalscorer = 1077,
  /** 足球双重机会和大小 */
  soccer_double_chance_and_over_under = 1078,
  /** 足球双重机会和双方均有进球 */
  soccer_double_chance_and_both_team_to_score = 1079,
  /** 足球波胆多重选择 */
  soccer_multiscores = 1080,
  /** 足球主队单双 */
  soccer_odd_even_home = 1082,
  /** 足球客队单双 */
  soccer_odd_even_away = 1083,
  /** 足球紅牌让牌 */
  soccer_red_cards_handicap = 1086,
  /** 足球紅牌大小 */
  soccer_red_cards_over_under = 1087,
  /** 足球紅牌胜平负 */
  soccer_red_cards_1x2 = 1088,
  /** 足球第几个进球球队 */
  soccer_xth_goal = 1089,
  /** 足球剩余时间获胜球队 */
  soccer_which_team_wins_the_rest = 1090,
  /** 足球主队获胜 */
  soccer_home_to_win = 1091,
  /** 足球客队获胜 */
  soccer_away_to_win = 1092,
  /** 足球任意球队获胜 */
  soccer_any_team_to_win = 1093,
  /** 足球第x个角球 */
  soccer_xth_corner = 1094,
  /** 足球上下半场双方是否进球 */
  soccer_1st_2nd_half_both_teams_to_score = 1097,
  /** 足球点球大战获胜球队 */
  soccer_penalty_shootout_winner = 1098,
  /** 足球足球波胆（任意球队进球大于等于5判定选项”其他“赢） */
  soccer_correct_score_max_44 = 1099,
  /** 足球波胆（任意球队进球大于等于3判定选项”其他“赢） */
  soccer_correct_score_max_22 = 1100,
  /** 足球进球范围（选项0-1， 2-3，4-6，7+） */
  soccer_goal_range_7 = 1101,
  /** 足球精确进球数（选项0，1，2，3，4，5，6+） */
  soccer_exact_goals_6 = 1102,
  /** 足球精确进球数（选项0，1，2，3+） */
  soccer_exact_goals_3 = 1103,
  /** 足球精确进球数（选项0，1，2+） */
  soccer_exact_goals_2 = 1104,
  /** 足球主队精确进球数（选项0，1，2，3+） */
  soccer_exact_goals_home_3 = 1105,
  /** 足球客队精确进球数（选项0，1，2，3+） */
  soccer_exact_goals_away_3 = 1106,
  /** 足球角球范围（选项 0-8，9-11，12+） */
  soccer_corner_range_12 = 1107,
  /** 足球角球范围（选项 0-4，5-6，7+） */
  soccer_corner_range_7 = 1108,
  /** 足球主队角球范围（选项0-2，3-4，5-6，7+） */
  soccer_corner_range_home_7 = 1109,
  /** 足球客队角球范围（选项0-2，3-4，5-6，7+） */
  soccer_corner_range_away_7 = 1110,
  /** 足球波胆（选项中任意球队进球小于等于9） */
  soccer_correct_score_max_99 = 1111,
  /** 足球主队精确进球数（选项0，1，2，3，4+） */
  exact_goals_home_4_1112 = 1112,
  /** 足球客队精确进球数（选项0，1，2，3，4+） */
  exact_goals_away_4_1113 = 1113,
  /** 足球获胜方法 */
  soccer_winning_method = 1114,
  /** 足球大小&两队均进球 */
  soccer_goals_o_u_and_both_teams_to_score = 1115,
  /** 足球球员是否进球 */
  soccer_player_to_score = 1116,
  /** 足球进球方式 */
  soccer_xth_scoring_type = 1118,
  /** 足球获得冠军 */
  soccer_which_team_will_win_the_final = 1119,
  /** 足球获得季军 */
  soccer_which_team_will_win_the_3rd_place_final = 1120,
  /** 足球点球波胆 */
  soccer_correct_score_pen = 1123,
  /** 足球获胜 & 大小 */
  soccer_winner_and_over_under = 1124,
  /** 足球精确进球数（选项0-4，5，6，7，8，9，10+） */
  soccer_exact_goals_10 = 1125,
  /** 足球得牌单双 */
  soccer_bookign_odd_even = 1126,
  /** 足球哪队开球 */
  soccer_which_team_kicks_off = 1127,
  /** 足球第x个点球是否进球 */
  xth_penalty_scored = 1128,
  /** 足球点球阶段胜分差 */
  winning_margin_3_pen = 1129,
  /** 足球主队第一个点球是否进球 */
  n_1st_penalty_scored_home = 1130,
  /** 足球客队第一个点球是否进球 */
  n_1st_penalty_scored_away = 1131,
  /** 足球主队第二个点球是否进球 */
  n_2nd_penalty_scored_home = 1132,
  /** 足球客队第二个点球是否进球 */
  n_2nd_penalty_scored_away = 1133,
  /** 足球主队第三个点球是否进球 */
  n_3rd_penalty_scored_home = 1134,
  /** 足球客队第三个点球是否进球 */
  n_3rd_penalty_scored_away = 1135,
  /** 足球主队第四个点球是否进球 */
  n_4th_penalty_scored_home = 1136,
  /** 足球客队第四个点球是否进球 */
  n_4th_penalty_scored_away = 1137,
  /** 足球主队第五个点球是否进球 */
  n_5th_penalty_scored_home = 1138,
  /** 足球客队第五个点球是否进球 */
  n_5th_penalty_scored_away = 1139,
  /** 足球点球第一回合胜平负 */
  round_1 = 1140,
  /** 足球点球第二回合胜平负 */
  round_2 = 1141,
  /** 足球点球第三回合胜平负 */
  round_3 = 1142,
  /** 足球点球第四回合胜平负 */
  round_4 = 1143,
  /** 足球点球第五回合胜平负 */
  round_5 = 1144,
  /** 足球点球结束的回合 */
  finishing_round = 1145,
  /** 足球第一个角球（两项） */
  n_1st_corner_two_way = 1146,
  /** 足球最后一个角球（两项） */
  last_corner_two_way = 1147,
  /** 足球第一个得牌 */
  n_1st_booking_two_way = 1148,
  /** 足球最后一个得牌 */
  last_booking_two_way = 1149,
  /** 足球第一个换人 */
  n_1st_substitution = 1150,
  /** 足球最后一个换人 */
  last_substitution = 1151,
  /** 足球第一个球门球 */
  n_1st_goal_kick = 1152,
  /** 足球最后一个球门球 */
  last_goal_kick = 1153,
  /** 足球第一个越位 */
  n_1st_offside = 1154,
  /** 足球最后一个越位 */
  last_offside = 1155,
  /** 足球第一个界外球 */
  n_1st_throw_in = 1156,
  /** 足球最后一个界外球 */
  last_throw_in = 1157,
  /** 足球第一个任意球 */
  n_1st_free_kick = 1158,
  /** 足球最后一个任意球 */
  last_free_kick = 1159,
  /** 足球角球最高得分半场 */
  corner_highest_scoring_half = 1160,
  /** 足球角球最高得分半场(两项) */
  corner_highest_scoring_half_two_way = 1161,
  /** 足球最高得分半场让分 */
  highest_scoring_half_has_line = 1162,
  /** 足球是否有乌龙球 */
  own_goal = 1163,
  /** 足球常规时间是否判罚第一个点球 */
  first_penalty_awarded = 1164,
  /** 足球常规时间判罚的第一个点球是否打进 */
  first_penalty_to_score = 1165,
  /** 足球哪队会反超获胜 */
  to_win_from_behind = 1166,
  /** 足球主队零失球获胜 */
  home_win_to_nil = 1167,
  /** 足球客队零失球获胜 */
  away_win_to_nil = 1168,
  /** 足球第几个得牌 */
  xth_booking_3_way = 1169,
  /** 足球精确得牌（12+） */
  exact_bookings_12 = 1170,
  /** 足球主队精确得牌（4+） */
  home_exact_bookings_4 = 1171,
  /** 足球客队精确得牌（4+） */
  away_exact_bookings_4 = 1172,
  /** 足球精确得牌（6+） */
  exact_bookings_6 = 1173,
  /** 足球主队精确得牌（3+） */
  home_exact_bookings_3 = 1174,
  /** 足球客队精确得牌（3+） */
  away_exact_bookings_3 = 1175,
  /** 足球第一个进球发生在哪个半场 */
  which_half_first_goal = 1176,
  /** 足球主队第一个进球发生在哪个半场 */
  home_which_half_first_goal = 1177,
  /** 足球客队第一个进球发生在哪个半场 */
  away_which_half_first_goal = 1178,
  /** 足球哪支球队踢第一个点球 */
  which_team_to_take_the_first_penalty = 1179,
  /** 足球是否进行点球骤死赛 */
  go_to_sudden_death = 1180,
  /** 足球点球第一个回合踢中门柱 */
  round_1_woodwork = 1181,
  /** 足球点球第二个回合踢中门柱 */
  round_2_woodwork = 1182,
  /** 足球点球第三个回合踢中门柱 */
  round_3_woodwork = 1183,
  /** 足球点球第四个回合踢中门柱 */
  round_4_woodwork = 1184,
  /** 足球点球第五个回合踢中门柱 */
  round_5_woodwork = 1185,
  /** 足球半/全场正确比分 */
  half_time_full_time_correct_score = 1186,
  /** 足球正确比分(动态选项) */
  correct_score_dynamic = 1188,
  /** 足球角球半场正确比分 */
  correct_corners_ht = 1189,
  /** 足球角球全场正确比分 */
  correct_corners_ft = 1190,
  /** 足球第X个角球（两项） */
  xth_corner_two_way = 1191,
  /** 足球反波胆(动态选项) */
  inverse_correct_score_dynamic = 1192,
  /** 足球正确比分(3-3) */
  correct_score_max_33 = 1193,
  /** 足球射正大小 */
  shots_on_target_over_under = 1194,
  /** 足球射正主队大小 */
  shots_on_target_over_under_home = 1195,
  /** 足球射正客队大小 */
  shots_on_target_over_under_away = 1196,
  /** 足球射正独赢(三项) */
  shots_on_target_1x2 = 1197,
  /** 足球射门大小 */
  shots_over_under = 1198,
  /** 足球射门主队大小 */
  shots_over_under_home = 1199,
  /** 足球射门客队大小 */
  shots_over_under_away = 1200,
  /** 足球射门独赢(三项) */
  shots_1x2 = 1201,
  /** 足球是否会进球(1 Min间隔) */
  will_there_be_a_goal_1_minute = 1202,
  /** 足球是否会进球(5 Min间隔) */
  will_there_be_a_goal_5_minute = 1203,
  /** 足球是否会有角球(1 Min间隔) */
  will_there_be_a_corner_1_minute = 1205,
  /** 足球是否会有角球(5 Min间隔) */
  will_there_be_a_corner_5_minute = 1206,
  /** 足球是否会有角球(10 Min间隔) */
  will_there_be_a_corner_10_minute = 1207,
  /** 足球是否会有得牌(1 Min间隔) */
  will_there_be_a_card_1_minute = 1208,
  /** 足球是否会有得牌(5 Min间隔) */
  will_there_be_a_card_5_minute = 1209,
  /** 足球是否会有得牌(10 Min间隔) */
  will_there_be_a_card_10_minute = 1210,
  /** 足球独赢两项(1 Min间隔) */
  draw_no_bet_1_minute = 1211,
  /** 足球独赢三项(5 Min间隔) */
  n_1x2_5_minute = 1212,
  /** 足球角球独赢两项(1 Min间隔) */
  corner_draw_no_bet_1_minute = 1214,
  /** 足球角球独赢三项(5 Min间隔) */
  corner_1x2_5_minute = 1215,
  /** 足球角球独赢三项(10 Min间隔) */
  corner_1x2_10_minute = 1216,
  /** 足球得牌独赢(1 Min间隔) */
  card_draw_no_bet_1_minute = 1217,
  /** 足球得牌独赢(5 Min间隔) */
  card_1x2_5_minute = 1218,
  /** 足球得牌独赢(10 Min间隔) */
  card_1x2_10_minute = 1219,
  /** 足球第1个进球(1 Min间隔) */
  n_1st_goal_1_minute = 1220,
  /** 足球第1个进球(5 Min间隔) */
  n_1st_goal_5_minute = 1221,
  /** 足球第1个角球(1 Min间隔) */
  n_1st_corner_1_minute = 1223,
  /** 足球第1个角球(5 Min间隔) */
  n_1st_corner_5_minute = 1224,
  /** 足球第1个角球(10 Min间隔) */
  n_1st_corner_10_minute = 1225,
  /** 足球第1个得牌(1 Min间隔) */
  n_1st_card_1_minute = 1226,
  /** 足球第1个得牌(5 Min间隔) */
  n_1st_card_5_minute = 1227,
  /** 足球第1个得牌(10 Min间隔) */
  n_1st_card_10_minute = 1228,
  /** 足球主队角球单双 */
  corner_odd_even_home = 1229,
  /** 足球客队角球单双 */
  corner_odd_even_away = 1230,
  /** 足球主队得牌单双 */
  booking_odd_even_home = 1231,
  /** 足球客队得牌单双 */
  booking_odd_even_away = 1232,
  /** 足球球员射门X次或以上 */
  player_to_have_x_or_more_shots = 1233,
  /** 足球球员射正X次或以上 */
  player_to_have_x_or_more_shots_on_target = 1234,
  /** 足球冠军赛事动态玩法 */
  dynamic_outright_market_1999 = 1999,
  /** 足球冠军赛事胜者 */
  winner_1998 = 1998,
  /** 足球冠军赛事A组前2名球队 */
  top_2_1997 = 1997,
  /** 足球冠军赛事A组前两名球队 */
  top_3_1996 = 1996,
  /** 足球冠军赛事A组前两名球队 */
  top_4_1995 = 1995,
  /** 足球冠军赛事A组前6名球队 */
  top_6 = 1994,
  /** 足球冠军赛事A组前8名球队 */
  top_8 = 1993,
  /** 足球冠军赛事跻身前半部分球队 */
  to_finish_in_top_half = 1992,
  /** 足球冠军赛事跻身后半部分球队 */
  to_finish_in_bottom_half = 1991,
  /** 足球冠军赛事降级球队 */
  relegation = 1990,
  /** 足球冠军赛事晋级球队 */
  promotion = 1989,
  /** 足球冠军赛事A组胜者 */
  group_a_winner_1988 = 1988,
  /** 足球冠军赛事B组胜者 */
  group_b_winner_1987 = 1987,
  /** 足球冠军赛事C组胜者 */
  group_c_winner_1986 = 1986,
  /** 足球冠军赛事D组胜者 */
  group_d_winner_1985 = 1985,
  /** 足球冠军赛事E组胜者 */
  group_e_winner_1984 = 1984,
  /** 足球冠军赛事F组胜者 */
  group_f_winner_1983 = 1983,
  /** 足球冠军赛事G组胜者 */
  group_g_winner_1982 = 1982,
  /** 足球冠军赛事H组胜者 */
  group_h_winner_1981 = 1981,
  /** 足球冠军赛事I组胜者 */
  group_i_winner_1968 = 1968,
  /** 足球冠军赛事J组胜者 */
  group_j_winner_1967 = 1967,
  /** 足球冠军赛事A组前两名球队 */
  group_a_top_2 = 1980,
  /** 足球冠军赛事B组前两名球队 */
  group_b_top_2 = 1979,
  /** 足球冠军赛事C组前两名球队 */
  group_c_top_2 = 1978,
  /** 足球冠军赛事D组前两名球队 */
  group_d_top_2 = 1977,
  /** 足球冠军赛事E组前两名球队 */
  group_e_top_2 = 1976,
  /** 足球冠军赛事F组前两名球队 */
  group_f_top_2 = 1975,
  /** 足球冠军赛事G组前两名球队 */
  group_g_top_2 = 1974,
  /** 足球冠军赛事H组前两名球队 */
  group_h_top_2 = 1973,
  /** 足球冠军赛事I组前两名球队 */
  group_i_top_2 = 1966,
  /** 足球冠军赛事J组前两名球队 */
  group_j_top_2 = 1965,
  /** 足球冠军赛事进入四分之一决赛球队 */
  to_reach_the_quarter_final = 1972,
  /** 足球冠军赛事进入半决赛球队 */
  to_reach_the_semi_finaleach = 1971,
  /** 足球冠军赛事垫底球队 */
  to_finish_bottom = 1970,
  /** 足球冠军赛事最高得分球员 */
  top_goalscorer = 1969,
  /** 足球最多助攻 */
  top_assist = 1964,
  /** 足球直接降级 */
  to_be_directly_relegated_12 = 1963,
  /** 足球西部冠军 */
  western_conference_winner_1962 = 1962,
  /** 足球东部冠军 */
  eastern_conference_winner_1961 = 1961,
  /** 足球进入决赛 */
  to_reach_the_final = 1960,
  /** 足球获胜洲 */
  winning_continent = 1959,
  /** 足球获胜组 */
  winning_group = 1958,
  /** 足球冠军和最多进球球员 */
  winner_and_top_goalscorer = 1957,
  /** 足球A组双进 */
  group_a_advancing_double = 1956,
  /** 足球B组双进 */
  group_b_advancing_double = 1955,
  /** 足球C组双进 */
  group_c_advancing_double = 1954,
  /** 足球D组双进 */
  group_d_advancing_double = 1953,
  /** 足球E组双进 */
  group_e_advancing_double = 1952,
  /** 足球F组双进 */
  group_f_advancing_double = 1951,
  /** 足球G组双进 */
  group_g_advancing_double = 1950,
  /** 足球H组双进 */
  group_h_advancing_double = 1949,
  /** 足球I组双进 */
  group_i_advancing_double = 1948,
  /** 足球J组双进 */
  group_j_advancing_double = 1947,
  /** 足球K组双进 */
  group_k_advancing_double = 1932,
  /** 足球L组双进 */
  group_l_advancing_double = 1931,
  /** 足球A组小组前二 */
  group_a_straight_forecast = 1946,
  /** 足球B组小组前二 */
  group_b_straight_forecast = 1945,
  /** 足球C组小组前二 */
  group_c_straight_forecast = 1944,
  /** 足球D组小组前二 */
  group_d_straight_forecast = 1943,
  /** 足球E组小组前二 */
  group_e_straight_forecast = 1942,
  /** 足球F组小组前二 */
  group_f_straight_forecast = 1941,
  /** 足球G组小组前二 */
  group_g_straight_forecast = 1940,
  /** 足球H组小组前二 */
  group_h_straight_forecast = 1939,
  /** 足球I组小组前二 */
  group_i_straight_forecast = 1938,
  /** 足球J组小组前二 */
  group_j_straight_forecast = 1937,
  /** 足球K组小组前二 */
  group_k_straight_forecast = 1930,
  /** 足球L组小组前二 */
  group_l_straight_forecast = 1929,
  /** 足球冠军赛事K组胜者 */
  group_k_winner_1936 = 1936,
  /** 足球冠军赛事L组胜者 */
  group_l_winner_1935 = 1935,
  /** 足球冠军赛事K组前两名球队 */
  group_k_top_2 = 1934,
  /** 足球冠军赛事L组前两名球队 */
  group_l_top_2 = 1933,
  /** 足球球队被淘汰的阶段 */
  stage_of_elimination = 1800,
  /** 足球谁将在联赛中获得更高的成绩 */
  who_will_finish_higher_in_the_league = 1801,
  /** 足球球队进球最多的球员 */
  top_team_goalscorer = 1802,
  /** 足球更多进球的球员 */
  most_goal = 1803,
  /** 足球球队得分大小 */
  total_points = 1804,
  /** 特殊投注赛事冠军 */
  specials_dynamic_outright_market = 93999,
  /** 特殊投注冠军赛事冠军 */
  specials_winner = 93998,
  /** 特殊投注最佳男演员(奥斯卡) */
  specials_best_actor_oscar = 93997,
  /** 特殊投注最佳女演员(奥斯卡) */
  specials_best_actress_oscar = 93996,
  /** 特殊投注最佳动画电影（奥斯卡） */
  specials_best_animated_feature_film_oscar = 93995,
  /** 特殊投注最佳摄影（奥斯卡） */
  specials_best_cinematography_oscar = 93994,
  /** 特殊投注最佳服装设计（奥斯卡） */
  specials_best_costume_design_oscar = 93993,
  /** 特殊投注最佳导演（奥斯卡） */
  specials_best_director_oscar = 93992,
  /** 特殊投注最佳纪录片（奥斯卡） */
  specials_best_documentary_feature_oscar = 93991,
  /** 特殊投注最佳影片剪辑（奥斯卡） */
  specials_best_film_editing_oscar = 93990,
  /** 特殊投注最佳国际剧情片（奥斯卡） */
  specials_best_international_feature_film_oscar = 93989,
  /** 特殊投注最佳化妆发型（奥斯卡） */
  specials_best_makeup_and_hairstyling_oscar = 93988,
  /** 特殊投注最佳音乐-原创乐谱（奥斯卡） */
  specials_best_music_original_score_oscar = 93987,
  /** 特殊投注最佳音乐-原创歌曲（奥斯卡） */
  specials_best_music_original_song_oscar = 93986,
  /** 特殊投注最佳影片（奥斯卡） */
  specials_best_picture_oscar = 93985,
  /** 特殊投注最佳艺术指导（奥斯卡） */
  specials_best_production_design_oscar = 93984,
  /** 特殊投注最佳音响（奥斯卡） */
  specials_best_sound_oscar = 93983,
  /** 特殊投注最佳女配角（奥斯卡） */
  specials_best_supporting_actress_oscar = 93982,
  /** 特殊投注最佳视觉效果奖（奥斯卡） */
  specials_best_visual_effects_oscar = 93981,
  /** 特殊投注最佳编剧-改编剧本（奥斯卡） */
  specials_best_writing_adapted_screenplay_oscar = 93980,
  /** 特殊投注最佳编剧-原创剧本（奥斯卡） */
  specials_best_writing_original_screenplay_oscar = 93979,
  /** 特殊投注最佳男演员（英国电影学院） */
  specials_best_actor_bafta = 93978,
  /** 特殊投注最佳女演员（英国电影学院） */
  specials_best_actress_bafta = 93977,
  /** 特殊投注最佳导演（英国电影学院） */
  specials_best_director_bafta = 93976,
  /** 特殊投注最佳影片（英国电影学院） */
  specials_best_film_bafta = 93975,
  /** 特殊投注最佳男配角（英国电影学院） */
  specials_best_supporting_actor_bafta = 93974,
  /** 特殊投注最佳女配角（英国电影学院） */
  specials_best_supporting_actress_bafta = 93973,
  /** 特殊投注英国杰出电影（英国电影学院） */
  specials_outstanding_british_film_bafta = 93972,
  /** 赛车动态冠军赛事玩法 */
  stock_car_racing_dynamic_outright_market = 94999,
  /** 赛车冠军赛事冠军 */
  stock_car_racing_winner = 94998,
  /** 乒乓球独赢（两项） */
  table_tennis_winner = 15001,
  /** 乒乓球让分 */
  table_tennis_point_handicap = 15002,
  /** 乒乓球大小分 */
  table_tennis_points_over_under = 15003,
  /** 乒乓球正确比分(BO5) */
  table_tennis_correct_score_bo5 = 15004,
  /** 乒乓球正确比分(BO7) */
  table_tennis_correct_score_bo7 = 15005,
  /** 乒乓球单双 */
  table_tennis_game_odd_even = 15006,
  /** 乒乓球单局独赢（两项） */
  table_tennis_game_winner = 15008,
  /** 乒乓球让盘 */
  table_tennis_game_handicap = 15009,
  /** 乒乓球总盘数 */
  table_tennis_games_over_under = 15010,
  /** 乒乓球主队大小分 */
  table_tennis_points_over_under_home = 15011,
  /** 乒乓球客队大小分 */
  table_tennis_points_over_under_away = 15012,
  /** 乒乓球精确盘数(BO5) */
  table_tennis_exact_sets_bo5 = 15013,
  /** 乒乓球精确盘数(BO7) */
  table_tennis_exact_sets_bo7 = 15014,
  /** 乒乓球冠军赛事冠军 */
  dynamic_outright_market_15999 = 15999,
  /** 乒乓球冠军赛事冠军 */
  winner_15998 = 15998,
  /** 网球独赢（两项） */
  tennis_winner = 5001,
  /** 网球让局 */
  tennis_game_handicap = 5002,
  /** 网球总局数 */
  tennis_games_over_under = 5003,
  /** 网球让盘 */
  tennis_set_handicap = 5004,
  /** 网球总盘数 */
  tennis_sets_over_under = 5005,
  /** 网球正确比分(BO3) */
  tennis_correct_score_bo3 = 5006,
  /** 网球正确比分(BO5) */
  tennis_correct_score_bo5 = 5007,
  /** 网球选手1总局数 */
  tennis_games_over_under_home = 5008,
  /** 网球选手2总局数 */
  tennis_games_over_under_away = 5009,
  /** 网球局数单双 */
  tennis_games_odd_even = 5010,
  /** 网球正确盘分 */
  tennis_set_correct_score = 5011,
  /** 网球盘独赢 */
  tennis_set_winner = 5012,
  /** 网球第几局胜者 */
  tennis_game_x_winner = 5013,
  /** 网球是否会有抢七 */
  tennis_will_there_be_a_tiebreak = 5014,
  /** 网球第一盘/整场比赛胜负 */
  tennis_double_result_1st_set_match = 5015,
  /** 网球主队赢一盘 */
  tennis_home_to_win_a_set = 5016,
  /** 网球客队赢一盘 */
  tennis_away_to_win_a_set = 5017,
  /** 网球独赢&大小 */
  tennis_winner_and_over_under = 5018,
  /** 网球盘独赢&盘大小 */
  tennis_set_winner_and_over_under = 5019,
  /** 网球精确盘数(BO3) */
  tennis_exact_sets_bo3 = 5020,
  /** 网球精确盘数(BO5) */
  tennis_exact_sets_bo5 = 5021,
  /** 网球冠军赛事冠军 */
  dynamic_outright_market_5999 = 5999,
  /** 网球冠军赛事冠军 */
  winner_5998 = 5998,
  /** 虚拟足球独赢 */
  n_1x2_1001003 = 1001003,
  /** 虚拟足球半/全场 */
  half_time_full_time_1001015 = 1001015,
  /** 虚拟足球双重机会 */
  double_chance = 1001004,
  /** 虚拟足球波胆（Max6） */
  correct_score_max6 = 1001006,
  /** 虚拟足球精确进球数（Max6） */
  exact_goalsmax6 = 1001007,
  /** 虚拟足球双方都进球 */
  both_teams_to_score = 1001008,
  /** 虚拟足球大/小 */
  over_under_1001002 = 1001002,
  /** 虚拟足球独赢 & 大/小 */
  n_1x2_and_over_under = 1001016,
  /** 虚拟足球进球区间（多项） */
  multi_goal_range = 1001011,
  /** 虚拟足球让球 */
  asian_handicap = 1001001,
  /** 虚拟足球欧盘让球 */
  european_handicap_1001005 = 1001005,
  /** 虚拟足球主队进球区间 */
  goal_range_home_3 = 1001012,
  /** 虚拟足球客队进球区间 */
  goal_range_away_3 = 1001013,
  /** 虚拟足球波胆（Max3） */
  correct_score_max3 = 1001010,
  /** 虚拟足球单双 */
  odd_even_1001009 = 1001009,
  /** 虚拟足球胜分差 */
  winning_margin = 1001014,
  /** 虚拟赛马冠军 */
  winner_1020001 = 1020001,
  /** 虚拟赛马前二 */
  place_1020002 = 1020002,
  /** 虚拟赛马前三 */
  show_1020003 = 1020003,
  /** 前二组合 */
  quinella_1020004 = 1020004,
  /** 准确前二 */
  exacta_1020005 = 1020005,
  /** 大小 */
  over_under_1020006 = 1020006,
  /** 单双 */
  odd_even_1020007 = 1020007,
  /** 虚拟赛狗冠军 */
  winner_1021001 = 1021001,
  /** 虚拟赛狗前二 */
  place_1021002 = 1021002,
  /** 虚拟赛狗前三 */
  show_1021003 = 1021003,
  /** 前二组合 */
  quinella_1021004 = 1021004,
  /** 准确前二 */
  exacta_1021005 = 1021005,
  /** 大小 */
  over_under_1021006 = 1021006,
  /** 单双 */
  odd_even_1021007 = 1021007,
  /** 虚拟沙地摩托冠军 */
  winner_1022001 = 1022001,
  /** 虚拟沙地摩托前二 */
  place_1022002 = 1022002,
  /** 虚拟沙地摩托前三 */
  show_1022003 = 1022003,
  /** 前二组合 */
  quinella_1022004 = 1022004,
  /** 准确前二 */
  exacta_1022005 = 1022005,
  /** 大小 */
  over_under_1022006 = 1022006,
  /** 单双 */
  odd_even_1022007 = 1022007,
  /** 虚拟摩托冠军 */
  winner_1023001 = 1023001,
  /** 虚拟摩托前二 */
  place_1023002 = 1023002,
  /** 虚拟摩托前三 */
  show_1023003 = 1023003,
  /** 前二组合 */
  quinella_1023004 = 1023004,
  /** 准确前二 */
  exacta_1023005 = 1023005,
  /** 大小 */
  over_under_1023006 = 1023006,
  /** 单双 */
  odd_even_1023007 = 1023007,
  /** 排球独赢（两项） */
  volleyball_winner = 13001,
  /** 排球让分 */
  volleyball_point_handicap = 13002,
  /** 排球大小分 */
  volleyball_points_over_under = 13003,
  /** 排球正确比分(BO5) */
  volleyball_correct_score_bo5 = 13004,
  /** 排球正确比分(BO7) */
  volleyball_correct_score_bo7 = 13005,
  /** 排球局独赢 */
  volleyball_set_winner = 13006,
  /** 排球单双 */
  volleyball_odd_even = 13007,
  /** 排球让盘 */
  volleyball_set_handicap = 13008,
  /** 排球总盘数 */
  volleyball_sets_over_under = 13009,
  /** 排球主队大小分 */
  volleyball_points_over_under_home = 13010,
  /** 排球客队大小分 */
  volleyball_points_over_under_away = 13011,
  /** 排球精确盘数(BO5) */
  volleyball_exact_sets_bo5 = 13012,
  /** 排球精确盘数(BO7) */
  volleyball_exact_sets_bo7 = 13013,
  /** 排球冠军赛事冠军 */
  dynamic_outright_market_13999 = 13999,
  /** 排球冠军赛事冠军 */
  winner_13998 = 13998,
  /** 水球大小 */
  water_polo_over_under = 24001,
  /** 水球独赢 */
  water_polo_1x2 = 24002,
  /** 水球让球 */
  water_polo_handicap = 24003,
  /** 水球单双 */
  water_polo_odd_even = 24004,
  /** 水球双重机会 */
  water_polo_double_chance = 24005,
  /** 水球冠军赛事冠军 */
  waterpolo_dynamic_outright_market = 24999,
  /** 水球冠军赛事冠军 */
  waterpolo_winner = 24998,
}
