import React, { useMemo } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import LazyImage from '@/common/components/LazyImage';

import { useAppSelector } from '@/core/store/hooks';
// utils
import { getAccountName, getAccountTip } from '../../../utils';
import { zIndexMap } from '@/utils/constants/zIndex';
// styles
import styles from './index.module.scss';
import { AccountItem, WithdrawType } from '@/apis/origin/finance/withdrawal';
import { NewLoginModalClose } from '@/sites/op7/components/themeIcon';

export interface OtherItem {
  icon: string;
  label: string;
  tip?: string;
  onClick: () => void;
}

const AccountPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  list: AccountItem[];
  selectIdx: number;
  withdrawType: WithdrawType;
  onChange: (val: number) => void;
  otherItemList?: OtherItem[];
}> = ({ visible, onClose, list = [], selectIdx, withdrawType, onChange, otherItemList = [] }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const title = useMemo(() => {
    if (withdrawType === WithdrawType.bank) {
      return '选择提现银行卡';
    } else if (withdrawType === WithdrawType.virtual) {
      return '选择提现虚拟币';
    } else if (withdrawType === WithdrawType.digital) {
      return '选择提现数字币';
    } else if (withdrawType === WithdrawType.zfb) {
      return '选择提现支付宝';
    }
    return '';
  }, [withdrawType]);

  const onSelect = (index: number) => {
    onChange(index);
    onClose();
  };

  const clickHandle = (item: OtherItem) => {
    item.onClick();
    onClose();
  };

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.walletSubModal}
      >
        <div className={`${styles.accountPicker} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            {title}
            <NewLoginModalClose onClick={onClose} className={styles.bnClose} />
          </header>
          <section>
            <div className={styles.cardList}>
              {list.map((obj, index) => {
                const name = getAccountName({ type: withdrawType, item: obj });
                const tip = getAccountTip({ type: withdrawType, item: obj });
                return (
                  <div key={obj.id} className={styles.cardItem} onClick={() => onSelect(index)}>
                    <LazyImage lazy={false} src={obj.cardLogo} width={24} height={24} />
                    <div className={styles.cardText}>
                      <div className={styles.title}>{name}</div>
                      {tip && <div className={styles.tip}>{tip}</div>}
                    </div>
                    {index == selectIdx && (
                      <LazyImage
                        className={styles.selected}
                        src="/images/common/checkbox/ic_sel.svg"
                      />
                    )}
                  </div>
                );
              })}

              {otherItemList.map((obj, index) => (
                <div key={index} className={styles.cardItem} onClick={() => clickHandle(obj)}>
                  <LazyImage lazy={false} src={obj.icon} width={24} height={24} />
                  <div className={styles.cardText}>
                    <div className={styles.title}>{obj.label}</div>
                  </div>

                  <div className={styles.right}>
                    {obj.tip && <span className={styles.tip}>{obj.tip}</span>}
                    <Icon
                      src="/images/common/single_arrow.svg"
                      size="16px"
                      color="var(--Text-700)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default AccountPicker;
