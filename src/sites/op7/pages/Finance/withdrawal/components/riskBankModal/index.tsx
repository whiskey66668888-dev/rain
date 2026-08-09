import React, { useEffect, useMemo, useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Button from '@/common/components/Button';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import { AccountItem } from '@/apis/origin/finance/withdrawal';
import { zIndexMap } from '@/utils/constants/zIndex';

// styles
import styles from './index.module.scss';

const RiskBankModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onComplete: (val: number) => void | Promise<void>; // 1 切换安全银行卡 2 继续出款
  accountItem: AccountItem; // 当前选中银行
  safeAccountList: AccountItem[]; // 安全银行
  riskContent1: string;
  riskContent2: string;
  countDown: number;
}> = ({
  visible,
  accountItem,
  safeAccountList,
  riskContent1,
  riskContent2,
  countDown,
  onClose,
  onComplete,
}) => {
  // 用 useState 来管理当前的剩余时间（秒）
  const [timeLeft, setTimeLeft] = useState(0);

  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  useEffect(() => {
    if (!visible) return;

    if (countDown <= 0) return;

    setTimeLeft(countDown); // reset when opened
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, countDown]);

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.walletSubModal}
      >
        <div className={`${styles.riskBankModal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            风险提示
            <div className={styles.bnClose} onClick={onClose}>
              <Icon src="/images/common/commonCha.svg" size={12} color="var(--Text-Main-10)" />
            </div>
          </header>
          <section>
            <div className={styles.riskInfo}>
              <div className={styles.bankItem}>
                <div className={styles.title}>风险银行</div>
                <div className={styles.right}>
                  <img src={accountItem.cardLogo} />
                  <span>{accountItem.name}</span>
                </div>
              </div>

              <div className={styles.riskContent}>
                <div className={styles.title}>风险提示</div>
                <div>
                  {riskContent1 && <p>{riskContent1}</p>}
                  {riskContent2 && <p>{riskContent2}</p>}
                </div>
              </div>
            </div>

            <div className={styles.bnList}>
              <Button
                type="primary"
                className={styles.bnSelectOtherBank}
                onClick={() => {
                  onComplete(1);
                }}
              >
                选择其他银行卡({safeAccountList.length})
                <div className={styles.bnTip}>
                  <div>高</div>
                  <div>出款安全</div>
                </div>
              </Button>

              <Button
                type="second"
                className={styles.bnContinue}
                onClick={() => {
                  onComplete(2);
                }}
              >
                继续出款 {timeLeft <= 0 ? null : `(${timeLeft}s)`}
              </Button>
            </div>
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default RiskBankModal;
