/**
 * OB 详情盘口分类 / 列数（对齐 EMC App：homeSport/index/ob/detail/constants.dart）
 */

export type OBDetailCategoryKey =
  | 'all'
  | 'featured'
  | 'goal'
  | 'cs'
  | 'anti_cs'
  | 'penaltyCard'
  | 'corner'
  | 'time'
  | 'special'
  | 'half'
  | 'set'
  | 'innings'
  | 'nood'
  | 'points_size'
  | 'teams'
  | 'players';

export interface OBDetailCategoryDef {
  id: string;
  name: string;
  /** getCategoryList 返回的 category id 列表 */
  type: string[];
}

/** 详情 Tab 桶定义：type 对应 categoryList 里的 id（展示时「波胆」→「比分」） */
export const OB_DETAIL_CATEGORY_MAP: Record<OBDetailCategoryKey, OBDetailCategoryDef> = {
  all: { id: '0', name: '全部', type: ['-1'] },
  featured: {
    id: '1',
    name: '热门',
    type: ['302', '74', '94', '104', '97', '122', '124', '126', '23'],
  },
  goal: { id: '2', name: '总进球数', type: ['86'] },
  cs: { id: '3', name: '波胆', type: ['175'] },
  anti_cs: { id: '4', name: '反波胆', type: ['301'] },
  penaltyCard: { id: '5', name: '罚牌', type: ['178'] },
  corner: { id: '6', name: '角球', type: ['77'] },
  time: { id: '7', name: '时间类', type: ['115'] },
  special: { id: '8', name: '特殊玩法', type: ['44'] },
  half: { id: '9', name: '半场', type: ['83', '85', '234'] },
  set: { id: '10', name: '赛盘', type: ['102', '117', '116', '123'] },
  innings: { id: '11', name: '局', type: ['103'] },
  nood: { id: '12', name: '单节', type: ['84'] },
  points_size: { id: '13', name: '让球&大小', type: ['76'] },
  teams: { id: '14', name: '球队', type: ['105', '238'] },
  players: { id: '15', name: '球员', type: ['303'] },
};

/** 波胆 / 反波胆 / 高倍波胆 hpid */
export const OB_POINT_HPIDS = new Set([7, 341, 342, 367, 368, 369, 1100484, 1100485]);

/** 三列布局 hpid（对齐 EMC lineThreeArray） */
export const OB_LINE_THREE_HPIDS = new Set([
  1, 3, 6, 7, 17, 25, 28, 32, 69, 70, 71, 72, 104, 111, 119, 149, 167, 261, 301, 341, 342, 367, 368,
  369, 20001, 20013, 20043, 354, 355, 356, 357, 391, 392, 394, 396, 1100484, 1100485, 385, 387, 225,
  120, 16, 85, 95,
]);

/** 动态列数 hpid：按实际选项数 2/3 列 */
export const OB_LINE_DYNAMIC_HPIDS = new Set([168]);

/** 两列布局 hpid（对齐 EMC lineTwoArray） */
export const OB_LINE_TWO_HPIDS = new Set([
  2, 4, 5, 10, 11, 12, 13, 15, 18, 19, 24, 26, 208, 158, 33, 34, 37, 38, 39, 40, 42, 43, 45, 46, 47,
  48, 52, 51, 53, 54, 57, 58, 59, 60, 63, 64, 65, 66, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 86,
  87, 88, 89, 90, 91, 92, 93, 94, 96, 97, 98, 99, 100, 101, 102, 105, 106, 107, 108, 109, 110, 113,
  112, 114, 118, 121, 122, 142, 143, 145, 146, 153, 154, 155, 156, 157, 160, 161, 162, 163, 164,
  165, 169, 171, 172, 173, 175, 176, 177, 178, 181, 182, 183, 184, 198, 199, 202, 205, 206, 229,
  242, 243, 244, 250, 253, 254, 255, 259, 262, 294, 295, 336, 350, 348, 360, 68, 14, 23, 73, 8, 9,
  21, 22, 31, 117, 226, 227, 228,
]);

/** 玩法名强制两列（对齐 EMC getLineCount hpn.contains） */
const OB_LINE_TWO_NAME_RE =
  /进球单双\s*&\s*进球大小|独赢\s*&\s*进球单\/?双|准确盘数|净胜分|双重机会\s*&\s*进球大小|独赢\s*&\s*最先进球球队/;

export function getObDetailLineCount(hpid: number, hpn = '', selectionLength = 0): number {
  if (OB_LINE_DYNAMIC_HPIDS.has(hpid)) {
    if (selectionLength === 2) return 2;
    if (selectionLength === 3) return 3;
  }
  if (OB_LINE_THREE_HPIDS.has(hpid)) return 3;
  if (OB_LINE_TWO_HPIDS.has(hpid) || OB_LINE_TWO_NAME_RE.test(hpn)) return 2;
  return 1;
}

/** 足球热门名组（赛前 / 不含 15 分钟阶段） */
export const OB_HOT_FOOTBALL_BASE: string[][] = [
  ['全场独赢', '独赢'],
  ['双重机会'],
  ['全场让球胜平负', '让球胜平负'],
  ['两队都进球'],
  ['第1个进球'],
  ['第2个进球'],
  ['第3个进球'],
  ['第4个进球'],
  ['第5个进球'],
  ['第6个进球'],
  ['第7个进球'],
  ['第8个进球'],
  ['第9个进球'],
  ['第10个进球'],
  ['第11个进球'],
  ['第12个进球'],
  ['第13个进球'],
  ['第14个进球'],
  ['第15个进球'],
  ['第16个进球'],
  ['第17个进球'],
  ['第18个进球'],
  ['第19个进球'],
  ['第20个进球'],
  ['全场大小', '大/小', '大小'],
  ['全场大小-附加盘', '大小-附加盘'],
  ['上半场大小', '上半场大/小'],
  ['上半场大小-附加盘'],
];

/** 足球 15 分钟阶段热门 */
export const OB_HOT_FOOTBALL_15MIN: string[][] = [
  ['15分钟进球(开场~14:59)-大小', '15分钟进球(开场-14:59)-大小', '15分钟进球（开场-14:59）大/小'],
  [
    '15分钟进球(15:00~29:59)-大小',
    '15分钟进球(15:00-29:59)-大小',
    '15分钟进球（15:00-29:59）大/小',
  ],
  [
    '15分钟进球(30:00~半场结束)-大小',
    '15分钟进球(30:00-半场结束)-大小',
    '15分钟进球（30:00-中场休息）大/小',
  ],
  [
    '15分钟进球(下半场开始~59:59)-大小',
    '15分钟进球(下半场开始-59:59)-大小',
    '15分钟进球（下半场开始-59:59）大/小',
  ],
  [
    '15分钟进球(60:00~74:59)-大小',
    '15分钟进球(60:00-74:59)-大小',
    '15分钟进球（60:00-74:59）大/小',
  ],
  [
    '15分钟进球(75:00~全场结束)-大小',
    '15分钟进球(75:00-全场结束)-大小',
    '15分钟进球（75:00-全场结束）大/小',
  ],
];

export const OB_HOT_FOOTBALL_TAIL: string[][] = [
  ['全场让球', '让球'],
  ['全场让球-附加盘', '让球-附加盘'],
  ['上半场让球'],
  ['上半场让球-附加盘'],
  ['角球大小', '角球：大小', '角球：大/小'],
  ['角球大小-附加盘', '角球：大小-附加盘'],
  ['上半场角球大小', '上半场角球：大/小'],
  ['上半场角球大小-附加盘', '角球：大小-上半场-附加盘'],
];

/** 篮球热门名组 */
export const OB_HOT_BASKETBALL: string[][] = [
  ['全场独赢', '胜负', '独赢'],
  ['第1节独赢', '第1节胜负'],
  ['第2节独赢', '第2节胜负'],
  ['第3节独赢', '第3节胜负'],
  ['第4节独赢', '第4节胜负'],
  ['全场让分', '让分'],
  ['全场让分-附加盘', '让分-附加盘'],
  ['上半场让分'],
  ['上半场让分-附加盘'],
  ['第1节让分'],
  ['第2节让分'],
  ['第3节让分'],
  ['第4节让分'],
  ['第1节让分-附加盘'],
  ['第2节让分-附加盘'],
  ['第3节让分-附加盘'],
  ['第4节让分-附加盘'],
  ['第1节大小', '第1节总分大小'],
  ['第2节大小', '第2节总分大小'],
  ['第3节大小', '第3节总分大小'],
  ['第4节大小', '第4节总分大小'],
  ['第1节大小-附加盘', '第1节总分大小-附加盘'],
  ['第2节大小-附加盘', '第2节总分大小-附加盘'],
  ['第3节大小-附加盘', '第3节总分大小-附加盘'],
  ['第4节大小-附加盘', '第4节总分大小-附加盘'],
  ['全场大小', '总分大小', '大小'],
  ['全场大小-附加盘', '总分大小-附加盘', '大小-附加盘'],
  ['上半场大小', '上半场总分大小'],
  ['上半场大小-附加盘', '上半场总分大小-附加盘'],
];

/** 对齐 EMC Football15MatchPeriod + classifyMatchTime */
export type Football15Period =
  's0' | 'first1' | 'first2' | 'first3' | 'last1' | 'last2' | 'last3' | 's7';

export function classifyMatchTime(matchTimeSec?: number | string | null): Football15Period {
  if (matchTimeSec == null || matchTimeSec === '') return 's0';
  const seconds = Number(matchTimeSec) || 0;
  if (seconds === 0) return 's0';
  const minutes = Math.floor(seconds / 60);
  if (minutes <= 14) return 'first1';
  if (minutes <= 29) return 'first2';
  if (minutes <= 45) return 'first3';
  if (minutes <= 59) return 'last1';
  if (minutes <= 74) return 'last2';
  if (minutes <= 90) return 'last3';
  return 's7';
}

export function getCategoryFootballHotNames(period: Football15Period | null): string[][] {
  const result = OB_HOT_FOOTBALL_BASE.map((row) => [...row]);
  const periodIndex: Record<Football15Period, number | null> = {
    s0: 0,
    first1: 0,
    first2: 1,
    first3: 2,
    last1: 3,
    last2: 4,
    last3: 5,
    s7: null,
  };
  const idx = period == null ? 0 : periodIndex[period];
  if (idx != null && OB_HOT_FOOTBALL_15MIN[idx]) {
    result.push([...OB_HOT_FOOTBALL_15MIN[idx]]);
  } else if (period !== 's7') {
    result.push([...OB_HOT_FOOTBALL_15MIN[0]!]);
  }
  result.push(...OB_HOT_FOOTBALL_TAIL.map((row) => [...row]));
  return result;
}

export function getCategoryBasketballHotNames(): string[][] {
  return OB_HOT_BASKETBALL.map((row) => [...row]);
}
