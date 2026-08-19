import { PlayType, PlayTypeId, SportIdForView } from '@/apis/commonSports/constants';

import { CompetitionItem } from '../types';

/** OB 赛种 ID 枚举（字符串标识） */
export enum OBSportId {
  Football = 'football',
  Basketball = 'basketball',
  Tennis = 'tennis',
  Snooker = 'snooker',
  Badminton = 'badminton',
  PingPong = 'pingPong',
  Baseball = 'baseball',
  Volleyball = 'volleyball',
  Puck = 'puck',
  Handball = 'handball',
  Boxing = 'boxing',
  USBaseball = 'uSFootball',
  Golf = 'golf',
  Cricket = 'cricket',
  Olive = 'olive',
  F1Car = 'racing',
  Water = 'water',
  Dart = 'darts',
  Special = 'special',
  Other = 'other',
}

/** OB 赛种 ID 数值 */
export enum OBSportIdValue {
  Football = 1,
  Basketball = 2,
  Tennis = 5,
  Snooker = 7,
  Badminton = 10,
  PingPong = 8,
  Baseball = 3,
  Volleyball = 9,
  Puck = 4,
  Handball = 11,
  Boxing = 12,
  USBaseball = 6,
  Golf = 28,
  Cricket = 37,
  Other = 40,
  Special = 18,
  F1Car = 33,
  Dart = 38,
  Water = 16,
  Olive = 14,
}

/** OB 赛种配置（对齐 Flutter OBCompetitionMap） */
export const OBCompetitionMap: Record<OBSportId, CompetitionItem> = {
  [OBSportId.Football]: {
    label: '足球',
    id: OBSportIdValue.Football,
    viewId: SportIdForView.Football,
    list: [
      { name: '让球', idList: ['4'] },
      { name: '大小', idList: ['2'] },
      { name: '独赢', idList: ['1'], row: 3 },
      { name: '角球', idList: ['114'] },
      { name: '半场让球', idList: ['19'] },
      { name: '半场大小', idList: ['18'] },
      { name: '半场独赢', idList: ['17'], row: 3 },
      { name: '半场角球', idList: ['122'] },
    ],
    simpleList: [
      { name: '让球', idList: ['4'] },
      { name: '大小', idList: ['2'] },
      { name: '独赢', idList: ['1'], row: 3 },
      { name: '角球', idList: ['114'] },
    ],
  },
  [OBSportId.Basketball]: {
    label: '篮球',
    id: OBSportIdValue.Basketball,
    viewId: SportIdForView.Basketball,
    list: [
      { name: '大小', idList: ['38'] },
      { name: '让球', idList: ['39'] },
      { name: '独赢', idList: ['37'] },
    ],
    simpleList: [
      { name: '大小', idList: ['38'] },
      { name: '让球', idList: ['39'] },
      { name: '独赢', idList: ['37'] },
    ],
  },
  [OBSportId.Tennis]: {
    label: '网球',
    id: OBSportIdValue.Tennis,
    viewId: SportIdForView.Tennis,
    list: [
      { name: '独赢', idList: ['153'] },
      { name: '让盘', idList: ['154'] },
      { name: '让局', idList: ['TNS_GAME_HDP'] },
      { name: '局大小', idList: ['TNS_GAME_OU'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['153'] },
      { name: '让盘', idList: ['154'] },
    ],
  },
  [OBSportId.Snooker]: {
    label: '斯诺克',
    id: OBSportIdValue.Snooker,
    viewId: SportIdForView.Snooker,
    list: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['154'] },
      { name: '让球', idList: ['155'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['154'] },
      { name: '让球', idList: ['155'] },
    ],
  },
  [OBSportId.Badminton]: {
    label: '羽毛球',
    id: OBSportIdValue.Badminton,
    viewId: SportIdForView.Badminton,
    list: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['173'] },
      { name: '让分', idList: ['172'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['173'] },
      { name: '让分', idList: ['172'] },
    ],
  },
  [OBSportId.PingPong]: {
    label: '乒乓球',
    id: OBSportIdValue.PingPong,
    viewId: SportIdForView.PingPong,
    list: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['173'] },
      { name: '让球', idList: ['172'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['173'] },
      { name: '让球', idList: ['172'] },
    ],
  },
  [OBSportId.Baseball]: {
    label: '棒球',
    id: OBSportIdValue.Baseball,
    viewId: SportIdForView.Baseball,
    list: [
      { name: '独赢', idList: ['242'] },
      { name: '大小', idList: ['244'] },
      { name: '让分', idList: ['243'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['242'] },
      { name: '大小', idList: ['244'] },
      { name: '让分', idList: ['243'] },
    ],
  },
  [OBSportId.Volleyball]: {
    label: '排球',
    id: OBSportIdValue.Volleyball,
    viewId: SportIdForView.Volleyball,
    list: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['173'] },
      { name: '让球', idList: ['172'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['153'] },
      { name: '大小', idList: ['173'] },
      { name: '让球', idList: ['172'] },
    ],
  },
  [OBSportId.Puck]: {
    label: '冰球',
    id: OBSportIdValue.Puck,
    viewId: SportIdForView.Puck,
    list: [
      { name: '独赢', idList: ['1'], row: 3 },
      { name: '大小', idList: ['2'] },
      { name: '让球', idList: ['4'] },
    ],
    simpleList: [
      { name: '独赢', idList: ['1'], row: 3 },
      { name: '大小', idList: ['2'] },
      { name: '让球', idList: ['4'] },
    ],
  },
  // 以下多为冠军菜单用（对齐 Flutter getOBBallList champion）
  [OBSportId.Handball]: {
    label: '手球',
    id: OBSportIdValue.Handball,
    viewId: SportIdForView.Handball,
    list: [],
    simpleList: [],
  },
  [OBSportId.Boxing]: {
    label: '拳击',
    id: OBSportIdValue.Boxing,
    viewId: SportIdForView.Boxing,
    list: [],
    simpleList: [],
  },
  [OBSportId.USBaseball]: {
    label: '美式足球',
    id: OBSportIdValue.USBaseball,
    viewId: SportIdForView.USBaseball,
    list: [],
    simpleList: [],
  },
  [OBSportId.Golf]: {
    label: '高尔夫球',
    id: OBSportIdValue.Golf,
    viewId: SportIdForView.Golf,
    list: [],
    simpleList: [],
  },
  [OBSportId.Cricket]: {
    label: '板球',
    id: OBSportIdValue.Cricket,
    viewId: SportIdForView.Cricket,
    list: [],
    simpleList: [],
  },
  [OBSportId.Olive]: {
    label: '橄榄球',
    id: OBSportIdValue.Olive,
    viewId: SportIdForView.Olive,
    list: [],
    simpleList: [],
  },
  [OBSportId.F1Car]: {
    label: '赛车',
    id: OBSportIdValue.F1Car,
    viewId: SportIdForView.Racing,
    list: [],
    simpleList: [],
  },
  [OBSportId.Water]: {
    label: '水球',
    id: OBSportIdValue.Water,
    viewId: SportIdForView.Water,
    list: [],
    simpleList: [],
  },
  [OBSportId.Dart]: {
    label: '飞镖',
    id: OBSportIdValue.Dart,
    viewId: SportIdForView.Dart,
    list: [],
    simpleList: [],
  },
  [OBSportId.Special]: {
    label: '特殊投注',
    id: OBSportIdValue.Special,
    viewId: SportIdForView.Special,
    list: [],
    simpleList: [],
  },
  [OBSportId.Other]: {
    label: '其他',
    id: OBSportIdValue.Other,
    viewId: SportIdForView.Special,
    list: [],
    simpleList: [],
  },
};

/** 滚球/今日/早盘本地球种顺序（对齐 Flutter getOBBallList） */
export const OB_MAIN_BALL_IDS: number[] = [
  OBSportIdValue.Football,
  OBSportIdValue.Basketball,
  OBSportIdValue.Tennis,
  OBSportIdValue.Snooker,
  OBSportIdValue.Badminton,
  OBSportIdValue.PingPong,
  OBSportIdValue.Baseball,
  OBSportIdValue.Volleyball,
  OBSportIdValue.Puck,
];

/** 冠军本地球种顺序（对齐 Flutter getOBBallList champion） */
export const OB_CHAMPION_BALL_IDS: number[] = [
  OBSportIdValue.Football,
  OBSportIdValue.Basketball,
  OBSportIdValue.Tennis,
  OBSportIdValue.Baseball,
  OBSportIdValue.Handball,
  OBSportIdValue.Puck,
  OBSportIdValue.Volleyball,
  OBSportIdValue.Boxing,
  OBSportIdValue.USBaseball,
  OBSportIdValue.Golf,
  OBSportIdValue.Cricket,
  OBSportIdValue.Snooker,
  OBSportIdValue.Olive,
  OBSportIdValue.F1Car,
  OBSportIdValue.Water,
  OBSportIdValue.Special,
  OBSportIdValue.Other,
  OBSportIdValue.Dart,
];

/** 用于赛种名称 / viewId 查找 */
export const obList: CompetitionItem[] = Object.values(OBCompetitionMap);

/**
 * OB 一级玩法：对齐 Flutter obTypeList + champion menuId=406
 * typeId 用统一 PlayTypeId（给 UI / redux）；匹配接口用 menuId
 */
export const DefaultPlayTypes: Array<{
  type: PlayType;
  typeId: number;
  menuId: string;
  name: string;
  count: number;
}> = [
  { type: PlayType.Living, typeId: PlayTypeId.Living, menuId: '400', name: '滚球', count: 0 },
  { type: PlayType.Today, typeId: PlayTypeId.Today, menuId: '402', name: '今日', count: 0 },
  { type: PlayType.Early, typeId: PlayTypeId.Early, menuId: '403', name: '早盘', count: 0 },
  {
    type: PlayType.Champion,
    typeId: 100, // OB API type=100（Flutter champion）
    menuId: '406',
    name: '冠军',
    count: 0,
  },
];
