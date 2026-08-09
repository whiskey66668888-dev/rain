import React from 'react';

import clsx from 'clsx';
import Icon from '@/common/components/Icon';

import { TransferDirection } from '../../../constants';

import styles from './mobile.module.scss';

interface TransferDirectionMobileProps {
  transferOutAccountName: string;
  transferInAccountName: string;
  transferDirection: TransferDirection;
  showAccountPicker: (val: boolean) => void;
  changeTransferDirection: () => void;
  inModal?: boolean;
}

const TransferDirectionMobile: React.FC<TransferDirectionMobileProps> = ({
  transferOutAccountName,
  transferInAccountName,
  transferDirection,
  showAccountPicker,
  changeTransferDirection,
  inModal = false,
}) => {
  return (
    <div className={clsx(styles.transferDirectionMobile, inModal && styles.inModal)}>
      <div className={styles.contentRow}>
        <div className={styles.leftRail}>
          <div className={styles.leftRailTop}>
            <span className={styles.label}>从</span>
          </div>
          <div className={styles.dots} aria-hidden>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <div className={styles.leftRailBottom}>
            <span className={styles.label}>到</span>
          </div>
        </div>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.tagOut}>转出</span>
            <span
              className={styles.walletName}
              onClick={() => {
                if (transferDirection === TransferDirection.fromVenue) {
                  showAccountPicker(true);
                }
              }}
              style={{
                cursor: transferDirection === TransferDirection.fromVenue ? 'pointer' : 'default',
              }}
            >
              <span className={styles.walletNameText}>{transferOutAccountName}</span>
              {transferDirection === TransferDirection.fromVenue && (
                <Icon
                  className={styles.rightArrow}
                  src="/images/common/single_arrow.svg"
                  size="16px"
                  color="var(--Text-700)"
                />
              )}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.tagIn}>转入</span>
            <span
              className={styles.walletName}
              onClick={() => {
                if (transferDirection === TransferDirection.toVenue) {
                  showAccountPicker(true);
                }
              }}
              style={{
                cursor: transferDirection === TransferDirection.toVenue ? 'pointer' : 'default',
              }}
            >
              <span className={styles.walletNameText}>{transferInAccountName}</span>
              {transferDirection === TransferDirection.toVenue && (
                <Icon
                  className={styles.rightArrow}
                  src="/images/common/single_arrow.svg"
                  size="16px"
                  color="var(--Text-700)"
                />
              )}
            </span>
          </div>
        </div>
      </div>

      <span className={styles.arrowIconBox} onClick={changeTransferDirection}>
        <img className={styles.icon} src="/images/common/finance/ic_transfer.svg" alt="" />
      </span>
    </div>
  );
};

export default TransferDirectionMobile;
