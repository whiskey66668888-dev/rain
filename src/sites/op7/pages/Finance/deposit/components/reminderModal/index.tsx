import React, { useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import Overlay from '@/common/components/Overlay';
import CircleCheck from '@/common/components/CircleCheck';
import { CurrencyType } from '../../../constants';
import Button from '@/common/components/Button';
import { zIndexMap } from '@/utils/constants/zIndex';

// styles
import styles from './index.module.scss';

export interface CurrencyItem {
  icon: string;
  name: string;
  value: CurrencyType;
}

const ReminderModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (isReminder: boolean) => void;
}> = ({ visible, onClose, onSubmit }) => {
  const [isAgree, setAgree] = useState(false);
  const [isChecked, setChecked] = useState(false);

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position="center"
        maskClickClose
        zIndex={zIndexMap.walletSubModal}
      >
        <div className={styles.reminderModal}>
          <header>
            重要提醒
            <div className={styles.bnClose} onClick={onClose}>
              <Icon src="/images/common/close.svg" size={16} color="var(--Text-Main-10)" />
            </div>
          </header>
          <section>
            <div className={styles.text}>
              为了避免延迟上分
              <br />
              <span className={styles.red}>请勿修改金额、保存支付、延迟支付。</span>
              <br />
              【未按提示操作，造成损失概不负责！】
            </div>
            <div className={styles.checkedBox}>
              <div className={styles.checkedItem} onClick={() => setAgree(!isAgree)}>
                <CircleCheck checked={isAgree} />
                <span>我已清楚明白注意事项</span>
              </div>
              <div className={styles.checkedItem} onClick={() => setChecked(!isChecked)}>
                <CircleCheck checked={isChecked} />
                <span>24小时内不再提醒</span>
              </div>
            </div>
          </section>
          <footer>
            <Button type="second" className={styles.button} onClick={() => onClose()}>
              取消
            </Button>
            <Button
              className={styles.button}
              type="primary"
              onClick={() => onSubmit(isChecked)}
              disabled={!isAgree}
            >
              确认
            </Button>
          </footer>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default ReminderModal;
