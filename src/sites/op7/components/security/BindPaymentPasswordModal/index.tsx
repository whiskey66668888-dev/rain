import React, { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import FormInput from '../../FormInput';
import { toast } from '@/common/components/Toast';
import SecurityModalHeader from '../SecurityModalHeader';
import {
  getSecurityCenterReq,
  setCashPasswordReq,
  type SecurityCenterResponse,
  verifyLoginPasswordReq,
} from '@/apis/origin/login';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import styles from './BindPaymentPasswordModal.module.scss';

import navTip from '/images/common/login/nav_tip.png';

const VERIFY_LOGIN_FOR_CASH_TYPE = 3;
const SET_PAYMENT_PASSWORD_TYPE = 4;
// 忘记支付密码时仅支持手机/邮箱/微软令牌三类动态验证，手势密码不计入此入口。
const FORGOT_PAYMENT_PASSWORD_SECURITY_KEYS = ['Safety_Phone', 'Safety_Email', 'Microsoft_Token'];

function getTokenFromResponse(res: unknown): string {
  const data = (res as { data?: unknown })?.data;
  if (typeof data === 'object' && data !== null && 'token' in data) {
    return String((data as { token?: string }).token ?? '');
  }
  if (typeof data === 'object' && data !== null && 'data' in data) {
    const inner = (data as { data?: { token?: string } }).data;
    return String(inner?.token ?? '');
  }
  if (typeof data === 'string') return data;
  return String((res as { token?: string })?.token ?? '');
}

function getTokenFromErrorResponse(err: unknown): string | null {
  const response = (err as { response?: unknown })?.response;
  if (!response || typeof response !== 'object') return null;
  const data = (response as { data?: unknown }).data;
  if (typeof data === 'object' && data !== null && 'token' in data) {
    const t = (data as { token?: string }).token;
    return t != null ? String(t) : null;
  }
  if (typeof data === 'object' && data !== null && 'data' in data) {
    const inner = (data as { data?: { token?: string } }).data?.token;
    return inner != null ? String(inner) : null;
  }
  if (typeof data === 'string' && data.length > 0) return data;
  return null;
}

function isBackendPasswordError(err: unknown): boolean {
  const response = (err as { response?: { info?: string; message?: string } })?.response;
  if (!response) return false;
  const text = [response.info, response.message].filter(Boolean).join(' ');
  return /密码|错误|无效|不正确|失败/i.test(text);
}

const FORGOT_PAYMENT_PASSWORD_TYPE = 3;
type ForgotPaymentEntryMode = 'loading' | 'loginPassword' | 'securityVerify';

function hasForgotPaymentSecurityVerification(data?: SecurityCenterResponse | null): boolean {
  const list = Array.isArray(data?.securityBindList) ? data.securityBindList : [];
  return list.some(
    (item) =>
      item.bind === true &&
      !!item.securityKey &&
      FORGOT_PAYMENT_PASSWORD_SECURITY_KEYS.includes(item.securityKey),
  );
}

function getForgotPaymentEntryMode(data?: SecurityCenterResponse | null): ForgotPaymentEntryMode {
  if (data === undefined) return 'loading';
  return hasForgotPaymentSecurityVerification(data) ? 'securityVerify' : 'loginPassword';
}

export interface BindPaymentPasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** 忘记支付密码流程：优先动态验证，无可用方式时验证登录密码后设置新支付密码 */
  mode?: 'set' | 'forgot';
  /** 父层已持有安全中心数据时优先复用，避免弹窗打开后重复请求 */
  securityData?: SecurityCenterResponse | null;
  /** 未登录场景允许父层透传账号，覆盖 store 中的会员名 */
  loginName?: string;
}

const BindPaymentPasswordModal: React.FC<BindPaymentPasswordModalProps> = ({
  show,
  onClose,
  onSuccess,
  mode = 'set',
  securityData,
  loginName: loginNameProp,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigateWithLanguage();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const storeLoginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';
  const loginName = loginNameProp ?? storeLoginName;

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const openCustomerService = useOpenCustomerService();

  const [step, setStep] = useState<1 | 2>(1);
  const [loginPassword, setLoginPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [forgotPaymentEntryMode, setForgotPaymentEntryMode] = useState<ForgotPaymentEntryMode>(
    mode === 'forgot' ? getForgotPaymentEntryMode(securityData) : 'loginPassword',
  );
  const [forgotPaymentSecurityData, setForgotPaymentSecurityData] =
    useState<SecurityCenterResponse | null>(securityData ?? null);

  useEffect(() => {
    if (!show) {
      setStep(1);
      setLoginPassword('');
      setPassword('');
      setConfirmPassword('');
      setToken('');
      setErrors({});
      setLoading(false);
      setForgotPaymentEntryMode(
        mode === 'forgot' ? getForgotPaymentEntryMode(securityData) : 'loginPassword',
      );
      setForgotPaymentSecurityData(securityData ?? null);
    }
  }, [mode, securityData, show]);

  useEffect(() => {
    if (!show || step !== 1) return;

    if (mode !== 'forgot') {
      setForgotPaymentEntryMode('loginPassword');
      setForgotPaymentSecurityData(securityData ?? null);
      return;
    }

    let cancelled = false;

    // 入口态只依赖安全中心数据：有可用安全校验先走列表，否则回退到登录密码校验。
    const applySecurityData = (data?: SecurityCenterResponse | null) => {
      if (cancelled) return;
      const nextData = data ?? null;
      setForgotPaymentSecurityData(nextData);
      setForgotPaymentEntryMode(getForgotPaymentEntryMode(nextData));
    };

    if (securityData !== undefined) {
      applySecurityData(securityData);
      return () => {
        cancelled = true;
      };
    }

    setForgotPaymentEntryMode('loading');

    getSecurityCenterReq()
      .then((res) => {
        applySecurityData(res?.data ?? null);
      })
      .catch(() => {
        applySecurityData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, securityData, show, step]);

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep(1);
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  };

  const setPasswordType =
    mode === 'forgot' ? FORGOT_PAYMENT_PASSWORD_TYPE : SET_PAYMENT_PASSWORD_TYPE;
  const modalTitle =
    mode === 'forgot' ? t('bindPaymentPassword.forgotTitle') : t('bindPaymentPassword.title');

  const handleStep1Next = () => {
    if (!loginPassword.trim()) {
      setErrors({ loginPassword: t('bindPaymentPassword.loginPasswordRequired') });
      return;
    }
    setErrors({});
    setLoading(true);
    verifyLoginPasswordReq({
      loginName,
      loginPassword: loginPassword.trim(),
      type: VERIFY_LOGIN_FOR_CASH_TYPE,
    })
      .then((res) => {
        const tokenValue = getTokenFromResponse(res);
        flushSync(() => {
          setToken(String(tokenValue));
          setStep(2);
          setLoginPassword('');
        });
        toast({ type: 'success', description: t('bindPaymentPassword.verifySuccess') });
      })
      .catch((err: unknown) => {
        const tokenFromErr = getTokenFromErrorResponse(err);
        const isPwdError = isBackendPasswordError(err);
        // 某些后端分支会把 token 放在错误包里返回；只要拿到 token，就按验证成功继续流程。
        if (tokenFromErr !== null || !isPwdError) {
          flushSync(() => {
            if (tokenFromErr !== null) setToken(tokenFromErr);
            setStep(2);
            setLoginPassword('');
          });
          toast({ type: 'success', description: t('bindPaymentPassword.verifySuccess') });
        } else {
          setErrors({ loginPassword: t('bindPaymentPassword.verifyFailed') });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleStep2Submit = () => {
    const newErrors: Record<string, string> = {};
    const pwdLen = password.length;
    if (!password.trim()) {
      newErrors.password = t('bindPaymentPassword.passwordRequired');
    } else if (pwdLen !== 6 || !/^\d{6}$/.test(password)) {
      newErrors.password = t('bindPaymentPassword.passwordLength6');
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('bindPaymentPassword.confirmRequired');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('bindPaymentPassword.passwordMismatch');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setCashPasswordReq({
      loginName,
      cashPassword: password,
      confirmCashPassword: confirmPassword,
      token,
      type: setPasswordType,
    })
      .then(() => {
        toast({ type: 'success', description: t('bindPaymentPassword.submitSuccess') });
        onSuccess?.();
        onClose();
        navigate(PATHS.mineSecurity);
      })
      .catch((err: unknown) => {
        const resp = (err as { response?: { code?: unknown; info?: string } })?.response;
        const code = resp?.code;
        const info = resp?.info ?? '';
        const isSuccessCode =
          code === 0 ||
          code === 1 ||
          code === '0000' ||
          code === '1200' ||
          code === '9002' ||
          /成功|success/i.test(info);
        if (resp && isSuccessCode) {
          toast({ type: 'success', description: t('bindPaymentPassword.submitSuccess') });
          onSuccess?.();
          onClose();
          navigate(PATHS.mineSecurity);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const canStep1 = loginPassword.trim().length > 0;
  const hasBothInputs =
    password.trim().length === 6 &&
    /^\d{6}$/.test(password) &&
    confirmPassword.trim().length === 6 &&
    /^\d{6}$/.test(confirmPassword);
  const canStep2 = hasBothInputs;
  const showMismatchHint = hasBothInputs && password !== confirmPassword;
  const showForgotPaymentSecurityVerify =
    show && mode === 'forgot' && step === 1 && forgotPaymentEntryMode === 'securityVerify';
  // 忘记支付密码命中动态验证时，首屏直接切到 SecurityVerifyModal，避免和登录密码页叠在一起。
  const showMainOverlay = show && !showForgotPaymentSecurityVerify;

  return (
    <>
      <Overlay
        show={showMainOverlay}
        close={onClose}
        position={overlayPosition}
        maskClickClose={false}
        zIndex={zIndexMap.loginModal}
        durationEnter={0}
        durationExit={0}
      >
        <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <SecurityModalHeader
            title={modalTitle}
            onBack={handleBack}
            isMobile={isMobile}
            onClose={onClose}
            onCustomerClick={openCustomerService}
            customerAriaLabel={t('customerService.chooseServiceTitle')}
          />

          <div className={styles.content}>
            <div
              className={styles.stepContent}
              style={{ display: step === 1 ? 'flex' : 'none' }}
              data-step="1"
            >
              {mode === 'forgot' && forgotPaymentEntryMode === 'loading' ? (
                <div className={styles.hint}>
                  <span className={styles.hintIcon}>
                    <img src={navTip} alt="" width={16} height={16} />
                  </span>
                  {t('forgotPassword.captcha.loading')}
                </div>
              ) : (
                <>
                  <div className={styles.hint}>
                    <span className={styles.hintIcon}>
                      <img src={navTip} alt="" width={16} height={16} />
                    </span>
                    {t('bindPaymentPassword.step1Hint')}
                  </div>
                  <div className={styles.inputSection}>
                    <FormInput
                      type="password"
                      placeholder={t('bindPaymentPassword.loginPasswordPlaceholder')}
                      value={loginPassword}
                      onChange={setLoginPassword}
                      error={errors.loginPassword}
                      showError={!!errors.loginPassword}
                      variant={isMobile ? 'light' : 'default'}
                    />
                  </div>
                  <Button
                    type="primary"
                    htmlType="button"
                    className={`${styles.submitBtn} ${canStep1 ? styles.submitBtnActive : styles.submitBtnInactive}`}
                    onClick={handleStep1Next}
                    loading={loading}
                    disabled={!canStep1 || loading}
                  >
                    {t('bindPaymentPassword.nextStep')}
                  </Button>
                </>
              )}
            </div>

            <div
              className={styles.stepContent}
              style={{ display: step === 2 ? 'flex' : 'none' }}
              data-step="2"
            >
              <div className={styles.inputGroup}>
                <div className={styles.inputSection}>
                  <FormInput
                    type="password"
                    placeholder={t('bindPaymentPassword.passwordPlaceholder')}
                    value={password}
                    onChange={(v) => setPassword(v.replace(/\D/g, '').slice(0, 6))}
                    error={errors.password}
                    showError={!!errors.password}
                    variant={isMobile ? 'light' : 'default'}
                  />
                </div>
                <div className={styles.inputSection}>
                  <FormInput
                    type="password"
                    placeholder={t('bindPaymentPassword.confirmPlaceholder')}
                    value={confirmPassword}
                    onChange={(v) => setConfirmPassword(v.replace(/\D/g, '').slice(0, 6))}
                    error={
                      errors.confirmPassword ||
                      (showMismatchHint ? t('bindPaymentPassword.passwordMismatch') : '')
                    }
                    showError={!!errors.confirmPassword || !!showMismatchHint}
                    variant={isMobile ? 'light' : 'default'}
                  />
                  {(errors.confirmPassword || showMismatchHint) && (
                    <p className={styles.passwordMismatchError}>
                      {errors.confirmPassword || t('bindPaymentPassword.passwordMismatch')}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="primary"
                htmlType="button"
                className={`${styles.submitBtn} ${canStep2 ? styles.submitBtnActive : styles.submitBtnInactive}`}
                onClick={handleStep2Submit}
                loading={loading}
                disabled={!canStep2 || loading}
              >
                {t('bindPaymentPassword.submit')}
              </Button>
              <div className={styles.warmTip}>
                <p className={styles.warmTipTitle}>{t('bindPaymentPassword.warmTipTitle')}</p>
                <p className={styles.warmTipText}>{t('bindPaymentPassword.hint')}</p>
              </div>
            </div>
          </div>
        </div>
      </Overlay>

      <SecurityVerifyModal
        visible={showForgotPaymentSecurityVerify}
        onClose={onClose}
        title={modalTitle}
        tip={t('bindPaymentPassword.forgotSelectMethod')}
        mainSubtitle=""
        microsoftStepPageTitle={modalTitle}
        microsoftVerifyType={FORGOT_PAYMENT_PASSWORD_TYPE}
        excludeKeys={['Gesture_Password']}
        loginName={loginName.trim()}
        onVerifySuccess={(_, verifiedToken) => {
          if (verifiedToken) {
            setToken(verifiedToken);
            setStep(2);
          }
        }}
        onNoAvailableChannels={() => {
          setForgotPaymentEntryMode('loginPassword');
        }}
        securityData={forgotPaymentSecurityData}
      />
    </>
  );
};

export default BindPaymentPasswordModal;
