/** 比赛阶段类型 see enum: period */
export enum EFbPeriod {
  /** 足球实时 */
  soccerRealTime = 1000,
  /** 足球全场 */
  soccerFullTime = 1001,
  /** 足球上半场 */
  soccerFirstHalf = 1002,
  /** 足球下半场 */
  soccerSecondHalf = 1003,
  /** 足球加时上半场 */
  soccerExtraFirstHalf = 1004,
  /** 足球加时下半场 */
  soccerExtraSecondHalf = 1005,
  /** 足球点球罚球 */
  soccerPenaltyKick = 1006,
  /** 足球0-15min */
  soccer0To15Min = 1007,
  /** 足球15-30min */
  soccer15To30Min = 1008,
  /** 足球30-45min */
  soccer30To45Min = 1009,
  /** 足球45-60min */
  soccer45To60Min = 1010,
  /** 足球60-75min */
  soccer60To75Min = 1011,
  /** 足球75-90min */
  soccer75To90Min = 1012,
  /** 足球加时全场 */
  soccerExtraFullTime = 1013,
  /** 足球全场包含加时 */
  soccerFullTimeInclET = 1014,
  /** 足球点球大战前5回合 */
  soccerPenaltyKickFirst5Rounds = 1015,

  /** 篮球全场（包含加时） */
  basketballFullTime = 3001,
  /** 篮固定时间 */
  basketballRegularTime = 3002,
  /** 篮球上半场 */
  basketballFirstHalf = 3003,
  /** 篮球下半场 */
  basketballSecondHalf = 3004,
  /** 篮球第一节 */
  basketballFirstQuarter = 3005,
  /** 篮球第二节 */
  basketballSecondQuarter = 3006,
  /** 篮球第三节 */
  basketballThirdQuarter = 3007,
  /** 篮球第四节 */
  basketballFourthQuarter = 3008,
  /** 篮球第一个加时 */
  basketballOverTime = 3009,
  /** 篮球下半场（包含加时） */
  basketballSecondHalfInclOT = 3010,
  /** 篮球第四节（包含加时） */
  basketballFourthQuarterInclOT = 3011,

  /** 排球实时 */
  volleyballRealTime = 13000,
  /** 排球全场 */
  volleyballFullTime = 13001,
  /** 排球第1场 */
  volleyballFirstSet = 13002,
  /** 排球第2场 */
  volleyballSecondSet = 13003,
  /** 排球 第3场 */
  volleyballThirdSet = 13004,
  /** 排球 第四场 */
  volleyballFourthSet = 13005,
  /** 排球 第五场 */
  volleyballFifthSet = 13006,
  /** 排球 第六场 */
  volleyballSixthSet = 13007,
  /** 排球 第七场 */
  volleyballSeventhSet = 13008,
  /** 排球 金局 */
  volleyballGoldenSet = 13009,

  /** 网球实时 */
  tennisRealTime = 5000,
  /** 网球全场 */
  tennisFullTime = 5001,
  /** 网球第一盘全盘 */
  tennisFirstSet = 5002,
  /** 网球第二盘全盘 */
  tennisSecondSet = 5003,
  /** 网球第三盘全盘 */
  tennisThirdSet = 5004,
  /** 网球第四盘全盘 */
  tennisFourthSet = 5005,
  /** 网球第五盘全盘 */
  tennisFifthSet = 5006,

  /** 拳击全场 */
  boxingFullTime = 19001,

  /** 英雄联盟 实时 */
  lolRealTime = 165000,
  /** 英雄联盟全场 */
  lolFullTime = 165001,
  /** 英雄联盟第一局 */
  lolMap1 = 165002,
  /** 英雄联盟第二局 */
  lolMap2 = 165003,
  /** 英雄联盟第三局 */
  lolMap3 = 165004,
  /** 英雄联盟第四局 */
  lolMap4 = 165005,
  /** 英雄联盟第五局 */
  lolMap5 = 165006,
  /** 英雄联盟第六局 */
  lolMap6 = 165007,
  /** 英雄联盟第七局 */
  lolMap7 = 165008,

  /** Dota2 实时 */
  dota2RealTime = 164000,
  /** Dota2 全场 */
  dota2FullTime = 164001,
  /** Dota2 第一局 */
  dota2Map1 = 164002,
  /** Dota2 第二局 */
  dota2Map2 = 164003,
  /** Dota2 第三局 */
  dota2Map3 = 164004,
  /** Dota2 第四局 */
  dota2Map4 = 164005,
  /** Dota2 第五局 */
  dota2Map5 = 164006,
  /** Dota2 第六局 */
  dota2Map6 = 164007,
  /** Dota2 第七局 */
  dota2Map7 = 164008,

  /** King of Glory 实时 */
  kingOfGloryRealTime = 180000,
  /** King of Glory 全場 */
  kingOfGloryFullTime = 180001,
  /** King of Glory 第一局 */
  kingOfGloryMap1 = 180002,
  /** King of Glory 第二局 */
  kingOfGloryMap2 = 180003,
  /** King of Glory 第三局 */
  kingOfGloryMap3 = 180004,
  /** King of Glory 第四局 */
  kingOfGloryMap4 = 180005,
  /** King of Glory 第五局 */
  kingOfGloryMap5 = 180006,
  /** King of Glory 第六局 */
  kingOfGloryMap6 = 180007,
  /** King of Glory 第七局 */
  kingOfGloryMap7 = 180008,

  /** Counter-Strike 2 实时 */
  counterStrike2RealTime = 179000,
  /** 反恐精英 整场比赛 */
  csgoFullTime = 179001,
  /** Counter-Strike 2 第一局 */
  counterStrike2Map1 = 179002,
  /** Counter-Strike 2 第二局 */
  counterStrike2Map2 = 179003,
  /** Counter-Strike 2 第三局 */
  counterStrike2Map3 = 179004,
  /** Counter-Strike 2 第四局 */
  counterStrike2Map4 = 179005,
  /** Counter-Strike 2 第五局 */
  counterStrike2Map5 = 179006,
  /** Counter-Strike 2 第六局 */
  counterStrike2Map6 = 179007,
  /** Counter-Strike 2 第七局 */
  counterStrike2Map7 = 179008,

  /** Valorant 实时 */
  valorantRealTime = 169000,
  /** Valorant 全场 */
  valorantFullTime = 169001,
  /** Valorant 第一局 */
  valorantMap1 = 169002,
  /** Valorant 第二局 */
  valorantMap2 = 169003,
  /** Valorant 第三局 */
  valorantMap3 = 169004,
  /** Valorant 第四局 */
  valorantMap4 = 169005,
  /** Valorant 第五局 */
  valorantMap5 = 169006,
  /** Valorant 第六局 */
  valorantMap6 = 169007,
  /** Valorant 第七局 */
  valorantMap7 = 169008,

  /** 乒乓球实时 */
  tableTennisRealTime = 15000,
  /** 乒乓球全场 */
  tableTennisFullTime = 15001,
  /** 乒乓球第1局 */
  tableTennisFirstGame = 15002,
  /** 乒乓球第2局 */
  tableTennisSecondGame = 15003,
  /** 乒乓球第3局 */
  tableTennisThirdGame = 15004,
  /** 乒乓球第4局 */
  tableTennisFourthGame = 15005,
  /** 乒乓球第5局 */
  tableTennisFifthGame = 15006,
  /** 乒乓球第6局 */
  tableTennisSixthGame = 15007,
  /** 乒乓球第7局 */
  tableTennisSeventhGame = 15008,

  /** 棒球 全场(包含加时) */
  baseballFullTimeInclExtraInns = 7001,
  /** 棒球 全场 */
  baseballFullTime = 7002,
  /** 棒球 前五局 */
  baseballInning1To5 = 7003,
  /** 棒球 第一局 */
  baseballInning1 = 7004,
  /** 棒球 第二局 */
  baseballInning2 = 7005,
  /** 棒球 第三局 */
  baseballInning3 = 7006,
  /** 棒球 第四局 */
  baseballInning4 = 7007,
  /** 棒球 第五局 */
  baseballInning5 = 7008,
  /** 棒球 第六局 */
  baseballInning6 = 7009,
  /** 棒球 第七局 */
  baseballInning7 = 7010,
  /** 棒球 第八局 */
  baseballInning8 = 7011,
  /** 棒球 第九局 */
  baseballInning9 = 7012,
  /** 棒球 加时 */
  baseballExtraInning = 7013,
  /** 棒球 第十局 */
  baseballInning10 = 7014,
  /** 棒球 第十一局 */
  baseballInning11 = 7015,
  /** 棒球 第十二局 */
  baseballInning12 = 7016,
  /** 棒球 第十三局 */
  baseballInning13 = 7017,
  /** 棒球 第十四局 */
  baseballInning14 = 7018,
  /** 棒球 第十五局 */
  baseballInning15 = 7019,
  /** 棒球 第十六局 */
  baseballInning16 = 7020,
  /** 棒球 第十七局 */
  baseballInning17 = 7021,
  /** 棒球 第十八局 */
  baseballInning18 = 7022,
  /** 棒球 第十九局 */
  baseballInning19 = 7023,
  /** 棒球 第二十局 */
  baseballInning20 = 7024,
  /** 棒球 第二十一局 */
  baseballInning21 = 7025,
  /** 棒球 第二十二局 */
  baseballInning22 = 7026,
  /** 棒球 第二十三局 */
  baseballInning23 = 7027,
  /** 棒球 第二十四局 */
  baseballInning24 = 7028,
  /** 棒球 第二十五局 */
  baseballInning25 = 7029,
  /** 棒球 第二十六局 */
  baseballInning26 = 7030,
  /** 棒球 第二十七局 */
  baseballInning27 = 7031,
  /** 棒球 第二十八局 */
  baseballInning28 = 7032,
  /** 棒球 第二十九局 */
  baseballInning29 = 7033,
  /** 棒球 第三十局 */
  baseballInning30 = 7034,
  /** 棒球 第三十一局 */
  baseballInning31 = 7035,
  /** 棒球 第三十二局 */
  baseballInning32 = 7036,
  /** 棒球 第三十三局 */
  baseballInning33 = 7037,
  /** 棒球 第三十四局 */
  baseballInning34 = 7038,
  /** 棒球 第三十五局 */
  baseballInning35 = 7039,
  /** 棒球 第三十六局 */
  baseballInning36 = 7040,
  /** 棒球 第三十七局 */
  baseballInning37 = 7041,
  /** 棒球 第三十八局 */
  baseballInning38 = 7042,
  /** 棒球 第三十九局 */
  baseballInning39 = 7043,
  /** 棒球 第四十局 */
  baseballInning40 = 7044,

  /** 羽毛球 实时 */
  badmintonRealTime = 47000,
  /** 羽毛球 全场 */
  badmintonFullTime = 47001,
  /** 羽毛球第一局 */
  badmintonFirstGame = 47002,
  /** 羽毛球第二局 */
  badmintonSecondGame = 47003,
  /** 羽毛球第三局 */
  badmintonThirdGame = 47004,
  /** 羽毛球第四局 */
  badmintonFourthGame = 47005,
  /** 羽毛球第五局 */
  badmintonFifthGame = 47006,

  /** 冰球实时全场 */
  iceHockeyRealTime = 2000,
  /** 冰球 全场 */
  iceHockeyFullTime = 2001,
  /** 冰球全场(包含加时和点球) */
  iceHockeyFullTimeInclOTAndPEN = 2002,
  /** 冰球第一节 */
  iceHockeyFirstPeriod = 2003,
  /** 冰球第二节 */
  iceHockeySecondPeriod = 2004,
  /** 冰球第三节 */
  iceHockeyThirdPeriod = 2005,
  /** 冰球加时 */
  iceHockeyOverTime = 2006,
  /** 冰球点球 */
  iceHockeyPenalty = 2007,

  /** 美式橄榄球全场 */
  americanFootballFullTime = 6001,
  /** 美式橄榄球常规时间 */
  americanFootballRegularTime = 6002,
  /** 美式橄榄球上半場 */
  americanFootballFirstHalf = 6003,
  /** 美式橄榄球下半場 */
  americanFootballSecondHalf = 6004,
  /** 美式橄榄球第一节 */
  americanFootballFirstQuarter = 6005,
  /** 美式橄榄球第二节 */
  americanFootballSecondQuarter = 6006,
  /** 美式橄榄球第三节 */
  americanFootballThirdQuarter = 6007,
  /** 美式橄榄球第四节 */
  americanFootballFourthQuarter = 6008,
  /** 美式橄榄球加时 */
  americanFootballOverTime = 6009,

  /** 斯洛克全场 */
  snookerFullTime = 16001,
  /** 斯洛克第1局 */
  snookerFrame1 = 16002,
  /** 斯洛克第2局 */
  snookerFrame2 = 16003,
  /** 斯洛克第3局 */
  snookerFrame3 = 16004,
  /** 斯洛克第4局 */
  snookerFrame4 = 16005,
  /** 斯洛克第5局 */
  snookerFrame5 = 16006,
  /** 斯洛克第6局 */
  snookerFrame6 = 16007,
  /** 斯洛克第7局 */
  snookerFrame7 = 16008,
  /** 斯洛克第8局 */
  snookerFrame8 = 16009,
  /** 斯洛克第9局 */
  snookerFrame9 = 16010,
  /** 斯洛克第10局 */
  snookerFrame10 = 16011,
  /** 斯洛克第11局 */
  snookerFrame11 = 16012,
  /** 斯洛克第12局 */
  snookerFrame12 = 16013,
  /** 斯洛克第13局 */
  snookerFrame13 = 16014,
  /** 斯洛克第14局 */
  snookerFrame14 = 16015,
  /** 斯洛克第15局 */
  snookerFrame15 = 16016,
  /** 斯洛克第16局 */
  snookerFrame16 = 16017,
  /** 斯洛克第17局 */
  snookerFrame17 = 16018,
  /** 斯洛克第18局 */
  snookerFrame18 = 16019,
  /** 斯洛克第19局 */
  snookerFrame19 = 16020,
  /** 斯洛克第20局 */
  snookerFrame20 = 16021,
  /** 斯洛克第21局 */
  snookerFrame21 = 16022,
  /** 斯洛克第22局 */
  snookerFrame22 = 16023,
  /** 斯洛克第23局 */
  snookerFrame23 = 16024,
  /** 斯洛克第24局 */
  snookerFrame24 = 16025,
  /** 斯洛克第25局 */
  snookerFrame25 = 16026,
  /** 斯洛克第26局 */
  snookerFrame26 = 16027,
  /** 斯洛克第27局 */
  snookerFrame27 = 16028,
  /** 斯洛克第28局 */
  snookerFrame28 = 16029,
  /** 斯洛克第29局 */
  snookerFrame29 = 16030,
  /** 斯洛克第30局 */
  snookerFrame30 = 16031,
  /** 斯洛克第31局 */
  snookerFrame31 = 16032,
  /** 斯洛克第32局 */
  snookerFrame32 = 16033,
  /** 斯洛克第33局 */
  snookerFrame33 = 16034,
  /** 斯洛克第34局 */
  snookerFrame34 = 16035,
  /** 斯洛克第35局 */
  snookerFrame35 = 16036,

  /** 沙滩排球全场 */
  beachVolleyballFullTime = 51001,
  /** 沙滩排球第一局 */
  beachVolleyballFirstSet = 51002,
  /** 沙滩排球第二局 */
  beachVolleyballSecondSet = 51003,
  /** 沙滩排球第三局 */
  beachVolleyballThirdSet = 51004,
  /** 沙滩排球第四局 */
  beachVolleyballFourthSet = 51005,
  /** 沙滩排球第五局 */
  beachVolleyballFifthSet = 51006,

  /** 手球实时 */
  handballRealTime = 8000,
  /** 手球全场 */
  handballFullTime = 8001,
  /** 手球全场包含加时和点球 */
  handballFullTimeInclOTAndPen = 8002,
  /** 手球上半场 */
  handballFirstHalf = 8003,
  /** 手球下半场 */
  handballSecondHalf = 8004,
  /** 手球加时 */
  handballOverTime = 8005,
  /** 手球点球 */
  handballPenalty = 8006,

  /** 橄榄球实时 */
  rugbyRealTime = 4000,
  /** 橄榄球实时 */
  rugbyFullTime = 4001,
  /** 橄榄球上半場 */
  rugbyFirstHalf = 4003,
  /** 橄榄球下半場 */
  rugbySecondHalf = 4004,
  /** 橄榄球加时 */
  rugbyOverTime = 4005,
  /** 橄榄球点球 */
  rugbyPenalty = 4009,

  /** 格斗全场 */
  mmaFullTime = 18001,

  /** F1赛车全场 */
  formula1FullTime = 92001,

  /** 板球全场 */
  cricketFullTime = 14001,
  /** 板球全场包含加时 */
  cricketFullTimeInclSuperOver = 14002,
  /** 板球主队第一局 */
  cricketHomeFirstInning = 14003,
  /** 板球客队第一局 */
  cricketAwayFirstInning = 14004,
  /** 板球主队第二局 */
  cricketHomeSecondInning = 14005,
  /** 板球客队第二局 */
  cricketAwaySecondInning = 14006,
  /** 板球主队加时 */
  cricketSuperOverHome = 14007,
  /** 板球客队加时 */
  cricketSuperOverAway = 14008,

  /** 飞镖实时 */
  dartsRealTime = 20000,
  /** 飞镖全场 */
  dartsFullTime = 20001,
  /** 飞镖第一盘 */
  dartsSet1 = 20002,
  /** 飞镖第二盘 */
  dartsSet2 = 20003,
  /** 飞镖第三盘 */
  dartsSet3 = 20004,
  /** 飞镖第四盘 */
  dartsSet4 = 20005,
  /** 飞镖第五盘 */
  dartsSet5 = 20006,
  /** 飞镖第六盘 */
  dartsSet6 = 20007,
  /** 飞镖第七盘 */
  dartsSet7 = 20008,
  /** 飞镖第八盘 */
  dartsSet8 = 20009,
  /** 飞镖第九盘 */
  dartsSet9 = 20010,
  /** 飞镖第十盘 */
  dartsSet10 = 20011,
  /** 飞镖第十一盘 */
  dartsSet11 = 20012,
  /** 飞镖第十二盘 */
  dartsSet12 = 20013,
  /** 飞镖第十三盘 */
  dartsSet13 = 20014,
  /** 飞镖第十四盘 */
  dartsSet14 = 20015,
  /** 飞镖第十五盘 */
  dartsSet15 = 20016,

  /** 五人制足球实时 */
  futsalRealTime = 17000,
  /** 五人制足球全场 */
  futsalFullTime = 17001,
  /** 五人制足球上半场 */
  futsalFirstHalf = 17002,
  /** 五人制足球下半场 */
  futsalSecondHalf = 17003,
  /** 五人制足球加时全场 */
  futsalETFullTime = 17004,
  /** 五人制足球点球 */
  futsalPenalty = 17007,

  /** 电子足球实时 */
  eSoccerRealTime = 177000,
  /** 电子足球全场 */
  eSoccerFullTime = 177001,
  /** 电子足球上半场 */
  eSoccerFirstHalf = 177002,
  /** 电子足球下半场 */
  eSoccerSecondHalf = 177003,
  /** 电子足球加时上半场 */
  eSoccerETFirstHalf = 177004,
  /** 电子足球加时下半场 */
  eSoccerETSecondHalf = 177005,
  /** 电子足球点球 */
  eSoccerPenalty = 177006,
  /** 电子足球加时全场 */
  eSoccerETFullTime = 177007,

  /** 电子篮球全场 */
  eBasketballFullTime = 178001,
  /** 电子篮球常规时间 */
  eBasketballRegularTime = 178002,
  /** 电子篮球上半场 */
  eBasketballFirstHalf = 178003,
  /** 电子篮球下半场 */
  eBasketballSecondHalf = 178004,
  /** 电子篮球第一节 */
  eBasketballFirstQuarter = 178005,
  /** 电子篮球第二节 */
  eBasketballSecondQuarter = 178006,
  /** 电子篮球第三节 */
  eBasketballThirdQuarter = 178007,
  /** 电子篮球第四节 */
  eBasketballFourthQuarter = 178008,
  /** 电子篮球加时 */
  eBasketballOverTime = 178009,

  /** 水球全场 */
  waterPoloFullTime = 24001,
  /** 水球半场 */
  waterPoloFirstHalf = 24002,

  /** 足球冠军阶段 */
  soccerOutrightPeriod = 1999,
  /** 篮球冠军阶段 */
  basketballOutrightPeriod = 3999,
  /** 网球冠军阶段 */
  tennisOutrightPeriod = 5999,
  /** 排球冠军阶段 */
  volleyballOutrightPeriod = 13999,
  /** 乒乓球冠军阶段 */
  tableTennisOutrightPeriod = 15999,
  /** 羽毛球冠军阶段 */
  badmintonOutrightPeriod = 47999,
  /** 冰球冠军阶段 */
  iceHockeyOutrightPeriod = 2999,
  /** 电子足球冠军阶段 */
  eSoccerOutrightPeriod = 177999,
  /** 电子篮球冠军阶段 */
  eBasketballOutrightPeriod = 178999,
  /** 手球冠军阶段 */
  handballOutrightPeriod = 8999,
  /** 斯诺克冠军阶段 */
  snookerOutrightPeriod = 16999,
  /** 棒球冠军阶段 */
  baseballOutrightPeriod = 7999,
  /** 美式橄榄球冠军阶段 */
  americanFootballOutrightPeriod = 6999,
  /** 无畏契约冠军阶段 */
  valorantOutrightPeriod = 169999,
  /** CS_GO冠军阶段 */
  csGoOutrightPeriod = 179999,
  /** 王者荣耀冠军阶段 */
  kogOutrightPeriod = 180999,
  /** 电竞DOTA冠军阶段 */
  dotaOutrightPeriod = 164999,
  /** 英雄联盟冠军阶段 */
  lolOutrightPeriod = 165999,
  /** 特殊投注冠军阶段 */
  specialsOutrightPeriod = 93999,
  /** 奥林匹克冠军阶段 */
  olympicOutrightPeriod = 100999,
  /** F1赛车冠军阶段 */
  formula1OutrightPeriod = 92999,
  /** 地板球冠军阶段 */
  floorBallOutrightPeriod = 10999,
  /** 板球冠军阶段 */
  cricketOutrightPeriod = 14999,
  /** 格斗冠军阶段 */
  mmaOutrightPeriod = 18999,
  /** 自行车冠军阶段 */
  cyclingOutrightPeriod = 25999,
  /** 沙滩排球冠军阶段 */
  beachVolleyballOutrightPeriod = 51999,
  /** 赛车冠军阶段 */
  stockCarRacingOutrightPeriod = 94999,
  /** 高尔夫冠军阶段 */
  golfOutrightPeriod = 12999,
  /** 五人制足球冠军阶段 */
  futsalOutrightPeriod = 17999,
  /** 拳击冠军阶段 */
  boxingOutrightPeriod = 19999,
  /** 飞镖冠军阶段 */
  dartOutrightPeriod = 20999,
  /** 草地滚球冠军阶段 */
  bowlsOutrightPeriod = 21999,
  /** 水球冠军阶段 */
  waterPoloOutrightPeriod = 24999,
  /** 橄榄球冠军阶段 */
  rugbyOutrightPeriod = 4999,
  /** 摩托车赛冠军阶段 */
  motorcycleRacingOutrightPeriod = 95999,
  /** 亚运会冠军阶段 */
  asianGameOutrightPeriod = 101999,

  /** 虚拟足球全场 */
  virtualSoccerFullTime = 1001001,
  /** 虚拟足球上半场 */
  virtualSoccerFirstHalf = 1001002,
  /** 虚拟足球加时上半场 */
  virtualSoccerExtraFirstHalf = 1001003,
  /** 虚拟足球加时全场 */
  virtualSoccerExtraFullTime = 1001004,
  /** 虚拟足球点球大战 */
  virtualSoccerPenalty = 1001005,
  /** 虚拟赛马默认阶段 */
  virtualHorseDefaultPeriod = 1020001,
  /** 虚拟赛狗默认阶段 */
  virtualGreyhoundsDefaultPeriod = 1021001,
  /** 虚拟沙地摩托车默认阶段 */
  virtualSpeedwayDefaultPeriod = 1022001,
  /** 虚拟摩托车默认阶段 */
  virtualMotorbikeDefaultPeriod = 1023001,
}

export const FullPes: number[] = [1001, 3001, 5001, 13001, 2001, 47001, 177001, 178001, 15001];

export const BasketballQuarter = {
  '3005': '一',
  '3006': '二',
  '3007': '三',
  '3008': '四',
};
