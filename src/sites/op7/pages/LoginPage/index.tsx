import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClientOnly } from '@/common/components/ClientOnly';
import CircleCheck from '@/common/components/CircleCheck';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { useLogin } from '@/common/hooks/useLogin';

import { navigateTo } from '@/common/hooks/useGlobalNavigate';
import { PATHS } from '@/sites/op7/routes/paths';
import { clearAuthRedirectPath } from '@/common/router/authRedirect';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { closeAuthModal, openRegisterModal } from '@/core/store/slices/authUISlice';
import { encryption } from '@/core/sdk/request/util';
import { isSSR } from '@/utils/env';
import { clearRememberedLoginPassword } from '@/utils/rememberLoginStorage';
import { getSecurityCenterReq, type SecurityCenterResponse } from '@/apis/origin/login';
import {
  API_CODE_ORIGIN_FIRST_LOGIN_NEED_SET_PASSWORD,
  API_CODE_ORIGIN_SECURITY_CENTER_NEED_SET_PASSWORD,
} from '@/utils/constants/apiCodeOrigin';

import FormInput from '../../components/FormInput';
import GeetestCaptcha from '../../components/GeetestCaptcha';
import LoginBanner from '../../components/LoginBanner';
import { NewLoginModalClose } from '../../components/themeIcon';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import LoginSecurityVerifyModal from '../../components/security/LoginSecurityVerifyModal';
import FirstLoginSetPasswordModal from '../../components/security/FirstLoginSetPasswordModal';
import BindPaymentPasswordModal from '../../components/security/BindPaymentPasswordModal';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
// import siteConfig from '../../site.config';
import styles from './LoginPage.module.scss';
import Button from '@/common/components/Button';
import { zIndexMap } from '@/utils/constants/zIndex';
import { usePreInfoQuery } from '@/apis/origin/setting';
import { CustomerServiceHeadsetSvg, PersonSvg, ToRegisterSvg } from '../../components/SvgIcons';

const USERNAME_REGEX = /^[A-Za-z\d]{5,16}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;

// 密码解密辅助函数
const decryptPassword = (encryptedPwd: string | null): string | null => {
  if (!encryptedPwd) {
    return null;
  }
  try {
    const decrypted = encryption.unzip_data<{ password: string }>(encryptedPwd);
    if (typeof decrypted === 'object' && decrypted !== null && 'password' in decrypted) {
      const passwordValue = (decrypted as { password: string }).password;
      return typeof passwordValue === 'string' ? passwordValue : null;
    }
    return null;
  } catch (error) {
    console.warn('密码解密失败', error);
    return null;
  }
};

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeModal = useAppSelector((state) => state.authUI.activeModal);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const { login, isLoading } = useLogin();
  const { data: preInfo } = usePreInfoQuery();

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showGeetestCaptcha, setShowGeetestCaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const openCustomerService = useOpenCustomerService();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginSecurityVerify, setShowLoginSecurityVerify] = useState(false);
  const [showFirstLoginSetPassword, setShowFirstLoginSetPassword] = useState(false);
  const [showForgotPaymentPasswordModal, setShowForgotPaymentPasswordModal] = useState(false);
  const [forgotPaymentSecurityData, setForgotPaymentSecurityData] =
    useState<SecurityCenterResponse | null>(null);

  const show = activeModal === 'login';
  // 验证码开关：从 preInfo 接口获取
  const needCaptcha = preInfo?.loginGeetestSwitch === '1';
  // 合并本地提交状态和 hook 的 loading 状态
  const isButtonLoading = isSubmitting || isLoading;
  // 表单可提交：账号、密码符合规则时主按钮才可点击
  const isFormValid =
    USERNAME_REGEX.test(formData.username.trim()) && PASSWORD_REGEX.test(formData.password);
  const isSubmitDisabled = !isFormValid || isButtonLoading;

  const handleClose = (): void => {
    clearAuthRedirectPath();
    setShowLoginSecurityVerify(false);
    dispatch(closeAuthModal());
  };

  // 验证表单
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) {
          return t('login.usernameRequired');
        }
        if (!USERNAME_REGEX.test(value.trim())) {
          return t('login.usernameFormat');
        }
        return '';
      case 'password':
        if (!value) {
          return t('login.passwordRequired');
        }
        if (!PASSWORD_REGEX.test(value)) {
          return t('login.passwordFormat');
        }
        return '';
      default:
        return '';
    }
  };

  // 验证所有字段
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields: Array<'username' | 'password'> = ['username', 'password'];

    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name: string): void => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name as keyof typeof formData]);
    if (error) {
      setErrors({ ...errors, [name]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleChange = (name: string, value: string): void => {
    setFormData({ ...formData, [name]: value });
    // 如果字段已经被触摸过，实时验证
    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors({ ...errors, [name]: error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handleRememberPasswordChange = (checked: boolean): void => {
    setRememberPassword(checked);
    // 实时保存用户的偏好设置
    if (!isSSR()) {
      localStorage.setItem('isKeepLogin', checked ? '1' : '0');
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // 防止重复提交：如果已在 loading 或表单无效，直接返回
    if (isSubmitDisabled) {
      return;
    }

    // 标记所有字段为已触摸
    const allTouched: Record<string, boolean> = {
      username: true,
      password: true,
    };
    setTouched(allTouched);

    if (!validateAll()) {
      return;
    }

    // 立即显示 loading
    setIsSubmitting(true);

    // 如果需要验证码，显示验证码弹窗
    if (needCaptcha) {
      setShowGeetestCaptcha(true);
    } else {
      // 不需要验证码，直接登录
      handleLogin();
    }
  };

  // 执行登录
  const handleLogin = async (geetestResult?: {
    captcha_output: string;
    lot_number: string;
    pass_token: string;
    gen_time: string;
  }): Promise<void> => {
    try {
      const loginParams: Parameters<typeof login>[0] = {
        loginName: formData.username,
        password: formData.password,
        keepLogin: rememberPassword ? '1' : '0',
      };

      // 如果使用极验验证码，添加验证码参数
      if (needCaptcha && geetestResult) {
        loginParams.captchaId = __SITE_CONFIG__.captcha?.geetest?.captchaId;
        loginParams.captchaOutput = geetestResult.captcha_output;
        loginParams.lotNumber = geetestResult.lot_number;
        loginParams.passToken = geetestResult.pass_token;
        loginParams.genTime = geetestResult.gen_time;
      }

      const result = await login(loginParams);
      setIsSubmitting(false);
      if (result.success) {
        handleClose();
        return;
      }
      if (result.code === API_CODE_ORIGIN_SECURITY_CENTER_NEED_SET_PASSWORD) {
        setShowLoginSecurityVerify(true);
        return;
      }
      if (result.code === API_CODE_ORIGIN_FIRST_LOGIN_NEED_SET_PASSWORD) {
        setShowFirstLoginSetPassword(true);
      }
    } catch (error) {
      console.error('登录失败:', error);
      setIsSubmitting(false);
    }
  };

  const handleSecurityVerifySuccess = async (token: string): Promise<void> => {
    const keepLogin = rememberPassword ? '1' : '0';
    const fallbackParams: Parameters<typeof login>[0] = {
      loginName: formData.username,
      password: formData.password,
      keepLogin,
      token,
    };

    try {
      const storedParams = sessionStorage.getItem('params');
      const nextParams = storedParams
        ? { ...(JSON.parse(storedParams) as Record<string, unknown>), token }
        : fallbackParams;
      sessionStorage.setItem('params', JSON.stringify(nextParams));

      setIsSubmitting(true);
      const result = await login({
        loginName: formData.username,
        password: formData.password,
        keepLogin,
      });
      setIsSubmitting(false);

      if (result.success) {
        setShowLoginSecurityVerify(false);
        handleClose();
        return;
      }

      if (result.code === API_CODE_ORIGIN_SECURITY_CENTER_NEED_SET_PASSWORD) {
        setShowLoginSecurityVerify(true);
      } else {
        sessionStorage.removeItem('params');
        setShowLoginSecurityVerify(false);
      }
    } catch (error) {
      console.error('登录二次验证失败:', error);
      setIsSubmitting(false);
    }
  };

  // 极验验证码验证成功回调
  const handleGeetestSuccess = (result: {
    captcha_output: string;
    lot_number: string;
    pass_token: string;
    gen_time: string;
  }): void => {
    setShowGeetestCaptcha(false);
    handleLogin(result);
  };

  // 极验验证码关闭回调
  const handleGeetestClose = (): void => {
    setShowGeetestCaptcha(false);
    setIsSubmitting(false);
  };

  const handleRegisterClick = (): void => {
    dispatch(openRegisterModal());
  };

  // 游客进入关闭登录弹窗并进入首页
  const handleGuestEntry = (): void => {
    clearAuthRedirectPath();
    dispatch(closeAuthModal());
    navigateTo(PATHS.home);
  };

  const handleOpenCustomerService = (): void => {
    setShowLoginSecurityVerify(false);
    dispatch(closeAuthModal());
    openCustomerService();
  };

  const handleForgotPasswordClick = (): void => {
    setShowForgotPassword(true);
  };

  const handleForgotPaymentPasswordClick = async (): Promise<void> => {
    const loginName = formData.username.trim();
    if (!loginName) return;

    try {
      const res = await getSecurityCenterReq({ loginName });
      setForgotPaymentSecurityData(res?.data ?? null);
    } catch {
      setForgotPaymentSecurityData(null);
    }

    setShowLoginSecurityVerify(false);
    setShowForgotPaymentPasswordModal(true);
  };

  // 读取缓存的账号密码
  useEffect(() => {
    if (isSSR() || !show) {
      return;
    }

    const userName = localStorage.getItem('userName');
    const userPwd = localStorage.getItem('userPwd');
    const isKeepLoginStore = localStorage.getItem('isKeepLogin');

    // 优先设置开关状态
    if (isKeepLoginStore !== null) {
      setRememberPassword(isKeepLoginStore === '1');
    } else {
      // 如果本地没有存（新用户/新设备），默认设为 true
      setRememberPassword(true);
    }

    // 填充账号密码
    if (userName || userPwd) {
      if (userName) {
        setFormData((prev) => ({ ...prev, username: userName }));
      }

      if (userPwd) {
        const decryptedPwd = decryptPassword(userPwd);
        if (decryptedPwd) {
          setFormData((prev) => ({ ...prev, password: decryptedPwd }));
        } else {
          console.warn('密码解密失败，已清除旧数据');
          localStorage.removeItem('userPwd');
        }
      }
    }
  }, [show]);

  // 弹窗关闭时重置表单
  useEffect(() => {
    if (!show) {
      setFormData({ username: '', password: '' });
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [show]);

  return (
    <ClientOnly>
      <Overlay
        show={show}
        close={handleClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.loginModal}
      >
        <div className={`${styles.loginModal} ${isMobile ? styles.mobile : styles.desktop}`}>
          {/* 关闭按钮（Pad/Web在右上角，H5在Banner内） */}
          {!isMobile && <NewLoginModalClose onClick={handleClose} />}

          {/* Banner区域 */}
          <div className={styles.banner}>
            <LoginBanner isMobile={isMobile} />
            {/* H5关闭按钮 */}
            {isMobile && <NewLoginModalClose onClick={handleClose} />}
          </div>

          {/* 表单区域 */}
          <div className={styles.formContainer}>
            <h1 className={styles.title}>{t('login.title')}</h1>

            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              className={styles.form}
            >
              <div className={styles.formFields}>
                {/* 账号输入框 */}
                <FormInput
                  type="text"
                  placeholder={t('login.usernamePlaceholder')}
                  value={formData.username}
                  onChange={(value) => handleChange('username', value)}
                  onBlur={() => handleBlur('username')}
                  disabled={isButtonLoading}
                  error={errors.username}
                  showError={touched.username}
                />

                {/* 密码输入框 */}
                <FormInput
                  type="password"
                  placeholder={t('login.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(value) => handleChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isButtonLoading}
                  error={errors.password}
                  showError={touched.password}
                />

                {/* 记住密码和忘记密码 */}
                <div className={styles.rememberForgot}>
                  <CircleCheck
                    checked={rememberPassword}
                    onChange={handleRememberPasswordChange}
                    className={styles.rememberPassword}
                  >
                    {t('login.rememberPassword')}
                  </CircleCheck>
                  <button
                    type="button"
                    className={styles.forgotPassword}
                    onClick={handleForgotPasswordClick}
                  >
                    {t('login.forgotPassword')}
                  </button>
                </div>
              </div>

              <div className={styles.formActions}>
                {/* 登录按钮：表单未填完整或提交中为不可点击状态 */}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isButtonLoading}
                  disabled={isSubmitDisabled}
                  className="_tf[16]"
                >
                  {isButtonLoading ? t('login.loggingIn') : t('login.loginButton')}
                </Button>

                {/* 底部按钮组 */}
                <div className={styles.buttonGroup}>
                  <Button
                    type="second"
                    className="flex-1 _tf[14]"
                    icon={<ToRegisterSvg className="w-16px text-[var(--Text-800)]" />}
                    onClick={handleRegisterClick}
                  >
                    <span>{t('login.register')}</span>
                  </Button>
                  <Button
                    type="second"
                    className="flex-1 _tf[14]"
                    icon={<PersonSvg className="w-16px text-[var(--Text-800)]" />}
                    onClick={handleGuestEntry}
                  >
                    <span>{t('login.guest')}</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.footerLinks}>
                <button
                  type="button"
                  className={styles.footerLink}
                  onClick={handleOpenCustomerService}
                >
                  <CustomerServiceHeadsetSvg className={styles.footerLinkIcon} />
                  <span>{t('login.onlineService')}</span>
                </button>
              </div>
              {/* <p className={styles.version}>V6.0.5</p> */}
            </div>
          </div>
        </div>
      </Overlay>
      <GeetestCaptcha
        visible={showGeetestCaptcha}
        onSuccess={handleGeetestSuccess}
        onClose={handleGeetestClose}
      />
      <ForgotPasswordModal
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false);
          clearRememberedLoginPassword();
          setFormData((prev) => ({ ...prev, password: '' }));
        }}
        initialAccount={formData.username}
      />
      <LoginSecurityVerifyModal
        show={showLoginSecurityVerify}
        loginName={formData.username.trim()}
        onClose={() => {
          setShowLoginSecurityVerify(false);
          setIsSubmitting(false);
        }}
        onSuccess={handleSecurityVerifySuccess}
        onForgotPassword={() => {
          void handleForgotPaymentPasswordClick();
        }}
      />
      <BindPaymentPasswordModal
        show={showForgotPaymentPasswordModal}
        mode="forgot"
        loginName={formData.username.trim()}
        securityData={forgotPaymentSecurityData}
        onClose={() => {
          setShowForgotPaymentPasswordModal(false);
          setForgotPaymentSecurityData(null);
        }}
      />
      <FirstLoginSetPasswordModal
        show={showFirstLoginSetPassword}
        loginName={formData.username.trim()}
        onClose={() => setShowFirstLoginSetPassword(false)}
        onSuccess={() => {
          setShowFirstLoginSetPassword(false);
          setFormData((prev) => ({ ...prev, password: '' }));
        }}
      />
    </ClientOnly>
  );
};

export default LoginPage;
