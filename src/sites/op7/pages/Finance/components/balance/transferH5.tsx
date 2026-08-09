import React from 'react';
// components
import Button from '@/common/components/Button';
import { toast } from '@/common/components/Toast';
import clsx from 'clsx';
// hooks
import { useBalance } from './useBalance';
// styles
import styles from './index.module.scss';
/**
 * 钱包 转账h5 余额
 */
const TransferBalance: React.FC<{ recycle?: () => void }> = ({ recycle }) => {
  const { balance, loading, doRecycle } = useBalance();

  const onRecycle = async () => {
    try {
      await doRecycle();
      // 更新用户金额
      toast({
        type: 'success',
        title: '回收成功',
      });

      if (recycle) {
        recycle();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={clsx(styles.transferBalance)}>
      <div className={styles.left}>
        <span>余额：</span>
        <span className={clsx(styles.amount, 'din-pro')}>{balance}</span>
      </div>

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
    </div>
  );
};

export default TransferBalance;
