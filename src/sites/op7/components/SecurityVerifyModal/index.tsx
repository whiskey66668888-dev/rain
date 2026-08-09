import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import Modal from '@/common/components/Modal';
import Button from '@/common/components/Button';
import { zIndexMap } from '@/utils/constants/zIndex';
import {
  getSecurityCenterReq,
  getCodeBySMSReq,
  getCodeByEmailReq,
  verifyByMicrosoftReq,
  verifyByPhoneReq,
  verifyByEmailReq,
  getCustomerServiceInfoReq,
  type SecurityBindItem,
  type SecurityCenterResponse,
} from '@/apis/origin/login';
import { toast } from '@/common/components/Toast';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { buildKefuUrl } from '@/sites/op7/utils/kefuUrl';
import { CircleExclamationSvg } from '@/sites/op7/components/SvgIcons';
import PhoneVerifyForm from '@/sites/op7/components/PhoneVerifyForm';
import FormInput from '@/sites/op7/components/FormInput';
import styles from './SecurityVerifyModal.module.scss';
import { createPortal } from 'react-dom';
import Icon from '@/common/components/Icon';

const SECURITY_KEY_META: Record<string, { label: string; icon: string }> = {
  Safety_Phone: { label: '安全手机号验证', icon: '/images/common/safeCenter/phone_method.svg' },
  Safety_Email: { label: '安全邮箱验证', icon: '/images/common/safeCenter/email.svg' },
  Microsoft_Token: { label: '微软安全令牌', icon: '/images/common/safeCenter/lingpai2.svg' },
  Gesture_Password: { label: '手势密码验证', icon: '/images/common/safeCenter/paypassword.svg' },
};
const EMAIL_REG =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isValidEmail = (v: string) => EMAIL_REG.test(String(v).toLowerCase());

export interface SecurityVerifyModalProps {
  /** 动态标题，展示在头部，如「手机绑定」「手机解绑」 */
  title?: string;
  /** 红色提示条文案，由调用方传入，如「完成任意一种验证」「请选择一种动态验证进行解绑」 */
  tip?: string;
  visible: boolean;
  onClose: () => void;
  excludeKeys?: string[];
  /** 验证成功回调，若为微软验证且接口返回 token 会传入供后续 bindPhone 使用 */
  onVerifySuccess?: (securityKey: string, token?: string) => void | Promise<void>;
  /** 微软验证步骤的页面标题，与 title 一致场景可传同一值，如「手机绑定」「手机解绑」 */
  microsoftStepPageTitle?: string;
  /** 调用 verifyByMicrosoft 时的 type，如 6=手机绑定、7=手机解绑 */
  microsoftVerifyType?: number;
  /** 主列表页（未进入子步骤时）标题下方的副标题，不传或传空则不显示，默认「手机验证」 */
  mainSubtitle?: string | null;
  /** 为 true 时邮箱步骤显示可输入框+placeholder，不展示已绑定邮箱；用于微软令牌绑定等场景 */
  emailStepEditable?: boolean;
  /** 无可用验证渠道时回调，不展示「暂无可用/联系客服」块，直接走后续流程 */
  onNoAvailableChannels?: () => void;
  /** 补绑动态认证时后端要求继续透传的 unbindType */
  unbindType?: string;
  /** 父层已持有安全中心数据时优先复用，避免弹窗打开后重复请求 */
  securityData?: SecurityCenterResponse | null;
  /** 未登录场景允许外部透传 loginName，覆盖 store 中的会员名 */
  loginName?: string;
  /** 列表底部「联系人工客服」点击回调，不传则走 getCustomerServiceInfo 人工客服流程 */
  onContactCustomerService?: () => void;
  /** 忘记密码等场景：人工客服无 orderId 时由父层接管预设密码步骤 */
  onCustomerServicePresetRequired?: () => void;
}

const BIND_PHONE_VERIFY_TYPE = 6;
/** 忘记登录密码：无 orderId 时需预设密码 */
const PRESET_PASSWORD_CUSTOMER_SERVICE_TYPES = new Set([2]);

const SecurityVerifyModal: React.FC<SecurityVerifyModalProps> = ({
  title,
  tip,
  visible,
  onClose,
  excludeKeys = [],
  onVerifySuccess,
  microsoftStepPageTitle = '手机绑定',
  microsoftVerifyType = BIND_PHONE_VERIFY_TYPE,
  mainSubtitle,
  emailStepEditable = false,
  onNoAvailableChannels,
  unbindType,
  securityData,
  loginName: loginNameProp,
  onContactCustomerService,
  onCustomerServicePresetRequired,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const storeLoginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';
  const loginName = loginNameProp ?? storeLoginName;
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [securityBindList, setSecurityBindList] = useState<SecurityBindItem[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [_, setSecurityCenterPhone] = useState<{
    phone: string;
    countryCode: string;
  } | null>(null);
  const [securityCenterEmail, setSecurityCenterEmail] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [microsoftCode, setMicrosoftCode] = useState('');
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneCountDown, setPhoneCountDown] = useState(0);
  const [phoneStepPhone, setPhoneStepPhone] = useState('');
  const [phoneStepCountryCode, setPhoneStepCountryCode] = useState('86');
  const [emailCode, setEmailCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailCountDown, setEmailCountDown] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [customerServiceLoading, setCustomerServiceLoading] = useState(false);
  const openCustomerService = useOpenCustomerService();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const emailInputValue = emailInput.trim();
  const emailForStep = emailStepEditable ? emailInputValue : emailInputValue || securityCenterEmail;
  const emailStepPlaceholder = securityCenterEmail ?? '请输入邮箱号码';

  const handleContactCustomerService = useCallback(() => {
    if (onContactCustomerService) {
      onContactCustomerService();
      return;
    }

    if (!loginName.trim()) {
      openCustomerService();
      return;
    }

    if (customerServiceLoading) return;
    setCustomerServiceLoading(true);
    void (async () => {
      try {
        const res = await getCustomerServiceInfoReq({
          loginName: loginName.trim(),
          type: microsoftVerifyType,
        });
        const data = res?.data ?? (res as { data?: { orderId?: string; kefu?: string } })?.data;
        const orderId = data?.orderId;
        const kefu = data?.kefu;

        if (orderId && kefu) {
          window.open(buildKefuUrl(kefu, orderId), '_blank');
          onClose();
          return;
        }

        if (kefu) {
          window.open(buildKefuUrl(kefu), '_blank');
          return;
        }

        if (PRESET_PASSWORD_CUSTOMER_SERVICE_TYPES.has(microsoftVerifyType)) {
          onCustomerServicePresetRequired?.();
          return;
        }

        openCustomerService();
      } catch {
        // error handled by isErrorToast
      } finally {
        setCustomerServiceLoading(false);
      }
    })();
  }, [
    onContactCustomerService,
    loginName,
    customerServiceLoading,
    microsoftVerifyType,
    onClose,
    onCustomerServicePresetRequired,
    openCustomerService,
  ]);

  const applySecurityData = useCallback((data?: SecurityCenterResponse | null) => {
    const list = Array.isArray(data?.securityBindList) ? data.securityBindList : [];
    setSecurityBindList(list);
    const topPhone = data?.phone;
    const phoneItem = list.find(
      (item) => (item as { securityKey?: string }).securityKey === 'Safety_Phone',
    ) as { phone?: string; countryCode?: string } | undefined;
    const phone = topPhone ?? phoneItem?.phone;
    const rawCountryFromData = data?.countryCode;
    const fromPhoneItem =
      phoneItem?.countryCode != null ? String(phoneItem.countryCode).replace(/^\+/, '') : '';
    const code =
      typeof rawCountryFromData === 'string' || typeof rawCountryFromData === 'number'
        ? String(rawCountryFromData).replace(/^\+/, '')
        : fromPhoneItem || '86';
    if (phone && String(phone).trim()) {
      const trimmed = String(phone).trim();
      setSecurityCenterPhone({ phone: trimmed, countryCode: code });
      setPhoneStepPhone(trimmed);
      setPhoneStepCountryCode(code);
    } else {
      setSecurityCenterPhone(null);
      setPhoneStepPhone('');
      setPhoneStepCountryCode('86');
    }
    const emailItem = list[1] as { detail?: { email?: string } } | undefined;
    const email = emailItem?.detail?.email ?? data?.email ?? null;
    setSecurityCenterEmail(email && String(email).trim() ? String(email).trim() : null);
    setHasFetched(true);
  }, []);

  useEffect(() => {
    if (phoneCountDown <= 0) return;
    const t = setInterval(() => setPhoneCountDown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [phoneCountDown]);

  useEffect(() => {
    if (emailCountDown <= 0) return;
    const t = setInterval(() => setEmailCountDown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [emailCountDown]);

  useEffect(() => {
    if (!visible) {
      setHasFetched(false);
      setSelectedMethod(null);
      setMicrosoftCode('');
      setPhoneCode('');
      setPhoneStepPhone('');
      setPhoneStepCountryCode('86');
      setEmailCode('');
      setEmailInput('');
      setPhoneCountDown(0);
      setEmailCountDown(0);
      setCustomerServiceLoading(false);
      return;
    }
    setHasFetched(false);
    if (securityData) {
      applySecurityData(securityData);
      return;
    }
    getSecurityCenterReq(loginName ? { loginName } : undefined)
      .then((res) => {
        applySecurityData(res?.data ?? null);
      })
      .catch(() => {
        setSecurityBindList([]);
        setSecurityCenterPhone(null);
        setSecurityCenterEmail(null);
        setPhoneStepPhone('');
        setPhoneStepCountryCode('86');
        setHasFetched(true);
      });
  }, [visible, securityData, applySecurityData, loginName]);

  const handlePasteCode = useCallback(() => {
    navigator.clipboard
      .readText()
      .then((text) => setMicrosoftCode(() => text.replace(/\D/g, '').slice(0, 6)));
  }, []);

  const handleMicrosoftConfirm = useCallback(() => {
    const code = microsoftCode.trim();
    if (code.length !== 6) return;
    if (!loginName.trim()) return;
    setMicrosoftLoading(true);
    verifyByMicrosoftReq({
      code,
      type: microsoftVerifyType,
      loginName,
      ...(unbindType ? { unbindType } : {}),
    })
      .then((res) => {
        const nextToken = (res?.data as { token?: string })?.token;
        onVerifySuccess?.('Microsoft_Token', nextToken);
        // 不调用 onClose()：父组件会在 onVerifySuccess 中关闭弹窗；若此处也调 onClose，
        // 因 setState 异步，父组件 onClose 内 verifiedKey 仍为空会误执行 navigate，导致无法进入重置手机号表单
      })
      .finally(() => setMicrosoftLoading(false));
  }, [microsoftCode, microsoftVerifyType, loginName, onVerifySuccess, unbindType]);

  const availableMethods = useMemo(() => {
    const excludeSet = new Set(excludeKeys);
    return securityBindList.filter(
      (item) =>
        item.bind &&
        !!item.securityKey &&
        SECURITY_KEY_META[item.securityKey] &&
        !excludeSet.has(item.securityKey),
    );
  }, [excludeKeys, securityBindList]);

  useEffect(() => {
    if (visible && hasFetched && availableMethods.length === 0 && onNoAvailableChannels) {
      onNoAvailableChannels();
    }
  }, [visible, hasFetched, availableMethods.length, onNoAvailableChannels]);

  const handlePhoneGetCode = useCallback(() => {
    if (!phoneStepPhone.trim()) return;
    setPhoneLoading(true);
    getCodeBySMSReq({
      phone: phoneStepPhone.trim(),
      countryCode: phoneStepCountryCode,
      type: microsoftVerifyType,
      ...(loginName && { loginName }),
      ...(unbindType ? { unbindType } : {}),
    })
      .then(() => {
        toast({ type: 'success', description: '验证码已发送' });
        setPhoneCountDown(60);
      })
      .finally(() => setPhoneLoading(false));
  }, [phoneStepPhone, phoneStepCountryCode, microsoftVerifyType, loginName, unbindType]);

  const handlePhoneConfirm = useCallback(() => {
    const code = phoneCode.trim();
    const phone = phoneStepPhone.trim();
    if (code.length !== 4 || !phone) return;
    setPhoneLoading(true);
    verifyByPhoneReq({
      phone,
      countryCode: phoneStepCountryCode,
      code,
      type: microsoftVerifyType,
      ...(loginName && { loginName }),
      ...(unbindType ? { unbindType } : {}),
    })
      .then((res) => {
        const token = (res?.data as { token?: string })?.token;
        onVerifySuccess?.('Safety_Phone', token);
      })
      .finally(() => setPhoneLoading(false));
  }, [
    phoneCode,
    phoneStepPhone,
    phoneStepCountryCode,
    microsoftVerifyType,
    loginName,
    onVerifySuccess,
    unbindType,
  ]);

  const handleEmailGetCode = useCallback(() => {
    const trimmed = emailInput.trim();
    if (!trimmed) {
      setErrors((e) => ({ ...e, email: '请输入邮箱' }));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setErrors((e) => ({ ...e, email: '邮箱格式不正确' }));
      return;
    }
    setErrors((e) => ({ ...e, email: '' }));
    setEmailLoading(true);
    getCodeByEmailReq({
      email: trimmed,
      type: microsoftVerifyType,
      ...(loginName && { loginName }),
      ...(unbindType ? { unbindType } : {}),
    })
      .then(() => {
        toast({ type: 'success', description: '验证码已发送' });
        setEmailCountDown(60);
      })
      .finally(() => setEmailLoading(false));
  }, [emailInput, microsoftVerifyType, loginName, unbindType]);

  const handleEmailConfirm = useCallback(() => {
    const code = emailCode.trim();
    const email = emailForStep;
    if (code.length !== 4 || !email) return;
    setEmailLoading(true);
    verifyByEmailReq({
      email,
      code,
      type: microsoftVerifyType,
      ...(loginName && { loginName }),
      ...(unbindType ? { unbindType } : {}),
    })
      .then((res) => {
        const token = (res?.data as { token?: string })?.token;
        onVerifySuccess?.('Safety_Email', token);
      })
      .finally(() => setEmailLoading(false));
  }, [emailCode, emailForStep, microsoftVerifyType, loginName, onVerifySuccess, unbindType]);

  const handleMethodClick = useCallback(
    (key: string) => {
      if (key === 'Microsoft_Token') {
        setSelectedMethod('Microsoft_Token');
      } else if (key === 'Safety_Phone') {
        setSelectedMethod('Safety_Phone');
      } else if (key === 'Safety_Email') {
        setSelectedMethod('Safety_Email');
      } else {
        onVerifySuccess?.(key);
        onClose();
      }
    },
    [onVerifySuccess, onClose],
  );

  const microsoftStepContent = (
    <div className={styles.microsoftStep}>
      <FormInput
        type="text"
        placeholder="请输入验证码"
        value={microsoftCode}
        onChange={(value) => setMicrosoftCode(value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
        autoComplete="one-time-code"
        variant={isMobile ? 'light' : 'default'}
        rightSlot={
          <button type="button" className={styles.pasteBtn} onClick={handlePasteCode}>
            粘贴
          </button>
        }
      />
      <Button
        type="primary"
        size="large"
        className={styles.confirmBtn}
        onClick={handleMicrosoftConfirm}
        loading={microsoftLoading}
        disabled={microsoftCode.trim().length !== 6 || microsoftLoading || !loginName.trim()}
      >
        提交
      </Button>
    </div>
  );

  const phoneStepContent = (
    <PhoneVerifyForm
      phone={phoneStepPhone}
      countryCode={phoneStepCountryCode}
      readOnly={false}
      onPhoneChange={setPhoneStepPhone}
      onCountryCodeChange={setPhoneStepCountryCode}
      verifyCode={phoneCode}
      onVerifyCodeChange={setPhoneCode}
      countDown={phoneCountDown}
      onGetCode={handlePhoneGetCode}
      getCodeLoading={phoneLoading}
      submitText="确定"
      onSubmit={handlePhoneConfirm}
      submitDisabled={phoneCode.trim().length !== 4 || phoneLoading}
      submitLoading={phoneLoading}
      verifyCodePlaceholder="请输入验证码"
      getCodeText="获取验证码"
    />
  );

  const emailStepContent = (
    <div className={styles.phoneStepForm}>
      <div className={styles.phoneStepFormRow}>
        <div className={styles.phoneStepPhoneRow}>
          <input
            type="text"
            className={styles.phoneStepVerifyInput}
            placeholder={emailStepPlaceholder}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value.trim())}
            autoComplete="email"
          />
        </div>
        {errors.email && <div className={styles.errorText}>{errors.email}</div>}
      </div>
      <div className={styles.phoneStepFormRow}>
        <div className={styles.phoneStepVerifyRow}>
          <input
            type="text"
            className={styles.phoneStepVerifyInput}
            placeholder="请输入验证码"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <button
            type="button"
            className={`${styles.phoneStepGetCodeBtn} ${emailCountDown > 0 || emailLoading || !isValidEmail(emailInput) ? styles.phoneStepGetCodeBtnDisabled : ''}`}
            onClick={handleEmailGetCode}
            disabled={emailCountDown > 0 || emailLoading || !isValidEmail(emailInput)}
          >
            {emailCountDown > 0 ? `${emailCountDown}s` : '获取验证码'}
          </button>
        </div>
      </div>
      <button
        type="button"
        className={`${styles.phoneStepSubmitBtn} ${emailCode.trim().length === 4 && !emailLoading ? styles.phoneStepSubmitBtnActive : styles.phoneStepSubmitBtnInactive}`}
        onClick={() => handleEmailConfirm()}
        disabled={emailCode.trim().length !== 4 || emailLoading || !emailForStep}
      >
        确定
      </button>
    </div>
  );

  const tipStripContent = (
    <div className={styles.tipStrip}>
      <div className={styles.tipIconWrap} aria-hidden>
        <CircleExclamationSvg />
      </div>
      <span className={styles.tipStripText}>{tip ?? '请选择一种已绑定的安全方式完成验证'}</span>
    </div>
  );

  const showChannelBlock = availableMethods.length > 0 || !onNoAvailableChannels;

  const bodyContent = (
    <>
      {showChannelBlock ? (
        <div className={styles.list}>
          {availableMethods.length === 0 ? (
            <div className={styles.empty}>暂无可用验证方式，请联系客服</div>
          ) : null}
          {availableMethods.map((item) => {
            const key = item.securityKey as string;
            const meta = SECURITY_KEY_META[key];
            if (!meta) return null;
            return (
              <button
                key={key}
                type="button"
                className={styles.itemBtn}
                onClick={() => handleMethodClick(key)}
              >
                <span className={styles.itemLeft}>
                  <img className={styles.itemIcon} src={meta.icon} alt="" />
                  <span className={styles.itemText}>{meta.label}</span>
                </span>
                <span className={styles.arrow}>
                  <Icon src="/images/common/arrow_right.svg" size="16px" color="var(--Text-800)" />
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className={styles.itemBtn}
            onClick={handleContactCustomerService}
            disabled={customerServiceLoading}
          >
            <span className={styles.itemLeft}>
              <img className={styles.itemIcon} src="/images/common/safeCenter/phone.svg" alt="" />
              <span className={styles.itemText}>
                {customerServiceLoading ? '处理中...' : '以上方式皆不可用,联系人工客服'}
              </span>
            </span>
            <span className={styles.arrow}>
              <Icon src="/images/common/arrow_right.svg" size="16px" color="var(--Text-800)" />
            </span>
          </button>
        </div>
      ) : null}

      <div className={styles.warmTip}>
        <p className={styles.warmTipTitle}>温馨提示：</p>
        <p className={styles.warmTipText}>
          解绑动态验证/重置动态密码后，首次提款出款时间延长12/14小时
        </p>
      </div>
    </>
  );

  const showMicrosoftStep = selectedMethod === 'Microsoft_Token';
  const showPhoneStep = selectedMethod === 'Safety_Phone';
  const showEmailStep = selectedMethod === 'Safety_Email';
  const showSubStep = showMicrosoftStep || showPhoneStep || showEmailStep;
  const handleBackFromSubStep = useCallback(() => setSelectedMethod(null), []);

  const backBtnSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={styles.backIcon}
      viewBox="0 0 10 10"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.05098 4.90179C2.00277 4.95 1.99741 5.02484 2.03491 5.07897L2.05098 5.09821L6.56861 9.61584C6.62284 9.67008 6.71078 9.67008 6.76502 9.61584L7.45249 8.92837C7.50673 8.87413 7.50673 8.78619 7.45249 8.73195L3.72054 5L7.45249 1.26805C7.50673 1.21381 7.50673 1.12587 7.45249 1.07163L6.76502 0.384164C6.71078 0.329925 6.62284 0.329925 6.56861 0.384164L2.05098 4.90179Z"
        fill="currentColor"
      />
    </svg>
  );

  const displayTitle = showSubStep ? microsoftStepPageTitle : (title ?? '身份验证');
  const subStepSubtitle = showMicrosoftStep
    ? '微软安全令牌验证'
    : showPhoneStep
      ? '安全手机号验证'
      : '邮箱验证';
  const headerRightBtn = (
    <button
      type="button"
      className={styles.headerRight}
      onClick={openCustomerService}
      aria-label="联系客服"
    >
      <Icon src="/images/common/customerService_1.svg" size="20px" color="var(--Text-Main-10)" />
    </button>
  );

  const verifyStepContent = showMicrosoftStep ? (
    <div className={styles.microsoftStepWrap}>
      {/* <p className={styles.tip}>微软安全令牌验证</p> */}
      {microsoftStepContent}
    </div>
  ) : showPhoneStep ? (
    <div className={styles.microsoftStepWrap}>
      {/* <p className={styles.tip}>{subStepSubtitle}</p> */}
      {phoneStepContent}
    </div>
  ) : showEmailStep ? (
    <div className={styles.microsoftStepWrap}>
      {/* <p className={styles.tip}>{subStepSubtitle}</p> */}
      {emailStepContent}
    </div>
  ) : (
    <div className={styles.modalBody}>{bodyContent}</div>
  );

  const verifyPanel = (
    <div className={styles.verifyPanel}>
      {!showSubStep && tipStripContent}
      <div className={styles.verifyPanelContent}>{verifyStepContent}</div>
    </div>
  );
  const modalTitle = (
    <>
      <div className={styles.titleWrap}>
        <div className={styles.title}>{displayTitle}</div>
        {showSubStep && <div className={styles.subtitle}>{subStepSubtitle}</div>}
      </div>
      <button
        type="button"
        className={styles.pcHeaderCustomerBtn}
        onClick={openCustomerService}
        aria-label="联系客服"
      >
        <Icon src="/images/common/customerService_1.svg" size="20px" color="var(--Text-Main-10)" />
      </button>
    </>
  );

  // H5：全屏页面展示，与 Figma 一致：动态标题 + 提示条 + 卡片列表
  if (visible && isMobile) {
    return createPortal(
      <>
        <div className={styles.page} style={{ zIndex: zIndexMap.loginModal + 3 }}>
          <header className={styles.header}>
            <div className={styles.bar}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={showSubStep ? handleBackFromSubStep : onClose}
                aria-label="返回"
              >
                {backBtnSvg}
              </button>
              <div className={styles.titleWrap}>
                <div className={styles.title}>{displayTitle}</div>
                {(showSubStep || (mainSubtitle !== null && mainSubtitle !== '')) && (
                  <div className={styles.subtitle}>
                    {showSubStep ? subStepSubtitle : (mainSubtitle ?? '')}
                  </div>
                )}
              </div>
              {headerRightBtn}
            </div>
          </header>

          {verifyPanel}
        </div>
      </>,
      document.body,
    );
  }

  // PC：弹窗展示，同样支持动态标题与提示条
  return (
    <>
      <Modal
        show={visible}
        title={modalTitle}
        showCloseButton
        maskClickClose={!showSubStep}
        zIndex={zIndexMap.loginModal + 3}
        className={`${styles.verifyModal} ${showSubStep ? styles.verifySubStepModal : ''}`}
        footer={null}
        contentClassName={styles.verifyModalContent}
        onClose={showSubStep ? handleBackFromSubStep : onClose}
      >
        {verifyPanel}
      </Modal>
    </>
  );
};

export default SecurityVerifyModal;
