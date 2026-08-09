import { LotterySportId, PlayType, SportIdForView } from '@/apis/commonSports/constants';

import { CompetitionItem } from '../types';
import { EFbPeriod } from './period';
import { HotSportId } from '@/apis/commonSports/constants';

/**
 * FB 赛种 ID 枚举（字符串标识）
 */
export enum FBSportId {
  HotSports = 'hotSports',
  Football = 'football',
  Basketball = 'basketball',
  Volleyball = 'volleyball',
  BeachVolleyball = 'beachVolleyball',
  Snooker = 'snooker',
  Badminton = 'badminton',
  PingPong = 'pingPong',
  Puck = 'puck',
  Cricket = 'cricket',
  Olive = 'olive',
  Fight = 'fight',
  Boxing = 'boxing',
  Handball = 'handball',
  OlympicGames = 'olympicGames',
  Water = 'water',
  F1Car = 'f1Car',
  Special = 'special',
  Tennis = 'tennis',
  Baseball = 'baseball',
  USBaseball = 'uSFootball',
  Lottery = 'lottery',
}

/**
 * FB 赛种 ID 数值枚举
 */
export enum FBSportIdValue {
  HotSports = HotSportId, // 热门
  Football = 1, // 足球
  Basketball = 3, // 篮球
  Volleyball = 13, // 排球
  BeachVolleyball = 51, // 沙滩排球
  Snooker = 16, // 斯诺克台球
  Badminton = 47, // 羽毛球
  PingPong = 15, // 乒乓球
  Tennis = 5, // 网球
  Olive = 4, // 橄榄球
  Dart = 20, // 飞镖
  Golf = 12, // 高尔夫球
  Boxing = 19, // 拳击
  Water = 24, // 水球
  VRShadi = 1022, // 虚拟沙地摩托车
  Handball = 8, // 手球
  Cycling = 25, // 自行车
  OlympicGames = 100, // 奥林匹克
  Cricket = 14, // 板球
  Puck = 2, // 冰球
  Special = 93, // 特殊投注
  Baseball = 7, // 棒球
  USBaseball = 6, // 美国足球
  F1Car = 94, // 赛车
  Fight = 18, // 综合格斗
  Lottery = LotterySportId, // 竞彩
}

/**
 * FB 赛种 ID 映射（英语键名 -> 数值）
 */
export const FBSportIds: Record<string, number> = {
  Football: FBSportIdValue.Football, // 足球
  Basketball: FBSportIdValue.Basketball, // 篮球
  Volleyball: FBSportIdValue.Volleyball, // 排球
  BeachVolleyball: FBSportIdValue.BeachVolleyball, // 沙滩排球
  Snooker: FBSportIdValue.Snooker, // 斯诺克台球
  Badminton: FBSportIdValue.Badminton, // 羽毛球
  PingPong: FBSportIdValue.PingPong, // 乒乓球
  Tennis: FBSportIdValue.Tennis, // 网球
  Olive: FBSportIdValue.Olive, // 橄榄球
  Dart: FBSportIdValue.Dart, // 飞镖
  Golf: FBSportIdValue.Golf, // 高尔夫球
  Boxing: FBSportIdValue.Boxing, // 拳击
  Water: FBSportIdValue.Water, // 水球
  VRShadi: FBSportIdValue.VRShadi, // 虚拟沙地摩托车
  Handball: FBSportIdValue.Handball, // 手球
  Cycling: FBSportIdValue.Cycling, // 自行车
  OlympicGames: FBSportIdValue.OlympicGames, // 奥林匹克
  Puck: FBSportIdValue.Puck, // 冰球
  Special: FBSportIdValue.Special, // 特殊投注
  Baseball: FBSportIdValue.Baseball, // 棒球
  USBaseball: FBSportIdValue.USBaseball, // 美国足球
  F1Car: FBSportIdValue.F1Car, // 赛车
  Fight: FBSportIdValue.Fight, // 综合格斗
  Cricket: FBSportIdValue.Cricket, // 板球
  Billiards: FBSportIdValue.Snooker, // 台球（使用斯诺克的值）
  Lottery: FBSportIdValue.Lottery, // 竞彩
};

/**
 * FB 赛事 ID 和名称配置映射
 */
export const FBCompetitionMap: Record<FBSportId, CompetitionItem> = {
  [FBSportId.HotSports]: {
    label: '热门',
    id: FBSportIdValue.HotSports,
    viewId: HotSportId,
    list: [],
    simpleList: [
      { name: '让球', idList: [1000], period: EFbPeriod.soccerFullTime },
      { name: '大小', idList: [1007], period: EFbPeriod.soccerFullTime },
      { name: '独赢', idList: [1005], period: EFbPeriod.soccerFullTime, row: 3 },
      { name: '角球', idList: [1010], period: EFbPeriod.soccerFullTime },
    ],
  },
  [FBSportId.Football]: {
    label: '足球',
    id: FBSportIdValue.Football,
    viewId: SportIdForView.Football,
    list: [
      { name: '让球', idList: [1000], period: EFbPeriod.soccerFullTime },
      { name: '大小', idList: [1007], period: EFbPeriod.soccerFullTime },
      { name: '独赢', idList: [1005], period: EFbPeriod.soccerFullTime, row: 3 },
      { name: '角球', idList: [1010], period: EFbPeriod.soccerFullTime },
      { name: '半场让球', idList: [1000], period: EFbPeriod.soccerFirstHalf },
      { name: '半场大小', idList: [1007], period: EFbPeriod.soccerFirstHalf },
      { name: '半场独赢', idList: [1005], period: EFbPeriod.soccerFirstHalf, row: 3 },
      { name: '半场角球', idList: [1010], period: EFbPeriod.soccerFirstHalf },
      // { name: '让球-下半场', idList: [1000], period: EFbPeriod.soccerSecondHalf },
      // { name: '大小-下半场', idList: [1007], period: EFbPeriod.soccerSecondHalf },
      // { name: '独赢-下半场', idList: [1005], period: EFbPeriod.soccerSecondHalf, row: 3 },
      // { name: '角球-下半场', idList: [1010], period: EFbPeriod.soccerSecondHalf },
      // { name: 'first_half_moneyline', idList: [1005], period: 1002, row: 3 },
      // { name: '下半场独赢', idList: [1005], period: 1003, row: 3 },
      // { name: '角球独赢', idList: [1009], period: 1001, row: 3 },
      // { name: '全场角球', idList: [1011], period: 1001 },
      // { name: '上半场角球独赢', idList: [1009], period: 1002, row: 3 },
      // { name: '上半场角球让球', idList: [1011], period: 1002 },
      // { name: '上半场角球大小', idList: [1010], period: 1002 },
      // { name: '比分', idList: [1099], period: 1001 },
      // { name: '比分-上半场', idList: [1100], period: 1002 },
      // { name: '正确比分', idList: [1188], period: 1001 },
      // { name: '正确比分-上半场', idList: [1188], period: 1002 },
      // { name: '15分钟进球(开场-14:59)-独赢', idList: [1005], period: 1007, row: 3 },
      // { name: '15分钟进球(开场-14:59)-让球', idList: [1000], period: 1007 },
      // { name: '15分钟进球(开场-14:59)-大小', idList: [1007], period: 1007 },
      // { name: '15分钟进球(15:00-29:59)-独赢', idList: [1005], period: 1008, row: 3 },
      // { name: '15分钟进球(15:00-29:59)-让球', idList: [1000], period: 1008 },
      // { name: '15分钟进球(15:00-29:59)-大小', idList: [1007], period: 1008 },
      // {
      //   name: '15分钟进球(30:00-上半场结束)-独赢',
      //   idList: [1005],
      //   period: 1009,
      //   row: 3,
      // },
      // { name: '15分钟进球(30:00-上半场结束)-让球', idList: [1000], period: 1009 },
      // { name: '15分钟进球(30:00-上半场结束)-大小', idList: [1007], period: 1009 },
      // {
      //   name: '15分钟进球(下半场开始-59:59)-独赢',
      //   idList: [1005],
      //   period: 1010,
      //   row: 3,
      // },
    ],
    simpleList: [
      { name: '让球', idList: [1000], period: EFbPeriod.soccerFullTime },
      { name: '大小', idList: [1007], period: EFbPeriod.soccerFullTime },
      { name: '独赢', idList: [1005], period: EFbPeriod.soccerFullTime, row: 3 },
      { name: '角球', idList: [1010], period: EFbPeriod.soccerFullTime },
    ],
  },
  [FBSportId.Basketball]: {
    label: '篮球',
    id: FBSportIdValue.Basketball,
    viewId: SportIdForView.Basketball,
    list: [
      { name: '让球', idList: [3002], period: EFbPeriod.basketballFullTime },
      { name: '大小', idList: [3003], period: EFbPeriod.basketballFullTime },
      { name: '独赢', idList: [3004], period: EFbPeriod.basketballFullTime },
      // { name: 'full_match_point_handicap', idList: [3002], period: 3001 },
      // { name: 'total_points_ou', idList: [3003], period: 3001 },
      // { name: '主队全场得分', idList: [3012], period: 3001 },
      // { name: '客队全场得分', idList: [3013], period: 3001 },
      // { name: '全场独赢', idList: [3004], period: 3001 },
      // { name: '全场单双', idList: [3005], period: 3001 },
      // { name: '让分-上半场', idList: [3002], period: 3003 },
      // { name: '总分大小-上半场', idList: [3003], period: 3003 },
      // { name: '主队半场得分', idList: [3012], period: 3003 },
      // { name: '客队半场得分', idList: [3013], period: 3003 },
      // { name: '独赢（两项）-上半场', idList: [3020], period: 3003 },
      // { name: '半场单双', idList: [3005], period: 3003 },
      // { name: '让分-第一节', idList: [3002], period: 3005 },
      // { name: '总分大小-第一节', idList: [3003], period: 3005 },
      // { name: '第一节主队得分', idList: [3012], period: 3005 },
      // { name: '第一节客队得分', idList: [3013], period: 3005 },
      // { name: '第一节独赢', idList: [3020], period: 3005 },
      // { name: '第一节单双', idList: [3005], period: 3005 },
      // { name: '让分-第二节', idList: [3002], period: 3006 },
      // { name: '总分大小-第二节', idList: [3003], period: 3006 },
      // { name: '第二节主队得分', idList: [3012], period: 3006 },
      // { name: '第二节客队得分', idList: [3013], period: 3006 },
      // { name: '第二节独赢', idList: [3020], period: 3006 },
      // { name: '第二节单双', idList: [3005], period: 3006 },
      // { name: '让分-第三节', idList: [3002], period: 3007 },
      // { name: '总分大小-第三节', idList: [3003], period: 3007 },
      // { name: '第三节主队得分', idList: [3012], period: 3007 },
      // { name: '第三节客队得分', idList: [3013], period: 3007 },
      // { name: '第三节独赢', idList: [3020], period: 3007 },
      // { name: '第三节单双', idList: [3005], period: 3007 },
      // { name: '让分-第四节', idList: [3002], period: 3008 },
      // { name: '总分大小-第四节', idList: [3003], period: 3008 },
      // { name: '第四节主队得分', idList: [3012], period: 3008 },
      // { name: '第四节客队得分', idList: [3013], period: 3008 },
      // { name: '第四节独赢', idList: [3020], period: 3008 },
      // { name: '第四节单双', idList: [3005], period: 3008 },
    ],
    simpleList: [
      { name: '让球', idList: [3002], period: EFbPeriod.basketballFullTime },
      { name: '大小', idList: [3003], period: EFbPeriod.basketballFullTime },
      { name: '独赢', idList: [3004], period: EFbPeriod.basketballFullTime },
    ],
  },
  [FBSportId.Lottery]: {
    label: '竞彩',
    id: FBSportIdValue.Lottery,
    viewId: SportIdForView.Lottery,
    list: [{ name: '独赢', idList: [] }],
    simpleList: [
      { name: '让球', idList: [1000], period: EFbPeriod.soccerFullTime },
      { name: '大小', idList: [1007], period: EFbPeriod.soccerFullTime },
      { name: '独赢', idList: [1005], period: EFbPeriod.soccerFullTime, row: 3 },
      { name: '角球', idList: [1010], period: EFbPeriod.soccerFullTime },
    ],
  },
  [FBSportId.Tennis]: {
    label: '网球',
    id: FBSportIdValue.Tennis,
    viewId: SportIdForView.Tennis,
    list: [
      { name: '独赢', idList: [5001] },
      { name: '让盘', idList: [5004] },
      { name: '局大小', idList: [5003] },
      { name: '让局', idList: [5002] },
    ],
    simpleList: [
      { name: '独赢', idList: [5001] },
      { name: '让盘', idList: [5004] },
    ],
  },
  [FBSportId.Volleyball]: {
    label: '排球',
    id: FBSportIdValue.Volleyball,
    viewId: SportIdForView.Volleyball,
    list: [
      { name: '独赢', idList: [13001] },
      // { name: '大小', idList: [13003] },
      { name: '让分', idList: [13002] },
    ],
    simpleList: [
      { name: '独赢', idList: [13001] },
      { name: '让分', idList: [13002] },
    ],
  },
  [FBSportId.BeachVolleyball]: {
    label: '沙滩排球',
    id: FBSportIdValue.BeachVolleyball,
    viewId: SportIdForView.BeachVolleyball,
    list: [
      { name: '独赢', idList: [51001] },
      { name: '大小', idList: [51003] },
      { name: '让分', idList: [51002] },
    ],
    simpleList: [
      { name: '独赢', idList: [51001] },
      { name: '大小', idList: [51003] },
      { name: '让分', idList: [51002] },
    ],
  },
  [FBSportId.USBaseball]: {
    label: '美式足球',
    id: FBSportIdValue.USBaseball,
    viewId: SportIdForView.USBaseball,
    list: [
      { name: '大小', idList: [6002] },
      { name: '让球', idList: [6001] },
      { name: '独赢', idList: [6003], row: 3 },
    ],
    simpleList: [
      { name: '大小', idList: [6002] },
      { name: '让球', idList: [6001] },
      { name: '独赢', idList: [6003], row: 3 },
    ],
  },

  [FBSportId.Snooker]: {
    label: '斯诺克',
    id: FBSportIdValue.Snooker,
    viewId: SportIdForView.Snooker,
    list: [
      { name: '独赢', idList: [16003] },
      { name: '让盘', idList: [16001] },
    ],
    simpleList: [
      { name: '独赢', idList: [16003] },
      { name: '让盘', idList: [16001] },
    ],
  },
  [FBSportId.PingPong]: {
    label: '乒乓球',
    id: FBSportIdValue.PingPong,
    viewId: SportIdForView.PingPong,
    list: [
      { name: '独赢', idList: [15001] },
      { name: '大小', idList: [15003] },
      { name: '让分', idList: [15002] },
    ],
    simpleList: [
      { name: '独赢', idList: [15001] },
      { name: '大小', idList: [15003] },
      { name: '让分', idList: [15002] },
    ],
  },
  [FBSportId.Puck]: {
    label: '冰球',
    id: FBSportIdValue.Puck,
    viewId: SportIdForView.Puck,
    list: [
      { name: '独赢', idList: [2003], row: 3 },
      { name: '大小', idList: [2002] },
      { name: '让球', idList: [2001] },
    ],
    simpleList: [
      { name: '独赢', idList: [2003], row: 3 },
      { name: '大小', idList: [2002] },
      { name: '让球', idList: [2001] },
    ],
  },
  [FBSportId.Olive]: {
    label: '橄榄球',
    id: FBSportIdValue.Olive,
    viewId: SportIdForView.Olive,
    list: [
      { name: '独赢', idList: [4003], row: 3 },
      { name: '让球', idList: [4001] },
    ],
    simpleList: [
      { name: '独赢', idList: [4003], row: 3 },
      { name: '让球', idList: [4001] },
    ],
  },
  [FBSportId.Baseball]: {
    label: '棒球',
    id: 7,
    viewId: SportIdForView.Baseball,
    list: [
      { name: '独赢', idList: [7003] },
      { name: '大小', idList: [7002] },
      { name: '让垒', idList: [7001] },
    ],
    simpleList: [
      { name: '独赢', idList: [7003] },
      { name: '大小', idList: [7002] },
      { name: '让垒', idList: [7001] },
    ],
  },
  [FBSportId.Handball]: {
    label: '手球',
    id: FBSportIdValue.Handball,
    viewId: SportIdForView.Handball,
    list: [
      { name: '独赢', idList: [8005], row: 3 },
      { name: '让球', idList: [8001] },
    ],
    simpleList: [
      { name: '独赢', idList: [8005], row: 3 },
      { name: '让球', idList: [8001] },
    ],
  },
  [FBSportId.Cricket]: {
    label: '板球',
    id: FBSportIdValue.Cricket,
    viewId: SportIdForView.Cricket,
    list: [
      { name: '独赢', idList: [14002] },
      { name: '大小', idList: [14003] },
      { name: '单双', idList: [14006] },
    ],
    simpleList: [
      { name: '独赢', idList: [14002] },
      { name: '大小', idList: [14003] },
      { name: '单双', idList: [14006] },
    ],
  },
  [FBSportId.Fight]: {
    label: '综合格斗',
    id: FBSportIdValue.Fight,
    viewId: SportIdForView.Fight,
    list: [
      { name: '独赢', idList: [18002] },
      { name: '大小', idList: [18001] },
    ],
    simpleList: [
      { name: '独赢', idList: [18002] },
      { name: '大小', idList: [18001] },
    ],
  },
  [FBSportId.Boxing]: {
    label: '拳击',
    id: FBSportIdValue.Boxing,
    viewId: SportIdForView.Boxing,
    list: [
      { name: '独赢', idList: [19002] },
      { name: '大小', idList: [19001] },
    ],
    simpleList: [
      { name: '独赢', idList: [19002] },
      { name: '大小', idList: [19001] },
    ],
  },
  [FBSportId.Badminton]: {
    label: '羽毛球',
    id: FBSportIdValue.Badminton,
    viewId: SportIdForView.Badminton,
    list: [
      { name: '独赢', idList: [47001] },
      { name: '让分', idList: [47002] },
      { name: '大小', idList: [47003] },
    ],
    simpleList: [
      { name: '独赢', idList: [47001] },
      { name: '让分', idList: [47002] },
      { name: '大小', idList: [47003] },
    ],
  },

  [FBSportId.Water]: {
    label: '水球',
    id: FBSportIdValue.Water,
    viewId: SportIdForView.Water,
    list: [
      { name: '独赢', idList: [24002], row: 3 },
      { name: '大小', idList: [24001] },
    ],
    simpleList: [
      { name: '独赢', idList: [24002], row: 3 },
      { name: '大小', idList: [24001] },
    ],
  },
  [FBSportId.F1Car]: {
    label: 'F1赛车',
    id: 92,
    viewId: SportIdForView.F1Car,
    list: [{ name: '独赢', idList: [92001] }],
    simpleList: [{ name: '独赢', idList: [92001] }],
  },
  // // 高尔夫球
  // static CompetitionItem golf = const CompetitionItem(
  //   label: '高尔夫球',
  //   id: 28,
  //   list: <LocalHandicapItem>[],
  // );

  // / 其他
  // static CompetitionItem other = const CompetitionItem(
  //   label: '其他',
  //   id: 40,
  //   list: <LocalHandicapItem>[],
  // );

  // // 特殊投注
  // static CompetitionItem special = const CompetitionItem(
  //   label: '特殊投注',
  //   id: 18,
  //   list: <LocalHandicapItem>[],
  // );
  [FBSportId.Special]: {
    label: '特殊投注',
    id: FBSportIdValue.Special,
    viewId: SportIdForView.Special,
    list: [{ name: '独赢', idList: [] }],
    simpleList: [{ name: '独赢', idList: [] }],
  },

  [FBSportId.OlympicGames]: {
    label: '奥运会',
    id: FBSportIdValue.OlympicGames,
    viewId: SportIdForView.OlympicGames,
    list: [
      { name: '大小', idList: [] },
      { name: '让球', idList: [] },
      { name: '独赢', idList: [] },
    ],
    simpleList: [
      { name: '大小', idList: [] },
      { name: '让球', idList: [] },
      { name: '独赢', idList: [] },
    ],
  },
} as const;

/**
 * FB 赛事列表
 */
export const fbList: CompetitionItem[] = [
  FBCompetitionMap[FBSportId.Football],
  FBCompetitionMap[FBSportId.Basketball],
  FBCompetitionMap[FBSportId.Tennis],
  FBCompetitionMap[FBSportId.Volleyball],
  FBCompetitionMap[FBSportId.BeachVolleyball],
  FBCompetitionMap[FBSportId.USBaseball],
  FBCompetitionMap[FBSportId.Snooker],
  FBCompetitionMap[FBSportId.PingPong],
  FBCompetitionMap[FBSportId.Puck],
  FBCompetitionMap[FBSportId.Olive],
  FBCompetitionMap[FBSportId.Baseball],
  FBCompetitionMap[FBSportId.Handball],
  FBCompetitionMap[FBSportId.Cricket],
  FBCompetitionMap[FBSportId.Fight],
  FBCompetitionMap[FBSportId.Boxing],
  FBCompetitionMap[FBSportId.Badminton],
  FBCompetitionMap[FBSportId.OlympicGames],
  FBCompetitionMap[FBSportId.Water],
  FBCompetitionMap[FBSportId.F1Car],
  FBCompetitionMap[FBSportId.Special],
];

//运动分类
export enum SportTypes {
  BALL = 1,
  E_SPORT = 2,
}

//赛事分组类型
export enum MatchPlayType {
  ALL = 0, //全部
  LIVE = 1, //滚球
  PARLAY = 2,
  TODAY = 3, //今日
  EARLY = 4, //早盘
  CSL = 5, //竞彩
  TODAY_LIVE = 6, //今日+滚球
  OUTRIGHT = 7, //冠军赛事
  NON_OUTRIGHT = 8, //非冠军赛事
  TODAY_EARLY = 9, //今日+早盘
}

/**
 * MatchPlayType 到 PlayType 的映射
 */
export const matchPlayTypeToPlayTypeMap: Record<MatchPlayType, PlayType | null> = {
  [MatchPlayType.ALL]: null, // 全部不映射
  [MatchPlayType.LIVE]: PlayType.Living, // 滚球
  [MatchPlayType.PARLAY]: null, // 串关不映射
  [MatchPlayType.TODAY]: PlayType.Today, // 今日
  [MatchPlayType.EARLY]: PlayType.Early, // 早盘
  [MatchPlayType.CSL]: null, // 竞彩不映射
  [MatchPlayType.TODAY_LIVE]: null, // 今日+滚球不映射
  [MatchPlayType.OUTRIGHT]: PlayType.Champion, // 冠军赛事
  [MatchPlayType.NON_OUTRIGHT]: null, // 非冠军赛事不映射
  [MatchPlayType.TODAY_EARLY]: null, // 今日+早盘不映射
};
