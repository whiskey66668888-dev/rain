import React, { useMemo } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import Header from '@/sites/op7/pages/Finance/components/header';
import AddBank from './components/addBank';
import AddAlipay from './components/addAlipay';
import AddDigital from './components/addDigital';
import AddVirtual from './components/addVirtual';

import { BindAccountType, AccountVerifyMap } from '@/utils/constants/account';
import type { OverlayPosition } from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';

import styles from './BindBankModal.module.scss';
import { zIndexMap } from '@/utils/constants/zIndex';
import clsx from 'clsx';

interface BindBankModalProps {
  handleClose: () => void;
  handleSuccess: () => void; // 通知父级刷新数据
  visible: boolean;
  accountType?: BindAccountType;
  token?: string;
}

const BindBankModal: React.FC<BindBankModalProps> = ({
  handleClose,
  handleSuccess,
  visible,
  accountType,
  token,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const title = useMemo(() => {
    if (accountType != null) {
      return AccountVerifyMap[accountType].title;
    }
    return '';
  }, [accountType]);

  const onClose = (refresh?: boolean) => {
    if (refresh) {
      handleSuccess();
    }
    handleClose();
  };

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={handleClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.loginModal}
      >
        <div className={clsx(styles.bindBankModal, !isMobile ? styles.desktop : '')}>
          <Header
            title={title}
            showRecord={false}
            autoHide={false}
            onBack={handleClose}
            showClose
            onClose={handleClose}
          />

          {accountType === BindAccountType.bank && <AddBank token={token} onClose={onClose} />}

          {accountType === BindAccountType.otherBank && <AddBank token={token} onClose={onClose} />}

          {accountType === BindAccountType.digital && (
            <AddDigital token={token ?? ''} onClose={onClose} />
          )}
          {accountType === BindAccountType.virtual && (
            <AddVirtual token={token ?? ''} onClose={onClose} />
          )}
          {accountType === BindAccountType.alipay && (
            <AddAlipay token={token ?? ''} onClose={onClose} />
          )}
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default BindBankModal;
