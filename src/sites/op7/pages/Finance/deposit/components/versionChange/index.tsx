import React from 'react';

import { DepositVersionType } from '@/apis/origin/finance/depositV2';
import Modal from '@/common/components/Modal';

import styles from './index.module.scss';

interface VersionChangeModalProps {
  visible: boolean;
  value: DepositVersionType;
  onClose: () => void;
  onChange: (value: DepositVersionType) => void;
}

const VersionChangeModal: React.FC<VersionChangeModalProps> = ({
  visible,
  value,
  onClose,
  onChange,
}) => {
  const isNewVersion = value === 'new';

  return (
    <Modal
      show={visible}
      title="系统提示"
      position="bottom"
      showCloseButton
      footer={null}
      onClose={onClose}
      className={styles.modal}
      contentClassName={styles.content}
    >
      <button
        type="button"
        className={styles.primaryButton}
        onClick={() => {
          if (!isNewVersion) onChange('new');
          onClose();
        }}
      >
        {isNewVersion ? '继续使用新版充值' : '体验新版充值'}
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={() => {
          if (isNewVersion) onChange('old');
          onClose();
        }}
      >
        {isNewVersion ? '返回旧版充值' : '继续使用旧版充值'}
      </button>
    </Modal>
  );
};

export default VersionChangeModal;
