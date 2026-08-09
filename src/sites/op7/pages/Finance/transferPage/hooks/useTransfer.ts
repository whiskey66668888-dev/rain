import { useEffect, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { toast } from '@/common/components/Toast';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { withdrawAllReq } from '@/apis/origin/wallet/withdrawAll';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { useMemberSettingActions } from '@/common/hooks/memberSettingsBridge';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { blockAgentVenueAccess } from '@/common/utils/openAgentVenueBlockedModal';
import {
  useGameListQuery,
  queryBalanceByGameId,
  doGameDeposit,
} from '@/apis/origin/finance/transfer';
import type { GameItem } from '@/apis/origin/finance/transfer';

export function useTransfer() {
  const dispatch = useAppDispatch();
  // 用户信息
  const {
    money: balance,
    autoCashMode,
    balanceSwitch,
    isAgent,
    isRiskAccount,
  } = useAppSelector((state) => state.user.memberInfo);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  // 场馆列表
  const [gameList, setGameList] = useState<GameItem[]>([]);
  // 是否隐藏无余额场馆
  const [isHideBalance, setHideBalance] = useState(balanceSwitch ?? false);
  // 自动转账开关状态
  const [isAutoTransfer, setAutoTransfer] = useState(autoCashMode ?? false);
  // 所有场馆列表
  const { isFetched, refetch: queryGameList } = useGameListQuery();
  const { getMemberInfo } = useGetMemberInfo();
  const { updateManagedSetting } = useMemberSettingActions();

  useEffect(() => {
    setHideBalance(balanceSwitch ?? false);
  }, [balanceSwitch]);

  useEffect(() => {
    setAutoTransfer(autoCashMode ?? false);
  }, [autoCashMode]);

  const setBalanceLoadingByGameId = (gameId: number) => {
    setGameList((prev) =>
      prev.map((obj) =>
        gameId === obj.gameId
          ? {
              ...obj,
              balance: undefined,
            }
          : obj,
      ),
    );
  };

  // 一键回收 并更新用户余额
  const doRecycle = async () => {
    if (!isLogin) {
      dispatch(openLoginModal());
      throw new Error('用户未登录');
    }
    try {
      await withdrawAllReq(); // 执行请求
      await getMemberInfo(); // 获取用户信息并更新余额
    } catch (error) {
      throw error; // 抛出错误
    }
  };

  // 更新场馆余额
  const updateBlanceByGameId = (gameId: number) => {
    queryBalanceByGameId({ gameId: gameId })
      .then((res) => {
        setGameList((prev) =>
          prev.map((obj) =>
            gameId === obj.gameId
              ? {
                  ...obj,
                  code: res.code,
                  info: res.info ?? '',
                  balance: res.data,
                }
              : obj,
          ),
        );
      })
      .catch((error) => {
        console.log(error);
        setGameList((prev) =>
          prev.map((obj) =>
            gameId === obj.gameId
              ? {
                  ...obj,
                  code: 'ERROR',
                  info: '网络错误',
                  balance: undefined,
                }
              : obj,
          ),
        );
      });
  };

  const initGameListBalance = (list: GameItem[]) => {
    const _list = list || [];
    setGameList(_list);
    // 获取各个场馆的余额状态
    _list.forEach((item) => {
      updateBlanceByGameId(item.gameId);
    });
  };

  // 点击场馆金额一键转入中心钱包余额
  const quickTransferToVenue = async (item: GameItem) => {
    if (!blockAgentVenueAccess({ isAgent, isRiskAccount }, '当前账号暂不支持进行场馆转账操作')) {
      return;
    }
    if (!balance || Number(balance) <= 0) {
      toast({ type: 'warning', description: '中心钱包余额不足' });
      return;
    }

    // 复用场馆余额初始加载态：点击后先展示 loading
    setBalanceLoadingByGameId(item.gameId);

    // 直接执行转入，不需要弹窗确认
    // setShowLoading(true);
    const param = {
      cash: parseInt(balance),
      gameId: item.gameId,
    };
    try {
      await doGameDeposit(param);
      getMemberInfo(); // 获取用户信息并更新余额
      toast({ type: 'success', description: '转入成功' });
    } finally {
      updateBlanceByGameId(param.gameId);
      // setShowLoading
    }
  };

  // 场馆余额点击事件
  const handleBalanceClick = (item: GameItem) => {
    // 如果金额已加载（包括为0的情况），支持一键转入
    if (item.balance !== undefined) {
      quickTransferToVenue(item);
    } else {
      // 否则查询余额;
      updateBlanceByGameId(item.gameId);
    }
  };

  // 切换隐藏无余额场馆的状态
  const changeHideBalance = async (checked: boolean) => {
    try {
      await updateManagedSetting('balanceSwitch', checked);
      // 接口成功后更新状态
      setHideBalance(checked);
    } catch (error) {
      console.error('设置隐藏余额失败:', error);
      // 接口失败时不改变状态，保持原来的值
    }
  };

  // 自动转账开关切换事件
  const changeAutoTransfer = async (checked: boolean) => {
    if (checked && !blockAgentVenueAccess({ isAgent, isRiskAccount }, '当前账号限制上分')) {
      return;
    }
    try {
      await updateManagedSetting('autoCashMode', checked);
      // 接口成功后更新状态
      setAutoTransfer(checked);
    } catch (error) {
      console.error('设置隐藏余额失败:', error);
      throw error;
      // 接口失败时不改变状态，保持原来的值
    }
  };

  const initData = useMemoizedFn(async (skipRecycle = false) => {
    // 如果启用自动收回 先执行一键回收
    if (!skipRecycle && autoCashMode) {
      await doRecycle();
    }
    const { data } = await queryGameList();
    initGameListBalance(data || []);
  });

  return {
    balance,
    gameList,
    isHideBalance,
    changeHideBalance,
    isFetched,
    handleBalanceClick,
    isAutoTransfer,
    changeAutoTransfer,
    initData,
    updateBlanceByGameId,
  };
}
