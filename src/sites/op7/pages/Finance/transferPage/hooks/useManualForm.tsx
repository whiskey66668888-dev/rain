import { useState, useMemo } from 'react';

import Modal from '@/common/components/Modal';
import { toast } from '@/common/components/Toast';
import Button from '@/common/components/Button';

import { useAppSelector } from '@/core/store/hooks';
import { TransferDirection } from '../../constants';
import { doGameDeposit, doGameWithdraw, checkWeekStatus } from '@/apis/origin/finance/transfer';
import type { GameItem } from '@/apis/origin/finance/transfer';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { blockAgentVenueAccess } from '@/common/utils/openAgentVenueBlockedModal';

export function useManualForm({
  updateBlanceByGameId,
}: {
  updateBlanceByGameId: (gameId: number) => void;
}) {
  // 用户信息
  const {
    money: balance,
    isAgent,
    isRiskAccount,
  } = useAppSelector((state) => state.user.memberInfo);
  // 金额
  const [amount, setAmount] = useState('');
  // 选中的账号
  const [selectGameItem, setSelectGameItem] = useState<GameItem | null>(null);
  // 按钮提交loading
  const [loading, setLoading] = useState(false);
  // 整屏loading 显示
  const [showMaskLoading, setShowMaskLoading] = useState(false);
  // 转账方向
  const [transferDirection, setTransferDirection] = useState<TransferDirection>(
    TransferDirection.toVenue,
  );

  const { getMemberInfo } = useGetMemberInfo();

  const transferInAccountName = useMemo(() => {
    return transferDirection === TransferDirection.toVenue
      ? selectGameItem
        ? selectGameItem.gameName
        : '请选择场馆'
      : '中心钱包';
  }, [transferDirection, selectGameItem]);

  const transferOutAccountName = useMemo(() => {
    return transferDirection === TransferDirection.toVenue
      ? '中心钱包'
      : selectGameItem
        ? selectGameItem.gameName
        : '请选择场馆';
  }, [transferDirection, selectGameItem]);

  const disabled = useMemo(() => {
    const value = amount ? Number(amount) : 0;
    return value <= 0;
  }, [amount]);

  // 交换转账方向
  const changeTransferDirection = () => {
    if (transferDirection === TransferDirection.toVenue) {
      setTransferDirection(TransferDirection.fromVenue);
    } else {
      setTransferDirection(TransferDirection.toVenue);
    }

    // 切换后重置金额
    setAmount('');
  };

  const maxValue = useMemo(() => {
    // 转到场馆 去用户余额
    if (transferDirection === TransferDirection.toVenue) {
      return Number(balance);
    }

    return selectGameItem?.balance ?? 0;
  }, [transferDirection, balance, selectGameItem]);

  // 金额输入变化
  const changeAmount = (value: string) => {
    if (/^\d*$/.test(value)) {
      if (Number(value) > maxValue) {
        setAmount(String(maxValue));
      } else {
        setAmount(value);
      }
    }
  };

  // 点击"最大"按钮，设置金额为最大可转金额
  const setMax = () => {
    setAmount(String(maxValue));
  };

  // 执行转账逻辑，调用接口进行校验
  const handleTransfer = async () => {
    if (!selectGameItem) return;
    if (!blockAgentVenueAccess({ isAgent, isRiskAccount }, '当前账号暂不支持进行场馆转账操作')) {
      return;
    }

    try {
      setLoading(true);
      const params = {
        gameType: selectGameItem.gameType,
      };
      const { code } = await checkWeekStatus(params);
      if (code === 0) {
        const modal = Modal.open({
          title: '温馨提示',
          content: '转入当前场馆后，需要一倍流水才可转出',
          footer: (
            <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
              <Button type="second" onClick={() => modal.close()} style={{ flex: 1 }}>
                取消
              </Button>
              <Button
                type="primary"
                style={{ flex: 1 }}
                onClick={() => {
                  modal.close();
                  doTransfer();
                }}
              >
                确认
              </Button>
            </div>
          ),
        });
      } else if (code === 1) {
        doTransfer();
      }
    } finally {
      setLoading(false);
    }
  };

  // 执行转账接口调用
  const doTransfer = async () => {
    // 执行转账接口调用
    if (!selectGameItem) return;

    try {
      setShowMaskLoading(true);
      const payload = {
        cash: parseFloat(amount),
        gameId: selectGameItem?.gameId,
      };
      // 根据转账方向调用不同的API
      const action =
        transferDirection === TransferDirection.toVenue ? doGameDeposit : doGameWithdraw;
      await action(payload);
      toast({ type: 'success', description: '操作成功' });
      // 重置输入框
      setAmount('');

      getMemberInfo(); // 更新用户信息（中心钱包余额）
      // 更新对应场馆余额
      updateBlanceByGameId(payload.gameId);
    } catch (e) {
      throw e;
    } finally {
      setShowMaskLoading(false);
    }
  };

  return {
    /** 输入金额 */
    amount,
    /** 金额输入变化事件 */
    changeAmount,
    /** 点击"最大"按钮事件 */
    setMax,
    /** 转账方向 */
    transferDirection,
    /** 切换转账方向事件 */
    changeTransferDirection,
    /** 选中的账号名称 - 转入场馆显示中心钱包 */
    transferInAccountName,
    /** 选中的账号名称 - 转出场馆显示选中账号 */
    transferOutAccountName,
    /** 是否禁用转账按钮 */
    disabled,
    /** 执行转账事件 */
    handleTransfer,
    /** 选中的账号 */
    selectGameItem,
    /** 设置选中账号事件 */
    setSelectGameItem,
    /** 按钮提交loading  */
    loading,
    showMaskLoading,
  };
}
