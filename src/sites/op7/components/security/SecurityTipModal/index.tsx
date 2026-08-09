import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/common/components/Modal';
import { zIndexMap } from '@/utils/constants/zIndex';
import Button from '@/common/components/Button';

export interface SecurityTipModalProps {
  show: boolean;
  onClose: () => void;
  onGo: () => void;
  content?: ReactNode;
  cancelText?: string;
  onCancel?: () => void;
  confirmText?: string;
}

const SecurityTipModal: React.FC<SecurityTipModalProps> = ({
  show,
  onClose,
  onGo,
  content,
  cancelText,
  onCancel,
  confirmText,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      show={show}
      onClose={onClose}
      title={
        <div className="flex items-center justify-center gap-2">
          <img src="/images/common/login/safe-tip.svg" alt="" width={16} height={16} />
          <span className="text-[var(--Text-Main-10)] font-semibold">
            {t('securityCenter.securityTip')}
          </span>
        </div>
      }
      showCloseButton
      closeButtonClassName="!right-0 !top-0"
      confirmText={confirmText ?? t('securityCenter.goTo')}
      onConfirm={onGo}
      maskClickClose
      zIndex={zIndexMap.loginModal + 2}
      position="center"
      footer={
        cancelText ? (
          <div className="flex w-full justify-center gap-12px">
            <Button
              type="second"
              className="flex-1"
              onClick={() => {
                onCancel?.();
                onClose();
              }}
            >
              {cancelText}
            </Button>
            <Button type="primary" className="flex-1" onClick={onGo}>
              {confirmText ?? t('securityCenter.goTo')}
            </Button>
          </div>
        ) : undefined
      }
    >
      {typeof content === 'string' || !content ? (
        <p className="text-center text-[var(--Text-800)] text-[12px] leading-relaxed">
          {content ?? t('securityCenter.securityTipContent')}
        </p>
      ) : (
        content
      )}
    </Modal>
  );
};

export default SecurityTipModal;
