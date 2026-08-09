import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import { openLoginModal } from '@/core/store/slices/authUISlice';

import styles from './ForgotPasswordSuccessModal.module.scss';

export interface ForgotPasswordSuccessModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordSuccessModal: React.FC<ForgotPasswordSuccessModalProps> = ({
  show,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  // H5 端也使用居中弹窗，与 Web 端一致
  const overlayPosition = useMemo<OverlayPosition>(() => 'center', []);

  const [countdown, setCountdown] = useState(5);

  // 倒计时逻辑
  useEffect(() => {
    if (!show) {
      setCountdown(5);
      return;
    }

    if (countdown <= 0) {
      // 倒计时结束，打开登录弹窗
      onClose();
      // 延迟打开登录弹窗，确保成功弹窗已关闭
      setTimeout(() => {
        dispatch(openLoginModal());
      }, 300);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [show, countdown, dispatch, onClose]);

  // 立即返回登录
  const handleGoToLogin = () => {
    // 先关闭成功弹窗
    onClose();
    // 延迟打开登录弹窗，确保成功弹窗已关闭
    setTimeout(() => {
      dispatch(openLoginModal());
    }, 300);
  };

  return (
    <Overlay
      show={show}
      close={onClose}
      position={overlayPosition}
      maskClickClose={false}
      zIndex={zIndexMap.loginModal + 1}
    >
      <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
        {/* 头部导航栏 */}
        <div className={styles.header}>
          <div className={styles.headerLeft} />
          <div className={styles.headerTitle}>
            <span>{t('forgotPassword.successTitle')}</span>
          </div>
          <div className={styles.headerRight}>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <div className={styles.closeIconWrapper}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4l8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className={styles.content}>
          {/* 提示文字 */}
          <div className={styles.message}>
            <p className={styles.messageText}>{t('forgotPassword.successMessage')}</p>
            <p className={styles.countdownText}>
              <span className={styles.countdownNumber}>{countdown}</span>
              <span>{t('forgotPassword.countdownSuffix')}</span>
            </p>
          </div>

          {/* 立即返回登录按钮 */}
          <Button type="primary" className={styles.loginButton} onClick={handleGoToLogin}>
            {t('forgotPassword.goToLogin')}
          </Button>
        </div>
      </div>
    </Overlay>
  );
};

export default ForgotPasswordSuccessModal;
