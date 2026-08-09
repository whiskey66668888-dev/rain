import { useEffect, useMemo, useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { toast } from '@/common/components/Toast';
import { getGamePlayParamsFromUrl } from '@/apis/origin/gamePlay';
import {
  depositAndCashOutTopReq,
  doGameDeposit,
  queryBalanceByGameId,
} from '@/apis/origin/finance/transfer';
import { withdrawAllReq } from '@/apis/origin/wallet/withdrawAll';

export function useGameTransfer({ refreshGame }: { refreshGame: () => void }) {
  const dispatch = useAppDispatch();
  const currentGameInfo = useAppSelector((state) => state.entertainment.currentGameInfo);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  // 中心钱包余额
  const memberMoney = useAppSelector((state) => state.user.memberInfo.money);
  // 自动转账开关
  const autoCashMode = useAppSelector((state) => state.user.memberInfo.autoCashMode);
  // 当前激活的场馆 id，非电子游戏时作为转账 gameId 的兜底来源
  const activeGameHomeId = useAppSelector((state) => state.entertainment.activeGameHomeId);
  // 手动刷新会员信息的方法
  const { getMemberInfo } = useGetMemberInfo();

  // 进入游戏后是否正在等待自动转账完成
  const [isWaitingTransfer, setIsWaitingTransfer] = useState(false);
  // 转账弹窗显隐
  const [transferVisible, setTransferVisible] = useState(false);
  // 主账户余额展示值
  const [mainBalance, setMainBalance] = useState<string>('0.00');
  // 当前游戏余额展示值
  const [venueBalance, setVenueBalance] = useState<string>('0.00');
  // 主账户余额加载态
  const [mainBalanceLoading, setMainBalanceLoading] = useState(false);
  // 当前游戏余额加载态
  const [venueBalanceLoading, setVenueBalanceLoading] = useState(false);
  // 主账户回收按钮 loading
  const [recycleLoading, setRecycleLoading] = useState(false);
  // 一键转入按钮 loading
  const [depositLoading, setDepositLoading] = useState(false);

  // 当前页用于转账的 gameId，按 transferId -> id -> activeGameHomeId -> gameUrl 参数回退
  const transferGameId = useMemo(() => {
    const candidate =
      currentGameInfo?.transferId ??
      currentGameInfo?.id ??
      activeGameHomeId ??
      (currentGameInfo?.gameUrl
        ? Number(getGamePlayParamsFromUrl(currentGameInfo.gameUrl).gameId || 0)
        : 0);

    return candidate && Number(candidate) > 0 ? Number(candidate) : null;
  }, [
    activeGameHomeId,
    currentGameInfo?.gameUrl,
    currentGameInfo?.id,
    currentGameInfo?.transferId,
  ]);

  useEffect(() => {
    setTransferVisible(false);
    if (!isLogin || !autoCashMode || !transferGameId) {
      setIsWaitingTransfer(false);
      return;
    }

    setIsWaitingTransfer(true);
    depositAndCashOutTopReq({ gameId: transferGameId })
      .catch(() => undefined)
      .finally(() => {
        setIsWaitingTransfer(false);
      });
  }, [autoCashMode, isLogin, transferGameId]);

  // 拉取主账户余额与当前游戏余额
  const fetchTransferBalances = useMemoizedFn(async () => {
    if (!transferGameId) return;

    setMainBalanceLoading(true);
    setVenueBalanceLoading(true);

    const [memberInfoRes, venueBalanceRes] = await Promise.allSettled([
      getMemberInfo(),
      queryBalanceByGameId({ gameId: transferGameId }),
    ]);

    if (memberInfoRes.status === 'fulfilled') {
      const latestMoney = memberInfoRes.value.money ?? memberMoney;
      const balanceValue = Number(latestMoney ?? 0);
      setMainBalance(
        Number.isNaN(balanceValue) ? String(latestMoney ?? '0.00') : balanceValue.toFixed(2),
      );
    } else {
      const balanceValue = Number(memberMoney ?? 0);
      setMainBalance(
        Number.isNaN(balanceValue) ? String(memberMoney ?? '0.00') : balanceValue.toFixed(2),
      );
    }
    setMainBalanceLoading(false);

    if (venueBalanceRes.status === 'fulfilled') {
      const balanceValue = Number(venueBalanceRes.value.data ?? 0);
      setVenueBalance(
        Number.isNaN(balanceValue)
          ? String(venueBalanceRes.value.data ?? '0.00')
          : balanceValue.toFixed(2),
      );
    } else {
      setVenueBalance('0.00');
    }
    setVenueBalanceLoading(false);
  });

  // 打开转账弹窗；未登录时转到登录弹窗
  const openTransfer = useMemoizedFn(() => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }
    setTransferVisible(true);
    void fetchTransferBalances();
  });

  // 关闭转账弹窗
  const closeTransfer = useMemoizedFn(() => {
    setTransferVisible(false);
  });

  // 主账户回收：把场馆余额回收到中心钱包
  const handleRecycle = useMemoizedFn(async (isToast = true) => {
    if (!transferGameId || recycleLoading) return;
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }
    try {
      setRecycleLoading(true);
      await withdrawAllReq();
      if (isToast) {
        toast({ type: 'success', description: '操作成功' });
      }

      await fetchTransferBalances();
      refreshGame();
    } finally {
      setRecycleLoading(false);
    }
  });

  // 一键转入：把中心钱包余额转入当前游戏
  const handleOneClickDeposit = useMemoizedFn(async () => {
    if (!transferGameId || depositLoading) return;

    const amount = Number(memberMoney ?? 0);
    if (!(amount > 0)) {
      toast({ type: 'warning', description: '中心钱包余额不足' });
      return;
    }

    try {
      setDepositLoading(true);
      await doGameDeposit({
        gameId: transferGameId,
        cash: Math.floor(amount),
      });
      toast({ type: 'success', description: '操作成功' });
      await fetchTransferBalances();
      refreshGame();
    } finally {
      setDepositLoading(false);
    }
  });

  return {
    isWaitingTransfer,
    transferVisible,
    mainBalance,
    venueBalance,
    mainBalanceLoading,
    venueBalanceLoading,
    recycleLoading,
    depositLoading,
    autoCashMode,
    openTransfer,
    closeTransfer,
    handleRecycle,
    handleOneClickDeposit,
  };
}
