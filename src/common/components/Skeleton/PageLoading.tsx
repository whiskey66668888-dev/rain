import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import SportsPageSkeleton from './SportsPageSkeleton';
import HomePageSkeleton from './HomePageSkeleton';
import SportsBettingSkeleton from './SportsBettingSkeleton';
import DepositPageSkeleton from './Deposit/DepositPageSkeleton';
import WithdrawalPageSkeleton from './Withdrawal/WithdrawalPageSkeleton';
import SecurityCenterSkeleton from './mine/SecurityCenterSkeleton';
import TransferPageSkeleton from './Transfer/TransferPageSkeleton';
import MemberTransferPageSkeleton from './MemberTransfer/MemberTransferPageSkeleton';
import DiscountPageSkeleton from './promotion/DiscountPageSkeleton';
import SlotPageSkeleton from './SlotPageSkeleton';
import VipPageSkeleton from './Vip/VipPageSkeleton';
import HotEventPageSkeleton from './promotion/HotEventPageSkeleton';
import TransactionRecordPageSkeleton from './mine/TransactionRecordPageSkeleton';
import AllBettingRecordPageSkeleton from './AllBettingRecordPageSkeleton';
import PartnershipPageSkeleton from './mine/PartnershipPageSkeleton';
import MinePageH5Skeleton from './mine/MinePageH5Skeleton';
import ProfilePageSkeleton from './mine/ProfilePageSkeleton';
import WelfareCenterSkeleton from './mine/WelfareCenterSkeleton';
import RealtimeRebateSkeleton from './mine/RealtimeRebateSkeleton';
import RealtimeRebateRecordSkeleton from './mine/RealtimeRebateRecordSkeleton';
import InviteFriendsSkeleton from './mine/InviteFriendsSkeleton';
import SystemSettingsPageSkeleton from './mine/SystemSettingsPageSkeleton';
import HelpCenterPageSkeleton from './HelpCenterPageSkeleton';
import HelpCenterSearchPageSkeleton from './HelpCenterSearchPageSkeleton';
import PcResultPageSkeleton from './PcResultPageSkeleton';
import InviteFriendsInvitationReportSkeleton from './InviteFriendsInvitationReportSkeleton';
import InviteFriendsHistoryReportSkeleton from './InviteFriendsHistoryReportSkeleton';
import { PATHS } from '@/sites/op7/routes/paths';
import SportsChampionSkeleton from './SportsChampionSkeleton';
import ResultLeagueFilterPageSkeleton from './ResultLeagueFilterPageSkeleton';

const delayTime = 100;

const normalizeSkeletonPath = (path: string): string => {
  const withoutHash = path.split('#')[0] || '/';
  const withoutLocale = withoutHash.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, '');
  if (!withoutLocale || withoutLocale === '') return '/';
  return withoutLocale.length > 1 ? withoutLocale.replace(/\/$/, '') : withoutLocale;
};

// null 表示该页由组件内部自行管理骨架屏，Suspense fallback 期间不渲染，避免与组件级骨架双重出现
const skeletonMap: Record<string, (() => React.ReactElement) | null> = {
  [PATHS.home]: null, // 落地页保持同步加载，不走页面级骨架
  [PATHS.entertainment]: () => <HomePageSkeleton />, // 娱乐首页
  '/entertainment': () => <HomePageSkeleton />, // 娱乐首页（无 slot 时的实际路径）
  [PATHS.sports]: () => <SportsPageSkeleton />, // 体育首页
  [PATHS.sportsDetail]: null, // 体育详情：由 SportDetail 组件内 showSkeleton 统一管理
  [PATHS.champion]: () => <SportsChampionSkeleton />, // 冠军
  [PATHS.betHistoryH5]: () => <SportsBettingSkeleton />, // 注单
  [PATHS.betHistoryPc]: () => <SportsBettingSkeleton />, // PC 注单
  [PATHS.betHistoryH5ResultLeagueFilter]: () => <ResultLeagueFilterPageSkeleton />, // H5 赛果联赛筛选
  [PATHS.mineDeposit]: () => <DepositPageSkeleton />, // 充值
  [PATHS.mineWithdrawal]: () => <WithdrawalPageSkeleton />, // 提现
  [PATHS.mineGameBalance]: () => <TransferPageSkeleton />, // 游戏钱包
  [PATHS.mineTransfer]: () => <TransferPageSkeleton />, // 转账
  [PATHS.mineMemberTransfer]: () => <MemberTransferPageSkeleton />, // 会员互转
  [PATHS.mine]: () => <SecurityCenterSkeleton />, // 我的
  [PATHS.mineSecurity]: () => <SecurityCenterSkeleton />, // 安全中心
  [PATHS.mineSecurityPhone]: () => <SecurityCenterSkeleton />, // 安全手机号
  [PATHS.promotion]: () => <DiscountPageSkeleton showSubTabs={false} />,
  [PATHS.promotionDiscount]: () => <DiscountPageSkeleton showSubTabs={true} />,
  [PATHS.promotionSponsor]: () => <DiscountPageSkeleton showSubTabs={false} />,
  [PATHS.promotionHotEvent]: () => <HotEventPageSkeleton />,
  [PATHS.promotionMomentsPublic]: null,
  [PATHS.promotionMomentsOfficial]: null,
  [PATHS.hotEventApp]: () => <HotEventPageSkeleton />, // 兼容旧路径
  [PATHS.vipCenter]: () => <VipPageSkeleton />,
  [PATHS.slotGame]: () => <SlotPageSkeleton />,
  [PATHS.mineH5]: () => <MinePageH5Skeleton />, // 我的（H5）
  // [PATHS.mineH5]: () => <SecurityCenterSkeleton />, // 我的（H5）
  [PATHS.mineProfile]: () => <ProfilePageSkeleton />, // 个人资料
  [PATHS.mineTransactionRecord]: () => <TransactionRecordPageSkeleton />, // 交易记录
  [PATHS.allBettingRecord]: () => <AllBettingRecordPageSkeleton />, // 投注记录
  [PATHS.allBettingRecordDetail]: () => <AllBettingRecordPageSkeleton />, // 投注记录详情页
  [PATHS.minePartnership]: () => <PartnershipPageSkeleton />, // 合营计划
  [PATHS.mineWelfareCenter]: () => <WelfareCenterSkeleton />, // 福利中心
  [PATHS.mineRealtimeRebate]: () => <RealtimeRebateSkeleton />, // 实时返水
  [PATHS.mineRealtimeRebateRecord]: () => <RealtimeRebateRecordSkeleton />, // 实时返水
  [PATHS.systemSettings]: () => <SystemSettingsPageSkeleton />, // 系统设置
  [PATHS.helpCenter]: () => <HelpCenterPageSkeleton />, // 帮助中心
  [PATHS.helpCenterSearch]: () => <HelpCenterSearchPageSkeleton />, // 帮助中心搜索
  [PATHS.mineInviteFriends]: () => <InviteFriendsSkeleton />, // 呼朋唤友
  '/mine/invite_friends/': () => <InviteFriendsSkeleton />, // 呼朋唤友
  '/mine/invite_friends/invite': () => <InviteFriendsSkeleton />, // 呼朋唤友-邀请好友
  '/mine/invite_friends/rebate_report': () => <InviteFriendsSkeleton />, // 呼朋唤友-返水报表
  '/mine/invite_friends/bonus_report': () => <InviteFriendsSkeleton />, // 呼朋唤友-奖金报表
  '/mine/invite_friends/invitation_report': () => <InviteFriendsInvitationReportSkeleton />, // 呼朋唤友-邀请总人数
  '/mine/invite_friends/history_report': () => <InviteFriendsHistoryReportSkeleton />, // 呼朋唤友-直升历史
  [PATHS.result]: () => <PcResultPageSkeleton />, // 赛果页面
  [PATHS.sportsRulesPc]: () => <PcResultPageSkeleton />, // 投注规则独立页
  [PATHS.bettingTutorialPc]: () => <PcResultPageSkeleton />, // 盘口教程独立页
};

const resolveSkeleton = (
  currentPath: string,
  routePath: string,
): (() => React.ReactElement) | null | undefined => {
  if (currentPath in skeletonMap) return skeletonMap[currentPath];
  if (routePath in skeletonMap) return skeletonMap[routePath];

  // `/entertainment/home` 这类动态段：命中最长静态前缀
  let bestKey: string | undefined;
  for (const key of Object.keys(skeletonMap)) {
    if (key === '/' || key.includes(':')) continue;
    if (currentPath === key || currentPath.startsWith(`${key}/`)) {
      if (!bestKey || key.length > bestKey.length) bestKey = key;
    }
  }
  return bestKey ? skeletonMap[bestKey] : undefined;
};

const shouldShowSkeletonImmediately = (path: string): boolean =>
  path === PATHS.sports ||
  path === PATHS.betHistoryH5 ||
  path === PATHS.mineH5 ||
  path === PATHS.promotion ||
  path === PATHS.promotionSponsor ||
  path === PATHS.promotionDiscount ||
  path === '/entertainment' ||
  path.startsWith('/entertainment/');

/**
 * 页面路由切换时加载动画组件
 */
const PageLoading: React.FC<{ path: string }> = ({ path }) => {
  const location = useLocation();
  const currentPath = normalizeSkeletonPath(location.pathname);
  const routePath = normalizeSkeletonPath(path);
  const showImmediately =
    shouldShowSkeletonImmediately(currentPath) || shouldShowSkeletonImmediately(routePath);
  const [isLoading, setIsLoading] = useState(!showImmediately);
  useEffect(() => {
    if (showImmediately) {
      setIsLoading(false);
      return;
    }
    // 骨架屏延迟 100ms 后加载，避免网络好的时候加载骨架屏闪烁
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delayTime);
    return () => clearTimeout(timer);
  }, [showImmediately]);
  if (isLoading) {
    return <></>;
  }

  const renderSkeleton = resolveSkeleton(currentPath, routePath);

  // path 在 map 中但值为 null：组件自管理骨架，Suspense 期间不渲染任何内容
  if (renderSkeleton !== undefined) {
    if (renderSkeleton) return renderSkeleton();
    return <></>;
  }
  return (
    <div className="w-full h-full flex items-center justify-center position-fixed top-0 left-0 z-999 box-shadow-lg bg-black/50">
      <h2 className="text-red-500 text-2xl font-bold">TODO: 此页面无骨架屏幕!</h2>
    </div>
  );
};

export default PageLoading;
