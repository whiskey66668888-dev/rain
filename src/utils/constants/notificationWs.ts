// //客户端连接错误事件类型,小于0的事件，客户端应不再进行轮训重连和心跳，这些事件都是连接异常拒绝连接事件
// GET_NODE_INFO_ERROR(-5,"获取连接节点信息失败,无法创建连接","T99",true),
// AUTHORIZATION_LOGIN_TIME_ERROR(-4,"解析令牌登录时间失败,连接被拒绝","T99",true),
// AUTHORIZATION_VERIFY_ERROR(-3,"令牌校验失败，连接被拒绝","T99",true),
// AUTHORIZATION_EMPTY(-2,"令牌为空,连接被拒绝","T99",true),
// AUTHORIZATION_INVALID(-1,"令牌已失效,请重新获取令牌","T99",true),

// //客户端连接成功，事件类型
// CREATE_CONNECTION(0,"创建连接成功","T99",true),
// PING_PONG(1,"心跳检测成功","T99",true),
// REFRESH_BROWSER(2,"刷新浏览器","T99",true),

// //业务事件类型
// //继续定义不同的业务类型，前3个不需要进行修改。
// //挤出登录成功
// SQUEEZE_OUT_LOGIN_SUCCESS(3,"挤出登录成功","T0",false),
// //变更为风险账号类型
// UPDATE_TO_RISK_MEMBER(4,"变更为风险账号类型","T0",true),
// //冻结账号
// FREEZE_ACCOUNT(5,"冻结账号","T0",false),
// //VIP等级升级成功
// VIP_UPDATE_SUCCESS(6,"VIP等级升级成功","T2",true),
// //VIP等级升级成功
// VIP_LEVEL_CHANGE(7,"VIP等级变更","T1",true),
// //场馆维护开启
// VENUE_MAINTENANCE_STAR(8,"场馆维护开启","T0",true),
// //场馆维护预告
// VENUE_MAINTENANCE_PREVIEW(9,"场馆维护预告","T2",true),
// //场馆维护结束
// VENUE_MAINTENANCE_END(10,"场馆维护结束","T1",true),

// //交易系统相关
// //充值提交成功
// RECHARGE_SUBMIT(11,"充值提交成功","T2",false),
// //充值已完成
// RECHARGE_SUCCESS(12,"充值已完成","T0",true),
// //充值已拒绝
// RECHARGE_REFUSED(13,"充值已拒绝","T1",true),
// //充值已取消
// RECHARGE_CANCELLED(14,"充值已取消","T1",false),
// //代理代存成功，代理后台触发
// AGENT_RECHARGE_SUCCESS(24,"代理代存成功","T1",true),

//  //充值提交成功，管理后台手工添加充值订单
// ARTIFICIAL_RECHARGE_SUBMIT(26,"手工存款单添加成功","T2",true),
// //提现提交成功
// WITHDRAWAL_SUBMIT(15,"提现提交成功","T2",false),
// //提现已完成
// WITHDRAWAL_SUCCESS(16,"提现已完成","T0",true),
// //提现被拒绝
// WITHDRAWAL_REFUSED(17,"提现被拒绝","T0",true),
// //提现已取消
// WITHDRAWAL_CANCELLED(18,"提现已取消","T0",false),
// //提现订单提交成功，管理后台手工添加取款订单
// ARTIFICIAL_WITHDRAWAL_SUBMIT(27,"手工取款单添加成功","T2",true),

// //红利相关业务
// //红利发放完成
// BONUS_DISTRIBUTE_SUCCESS(19,"红利发放完成","T0",true),
// //红利发放被拒绝
// BONUS_DISTRIBUTE_REFUSED(20,"红利发放被拒绝","T1",true),
// //代理礼金发放业务
// AGENT_BONUS_DISTRIBUTE_SUCCESS(25,"代理礼金发放完成","T1",true),
// //会员互转业务
// //会员互转被拒绝
// MEMBER_TRANSFER_REFUSED(21,"会员互转被拒绝","T1",true),

// //会员互转成功
// MEMBER_TRANSFER_SUCCESS(22,"会员互转成功","T1",true),

// //注单业务
// //体育注单赢，推送注单结果
// SPORT_WIN_ORDER_PUSH(23,"体育注单赢结果推送","T1",true),

// //体育注单取消,推送注单结果
// SPORT_CANCEL_ORDER_PUSH(28,"体育注单取消结果推送","T1",true),

export enum EMsgWeight {
  T0 = 'T0',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T99 = 'T99',
}

export const DURATION_MAP: Record<EMsgWeight, number> = {
  [EMsgWeight.T0]: 4 * 1000,
  [EMsgWeight.T1]: 3 * 1000,
  [EMsgWeight.T2]: 2.5 * 1000,
  [EMsgWeight.T3]: 2 * 1000,
  [EMsgWeight.T99]: 0,
};

export enum EBusinessType {
  /** 获取连接节点信息失败,无法创建连接 */
  GET_NODE_INFO_ERROR = -5,
  /** 解析令牌登录时间失败,连接被拒绝 */
  AUTHORIZATION_LOGIN_TIME_ERROR = -4,
  /** 令牌校验失败，连接被拒绝 */
  AUTHORIZATION_VERIFY_ERROR = -3,
  /** 令牌为空,连接被拒绝 */
  AUTHORIZATION_EMPTY = -2,
  /** 令牌已失效,请重新获取令牌 */
  AUTHORIZATION_INVALID = -1,
  /** 创建连接成功 */
  CREATE_CONNECTION = 0,
  /** 心跳检测成功 */
  PING_PONG = 1,
  /** 刷新浏览器 */
  REFRESH_BROWSER = 2,
  /** 挤出登录成功 */
  SQUEEZE_OUT_LOGIN_SUCCESS = 3,
  /** 变更为风险账号类型 */
  UPDATE_TO_RISK_MEMBER = 4,
  /** 冻结账号 */
  FREEZE_ACCOUNT = 5,
  /** VIP等级升级成功 */
  VIP_UPDATE_SUCCESS = 6,
  /** VIP等级变更 */
  VIP_LEVEL_CHANGE = 7,
  /** 场馆维护开启 */
  VENUE_MAINTENANCE_STAR = 8,
  /** 场馆维护预告 */
  VENUE_MAINTENANCE_PREVIEW = 9,
  /** 场馆维护结束 */
  VENUE_MAINTENANCE_END = 10,
  /** 充值提交成功 */
  RECHARGE_SUBMIT = 11,
  /** 充值已完成 */
  RECHARGE_SUCCESS = 12,
  /** 充值已拒绝 */
  RECHARGE_REFUSED = 13,
  /** 充值已取消 */
  RECHARGE_CANCELLED = 14,
  /** 提现提交成功 */
  WITHDRAWAL_SUBMIT = 15,
  /** 提现已完成 */
  WITHDRAWAL_SUCCESS = 16,
  /** 提现被拒绝 */
  WITHDRAWAL_REFUSED = 17,
  /** 提现已取消 */
  WITHDRAWAL_CANCELLED = 18,
  /** 红利发放完成 */
  BONUS_DISTRIBUTE_SUCCESS = 19,
  /** 红利发放被拒绝 */
  BONUS_DISTRIBUTE_REFUSED = 20,
  /** 会员互转被拒绝 */
  MEMBER_TRANSFER_REFUSED = 21,
  /** 会员互转成功 */
  MEMBER_TRANSFER_SUCCESS = 22,
  /** 体育注单赢结果推送 */
  SPORT_WIN_ORDER_PUSH = 23,
  /** 代理代存成功 */
  AGENT_RECHARGE_SUCCESS = 24,
  /** 代理礼金发放完成 */
  AGENT_BONUS_DISTRIBUTE_SUCCESS = 25,
  /** 手工存款单添加成功 */
  ARTIFICIAL_RECHARGE_SUBMIT = 26,
  /** 手工取款单添加成功 */
  ARTIFICIAL_WITHDRAWAL_SUBMIT = 27,
  /** 体育注单取消结果推送 */
  SPORT_CANCEL_ORDER_PUSH = 28,
}

export const MAX_RETRY_PER_URL = 3;

/** 权重优先级表，数字越小优先级越高 */
export const WEIGHT_MAP: Record<EMsgWeight, number> = {
  [EMsgWeight.T0]: 0,
  [EMsgWeight.T1]: 1,
  [EMsgWeight.T2]: 2,
  [EMsgWeight.T3]: 3,
  [EMsgWeight.T99]: 99,
};
