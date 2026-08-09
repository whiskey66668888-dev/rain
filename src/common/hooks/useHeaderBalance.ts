import { useAppSelector } from '@/core/store/hooks';
import { useHandle } from '@/sites/op7/hooks/useRoute';
import {
  useGetVenueBalance,
  useLoopVenueBalance,
  useVenueBalance,
  useVenueBalanceLoading,
} from './sports/useVenueBalance';
import { useGetMemberInfo, useLoopMemberInfo } from './useMemberInfo';
import { useCallback, useEffect, useRef } from 'react';
import { useOneClickTransfer, useOneClickTransferLoading } from './sports/useOneClickTransfer';
import { withdrawAllReq } from '@/apis/origin/wallet/withdrawAll';

export const useHeaderBalance = () => {
  const venue = useAppSelector((state) => state.sport.venue);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  /** 用户中心钱包 */
  /** 是否开启自动转账 */
  const autoCashMode = useAppSelector((state) => state.user.memberInfo?.autoCashMode);
  /** 当前场馆钱包 */
  const currentHandle = useHandle();

  const isAutoTransferPage = !!currentHandle?.autoTransferPage;

  useLoopMemberInfo();

  useLoopVenueBalance({ enabled: isLogin && currentHandle?.module === 'sports' });

  const { oneclickTransfer } = useOneClickTransfer();
  const { getVenueBalance } = useGetVenueBalance();
  const { getMemberInfo } = useGetMemberInfo();

  /** 上次执行自动转账的时刻，初始为 0（首次切换时 elapsed 极大，delay=0，立即执行） */
  const lastExecTimeRef = useRef<number>(0);
  /** 最后停留的菜单类型，timer 触发时读此 ref，确保执行的是用户最终停留的菜单对应的转账逻辑 */
  const lastIsSportPageRef = useRef<boolean>(isAutoTransferPage);

  useEffect(() => {
    // 子页面（window.opener 非空）
    if (window.opener !== null) return;
    if (!autoCashMode) return;

    // 每次菜单切换都同步更新，timer 尚未触发时也能拿到最新值
    lastIsSportPageRef.current = isAutoTransferPage;

    // 计算距上次执行还需等待多久（后端接口防重频率约 5s）
    const elapsed = Date.now() - lastExecTimeRef.current;
    const delay = Math.max(0, 5000 - elapsed);

    // 快速切换时 cleanup 取消上一个 timer 并重新调度
    // 无论中间切换多少次，5s 内只会真正触发一次接口
    const timer = setTimeout(() => {
      // 发起时先记录，防止请求飞行途中被再次触发
      lastExecTimeRef.current = Date.now();
      // 读 ref 而非闭包变量，拿到的是用户最终停留的菜单
      if (lastIsSportPageRef.current) {
        // 进入体育页：一键转入当前场馆，完成后刷新场馆余额
        oneclickTransfer({ venue, gameId: 89 }).finally(() => {
          // 完成后再记录一次，防重窗口从完成时重新起算
          lastExecTimeRef.current = Date.now();
          getVenueBalance({ venue, isLoading: true });
        });
      } else {
        // 离开体育页：一键回收所有场馆余额，完成后刷新用户中心钱包
        withdrawAllReq().finally(() => {
          lastExecTimeRef.current = Date.now();
          getMemberInfo();
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [autoCashMode, getMemberInfo, getVenueBalance, isAutoTransferPage, oneclickTransfer, venue]);
};

export const useHeaderBalanceData = () => {
  const venue = useAppSelector((state) => state.sport.venue);
  /** 用户中心钱包 */
  const centerMoney = useAppSelector((state) => state.user.memberInfo.money || '0.00');
  const memberInfoLoading = useAppSelector((state) => state.user.memberInfoLoading);
  /** 当前场馆钱包 */
  const { balance } = useVenueBalance();
  const { getVenueBalance } = useGetVenueBalance();
  const { balanceLoading: venueBalanceLoading } = useVenueBalanceLoading();
  const { oneClickTransferLoading } = useOneClickTransferLoading();

  const { getMemberInfo } = useGetMemberInfo();

  const currentHandle = useHandle();

  const isShowBetPage = !!currentHandle?.showBet;

  const balanceLoading = isShowBetPage
    ? venueBalanceLoading || oneClickTransferLoading
    : memberInfoLoading;

  const refreshBalance = useCallback(() => {
    if (balanceLoading) {
      return;
    }
    if (isShowBetPage) {
      getVenueBalance({ venue, isLoading: true });
    } else {
      getMemberInfo({ isLoading: true });
    }
  }, [balanceLoading, getMemberInfo, getVenueBalance, isShowBetPage, venue]);

  return {
    balance: isShowBetPage ? balance : centerMoney,
    balanceLoading,
    refreshBalance,
  };
};
