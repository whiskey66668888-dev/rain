import React, { useMemo } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Pinput from '@/common/components/Pinput';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import { formatValue } from '../../../utils';
import { zIndexMap } from '@/utils/constants/zIndex';

// styles
import styles from './index.module.scss';

const CurrencyPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onComplete: (val: string) => void | Promise<void>;
  isUSDT: boolean;
  money: string;
}> = ({ visible, onClose, onComplete, isUSDT, money }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.walletSubModal}
      >
        <div className={`${styles.passwordModal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            请输入交易密码
            <div className={styles.bnClose} onClick={onClose}>
              <Icon src="/images/common/commonCha.svg" size={12} color="var(--Text-Main-10)" />
            </div>
          </header>
          <section>
            <div className={styles.title}>提现金额</div>
            <div className={styles.tip}>
              <span className={styles.unit}>{isUSDT ? '$' : '¥'}</span>
              <span className={styles.amount}>{formatValue(money)}</span>
            </div>
            <Pinput
              isPassword
              length={6}
              onComplete={(value) => {
                onComplete(value);
              }}
            />
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default CurrencyPicker;
