import React, { useMemo } from 'react';
// components
import Icon from '@/common/components/Icon';
import Button from '@/common/components/Button';
import { toast } from '@/common/components/Toast';
import clsx from 'clsx';
// hooks
import { useBalance } from './useBalance';
// styles
import styles from './index.module.scss';
import { WalletType } from '../../constants';
/**
 * 钱包余额
 */
const Balance: React.FC<{ walletType?: WalletType; hideInWeb?: boolean }> = ({
  walletType = WalletType.Deposit,
  hideInWeb = false,
}) => {
  const { balance, loading, doRecycle } = useBalance();

  const isHideInWeb = useMemo(() => {
    // 充值 不需要一键回收  所以pc 端不用显示
    if (hideInWeb && walletType === WalletType.Deposit) return true;
    return false;
  }, [hideInWeb, walletType]);

  const onRecycle = async () => {
    try {
      await doRecycle();
      // 更新用户金额
      toast({
        type: 'success',
        title: '回收成功',
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={clsx(styles.balance, isHideInWeb ? styles.hideInWeb : '')}>
      <div className={styles.left}>
        <Icon src="/images/common/finance/ic_balance.svg" size="24px" color="var(--White-100)" />
        <span>
          <span>余额：</span>
          <span className={clsx(styles.amount, 'din-pro')}>{balance}</span>
        </span>
      </div>

      {walletType !== WalletType.Deposit && (
        <Button
          type="primary"
          className={styles.button}
          onClick={() => {
            onRecycle();
          }}
          loading={loading}
          disabled={loading}
        >
          {loading ? '' : '一键回收'}
        </Button>
      )}
    </div>
  );
};

export default Balance;
