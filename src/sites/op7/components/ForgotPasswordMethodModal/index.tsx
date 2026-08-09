import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';

import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';

import styles from './ForgotPasswordMethodModal.module.scss';

// 静态资源
import navTip from '../../images/common/login/nav_tip.png';
import paycheckIcon from '../../images/common/login/paycheck.png';
import phoneIcon from '../../images/common/login/phone.png';

export interface ForgotPasswordMethodModalProps {
  show: boolean;
  onClose: () => void;
  /** 选择找回方式回调 */
  onSelectMethod?: (method: 'paymentPassword' | 'customer') => void;
}

const ForgotPasswordMethodModal: React.FC<ForgotPasswordMethodModalProps> = ({
  show,
  onClose,
  onSelectMethod,
}) => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const handleSelectMethod = (method: 'paymentPassword' | 'customer') => {
    onSelectMethod?.(method);
  };

  return (
    <Overlay
      show={show}
      close={onClose}
      position={overlayPosition}
      maskClickClose={false}
      zIndex={zIndexMap.loginModal}
    >
      <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
        {/* 头部导航栏 */}
        <div className={styles.header}>
          <span className={styles.title}>{t('forgotPassword.title')}</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 提示区域 */}
        <div className={styles.hint}>
          <div className={styles.hintIcon}>
            <img src={navTip} alt="" />
          </div>
          <span className={styles.hintText}>{t('forgotPassword.selectDynamicVerification')}</span>
        </div>

        {/* 内容区 */}
        <div className={styles.content}>
          {/* 选项列表 */}
          <div className={styles.methodList}>
            {/* 支付密码验证 */}
            <button
              type="button"
              className={styles.methodItem}
              onClick={() => handleSelectMethod('paymentPassword')}
            >
              <div className={styles.methodLeft}>
                <div className={styles.methodIcon}>
                  <img src={paycheckIcon} alt="" />
                </div>
                <span className={styles.methodText}>
                  {t('forgotPassword.methodPaymentPassword')}
                </span>
              </div>
              <div className={styles.methodArrow}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M3 2L7 5L3 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>

            {/* 联系人工客服 */}
            <button
              type="button"
              className={styles.methodItem}
              onClick={() => handleSelectMethod('customer')}
            >
              <div className={styles.methodLeft}>
                <div className={styles.methodIcon}>
                  <img src={phoneIcon} alt="" />
                </div>
                <span className={styles.methodText}>{t('forgotPassword.methodCustomer')}</span>
              </div>
              <div className={styles.methodArrow}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M3 2L7 5L3 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* 温馨提示 */}
          <div className={styles.warning}>
            <p className={styles.warningTitle}>{t('forgotPassword.warningTitle')}</p>
            <p className={styles.warningText}>{t('forgotPassword.warningText')}</p>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default ForgotPasswordMethodModal;
