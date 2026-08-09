/** 比分类型，如 比分、角球、红黄牌等类型 , see enum: result_type_group */
export enum EFbResultTypeGroup {
  /** 得分 */
  Score = 5,
  /** 角球 */
  Corner = 6,
  /** 黄牌 */
  YellowCard = 7,
  /** 红牌 */
  RedCard = 8,
  /** 得牌(黄牌 + 红牌) */
  Booking = 9,
  /** 局分(斯诺克) */
  FrameScore = 12,
  /** 一杆得分(斯诺克) */
  BreakScore = 13,
  /** 本垒打(棒球) */
  HomeRun = 14,
  /** 安打(棒球) */
  Hit = 15,
  /** 达阵(美式足球) */
  Touchdown = 16,
  /** 射门(美式足球) */
  FieldGoal = 17,
  /** 排名(赛马、赛狗、赛车等) */
  Rank = 18,
  /** 得分(板球) */
  Runs = 19,
  /** 四分(板球) */
  Fours = 20,
  /** 六分(板球) */
  Sixes = 21,
  /** 击落三柱门(板球) */
  Wicket = 22,
  /** 得分(板球) */
  RunsSingle = 23,
  /** 四分(板球) */
  FoursSingle = 24,
  /** 六分(板球) */
  SixesSingle = 25,
  /** 击落三柱门(板球) */
  WicketSingle = 26,
  /** 飞镖局分 */
  LegScore = 27,
  /** 飞镖180分 */
  S180 = 28,
  /** 决胜镖 */
  Checkout = 29,
  /** 额外分 */
  Extra = 30,
  /** 获胜回合数 */
  Round = 31,
  /** 推塔(LOL) */
  DestroyedTurrets = 32,
  /** 推塔(DOTA) */
  DestroyedTowers = 33,
  /** 金钱 */
  Gold = 34,
  /** 射门 */
  Shot = 35,
  /** 射正 */
  ShotOnTarget = 36,
  /** 大获全胜 */
  BigGoldWin = 37,
  /** 小获全胜 */
  SmallGoldWin = 38,
  /** 出局 */
  RunOut = 39,
  /** 常规 */
  RegularWin = 40,
  /** 不当 */
  Foul = 41,
  /** 击杀数(电竞) */
  Kill = 127,
  /** 盘分(网球、排球、沙滩排球) */
  SetScore = 5556,
  /** 发球直接得分(网球) */
  Ace = 5557,
  /** 双误(网球) */
  DoubleFaultScore = 5558,
  /** 局分(网球、乒乓球、羽毛球) */
  GameScore = 5559,
  /** 空 */
  Empty = -1,
}

export enum EFbResultTypeGroupRemark {
  /** 得分 */
  Score = 'S',
  /** 角球 */
  Corner = 'C',
  /** 黄牌 */
  YellowCard = 'Y',
  /** 红牌 */
  RedCard = 'R',
  /** 得牌(黄牌 + 红牌) */
  Booking = 'B',
  /** 局分(斯诺克) */
  FrameScore = 'FS',
  /** 一杆得分(斯诺克) */
  BreakScore = 'MBS',
  /** 本垒打(棒球) */
  HomeRun = 'Home-Run',
  /** 安打(棒球) */
  Hit = 'Hit',
  /** 达阵(美式足球) */
  Touchdown = 'Touchdown',
  /** 射门(美式足球) */
  FieldGoal = 'Field Goal',
  /** 排名(赛马、赛狗、赛车等) */
  Rank = 'Rank',
  /** 得分(板球) */
  Runs = 'Runs',
  /** 四分(板球) */
  Fours = 'Fours',
  /** 六分(板球) */
  Sixes = 'Sixes',
  /** 击落三柱门(板球) */
  Wicket = 'Wicket',
  /** 飞镖局分 */
  LegScore = 'Leg',
  /** 飞镖180分 */
  S180 = '180s',
  /** 决胜镖 */
  Checkout = 'Checkout',
  /** 额外分 */
  Extra = 'Extra',
  /** 获胜回合数 */
  Round = 'Round',
  /** 推塔(LOL) */
  DestroyedTurrets = 'Destroyed Turrets',
  /** 推塔(DOTA) */
  DestroyedTowers = 'Destroyed Towers',
  /** 金钱 */
  Gold = 'Gold',
  /** 射门 */
  Shot = 'Shot',
  /** 射正 */
  ShotOnTarget = 'Shot On Target',
  /** 大获全胜 */
  BigGoldWin = 'Big Gold Win',
  /** 小获全胜 */
  SmallGoldWin = 'Small Gold Win',
  /** 出局 */
  RunOut = 'Run Out',
  /** 常规 */
  RegularWin = 'Regular Win',
  /** 不当 */
  Foul = 'Foul',
  /** 击杀数(电竞) */
  Kill = 'KS',
  /** 盘分(网球、排球、沙滩排球) */
  SetScore = 'SET',
  /** 发球直接得分(网球) */
  Ace = 'AS',
  /** 双误(网球) */
  DoubleFaultScore = 'DFS',
  /** 局分(网球、乒乓球、羽毛球) */
  GameScore = 'GS',
  /** 空 */
  Empty = '',
}
