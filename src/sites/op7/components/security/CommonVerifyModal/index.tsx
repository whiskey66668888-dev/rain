import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import FormInput from '@/sites/op7/components/FormInput';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import SecurityModalHeader from '@/sites/op7/components/security/SecurityModalHeader';
import { getSecurityCenterReq, verifyCashPasswordReq } from '@/apis/origin/login';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';

import styles from '../VerifyPaymentPasswordModal/VerifyPaymentPasswordModal.module.scss';

export interface CommonVerifyModalProps {
  title: string;
  subtitle?: string;
  show: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  verifyType?: number;
  hasPaymentPassword?: boolean;
  onForgotPassword?: () => void;
}

const DEFAULT_VERIFY_TYPE = 6;

const CommonVerifyModal: React.FC<CommonVerifyModalProps> = ({
  title,
  subtitle,
  show,
  onClose,
  onSuccess,
  verifyType = DEFAULT_VERIFY_TYPE,
  hasPaymentPassword = false,
  onForgotPassword,
}) => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';
  const openCustomerService = useOpenCustomerService();

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityVerifyVisible, setSecurityVerifyVisible] = useState(false);

  const resetState = useCallback(() => {
    setPassword('');
    setToken('');
    setError('');
    setLoading(false);
    setSecurityVerifyVisible(false);
  }, []);

  useEffect(() => {
    if (!show) {
      resetState();
    }
  }, [resetState, show]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleSubmit = useCallback(() => {
    const trimmed = password.trim();

    if (!trimmed) {
      setError(t('bindPaymentPassword.passwordRequired'));
      return;
    }

    if (!/^\d{6}$/.test(trimmed)) {
      setError(t('bindPaymentPassword.passwordLength6'));
      return;
    }

    setError('');
    setLoading(true);

    verifyCashPasswordReq({
      loginName,
      cashPassword: trimmed,
      type: verifyType,
    })
      .then((res) => {
        const nextToken = (res?.data as { token?: string } | undefined)?.token ?? '';
        setToken(nextToken);
        setPassword('');
        setSecurityVerifyVisible(true);
      })
      .catch(() => {
        setError(t('bindPaymentPassword.verifyFailed'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loginName, password, t, verifyType]);

  const canSubmit = /^\d{6}$/.test(password.trim());

  return (
    <>
      <Overlay
        show={show}
        close={handleClose}
        position={overlayPosition}
        maskClickClose={false}
        zIndex={zIndexMap.loginModal}
        durationEnter={0}
        durationExit={0}
      >
        <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <SecurityModalHeader
            title={title}
            subtitle={subtitle}
            onBack={handleClose}
            isMobile={isMobile}
            onClose={handleClose}
            onCustomerClick={openCustomerService}
            customerAriaLabel={t('customerService.chooseServiceTitle')}
          />

          <div className={styles.content}>
            <div className={styles.stepContent}>
              <div className={styles.inputSection}>
                <FormInput
                  type="password"
                  placeholder={t('verifyPaymentPassword.passwordPlaceholder')}
                  value={password}
                  onChange={(value) => {
                    setPassword(value.replace(/\D/g, '').slice(0, 6));
                    if (error) {
                      setError('');
                    }
                  }}
                  error={error}
                  showError={!!error}
                  variant={isMobile ? 'light' : 'default'}
                  rightSlot={
                    hasPaymentPassword && onForgotPassword ? (
                      <button
                        type="button"
                        className={styles.forgotLink}
                        onClick={onForgotPassword}
                      >
                        {t('verifyPaymentPassword.forgotPaymentPassword')}
                      </button>
                    ) : undefined
                  }
                />
              </div>

              <Button
                type="primary"
                htmlType="button"
                className={`${styles.submitBtn} ${canSubmit ? styles.submitBtnActive : styles.submitBtnInactive}`}
                onClick={handleSubmit}
                loading={loading}
                disabled={!canSubmit || loading}
              >
                {t('verifyPaymentPassword.nextStep')}
              </Button>
            </div>
          </div>
        </div>
      </Overlay>

      <SecurityVerifyModal
        visible={securityVerifyVisible}
        onClose={() => setSecurityVerifyVisible(false)}
        title={title}
        mainSubtitle={''}
        microsoftStepPageTitle={title}
        microsoftVerifyType={verifyType}
        onVerifySuccess={(_, tokenFromVerify) => {
          const finalToken = tokenFromVerify ?? token;

          setSecurityVerifyVisible(false);
          void getSecurityCenterReq();
          onSuccess(finalToken);
          handleClose();
        }}
      />
    </>
  );
};

export default CommonVerifyModal;
