import React from 'react';
import clsx from 'clsx';
import { WalletType } from '../../constants';
// styles
import styles from './index.module.scss';
/**
 * 钱包 tab 只有h5 显示
 */
const Tab: React.FC<{
  type: WalletType;
  onChange: (val: WalletType) => void;
  hideInWeb?: boolean; // 是否在弹出框中显示 弹出框中显示 使用h5 模式
}> = ({ type, onChange, hideInWeb = false }) => {
  return (
    <div className={clsx(styles.tabContainer, hideInWeb ? styles.hideInWeb : '')}>
      <div
        className={clsx(styles.tabItem, type === WalletType.Deposit ? styles.active : '')}
        onClick={() => {
          onChange(WalletType.Deposit);
        }}
      >
        充值
      </div>
      <div
        className={clsx(styles.tabItem, type === WalletType.Withdrawal ? styles.active : '')}
        onClick={() => {
          onChange(WalletType.Withdrawal);
        }}
      >
        提现
      </div>
    </div>
  );
};

export default Tab;
