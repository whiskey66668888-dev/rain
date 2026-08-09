import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useSearchParams } from 'react-router-dom';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { toastCustom } from '@/common/components/Toast';
import { useLogin } from '@/common/hooks/useLogin';

import { registerReq } from '@/apis/origin/login';
import { readUUID } from '@/core/sdk/request/util';
import { navigateTo } from '@/common/hooks/useGlobalNavigate';
import { PATHS } from '@/sites/op7/routes/paths';
import { clearAuthRedirectPath } from '@/common/router/authRedirect';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { closeAuthModal, openLoginModal } from '@/core/store/slices/authUISlice';

import FormInput from '../../components/FormInput';
import OwnCaptcha from '../../components/OwnCaptcha';
import GeetestCaptcha from '../../components/GeetestCaptcha';
import LoginBanner from '../../components/LoginBanner';
import { NewLoginModalClose } from '../../components/themeIcon';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
// import siteConfig from '../../site.config';
import styles from './RegisterPage.module.scss';
import { zIndexMap } from '@/utils/constants/zIndex';
import { usePreInfoQuery } from '@/apis/origin/setting';
import {
  ArrowLeftCutoutSvg,
  CustomerServiceHeadsetSvg,
  PersonSvg,
} from '../../components/SvgIcons';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { login, isLoading: isLoginLoading } = useLogin();
  const [searchParams] = useSearchParams();
  const activeModal = useAppSelector((state) => state.authUI.activeModal);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const { data: preInfo } = usePreInfoQuery();

  // 从 URL 参数获取邀请码
  const inviterCodeFromUrl = searchParams.get('inviterCode') || '';
  const sysAgentNameFromUrl = searchParams.get('sysAgentName') || '';

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    inviteCode: inviterCodeFromUrl || '',
  });
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showGeetestCaptcha, setShowGeetestCaptcha] = useState(false);
  const openCustomerService = useOpenCustomerService();
  // 合并本地提交状态和 loading 状态
  const isButtonLoading = isSubmitting || isLoading || isLoginLoading;
  // 验证码配置：1=极验验证码, 2=自有验证码
  const captchaId =
    __SITE_CONFIG__.captcha?.geetest?.captchaId ?? '28e6e3d5493ab7b717eb71827fda4ea4';
  // 验证码开关：与 emc-h5 一致，注册使用 preInfo.geetestSwitch（1=极验 2=自有验证码）
  const needGeetestCaptcha = preInfo?.geetestSwitch === '1';
  const needOwnCaptcha = preInfo?.geetestSwitch === '2';

  const show = activeModal === 'register';

  // 表单可提交：必填项符合规则时主按钮才可点击
  const isFormValid = (() => {
    const { username, password, confirmPassword, inviteCode } = formData;
    const u = username.trim();
    if (!u || u.length < 5 || u.length > 16 || !/^[a-zA-Z0-9]+$/.test(u)) {
      return false;
    }
    if (
      !password ||
      password.length < 8 ||
      password.length > 16 ||
      !/^(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)
    ) {
      return false;
    }
    if (!confirmPassword || confirmPassword !== password) {
      return false;
    }
    if (showInviteCode && inviteCode.trim() && inviteCode.trim().length < 4) {
      return false;
    }
    return true;
  })();
  const isSubmitDisabled = !isFormValid || isButtonLoading;

  const handleClose = (): void => {
    clearAuthRedirectPath();
    dispatch(closeAuthModal());
  };

  // 验证表单
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username': {
        const u = value.trim();
        if (!u) {
          return t('register.validation.usernameRequired');
        }
        if (!/^[a-zA-Z0-9]+$/.test(u)) {
          return t('register.validation.usernameAlphanumericOnly');
        }
        if (u.length < 5) {
          return t('register.validation.usernameMinLength');
        }
        if (u.length > 16) {
          return t('register.validation.usernameMaxLength');
        }
        return '';
      }
      case 'password':
        if (!value) {
          return t('register.validation.passwordRequired');
        }
        if (value.length < 8 || value.length > 16) {
          return t('register.validation.passwordLength');
        }
        if (!/^(?=.*[0-9])(?=.*[a-zA-Z])/.test(value)) {
          return t('register.validation.passwordFormat');
        }
        return '';
      case 'confirmPassword':
        if (!value) {
          return t('register.validation.confirmPasswordRequired');
        }
        if (value !== formData.password) {
          return t('register.validation.passwordMismatch');
        }
        return '';
      case 'inviteCode':
        if (showInviteCode && value.trim() && value.trim().length < 4) {
          return t('register.validation.inviteCodeMinLength');
        }
        return '';
      default:
        return '';
    }
  };

  // 验证所有字段
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields: Array<'username' | 'password' | 'confirmPassword' | 'inviteCode'> = [
      'username',
      'password',
      'confirmPassword',
    ];
    if (showInviteCode) {
      fields.push('inviteCode');
    }

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // 防止重复提交：如果已在 loading 或表单无效，直接返回
    if (isSubmitDisabled) {
      return;
    }

    // 标记所有字段为已触摸
    const allTouched: Record<string, boolean> = {
      username: true,
      password: true,
      confirmPassword: true,
    };
    if (showInviteCode) {
      allTouched.inviteCode = true;
    }
    setTouched(allTouched);

    if (!validateAll()) {
      return;
    }

    // 立即显示 loading
    setIsSubmitting(true);

    // 根据验证码类型显示对应的验证码弹窗
    if (needGeetestCaptcha) {
      setShowGeetestCaptcha(true);
    } else if (needOwnCaptcha) {
      setShowCaptcha(true);
    } else {
      // 不需要验证码，直接注册
      handleRegister();
    }
  };

  // 注册函数
  const handleRegister = async (
    geetestResult?: {
      captcha_output: string;
      lot_number: string;
      pass_token: string;
      gen_time: string;
    },
    captchaKey?: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const uuid = readUUID();
      const sessionSysAgentName = sessionStorage.getItem('sysAgentName');
      const params = {
        loginName: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        inviter: formData.inviteCode.trim() || undefined,
        agentLoginName: sysAgentNameFromUrl || sessionSysAgentName || undefined,
        urlCode: sysAgentNameFromUrl || sessionSysAgentName || undefined,
        uuid: uuid || undefined,
        captchaId: needGeetestCaptcha ? captchaId : captchaKey || undefined,
        captchaOutput: geetestResult?.captcha_output,
        lotNumber: geetestResult?.lot_number,
        passToken: geetestResult?.pass_token,
        genTime: geetestResult?.gen_time,
      };

      await registerReq(params);

      if (sessionSysAgentName) {
        sessionStorage.removeItem('sysAgentName');
      }

      toastRegisterSuccess();

      const loginResult = await login({
        loginName: formData.username.trim(),
        password: formData.password,
        keepLogin: '1',
      });

      setIsLoading(false);
      setIsSubmitting(false);

      if (loginResult.success) {
        handleClose();
        return;
      }

      handleClose();
      dispatch(openLoginModal());
    } catch (error) {
      console.error('注册失败:', error);
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // 自有验证码验证通过后的回调
  const handleCaptchaSuccess = async (captchaKey?: string): Promise<void> => {
    await handleRegister(undefined, captchaKey);
  };

  // 极验验证码验证通过后的回调
  const handleGeetestSuccess = (result: {
    captcha_output: string;
    lot_number: string;
    pass_token: string;
    gen_time: string;
  }): void => {
    setShowGeetestCaptcha(false);
    handleRegister(result);
  };

  // 极验验证码关闭回调
  const handleGeetestClose = (): void => {
    setShowGeetestCaptcha(false);
    setIsSubmitting(false);
  };

  // 自有验证码关闭/取消时重置提交状态，避免按钮一直处于 loading
  const handleOwnCaptchaVisible = (visible: boolean): void => {
    setShowCaptcha(visible);
    if (!visible) setIsSubmitting(false);
  };

  // 极验验证码处理器
  const geetestHandler = (captchaObj: {
    destroy: () => void;
    appendTo: (element: HTMLElement | string) => unknown;
    onReady: (callback: () => void) => unknown;
    onNextReady: (callback: () => void) => unknown;
    onBoxShow: (callback: () => void) => unknown;
    onError: (callback: (error: unknown) => void) => unknown;
    onSuccess: (callback: () => void) => unknown;
    onClose: (callback: () => void) => unknown;
    showCaptcha: () => void;
    getValidate: () => {
      captcha_output: string;
      lot_number: string;
      pass_token: string;
      gen_time: string;
    } | null;
  }): void => {
    // 验证码对象已准备好，可以在这里进行额外配置
    console.log('Geetest验证码对象已创建:', captchaObj);
  };

  const handleLoginClick = (): void => {
    dispatch(openLoginModal());
  };

  // 游客进入：与 emc-h5 一致，关闭注册弹窗并进入首页（不登录）
  const handleGuestEntry = (): void => {
    clearAuthRedirectPath();
    dispatch(closeAuthModal());
    navigateTo(generatePath(PATHS.entertainment, { pageType: 'home', id: '' }));
  };

  const handleOpenCustomerService = (): void => {
    dispatch(closeAuthModal());
    openCustomerService();
  };

  const toastRegisterSuccess = (): void => {
    toastCustom({
      content: (
        <div className="flex items-center gap-3">
          <img
            src="/images/common/toast/success.svg"
            alt=""
            width="16"
            height="16"
            className="flex-shrink-0"
          />
          <span className="text-green-500 font-medium">{t('register.registerSuccess')}</span>
        </div>
      ),
      duration: 2000,
    });
  };

  // 弹窗关闭时重置表单
  useEffect(() => {
    if (!show) {
      setFormData({ username: '', password: '', confirmPassword: '', inviteCode: '' });
      setErrors({});
      setTouched({});
      setShowCaptcha(false);
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
        zIndex={zIndexMap.registerModal}
      >
        <div className={`${styles.registerModal} ${isMobile ? styles.mobile : styles.desktop}`}>
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
            {/* <div onClick={() => { setShowCaptcha(true) }}>123</div> */}
            <h1 className={styles.title}>{t('register.title')}</h1>

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
                  placeholder={t('register.usernamePlaceholder')}
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
                  placeholder={t('register.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(value) => handleChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isButtonLoading}
                  error={errors.password}
                  showError={touched.password}
                />

                {/* 确认密码输入框 */}
                <FormInput
                  type="password"
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(value) => handleChange('confirmPassword', value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={isButtonLoading}
                  error={errors.confirmPassword}
                  showError={touched.confirmPassword}
                />

                {/* 邀请码区域 */}
                <div className={styles.inviteCodeSection}>
                  <button
                    type="button"
                    className={styles.inviteCodeToggle}
                    onClick={() => setShowInviteCode(!showInviteCode)}
                  >
                    <span>{t('register.inviteCode')}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={showInviteCode ? styles.arrowUp : styles.arrowDown}
                    >
                      <path
                        d="M2 4L6 8L10 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div
                    className={`${styles.inviteCodeInputWrapper} ${
                      showInviteCode ? styles.show : styles.hide
                    }`}
                  >
                    <FormInput
                      type="text"
                      placeholder={t('register.inviteCodePlaceholder')}
                      value={formData.inviteCode}
                      onChange={(value) => handleChange('inviteCode', value)}
                      onBlur={() => handleBlur('inviteCode')}
                      disabled={isButtonLoading}
                      error={errors.inviteCode}
                      showError={touched.inviteCode}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                {/* 注册按钮：表单未填完整或不符合规则或提交中为不可点击状态 */}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isButtonLoading}
                  disabled={isSubmitDisabled}
                  className="_tf[16]"
                >
                  {isButtonLoading ? t('register.registering') : t('register.registerButton')}
                </Button>

                {/* 底部按钮组 */}
                <div className={styles.buttonGroup}>
                  <Button
                    type="second"
                    className="flex-1 _tf[14]"
                    icon={<ArrowLeftCutoutSvg className="w-16px text-[var(--Text-800)]" />}
                    onClick={handleLoginClick}
                  >
                    <span>{t('register.goToLogin')}</span>
                  </Button>
                  <Button
                    type="second"
                    className="flex-1 _tf[14]"
                    icon={<PersonSvg className="w-16px text-[var(--Text-800)]" />}
                    onClick={handleGuestEntry}
                  >
                    <span>{t('register.guestEntry')}</span>
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
                  <span>{t('register.onlineService')}</span>
                </button>
              </div>
              {/* <p className={styles.version}>V6.0.3</p> */}
            </div>
          </div>
        </div>
      </Overlay>
      <OwnCaptcha
        visible={showCaptcha}
        setVisible={handleOwnCaptchaVisible}
        callBack={handleCaptchaSuccess}
      />
      <GeetestCaptcha
        visible={showGeetestCaptcha}
        handler={geetestHandler}
        onSuccess={handleGeetestSuccess}
        onClose={handleGeetestClose}
      />
    </ClientOnly>
  );
};

export default RegisterPage;
