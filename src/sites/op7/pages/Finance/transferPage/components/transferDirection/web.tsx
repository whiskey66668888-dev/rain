import React from 'react';

import clsx from 'clsx';
import Icon from '@/common/components/Icon';

import { TransferDirection } from '../../../constants';

import styles from './web.module.scss';

interface TransferDirectionWebProps {
  transferOutAccountName: string;
  transferInAccountName: string;
  transferDirection: TransferDirection;
  showAccountPicker: (val: boolean) => void;
  changeTransferDirection: () => void;
  inModal?: boolean;
}

const TransferDirectionWeb: React.FC<TransferDirectionWebProps> = ({
  transferOutAccountName,
  transferInAccountName,
  transferDirection,
  showAccountPicker,
  changeTransferDirection,
  inModal = false,
}) => {
  return (
    <div className={clsx(styles.transferDirectionWeb, inModal && styles.inModal)}>
      <div className={styles.row}>
        <span className={styles.label}>从</span>

        <div className={styles.rowContent}>
          <div className={styles.left}>
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
            </span>
          </div>

          {transferDirection === TransferDirection.fromVenue ? (
            <Icon
              className={styles.rightArrow}
              src="/images/common/single_arrow.svg"
              size="16px"
              color="var(--Text-700)"
            />
          ) : (
            <span className={styles.rightArrow}></span>
          )}
        </div>
      </div>

      <span className={styles.arrowIconBox} onClick={changeTransferDirection}>
        <img className={styles.icon} src="/images/common/finance/ic_transfer.svg" />
      </span>

      <div className={styles.row}>
        <span className={styles.label}>到</span>
        <div
          className={styles.rowContent}
          onClick={() => {
            if (transferDirection === TransferDirection.toVenue) {
              showAccountPicker(true);
            }
          }}
        >
          <div className={styles.left}>
            <span className={styles.tagIn}>转入</span>
            <span
              className={styles.walletName}
              style={{
                cursor: transferDirection === TransferDirection.toVenue ? 'pointer' : 'default',
              }}
            >
              <span className={styles.walletNameText}>{transferInAccountName}</span>
            </span>
          </div>

          {transferDirection === TransferDirection.toVenue ? (
            <Icon
              className={styles.rightArrow}
              src="/images/common/single_arrow.svg"
              size="16px"
              color="var(--Text-700)"
            />
          ) : (
            <span className={styles.rightArrow}></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferDirectionWeb;
