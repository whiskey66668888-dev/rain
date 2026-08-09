import React from 'react';
import clsx from 'clsx';

import Overlay from '@/common/components/Overlay';
import CircleCheck from '@/common/components/CircleCheck';

import { NewLoginModalClose } from '../themeIcon';

import styles from './CommonDialog.module.scss';

export interface CommonDialogProps {
  visible: boolean;
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerButtonText?: React.ReactNode;
  onFooterButtonClick?: () => void;
  footerTipMsg?: React.ReactNode;
  footerTigMsg?: React.ReactNode;
  footerTipChecked?: boolean;
  onFooterTipClick?: () => void;
  maskClickClose?: boolean;
  /** 是否显示右上角关闭按钮，默认 true */
  showCloseButton?: boolean;
  dialogClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footerButtonClassName?: string;
  footerTipClassName?: string;
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  visible,
  onClose,
  header,
  children,
  footer,
  footerButtonText,
  onFooterButtonClick,
  footerTipMsg,
  footerTigMsg,
  footerTipChecked = false,
  onFooterTipClick,
  maskClickClose = false,
  showCloseButton = true,
  dialogClassName,
  bodyClassName,
  footerClassName,
  footerButtonClassName,
  footerTipClassName,
}) => {
  const resolvedFooterTipMsg = footerTipMsg ?? footerTigMsg;
  const hasFooterTip = resolvedFooterTipMsg != null;
  const hasDefaultFooter = footer == null && (footerButtonText != null || hasFooterTip);

  return (
    <Overlay show={visible} close={onClose} maskClickClose={maskClickClose} position="center">
      <div className={styles.wrapper}>
        <div
          className={clsx(
            styles.card,
            hasFooterTip ? styles.cardWithFooterTip : styles.cardWithoutFooterTip,
            dialogClassName,
          )}
        >
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {typeof header === 'string' || typeof header === 'number' ? (
                <span className={styles.headerTitle}>{header}</span>
              ) : (
                header
              )}
            </div>
            {showCloseButton && (
              <NewLoginModalClose onClick={onClose} className={styles.closeButton} />
            )}
          </div>

          <div className={clsx(styles.body, bodyClassName)}>{children}</div>

          {footer != null && <div className={clsx(styles.footer, footerClassName)}>{footer}</div>}

          {hasDefaultFooter && (
            <div className={clsx(styles.footer, footerClassName)}>
              {footerButtonText != null && (
                <button
                  type="button"
                  className={clsx(styles.footerButton, footerButtonClassName)}
                  onClick={onFooterButtonClick}
                >
                  {footerButtonText}
                </button>
              )}

              {hasFooterTip && (
                <CircleCheck
                  checked={footerTipChecked}
                  onChange={() => onFooterTipClick?.()}
                  className={clsx(styles.footerTip, footerTipClassName)}
                >
                  {resolvedFooterTipMsg}
                </CircleCheck>
              )}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
};

export default CommonDialog;
