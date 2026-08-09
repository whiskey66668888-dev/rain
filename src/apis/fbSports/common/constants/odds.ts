import { FBSportIdValue } from '.';

export interface OddsItem {
  code: number;
  name: string;
  rows?: number;
}

interface OddsMapItem {
  defaultOdds: OddsItem[];
  needDetailsData?: boolean;
}

/**
 * FB 赛事默认赔率配置：code 为玩法类型(mty)，name 为展示名称
 */
export const OddsMap: Record<number, OddsMapItem> = {
  [FBSportIdValue.Football]: {
    defaultOdds: [
      { code: 1000, name: '让球' },
      { code: 1007, name: '大小' },
      { code: 1005, name: '独赢', rows: 3 },
      { code: 1010, name: '角球' },
      { code: 1000, name: '半场让球' },
      { code: 1007, name: '半场大小' },
      { code: 1005, name: '半场独赢', rows: 3 },
      { code: 1010, name: '半场角球' },
    ],
    needDetailsData: true,
  },
  [FBSportIdValue.Basketball]: {
    defaultOdds: [
      { code: 3002, name: '让球' },
      { code: 3003, name: '大小' },
      { code: 3004, name: '独赢', rows: 3 },
    ],
  },
  [FBSportIdValue.Tennis]: {
    defaultOdds: [
      { code: 5002, name: '让局' },
      { code: 5004, name: '局大小' },
      { code: 5001, name: '独赢', rows: 3 },
      { code: 5004, name: '让盘' },
    ],
  },
  [FBSportIdValue.Snooker]: {
    defaultOdds: [
      { code: 16003, name: '独赢', rows: 3 },
      { code: 16001, name: '让盘' },
    ],
  },
  [FBSportIdValue.Baseball]: {
    defaultOdds: [
      { code: 7003, name: '独赢', rows: 3 },
      { code: 7002, name: '大小' },
      { code: 7001, name: '让垒' },
    ],
  },
  [FBSportIdValue.Volleyball]: {
    defaultOdds: [
      { code: 13001, name: '独赢', rows: 3 },
      { code: 13003, name: '大小' },
    ],
  },
  [FBSportIdValue.BeachVolleyball]: {
    defaultOdds: [
      { code: 51001, name: '独赢', rows: 3 },
      { code: 51003, name: '大小' },
      { code: 51002, name: '让分' },
    ],
  },
  [FBSportIdValue.Badminton]: {
    defaultOdds: [
      { code: 47001, name: '独赢', rows: 3 },
      { code: 47002, name: '让分' },
      { code: 47003, name: '大小' },
    ],
  },
  [FBSportIdValue.PingPong]: {
    defaultOdds: [
      { code: 15001, name: '独赢', rows: 3 },
      { code: 15003, name: '大小' },
      { code: 15002, name: '让分' },
    ],
  },
  [FBSportIdValue.Puck]: {
    defaultOdds: [
      { code: 2003, name: '独赢', rows: 3 },
      { code: 2002, name: '大小' },
      { code: 2001, name: '让球' },
    ],
  },
  [FBSportIdValue.Cricket]: {
    defaultOdds: [{ code: 14002, name: '独赢', rows: 3 }],
  },
  [FBSportIdValue.Olive]: {
    defaultOdds: [
      { code: 4003, name: '独赢', rows: 3 },
      { code: 4001, name: '让球' },
    ],
  },
  [FBSportIdValue.Fight]: {
    defaultOdds: [
      { code: 18002, name: '独赢', rows: 3 },
      { code: 18001, name: '大小' },
    ],
  },
  [FBSportIdValue.Boxing]: {
    defaultOdds: [
      { code: 19002, name: '独赢', rows: 3 },
      { code: 19001, name: '大小' },
    ],
  },
  [FBSportIdValue.Handball]: {
    defaultOdds: [
      { code: 8005, name: '独赢', rows: 3 },
      { code: 8001, name: '让球' },
    ],
  },
  [FBSportIdValue.USBaseball]: {
    defaultOdds: [
      { code: 6002, name: '大小' },
      { code: 6001, name: '让球' },
      { code: 6003, name: '独赢', rows: 3 },
    ],
  },
  [FBSportIdValue.OlympicGames]: {
    defaultOdds: [],
  },
  [FBSportIdValue.Water]: {
    defaultOdds: [
      { code: 24002, name: '独赢', rows: 3 },
      { code: 24001, name: '大小' },
    ],
  },
  [FBSportIdValue.F1Car]: {
    defaultOdds: [{ code: 92001, name: '独赢', rows: 3 }],
  },
  [FBSportIdValue.Special]: {
    defaultOdds: [],
  },
};
