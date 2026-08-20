import React, { useEffect, useState } from 'react';

import Header from '../components/header';
import Deposit from './index';

import { ETransRecordType } from '@/apis/commonSports/constants';
import DepositV2 from '@/sites/op7/pages/FinanceV2/deposit';

import VersionChangeModal from './components/versionChange';
import {
  DEPOSIT_VERSION_CHANGE_EVENT,
  getDepositVersion,
  getInitialDepositVersion,
  setSessionDepositVersion,
} from './version';

import styles from './DepositPage.module.scss';

/**
 * 充值页（与转账页相同：独立页面 + section，由外层主区域滚动）
 */
const DepositPage: React.FC = () => {
  const [depositVersion, setDepositVersion] = useState(getInitialDepositVersion);
  const [versionModalVisible, setVersionModalVisible] = useState(false);

  useEffect(() => {
    void getDepositVersion().then((version) => {
      setDepositVersion(version);
    });
  }, []);

  useEffect(() => {
    const onDepositVersionChange = (event: Event) => {
      const version = (event as CustomEvent<unknown>).detail;
      if (version === 'new' || version === 'old') {
        setDepositVersion(version);
      }
    };

    window.addEventListener(DEPOSIT_VERSION_CHANGE_EVENT, onDepositVersionChange);
    return () => {
      window.removeEventListener(DEPOSIT_VERSION_CHANGE_EVENT, onDepositVersionChange);
    };
  }, []);

  const isNewVersion = depositVersion === 'new';

  return (
    <div className={styles.depositPage} key={depositVersion}>
      <Header
        title="充值"
        recordType={ETransRecordType.Deposit}
        onTitleClick={() => setVersionModalVisible(true)}
      />
      {isNewVersion ? <DepositV2 /> : <Deposit />}

      <VersionChangeModal
        visible={versionModalVisible}
        value={depositVersion}
        onClose={() => setVersionModalVisible(false)}
        onChange={(version) => {
          setSessionDepositVersion(version);
          setDepositVersion(version);
        }}
      />
    </div>
  );
};

export default DepositPage;
