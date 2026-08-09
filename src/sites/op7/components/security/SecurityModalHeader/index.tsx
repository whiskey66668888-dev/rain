import React, { ReactNode } from 'react';
import clsx from 'clsx';

import {
  ModalBackButton,
  ModalCloseButton,
  ModalCustomerButton,
} from '@/sites/op7/components/themeIcon';

import styles from './SecurityModalHeader.module.scss';

export interface SecurityModalHeaderProps {
  /** 标题 */
  title: ReactNode;
  /** 副标题（可选） */
  subtitle?: ReactNode;
  /** 返回按钮点击 */
  onBack: () => void;
  /** 是否移动端，用于布局/样式区分 */
  isMobile: boolean;
  /** 关闭回调，桌面端右侧显示关闭按钮 */
  onClose?: () => void;
  /** 客服按钮点击（传入时移动端和桌面端都会显示客服按钮） */
  onCustomerClick?: () => void;
  /** @deprecated 客服按钮现在会在桌面端默认显示，保留参数兼容旧调用 */
  showCustomerOnDesktop?: boolean;
  /** 客服按钮的 aria-label */
  customerAriaLabel?: string;
  /** 返回按钮 aria-label，默认「返回」 */
  backAriaLabel?: string;
  /** 根节点额外 class */
  className?: string;
}

const SecurityModalHeader: React.FC<SecurityModalHeaderProps> = ({
  title,
  subtitle,
  onBack,
  isMobile,
  onClose,
  onCustomerClick,
  customerAriaLabel,
  backAriaLabel = '返回',
  className,
}) => {
  const showCustomer = onCustomerClick != null;
  const showClose = onClose != null && (!showCustomer || !isMobile);
  const rightContent =
    showCustomer || showClose ? (
      <>
        {showCustomer && (
          <ModalCustomerButton
            className={styles.customerBtn}
            onClick={onCustomerClick}
            ariaLabel={customerAriaLabel}
          />
        )}
        {showClose && <ModalCloseButton className={styles.headerCloseBtn} onClick={onClose} />}
      </>
    ) : null;

  return (
    <div className={clsx(styles.header, isMobile ? styles.mobile : styles.desktop, className)}>
      <ModalBackButton className={styles.backBtn} onClick={onBack} ariaLabel={backAriaLabel} />
      <div className={styles.titleWrap}>
        <span className={styles.title}>{title}</span>
        {subtitle != null && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {rightContent != null && <div className={styles.headerRight}>{rightContent}</div>}
    </div>
  );
};

export default SecurityModalHeader;
