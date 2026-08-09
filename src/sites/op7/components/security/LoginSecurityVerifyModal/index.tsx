import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import FormInput from '@/sites/op7/components/FormInput';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import SecurityModalHeader from '@/sites/op7/components/security/SecurityModalHeader';
import {
  getSecurityCenterReq,
  type SecurityCenterResponse,
  verifyCashPasswordReq,
} from '@/apis/origin/login';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';

import styles from '../VerifyPaymentPasswordModal/VerifyPaymentPasswordModal.module.scss';

const LOGIN_SECURITY_VERIFY_TYPE = 1;
const UNSUPPORTED_LOGIN_VERIFY_KEYS = ['Gesture_Password'];

interface LoginVerifyResponse {
  token?: string;
  email?: string;
  phone?: string;
  securityCode?: boolean;
  bindGesturePwd?: boolean;
  [key: string]: unknown;
}

export interface LoginSecurityVerifyModalProps {
  show: boolean;
  loginName: string;
  onClose: () => void;
  onSuccess: (token: string) => void | Promise<void>;
  onForgotPassword?: () => void;
}

const LoginSecurityVerifyModal: React.FC<LoginSecurityVerifyModalProps> = ({
  show,
  loginName,
  onClose,
  onSuccess,
  onForgotPassword,
}) => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
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
  const [securityData, setSecurityData] = useState<SecurityCenterResponse | null>(null);

  const resetState = useCallback(() => {
    setPassword('');
    setToken('');
    setError('');
    setLoading(false);
    setSecurityVerifyVisible(false);
    setSecurityData(null);
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

  const handleSubmit = useCallback(async () => {
    const trimmed = password.trim();

    if (!trimmed) {
      setError(t('bindPaymentPassword.passwordRequired'));
      return;
    }

    if (!/^\d{6}$/.test(trimmed)) {
      setError(t('bindPaymentPassword.passwordLength6'));
      return;
    }

    if (!loginName.trim()) {
      setError(t('login.usernameRequired'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyCashPasswordReq({
        loginName: loginName.trim(),
        cashPassword: trimmed,
        type: LOGIN_SECURITY_VERIFY_TYPE,
      });
      const data = (res?.data as LoginVerifyResponse | undefined) ?? {};
      const nextToken = data.token ?? '';
      const needSecondVerify = !!(
        data.email ||
        data.phone ||
        data.securityCode ||
        data.bindGesturePwd
      );

      if (!nextToken) {
        setError(t('bindPaymentPassword.verifyFailed'));
        setLoading(false);
        return;
      }

      if (!needSecondVerify) {
        setLoading(false);
        await onSuccess(nextToken);
        handleClose();
        return;
      }

      try {
        const securityRes = await getSecurityCenterReq({ loginName: loginName.trim() });
        setSecurityData(securityRes?.data ?? null);
      } catch {
        setSecurityData(null);
      }

      setToken(nextToken);
      setPassword('');
      setLoading(false);
      setSecurityVerifyVisible(true);
    } catch (err: unknown) {
      let nextError = t('bindPaymentPassword.verifyFailed');
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { info?: string; message?: string } }).response;
        if (response) {
          nextError = response.info || response.message || nextError;
        }
      } else if (err instanceof Error) {
        nextError = err.message || nextError;
      }
      setError(nextError);
      setLoading(false);
    }
  }, [handleClose, loginName, onSuccess, password, t]);

  const canSubmit = /^\d{6}$/.test(password.trim());
  const showMainOverlay = show && !securityVerifyVisible;

  return (
    <>
      <Overlay
        show={showMainOverlay}
        close={handleClose}
        position={overlayPosition}
        maskClickClose={false}
        zIndex={zIndexMap.loginModal + 1}
        durationEnter={0}
        durationExit={0}
      >
        <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <SecurityModalHeader
            title={t('securityVerify.title')}
            subtitle={t('verifyPaymentPassword.subtitle')}
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
                    onForgotPassword ? (
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
                onClick={() => void handleSubmit()}
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
        visible={show && securityVerifyVisible}
        onClose={handleClose}
        title={t('securityVerify.title')}
        tip={t('securityVerify.tip')}
        mainSubtitle=""
        microsoftStepPageTitle={t('securityVerify.title')}
        microsoftVerifyType={LOGIN_SECURITY_VERIFY_TYPE}
        excludeKeys={UNSUPPORTED_LOGIN_VERIFY_KEYS}
        loginName={loginName.trim()}
        securityData={securityData}
        onVerifySuccess={(_, tokenFromVerify) => {
          const finalToken = tokenFromVerify ?? token;
          setSecurityVerifyVisible(false);
          void onSuccess(finalToken);
          handleClose();
        }}
      />
    </>
  );
};

export default LoginSecurityVerifyModal;
