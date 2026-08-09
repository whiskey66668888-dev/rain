/** 赛制类型 match_format，由文档表格生成 */
export enum EFbMatchFormat {
  /** 足球 2x45 */
  soccer2x45 = 100001,
  /** 足球 2x40 */
  soccer2x40 = 100002,
  /** 足球 2x35 */
  soccer2x35 = 100004,
  /** 足球 2x30 */
  soccer2x30 = 100005,
  /** 足球 2x25 */
  soccer2x25 = 100006,

  /** 篮球 4x12 */
  basketball4x12 = 300001,
  /** 篮球 4x10 */
  basketball4x10 = 300002,
  /** 篮球 2x20 */
  basketball2x20 = 300003,
  /** 篮球 1x10 */
  basketball1x10 = 300004,
  /** 篮球 2x10 */
  basketball2x10 = 300005,
  /** 篮球 1x12 */
  basketball1x12 = 300006,

  /** 乒乓球 BO5 */
  tableTennisBO5 = 1500001,
  /** 乒乓球 BO7 */
  tableTennisBO7 = 1500002,
  /** 乒乓球 BO4 */
  tableTennisBO4 = 1500003,

  /** 网球 BO3 */
  tennisBO3 = 500001,
  /** 网球 BO5 */
  tennisBO5 = 500002,

  /** 羽毛球 BO3 */
  badmintonBO3 = 4700001,
  /** 羽毛球 BO5 */
  badmintonBO5 = 4700002,

  /** 排球 BO5 */
  volleyballBO5 = 1300001,
  /** 排球 BO7 */
  volleyballBO7 = 1300002,
  /** 排球 BO3 */
  volleyballBO3 = 1300003,

  /** 冰球 3x20 */
  iceHockey3x20 = 200001,

  /** 电子足球 2x4 */
  eSoccer2x4 = 17700001,
  /** 电子足球 2x6 */
  eSoccer2x6 = 17700002,
  /** 电子足球 2x9 */
  eSoccer2x9 = 17700003,
  /** 电子足球 2x5 */
  eSoccer2x5 = 17700004,
  /** 电子足球 2x3 */
  eSoccer2x3 = 17700005,
  /** 电子足球 2x45 */
  eSoccer2x45 = 17700006,
  /** 电子足球 2x15 */
  eSoccer2x15 = 17700007,

  /** 电子篮球 4x6 */
  eBasketball4x6 = 17800001,
  /** 电子篮球 4x5 */
  eBasketball4x5 = 17800002,
  /** 电子篮球 4x4 */
  eBasketball4x4 = 17800003,

  /** 美式橄榄球 4x15 */
  americanFootball4x15 = 600001,

  /** 斯诺克 BO1 */
  snookerBO1 = 1600018,
  /** 斯诺克 BO4 */
  snookerBO4 = 1600010,
  /** 斯诺克 BO5 */
  snookerBO5 = 1600001,
  /** 斯诺克 BO7 */
  snookerBO7 = 1600002,
  /** 斯诺克 BO9 */
  snookerBO9 = 1600003,
  /** 斯诺克 BO11 */
  snookerBO11 = 1600004,
  /** 斯诺克 BO13 */
  snookerBO13 = 1600011,
  /** 斯诺克 BO15 */
  snookerBO15 = 1600012,
  /** 斯诺克 BO17 */
  snookerBO17 = 1600005,
  /** 斯诺克 BO19 */
  snookerBO19 = 1600006,
  /** 斯诺克 BO21 */
  snookerBO21 = 1600013,
  /** 斯诺克 BO23 */
  snookerBO23 = 1600014,
  /** 斯诺克 BO25 */
  snookerBO25 = 1600007,
  /** 斯诺克 BO27 */
  snookerBO27 = 1600015,
  /** 斯诺克 BO29 */
  snookerBO29 = 1600016,
  /** 斯诺克 BO31 */
  snookerBO31 = 1600017,
  /** 斯诺克 BO33 */
  snookerBO33 = 1600008,
  /** 斯诺克 BO35 */
  snookerBO35 = 1600009,

  /** 棒球 BO9 */
  baseballBO9 = 700001,
  /** 棒球 BO7 */
  baseballBO7 = 700002,

  /** 拳击第四轮 */
  boxing4Rounds = 1900001,
  /** 拳击第五轮 */
  boxing5Rounds = 1900002,
  /** 拳击第六轮 */
  boxing6Rounds = 1900003,
  /** 拳击第八轮 */
  boxing8Rounds = 1900004,
  /** 拳击第十轮 */
  boxing10Rounds = 1900005,
  /** 拳击第十二轮 */
  boxing12Rounds = 1900006,

  /** 手球2x30 */
  handball2x30 = 800001,
  /** 手球2x25 */
  handball2x25 = 800002,
  /** 手球2x20 */
  handball2x20 = 800003,

  /** 沙滩排球 BO3 */
  beachVolleyballBO3 = 5100001,
  /** 沙滩排球BO5 */
  beachVolleyballBO5 = 5100002,

  /** 格斗3 Rounds BO3 */
  mma3Rounds = 1800001,
  /** 格斗5 Rounds */
  mma5Rounds = 1800002,

  /** 橄榄球2X40 */
  rugby2x40 = 400001,
  /** 橄榄球2X10 */
  rugby2x10 = 400002,
  /** 橄榄球2X7 */
  rugby2x7 = 400003,

  /** 水球 4x8 */
  waterPolo4x8 = 2400001,

  /** 虚拟体育足球赛制 */
  virtualSoccer = 100100001,
  /** 虚拟体育赛马赛制 */
  virtualHorse = 102000001,
  /** 虚拟体育赛狗赛制 */
  virtualGreyhounds = 102100001,
  /** 虚拟沙地摩托车赛制 */
  virtualSpeedway = 102200001,
  /** 虚拟摩托车赛制 */
  virtualMotorbike = 102300001,

  /** F1赛车300km */
  formula1_300km = 9200001,

  /** 板球T10 */
  cricketT10 = 1400001,
  /** 板球T20 */
  cricketT20 = 1400002,
  /** 板球ODI */
  cricketODI = 1400003,
  /** 板球Test */
  cricketTest = 1400004,

  /** 飞镖 Set BO3 */
  dartsSetBO3 = 2000002,
  /** 飞镖 Set BO5 */
  dartsSetBO5 = 2000003,
  /** 飞镖 Set BO7 */
  dartsSetBO7 = 2000004,
  /** 飞镖 Set BO9 */
  dartsSetBO9 = 2000005,
  /** 飞镖 Set BO11 */
  dartsSetBO11 = 2000006,
  /** 飞镖 Set BO13 */
  dartsSetBO13 = 2000007,
  /** 飞镖 Set BO15 */
  dartsSetBO15 = 2000008,

  /** 飞镖 Leg BO5 */
  dartsLegBO5 = 2000100,
  /** 飞镖 Leg BO7 */
  dartsLegBO7 = 2000101,
  /** 飞镖 Leg BO9 */
  dartsLegBO9 = 2000102,
  /** 飞镖 Leg BO11 */
  dartsLegBO11 = 2000103,
  /** 飞镖 Leg BO12 */
  dartsLegBO12 = 2000104,
  /** 飞镖 Leg BO13 */
  dartsLegBO13 = 2000105,
  /** 飞镖 Leg BO15 */
  dartsLegBO15 = 2000106,
  /** 飞镖 Leg BO17 */
  dartsLegBO17 = 2000107,
  /** 飞镖 Leg BO19 */
  dartsLegBO19 = 2000108,
  /** 飞镖 Leg BO21 */
  dartsLegBO21 = 2000109,
  /** 飞镖 Leg BO31 */
  dartsLegBO31 = 2000110,
  /** 飞镖 Leg BO33 */
  dartsLegBO33 = 2000111,
  /** 飞镖 Leg BO35 */
  dartsLegBO35 = 2000112,

  /** 五人制足球 2x20 */
  futsal2x20 = 1700001,
  /** 五人制足球 2x25 */
  futsal2x25 = 1700002,

  /** 中式台球 BO1 */
  poolBO1 = 7800001,
  /** 中式台球 BO2 */
  poolBO2 = 7800002,
  /** 中式台球 BO3 */
  poolBO3 = 7800003,
  /** 中式台球 BO4 */
  poolBO4 = 7800004,
  /** 中式台球 BO5 */
  poolBO5 = 7800005,
  /** 中式台球 BO6 */
  poolBO6 = 7800006,
  /** 中式台球 BO7 */
  poolBO7 = 7800007,
  /** 中式台球 BO8 */
  poolBO8 = 7800008,
  /** 中式台球 BO9 */
  poolBO9 = 7800009,
  /** 中式台球 BO10 */
  poolBO10 = 7800010,
  /** 中式台球 BO11 */
  poolBO11 = 7800011,
  /** 中式台球 BO12 */
  poolBO12 = 7800012,
  /** 中式台球 BO13 */
  poolBO13 = 7800013,
  /** 中式台球 BO14 */
  poolBO14 = 7800014,
  /** 中式台球 BO15 */
  poolBO15 = 7800015,
  /** 中式台球 BO16 */
  poolBO16 = 7800016,
  /** 中式台球 BO17 */
  poolBO17 = 7800017,
  /** 中式台球 BO18 */
  poolBO18 = 7800018,
  /** 中式台球 BO19 */
  poolBO19 = 7800019,
  /** 中式台球 BO20 */
  poolBO20 = 7800020,
  /** 中式台球 BO21 */
  poolBO21 = 7800021,
  /** 中式台球 BO22 */
  poolBO22 = 7800022,
  /** 中式台球 BO23 */
  poolBO23 = 7800023,
  /** 中式台球 BO24 */
  poolBO24 = 7800024,
  /** 中式台球 BO25 */
  poolBO25 = 7800025,
  /** 中式台球 BO26 */
  poolBO26 = 7800026,
  /** 中式台球 BO27 */
  poolBO27 = 7800027,
  /** 中式台球 BO28 */
  poolBO28 = 7800028,
  /** 中式台球 BO29 */
  poolBO29 = 7800029,
  /** 中式台球 BO30 */
  poolBO30 = 7800030,
  /** 中式台球 BO31 */
  poolBO31 = 7800031,
  /** 中式台球 BO32 */
  poolBO32 = 7800032,
  /** 中式台球 BO33 */
  poolBO33 = 7800033,
  /** 中式台球 BO34 */
  poolBO34 = 7800034,
  /** 中式台球 BO35 */
  poolBO35 = 7800035,
  /** 中式台球 BO36 */
  poolBO36 = 7800036,
  /** 中式台球 BO37 */
  poolBO37 = 7800037,
  /** 中式台球 BO38 */
  poolBO38 = 7800038,
  /** 中式台球 BO39 */
  poolBO39 = 7800039,
  /** 中式台球 BO40 */
  poolBO40 = 7800040,
  /** 中式台球 BO41 */
  poolBO41 = 7800041,
  /** 中式台球 BO42 */
  poolBO42 = 7800042,
  /** 中式台球 BO43 */
  poolBO43 = 7800043,
  /** 中式台球 BO44 */
  poolBO44 = 7800044,
  /** 中式台球 BO45 */
  poolBO45 = 7800045,
  /** 中式台球 BO46 */
  poolBO46 = 7800046,
  /** 中式台球 BO47 */
  poolBO47 = 7800047,
  /** 中式台球 BO48 */
  poolBO48 = 7800048,
  /** 中式台球 BO49 */
  poolBO49 = 7800049,
  /** 中式台球 BO50 */
  poolBO50 = 7800050,
  /** 中式台球 BO51 */
  poolBO51 = 7800051,
  /** 中式台球 BO52 */
  poolBO52 = 7800052,
  /** 中式台球 BO53 */
  poolBO53 = 7800053,
  /** 中式台球 BO54 */
  poolBO54 = 7800054,
  /** 中式台球 BO55 */
  poolBO55 = 7800055,
  /** 中式台球 BO56 */
  poolBO56 = 7800056,
  /** 中式台球 BO57 */
  poolBO57 = 7800057,
  /** 中式台球 BO58 */
  poolBO58 = 7800058,
  /** 中式台球 BO59 */
  poolBO59 = 7800059,
  /** 中式台球 BO60 */
  poolBO60 = 7800060,
  /** 中式台球 BO61 */
  poolBO61 = 7800061,
  /** 中式台球 BO62 */
  poolBO62 = 7800062,
  /** 中式台球 BO63 */
  poolBO63 = 7800063,
  /** 中式台球 BO64 */
  poolBO64 = 7800064,
  /** 中式台球 BO65 */
  poolBO65 = 7800065,
  /** 中式台球 BO66 */
  poolBO66 = 7800066,
  /** 中式台球 BO67 */
  poolBO67 = 7800067,
  /** 中式台球 BO68 */
  poolBO68 = 7800068,
  /** 中式台球 BO69 */
  poolBO69 = 7800069,
  /** 中式台球 BO70 */
  poolBO70 = 7800070,
  /** 中式台球 BO71 */
  poolBO71 = 7800071,
  /** 中式台球 BO72 */
  poolBO72 = 7800072,
  /** 中式台球 BO73 */
  poolBO73 = 7800073,
  /** 中式台球 BO74 */
  poolBO74 = 7800074,
  /** 中式台球 BO75 */
  poolBO75 = 7800075,
  /** 中式台球 BO76 */
  poolBO76 = 7800076,
  /** 中式台球 BO77 */
  poolBO77 = 7800077,
  /** 中式台球 BO78 */
  poolBO78 = 7800078,
  /** 中式台球 BO79 */
  poolBO79 = 7800079,
  /** 中式台球 BO80 */
  poolBO80 = 7800080,
  /** 中式台球 BO81 */
  poolBO81 = 7800081,
  /** 中式台球 BO82 */
  poolBO82 = 7800082,
  /** 中式台球 BO83 */
  poolBO83 = 7800083,
  /** 中式台球 BO84 */
  poolBO84 = 7800084,
  /** 中式台球 BO85 */
  poolBO85 = 7800085,
  /** 中式台球 BO86 */
  poolBO86 = 7800086,
  /** 中式台球 BO87 */
  poolBO87 = 7800087,
  /** 中式台球 BO88 */
  poolBO88 = 7800088,
  /** 中式台球 BO89 */
  poolBO89 = 7800089,
  /** 中式台球 BO90 */
  poolBO90 = 7800090,
  /** 中式台球 BO91 */
  poolBO91 = 7800091,
  /** 中式台球 BO92 */
  poolBO92 = 7800092,
  /** 中式台球 BO93 */
  poolBO93 = 7800093,
  /** 中式台球 BO94 */
  poolBO94 = 7800094,
  /** 中式台球 BO95 */
  poolBO95 = 7800095,
  /** 中式台球 BO96 */
  poolBO96 = 7800096,
  /** 中式台球 BO97 */
  poolBO97 = 7800097,
  /** 中式台球 BO98 */
  poolBO98 = 7800098,
  /** 中式台球 BO99 */
  poolBO99 = 7800099,
  /** 中式台球 BO100 */
  poolBO100 = 7800100,

  /** DOTA2 BO1 */
  dota2BO1 = 16400001,
  /** DOTA2 BO2 */
  dota2BO2 = 16400002,
  /** DOTA2 BO3 */
  dota2BO3 = 16400003,
  /** DOTA2 BO5 */
  dota2BO5 = 16400004,
  /** DOTA2 BO7 */
  dota2BO7 = 16400005,

  /** LOL BO1 */
  lolBO1 = 16500001,
  /** LOL BO2 */
  lolBO2 = 16500002,
  /** LOL BO3 */
  lolBO3 = 16500003,
  /** LOL BO5 */
  lolBO5 = 16500004,
  /** LOL BO7 */
  lolBO7 = 16500005,

  /** Counter-Strike 2 BO1 */
  counterStrike2BO1 = 17900001,
  /** Counter-Strike 2 BO2 */
  counterStrike2BO2 = 17900002,
  /** Counter-Strike 2 BO3 */
  counterStrike2BO3 = 17900003,
  /** Counter-Strike 2 BO5 */
  counterStrike2BO5 = 17900004,
  /** Counter-Strike 2 BO7 */
  counterStrike2BO7 = 17900005,

  /** King of Glory BO1 */
  kingOfGloryBO1 = 18000001,
  /** King of Glory BO2 */
  kingOfGloryBO2 = 18000002,
  /** King of Glory BO3 */
  kingOfGloryBO3 = 18000003,
  /** King of Glory BO5 */
  kingOfGloryBO5 = 18000004,
  /** King of Glory BO7 */
  kingOfGloryBO7 = 18000005,
  /** King of Glory BO9 */
  kingOfGloryBO9 = 18000006,

  /** Valorant BO1 */
  valorantBO1 = 16900001,
  /** Valorant BO2 */
  valorantBO2 = 16900002,
  /** Valorant BO3 */
  valorantBO3 = 16900003,
  /** Valorant BO5 */
  valorantBO5 = 16900004,
  /** Valorant BO7 */
  valorantBO7 = 16900005,
}
