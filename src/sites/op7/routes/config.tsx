import { lazy } from 'react';

import { commonRoutes, deepMergeRoutes, type RouteConfig } from '@/common/router/config';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { buildAgentPromoRedirectUrl } from '@/utils/agentPromoLink';
import MainLayout from '../pages/layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LandingPage from '../pages/LandingPage';
import SportsPage from '../pages/SportsPage';
import { PATHS } from './paths';

/**
 * 路径重定向映射表 兼容旧项目的路径
 * key: 旧路径（兼容路径）
 * value: 新路径（目标路径）
 */
const REDIRECT_MAP: Record<string, string> = {
  // 呼朋唤友
  '/newFriend': PATHS.mineInviteFriends,
  //邀请好友
  '/newFriend/invite': PATHS.mineInviteFriendsInvite,
  //奖金报表
  '/newFriend/bonusReport': PATHS.mineInviteFriendsBonusReport,
  //返水报表
  '/newFriend/rebateReport': PATHS.mineInviteFriendsRebateReport,
  //直升历史
  '/newFriend/historyReport': PATHS.mineInviteFriendsHistoryReport,
  //好友邀请记录
  '/newFriend/InvitationReport': PATHS.mineInviteFriendsInvitationReport,
  // 帮助中心
  '/mine/newerHelp': PATHS.helpCenter,
  '/mine/newerHelp/detail': PATHS.helpCenterDetail,
  '/mine/newerHelp/vituralCoins': PATHS.virtualCoins,
  '/mine/newerHelp/search': PATHS.helpCenterSearch,
};

const RedirectWithQuery = ({ to }: { to: string }) => {
  const [search] = useSearchParams();
  const query = search.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
};

/** /g/:code、/t/:code → ?sysAgentName=:code（SPA 内导航兜底） */
const AgentPromoRedirect = () => {
  const target =
    buildAgentPromoRedirectUrl(window.location.pathname, window.location.search) ?? '/';
  return <Navigate to={target} replace />;
};

const RedirectNewerHelp = () => {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const query = search.toString();
  const to = `${PATHS.helpCenter}/${id ?? ''}`;
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
};

const redirectRoutes: RouteConfig[] = [
  { path: 'g/:code', element: AgentPromoRedirect },
  { path: 't/:code', element: AgentPromoRedirect },
  ...Object.entries(REDIRECT_MAP).map(([from, to]) => ({
    path: from,
    element: () => <RedirectWithQuery to={to} />,
  })),
  // 动态路径重定向：/mine/newerHelp/:id → /help_center/:id
  {
    path: '/mine/newerHelp/:id',
    element: RedirectNewerHelp,
  },
];

/**
 * 站点私有路由配置
 * path 统一引用 PATHS 常量，确保路由配置和 navigate() 调用使用同一份路径
 */
const siteRoutes: RouteConfig[] = [
  {
    path: '', // 一级路由：RootPage（包含导航和底部）
    element: MainLayout,
    handle: {
      siteMainLayout: true,
    },
    children: [
      // 二级路由
      {
        path: PATHS.home, // 新落地页
        element: LandingPage,
        handle: {
          h5ShowHeader: true,
          h5ShowFooter: true,
          module: 'landing',
        },
      },
      {
        path: PATHS.entertainment, // 娱乐页面
        element: HomePage,
        handle: {
          h5ShowHeader: true,
          h5ShowFooter: true,
          module: 'entertainment',
        },
      },
      {
        path: PATHS.promotion,
        element: lazy(() => import('../pages/PromotionPage')),
        handle: {
          module: 'discount',
          noPageSkeleton: true, // 子组件有自己的骨架屏，无需页面级骨架屏
        },
        children: [
          {
            path: '', // 默认子路由
            element: () => <Navigate to="discount" replace />,
          },
          {
            path: PATHS.promotionSponsor, // 赞助商页面
            element: lazy(() => import('../pages/PromotionPage/SponsorPage')),
            handle: {
              module: 'discount',
              noPageSkeleton: true, // 无需页面级骨架屏
            },
          },
          {
            path: PATHS.promotionDiscount, // 优惠页面
            element: lazy(() => import('../pages/PromotionPage/DiscountPage')),
            handle: {
              module: 'discount',
              noPageSkeleton: true,
            },
          },
          {
            path: PATHS.promotionHotEvent, // 热门活动页面
            element: lazy(() => import('../pages/PromotionPage/HotEventPage')),
            handle: {
              module: 'discount',
              requiresAuth: true,
            },
          },
          {
            path: PATHS.promotionMomentsPublic, // 公共朋友圈
            element: lazy(() => import('../pages/MomentsPage/PublicPage')),
            handle: {
              module: 'discount',
              noPageSkeleton: true,
            },
          },
          {
            path: PATHS.promotionMomentsOfficial, // 官方动态
            element: lazy(() => import('../pages/MomentsPage/OfficialPage')),
            handle: {
              module: 'discount',
              noPageSkeleton: true,
            },
          },
        ],
      },
      {
        path: PATHS.discountDetail,
        element: lazy(() => import('../pages/DiscountDetail')),
        handle: {
          h5ShowFooter: false,
          module: 'discount',
          h5NoBottomMenu: true,
          noPageSkeleton: true,
        },
      },
      {
        path: PATHS.materialLibrary,
        element: lazy(() => import('../pages/MaterialPage')),
        handle: {
          h5ShowFooter: false,
          module: 'discount',
          h5NoBottomMenu: true,
          noPageSkeleton: true,
        },
      },
      {
        path: PATHS.sponsorDetail,
        element: lazy(() => import('../pages/sponsorDetailPage')),
        handle: {
          h5ShowFooter: false,
          module: 'discount',
          h5NoBottomMenu: true,
          noPageSkeleton: true,
        },
      },
      {
        path: PATHS.sports, // 体育页面
        element: SportsPage,
        handle: {
          h5ShowHeader: true,
          h5ShowFooter: true,
          module: 'sports',
          showBet: true,
          autoTransferPage: true,
          lineGradient: true,
        },
      },
      {
        path: PATHS.sportsDetail, // 赛事详情页面
        element: lazy(() => import('../pages/SportsDetailsPage')),
        handle: {
          module: 'sports',
          showBet: true,
          autoTransferPage: true,
          h5NoBottomMenu: true,
        },
      },
      {
        path: PATHS.champion,
        element: lazy(() => import('../pages/ChampionPage')),
        handle: {
          module: 'sports',
          showBet: true,
          autoTransferPage: true,
          h5NoBottomMenu: true,
        },
      },
      {
        path: PATHS.betHistoryH5,
        element: lazy(() => import('../pages/BetHistoryPage/BetHistoryH5')),
        handle: {
          module: 'sports',
          autoTransferPage: true,
        },
      },
      {
        path: PATHS.betHistoryH5ResultLeagueFilter,
        element: lazy(() => import('../pages/BetHistoryPage/BetHistoryH5/ResultLeagueFilterPage')),
        handle: {
          module: 'sports',
          h5NoBottomMenu: true,
          h5ShowFooter: false,
        },
      },
      {
        path: PATHS.mine,
        element: lazy(() => import('../pages/MinePage')),
        children: [
          // 三级路由
          {
            path: PATHS.mineH5, // h5 的我的页面，pc 是头像有个下拉菜单
            element: lazy(() => import('../pages/MinePage/MinePageH5')),
          },
          {
            path: PATHS.mineProfile, // 个人资料
            element: lazy(() => import('../pages/MinePage/ProfilePage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineSecurity, // 安全中心
            element: lazy(() => import('../pages/MinePage/SecurityCenterPage')),
            handle: {
              h5NoBottomMenu: true,
              requiresAuth: true,
            },
          },
          {
            path: PATHS.mineSecurityPhone, // 安全手机号绑定
            element: lazy(() => import('../pages/MinePage/SecurityPhonePage')),
            handle: {
              h5NoBottomMenu: true,
              requiresAuth: true,
            },
          },
          {
            path: PATHS.mineWelfareCenter, // 福利中心
            element: lazy(() => import('../pages/MinePage/WelfareCenterPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineDeposit, // 存款
            element: lazy(() => import('../pages/Finance/deposit/DepositPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineDepositPay, // H5 充值支付（iframe 内嵌）
            element: lazy(() => import('../pages/Finance/deposit/DepositPayPage')),
            handle: {
              h5NoBottomMenu: true,
              h5ShowFooter: false,
              noPageSkeleton: true,
            },
          },
          {
            path: PATHS.mineWithdrawal, // 提现
            element: lazy(() => import('../pages/Finance/wallet/walletPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineTransfer, // 转账
            element: lazy(() => import('../pages/Finance/transferPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineMemberTransfer, // 会员互转
            element: lazy(() => import('../pages/Finance/memberTransfer')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineGameBalance, // 游戏钱包
            element: lazy(() => import('../pages/Finance/gameBalance')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineTransactionRecord, // 交易记录
            element: lazy(() => import('../pages/MinePage/TransactionRecordPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineRealtimeRebate, // 实时返水
            element: lazy(() => import('../pages/MinePage/RealtimeRebatePage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineRealtimeRebateRecord, // 实时返水记录
            element: lazy(() => import('../pages/MinePage/RealtimeRebatePage/RecordPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.minePartnership, // 加入合营
            element: lazy(() => import('../pages/MinePage/PartnershipPage')),
            handle: {
              h5NoBottomMenu: true,
            },
          },
          {
            path: PATHS.mineInviteFriends, // 呼朋唤友（邀请好友活动）
            element: lazy(() => import('../pages/MinePage/InviteFriendsPage')),
            handle: {
              h5NoBottomMenu: true,
            },
            children: [
              {
                path: '',
                element: lazy(() => import('../pages/MinePage/InviteFriendsPage/HomePage')),
              },
              {
                path: PATHS.mineInviteFriendsInvite,
                element: lazy(() => import('../pages/MinePage/InviteFriendsPage/InviteSubPage')),
              },
              {
                path: PATHS.mineInviteFriendsBonusReport,
                element: lazy(() => import('../pages/MinePage/InviteFriendsPage/BonusReportPage')),
              },
              {
                path: PATHS.mineInviteFriendsInvitationReport,
                element: lazy(
                  () => import('../pages/MinePage/InviteFriendsPage/InvitationReportPage'),
                ),
              },
              {
                path: PATHS.mineInviteFriendsRebateReport,
                element: lazy(() => import('../pages/MinePage/InviteFriendsPage/RebateReportPage')),
              },
              {
                path: PATHS.mineInviteFriendsHistoryReport,
                element: lazy(
                  () => import('../pages/MinePage/InviteFriendsPage/HistoryReportPage'),
                ),
              },
            ],
          },
        ],
      },
      {
        path: PATHS.moments, // 朋友圈
        element: lazy(() => import('../pages/MomentsPage')),
        handle: {
          module: 'moments',
          noPageSkeleton: true,
          h5NoBottomMenu: true,
        },
      },
      {
        path: PATHS.vipCenter, // VIP 中心
        element: lazy(() => import('../pages/VIPCenterPage')),
        handle: {
          h5NoBottomMenu: true,
          module: 'vip',
        },
      },
      {
        path: PATHS.virtualCoins, // 帮助中心虚拟币页面
        element: lazy(() => import('../pages/HelpCenterPage/VituralCoinsPage')),
        handle: {
          h5NoBottomMenu: true,
          module: 'helpCenter',
          noPageSkeleton: true,
        },
      },
      {
        path: PATHS.helpCenterDetail, // 帮助中心详情页面
        element: lazy(() => import('../pages/HelpCenterPage/Detail')),
        handle: {
          h5NoBottomMenu: true,
          module: 'helpCenter',
          noPageSkeleton: true,
        },
      },
      {
        path: PATHS.helpCenter, // 帮助中心
        element: lazy(() => import('../pages/HelpCenterPage')),
        handle: {
          h5NoBottomMenu: true,
          module: 'helpCenter',
        },
      },
      {
        path: PATHS.helpCenterwithId, // 帮助中心内页兼容老路径
        element: lazy(() => import('../pages/HelpCenterPage/HelpCenterwithId')),
        handle: {
          h5NoBottomMenu: true,
          module: 'helpCenter',
          noPageSkeleton: true,
        },
      },
      {
        path: PATHS.helpCenterSearch, // 帮助中心搜索
        element: lazy(() => import('../pages/HelpCenterPage/Search')),
        handle: {
          h5NoBottomMenu: true,
          module: 'helpCenter',
        },
      },
      {
        path: PATHS.allBettingRecord, // 投注记录
        element: lazy(() => import('../pages/AllBettingRecordPage')),
        handle: {
          h5NoBottomMenu: true,
        },
      },
      {
        path: PATHS.allBettingRecordDetail, // 投注记录详情页
        element: lazy(() => import('../pages/AllBettingRecordPage/DetailPage')),
        handle: {
          h5NoBottomMenu: true,
        },
      },
      {
        path: PATHS.systemSettings, // 系统设置
        element: lazy(() => import('../pages/SystemSettingsPage')),
        handle: {
          h5NoBottomMenu: true,
        },
      },
      {
        path: PATHS.system,
        element: lazy(() => import('../pages/SystemPage')),
      },
      {
        path: PATHS.onlineCustomerService,
        element: lazy(() => import('../pages/OnlineCustomerServiceEntryPage')),
      },
      {
        path: PATHS.login,
        element: lazy(() => import('../pages/LoginEntryPage')),
      },
      {
        path: PATHS.register,
        element: lazy(() => import('../pages/RegisterEntryPage')),
      },
      // {
      //   path: 'sponsorship',
      //   element: lazy(() => import('../pages/SponsorshipPage')),
      //   handle: {
      //     h5NoBottomMenu: true,
      //   },
      //   children: [
      //     {
      //       path: 'global',
      //       element: lazy(() => import('../pages/SponsorshipPage/GlobalFootballAwardPage')),
      //     },
      //     {
      //       path: 'juventus',
      //       element: lazy(() => import('../pages/SponsorshipPage/JuventusPage')),
      //     },
      //   ],
      // },
    ],
  },
  ...redirectRoutes,
  {
    path: PATHS.hotEventApp,
    element: lazy(() => import('../pages/PromotionPage/HotEventPage')),
    handle: {
      module: 'promotion',
    },
  },
  {
    path: PATHS.result,
    element: lazy(() => import('../pages/PcResultPage')),
  },
  {
    path: PATHS.sportsRulesPc,
    element: lazy(() => import('../pages/SportsRulesPage')),
  },
  {
    path: PATHS.bettingTutorialPc,
    element: lazy(() => import('../pages/BettingTutorialPage')),
  },
  {
    path: PATHS.PcDiscountDetail,
    element: lazy(() => import('../pages/PcDiscountDetail')),
    handle: {
      module: 'discount',
      noPageSkeleton: true, // 子组件有自己的骨架屏，无需页面级骨架屏
    },
  },
  {
    path: PATHS.PcSponsorDetail,
    element: lazy(() => import('../pages/PcSponsorDetailPage')),
    handle: {
      module: 'discount',
      noPageSkeleton: true, // 子组件有自己的骨架屏，无需页面级骨架屏
    },
  },
  {
    // PC 投注记录独立页（无 MainLayout）
    path: PATHS.betHistoryPc,
    element: lazy(() => import('../pages/BetHistoryPage/BetHistoryPC')),
    handle: {
      module: 'sports',
      autoTransferPage: true,
    },
  },
];

// 导出合并后的路由配置
export default deepMergeRoutes(commonRoutes, siteRoutes);
