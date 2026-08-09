import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  getCountryCodeListReq,
  getCodeBySMSReq,
  bindPhoneReq,
  type CountryCodeItem,
  type SecurityCenterResponse,
} from '@/apis/origin/login';
import PickerModal from '../../PickerModal';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import { ChevronDownSvg } from '@/sites/op7/components/SvgIcons';
import styles from './VerifyPaymentPasswordModal.module.scss';

import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';

const BIND_PHONE_VERIFY_TYPE = 6;
const BIND_PHONE_TYPE = 6;

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

export interface VerifyPaymentPasswordModalProps {
  show: boolean;
  onClose: () => void;
  /** 手机绑定成功后的回调（用于刷新安全中心数据） */
  onSuccess?: () => void;
  /** 用户是否已设置过支付密码，仅此时显示「忘记支付密码？」 */
  hasPaymentPassword?: boolean;
  /** 点击「忘记支付密码？」时的回调，用于打开忘记支付密码弹窗 */
  onForgotPassword?: () => void;
  /** 验证成功后直接回调并关闭（不进入 step2 手机绑定），用于微软令牌等流程，回调支付密码验证返回的 token */
  onVerifySuccess?: (token?: string) => void;
  /** 支付密码验证的 type，如 6=手机绑定、10=微软令牌绑定，不传默认 6 */
  verifyType?: number;
  /** 自定义标题（verifyOnly 模式） */
  verifyTitle?: string;
  /** 自定义副标题（verifyOnly 模式） */
  verifySubtitle?: string;
  /** 补绑动态认证时后端返回的 unbindType，需继续透传 */
  unbindType?: string;
  /** 父层已持有安全中心数据时优先复用，避免重复请求 */
  securityData?: SecurityCenterResponse | null;
}

const VerifyPaymentPasswordModal: React.FC<VerifyPaymentPasswordModalProps> = ({
  show,
  onClose,
  onSuccess,
  hasPaymentPassword = false,
  onForgotPassword,
  onVerifySuccess,
  verifyType,
  verifyTitle,
  verifySubtitle,
  unbindType,
  securityData,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigateWithLanguage();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const openCustomerService = useOpenCustomerService();

  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeLoading, setCodeLoading] = useState(false);
  const [bindLoading, setBindLoading] = useState(false);
  /** 绑定手机流程：交易密码通过后是否显示 SecurityVerifyModal */
  const [securityVerifyVisible, setSecurityVerifyVisible] = useState(false);

  const [countryCodeList, setCountryCodeList] = useState<CountryCodeItem[]>([]);
  const [countryCode, setCountryCode] = useState('86');
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [countDown, setCountDown] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);

  const pickerColumns = useMemo(() => {
    if (!countryCodeList.length) return [[]];
    return [
      countryCodeList.map((item) => ({
        label: item.label ?? item.name ?? item.value,
        value: String(item.value).replace(/^\+/, ''),
      })),
    ];
  }, [countryCodeList]);

  useEffect(() => {
    if (!show) {
      setStep(1);
      setPassword('');
      setToken('');
      setErrors({});
      setPhone('');
      setVerifyCode('');
      setCountDown(0);
      setPickerVisible(false);
      setSecurityVerifyVisible(false);
    }
  }, [show]);

  useEffect(() => {
    if (step === 2) {
      getCountryCodeListReq()
        .then((res) => {
          const list = res?.data ?? [];
          list.forEach((item) => {
            if (!item.label && item.name) item.label = item.name;
          });
          setCountryCodeList(list);
          if (list.length > 0 && !list.some((i) => i.value === '86')) {
            const first = list[0];
            if (first?.value) setCountryCode(String(first.value).replace(/^\+/, ''));
          }
        })
        .catch(() => {});
    }
  }, [step]);

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
            <span style={backConfirmTextStyle}>{t('securityPhone.backConfirmTitle')}</span>
          </div>
        ),
        content: (
          <div style={{ marginTop: 9, marginBottom: -3 }}>
            <p style={backConfirmContentStyle}>{t('securityPhone.backConfirmContent')}</p>
          </div>
        ),
        showCloseButton: true,
        confirmText: t('securityPhone.backConfirmConfirm'),
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
      setErrors({ password: t('bindPaymentPassword.passwordRequired') });
      return;
    }
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setErrors({ password: t('bindPaymentPassword.passwordLength6') });
      return;
    }
    setErrors({});
    setBindLoading(true);
    verifyCashPasswordReq({
      loginName,
      cashPassword: trimmed,
      type: verifyType ?? BIND_PHONE_VERIFY_TYPE,
      ...(unbindType ? { unbindType } : {}),
    })
      .then((res) => {
        const tokenVal = (res?.data as { token?: string })?.token ?? '';
        setToken(tokenVal);
        setPassword('');
        setBindLoading(false);
        if (onVerifySuccess) {
          onVerifySuccess(tokenVal);
          onClose();
        } else {
          // 绑定手机流程：先判断是否有可用验证方式，无则直接进入 step2
          const list = Array.isArray(securityData?.securityBindList)
            ? securityData.securityBindList
            : [];
          const PHONE_AVAILABLE_KEYS = ['Safety_Email', 'Microsoft_Token', 'Gesture_Password'];
          const hasAvailable = list.some(
            (item: { bind?: boolean; securityKey?: string }) =>
              item.bind &&
              !!item.securityKey &&
              PHONE_AVAILABLE_KEYS.includes(item.securityKey) &&
              item.securityKey !== 'Safety_Phone',
          );
          if (hasAvailable) {
            setSecurityVerifyVisible(true);
          } else {
            setStep(2);
          }
        }
      })
      .catch(() => {
        setBindLoading(false);
        setErrors({ password: t('bindPaymentPassword.verifyFailed') });
      });
  };

  const getCode = useCallback(() => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setErrors((e) => ({ ...e, phone: t('securityPhone.phoneRequired') }));
      return;
    }
    setErrors((e) => ({ ...e, phone: '' }));
    setCodeLoading(true);
    getCodeBySMSReq({
      loginName,
      phone: trimmed,
      countryCode,
      type: BIND_PHONE_TYPE,
      token,
      ...(unbindType ? { unbindType } : {}),
    })
      .then(() => {
        toast({ type: 'success', description: t('securityPhone.codeSent') });
        setCountDown(60);
      })
      .finally(() => setCodeLoading(false));
  }, [loginName, phone, countryCode, token, t, unbindType]);

  const handleBindSubmit = useCallback(() => {
    const trimmedPhone = phone.trim();
    const trimmedCode = verifyCode.trim();
    const newErrors: Record<string, string> = {};
    if (!trimmedPhone) newErrors.phone = t('securityPhone.phoneRequired');
    if (trimmedCode.length !== 4) newErrors.verifyCode = t('securityPhone.codeRequired');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setBindLoading(true);
    bindPhoneReq({
      loginName,
      phone: trimmedPhone,
      countryCode,
      type: BIND_PHONE_TYPE,
      code: trimmedCode,
      token,
      ...(unbindType ? { unbindType } : {}),
    })
      .then(() => {
        toast({ type: 'success', description: t('securityPhone.bindSuccess') });
        onSuccess?.();
        onClose();
        navigate(PATHS.mineSecurity);
      })
      .finally(() => setBindLoading(false));
  }, [
    loginName,
    phone,
    countryCode,
    verifyCode,
    token,
    t,
    onSuccess,
    onClose,
    navigate,
    unbindType,
  ]);

  const canVerifySubmit = password.trim().length === 6 && /^\d{6}$/.test(password.trim());
  const canBindSubmit = phone.trim().length > 0 && verifyCode.trim().length === 4;

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
            title={
              step === 1
                ? (verifyTitle ?? t('verifyPaymentPassword.title'))
                : t('securityPhone.title')
            }
            subtitle={
              step === 1
                ? (verifySubtitle ?? t('verifyPaymentPassword.subtitle'))
                : t('securityPhone.subtitle')
            }
            onBack={handleBack}
            isMobile={isMobile}
            onClose={onClose}
            onCustomerClick={openCustomerService}
            customerAriaLabel={t('customerService.chooseServiceTitle')}
          />

          <div className={styles.content}>
            {step === 1 ? (
              <div className={styles.stepContent}>
                <div className={styles.inputSection}>
                  <FormInput
                    type="password"
                    placeholder={t('verifyPaymentPassword.passwordPlaceholder')}
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
                          {t('verifyPaymentPassword.forgotPaymentPassword')}
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
                  {t('verifyPaymentPassword.nextStep')}
                </Button>
              </div>
            ) : (
              <div className={styles.stepContent}>
                <div className={styles.formRow}>
                  <div className={`${styles.phoneRow} ${errors.phone ? styles.inputRowError : ''}`}>
                    <div
                      className={styles.countryCode}
                      onClick={() => setPickerVisible(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setPickerVisible(true)}
                    >
                      +{String(countryCode).replace(/^\+/, '')}
                      <ChevronDownSvg className={styles.chevronIcon} />
                    </div>
                    <input
                      type="tel"
                      className={styles.phoneInput}
                      placeholder={t('securityPhone.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={11}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
                </div>

                <div className={styles.formRow}>
                  <div
                    className={`${styles.verifyRow} ${errors.verifyCode ? styles.inputRowError : ''}`}
                  >
                    <input
                      type="text"
                      className={styles.verifyInput}
                      placeholder={t('securityPhone.verifyCodePlaceholder')}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      autoComplete="one-time-code"
                    />
                    <button
                      type="button"
                      className={`${styles.getCodeBtn} ${!phone.trim() || countDown > 0 ? styles.disabled : ''}`}
                      onClick={getCode}
                      disabled={!phone.trim() || countDown > 0 || codeLoading}
                    >
                      {countDown > 0 ? `${countDown}s` : t('securityPhone.getCode')}
                    </button>
                  </div>
                  {errors.verifyCode && <div className={styles.errorText}>{errors.verifyCode}</div>}
                </div>

                <Button
                  type="primary"
                  htmlType="button"
                  className={`${styles.submitBtn} ${canBindSubmit ? styles.submitBtnActive : styles.submitBtnInactive}`}
                  onClick={handleBindSubmit}
                  loading={bindLoading}
                  disabled={!canBindSubmit || bindLoading}
                >
                  {t('securityPhone.submit')}
                </Button>
              </div>
            )}

            {countryCodeList.length > 0 && (
              <PickerModal
                columns={pickerColumns}
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                value={[countryCode]}
                onConfirm={(val) => {
                  if (val[0] != null) setCountryCode(String(val[0]));
                }}
                title={t('securityPhone.selectCountry')}
                cancelText={t('securityPhone.pickerCancel')}
                confirmText={t('securityPhone.pickerConfirm')}
                itemLayout="split"
                formatItemValue={(item) => `+${String(item.value)}`}
              />
            )}
          </div>
        </div>
      </Overlay>
      <SecurityVerifyModal
        visible={securityVerifyVisible}
        onClose={() => setSecurityVerifyVisible(false)}
        excludeKeys={['Safety_Phone']}
        title="手机绑定"
        tip="完成任意一种验证"
        microsoftStepPageTitle="手机绑定"
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

export default VerifyPaymentPasswordModal;
