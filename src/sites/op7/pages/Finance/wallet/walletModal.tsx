import React, { useEffect, useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Overlay from '@/common/components/Overlay';
// import WalletTab from '../components/walletTab';
import Balance from '../components/balance';
import Deposit from '../deposit';
import Withdrawal from '../withdrawal';
import Transfer from '../transferPage';
import DepositV2 from '@/sites/op7/pages/FinanceV2/deposit';
import VersionChangeModal from '@/sites/op7/pages/Finance/deposit/components/versionChange';
import {
  DEPOSIT_VERSION_CHANGE_EVENT,
  getDepositVersion,
  getInitialDepositVersion,
  setSessionDepositVersion,
} from '@/sites/op7/pages/Finance/deposit/version';
// constants
import { WalletType } from '../constants';
import { zIndexMap } from '@/utils/constants/zIndex';

// styles
import styles from './walletModal.module.scss';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
// import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
// import { PATHS } from '@/sites/op7/routes/paths';
// import { ModalCloseButton } from '@/sites/op7/components/themeIcon';

const WalletModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  type?: WalletType;
}> = ({ visible, onClose, type = WalletType.Deposit }) => {
  const [tabType, setTabType] = useState(WalletType.Deposit);
  const [depositVersion, setDepositVersion] = useState(getInitialDepositVersion);
  const [versionModalVisible, setVersionModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setTabType(type);
      void getDepositVersion().then((version) => {
        setDepositVersion(version);
      });
    }
  }, [visible, type]);

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

  const headerTitle =
    tabType === WalletType.Deposit ? '充值' : tabType === WalletType.Transfer ? '转账' : '提现';
  const isDeposit = tabType === WalletType.Deposit;
  const isNewDeposit = depositVersion === 'new';
  // const navigate = useNavigateWithLanguage();
  const openCustomerService = useOpenCustomerService();

  return (
    <ClientOnly>
      <>
        <Overlay
          show={visible}
          close={onClose}
          position="center"
          maskClickClose
          zIndex={zIndexMap.walletModal}
        >
          <div className={styles.walletModal}>
            <header>
              <div
                className={isDeposit ? styles.clickableTitle : ''}
                onClick={() => {
                  if (isDeposit) setVersionModalVisible(true);
                }}
              >
                {headerTitle}
              </div>
              <div className={styles.actions}>
                {/* <div className={styles.button} onClick={() => navigate(PATHS.mineTransactionRecord)}>
                <Icon
                  src="/images/common/record_withdrawl.svg"
                  size="20px"
                  color="var(--Text-Main-10)"
                />
              </div> */}
                <div className={styles.button} onClick={openCustomerService}>
                  <Icon
                    src="/images/common/CustomerService.svg"
                    size="18px"
                    color="var(--Text-Main-10)"
                  />
                  {/* <Icon src="/images/common/customer.svg" size="16px" color="var(--Text-Main-10)" /> */}
                </div>

                <div className={styles.button} onClick={onClose}>
                  {/* <ModalCloseButton  onClick={onClose}/> */}
                  <Icon
                    src="/images/common/commonCha.svg"
                    size="16px"
                    color="var(--Text-Main-10)"
                  />
                </div>
              </div>
            </header>

            <section>
              {/* <WalletTab type={tabType} onChange={setTabType} hideInWeb={false} /> */}

              {tabType === WalletType.Withdrawal && (
                <Balance hideInWeb={false} walletType={tabType} />
              )}

              {isDeposit ? (
                isNewDeposit ? (
                  <DepositV2 inModal={true} />
                ) : (
                  <Deposit inModal={true} />
                )
              ) : tabType === WalletType.Transfer ? (
                <Transfer inModal showService={false} />
              ) : (
                <Withdrawal inModal={true} onCloseModal={onClose} />
              )}
            </section>
          </div>
        </Overlay>
        <VersionChangeModal
          visible={versionModalVisible}
          value={depositVersion}
          onClose={() => setVersionModalVisible(false)}
          onChange={(version) => {
            setSessionDepositVersion(version);
            setDepositVersion(version);
          }}
        />
      </>
    </ClientOnly>
  );
};

export default WalletModal;
