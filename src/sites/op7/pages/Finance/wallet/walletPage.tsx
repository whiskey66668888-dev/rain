import React from 'react';
// components
import Header from '../components/header';
import Balance from '../components/balance';
import Withdrawal from '../withdrawal';
import { WalletType } from '../constants';

// styles
import styles from './walletPage.module.scss';
import { ETransRecordType } from '@/apis/commonSports/constants';

/**
 * 钱包提现页（充值见 deposit/DepositPage，结构与转账页一致）
 */
const WalletPage: React.FC = () => {
  return (
    <div className={styles.walletPage}>
      <Header title="提现" showRecord recordType={ETransRecordType.Withdraw} />
      <section className={styles.sectionWithdrawal}>
        <div className={styles.withdrawalSection}>
          <Balance walletType={WalletType.Withdrawal} hideInWeb={true} />
          <Withdrawal />
        </div>
      </section>
    </div>
  );
};

export default WalletPage;
