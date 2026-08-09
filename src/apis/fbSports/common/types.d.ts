import { SportIdForView } from '@/apis/commonSports/constants';
import { EFbPeriod } from '@/apis/fbSports/common/constants/period';
import { EFbMarketType } from './constants/marketType';
import { EFbSelectionType } from './constants/selectionType';
import { EFbOddsFormatType, EFbMarketCurtSaleStatusEnum } from './constants/enum';

export interface ScoreItem {
  pe: number; // 赛事阶段（period 枚举）
  tyg: number; // 比分类型（如比分、角球、红黄牌等，result_type_group 枚举）
  sc: [number, number]; // 比分数组：[主队分数, 客队分数]
}

// 玩法选项
export interface OddsOption {
  na: string; // 选项全称（投注框展示）
  nm: string; // 选项简称（赔率列表展示）
  tid?: number; // 球员玩法球队ID（可选）
  ty: EFbSelectionType; // 选项类型（主/客/大/小等，selection_type 枚举）
  od: number; // 欧盘赔率（<0 表示锁盘）
  bod: number; // 根据请求返回的对应类型赔率
  odt: EFbOddsFormatType; // 赔率类型（odds_format_type_enum 枚举）
  otcm?: number; // 选项结算结果（仅虚拟体育，outcome 枚举，可选）
  li?: string; // 带线玩法的线（老版本兼容，可忽略）
  oid?: string; // 选项ID
}

// 玩法赔率集合
export interface MarketItem {
  id: number; // 玩法ID
  op: OddsOption[]; // 玩法选项集合
  ss: EFbMarketCurtSaleStatusEnum; // 玩法销售状态（market_curt_sale_status_enum）
  au: number; // 是否支持串关（0 不可，1 可）
  mbl?: number; // 是否为最优线（带线玩法排序用，可选）
  li?: string; // line值（带线玩法分组展示，可选）
}
// 赔率列表
export interface MarketGroup {
  mty: EFbMarketType; // 玩法类型（如亚盘、大小球，market_type 枚举）
  pe: EFbPeriod; // 玩法阶段（如全场、上半场，period 枚举）
  mks: MarketItem[]; // 玩法赔率集合
  tps: string[]; // 玩法展示分类（如 "热门"、"角球"，market_tag 枚举）
  nm: string; // 玩法名称
  dl?: number; // 下次关盘时间（可选）
}
// 联赛信息
export interface League {
  na: string; // 联赛名称
  id: number; // 联赛ID
  or: number; // 联赛等级（值越小越高级）
  lurl?: string; // 联赛图标地址（可选）
  sid: number; // 运动种类ID（sports 枚举）
  rid?: number; // 区域ID（可选）
  rnm?: string; // 区域名称（可选）
  rlg?: string; // 区域logo（可选）
  hot?: boolean; // 是否热门（可选）
  slid?: number; // 联赛分组（可选）
}

// 球队信息
export interface Team {
  na: string; // 球队名称
  id: number; // 球队ID
  lurl?: string; // 球队图标地址（可选）
}
// 比赛时钟（滚球）
export interface MatchClock {
  s: number; // 走表时间（秒）
  tu: number; // 走表时间展示精度（match_clock_time_display_accuracy 枚举）
  pe: number; // 赛事阶段（match_period 枚举）
  r: boolean; // 是否走表
  tp: number; // 走表类型（clock_type 枚举）
  itd?: number; // 伤停补时时长（分钟，可选）
}

// 比分板（不同运动特有字段）
export interface ScoreBoard {
  ihs?: number; // 冰球 主队当前被罚下人数
  ias?: number; // 冰球 客队当前被罚下人数
  rp?: string; // 橄榄球 进攻方
  rd?: number; // 橄榄球 第几次进攻
  ry?: number; // 橄榄球 本次进攻剩余码数
  sv?: string; // 斯诺克 谁在打球
  srr?: number; // 斯诺克 剩余红球数量
  bs?: number; // 棒球 好球数量
  bb?: number; // 棒球 坏球数量
  bo?: number; // 棒球 出局人数
  bbs?: string; // 棒球 上垒情况（可选）
  hhs?: number; // 手球 主队暂停球员数量
  has?: number; // 手球 客队暂停球员数量
  co?: number; // 板球 回合
  cd?: number; // 板球 球
}

// 单个玩法项（盘口项）
export interface LocalHandicapItem {
  /** 玩法名称（例如：大小、让球） */
  name: string;
  /** 对应的玩法 ID 列表 */
  idList: number[];
  /** 一行展示几列（可选） */
  row?: number;
  /** 玩法阶段，如上半场、全场等，见枚举 */
  period?: EFbPeriod;
}

// 单个赛种配置项
export interface CompetitionItem {
  /** 赛种名称 */
  label: string;
  /** 赛种 ID */
  id: number;
  /** 用于图标和国际化显示的赛种id */
  viewId: SportIdForView;
  /** 本地玩法配置 */
  list: LocalHandicapItem[];
  /** 简洁版玩法配置 */
  simpleList: LocalHandicapItem[];
}

export interface BallItem {
  label: string; // 名称
  id: number; // id
  icon: string; // icon
  activeIcon: string; // 激活icon
  num: number; // 场次
  sportId: string; // 球种id
}

// 联赛分组
export interface LeagueGroup {
  spell: string; // 首字母拼音
  name: string; // 地区名称
  isCollapsed: boolean; // 是否折叠
  list: LeagueItem[]; // 联赛列表
}

export interface LeagueItem {
  sportId: number; // 运动种类id
  id: number; // 联赛ID
  name: string; // 联赛名称
  icon: string; // 联赛图标
  hot: boolean; // 是否热门
  mt: number; // 该联赛开售的赛事统计
  or: number; // 联赛等级
  rid: number; // 区域id
  rnm: string; // 区域名称
}
