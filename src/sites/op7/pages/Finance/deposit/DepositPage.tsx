import React from 'react';

import Header from '../components/header';
import Deposit from './index';

import styles from './depositPage.module.scss';
import { ETransRecordType } from '@/apis/commonSports/constants';

/**
 * 充值页（与转账页相同：独立页面 + section，由外层主区域滚动）
 */
const DepositPage: React.FC = () => {
  return (
    <div className={styles.depositPage}>
      <Header title="充值" recordType={ETransRecordType.Deposit} />
      <section>
        <Deposit />
      </section>
    </div>
  );
};

export default DepositPage;
