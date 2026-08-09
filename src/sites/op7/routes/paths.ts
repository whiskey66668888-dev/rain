/**
 * 站点路径常量（唯一的路径真相来源）
 *
 * - 路由配置（routes/config.tsx）和 navigate() 调用统一引用此处
 * - 不含语言前缀，useNavigateWithLanguage 会自动拼接 /{language}{path}
 * - 带动态参数的路径用 generatePath() 替换：
 *
 * @example
 * ```ts
 * import { generatePath } from 'react-router-dom';
 * import { PATHS } from '@/sites/op7/routes/paths';
 *
 * // 静态路径
 * navigate(PATHS.mineDeposit);               // → '/mine/deposit'
 *
 * // 动态参数
 * navigate(generatePath(PATHS.sportsDetail, { matchId: '123' }));  // → '/SportsDetailsPage/123'
 *
 * // 带 query string
 * navigate(PATHS.mineTransactionRecord + '?id=1');
 * ```
 */
export const PATHS = {
  // ── 一级页面（MainLayout 直接子路由）──
  // navigate(PATHS.home) → '/'；在 config.tsx 的 path 中使用时，
  // buildRouteObjects 会将其 strip 为空字符串并作为 index 路由处理
  home: '/',
  entertainment: '/entertainment/:pageType?/:id?',
  slotGame: '/slotGame',
  game: '/game',
  sports: '/sports',
  sportsDetail: '/SportsDetailsPage/:matchId',
  champion: '/Champion/:id',
  betting: '/betting',
  betHistoryH5: '/bet_history_h5',
  betHistoryH5ResultLeagueFilter: '/bet_history_h5/result-league-filter',
  betHistoryPc: '/bet_history_pc',
  result: '/result',
  sportsRulesPc: '/sports_rules_pc',
  bettingTutorialPc: '/betting_tutorial_pc',
  discountDetail: '/discountDetail/:id',
  PcDiscountDetail: '/pcDiscountDetail/:id',
  sponsorDetail: '/sponsorDetail/:id',
  PcSponsorDetail: '/pcSponsorDetail/:id',
  vipCenter: '/vip_center',
  virtualCoins: '/VituralCoins',
  system: '/system',
  onlineCustomerService: '/onlineCustomerService',
  login: '/login',
  register: '/register',

  // ── help_center ──
  helpCenter: '/help_center',
  helpCenterwithId: '/help_center/:id',
  helpCenterDetail: '/help_center/detail',
  helpCenterSearch: '/help_center/search',
  // ── all_betting_record ──
  allBettingRecord: '/all_betting_record',
  allBettingRecordDetail: '/all_betting_record/detail/:type',

  // ── promotion 子路由 ──
  promotion: '/promotion',
  promotionDiscount: '/promotion/discount',
  promotionSponsor: '/promotion/sponsor',
  promotionHotEvent: '/promotion/hotEventApp',
  hotEventApp: '/hotEventApp', // 兼容旧路径

  // 朋友圈路由
  moments: '/moments',
  promotionMomentsPublic: '/promotion/momentsPublic',
  promotionMomentsOfficial: '/promotion/momentsOfficial',

  // 素材库
  materialLibrary: '/material_library',
  // ── mine 子路由 ──
  mine: '/mine',
  mineH5: '/mine/mine_h5',
  mineProfile: '/mine/profile',
  mineSecurity: '/mine/security',
  mineSecurityPhone: '/mine/security_phone',
  mineWelfareCenter: '/mine/welfare_center',
  mineDeposit: '/mine/deposit',
  mineDepositPay: '/mine/deposit/pay',
  mineWithdrawal: '/mine/withdrawal',
  mineTransfer: '/mine/transfer',
  mineMemberTransfer: '/mine/memberTransfer',
  mineGameBalance: '/mine/gameBalance',
  mineTransactionRecord: '/mine/transaction_record',
  mineRealtimeRebate: '/mine/realtime_rebate',
  mineRealtimeRebateRecord: '/mine/realtime_rebate_record',
  minePartnership: '/mine/partnership',
  mineInviteFriends: '/mine/invite_friends',
  mineInviteFriendsInvite: '/mine/invite_friends/invite',
  mineInviteFriendsBonusReport: '/mine/invite_friends/bonus_report',
  mineInviteFriendsInvitationReport: '/mine/invite_friends/invitation_report',
  mineInviteFriendsRebateReport: '/mine/invite_friends/rebate_report',
  mineInviteFriendsHistoryReport: '/mine/invite_friends/history_report',
  systemSettings: '/mine/system_settings',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
