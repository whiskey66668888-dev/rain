/* 
  盘口类型，今日，早盘，滚球，冠军，string，值分别为，1：滚球，2：即将开赛，3：今日赛事，4：早盘，11：串
  */
export enum PlayType {
  Living = 'living', // 滚球
  // Coming = 'coming', // 即将开赛
  Today = 'today', // 今日
  Early = 'early', // 早盘
  // Series = 'series', // 串关
  Follow = 'follow', // 关注
  Champion = 'champion', // 冠军
}

export enum PlayTypeId {
  Living = 1, // 滚球
  // Coming = 'coming', // 即将开赛
  Today = 3, // 今日
  Early = 4, // 早盘
  Follow = -1, // 关注
  Champion = 7, // 冠军
}

// 热门赛种id
export const HotSportId = -2 as const;
// 竞彩赛种id
export const LotterySportId = -3 as const;

export enum BasicMultiple {
  // 倍数基准值
  ObOdds = 100000,
  ObMoney = 100,
}

/* 
  三方体育场馆
  */
export enum Venues {
  Ob = 'ob', // ob
  Fb = 'fb', // fb
}

/* 
  最高，最低投注
  */
export enum BetLimit {
  Min = 10, // 最低
  Max = 20000, // 最高
}

/* 
  投注模式，单个单关，串关，多单关
  */
export enum BetTypes {
  Single = 1, // 单关
  Series = 2, // 串关
  MuchSingle = 3, // 多单关
}

/* 
  赔率类型
  */
export enum Hsw {
  Eu = 1, // 欧洲盘
  Hk = 2, // 香港
  Ma = 3, // 马来
  En = 4, // 英式
  Usa = 5, // 美式
  In = 6, // 印尼
}

/* 
  投注项状态,单关时在投注项数据里，串关时在seriesItems，对应字段betItemStatus
  */
export enum BetItemStatus {
  Initial = 7, // 正常状态
  BetConfirming = 2, //注单确认中
  BetConfirmed = 1, //注单已确认
  ItemClosed = 4, // 关盘

  MinTip = 5, // 最低投注额
  MaxTip = 6, // 最高投注额
  // LessAmount = 6, // 余额不足
  // ApiError = 9, // 接口投注不成功状态
  ApartSucces = 10, // 串关部分注单成功

  Fail = 0, // 投注失败
}
export const BetItemTipsStatus = {
  Initial: 1, // 正常状态

  MinTip: 2, // 最低投注额
  MaxTip: 3, // 最高投注额
  LessAmount: 4, // 余额不足
};

/* 
  串关项状态
  */
export enum SeriesItemStatus {
  Nomal = 1, // 正常状态
  Disabled = 2, // 有投注项关盘状态，则串关投注时，串关子项不可投
}

/* 
  是否支持串关
  */
export enum SupportSeries {
  Yes = 1, // 支持
  No = 0, // 不支持
}

/**
 *  接受赔率更改偏好
 */
export enum EAcceptOddsPrefer {
  No = 0, // 不接受
  Better = 1, // 接受更高赔率
  Any = 2, // 接受任何赔率
}

export const ACCEPT_ODDS_PREFER_VALUE_MAP = {
  [EAcceptOddsPrefer.No]: '不自动接受任何变动',
  [EAcceptOddsPrefer.Better]: '自动接受更高赔率(预设)',
  [EAcceptOddsPrefer.Any]: '自动接受最新赔率(最优，推荐)',
};

/* 
  赔率变化
  */
export enum OddChange {
  NoChange = 1, // 未变化
  Smaller = 2, // 变小
  Larger = 3, // 变大
}
/* 
  单关串关投注弹窗状态枚举
  */
export enum BetStatus {
  Initial = 1, // 初始状态
  // CanBet = 1, // 可投注
  BetConfirming = 2, //注单确认中
  BetConfirmed = 3, //注单已确认

  BetApiOver = 12, // 投注接口成功响应
  MinTip = 4, // 最低投注额提示语
  MaxTip = 5, // 最高投注额提示语
  LessAmount = 6, // 余额不足提示语
  OddChange = 7, // 赔率变化时显示赔率已更改
  ItemClosed = 8, // 盘口关闭
  ApiError = 9, // 接口投注不成功状态
  ApartSucces = 10, // 串关部分注单成功
  Fail = 11, // 投注失败
}
/* 
    已经调用投注接口的弹窗状态
    */
export const hadBetLists = [
  BetItemStatus.BetConfirming,
  BetItemStatus.ApartSucces,
  BetItemStatus.BetConfirmed,
  BetItemStatus.Fail,
];

/* 
  注单状态枚举，串关时指单个串关状态
  */
export enum OrderStatus {
  Initial = 3, // 未投注
  Fail = 0, // 失败
  success = 1, // 投注成功
  comfirming = 2, // 确认中
}

/* 
  预约注单状态枚举
  */
export enum PreOrderStatus {
  Fail = 2, // 失败
  success = 1, // 预约成功
  comfirming = 0, // 确认中
}

export enum SeriesKeys {
  twoAnd1 = 2001, // 2串1
  threeAnd1 = 3001, // 3串1
  threeAndAll = 3004, // 3串4
  fourAnd1 = 4001, //4串1
  fourAndAll = 40011, //4串11
  fiveAnd1 = 5001, //5串1
  fiveAndAll = 50026, //5串26

  sixAnd1 = 6001, // 6串1
  sixAndAll = 60057, // 6串57

  sevenAnd1 = 7001, // 7串1
  sevenAndAll = 700120, // 7串120

  eightAnd1 = 8001, // 8串1
  eightAndAll = 800247, // 8串247

  nineAnd1 = 9001, // 9串1
  nineAndAll = 900502, // 9串502

  tenAnd1 = 10001, // 10串1
  tenAndAll = 1001013, // 10串1013
}
export enum SeriesNames {
  twoAnd1 = '2串1', // 2串1
  threeAnd1 = '3串1', // 3串1
  threeAndAll = '3串4', // 3串4

  fourAnd1 = '4串1',
  fourAndAll = '4串11', //4串11

  fiveAnd1 = '5串1',
  fiveAndAll = '5串26', //5串26

  sixAnd1 = '6串1',
  sixAndAll = '6串57', // 6串57

  sevenAnd1 = '7串1',
  sevenAndAll = '7串120', // 7串120

  eightAnd1 = '8串1',
  eightAndAll = '8串247', // 8串247

  nineAnd1 = '9串1',
  nineAndAll = '9串502', // 9串502

  tenAnd1 = '10串1',
  tenAndAll = '10串1013', // 10串1013
}

//排序方式 时间 ｜ 联赛
export enum TimeLeagueToggle {
  Time = 'time',
  League = 'league',
}
//展示方式 专业版 ｜ 比分版
export enum ViewModeToggle {
  Pro = 'pro',
  Score = 'score',
}

/**
 * 统一的赛种id映射，方便通过id获取对应的图片和国际化文字，但是不用于参数传递
 */
export enum SportIdForView {
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
  Racing = 94, // 赛车
  Fight = 18, // 综合格斗
  F1Car = 92, // F1赛车
  Lottery = LotterySportId, // 竞彩
}

export enum EVenue {
  OB = 'ob',
  FB = 'fb',
}

/**
 * 场馆在平台钱包体系里的 gameId（对齐 Flutter GameId）。
 * 一键转入 / 场馆锁定检查等钱包接口都按它区分场馆。
 */
export const VENUE_GAME_ID: Record<EVenue, number> = {
  [EVenue.FB]: 89,
  [EVenue.OB]: 79,
};

/**
 * 盘口类型（赔率盘口），取值与 OB 注单下发的 `marketType` 一致。
 *
 * 只区分欧洲盘 / 香港盘：**除香港盘外一律按欧洲盘处理**。
 * 三方站点可能下出马来 / 印尼 / 美盘的注单，我们没有换算公式，
 * 统一当欧洲盘展示（赔率本来就存欧赔），保证文案与数字自洽。
 */
export enum EOddsType {
  /** 欧洲盘 */
  EU = 'EU',
  /** 香港盘 */
  HK = 'HK',
}

/** 盘口类型文案 */
export const ODDS_TYPE_LABEL: Record<EOddsType, string> = {
  [EOddsType.EU]: '欧洲盘',
  [EOddsType.HK]: '香港盘',
};

/** 盘口类型 → 后端 `bettingOddsSettings` 取值 */
export const ODDS_TYPE_TO_BETTING_ODDS_SETTINGS: Record<EOddsType, number> = {
  [EOddsType.EU]: 1,
  [EOddsType.HK]: 2,
};

/** 后端 `bettingOddsSettings` 取值 → 盘口类型 */
export const BETTING_ODDS_SETTINGS_TO_ODDS_TYPE: Record<number, EOddsType> = {
  1: EOddsType.EU,
  2: EOddsType.HK,
};

// 投注类型，单关 or 串关
export enum EBetType {
  Single = 'single',
  Parlay = 'parlay',
}

// 投注进度
export enum EBetStep {
  /** 普通状态，未点确认投注 */
  Normal = 1,
  /** 点确认投注后，发起请求 */
  Fetching = 2,
  /** 请求成功后，轮询注单状态 */
  Polling = 3,
  /** 所有注单状态确认完成 */
  Confirmed = 4,
}

export enum EOddsChange {
  Up = 'odds-up',
  Down = 'odds-down',
  None = 'odds-none',
}

/**
 *  投注项状态 开盘=1，封盘/锁盘=2，关盘=4
 * @ob 投注项状态 1：开盘，2：封盘(对应os),如果赛事状态为结束，那就认为是关盘，赛事结束状态 0：未结束，1：结束(对应mo)
 * @fb 玩法销售状态，0暂停，1开售，-1未开售（未开售状态一般是不展示的） , see enum: market_curt_sale_status_enum
 */
export enum EOddsStatus {
  Open = 1,
  Suspended = 2,
  Closed = 4,
}

/**
 * 订单状态
 * @ob 订单状态
 * @fb 订单状态 0: Created，未确认，1: Confirming，确认中，2: Rejected，已拒单，3: Canceled，已取消，4: Confirmed，已接单，5: Settled，已结算
 * @custom 订单状态 1: 投注成功,, 3: 确认中,, 4: 投注失败
 */
export enum EBetOrderStatus {
  Success = 1, // 投注成功
  Confirming = 3, // 确认中
  Fail = 4, // 投注失败
}

/**
 * 注单结算结果（子单 & 单关总单直接来自接口 sr 字段；串关总单由 sa/sat 派生）
 * @fb ops[0].sr see enum: outcome
 */
export enum EBetSettleResult {
  /** 未结算 */
  NoResulted = 0, // 未结算
  /** 走水/和 */
  Return = 2, // 走水/和
  /** 全输 */
  Lost = 3, // 全输
  /** 全赢 */
  Won = 4, // 全赢
  /** 赢半 */
  WinReturn = 5, // 赢半
  /** 输半 */
  LooseReturn = 6, // 输半
  /** 取消 */
  Cancel = 7, // 取消
  /** 投注失败 */
  BetFail = 8, // 投注失败
  /** 提前结算 */
  EarlySettled = 9,
}

/**
 * 消息状态
 * @custom 消息状态 0: 未读, 1: 已读
 */
export enum EMessageStatus {
  Unread = '0', // 未读
  Read = '1', // 已读
}

/**
 * 消息分类
 */
export enum EMessageCategory {
  /** 充值 */
  DEPOSIT = 'DEPOSIT',
  /** 提现 */
  WITHDRAW = 'WITHDRAW',
  /** 优惠 */
  DISCOUNT = 'DISCOUNT',
  /** 结算 */
  JIESUAN = 'JIESUAN',
  /** 账号 */
  ACCOUNT = 'ACCOUNT',
  /** 风控 */
  RISK = 'RISK',
  /** 投诉 */
  COMPLAIN = 'COMPLAIN',
  /** 建议 */
  SUGGEST = 'SUGGEST',
  /** 爱情 */
  LOVE = 'LOVE',
  /** 联系 */
  LINE = 'LINE',
  /** 通知 */
  NOTICE = 'NOTICE',
}

export const messageCategoryMap: Record<
  EMessageCategory,
  { text: string; textColor: string; bgColor: string }
> = {
  [EMessageCategory.DEPOSIT]: {
    text: '充值',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.WITHDRAW]: {
    text: '提现',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.DISCOUNT]: {
    text: '优惠',
    textColor: 'text-[var(--Green-400)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.JIESUAN]: {
    text: '结算',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.ACCOUNT]: {
    text: '账号',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.RISK]: {
    text: '风控',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.COMPLAIN]: {
    text: '投诉',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.SUGGEST]: {
    text: '建议',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.LOVE]: {
    text: '爱情',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.LINE]: {
    text: '联系',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
  [EMessageCategory.NOTICE]: {
    text: '通知',
    textColor: 'text-[var(--ThemeColor-Main)]',
    bgColor: 'bg-[var(--ThemeColor-15)]',
  },
};

export const messageCategoryList = [
  EMessageCategory.DEPOSIT,
  EMessageCategory.WITHDRAW,
  EMessageCategory.DISCOUNT,
  EMessageCategory.JIESUAN,
  EMessageCategory.ACCOUNT,
  EMessageCategory.RISK,
  EMessageCategory.COMPLAIN,
  EMessageCategory.SUGGEST,
  EMessageCategory.LOVE,
  EMessageCategory.LINE,
  EMessageCategory.NOTICE,
];

export enum ETransRecordType {
  /** 充值 */
  Deposit = 'deposit',
  /** 提现 */
  Withdraw = 'withdraw',
  /** 互转 */
  MemberTransferWithdraw = 'memberTransferWithdraw',
  /** 转账 */
  Transfer = 'transfer',
  /** 红利 */
  Bonus = 'bonus',
}

export const transRecordTypeMap: Record<ETransRecordType, string> = {
  [ETransRecordType.Deposit]: '充值',
  [ETransRecordType.Withdraw]: '提现',
  [ETransRecordType.MemberTransferWithdraw]: '互转',
  [ETransRecordType.Transfer]: '转账',
  [ETransRecordType.Bonus]: '红利',
};

export const transRecordTypeList = [
  ETransRecordType.Deposit,
  ETransRecordType.Withdraw,
  ETransRecordType.MemberTransferWithdraw,
  ETransRecordType.Transfer,
  ETransRecordType.Bonus,
];

export enum TradeMainStatus {
  /** 处理中 */
  PROCESSING = 'PROCESSING',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已拒绝 */
  REJECTED = 'REJECTED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
}
export enum EDepositStatusId {
  /** 审核失败 */
  AuditFailed = -2,
  /** 充值失败 */
  Failed = -1,
  /** 充值超时 */
  Timeout = 4,
  /** 充值确认中 */
  Confirming = 0,
  /** 充值确认中 */
  Confirming1 = 1,
  /** 充值成功 */
  Success = 2,
  /** 充值成功 */
  Success1 = 9,
}

export const depositStatusMap: Record<EDepositStatusId, string> = {
  [EDepositStatusId.AuditFailed]: '审核失败',
  [EDepositStatusId.Failed]: '充值失败',
  [EDepositStatusId.Timeout]: '充值超时',
  [EDepositStatusId.Confirming]: '充值确认中',
  [EDepositStatusId.Confirming1]: '充值确认中',
  [EDepositStatusId.Success]: '充值成功',
  [EDepositStatusId.Success1]: '充值成功',
};

export enum EWithdrawStatusId {
  /** 确认拒绝 */
  Rejected = -2,
  /** 审核失败 */
  AuditFailed = -1,
  /** 待审核 */
  Pending = 0,
  /** 待确认 */
  Confirming = 1,
  /** 完成 */
  Completed = 9,
}

// 投注记录 Tab
export enum EBetHistoryTab {
  /** 未结算 */
  UNSETTLED = 'unsettled',
  /** 已结算 */
  SETTLED = 'settled',
  /** 预约投注 */
  RESERVE = 'reserve',
  /** 赛果 */
  RESULTS = 'results',
}

// 投注记录查询类型
export enum EBetHistoryQueryType {
  /** 未结算 */
  UNSETTLED = 10,
  /** 未结算中的！ 冠军赛事 */
  UNSETTLED_CHAMPION = 11,
  /** 未结算中的！ 提前结算 */
  UNSETTLED_EARLY_SETTLEMENT = 12,

  /** 预约中 */
  RESERVE_IN_PROGRESS = 20,
  /** 预约失效 */
  RESERVE_FAIL = 21,

  /** 已结算 */
  SETTLED = 30,
  /** 已结算中的！ 冠军投注 */
  SETTLED_CHAMPION = 31,
  /** 已结算中的！ 提前结算注单 */
  SETTLED_EARLY_SETTLEMENT = 32,

  /** 赛果 */
  RESULTS = 60,
}

// 左侧面板展示内容
export enum ESportsLeftPanelType {
  /** 菜单 */
  MENU = 'menu',
  /** 订单车 */
  ORDER_CART = 'order-cart',
  /** 投注记录 */
  BET_HISTORY = 'bet-history',
}
