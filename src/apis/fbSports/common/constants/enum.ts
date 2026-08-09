/** 赔率类型，see enum: odds_format_type_enum */
export enum EFbOddsFormatType {
  /** 欧盘 */
  Europe = 1,
  /** 香港盘 */
  HongKong = 2,
  /** 马来盘 */
  Malay = 3,
  /** 印尼盘 */
  Indonesia = 4,
  /** 美盘 */
  American = 5,
}

/** 投注结果，see enum: outcome */
export enum EFbOutcome {
  /** 无结果 */
  NoResulted = 0,
  /** 和 */
  Return = 2,
  /** 输 */
  Lost = 3,
  /** 赢 */
  Won = 4,
  /** 赢半 */
  WinReturn = 5,
  /** 输半 */
  LooseReturn = 6,
  /** 取消 */
  Cancel = 7,
}

/** 是否支持串关，0 不支持，1 支持，see enum: all_up_enum */
export enum EFbAllUpEnum {
  /** 不支持 */
  No = 0,
  /** 支持 */
  Yes = 1,
}

/** 玩法销售状态，0暂停，1开售，-1未开售（未开售状态一般是不展示的），see enum: market_curt_sale_status_enum */
export enum EFbMarketCurtSaleStatusEnum {
  /** 暂停 */
  Suspended = 0,
  /** 开售 */
  Active = 1,
  /** 未开售 */
  Closed = -1,
}

/** 是否为滚球 1滚球 0非滚球，see enum: in_play_enum */
export enum EFbInPlayEnum {
  /** 非滚球 */
  No = 0,
  /** 滚球 */
  Yes = 1,
}

/** 是否接受赔率变更，see enum: odds_change_enum */
export enum EFbOddsChangeEnum {
  /** 不接受赔率变动 */
  No = 0,
  /** 接受最优赔率变动 */
  Better = 1,
  /** 接受任意赔率变动 */
  Any = 2,
}

/** 订单状态，see enum: order_status */
export enum EFbOrderStatus {
  /** 未确认 */
  Created = 0,
  /** 确认中 */
  Confirming = 1,
  /** 已拒单 */
  Rejected = 2,
  /** 已取消 */
  Canceled = 3,
  /** 已接单 */
  Confirmed = 4,
  /** 已结算 */
  Settled = 5,
}

/** 拒单原因码，see enum: order_reject_type */
export enum EFbOrderRejectType {
  /** 系统异常 */
  SystemError = 1,
  /** 参数错误拒单 */
  ParamError = 2,
  /** 风控限制拒单 */
  PositionLimit = 3,
  /** 玩法暂停拒单 */
  MarketSuspend = 4,
  /** 操盘手拒单 */
  TraderReject = 5,
  /** 支付失败 */
  FailPaid = 6,
  /** 结算时订单未确认拒单 */
  SettleRefused = 7,
  /** 赔率变更 */
  OddsChange = 8,
}

/** 时间范围类型：1 下单时间；2 结算时间，see enum: order_query_time_type */
export enum EFbOrderQueryTimeType {
  /** 下单时间 */
  CreateTime = 1,
  /** 结算时间 */
  SettleTime = 2,
}

/** 赛事类型，see enum: match_type */
export enum EFbMatchType {
  /** 冠军 */
  Outright = 1,
  /** 常规体育 */
  Match = 2,
  /** 电竞 */
  ESport = 3,
  /** 虚拟体育 */
  Virtual = 4,
  /** 电竞冠军 */
  ESOutright = 5,
}

/** 赛事状态，see enum: match_status */
export enum EFbMatchStatus {
  /** 已结束 */
  Ended = 0,
  /** 推迟(推迟时间较长，比赛通常会取消) */
  Postponed = 1,
  /** 中断 */
  Interrupted = 2,
  /** 取消 */
  Cancelled = 3,
  /** 未开赛(Upcoming) */
  NotStarted = 4,
  /** 进行中 */
  Live = 5,
  /** 推迟(推迟时间较短，比赛通常会正常进行) */
  Delayed = 6,
  /** 废弃 */
  Abandoned = 7,
  /** 暂停 */
  Suspended = 8,
}

/** 走表时间展示精度，see enum: match_clock_time_display_accuracy */
export enum EFbMatchClockTimeDisplayAccuracy {
  /** 秒 */
  Seconds = 1,
  /** 分钟 */
  Minutes = 2,
}

/** 走表类型，see enum: clock_type */
export enum EFbClockType {
  /** 正序 */
  Asc = 1,
  /** 倒序 */
  Desc = 2,
}

/** 注单类型，see enum: series_type */
export enum EFbSeriesType {
  /** 单注 */
  Single = 0,
  /** 串关 */
  Parlay = 1,
}

/** 提前结算订单状态，see enum: cash_out_order_status */
export enum EFbCashOutOrderStatus {
  /** 创建成功 */
  Created = 0,
  /** 接单确认中 */
  Confirming = 1,
  /** 拒单 */
  Refused = 2,
  /** 取消 */
  Canceled = 3,
  /** 接单成功 */
  Confirmed = 4,
  /** 结算 */
  Settled = 5,
}

/** 提前结算报价状态，see enum: ask_cash_out_status */
export enum EFbAskEarlySettleStatus {
  /** 订单创建 */
  Created = 0,
  /** 订单确认中 */
  Confirming = 1,
  /** 订单拒绝 */
  Rejected = 2,
  /** 订单取消 */
  Canceled = 3,
  /** 订单已接单 */
  Confirmed = 4,
  /** 订单已结算 */
  Settled = 5,
  /** 预约提前结算中 */
  ReserveCashOut = 101,
  /** 提前结算进行中 */
  CashOut = 102,
}

/** 通用开关状态，see enum: common_status_enum */
export enum EFbCommonStatus {
  /** 禁用 */
  Disabled = 0,
  /** 启用 */
  Enabled = 1,
}

/** 延迟事件类型，see enum: pending_type */
export enum EFbPendingType {
  /** 阶段变更 */
  MatchPeriodChange = 1,
  /** 危险进攻 */
  DangerAttack = 2,
  /** VAR重播 */
  VAR = 3,
  /** 其他事件 */
  Others = 4,
  /** 点球 */
  Penalty = 5,
  /** 罚牌 */
  Cards = 6,
  /** 比分变化事件 */
  Score = 7,
}

/** 优惠结果，see enum: promotion_bet_result_enum */
export enum EFbPromotionBetResult {
  /** 未触发 */
  NotTriggered = 0,
  /** 已触发 */
  Triggered = 1,
}

/** 预约订单状态，see enum: reserve_order_status */
export enum EFbReserveOrderStatus {
  /** 预约中（预约单已生成，等待实际订单生成） */
  Valid = 0,
  /** 预约成功（实际订单已生成） */
  Successful = 1,
  /** 预约失败（实际订单生成失败） */
  Failed = 2,
  /** 已取消（预约单已撤销） */
  Cancelled = 3,
  /** 确认中（预约单等待确认） */
  Confirming = 4,
}

/** 预约支付信息，see enum: reserve_pay_enum */
export enum EFbReservePayEnum {
  /** 未扣款 */
  NoPay = 1,
  /** 已扣款 */
  Pay = 2,
}

/** 预约订单失效原因码，see enum: reserve_order_fail_code_enum */
export enum EFbReserveOrderFailCode {
  /** 用户取消 */
  UserCancel = 1,
  /** 预约功能关闭 */
  ReserveClosed = 2,
  /** 扣款失败 */
  FailPaid = 3,
  /** 玩法已结算 */
  MarketSettle = 4,
  /** 投注额超限 */
  StakeLimit = 5,
  /** 账户异常 */
  AccountError = 6,
  /** 参数错误 */
  ParamError = 7,
  /** 比分变化 */
  ScoreChanged = 8,
}
