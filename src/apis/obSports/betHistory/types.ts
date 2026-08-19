/**
 * OB（App 文案「EB」体育）投注记录接口原始类型
 * 对齐 Flutter lib/pages/mine/record/betting/sport/eb/ob/index.model.dart
 */

/** 注单子项（一场比赛的一个投注选项） */
export interface TObOrderDetail {
  /** 比赛ID */
  matchId: string;
  /** 联赛名称 */
  matchName: string;
  /** 对阵信息，形如 "队伍A v 队伍B" */
  matchInfo: string;
  /** 赛事类型，1 普通赛事，3 冠军 */
  matchType: number;
  /** 开赛时间，13位时间戳字符串 */
  beginTime: string;
  /** 冠军玩法的截止时间，13位时间戳字符串 */
  closingTime: string;
  /** 玩法名称 */
  playName: string;
  /** 玩法ID */
  playId: number;
  /** 投注项名称（非预约注单） */
  marketValue: string;
  /** 投注项名称（预约注单） */
  playOptionName?: string;
  /** 盘口ID */
  marketId: string;
  /** 投注项ID */
  playOptionsId: string;
  /** 盘口类型，EU 欧洲盘 / HK 香港盘 / MA 马来盘 / IN 印尼盘 */
  marketType: string;
  /** 最终赔率 */
  oddFinally: string;
  /** 子单结算结果，与 FB outcome 同一套编码 */
  betResult: number;
  /** 子单状态，0 为未结算 */
  betStatus: number;
  /** 结算比分，形如 "全场比分 1-0" */
  settleScore: string;
  /** 注时比分，形如 "0:0" */
  scoreBenchmark: string;
  /** 赛种ID */
  sportId: number;
  /** 赛种名称 */
  sportName: string;
  /** 联赛ID */
  tournamentId: string;
}

/** 注单记录（注单列表 / 预约注单列表共用结构） */
export interface TObOrderRecord {
  /** 订单号 */
  orderNo: string;
  /** 订单状态，0 投注成功，1 已结算，2 投注取消，3 确认中，4 投注失败 */
  orderStatus: string;
  /** 下单时间，13位时间戳字符串 */
  betTime: string;
  betTimeStr?: string;
  /** 盘口类型，EU 欧洲盘 / HK 香港盘 / MA 马来盘 / IN 印尼盘 */
  marketType: string;
  /** 本金 */
  orderAmountTotal: number;
  /** 最大可赢金额，欧盘不含本金 */
  maxWinAmount: number;
  /** 已结算盈亏 */
  profitAmount?: number;
  /** 退还金额 */
  backAmount?: number;
  /** 总单结算结果，与 FB outcome 同一套编码 */
  outcome?: number;
  /** 注单类型，'1'、'3' 为单关，其余为串关 */
  seriesType?: string;
  /** 串关 label，形如 "2串1" */
  seriesValue?: string;
  /** 串关子单数 */
  seriesSum?: number;
  /** 提前结算标记，1、2 表示已提前结算 */
  preSettle?: number;
  /** 提前结算金额 */
  preBetAmount?: number;
  /** 预约注单状态，0 预约中，1 预约成功，2 预约失败，3、4 取消 */
  preOrderStatus?: number;
  /** 注单子项 */
  detailList: TObOrderDetail[];
}

/** 提前结算报价（批量 getCashoutMaxAmountList / 单条 getCashoutMaxAmount 共用结构） */
export interface TObCashoutAmountItem {
  /** 订单号 */
  orderNo: string;
  /** 可提前结算的本金，OB 只支持全额结算，等于注单本金 */
  betAmount: number;
  /** 提前结算返还金额（含本金） */
  preSettleMaxWin: number;
  /** 提前结算系数 */
  csper?: number;
  /** 订单状态 */
  orderStatus?: number;
  /** 已提前结算金额 */
  preBetAmount?: number;
}

/** 提前结算单确认状态 */
export interface TObPreSettleConfirmItem {
  /** 订单号 */
  orderNo: string;
  /** 提前结算单状态，0 确认中，1 接单（成功），2 拒单（失败） */
  preSettleOrderStatus?: number;
  /** 拒单原因 */
  msg?: string;
}
