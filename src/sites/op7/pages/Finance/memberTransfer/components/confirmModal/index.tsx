import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Overlay from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import CusInput from '../CusInput';
import { toast } from '@/common/components/Toast';
import { formatValue } from '../../../utils';

import { zIndexMap } from '@/utils/constants/zIndex';
import { useAppSelector } from '@/core/store/hooks';
import type { OverlayPosition } from '@/common/components/Overlay';

import styles from './index.module.scss';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: string;
  account: string;
}

const maskFirstFourChars = (input: string) => {
  if (!input) return '';
  if (input.length <= 4) return '****';
  return `****${input.slice(4)}`;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  account,
  amount,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [failTimes, setFailTimes] = useState(0);

  const resetState = useCallback(() => {
    setVerified(false);
    setError(false);
    setFailTimes(0);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible, resetState]);

  const verifyPrefix = useCallback(
    (value: string) => {
      if (value.length > 0 && value.length < 4) {
        setError(false);
        setVerified(false);
        return;
      }

      if (value.length < 4) {
        setVerified(false);
        return;
      }

      if (account.substring(0, 4).toLowerCase() === value.toLowerCase()) {
        setVerified(true);
        setError(false);
        return;
      }

      setVerified(false);
      setError(true);
      setFailTimes((prev) => prev + 1);
      toast({ type: 'warning', description: '输入的账号前4位不正确，请重新确认' });
    },
    [account],
  );

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = () => {
    if (!verified) return;
    resetState();
    onConfirm();
  };

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={handleClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.walletSubModal}
      >
        <div className={`${styles.confirmModal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            确认转入账号
            <div className={styles.bnClose} onClick={handleClose}>
              <Icon src="/images/common/commonCha.svg" size={16} color="var(--Text-Main-10)" />
            </div>
          </header>

          <section>
            <div className={styles.transferBox}>
              <div className={styles.topTips}>请输入账号前4位，确认对方的身份信息</div>

              <div className={styles.box}>
                <span className={styles.label}>转入账户</span>
                <span className={styles.value}>{maskFirstFourChars(account)}</span>
              </div>

              <div className={styles.box}>
                <span className={styles.label}>转入资金</span>
                <span className={styles.valueAmount}>¥{formatValue(amount)}</span>
              </div>

              <CusInput
                className={styles.passcode}
                containerClassName={styles.passcodeContainer}
                cellClassName={styles.passcodeCell}
                length={4}
                numericOnly={false}
                error={error}
                onChange={verifyPrefix}
              />

              {failTimes > 2 && (
                <div className={styles.warningTips}>
                  <img src="/images/common/toast/warn_r.svg" alt="" />
                  多次输入错误，请确认转入账号是否正确
                </div>
              )}
            </div>

            <div className={styles.footer}>
              {/*<Button type="second" className={styles.footerBtn} onClick={handleClose}>
                取消
              </Button>*/}
              <Button
                type="primary"
                className={styles.footerBtn}
                disabled={!verified}
                onClick={handleConfirm}
              >
                确认
              </Button>
            </div>
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default ConfirmModal;
