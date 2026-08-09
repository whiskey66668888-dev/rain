import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';

import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';

import FormInput from '../FormInput';
import OwnCaptcha from '../OwnCaptcha';
import GeetestCaptcha from '../GeetestCaptcha';
import SecurityVerifyModal from '../SecurityVerifyModal';
import { ModalBackButton, ModalCloseButton, ModalCustomerButton } from '../themeIcon';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import ForgotPasswordSuccessModal from '../ForgotPasswordSuccessModal';
import {
  existLoginNameReq,
  type CheckLoginNameParams,
  resetLoginPasswordReq,
  verifyCashPasswordReq,
  checkIp2Req,
  getSecurityInfoReq,
  getSecurityCenterReq,
  getCustomerServiceInfoReq,
  resetPasswordByManualReq,
  type SecurityCenterResponse,
} from '@/apis/origin/login';
import { toastCustom } from '@/common/components/Toast';
import type { GeetestCaptchaResult } from '@/common/components/GeetestCaptcha';
import { usePreInfoQuery } from '@/apis/origin/setting';
import styles from './ForgotPasswordModal.module.scss';

// 提示图标
import navTip from '../../images/common/login/nav_tip.png';
import paycheckIcon from '../../images/common/login/paycheck.png';
import phoneIcon from '../../images/common/login/phone.png';
import { getSystemTheme } from '@/utils';
import { clearRememberedLoginPassword } from '@/utils/rememberLoginStorage';
import {
  hasCashPassword,
  hasForgotPasswordSecurityVerification,
} from '@/sites/op7/pages/MinePage/utils/securityStatus';
import { buildKefuUrl } from '@/sites/op7/utils/kefuUrl';

const FORGOT_LOGIN_PASSWORD_TYPE = 2;

export interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAccount?: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  show,
  onClose,
  onSuccess,
  initialAccount,
}) => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const { data: preInfo } = usePreInfoQuery();

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  // 判断是否为深色主题
  const isDarkMode = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // system 模式下检测系统偏好
    return getSystemTheme() === 'dark' ? true : false;
  }, [themeMode]);

  // 步骤状态：1=输入账号，2=选择找回方式，3=支付密码验证，4=重置密码，5=预设登录密码（联系客服前）
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [accountName, setAccountName] = useState('');
  const [paymentPassword, setPaymentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const openCustomerService = useOpenCustomerService();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showGeetestCaptcha, setShowGeetestCaptcha] = useState(false);
  const [showSecurityVerify, setShowSecurityVerify] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [captchaKey, setCaptchaKey] = useState<string>('');
  /** 验证成功后返回的 token，用于 resetLoginPassword 接口 */
  const [cashPasswordToken, setCashPasswordToken] = useState<string>('');
  const [securityCenterData, setSecurityCenterData] = useState<SecurityCenterResponse | null>(null);
  /** 是否通过动态验证进入重置密码步骤 */
  const [verifiedByDynamic, setVerifiedByDynamic] = useState(false);

  const showPaymentPasswordOption = useMemo(
    () => hasCashPassword(securityCenterData),
    [securityCenterData],
  );

  const captchaId =
    __SITE_CONFIG__.captcha?.geetest?.captchaId ?? '28e6e3d5493ab7b717eb71827fda4ea4';
  const needGeetestCaptcha = preInfo?.geetestSwitch === '1';
  const needOwnCaptcha = preInfo?.geetestSwitch === '2';

  const validatePresetPassword = (password: string): string => {
    if (!password) {
      return t('forgotPassword.newPasswordRequired');
    }
    if (password.length < 8 || password.length > 16) {
      return t('forgotPassword.passwordLength');
    }
    if (!/^(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
      return t('forgotPassword.passwordFormat');
    }
    return '';
  };

  // 打开弹窗时，若有传入账号则预填
  useEffect(() => {
    if (show && typeof initialAccount === 'string' && initialAccount.trim()) {
      setAccountName(initialAccount.trim());
    }
  }, [show, initialAccount]);

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!show) {
      // 如果显示成功弹窗，不清除状态，让成功弹窗继续显示
      if (showSuccessModal) {
        return;
      }
      // 只有在不显示成功弹窗时才重置状态
      setStep(1);
      setAccountName('');
      setPaymentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setIsLoading(false);
      setShowCaptcha(false);
      setShowGeetestCaptcha(false);
      setShowSecurityVerify(false);
      setCaptchaKey('');
      setCashPasswordToken('');
      setSecurityCenterData(null);
      setVerifiedByDynamic(false);
      setShowSuccessModal(false);
    }
  }, [show, showSuccessModal]);

  const enterResetPasswordStep = (token: string, fromDynamic: boolean): void => {
    setVerifiedByDynamic(fromDynamic);
    setCashPasswordToken(token);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowSecurityVerify(false);
    setStep(4);
  };

  const proceedAfterAccountVerified = async (): Promise<void> => {
    try {
      const securityRes = await getSecurityCenterReq({ loginName: accountName.trim() });
      const data = securityRes?.data ?? null;
      setSecurityCenterData(data);
      void Promise.all([
        getSecurityInfoReq({ loginName: accountName.trim() }),
        checkIp2Req(),
      ]).catch(() => {});
      if (hasForgotPasswordSecurityVerification(data)) {
        setShowSecurityVerify(true);
      } else {
        setStep(2);
      }
    } catch {
      setSecurityCenterData(null);
      setStep(2);
    }
    setIsLoading(false);
  };

  // 返回上一步或关闭弹窗（第一步时弹窗确认）
  const handleBack = () => {
    if (step === 4 && verifiedByDynamic) {
      setCashPasswordToken('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setShowSecurityVerify(true);
      return;
    }
    if (step === 5) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setStep(1);
      return;
    }
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5);
      setErrors({});
    } else {
      Modal.open({
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img
              src="/images/common/login/safe-tip.svg"
              alt=""
              style={{ width: 16, height: 16, flexShrink: 0 }}
            />
            <span>{t('forgotPassword.confirmExitTitle')}</span>
          </div>
        ),
        content: (
          <p
            style={{
              margin: 0,
              color: 'var(--Text-800)',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {t('forgotPassword.confirmExitContent')}
          </p>
        ),
        showCloseButton: true,
        confirmText: t('forgotPassword.confirmExitConfirm'),
        zIndex: zIndexMap.loginModal + 2,
        onConfirm: () => {
          setTimeout(() => {
            onClose();
          }, 500);
          return Promise.resolve();
        },
      });
    }
  };

  // 第一步：显示验证码弹窗
  const handleNextStep = () => {
    if (!accountName.trim()) {
      setErrors({ accountName: t('forgotPassword.accountRequired') });
      return;
    }
    setErrors({});
    // 显示验证码弹窗
    if (needGeetestCaptcha) {
      setShowGeetestCaptcha(true);
    } else if (needOwnCaptcha) {
      setShowCaptcha(true);
    } else {
      void handleCaptchaSuccess();
    }
  };

  // 验证码通过后的回调（仅依赖 existLoginNameReq，其余接口后台并行不阻塞）
  const handleCaptchaSuccess = async (key?: string, geetestResult?: GeetestCaptchaResult) => {
    if (needOwnCaptcha && !key) {
      return;
    }
    setIsLoading(true);

    try {
      // 1. 检查账号是否存在（必须等待）
      const params: CheckLoginNameParams = geetestResult
        ? {
            loginName: accountName.trim(),
            captchaId,
            lotNumber: geetestResult.lot_number,
            captchaOutput: geetestResult.captcha_output,
            passToken: geetestResult.pass_token,
            genTime: geetestResult.gen_time,
          }
        : {
            loginName: accountName.trim(),
            ...(key ? { key } : {}),
          };

      const response = await existLoginNameReq(params);

      // 根据响应数据确认账号是否存在
      const responseCode = String((response as { code?: string | number }).code || '');
      const responseData = response.data;

      const isAccountExist =
        responseCode === '0000' ||
        responseCode === '1' ||
        responseCode === '1200' ||
        responseCode === '9002' ||
        responseData?.existLoginName === true ||
        response.success === true;

      if (!isAccountExist) {
        setIsLoading(false);
        setCaptchaKey('');
        return;
      }

      setCaptchaKey(key || captchaId);

      await proceedAfterAccountVerified();
    } catch (error: unknown) {
      setIsLoading(false);

      // 接口抛出错误，可能是账号不存在或其他错误
      // 由于 isErrorToast: true，错误提示已经自动显示

      // 从错误响应中提取信息，判断是否真的是账号不存在
      let errorCode: string | number | undefined;
      let errorInfo: string | undefined;
      let errorData: { existLoginName?: boolean } | undefined;
      let errorSuccess: boolean | undefined;

      if (error && typeof error === 'object' && 'response' in error) {
        const response = (
          error as {
            response?: {
              code?: string | number;
              info?: string;
              message?: string;
              data?: unknown;
              success?: boolean;
            };
          }
        ).response;
        if (response) {
          errorCode = response.code;
          errorInfo = response.info || response.message;
          errorData = response.data as { existLoginName?: boolean } | undefined;
          errorSuccess = response.success;
        }
      }

      // 根据错误响应判断账号是否存在
      const responseCode = String(errorCode || '');

      // 账号存在的情况：即使接口返回错误，但 data.existLoginName === true 或 success === true
      // 这种情况可能发生在接口返回了错误码，但数据中明确表示账号存在
      const isAccountExist = errorData?.existLoginName === true || errorSuccess === true;

      // 账号不存在的情况：code === "9999" 或 info 包含"不存在"
      const isAccountNotExist =
        responseCode === '9999' ||
        (errorInfo &&
          (errorInfo.includes('不存在') ||
            errorInfo.includes('not exist') ||
            errorInfo.includes('账号不存在')));

      if (isAccountExist) {
        setCaptchaKey(key || captchaId);

        await proceedAfterAccountVerified();
      } else if (isAccountNotExist) {
        // 账号不存在，错误提示已经由 isErrorToast: true 自动显示
        // 这里只需要清理状态
        setCaptchaKey('');
        setIsLoading(false);
      } else {
        // 其他错误（可能是网络错误、接口错误等）
        // 错误提示已经由 isErrorToast: true 自动显示
        setCaptchaKey('');
        setIsLoading(false);
      }
    }
  };

  // 选择找回方式后的回调（联系人工客服：先调 getCustomerServiceInfo，有 orderId 直接打开客服链接，无则进入预设密码步骤）
  const handleGeetestSuccess = (result: GeetestCaptchaResult): void => {
    setShowGeetestCaptcha(false);
    void handleCaptchaSuccess(undefined, result);
  };

  const handleGeetestClose = (): void => {
    setShowGeetestCaptcha(false);
  };

  const handleSelectMethod = async (method: 'paymentPassword' | 'customer') => {
    if (method === 'paymentPassword') {
      setStep(3);
      setPaymentPassword('');
      setErrors({});
      return;
    }
    if (method === 'customer') {
      if (isLoading) return;
      setErrors({});
      setIsLoading(true);
      try {
        const res = await getCustomerServiceInfoReq({
          loginName: accountName.trim(),
          type: 2, // 忘记登录密码
        });
        const data = res?.data ?? (res as { data?: { orderId?: string; kefu?: string } })?.data;
        const orderId = data?.orderId;
        const kefu = data?.kefu;
        if (orderId && kefu) {
          window.open(buildKefuUrl(kefu, orderId), '_blank');
          setIsLoading(false);
          return;
        }
        // 无 orderId：进入预设登录密码步骤
        setStep(5);
        setNewPassword('');
        setConfirmPassword('');
      } catch {
        // error handled by isErrorToast
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 第五步：校验预设密码后弹出重要提示，确认后调 resetPasswordByManual 再打开客服链接
  const handleConfirmAndContactService = () => {
    const newErrors: Record<string, string> = {};
    const passwordError = validatePresetPassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const presetModalInstance = Modal.open({
      title: t('forgotPassword.presetNoticeTitle'),
      content: (
        <p
          style={{
            margin: 0,
            color: 'var(--Text-800)',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {t('forgotPassword.presetNoticeContent')}
        </p>
      ),
      showCloseButton: true,
      zIndex: zIndexMap.loginModal + 2,
      footer: (
        <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
          <Button type="second" onClick={() => presetModalInstance.close()} style={{ flex: 1 }}>
            {t('forgotPassword.presetNoticeCancel')}
          </Button>
          <Button
            type="primary"
            style={{ flex: 1 }}
            onClick={() => {
              void (async () => {
                try {
                  const res = await resetPasswordByManualReq({
                    loginName: accountName.trim(),
                    password: newPassword.trim(),
                    type: 2,
                  });
                  const data =
                    res?.data ?? (res as { data?: { kefu?: string; orderId?: string } })?.data;
                  const kefu = data?.kefu;
                  presetModalInstance.close();
                  if (kefu) {
                    window.open(buildKefuUrl(kefu, data?.orderId), '_blank');
                  }
                  onClose();
                } catch {
                  // error handled by isErrorToast
                }
              })();
            }}
          >
            {t('forgotPassword.presetNoticeConfirm')}
          </Button>
        </div>
      ),
    });
  };

  // 第三步：验证支付密码
  const handleVerifyPaymentPassword = async () => {
    if (!paymentPassword.trim()) {
      setErrors({ paymentPassword: t('forgotPassword.paymentPasswordRequired') });
      return;
    }

    if (!captchaKey) {
      toastCustom({
        content: (
          <div className="flex items-center gap-3">
            <img
              src="/images/common/toast/error.svg"
              alt=""
              width="16"
              height="16"
              className="flex-shrink-0"
            />
            <span className="text-red-500 font-medium">验证码已过期，请重新操作</span>
          </div>
        ),
        duration: 2000,
      });
      // 返回第一步，重新验证
      setStep(1);
      setCaptchaKey('');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // 验证支付密码（返回 token 用于后续 resetLoginPassword）
      // type: 2 = 忘记登录密码
      const res = await verifyCashPasswordReq({
        loginName: accountName.trim(),
        cashPassword: paymentPassword.trim(),
        type: FORGOT_LOGIN_PASSWORD_TYPE,
      });

      const data = res.data ?? {};
      const token = data.token ?? (res as { token?: string }).token ?? '';
      if (!token) {
        toastCustom({
          content: (
            <div className="flex items-center gap-3">
              <img
                src="/images/common/toast/error.svg"
                alt=""
                width="16"
                height="16"
                className="flex-shrink-0"
              />
              <span className="text-red-500 font-medium">验证失败，请重试</span>
            </div>
          ),
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      enterResetPasswordStep(token, false);
      setIsLoading(false);
    } catch (error: unknown) {
      setIsLoading(false);
      // 由于接口设置了 isErrorToast: true，错误提示已经自动显示
      // 这里只需要设置错误状态，让用户知道验证失败
      let errorMessage = t('forgotPassword.paymentPasswordIncorrect');
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { info?: string; message?: string } }).response;
        if (response) {
          errorMessage = response.info || response.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      setErrors({ paymentPassword: errorMessage });
    }
  };

  // 第四步：重置密码
  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = t('forgotPassword.newPasswordRequired');
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('forgotPassword.confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('forgotPassword.passwordMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!cashPasswordToken) {
      toastCustom({
        content: (
          <div className="flex items-center gap-3">
            <img
              src="/images/common/toast/error.svg"
              alt=""
              width="16"
              height="16"
              className="flex-shrink-0"
            />
            <span className="text-red-500 font-medium">验证已过期，请返回重新验证支付密码</span>
          </div>
        ),
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // 调用重置密码接口（使用支付密码验证返回的 token）
      await resetLoginPasswordReq({
        loginName: accountName.trim(),
        password: newPassword,
        confirmPassword,
        token: cashPasswordToken,
      });

      clearRememberedLoginPassword();
      setIsLoading(false);

      // 先显示成功弹窗，不关闭忘记密码弹窗
      // 让成功弹窗显示在忘记密码弹窗之上
      setShowSuccessModal(true);
    } catch (error: unknown) {
      setIsLoading(false);

      let errorMessage = t('forgotPassword.resetPasswordError');
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { info?: string; message?: string } }).response;
        if (response) {
          errorMessage = response.info || response.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }

      toastCustom({
        content: (
          <div className="flex items-center gap-3">
            <img
              src="/images/common/toast/error.svg"
              alt=""
              width="16"
              height="16"
              className="flex-shrink-0"
            />
            <span className="text-red-500 font-medium">{errorMessage}</span>
          </div>
        ),
        duration: 2000,
      });
    }
  };

  // 动态标题
  const title =
    step === 5
      ? t('forgotPassword.presetTitle')
      : step === 4
        ? t('forgotPassword.resetTitle')
        : t('forgotPassword.title');
  // const subtitle = step === 3 ? t('forgotPassword.methodPaymentPassword') : null;

  return (
    <>
      <Overlay
        show={show}
        close={onClose}
        position={overlayPosition}
        maskClickClose={false}
        zIndex={zIndexMap.loginModal}
      >
        <div
          className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop} ${!isMobile && step === 2 ? styles.step2 : ''}`}
          {...(!isMobile && step === 2 && { 'data-theme': isDarkMode ? 'dark' : 'light' })}
        >
          <div className={styles.header}>
            <ModalBackButton className={styles.backBtn} onClick={handleBack} />

            <span className={styles.title}>{title}</span>
            {step === 5 || step === 1 ? (
              <ModalCustomerButton className={styles.customerBtn} onClick={openCustomerService} />
            ) : isMobile ? (
              <ModalCustomerButton className={styles.customerBtn} onClick={openCustomerService} />
            ) : (
              <div className={styles.headerActions}>
                <ModalCustomerButton
                  className={styles.headerActionBtn}
                  onClick={openCustomerService}
                />
                <ModalCloseButton className={styles.headerActionBtn} onClick={onClose} />
              </div>
            )}
          </div>

          <div className={styles.content}>
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.hint}>
                  <span className={styles.hintIcon}>
                    <img src={navTip} alt="" />
                  </span>
                  {t('forgotPassword.hint')}
                </div>

                <div className={`${styles.inputSection} ${styles.accountInputSection}`}>
                  <FormInput
                    type="text"
                    placeholder={t('forgotPassword.accountPlaceholder')}
                    value={accountName}
                    onChange={setAccountName}
                    error={errors.accountName}
                    showError={!!errors.accountName}
                    variant={isMobile ? 'light' : 'default'}
                  />
                </div>

                <Button
                  type="primary"
                  className={`${styles.submitBtn} ${accountName.trim() ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  {t('forgotPassword.nextStep')}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.hint}>
                  <span className={styles.hintIcon}>
                    <img src={navTip} alt="" />
                  </span>
                  {t('forgotPassword.selectDynamicVerification')}
                </div>

                <div className={styles.methodList}>
                  {showPaymentPasswordOption && (
                    <button
                      type="button"
                      className={styles.methodItem}
                      onClick={() => void handleSelectMethod('paymentPassword')}
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
                  )}

                  <button
                    type="button"
                    className={styles.methodItem}
                    onClick={() => void handleSelectMethod('customer')}
                  >
                    <div className={styles.methodLeft}>
                      <div className={styles.methodIcon}>
                        <img src={phoneIcon} alt="" />
                      </div>
                      <span className={styles.methodText}>
                        {t('forgotPassword.methodCustomer')}
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
                </div>

                <div className={styles.warning}>
                  <p className={styles.warningTitle}>{t('forgotPassword.warningTitle')}</p>
                  <p className={styles.warningText}>{t('forgotPassword.warningText')}</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContent}>
                <div className={`${styles.paymentPasswordInput} ${styles.paymentPasswordInputUp}`}>
                  <FormInput
                    type="password"
                    placeholder={t('forgotPassword.paymentPasswordPlaceholder')}
                    value={paymentPassword}
                    onChange={setPaymentPassword}
                    error={errors.paymentPassword}
                    showError={!!errors.paymentPassword}
                    variant={isMobile ? 'light' : 'default'}
                  />
                </div>

                <div className={styles.warning}>
                  <p className={styles.warningTitle}>{t('forgotPassword.warningTitle')}</p>
                  <p className={styles.warningText}>
                    {t('forgotPassword.paymentPasswordWarningText')}
                  </p>
                </div>

                <Button
                  type="primary"
                  className={`${styles.submitBtn} ${paymentPassword.trim() ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={() => void handleVerifyPaymentPassword()}
                  loading={isLoading}
                  disabled={isLoading || !paymentPassword.trim()}
                >
                  {t('forgotPassword.nextStep')}
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className={styles.stepContent}>
                <div className={`${styles.resetPasswordInputWrapper} ${styles.step4FirstInput}`}>
                  <div className={styles.resetPasswordInput}>
                    <FormInput
                      type="password"
                      placeholder={t('forgotPassword.resetPasswordPlaceholder')}
                      value={newPassword}
                      onChange={setNewPassword}
                      error={errors.newPassword}
                      showError={!!errors.newPassword}
                      variant={isMobile ? 'light' : 'default'}
                    />
                  </div>
                </div>

                <div className={styles.resetPasswordInputWrapper}>
                  <div className={styles.resetPasswordInput}>
                    <FormInput
                      type="password"
                      placeholder={t('forgotPassword.resetConfirmPasswordPlaceholder')}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      error={errors.confirmPassword}
                      showError={false}
                      variant={isMobile ? 'light' : 'default'}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className={styles.passwordMismatchError}>{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="primary"
                  className={`${styles.submitBtn} ${newPassword && confirmPassword ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={() => void handleResetPassword()}
                  loading={isLoading}
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  {t('forgotPassword.confirm')}
                </Button>
              </div>
            )}

            {step === 5 && (
              <div className={styles.stepContent}>
                <div className={styles.hint}>
                  <span className={styles.hintIcon}>
                    <img src={navTip} alt="" />
                  </span>
                  {t('forgotPassword.presetHint')}
                </div>

                <div
                  className={`${styles.resetPasswordInputWrapper} ${styles.presetPasswordInput}`}
                >
                  <div className={styles.resetPasswordInput}>
                    <FormInput
                      type="password"
                      placeholder={t('forgotPassword.presetPasswordPlaceholder')}
                      value={newPassword}
                      onChange={setNewPassword}
                      error={errors.newPassword}
                      showError={!!errors.newPassword}
                      variant={isMobile ? 'light' : 'default'}
                    />
                  </div>
                </div>

                <Button
                  type="primary"
                  className={`${styles.submitBtn} ${newPassword.trim() ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={handleConfirmAndContactService}
                  disabled={!newPassword.trim()}
                >
                  {t('forgotPassword.goToCustomerService')}
                </Button>

                <div className={styles.warning}>
                  <p className={styles.warningTitle}>{t('forgotPassword.warningTitle')}</p>
                  <p className={styles.warningText}>{t('forgotPassword.presetWarningText')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Overlay>

      <OwnCaptcha
        visible={showCaptcha}
        setVisible={setShowCaptcha}
        callBack={handleCaptchaSuccess}
      />

      <GeetestCaptcha
        visible={showGeetestCaptcha}
        onSuccess={handleGeetestSuccess}
        onClose={handleGeetestClose}
      />

      <SecurityVerifyModal
        visible={show && showSecurityVerify}
        onClose={() => {
          setShowSecurityVerify(false);
          if (step === 4 && verifiedByDynamic && !cashPasswordToken) {
            setStep(1);
            setVerifiedByDynamic(false);
          }
        }}
        title={t('forgotPassword.title')}
        tip={t('forgotPassword.selectDynamicVerification')}
        mainSubtitle=""
        microsoftStepPageTitle={t('forgotPassword.title')}
        microsoftVerifyType={FORGOT_LOGIN_PASSWORD_TYPE}
        excludeKeys={['Gesture_Password']}
        loginName={accountName.trim()}
        securityData={securityCenterData}
        onContactCustomerService={() => {
          setShowSecurityVerify(false);
          void handleSelectMethod('customer');
        }}
        onNoAvailableChannels={() => {
          setShowSecurityVerify(false);
          setSecurityCenterData(null);
          setStep(2);
        }}
        onVerifySuccess={(_, verifiedToken) => {
          if (!verifiedToken) {
            toastCustom({
              content: (
                <div className="flex items-center gap-3">
                  <img
                    src="/images/common/toast/error.svg"
                    alt=""
                    width="16"
                    height="16"
                    className="flex-shrink-0"
                  />
                  <span className="text-red-500 font-medium">验证失败，请重试</span>
                </div>
              ),
              duration: 2000,
            });
            return;
          }
          enterResetPasswordStep(verifiedToken, true);
        }}
      />

      <ForgotPasswordSuccessModal
        show={showSuccessModal}
        onClose={() => {
          // 只关闭成功弹窗，不打开登录弹窗
          // 登录弹窗的打开由成功弹窗内部的倒计时或按钮点击逻辑控制
          setShowSuccessModal(false);
          onSuccess?.();
          onClose();
        }}
      />
    </>
  );
};

export default ForgotPasswordModal;
