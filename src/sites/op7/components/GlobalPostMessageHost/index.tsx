import React, { useEffect } from 'react';
import { generatePath } from 'react-router-dom';

import { useAppDispatch } from '@/core/store/hooks';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { SponsorItem, useSponsorListQuery } from '@/apis/origin/promotion/getSponsorList';
import {
  fetchAndSyncSocialUnreadCount,
  syncSocialUnreadCount,
} from '@/apis/origin/social/getSocialUnreadCount';
import {
  hasMomentsIframe,
  notifyMomentsMounted,
} from '@/sites/op7/pages/MomentsPage/momentsIframeBridge';
import { parseMomentsIframeMessage } from '@/sites/op7/pages/MomentsPage/parseMomentsIframeMessage';

/**
 * postMessage 指令 → 本站路径的映射表
 *
 * 与原 Next.js 版本的 helpIndexMap 对应：
 *  "1"~"4"          → help_center 子页面（query 参数同旧版）
 *  "virtual"        → 充值
 *  "5"              → 浏览器返回
 *  "6"              → help_center 首页
 *  "224" / "148"    → 个人资料
 *  "42" / "274"     → 优惠详情
 *  "newYear1"       → 邀请好友
 *  "newYear2"       → 会员转账
 *  "newYear3"       → 充值
 *  "newYear4"~"8"   → 首页
 *  "toWelfare"      → 福利中心
 *  "goCustomerService" → 在线客服
 *  "virtualTutorial"   → 虚拟币教程（help_center）
 */

type PostMessageKey = string;

interface HandlerContext {
  navigate: ReturnType<typeof useNavigateWithLanguage>;
  dispatch: ReturnType<typeof useAppDispatch>;
}

// 帮助中心子页面 id 映射（与旧版 biAn/oE/zB/yBf 对应）
const HELP_SUB_ID_MAP: Record<string, number> = {
  '1': 21,
  '2': 22,
  '3': 23,
  '4': 24,
};

function handleMessage(key: PostMessageKey, ctx: HandlerContext): void {
  const { navigate, dispatch } = ctx;
  // 帮助中心子页面
  if (key in HELP_SUB_ID_MAP) {
    navigate(generatePath(PATHS.helpCenterwithId, { id: String(HELP_SUB_ID_MAP[key]) }));
    return;
  }

  switch (key) {
    // 帮助中心首页
    case '6':
      navigate(PATHS.helpCenter);
      break;

    // 充值
    case 'virtual':
    case 'newYear3':
      navigate(PATHS.mineDeposit);
      break;

    // 浏览器后退
    case '5':
      navigate(-1);
      break;

    // 个人资料
    case '224':
    case '148':
      navigate(PATHS.mineProfile);
      break;

    // 邀请好友
    case 'newYear1':
      navigate(PATHS.mineInviteFriends);
      break;

    // 会员转账
    case 'newYear2':
      navigate(PATHS.mineMemberTransfer);
      break;

    // 首页
    case 'newYear4':
    case 'newYear5':
    case 'newYear6':
    case 'newYear7':
    case 'newYear8':
      navigate(PATHS.home);
      break;

    // 优惠详情
    case '42':
    case '274': {
      const id = key; // '42' | '274'
      navigate(generatePath(PATHS.discountDetail, { id }));
      break;
    }

    // 安全中心
    case 'goSafeCenter':
      navigate(PATHS.mineSecurity);
      break;
    // 福利中心
    case 'toWelfare':
      navigate(PATHS.mineWelfareCenter);
      break;

    // 在线客服
    case 'goCustomerService':
      dispatch(requestOpenCustomerService());
      break;

    // 虚拟币教程
    case 'virtualTutorial':
      navigate(generatePath(PATHS.virtualCoins));
      break;

    default:
      break;
  }
}

/**
 * 全局 postMessage 监听挂载点
 *
 * 挂载在 App 根组件，统一处理来自 iframe 或其他页面的跨文档消息，
 * 映射到本站路由跳转或全局操作。
 */
const GlobalPostMessageHost: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const dispatch = useAppDispatch();
  const { data: sponsorList } = useSponsorListQuery();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // ── 赞助商 Tab 切换（PcSponsorDetailPage iframe → 父页面）──
      const data = event.data as Record<string, unknown> | null | undefined;
      if (data?.type === 'onSponsorTabChange') {
        const tabId: string = (data?.id as string) ?? '';
        const matched = sponsorList?.find((item: SponsorItem) =>
          item.webTargetAddress?.endsWith(`/${tabId}`),
        );
        if (matched) {
          navigate(generatePath(PATHS.PcSponsorDetail, { id: String(matched.id) }), {
            replace: true,
          });
        }
        return;
      }

      // ── 朋友圈 iframe 事件（MomentsView）──
      const moments = parseMomentsIframeMessage(event.data);
      if (moments) {
        const { eventName, payload } = moments;

        // 未读数刷新：聊天室等其他来源也会发，不限定朋友圈 iframe
        if (eventName === 'reGetUnreadCount') {
          if (payload !== undefined) {
            syncSocialUnreadCount(dispatch, payload);
          } else {
            void fetchAndSyncSocialUnreadCount(dispatch);
          }
          return;
        }

        // 其余事件仅在朋友圈 iframe 挂载时才有意义
        if (hasMomentsIframe()) {
          // 内页挂载完成，此时发过去的消息才不会丢
          if (eventName === 'momentMounted') {
            notifyMomentsMounted();
            return;
          }
          if (eventName === 'back') {
            navigate(-1);
            return;
          }
          if (eventName === 'toPagePay') {
            navigate(PATHS.mineDeposit);
            return;
          }
        }
      }

      // ── 通用指令（字符串 key）──
      const key = String(event.data ?? '').trim();
      if (!key) return;
      handleMessage(key, { navigate, dispatch });
    };

    window.addEventListener('message', handler, false);
    return () => {
      window.removeEventListener('message', handler, false);
    };
  }, [navigate, dispatch, sponsorList]);

  return null;
};

export default GlobalPostMessageHost;
