import React, { useMemo } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import LazyImage from '@/common/components/LazyImage';
import { CurrencyType } from '../../../constants';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
// styles
import styles from './index.module.scss';

export interface CurrencyItem {
  icon: string;
  name: string;
  value: CurrencyType;
}

const CurrencyPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  selectValue: CurrencyType;
  onChange: (val: CurrencyType) => void;
}> = ({ visible, onClose, selectValue, onChange }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const CurrencyOption: CurrencyItem[] = [
    {
      icon: '/images/common/finance/ic_trc20.svg',
      name: 'USDT',
      value: CurrencyType.usdt,
    },
    {
      icon: '/images/common/finance/ic_digital.svg',
      name: '人民币',
      value: CurrencyType.cny,
    },
  ];

  const onSelect = (value: CurrencyType) => {
    onChange(value);
    onClose();
  };

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.walletModal}
      >
        <div className={`${styles.currencyPicker} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            请选择币种
            <div className={styles.bnClose} onClick={onClose}>
              <Icon src="/images/common/commonCha.svg" size={12} color="var(--Text-Main-10)" />
            </div>
          </header>
          <section>
            <div className={styles.cardList}>
              {CurrencyOption.map((obj) => {
                return (
                  <div
                    key={obj.value}
                    className={styles.cardItem}
                    onClick={() => onSelect(obj.value)}
                  >
                    <LazyImage lazy={false} src={obj.icon} width={24} height={24} />
                    <div className={styles.cardText}>{obj.name}</div>
                    {obj.value == selectValue && (
                      <img className={styles.selected} src="/images/common/checkbox/ic_sel.svg" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default CurrencyPicker;
