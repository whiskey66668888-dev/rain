// 支持多个三方体育接口，在这里统一定义转后三方接口数据后的输出类型
import { EFbMarketType } from '../fbSports/common/constants/marketType';
import { EFbPeriod } from '../fbSports/common/constants/period';
import { EFbSelectionType } from '../fbSports/common/constants/selectionType';
import { PopularEventsLiveResponse } from '../origin/sportListByType';
import {
  PlayType,
  PlayType,
  EOddsChange,
  SportIdForView,
  EBetOrderStatus,
  EBetSettleResult,
  EOddsStatus,
  EBetHistoryQueryType,
  EOddsType,
} from './constants';
import { EntityState } from '@reduxjs/toolkit';

export type TbetData = EntityState<TBetItem, string>;

export interface TParlayItem {
  /** 串关label，如2串1，3串4，单关=‘单关’*/
  parlayLabel: string;
  /** 串关code, 2001,2003,3004等，单关为 1 */
  parlayCode: string;
  /** 某串关注单，组合的投注项数量，2串1=2，3串1=3，10串1=10，3串4=0，10串1013=0，全串关=0，单关为1 */
  parlayCombinationNum: number;
  /** 串关子单个数，单关为1 */
  parlaySum: number;
  parlayOdds: number;
  betAmount: string;
  minBet: number;
  maxBet: number;
  isFocus: boolean;
  /** 临时id */
  tempId?: string;
}

export interface TPreBetInfo {
  preBetEnabled: boolean;
  preBetOdds: string;
  preBetMinAmount: number;
  preBetMaxAmount: number;
}

export interface TBaseBetItem {
  /** 是否支持香港盘 */
  isSupportHK: boolean;
  /**
   *  是否支持串关
   * @ob [hids: 1：支持，0：不支持]
   * @fb [au: 1：支持，0：不支持]
   */
  canParlay: boolean;
  /** 是否支持预约投注 */
  canPreBet: boolean;
  /** 玩法名称 */
  playName: string;
  /**
   * 玩法id
   * @ob hpid(玩法id)
   * @fb mg.mty(玩法类型) + mg.pe(玩法阶段)
   */
  playId: string;
  /**
   * 盘口id
   * @ob hps.hl.hid
   * @fb mg.mks.id
   */
  marketId: string;
  /**
   * 盘口值
   * @ob
   * @fb mg.mks.li
   */
  marketValue: string;
  /**
   * 投注项简称 - 用于列表基础展示
   * @ob
   * @fb mg.mks.op.nm
   */
  betItemShortName: string;
  /**
   * 投注项全称 - 用于添加到投注列表后展示
   * @ob
   * @fb mg.mks.op.na | mg.mks.op.nm (列表接口/详情页接口使用 na；；；查询最新盘口信息接口 使用 nm)
   */
  betItemFullName: string;
  /**
   * 投注项 id
   * @ob mid + hpid(玩法id) + hn(坑位) + ot(投注项类型 1，2，Over,Under) 组成该投注项唯一id
   * @fb mks.id(盘口id) + ty(选项类型) 组成该投注项唯一id
   */
  betItemId: string;
  /** 基础赔率,欧赔 */
  baseOdds: number;
  /** 赔率变化 */
  oddsChange?: EOddsChange;
  /** 投注项状态 EOddsStatus */
  oddsStatus: EOddsStatus;
  /** 投注项图标 */
  teamIcon?: string;
  ob?: {
    /** hl.hmt */
    hmt: number;
    /** 坑位, hn */
    placeNum: number;
    /** 投注项 原始id */
    oid: string;
    /**
     * 投注项类型
     * @ob [ot 独赢(1，2，X),让球(1,2),大小(Over,Under),单双(Odd/Even)]
     */
    ot: string;
  };
  fb?: {
    /** 玩法类型，如 亚盘、大小球等 , see enum: market_type */
    mty: EFbMarketType;
    /** 玩法阶段，如足球上半场、全场等，和玩法类型组合成一个玩法 , see enum: period */
    pe: EFbPeriod;
    /** 选项类型，主、客、大、小等，投注时需要提交该字段作为选中的选项参数 , see enum: selection_type */
    ty: EFbSelectionType;
    /** 下单时赔率格式：1 欧洲盘，2 香港盘 */
    of?: number;
  };
}

export interface TBetItem extends TBaseBetItem {
  sportId: string;
  matchId: string;
  /** 比赛开始时间 */
  matchStartTime: number;
  /** 跟该投注项相关的比分，可能是全场比分，角球比分，罚牌比分等等 */
  score: string;
  /** 联赛id */
  leagueId: number;
  /** 联赛名称 */
  leagueName: string;
  /** 主队名称 */
  homeName: string;
  /** 客队名称 */
  awayName: string;
  /** 是否滚球 */
  isLive: boolean;
  /** 是否冠军 */
  isChampion: boolean;
  /** 最低投注金额 */
  minBet: number;
  /** 最大投注金额 */
  maxBet: number;
  /** 用户输入金额 */
  betAmount: string;
  /** 预约投注信息 */
  preBetInfo?: TPreBetInfo;
  /** 盘口值变化 */
  marketValueChange?: boolean;
  /** 刚添加的投注项，还未经历过轮训接口更新数据 */
  isNewlyAdded: boolean;
  /**
   * 同一个投注项的 ID 可能变化，但需要记录它曾经关联过哪些 ID
   * @ob oid
   * @fb (mks.id/mid/marketId) + ty
   */
  relatedIds?: string[];
}

export type TBetOrderItem = {
  /** 订单号 */
  orderId: string;
  /** 是否为预约下注订单 */
  isPreBetOrder?: boolean;
  /** 下注金额 */
  orderBetAmount: string;
  /** 盘口类型（欧盘or亚盘）*/
  // marketType: string;
  /** 最大可赢金额 */
  orderMaxWinAmount: string;
  /** 订单状态 */
  orderStatus: EBetOrderStatus;
  /** 基础赔率 */
  orderOdds: number;
  /** 订单code, 2001,2003,3004等，单关为 1 */
  orderCode: string;
  /** 串关数量，单关为1 */
  orderSum: number;
  /** 订单label，如2串1，3串4，单关=‘单关’*/
  orderLabel: string;
  orderDetails: TBetItem[];
};

export interface THistoryBetItem extends TBaseBetItem {
  /** 运动ID */
  sportId: string;
  /** 比赛ID */
  matchId: string;
  /** 联赛名称 */
  leagueName: string;
  /** 主队名称 */
  homeName: string;
  /** 客队名称 */
  awayName: string;
  /** 是否滚球 */
  isLive: boolean;
  /** 是否冠军 */
  isChampion: boolean;
  /** 比赛开赛时间，13位时间戳 */
  matchStartTime: number;
  /** 结算时比分，如 "1-0"，未结算时为空 */
  resultScore?: string;
  /**
   * 下注时的盘口类型，展示层据此换算赔率、取盘口文案（`baseOdds` 恒为欧赔）。
   * @ob marketType（EU/HK/MA/IN）
   * @fb ops[].of（1 欧洲盘 / 2 香港盘 …）
   *
   * 只区分香港盘，马来/印尼/美盘等一律按欧洲盘处理。
   */
  bettingOddsType?: EOddsType;
  /**
   * 子单结算结果，对应接口 sr 字段
   * @fb ops[0].sr see enum: outcome
   */
  orderSettleResult: EBetSettleResult;
  /** 下注时比分 */
  scoreWhileBetting?: string;
  /**
   * 联赛 ID（晒单跟单冠军用）
   * @ob tournamentId
   */
  leagueId?: string | number;
  /** 赛种名称（@ob sportName） */
  sportName?: string;
}

export interface TBetHistoryOrderItem {
  /** 订单号 */
  orderId: string;
  /** 订单确认时间，13位时间戳 */
  orderConfirmTime: number;
  /** 订单结算时间，13位时间戳 */
  orderSettleTime?: number;
  /** 下注金额 */
  orderBetAmount: string;
  /** 最大可赢金额 */
  orderMaxWinAmount: string;
  /** 实际结算返还金额 */
  orderSettledBackAmount: string;
  /** 订单状态 */
  orderStatus: EBetOrderStatus;
  /** 总单结算结果：单关来自 ops[0].sr；串关由 sa/sat 派生（Won/Return/Lost） */
  orderSettleResult: EBetSettleResult;
  /** 基础赔率 */
  orderOdds: number;
  /** 是否为串关订单 */
  isParlayOrder: boolean;
  /** 订单code, 2001,2003,3004等，单关为 1 */
  orderCode: string;
  /** 串关数量，单关为1 */
  orderSum: number;
  /** 订单label，如2串1，3串4，单关=’单关’*/
  orderLabel: string;
  /** 是否为未结算注单 */
  isUnsettledOrder: boolean;
  /** 是否为已结算注单 */
  isSettledOrder: boolean;
  /** 是否为预约投注单 */
  isPreBetOrder: boolean;
  /** 预约失败 - 是否手动取消 */
  isManualCancel?: boolean;
  /** 是否为提前结算订单 */
  isEarlySettleOrder: boolean;
  orderDetails: THistoryBetItem[];
  /** 总输赢（接口 uwl 字段） */
  orderWinLossAmount: number;

  // ── 提前结算相关（仅未结算订单有效） ─────────────────────────────────────
  /** 是否支持提前结算（接口 co == 1） */
  supportEarlySettle?: boolean;
  /** 提前结算总本金（接口 cots） */
  earlySettleTotalStake?: number;
  /** 提前结算总派彩（接口 cops） */
  earlySettleTotalPayout?: number;
  /** 当前可返还金额，含本金（接口 mla） */
  earlySettleCurrentPayable?: number;
  /** 剩余可赢额，有部分提前结算后的剩余本金对应潜在赢额（接口 lwa） */
  earlySettleRemainingWin?: number;
  /** 已成功提前结算次数，最多5次（接口 coc） */
  earlySettleCount?: number;
  /** 提前结算历史记录（接口 crl） */
  earlySettleHistory?: { id: string; stake: number; payout: number }[];
  /** 预约提前结算订单列表（接口 rcool） */
  reserveEarlySettles?: { id: string; status: number; stake: number; payout: number }[];
}

export interface TBetHistoryData {
  list: TBetHistoryOrderItem[];
  current: number;
  size: number;
  total: number;
  /** 统计信息 */
  stats: {
    /** 总订单数 */
    totalOrderCount: number;
    /** 总投注金额 */
    totalBetAmount: number;
    /** 有效，我知道个牙刷有效 */
    /** 总输赢 */
    winOrLoseAmount: number;
  };
}

export interface TBetHistoryQueryParams {
  queryType: EBetHistoryQueryType;
  startTime?: number;
  endTime?: number;
  pageSize: number;
  pageNum: number;
}

export type TBetResultTip = {
  id: string;
  message: string;
  success: boolean;
  showToRecords?: boolean;
};

export type TFbPreBetLimitItem = {
  /** 玩法ID */
  mid: number;
  /** 单关最小投注额 */
  mis: number;
  /** 最大可投額度 */
  mms: number;
  /** 最大可投注=mly/(赔率-1), 且 最大可投注>mly时 最大可投注=mly,赔率都是欧赔计算 */
  mly: number;
  /** 最高可投赔率 */
  mod: number;
  /** 选项当前赔率 */
  od: number;
  /** 保留的小数位 */
  scl: number;
  /** 该字段弃用, 现在写死是 1 */
  msf: number;
};

export type TFbPreBetLimitMap = Record<string, TFbPreBetLimitItem>;

/**
 * OB 预约投注限额（queryMarketMaxMinPreBetMoney）。
 * FB 的限额是一整套参数（mis/mly/mms/mod），OB 只有两个值，所以单独一个结构。
 */
export type TObPreBetLimit = {
  /** 所属投注项，切换投注项后旧限额作废 */
  betItemId: string;
  /** 最小投注本金 */
  minBet: number;
  /** 最大可赢金额，最大本金 = orderMaxPay / 预约赔率 */
  orderMaxPay: number;
};

// 比分赔率信息
export interface OddsItemInfo {
  /** 类型（OB体育 hps-hl-ots<String>） */
  type: string;
  /** 是否锁定（OB体育 hps-hl-hs<int> / hps-hl-ol-os<int>） */
  isLock: boolean;
  /** 比分id（OB体育 hps-hl-ol-oid<String>） */
  oddsId: string;
  /** 投注项（OB体育 hps-hl-ol-ot<String>） */
  oddsType: string;
  /** 盘口id（OB体育 hps-hl-hid<String>） */
  marketId: string;
  /** 赔率名称（OB体育 hps-hl-ol-(onb/on)<String>） */
  handicap: string;
  /** 是否支持香港盘（OB体育 hps-hl-hs<int>） */
  isSupportHK: boolean;
  /** 赔率值（OB体育 hps-hl-ol-ov<String>，原始值） */
  oddsValue: number;
  /** 赔率（OB体育 hps-hl-ol-ov<String>） */
  odds: string;
  /** 香港盘赔率（OB体育 hps-hl-ol-ov<String>） */
  oddsHK: string;
}

// 比分项信息
export interface ScoreItemInfo {
  /** 比分名称（OB体育 hps-hpn<String>） */
  scoreName: string;
  /** 比分本地名称（FB体育映射） */
  scoreLocalName: string;
  /** 比分id（OB体育 hps-mid<String>） */
  scoreId: string;
  /** 是否支持串关（OB体育 hps-hids<int>） */
  isSupportStray: boolean;
  /** 玩法id（OB体育 hps-hpid<String>） */
  playId: string;
  /** 玩法阶段（OB体育 hps-hpid<int>） */
  period: EFbPeriod;
  /** 当前条目在scoreList中的index（组件使用） */
  sIndex: number;
  /** 赔率列表（OB体育 hps-hl-ol<List>） */
  list: OddsItemInfo[];
}

// 单个赛事信息
export interface SportItemInfo {
  sportId: string; // 赛种id
  sportName: string; // 赛种名称
  leagueId: string; // 联赛id
  leagueName: string; // 联赛名称
  placeNum: number; // 坑位(OB投注使用)
  homeName: string; // 主队名称
  homeScore: number; // 主队比分
  tennisHomeScore?: string; // 网球比分（主队）
  homeRedCard?: number; // 主队红牌
  homeYellowCard?: number; // 主队黄牌
  homeCornerKick?: number; // 主队角球
  homeLogo: string; // 主队icon
  awayName: string; // 客队名称
  awayScore: number; // 客队比分
  tennisAwayScore?: string; // 网球比分（客队）
  awayRedCard?: number; // 客队红牌
  awayYellowCard?: number; // 客队黄牌
  awayCornerKick?: number; // 客队角球
  colType?: number; // 栏目类型
  awayLogo: string; // 客队icon
  firstHalfScore: string; // 上半场比分
  matchId: string; // 赛事id
  matchTime: string; // 赛事时间
  matchNum: string; // 赛事数目
  matchStatusId: string; // 赛事状态id
  periodName: string; // 赛事状态
  matchLiveStatus: string; // 正在进行中状态
  matchDate: string; // 开赛时间
  bt: number; // 时间戳
  isLive: boolean; // 是否为进行中
  isCountdown: boolean; // 是否显示倒计时
  isPreSettle: boolean; // 提前结算
  scoreList: ScoreItemInfo[]; // 比分列表
  scoreAll: string[]; // 所有阶段比分
  detailHomeScore: number; // 详情主队比分
  detailAwayScore: number; // 详情客队比分
}

// 单个投注项
// export interface BetItem {
//   /** 类型（OB体育 hps-hl-ots<String>） */
//   type: string;
//   betItemName: string; // 投注项名称，例如“主”、“客”
//   betItemType: string; // 选项类型
//   marketValue: string; // 盘口值，例如 “+1” 或 “-1”
//   odds: string; // 赔率，例如 “1.89”
//   betItemStatus: number; // 投注项状态，其中包括正常，锁盘，关盘等，值暂时定为1，2，3
//   betItemId: string; //
//   oddsType: string; //
//   marketId: string; //
//   isSupportHK: boolean; //
//   oddsEU: string; //
//   oddsHK: string; //
//   placeNum: number; // 坑位(OB投注使用)
//   isSupportCombo: number; // 是否支持串关，1表示支持，0表示不支持
//   matchType: number; // 比赛类型，1表示早盘，2表示滚球
//   canPreBet?: boolean; // 是否支持预约投注
//   canSeriesBet?: boolean; // 是否支持串关投注
//   otherOdds?: string; // 让球或大小时，对应的另一方赔率
//   typeIdPe?: EFbPeriod; // fb投注类型阶段id
//   teamIcon: string; // 冠军用 队伍icon
// }

// 投注类型，如让球、独赢等
export interface BetType {
  betTypeId: string;
  betTypeName: string; // 玩法名称，例如“让球”、“独赢”
  lists: TBaseBetItem[]; // 对应的投注项列表
  lineCount?: number; //
  typeId?: EFbMarketType; //
  typeIdPe?: EFbPeriod; //
}

// 一组盘口市场，例如全场、半场、特色组合
export interface MatchMarket {
  itemType: string; // 市场类型标识，例如 '1' 表示全场，'2' 表示半场，'3' 表示特色组合
  name: string; // 市场名称，例如 “全场”、“半场”
  children: BetType[]; // 市场下的投注类型集合
}

export interface MenuDataOriginalItemSubItem {
  menuId: number;
  count: number;
  menuType: number;
  field1: string;
}
export interface MenuDataOriginalItem {
  ty: number;
  desc: string;
  tc: number;
  ssl: Array<{ sid: number; c: number }>;
  count: number;
  menuType: number;
  menuName: string;
  subList: MenuDataOriginalItemSubItem[];
}

// 联赛信息
export interface LeagueInfo {
  /** 赛种id（csid） */
  sportId: number;
  /** 赛种名称（csna） */
  sportName: string;
  /** 联赛id（tid） */
  leagueId: number;
  /** 联赛名称（tn） */
  leagueName: string;
  /** 联赛icon */
  leagueLogo: string; // 联赛 Logo 地址
  /** 所属赛事列表 */
  children: MatchBaseInfo[]; // 联赛下的所有比赛列表
}

// 联赛信息响应
export interface LeagueInfoResp {
  leagueId: string; // 联赛iD
  sportName: string; // 赛种名称
  sportId: string; // 赛种iD
  leagueEnName: string; // 联赛英文名称
  leagueZhName: string; // 联赛中文名称
  leagueLevel: number; // 联赛等级(1代表顶级联赛)
  leagueShortName: string; // 联赛简称
  platform: string; // 平台标识
  batchNo: number; // 批次号
  sort: number;
}

export interface RawBetItem {
  ots: string; // 投注项类型
  ott: string; // 投注项title
  otv?: string; // 投注时展示的内容
  ov: number; // 赔率值
  os: number; // 投注项状态
  oid: string; // 投注项id
  ot: string; // 赔率类型
  onb: string; //
  on: string; //
}

export interface RawMarket {
  hid: string; // 盘口id
  hn: number; // 序号
  ol: RawBetItem[];
  hmt: number;
}

export interface RawDetailItem {
  hpid: string; // 玩法id
  hpn: string; // 玩法名
  hsw?: string; // 支持盘口
  hids?: number; // 是否支持串关
  topKey: string;
  hpt?: number; // 展示模板id
  hl: RawMarket[];
}

export interface Selection {
  type: string;
  handicap: string;
  name: string;
  betItemType?: string; // 选项类型
  betTypeId?: string;
  odds: number;
  oddsHK: string;
  oddsEU: string;
  marketValue: string;
  betItemId: string;
  oddsType: string;
  marketId: string;
  playId?: string;
  playName?: string;
  placeNum: number;
  betItemName: string;
  isSupportHK: boolean;
  canSeriesBet: boolean;
  isLock: boolean;
  isSupportStray?: boolean;
  matchType: number;
  otherOdds?: number;
  typeIdPe?: number | string;
  typeId?: number | string;
}

export interface BetTypeItem {
  marketId: string;
  betTypeName: string;
  betTypeId: number;
  homeTeam: string;
  awayTeam: string;
  hpt?: number;
  lineCount?: number;
  lists?: Selection[];
}

// 冠军投注项信息（例如 球队/球员 在 冠军类玩法中）
export interface ChampionSelection {
  oid: string; // 投注项id（来自 ol.oid）
  type: string; //选项类型
  name: string; // 投注项名称（来自 ol.on）
  odds: string; // 赔率（来自 ol.ov）
  status: number; // 投注项状态（来自 ol.os）
  sort: number; // 排序值（来自 ol.oddSort）
  placeNum: number; // 坑位
  imageUrl?: string; // 投注项图片（来自 ol.turl）
}

// 冠军玩法信息（例如 “冠军”、“最佳射手”）
export interface ChampionMarket {
  betItemId: string;
  betTypeId: string; // 玩法id（来自 hps.hpid）
  marketId: string; // 盘口id（来自 hps.hid）
  marketName: string; // 玩法名称（来自 hps.hps）
  endTime: string; // 玩法结束时间（来自 hps.hmed）
  startTime: string; // 玩法开始时间（来自 hps.hmgt）
  status: number; // 盘口状态（来自 hps.hs）
  selections: ChampionSelection[]; // 投注项列表（来自 hps.ol）
}

// 冠军联赛信息（例如 “沙特超级联赛 2024/2025”）
export interface ChampionTournament {
  tournamentId: string; // 联赛id（来自 tid）
  sportId: string; // 赛种id（来自 csid）
  sportName: string; // 赛种名称（来自 csna）
  tournamentName: string; // 联赛名称（来自 tn）
  logo: string; // 联赛图标（来自 lurl）
  endTime: string; // 联赛结束时间（来自 med）
  startTime: string; // 联赛开始时间（来自 mgt）
  matchId: string; // 比赛id（来自 mid）
  markets: ChampionMarket[]; // 冠军玩法列表（来自 hps）
}

//类型数量
export interface MatchTabItem {
  label: string; // 显示文字，如 '今日'
  value: PlayType; // 唯一标识，如 'today'
  count: number; // 数量
}

export interface SportItem {
  label: string;
  sportId: number;
  icon: string;
  iconActive: string;
  iconDark: string;
  iconDarkActive: string;
  euid: number;
  count: number;
}

// 详情
export interface DetailMatchOptionTeamInfo {
  name: string;
  logo: string;
}
export interface DetailMatchOption {
  matchId: string;
  homeName: DetailMatchOptionTeamInfo;
  awayName: DetailMatchOptionTeamInfo;
}

/**
 * 比赛基础信息
 */
export interface MatchBaseInfo {
  // ========== 基础信息 ==========
  /** 赛种ID 用于显示 */
  viewId: SportIdForView;
  /** 赛种ID */
  sportId: number;
  /** 赛种名称 */
  sportName: string;
  /** 联赛ID */
  leagueId: number;
  /** 联赛名称 */
  leagueName: string;
  /** 联赛Logo */
  leagueLogo?: string;
  /** 比赛ID */
  matchId: string; // 需要改成 string 类型，避免在前端使用时出现精度丢失问题
  /** 分页索引 */
  pageIndex: number;
  /** 比赛编号 */
  matchNum: number;
  /** 比赛阶段（如上半场、下半场） */
  matchPeriod: string;
  /** 是否冠军 */
  isChampion: boolean;

  // ========== 比赛状态和时间 ==========
  /** 比赛状态ID（数字类型） */
  matchStatusId: number;
  /** 比赛状态（字符串描述，如"未开始"、"进行中"、"已结束"） */
  matchStatus: string;
  /** 比赛时间（时间字符串） */
  matchTime: number;
  /** 开赛时间戳 */
  bt: number;
  /** 比赛日期 */
  matchDate: string;
  /** 是否滚球中 */
  isLive: boolean;
  /** 是否已完场（ms=0 或阶段文案为「已结束/完场」）；完场后 isLive 为 false，需靠此字段区分「未开赛」 */
  isEnded?: boolean;
  /** 阶段名称 */
  periodName: string;
  /** 是否倒计时 */
  isCountdown: boolean;
  /** 走表类型 */
  clockType: 'ASC' | 'DESC';

  // ========== 队伍信息 ==========
  /** 主队名称 */
  homeName: string;
  /** 主队Logo */
  homeLogo: string;
  /** 客队名称 */
  awayName: string;
  /** 客队Logo */
  awayLogo: string;
  /** 队名加粗方：根据胜平负/让球规则计算，用于列表展示 */
  nameBold?: 'home' | 'away';

  // ========== 比分信息 ==========
  /** 当前比分（字符串格式，如 "1-0"） */
  score: string;
  /** 完场赛果尚未返回的占位态：此时比分字段无意义，列表不应展示比分（避免误显示 0-0） */
  scorePending?: boolean;
  /** 主队比分 */
  homeScore: number;
  /** 客队比分 */
  awayScore: number;
  /** 详情页主队比分 */
  detailHomeScore: number;
  /** 详情页客队比分 */
  detailAwayScore: number;
  /** 上半场比分 */
  firstHalfScore: string;
  /** 半场比分 */
  halfTimeScore: string;
  /** 所有阶段比分 */
  scoreAll: string[];
  /** 网球比分（主队） */
  tennisHomeScore?: string;
  /** 网球比分（客队） */
  tennisAwayScore?: string;

  // ========== 足球相关数据 ==========
  /** 主队红牌数 */
  homeRedCard?: number;
  /** 客队红牌数 */
  awayRedCard?: number;
  /** 主队黄牌数 */
  homeYellowCard?: number;
  /** 客队黄牌数 */
  awayYellowCard?: number;
  /** 主队角球数 */
  homeCornerKick?: number;
  /** 客队角球数 */
  awayCornerKick?: number;

  // ========== 盘口信息 ==========
  /** 当前比赛的盘口市场集合 */
  children: MatchMarket[];
  /** 玩法数量 */
  marketCount?: number;
  /** 是否可以提前投注 */
  canPreBet: boolean;

  // ========== 媒体资源 ==========
  /** 动画地址 */
  animationUrl?: string;
  /** 视频地址 */
  TVUrl?: string;
  /** 是否有视频 */
  hasVideo?: boolean;

  // ========== 用户相关 ==========

  // ========== 标签页可见性标志（基于API响应） ==========
  /** 是否有角球玩法 */
  cosCorner?: boolean;
  /** 是否有15分钟玩法 */
  cos15Minutes?: boolean;
  /** 是否有比分玩法 */
  cosBold?: boolean;
  /** 是否有罚牌玩法 */
  cosPunish?: boolean;
  /** 是否有特色组合玩法 */
  compose?: boolean;
  /** 是否置顶 */
  matchPinned?: boolean;
  /** 是否关注 */
  isFollow?: boolean;
}

export interface DetailMatchTypeList {
  betTypeName: string;
  betTypeId: string;
  lists: {
    betItemName: string;
    marketValue: string;
    odds: string;
    betItemStatus: number;
    matchType: number; // 比赛类型，1表示早盘，2表示滚球
  }[];
}

export interface DetailMatchTabs {
  betTypeName: string;
  betTypeId: string;
  marketId: string;
  lineCount: number;
  lists: DetailMatchTypeList[];
}

export interface DetailMatchInfo {
  tabType: string;
  id: string;
  children: DetailMatchTabs[];
}

export type DetailMatchData = MatchBaseInfo & {
  children: DetailMatchInfo[];
};

export interface PinnedLeague {
  leagueId: string | number;
  sportId: string | number;
  timestamp: number;
}

export interface PinnedMatch {
  leagueId: string | number;
  matchId: string | number;
  sportId: string | number;
  timestamp: number;
}

export interface MenuInfoItem {
  sportId: number;
  count: number;
  name: string;
  viewId: number;
  /** OB 列表请求 euid；FB 无此字段 */
  menuId?: string;
  matchIds?: string[];
  matchIdVsWeekMap?: PopularEventsLiveResponse['matchIdVsWeekMap']; // 竞猜赛事id与周数映射
}

export type Menues = Record<PlayType, Array<MenuInfoItem>>;
export type PlayTypeList = Array<{
  type: PlayType;
  typeId: number;
  name: string;
  count: number;
}>;

export interface MenuInfo {
  hotSportMatchIds?: number[]; // 热门的比赛id（FB没有提供直接查询，要从菜单里面获取热门赛事id去查，其他三方如果也是这样就用）
  menus: Menues;
  playTypes: PlayTypeList;
}

// ── 投注记录 ──

export interface TBetHistoryDateRange {
  startTime: number;
  endTime: number;
}

/** 投注记录筛选状态 */
export interface TBetHistoryFilter {
  activeTab: import('./constants').EBetHistoryTab;
  dateRange: TBetHistoryDateRange | null;
}

/** 投注记录单条注单（展示层用） */
export interface TBetHistoryOrderOp {
  matchName: string;
  leagueName: string;
  selectionName: string;
  odds: number;
  handicap?: string;
  playTypeName: string;
  oddsType: number; // 1=欧洲盘 2=香港盘
  isInPlay: boolean;
  score?: string;
  liveTime?: string;
  outcome?: number;
}

export interface TBetHistoryOrder {
  id: string;
  seriesType: number; // 0=单关 1=串关
  status: number;
  isReservation: boolean;
  betAmount: number;
  returnAmount: number;
  maxWinAmount: number;
  createdTime: number;
  confirmedTime?: number;
  ops: TBetHistoryOrderOp[];
}
