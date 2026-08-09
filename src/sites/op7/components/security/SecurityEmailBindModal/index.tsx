import React, { useCallback, useEffect, useState } from 'react';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Modal from '@/common/components/Modal';
import Button from '@/common/components/Button';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import FormInput from '../../FormInput';
import { toast } from '@/common/components/Toast';
import SecurityModalHeader from '../SecurityModalHeader';
import {
  verifyCashPasswordReq,
  getCodeByEmailReq,
  bindEmailReq,
  type SecurityCenterResponse,
} from '@/apis/origin/login';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import styles from './SecurityEmailBindModal.module.scss';

const BIND_EMAIL_VERIFY_TYPE = 8;
const BIND_EMAIL_TYPE = 8;

const EMAIL_REG =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isValidEmail = (v: string) => EMAIL_REG.test(String(v).toLowerCase());

const backConfirmTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
};
const backConfirmTextStyle: React.CSSProperties = {
  color: 'var(--Text-Main-10, #1F2634)',
  textAlign: 'center',
  fontFamily: '"PingFang SC", sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '24px',
};
const backConfirmContentStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--Text-Main-10, #1F2634)',
  textAlign: 'center',
  fontFamily: '"PingFang SC", sans-serif',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '20px',
};

export interface SecurityEmailBindModalProps {
  show: boolean;
  onClose: () => void;
  /** 邮箱绑定成功后的回调 */
  onSuccess?: () => void;
  /** 用户是否已设置过支付密码 */
  hasPaymentPassword?: boolean;
  /** 点击「忘记支付密码？」时的回调 */
  onForgotPassword?: () => void;
  /** 补绑动态认证时后端返回的 unbindType，需继续透传 */
  unbindType?: string;
  /** 父层已持有安全中心数据时优先复用，避免重复请求 */
  securityData?: SecurityCenterResponse | null;
}

const SecurityEmailBindModal: React.FC<SecurityEmailBindModalProps> = ({
  show,
  onClose,
  onSuccess,
  hasPaymentPassword = false,
  onForgotPassword,
  unbindType,
  securityData,
}) => {
  const navigate = useNavigateWithLanguage();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';

  const isMobile = screenBreakpoint === 'md';
  const overlayPosition: OverlayPosition = isMobile ? 'bottom' : 'center';

  const openCustomerService = useOpenCustomerService();

  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bindLoading, setBindLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [securityVerifyVisible, setSecurityVerifyVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');

  useEffect(() => {
    if (!show) {
      setStep(1);
      setPassword('');
      setToken('');
      setErrors({});
      setEmail('');
      setEmailCode('');
      setCountDown(0);
      setSecurityVerifyVisible(false);
    }
  }, [show]);

  useEffect(() => {
    if (countDown <= 0) return;
    const timer = setInterval(() => setCountDown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countDown]);

  const handleBack = () => {
    if (step === 2) {
      Modal.open({
        title: (
          <div style={backConfirmTitleStyle}>
            <img
              src="/images/common/login/safe-tip.svg"
              alt=""
              style={{ width: 16, height: 16, flexShrink: 0 }}
            />
            <span style={backConfirmTextStyle}>安全提示</span>
          </div>
        ),
        content: <p style={backConfirmContentStyle}>您确定要停止绑定邮箱吗？</p>,
        showCloseButton: true,
        confirmText: '确定',
        zIndex: zIndexMap.loginModal + 1,
        onConfirm: () => {
          onClose();
          navigate(PATHS.mineSecurity);
          return Promise.resolve();
        },
      });
    } else {
      onClose();
    }
  };

  const handleVerifySubmit = () => {
    const trimmed = password.trim();
    if (!trimmed) {
      setErrors({ password: '请输入支付密码' });
      return;
    }
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setErrors({ password: '支付密码为6位数字' });
      return;
    }
    setErrors({});
    setBindLoading(true);
    verifyCashPasswordReq({
      loginName,
      cashPassword: trimmed,
      type: BIND_EMAIL_VERIFY_TYPE,
      ...(unbindType ? { unbindType } : {}),
    })
      .then((res) => {
        const tokenVal = (res?.data as { token?: string })?.token ?? '';
        setToken(tokenVal);
        setPassword('');
        setBindLoading(false);
        const list = Array.isArray(securityData?.securityBindList)
          ? securityData.securityBindList
          : [];
        const EMAIL_AVAILABLE_KEYS = ['Safety_Phone', 'Microsoft_Token', 'Gesture_Password'];
        const hasAvailable = list.some(
          (item: { bind?: boolean; securityKey?: string }) =>
            item.bind &&
            !!item.securityKey &&
            EMAIL_AVAILABLE_KEYS.includes(item.securityKey) &&
            item.securityKey !== 'Safety_Email',
        );
        if (hasAvailable) {
          setSecurityVerifyVisible(true);
        } else {
          setStep(2);
        }
      })
      .catch(() => {
        setBindLoading(false);
        setErrors({ password: '验证失败' });
      });
  };

  const getCode = useCallback(() => {
    const trimmed = email.trim();

    if (!trimmed) {
      setErrors((e) => ({ ...e, email: '请输入邮箱' }));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setErrors((e) => ({ ...e, email: '邮箱格式不正确' }));
      return;
    }
    setErrors((e) => ({ ...e, email: '' }));
    setCodeLoading(true);
    getCodeByEmailReq({
      loginName,
      email: trimmed,
      type: BIND_EMAIL_TYPE,
      token,
      ...(unbindType ? { unbindType } : {}),
    })
      .then(() => {
        toast({ type: 'success', description: '验证码已发送' });
        setCountDown(60);
      })
      .finally(() => setCodeLoading(false));
  }, [loginName, email, token, unbindType]);

  const handleBindSubmit = useCallback(() => {
    const trimmedEmail = email.trim();
    const trimmedCode = emailCode.trim();
    const newErrors: Record<string, string> = {};
    if (!trimmedEmail) newErrors.email = '请输入邮箱';
    else if (!isValidEmail(trimmedEmail)) newErrors.email = '邮箱格式不正确';
    if (trimmedCode.length < 4) newErrors.emailCode = '请输入验证码';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setBindLoading(true);
    bindEmailReq({
      loginName,
      email: trimmedEmail,
      type: BIND_EMAIL_TYPE,
      code: trimmedCode,
      token,
      ...(unbindType ? { unbindType } : {}),
    })
      .then(() => {
        toast({ type: 'success', description: '绑定成功' });
        onSuccess?.();
        onClose();
        navigate(PATHS.mineSecurity);
      })
      .finally(() => setBindLoading(false));
  }, [loginName, email, emailCode, token, onSuccess, onClose, navigate, unbindType]);

  const canVerifySubmit = password.trim().length === 6 && /^\d{6}$/.test(password.trim());
  const canBindSubmit = isValidEmail(email.trim()) && emailCode.trim().length >= 4;

  return (
    <>
      <Overlay
        show={show}
        close={onClose}
        position={overlayPosition}
        maskClickClose={false}
        zIndex={zIndexMap.loginModal}
        durationEnter={0}
        durationExit={0}
      >
        <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <SecurityModalHeader
            className={styles.emailBindHeader}
            title="邮箱绑定"
            subtitle={step === 1 ? '支付密码验证' : '填写邮箱并完成验证'}
            onBack={handleBack}
            isMobile={isMobile}
            onClose={onClose}
            onCustomerClick={openCustomerService}
            customerAriaLabel="联系客服"
          />

          <div className={styles.content}>
            {step === 1 ? (
              <div className={styles.stepContent}>
                <div className={styles.inputSection}>
                  <FormInput
                    type="password"
                    placeholder="请输入支付密码"
                    value={password}
                    onChange={(v) => setPassword(v.replace(/\D/g, '').slice(0, 6))}
                    error={errors.password}
                    showError={!!errors.password}
                    variant={isMobile ? 'light' : 'default'}
                    rightSlot={
                      hasPaymentPassword && onForgotPassword ? (
                        <button
                          type="button"
                          className={styles.forgotLink}
                          onClick={onForgotPassword}
                        >
                          忘记支付密码？
                        </button>
                      ) : undefined
                    }
                  />
                </div>
                <Button
                  type="primary"
                  htmlType="button"
                  className={`${styles.submitBtn} ${canVerifySubmit && !bindLoading ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={handleVerifySubmit}
                  loading={bindLoading}
                  disabled={!canVerifySubmit || bindLoading}
                >
                  下一步
                </Button>
              </div>
            ) : (
              <div className={styles.stepContent}>
                <div className={styles.formRow}>
                  <div className={`${styles.emailRow} ${errors.email ? styles.inputRowError : ''}`}>
                    <input
                      type="email"
                      className={styles.emailInput}
                      placeholder="请输入邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                      maxLength={254}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                </div>

                <div className={styles.formRow}>
                  <div
                    className={`${styles.verifyRow} ${errors.emailCode ? styles.inputRowError : ''}`}
                  >
                    <input
                      type="text"
                      className={styles.verifyInput}
                      placeholder="请输入验证码"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                    <button
                      type="button"
                      className={`${styles.getCodeBtn} ${!email.trim() || !isValidEmail(email.trim()) || countDown > 0 ? styles.disabled : ''}`}
                      onClick={getCode}
                      disabled={
                        !email.trim() || !isValidEmail(email.trim()) || countDown > 0 || codeLoading
                      }
                    >
                      {countDown > 0 ? `${countDown}s` : '获取验证码'}
                    </button>
                  </div>
                  {errors.emailCode && <div className={styles.errorText}>{errors.emailCode}</div>}
                </div>

                <Button
                  type="primary"
                  htmlType="button"
                  className={`${styles.submitBtn} ${canBindSubmit ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={handleBindSubmit}
                  loading={bindLoading}
                  disabled={!canBindSubmit || bindLoading}
                >
                  确定
                </Button>
              </div>
            )}
          </div>
        </div>
      </Overlay>
      <SecurityVerifyModal
        visible={securityVerifyVisible}
        onClose={() => setSecurityVerifyVisible(false)}
        excludeKeys={['Safety_Email']}
        title="邮箱绑定"
        tip="完成任意一种验证"
        microsoftStepPageTitle="邮箱绑定"
        microsoftVerifyType={BIND_EMAIL_VERIFY_TYPE}
        unbindType={unbindType}
        onVerifySuccess={(_, tokenFromVerify) => {
          setSecurityVerifyVisible(false);
          if (tokenFromVerify) setToken(tokenFromVerify);
          setStep(2);
        }}
        onNoAvailableChannels={() => {
          setSecurityVerifyVisible(false);
          setStep(2);
        }}
        securityData={securityData}
      />
    </>
  );
};

export default SecurityEmailBindModal;
