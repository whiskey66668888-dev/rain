export interface TeamLite {
  name?: string;
  logo?: string;
}

export interface DiscoverMatchInfo {
  /**
   * 推荐数
   */
  adivce_num: string;
  /**
   * 北单期号名称
   */
  bd_issue_name: string;
  /**
   * 开球时间戳
   */
  begin_timestamp: string;
  /**
   * 国家ID
   */
  country_id: string;
  /**
   * 国家名称
   */
  country_name: string;
  /**
   * 初始让分指数
   */
  first_index_let: string;
  /**
   * 初始总分指数
   */
  first_index_total: string;
  /**
   * bti场馆对应赛事id
   */
  game_bti_match_id: string;
  /**
   * db场馆客队赔率
   */
  game_db_away_odds: string;
  /**
   * db场馆主队赔率
   */
  game_db_home_odds: string;
  /**
   * db场馆对应的赛事id
   */
  game_db_match_id: string;
  /**
   * fb场馆对应赛事id
   */
  game_fb_match_id: string;
  /**
   * 客队角球数（足球）
   */
  guest_corner: string;
  /**
   * 客队半场得分
   */
  guest_half_score: string;
  /**
   * 客队logo
   */
  guest_logo: string;
  /**
   * 客队排名
   */
  guest_order: string;
  /**
   * 客队加时赛比分
   */
  guest_over_time_score: string;
  /**
   * 客队点球大战进球数
   */
  guest_penalty_kick_score: string;
  /**
   * 客队红牌数
   */
  guest_red: string;
  /**
   * 客队得分
   */
  guest_score: string;
  /**
   * 客队每节得分（篮球）/ 每半场得分（足球）
   */
  guest_scores: string;
  /**
   * 客队ID
   */
  guest_team_id: string;
  /**
   * 客队名称
   */
  guest_team_name: string;
  /**
   * 客队黄牌数
   */
  guest_yellow: string;
  /**
   * 主队角球数（足球）
   */
  home_corner: string;
  /**
   * 主队半场得分
   */
  home_half_score: string;
  /**
   * 主队logo
   */
  home_logo: string;
  /**
   * 主队排名
   */
  home_order: string;
  /**
   * 主队加时赛比分
   */
  home_over_time_score: string;
  /**
   * 主队点球大战进球数
   */
  home_penalty_kick_score: string;
  /**
   * 主队红牌数
   */
  home_red: string;
  /**
   * 主队得分
   */
  home_score: string;
  /**
   * 主队每节得分（篮球）/ 每半场得分（足球）
   */
  home_scores: string;
  /**
   * 主队ID
   */
  home_team_id: string;
  /**
   * 主队名称
   */
  home_team_name: string;
  /**
   * 主队黄牌数
   */
  home_yellow: string;
  /**
   * 北单大小球数
   */
  index_bd_let_goals: string;
  /**
   * 北单胜平负指数
   */
  index_bd_spf_list: OddsItem[];
  /**
   * 竞彩大小球指数列表
   */
  index_jc_dxf_list: OddsItem[];
  /**
   * 竞彩让球胜平负指数列表
   */
  index_jc_rsf_list: OddsItem[];
  /**
   * 竞彩让球胜平负赔率列表
   */
  index_jc_rspf_list: OddsItem[];
  /**
   * 竞彩胜平负指数列表
   */
  index_jc_spf_list: OddsItem[];
  /**
   * 足球初始让球指数
   */
  index_let: string;
  /**
   * 实时大小球盘口
   */
  index_let_goals: string;
  /**
   * 足球初始总分指数
   */
  index_total: string;
  /**
   * 情报数
   */
  intelligence_num: string;
  /**
   * 是否关注
   */
  is_focus: string;
  /**
   * 是否直播（0/1）
   */
  is_live: string;
  /**
   * 是否有直播间
   */
  is_live_room: string;
  /**
   * 是否多路直播
   */
  is_mlive: string;
  /**
   * 是否热门联赛 0-否 1-是
   */
  is_sclass_hot: string;
  /**
   * 竞彩名称
   */
  issue_name: string;
  /**
   * 篮球初始让分盘口
   */
  let_goal: string;
  /**
   * 实时让分盘口
   */
  let_stop_live: string;
  /**
   * 实时让分盘口整数
   */
  let_stop_live_int: string;
  /**
   * 比赛状态（1=未开，2=上半场，8=完场 等）
   */
  match_state: string;
  /**
   * 状态名称（例如“未开”、“完场”）
   */
  match_state_name: string;
  /**
   * 比赛时间（完整格式 "2025-09-01 16:00:00"）
   */
  match_time: string;
  /**
   * 比赛时间（仅时分 "16:00"）
   */
  match_time_str: string;
  /**
   * 是否中立场 0-否 1-是
   */
  neutrality: string;
  /**
   * 国家拼音缩写
   */
  pinyin_country: string;
  /**
   * 比赛进行时间（分）
   */
  residue_minute: string;
  /**
   * 比赛唯一ID
   */
  schedule_id: string;
  /**
   * 联赛等级
   */
  sclass_grade: string;
  /**
   * 联赛ID
   */
  sclass_id: string;
  /**
   * 联赛名称
   */
  sclass_name: string;
  /**
   * 联赛排序
   */
  sclass_sort: string;
  /**
   * 篮球赛段: 4:4节 2:上下半场
   */
  section: string;
  /**
   * 球类类型
   */
  sport_type: string;
  streams: Streams;
  /**
   * 实时总分盘口
   */
  to_stop_live: string;
  /**
   * 篮球初始总分盘口
   */
  total_score: string;
  /**
   * V站赛事ID
   */
  tournament_id: string;
}

/**
 * OddsItem
 */
export interface OddsItem {
  /**
   * 赔率/盘口值
   */
  odds: string;
  /**
   * 盘口名称
   */
  title: string;
}

/**
 * Streams
 */
export interface Streams {
  /**
   * 直播或动画
   */
  live?: StreamsLive[];
  /**
   * 唯一值id todo emc播控唯一值id
   */
  match_id?: string;
}

/**
 * StreamsLive
 */
export interface StreamsLive {
  /**
   * 动画
   */
  anim: string;
  /**
   * fb PC高清路线
   */
  fb_fiv_hd: string;
  /**
   * fb PC标清路线
   */
  fb_fiv_sd: string;
  /**
   * fb H5高清路线
   */
  fb_m3u8_hd: string;
  /**
   * fb H5标清路线
   */
  fb_m3u8_sd: string;
  /**
   * 直播
   */
  live: string;
  /**
   * 线路名称 例如线路一 线路二
   */
  name: string;
  /**
   * 有的视频地址，需要使用定义的 refer地址才能访问
   */
  referer_url: string;
  /**
   * 防止盗播 只有fb有用
   */
  web_url: string;
}

export interface LiveSituationData {
  environment?: Environment;
  /**
   * 比赛事件（进球/换人等）
   */
  incidents?: LiveIncident[];
  /**
   * 文字直播列表
   */
  live_info?: LiveInfoItem[];
  /**
   * 实时数据统计（控球率/角球等）
   */
  state_info?: StateStat[];
  team_stats?: TeamStats;
  trend?: Trend;
}

/**
 * Environment
 */
export interface Environment {
  /**
   * 湿度
   */
  humidity?: string;
  /**
   * 压强
   */
  pressure?: string;
  /**
   * 温度
   */
  temperature?: string;
  /**
   * 天气
   */
  weather?: string;
  /**
   * 天气名称
   */
  weather_name?: string;
  /**
   * 风速
   */
  wind?: string;
}

/**
 * LiveIncident
 */
export interface LiveIncident {
  /**
   * 助攻球员 ID
   */
  assist1_id?: string;
  /**
   * 助攻球员姓名
   */
  assist1_name?: string;
  /**
   * 客队进球后比分
   */
  away_score?: string;
  /**
   * 封面
   */
  cover?: string;
  /**
   * GIF
   */
  gif?: string;
  /**
   * 主队进球后比分
   */
  home_score?: string;
  /**
   * 换上球员 ID
   */
  in_player_id?: string;
  /**
   * 换上球员姓名
   */
  in_player_name?: string;
  /**
   * 换下球员 ID
   */
  out_player_id?: string;
  /**
   * 换下球员姓名
   */
  out_player_name?: string;
  /**
   * 球员 ID
   */
  player_id?: string;
  /**
   * 球员姓名
   */
  player_name?: string;
  /**
   * 0=中立,1=主队,2=客队
   */
  position: string;
  /**
   * 事件原因描述
   */
  reason?: string;
  /**
   * 原因类型（1=牌,4=换人,19=其他）
   */
  reason_type?: string;
  /**
   * 秒（可选）
   */
  second?: string;
  /**
   * 分钟
   */
  time: string;
  /**
   * 事件类型（1=进球,3=黄牌,9=换人,11=中场,19=阶段）
   */
  type: string;
  /**
   * 事件类型信息
   */
  type_info: string;
}

export interface IncidentMsg {
  text: string;
  icon?: string;
  isTip?: boolean;
  isAssist?: boolean;
}

export type IncidentItem = LiveIncident & {
  list?: IncidentMsg[];
};

/**
 * LiveInfoItem
 */
export interface LiveInfoItem {
  /**
   * 播报文字
   */
  data: string;
  /**
   * 是否关键事件（0=否,1=是）
   */
  main: string;
  /**
   * 0=中立,1=主队,2=客队
   */
  position: string;
  /**
   * 时间（如 "16'"，可能为空）
   */
  time?: string;
  /**
   * 事件类型（0=播报,1=进球,2=角球,3=黄牌,10=开赛,11=半场）
   */
  type: string;
}

/**
 * StateStat
 */
export interface StateStat {
  /**
   * 客队数值
   */
  away: string;
  /**
   * 主队数值
   */
  home: string;
  /**
   * 指标名称（危险进攻/控球率/角球等）
   */
  name: string;
  /**
   * 指标类型 ID（22=射偏,21=射正,25=控球率…）
   */
  type: string;
}

/**
 * TeamStats
 */
export interface TeamStats {
  /**
   * 是否存在下半场补时（true/false）
   */
  after_add_half: boolean;
  /**
   * 下半场补时统计
   */
  after_add_half_state?: TeamStatItem[];
  /**
   * 下半场统计列表
   */
  after_half_state?: TeamStatItem[];
  /**
   * 是否存在上半场补时（true/false）
   */
  before_add_half: boolean;
  /**
   * 上半场补时统计
   */
  before_add_half_state?: TeamStatItem[];
  /**
   * 上半场统计列表
   */
  before_half_state?: TeamStatItem[];
  /**
   * 全场统计列表
   */
  full_state?: TeamStatItem[];
  /**
   * 面板位置（0=默认）
   */
  position: string;
}

/**
 * TeamStatItem
 */
export interface TeamStatItem {
  /**
   * 客队数值
   */
  away: string;
  /**
   * 客队百分比
   */
  away_rate: string;
  /**
   * 主队数值
   */
  home: string;
  /**
   * 主队百分比
   */
  home_rate: string;
  /**
   * 指标ID
   */
  item_id: string;
  /**
   * 指标名称（如角球/射门/射正等）
   */
  item_name: string;
}

/**
 * Trend
 */
export interface Trend {
  /**
   * 下半场趋势数组
   */
  after_half_trend?: string[];
  /**
   * 上半场趋势数组
   */
  before_half_trend?: string[];
  /**
   * 是否存在趋势数据（true/false）
   */
  exist: boolean;
  /**
   * 比赛事件列表
   */
  incidents?: Incident[];
}

/**
 * Incident
 */
export interface Incident {
  /**
   * 位置（0=中立,1=主队,2=客队）
   */
  position: string;
  /**
   * 发生时间（分钟或补时时间）
   */
  time: string;
  /**
   * 事件类型（1=进球,2=角球,3=黄牌等）
   */
  type: string;
  /**
   * 事件类型名称（可能为空）
   */
  type_name?: string;
}

/**
 * LineuoInfoData
 */
export interface LineUpData {
  info: InfoSection;
  last: LastSection;
  other: OtherSection;
}

/**
 * InfoSection
 */
export interface InfoSection {
  coach: Coach;
  env: EnvInfo;
  lineup: LineupInfo;
  statistic: NMFootLineupStatistic;
}

/**
 * Coach
 */
export interface Coach {
  away: CoachStats;
  home: CoachStats;
}

/**
 * CoachStats
 */
export interface CoachStats {
  /**
   * 主教练姓名
   */
  coach: string;
  /**
   * 国家
   */
  country: string;
  /**
   * 平局数
   */
  draw: string;
  /**
   * 负场数
   */
  lose: string;
  /**
   * 在场球队现价，例如 "1655万欧"
   */
  present_market_value: string;
  /**
   * 阵型，例如 "4-2-3-1"
   */
  team_formation: string;
  /**
   * 球队身价，例如 "1655万欧"
   */
  team_market_value: string;
  /**
   * 胜场数
   */
  win: string;
  /**
   * 胜率（百分比）
   */
  win_rate: string;
}

/**
 * EnvInfo
 */
export interface EnvInfo {
  /**
   * 容纳人数
   */
  capacity: string;
  /**
   * 湿度
   */
  humidity: string;
  /**
   * 气压
   */
  pressure: string;
  /**
   * 裁判名称
   */
  referee_name: string;
  /**
   * 温度
   */
  temperature: string;
  /**
   * 球场名称
   */
  venue: string;
  /**
   * 天气编码
   */
  weather: string;
  /**
   * 风速
   */
  wind: string;
}

/**
 * LineupInfo
 */
export interface LineupInfo {
  /**
   * 客队队员
   */
  away: Player[];
  /**
   * 客队阵容位置是否有数据
   */
  away_position: boolean;
  /**
   * 国家信息是否有数据
   */
  country: boolean;
  /**
   * 主队队员
   */
  home: Player[];
  /**
   * 主队阵容位置是否有数据
   */
  home_position: boolean;
}

/**
 * InjuryPlayer
 */
export interface InjuryPlayer {
  /**
   * 是否主力/重要球员
   */
  important: string;
  /**
   * 球员姓名
   */
  player: string;
  /**
   * 球员 ID
   */
  player_id: string;
  /**
   * 球员头像
   */
  player_logo: string;
  /**
   * 球员位置
   */
  position: string;
  /**
   * 伤病原因
   */
  reason: string;
  /**
   * 球衣号码
   */
  shirt_num: string;
  /**
   * 球队 ID
   */
  team_id: string;
}

/**
 * Player
 */
export interface Player {
  /**
   * 年龄
   */
  age: string;
  /**
   * 是否队长
   */
  captain: boolean;
  /**
   * 身高
   */
  height: string;
  /**
   * 球员事件（进球/助攻等）
   */
  incidents: LineupIncident[];
  /**
   * 市场价值
   */
  market_value: string;
  /**
   * 是否全场最佳
   */
  mvp: boolean;
  /**
   * 国旗图标（可选）
   */
  national_logo: string;
  /**
   * 球员姓名
   */
  player: string;
  /**
   * 球员 ID
   */
  player_id: string;
  /**
   * 球员头像（可选）
   */
  player_logo?: string;
  /**
   * 球员 X 坐标
   */
  player_x: string;
  /**
   * 球员 Y 坐标
   */
  player_y: string;
  /**
   * 场上位置
   */
  position: string;
  /**
   * 评分
   */
  rating: string;
  /**
   * 球衣号码
   */
  shirt_num: string;
}

/**
 * LineupIncident
 */
export interface LineupIncident {
  /**
   * 是否助攻
   */
  assist: boolean;
  /**
   * 顺序
   */
  order: string;
  /**
   * 事件位置
   */
  position: string;
  /**
   * 事件时间
   */
  time: string;
  /**
   * 事件类型
   */
  type: string;
}

/**
 * NMFootLineupStatistic
 */
export interface NMFootLineupStatistic {
  away: NMFootLineupStatisticTeam;
  home: NMFootLineupStatisticTeam;
}

/**
 * NMFootLineupStatisticTeam
 */
export interface NMFootLineupStatisticTeam {
  age: NMFootLineupAge;
  /**
   * 球员国家统计列表
   */
  country_statistics: NMFootLineupCountryStat[];
  /**
   * 前三名球员国家统计
   */
  country_top3_statistics: NMFootLineupCountryStat[];
  height: NMFootLineupHeight;
  /**
   * 当前在场球员身价，例如 "3亿8000万欧"
   */
  present_market_value: string;
  /**
   * 球队身价，例如 "4亿9900万欧"
   */
  team_market_value: string;
  /**
   * 球队名称
   */
  team_name: string;
}

/**
 * NMFootLineupAge
 */
export interface NMFootLineupAge {
  /**
   * 平均年龄数值，例如 "25.8"
   */
  average_age: string;
  /**
   * 年龄字符串，例如 "25.8岁"
   */
  average_age_str: string;
}

/**
 * NMFootLineupCountryStat
 */
export interface NMFootLineupCountryStat {
  /**
   * 球员数量
   */
  count: string;
  /**
   * 国家ID
   */
  country_id: string;
  /**
   * 国家Logo
   */
  country_logo: string;
  /**
   * 国家名称
   */
  country_name: string;
  /**
   * 主队队员
   */
  players: Player[];
}

/**
 * NMFootLineupHeight
 */
export interface NMFootLineupHeight {
  average_height: string;
  average_height_str: string;
}

/**
 * LastSection
 */
export interface LastSection {
  /**
   * 客队上场阵容
   */
  away: Player[];
  /**
   * 客队阵型
   */
  away_formation: string;
  /**
   * 客队上场比赛 ID
   */
  away_last_match_id: string;
  /**
   * 客队上场比赛比分字符串
   */
  away_last_match_str: string;
  /**
   * 客队阵容是否有数据
   */
  away_position: boolean;
  /**
   * 国家信息是否有数据
   */
  country: boolean;
  /**
   * 主队上场阵容
   */
  home: Player[];
  /**
   * 主队阵型
   */
  home_formation: string;
  /**
   * 主队阵容是否有数据
   */
  home_position: boolean;
  statistic: NMFootLineupStatistic;
}

/**
 * OtherSection
 */
export interface OtherSection {
  change: ChangeSection;
  injury: InjurySection;
  substitute: LineupInfo;
  transfer: TransferInfo;
}

/**
 * ChangeSection
 */
export interface ChangeSection {
  /**
   * 客队换人
   */
  away: ChangePlayerV2[];
  /**
   * 主队换人
   */
  home: ChangePlayerV2[];
}

/**
 * ChangePlayer_v2
 */
export interface ChangePlayerV2 {
  /**
   * 换上球员事件
   */
  in_incidents: LineupIncident[];
  /**
   * 换上球员姓名
   */
  in_player: string;
  /**
   * 换上球员 ID
   */
  in_player_id: string;
  /**
   * 换上球员头像
   */
  in_player_logo: string;
  /**
   * 换上球员位置
   */
  in_position: string;
  /**
   * 换上球员评分
   */
  in_rating: string;
  /**
   * 换上球员号码
   */
  in_shirt_num: string;
  /**
   * 换下球员事件
   */
  out_incidents: LineupIncident[];
  /**
   * 换下球员姓名
   */
  out_player: string;
  /**
   * 换下球员 ID
   */
  out_player_id: string;
  /**
   * 换下球员头像
   */
  out_player_logo: string;
  /**
   * 换下球员位置
   */
  out_position: string;
  /**
   * 换下球员评分
   */
  out_rating: string;
  /**
   * 换下球员号码
   */
  out_shirt_num: string;
  /**
   * 时间排序
   */
  sort: string;
  /**
   * 换人时间
   */
  time: string;
}

/**
 * InjurySection
 */
export interface InjurySection {
  /**
   * 客队伤病（可能是 [] 或 ""）
   */
  away: InjuryPlayer[];
  /**
   * 主队伤病
   */
  home: InjuryPlayer[];
}

/**
 * TransferInfo
 */
export interface TransferInfo {
  /**
   * 客队引入球员
   */
  away_in: TransferPlayer[];
  /**
   * 客队流出球员
   */
  away_out: TransferPlayer[];
}

/**
 * TransferPlayer
 */
export interface TransferPlayer {
  /**
   * 年龄
   */
  age: string;
  /**
   * 国籍（可选）
   */
  national: string;
  /**
   * 球员姓名
   */
  player: string;
  /**
   * 球员 ID
   */
  player_id: string;
  /**
   * 球员头像（可选）
   */
  player_logo: string;
  /**
   * 场上位置
   */
  position: string;
  /**
   * 球队名称
   */
  team: string;
  /**
   * 球队 ID
   */
  team_id: string;
  /**
   * 转会时间
   */
  transfer_time_str: string;
  /**
   * 转会类型（租借/转会）
   */
  transfer_type_str: string;
}

/**
 * PlayerStatRoot
 */
export interface PlayerInfo {
  /**
   * 数据
   */
  list: PlayerStat[];
}

/**
 * PlayerStat
 */
export interface PlayerStat {
  att?: PlayerAttStats;
  def?: PlayerDefStats;
  /**
   * 出场分钟
   */
  minutes_played: string;
  pass?: PlayerPassStats;
  /**
   * 球员姓名
   */
  player: string;
  /**
   * 球员ID
   */
  player_id: string;
  /**
   * 球衣号码（可能为空）
   */
  shirt_num: string;
}

/**
 * PlayerAttStats
 */
export interface PlayerAttStats {
  /**
   * 助攻
   */
  assists: string;
  /**
   * 过人尝试
   */
  dribble: string;
  /**
   * 过人成功
   */
  dribble_success: string;
  /**
   * 进球
   */
  goals: string;
  /**
   * 越位
   */
  offsides: string;
  /**
   * 点球进球
   */
  penalty: string;
  /**
   * 红牌
   */
  red_cards: string;
  /**
   * 射门
   */
  shots: string;
  /**
   * 射偏
   */
  shots_not_on_target: string;
  /**
   * 射正
   */
  shots_on_target: string;
  /**
   * 被侵犯
   */
  was_fouled: string;
  /**
   * 黄牌
   */
  yellow_cards: string;
}

/**
 * PlayerDefStats
 */
export interface PlayerDefStats {
  /**
   * 封堵射门
   */
  blocked_shots: string;
  /**
   * 解围
   */
  clearances: string;
  /**
   * 犯规
   */
  fouls: string;
  /**
   * 拦截
   */
  interceptions: string;
  /**
   * 丢失球权
   */
  poss_losts: string;
  /**
   * 红牌
   */
  red_cards: string;
  /**
   * 抢断
   */
  tackles: string;
  /**
   * 黄牌
   */
  yellow_cards: string;
}

/**
 * PlayerPassStats
 */
export interface PlayerPassStats {
  /**
   * 成功传中次数
   */
  crosses_accuracy: string;
  /**
   * 传中成功率（百分比字符串）
   */
  crosses_accuracy_rate: string;
  /**
   * 关键传球
   */
  key_passes: string;
  /**
   * 成功长传次数
   */
  long_balls_accuracy: string;
  /**
   * 长传成功率（百分比字符串）
   */
  long_balls_accuracy_rate: string;
  /**
   * 成功传球次数
   */
  passes_accuracy: string;
  /**
   * 传球成功率（百分比字符串）
   */
  passes_accuracy_rate: string;
}

export type LineUpBenchPlayer = Player | InjuryPlayer;
