import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';
import { useAuthNavigate } from '@/common/hooks/useAuthNavigate';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { BalanceTransferCard } from './components/BalanceTransferCard';
import PromotionCard from './components/PromotionCard';
import { UserInfo } from './components/UserInfo';
import { MineFeatureGrid, type MineGridItem } from './components/MineFeatureGrid';
import BannerBottom from './components/BannerBottom';
import { useOpenMessageCenter } from '@/common/hooks/messageCenter/useOpenMessageCenter';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { PATHS } from '@/sites/op7/routes/paths';
import { useAppDownload } from '@/common/hooks/useAppDownload';

import styles from './MinePageH5.module.scss';
import { getSystemTheme } from '@/utils';
import { useMineRebateAndWelfareDots } from '../hooks/useMineRebateAndWelfareDots';

export default function MinePageH5() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const queryClient = useQueryClient();
  const authNavigate = useAuthNavigate();
  const { openMessageCenter } = useOpenMessageCenter();
  const openCustomerService = useOpenCustomerService();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { openDownloadApp } = useAppDownload();
  const { getMemberInfo } = useGetMemberInfo();
  const unreadInboxCount = useAppSelector((state) => state.messageCenter.unreadInboxCount);
  const { hasRealtimeRebateDot, hasWelfareCenterDot, refreshDots } = useMineRebateAndWelfareDots();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;

  const handlePageRefresh = useCallback(async () => {
    const tasks: Array<Promise<unknown>> = [];

    if (isLogin) {
      tasks.push(getMemberInfo({ isLoading: false }));
      tasks.push(refreshDots());
    }

    tasks.push(
      queryClient.invalidateQueries({
        queryKey: ['website', 'getCarouselResourceSlots'],
      }),
    );

    await Promise.all(tasks);
  }, [getMemberInfo, isLogin, queryClient, refreshDots]);

  /** 未登录仅允许：专属客服、优惠、加入合营；其余先弹登录窗 */
  const withLogin = useCallback(
    (fn: () => void) => () => {
      if (!isLogin) {
        dispatch(openLoginModal());
        return;
      }
      fn();
    },
    [dispatch, isLogin],
  );

  const gridItems: MineGridItem[] = useMemo(
    () => [
      // {
      //   label: '专属客服',
      //   icon: '/images/common/mine/mine_list_service.svg',
      //   onClick: openCustomerService,
      // },
      {
        label: '优惠',
        icon: '/images/common/mine/mine_list_discount.svg',
        onClick: () => navigate(PATHS.promotionDiscount),
      },
      {
        label: '福利中心',
        icon: '/images/common/mine/mine_list_welfare.svg',
        onClick: withLogin(() => navigate(PATHS.mineWelfareCenter)),
        showDot: hasWelfareCenterDot,
      },
      {
        label: '实时返水',
        icon: '/images/common/mine/mine_list_rebate.svg',
        onClick: withLogin(() => navigate(PATHS.mineRealtimeRebate)),
        showDot: hasRealtimeRebateDot,
      },
      {
        label: '创意素材',
        icon: '/images/common/mine/mine_list_material.svg',
        onClick: () => {
          navigate(PATHS.materialLibrary);
        },
      },
      {
        label: '交易记录',
        icon: '/images/common/mine/mine_list_tradeRecord.svg',
        onClick: withLogin(() => navigate(PATHS.mineTransactionRecord)),
      },
      {
        label: '投注记录',
        icon: '/images/common/mine/mine_list_betRecord.svg',
        onClick: withLogin(() => navigate(PATHS.allBettingRecord)),
      },
      {
        label: '安全中心',
        icon: '/images/common/mine/mine_list_safeCenter.svg',
        // 未登录时 authNavigate 会记录回跳路径并打开登录窗
        onClick: () => {
          void authNavigate(PATHS.mineSecurity);
        },
      },
      {
        label: '消息中心',
        icon: '/images/common/mine/mine_list_myMsg.svg',
        onClick: withLogin(openMessageCenter),
        showDot: unreadInboxCount > 0,
      },
      {
        label: '帮助中心',
        icon: '/images/common/mine/mine_list_helpCenter.svg',
        onClick: withLogin(() => navigate(PATHS.helpCenter)),
      },
      {
        label: '加入合营',
        icon: '/images/common/mine/mine_list_join.svg',
        onClick: () => navigate(PATHS.minePartnership),
      },
      {
        label: '系统设置',
        icon: '/images/common/mine/mine_list_system.svg',
        onClick: withLogin(() => navigate(PATHS.systemSettings)),
      },
      {
        label: 'APP下载',
        icon: '/images/common/mine/mine_list_app_download.svg',
        onClick: openDownloadApp,
      },
    ],
    [
      authNavigate,
      hasRealtimeRebateDot,
      hasWelfareCenterDot,
      navigate,
      // openCustomerService,
      openMessageCenter,
      openDownloadApp,
      unreadInboxCount,
      withLogin,
    ],
  );

  return (
    <div className={clsx('lg:hidden')}>
      <MyPullToRefresh onRefresh={handlePageRefresh}>
        <div data-desc="mine-page-h5">
          <div className={clsx(styles.hero, 'px-12px pb-16px pt-16px mb-10px ')}>
            <div className="flex items-start gap-12px">
              <UserInfo />
              <button type="button" aria-label="专属客服" onClick={openCustomerService}>
                <img
                  src={`/images/${theme}/mine/mine_top_kf.png`}
                  alt=""
                  className="h-20px w-20px object-contain"
                />
              </button>
            </div>
            <BalanceTransferCard />
          </div>

          <div className={styles.featureScrollArea}>
            <div className={styles.featureContainer}>
              <PromotionCard />
              <div className="h-16px"></div>
              <MineFeatureGrid items={gridItems} />
              <div className="h-16px"></div>
              <BannerBottom />
            </div>
          </div>
        </div>
      </MyPullToRefresh>
    </div>
  );
}
