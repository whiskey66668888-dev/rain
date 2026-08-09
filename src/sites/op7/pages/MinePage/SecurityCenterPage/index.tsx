import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';

import SecurityCenterHeader from './SecurityCenterHeader';
import lottieData from './lottie.json';
import BindPaymentPasswordModal from '@/sites/op7/components/security/BindPaymentPasswordModal';
import VerifyPaymentPasswordModal from '@/sites/op7/components/security/VerifyPaymentPasswordModal';
import SecurityGestureModal from '@/sites/op7/components/security/SecurityGestureModal';
import SecurityTipModal from '@/sites/op7/components/security/SecurityTipModal';
import MicrosoftTokenBindModal from '@/sites/op7/components/security/MicrosoftTokenBindModal';
import SecurityPhoneResetModal from '@/sites/op7/components/security/SecurityPhoneResetModal';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import SecurityMicrosoftResetModal from '@/sites/op7/components/security/SecurityMicrosoftResetModal';
import SecurityEmailBindModal from '@/sites/op7/components/security/SecurityEmailBindModal';
import SecurityEmailResetModal from '@/sites/op7/components/security/SecurityEmailResetModal';
import ModifyPaymentPasswordModal from '@/sites/op7/components/security/ModifyPaymentPasswordModal';
import ModifyLoginPasswordModal from '@/sites/op7/components/security/ModifyLoginPasswordModal';
import SecurityModalHeader from '@/sites/op7/components/security/SecurityModalHeader';
import { openSecurityBackConfirm } from '@/sites/op7/components/security/openSecurityBackConfirm';
import Overlay from '@/common/components/Overlay';
import {
  notPopCurrendDayReq,
  type SecurityBindItem,
  type SecurityCenterResponse,
  useSecurityDataQuery,
} from '@/apis/origin/login';
import Modal from '@/common/components/Modal';
import { zIndexMap } from '@/utils/constants/zIndex';
import styles from './SecurityCenterPage.module.scss';
import AccountManagementModal from '@/sites/op7/components/AccountManagementModal';
import WalletChannelIcon, {
  type WalletChannelIconType,
} from '@/sites/op7/components/WalletChannelIcon';
import { ModalCustomerButton } from '@/sites/op7/components/themeIcon';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { BankAccountType } from '@/utils/constants/money';
import { CircleExclamationSvg } from '@/sites/op7/components/SvgIcons';
import { useAppSelector } from '@/core/store/hooks';

const modifyPaymentConfirmTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
};
const modifyPaymentConfirmTextStyle: React.CSSProperties = {
  color: 'var(--Text-Main-10, #1F2634)',
  textAlign: 'center',
  fontFamily: '"PingFang SC", sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '24px',
};
const modifyPaymentConfirmContentStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--Text-Main-10, #1F2634)',
  textAlign: 'center',
  fontFamily: '"PingFang SC", sans-serif',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '20px',
};

interface SecurityEntry {
  key: string;
  title: string;
  actionText: string;
  bind: boolean;
  icon: string;
  onClick: () => void;
}

interface AccountBindEntry {
  key: string;
  title: string;
  number: number;
  max: number;
  accountBindType: string;
}

type BindFlowTarget = 'microsoft' | 'email' | 'phone';

const securityIconMap: Record<string, string> = {
  Microsoft_Token: '/images/common/safeCenter/lingpai.svg',
  Safety_Email: '/images/common/safeCenter/email.svg',
  Safety_Phone: '/images/common/safeCenter/phone_method.svg',
  Pay_Password: '/images/common/safeCenter/paypassword.svg',
  Login_Password: '/images/common/safeCenter/paypassword.svg',
  Gesture_Password: '/images/common/safeCenter/gesture_success.svg',
};

const getSecurityIcon = (securityKey?: string) =>
  securityKey
    ? (securityIconMap[securityKey] ?? '/images/common/safeCenter/securityTools.svg')
    : '';

const wrapSafety = (text: string, highlightToken: string, className?: string) => {
  if (!highlightToken) return text;
  const parts = text.split(highlightToken);
  return parts.flatMap((part, i) =>
    i < parts.length - 1
      ? [
          part,
          <span key={i} className={className}>
            {highlightToken}
          </span>,
        ]
      : [part],
  );
};

const ProgressRing: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  fillColor?: string;
}> = ({
  percent,
  size = 54,
  strokeWidth = 5,
  trackColor = 'rgba(255,255,255,0.25)',
  fillColor = 'var(--ThemeColor-Main)',
}) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const gradientId = 'security-progress-gradient';
  const useGradient = fillColor === 'var(--ThemeColor-Main)' || fillColor.includes('theme-main');
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={0}
          y1={0}
          x2={size}
          y2={size}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5cadff" />
          <stop offset="100%" stopColor="#1a81ff" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r - strokeWidth / 2} fill="transparent" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={useGradient ? `url(#${gradientId})` : fillColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

const SecurityCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [showSecurityTipModal, setShowSecurityTipModal] = useState(false);
  /** 安全提示弹窗用途：支付密码 / 动态验证 */
  const [securityTipMode, setSecurityTipMode] = useState<'payment' | 'dynamicVerify' | null>(null);
  const [showPaymentPasswordModal, setShowPaymentPasswordModal] = useState(false);
  const [paymentPasswordModalMode, setPaymentPasswordModalMode] = useState<'set' | 'forgot'>('set');
  const [showVerifyPaymentModal, setShowVerifyPaymentModal] = useState(false);
  /** 支付密码验证用途：securityPhone 进入 step2 手机绑定，microsoft 验证通过后打开微软令牌绑定 */
  const [verifyPurpose, setVerifyPurpose] = useState<'securityPhone' | 'microsoft'>(
    'securityPhone',
  );
  const [gestureVisible, setGestureVisible] = useState(false);
  const [showMicrosoftTokenModal, setShowMicrosoftTokenModal] = useState(false);
  /** 支付密码验证通过后，先完成任意一种动态验证再进入绑定流程 */
  const [showMicrosoftDynamicVerifyModal, setShowMicrosoftDynamicVerifyModal] = useState(false);
  /** 支付密码验证返回的 token */
  const [microsoftBindToken, setMicrosoftBindToken] = useState<string | null>(null);
  /** 完成任意一种验证（邮箱/手机）返回的 token， 传给 bindAuthKey */
  const [microsoftDynamicVerifyToken, setMicrosoftDynamicVerifyToken] = useState<string | null>(
    null,
  );
  /** 最后一种动态认证解绑后，强制进入“绑定动态验证码”页内态 */
  /** 后端返回的 unbindType，后续绑定流程需继续透传 */
  const [forceBindDynamicVisible, setForceBindDynamicVisible] = useState(false);
  const [pendingUnbindType, setPendingUnbindType] = useState<string | null>(null);
  const [showPhoneResetModal, setShowPhoneResetModal] = useState(false);
  const [showMicrosoftResetModal, setShowMicrosoftResetModal] = useState(false);
  const [showEmailBindModal, setShowEmailBindModal] = useState(false);
  const [showEmailResetModal, setShowEmailResetModal] = useState(false);
  const [showModifyPaymentPasswordModal, setShowModifyPaymentPasswordModal] = useState(false);
  const [showModifyLoginPasswordModal, setShowModifyLoginPasswordModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [accountManagementModalShowType, setAccountManagementModalShowType] =
    useState<BankAccountType | null>(null);
  const microsoftFromGestureRef = useRef(false);
  const verifySuccessRef = useRef(false);
  /** 忘记支付密码弹窗由「验证支付密码」打开，返回时需重新展示验证弹窗 */
  const paymentFromVerifyRef = useRef(false);
  /** 支付密码弹窗由「安全提示->前往」打开（含底部弹窗、安全手机号、账户管理等入口），返回时需展示底部弹窗 */
  const [paymentFromSecurityTip, setPaymentFromSecurityTip] = useState(false);
  const initialRecommendHandledRef = useRef(false);
  const highlightToken = t('securityCenter.highlightToken');
  const openCustomerService = useOpenCustomerService();
  const { data: securityQueryData, refetch: refetchSecurityData } = useSecurityDataQuery();
  const securityData = useMemo<SecurityCenterResponse | null>(
    () => securityQueryData ?? null,
    [securityQueryData],
  );

  const forceBindHeaderRight = useMemo(
    () =>
      forceBindDynamicVisible ? (
        <ModalCustomerButton
          onClick={openCustomerService}
          ariaLabel={t('securityVerify.contactService')}
        />
      ) : undefined,
    [forceBindDynamicVisible, openCustomerService, t],
  );

  // 从 securityBindList 判断支付密码是否已开启
  const hasCashPassword = useCallback((data: typeof securityData) => {
    return (
      data?.haveCashPass === true ||
      (Array.isArray(data?.securityBindList) &&
        data.securityBindList.some(
          (item: { securityKey?: string; bind?: boolean }) =>
            item.securityKey === 'Pay_Password' && item.bind === true,
        ))
    );
  }, []);

  // 从 securityBindList 判断安全手机号是否已绑定
  const hasSafetyPhone = useCallback(
    (data: typeof securityData) =>
      !!data?.phone ||
      (Array.isArray(data?.securityBindList) &&
        data.securityBindList.some(
          (item: { securityKey?: string; bind?: boolean }) =>
            item.securityKey === 'Safety_Phone' && item.bind === true,
        )),
    [],
  );

  // 从 securityBindList 判断微软安全令牌是否已绑定
  const hasMicrosoftToken = useCallback(
    (data: typeof securityData) =>
      Array.isArray(data?.securityBindList) &&
      data.securityBindList.some(
        (item: { securityKey?: string; bind?: boolean }) =>
          item.securityKey === 'Microsoft_Token' && item.bind === true,
      ),
    [],
  );

  // 从 securityBindList 判断安全邮箱是否已绑定
  const hasSafetyEmail = useCallback(
    (data: typeof securityData) =>
      !!data?.email ||
      (Array.isArray(data?.securityBindList) &&
        data.securityBindList.some(
          (item: { securityKey?: string; bind?: boolean }) =>
            item.securityKey === 'Safety_Email' && item.bind === true,
        )),
    [],
  );

  const hasAnyDynamicVerification = useCallback(
    (data: typeof securityData) =>
      hasSafetyPhone(data) || hasSafetyEmail(data) || hasMicrosoftToken(data),
    [hasSafetyPhone, hasSafetyEmail, hasMicrosoftToken],
  );

  const recommendBindItem = useMemo(() => {
    const list = securityData?.securityBindList ?? [];
    return (
      list.find((item: SecurityBindItem) => (item as { recommendBind?: boolean }).recommendBind) ??
      null
    );
  }, [securityData]);

  const popInfo = useMemo(() => {
    if (!recommendBindItem) return null;
    return (
      (
        recommendBindItem as {
          popInfo?: { popTitle?: string; openBeforeMsg?: string; openAfterMsg?: string };
        }
      ).popInfo ?? null
    );
  }, [recommendBindItem]);

  useEffect(() => {
    if (initialRecommendHandledRef.current || securityQueryData === undefined) return;
    initialRecommendHandledRef.current = true;
    if (recommendBindItem && !recommendBindItem.bind && popInfo) {
      setGestureVisible(true);
    }
  }, [securityQueryData, recommendBindItem, popInfo]);

  const handleOpenPhoneFlow = useCallback(() => {
    if (!hasCashPassword(securityData)) {
      setShowSecurityTipModal(true);
      return;
    }
    setVerifyPurpose('securityPhone');
    setShowVerifyPaymentModal(true);
  }, [securityData, hasCashPassword]);

  const handleOpenEmailFlow = useCallback(() => {
    if (!hasCashPassword(securityData)) {
      setShowSecurityTipModal(true);
      return;
    }
    setShowEmailBindModal(true);
  }, [securityData, hasCashPassword]);

  const startBindFlow = useCallback(
    (
      target: BindFlowTarget,
      options?: {
        fromGesture?: boolean;
        unbindType?: string | null;
      },
    ) => {
      const nextUnbindType = options?.unbindType?.trim() ? options.unbindType.trim() : null;
      setPendingUnbindType(nextUnbindType);
      if (target === 'phone') {
        handleOpenPhoneFlow();
        return;
      }
      if (target === 'email') {
        handleOpenEmailFlow();
        return;
      }
      microsoftFromGestureRef.current = options?.fromGesture === true;
      setVerifyPurpose('microsoft');
      setShowVerifyPaymentModal(true);
    },
    [handleOpenEmailFlow, handleOpenPhoneFlow],
  );

  const handleSecurityPhoneClick = useCallback(() => {
    if (hasSafetyPhone(securityData)) {
      setShowPhoneResetModal(true);
      return;
    }
    startBindFlow('phone');
  }, [securityData, hasSafetyPhone, startBindFlow]);

  const handleSecurityEmailClick = useCallback(() => {
    if (hasSafetyEmail(securityData)) {
      setShowEmailResetModal(true);
      return;
    }
    startBindFlow('email');
  }, [securityData, hasSafetyEmail, startBindFlow]);

  const handlePaymentClick = useCallback(() => {
    if (!hasCashPassword(securityData)) {
      setPaymentPasswordModalMode('set');
      setPaymentFromSecurityTip(false);
      setShowPaymentPasswordModal(true);
      return;
    }
    Modal.open({
      title: (
        <div style={modifyPaymentConfirmTitleStyle}>
          <img
            src="/images/common/login/safe-tip.svg"
            alt=""
            style={{ width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={modifyPaymentConfirmTextStyle}>安全提示</span>
        </div>
      ),
      content: <p style={modifyPaymentConfirmContentStyle}>确认需要修改支付密码吗?</p>,
      showCloseButton: true,
      confirmText: '确定',
      zIndex: zIndexMap.loginModal + 1,
      onConfirm: () => {
        setShowModifyPaymentPasswordModal(true);
        return Promise.resolve();
      },
    });
  }, [securityData, hasCashPassword]);

  const handleMicrosoftTokenClick = useCallback(() => {
    if (!hasCashPassword(securityData)) {
      setShowSecurityTipModal(true);
      return;
    }
    if (hasMicrosoftToken(securityData)) {
      setShowMicrosoftResetModal(true);
      return;
    }
    startBindFlow('microsoft');
  }, [securityData, hasCashPassword, hasMicrosoftToken, startBindFlow]);

  const handleMicrosoftVerifySuccess = useCallback(
    (token?: string) => {
      verifySuccessRef.current = true;
      setMicrosoftBindToken(token ?? null);
      setShowVerifyPaymentModal(false);
      const list = Array.isArray(securityData?.securityBindList)
        ? securityData.securityBindList
        : [];
      const excludeSet = new Set(['Microsoft_Token']);
      const MICROSOFT_AVAILABLE_KEYS = ['Safety_Phone', 'Safety_Email', 'Gesture_Password'];
      const hasAvailable = list.some(
        (item: SecurityBindItem) =>
          item.bind &&
          !!item.securityKey &&
          MICROSOFT_AVAILABLE_KEYS.includes(item.securityKey) &&
          !excludeSet.has(item.securityKey),
      );
      if (hasAvailable) {
        setShowMicrosoftDynamicVerifyModal(true);
      } else {
        setShowMicrosoftTokenModal(true);
      }
    },
    [securityData],
  );

  const handleMicrosoftDynamicVerifySuccess = useCallback(
    (_securityKey?: string, token?: string) => {
      setMicrosoftDynamicVerifyToken(token ?? null);
      setShowMicrosoftDynamicVerifyModal(false);
      setShowMicrosoftTokenModal(true);
    },
    [],
  );

  const refreshSecurityData = useCallback(() => {
    void refetchSecurityData();
  }, [refetchSecurityData]);

  const clearForceBindState = useCallback(() => {
    setForceBindDynamicVisible(false);
    setPendingUnbindType(null);
  }, []);

  const handleForceBindBack = useCallback(() => {
    openSecurityBackConfirm({
      title: t('securityCenter.dynamicBind.backConfirmTitle'),
      content: t('securityCenter.dynamicBind.backConfirmContent'),
      cancelText: t('securityCenter.dynamicBind.backConfirmCancel'),
      confirmText: t('securityCenter.dynamicBind.backConfirmConfirm'),
      onConfirm: clearForceBindState,
    });
  }, [clearForceBindState, t]);

  const handleVerifyPaymentModalClose = useCallback(() => {
    if (verifySuccessRef.current) {
      verifySuccessRef.current = false;
    } else if (verifyPurpose === 'microsoft' && microsoftFromGestureRef.current) {
      setGestureVisible(true);
    }
    setShowVerifyPaymentModal(false);
    if (!forceBindDynamicVisible) clearForceBindState();
  }, [verifyPurpose, forceBindDynamicVisible, clearForceBindState]);

  const handleForgotPaymentPassword = useCallback(() => {
    paymentFromVerifyRef.current = true;
    setShowVerifyPaymentModal(false);
    setPaymentPasswordModalMode('forgot');
    setShowPaymentPasswordModal(true);
  }, []);

  const handleRequireDynamicRebind = useCallback(
    (unbindType: string) => {
      const nextUnbindType = unbindType.trim();
      if (!nextUnbindType) return;
      setPendingUnbindType(nextUnbindType);
      setForceBindDynamicVisible(true);
      setShowPhoneResetModal(false);
      setShowEmailResetModal(false);
      setShowMicrosoftResetModal(false);
      setShowMicrosoftDynamicVerifyModal(false);
      setShowMicrosoftTokenModal(false);
      setMicrosoftBindToken(null);
      setMicrosoftDynamicVerifyToken(null);
      refreshSecurityData();
    },
    [refreshSecurityData],
  );

  const handleSecurityTipClose = useCallback(() => {
    setShowSecurityTipModal(false);
    setSecurityTipMode(null);
    setGestureVisible(false);
  }, []);

  const handleSecurityTipGo = useCallback(() => {
    setShowSecurityTipModal(false);
    setSecurityTipMode(null);
    setGestureVisible(false);
    setPaymentPasswordModalMode('set');
    setShowPaymentPasswordModal(true);
    setPaymentFromSecurityTip(true);
  }, []);

  const handleSecurityVerifyTipGo = useCallback(() => {
    setShowSecurityTipModal(false);
    setSecurityTipMode(null);
    setShowOptimizationModal(true);
  }, []);

  const handleRequestSecurityTip = useCallback(() => {
    setSecurityTipMode('payment');
    setShowSecurityTipModal(true);
  }, []);

  const handleRecommendItemClick = useCallback(
    (item: SecurityBindItem) => {
      const key = item.securityKey ?? '';
      const needSecurityTip = !hasCashPassword(securityData);

      if (key === 'Pay_Password') {
        if (needSecurityTip) {
          // 由 SecurityGestureModal 内嵌安全提示弹窗处理，不调用 onGo
          return;
        } else {
          setGestureVisible(false);
          setPaymentPasswordModalMode('set');
          setShowPaymentPasswordModal(true);
        }
      } else if (key === 'Safety_Phone') {
        if (needSecurityTip) {
          return;
        } else {
          setGestureVisible(false);
          startBindFlow('phone');
        }
      } else if (key === 'Safety_Email') {
        if (needSecurityTip) {
          return;
        } else {
          setGestureVisible(false);
          startBindFlow('email');
        }
      } else {
        if (needSecurityTip) {
          return;
        } else {
          setGestureVisible(false);
          if (key === 'Microsoft_Token') {
            if (hasMicrosoftToken(securityData)) {
              setShowMicrosoftResetModal(true);
            } else {
              startBindFlow('microsoft', { fromGesture: true });
            }
          }
        }
      }
    },
    [securityData, hasCashPassword, hasMicrosoftToken, startBindFlow],
  );

  const handleOptimizationItemClick = useCallback(
    (item: SecurityBindItem) => {
      const key = item.securityKey ?? '';
      setShowOptimizationModal(false);

      if (key === 'Pay_Password') {
        setPaymentPasswordModalMode('set');
        setPaymentFromSecurityTip(false);
        setShowPaymentPasswordModal(true);
        return;
      }
      if (key === 'Safety_Phone') {
        startBindFlow('phone');
        return;
      }
      if (key === 'Safety_Email') {
        startBindFlow('email');
        return;
      }
      if (key === 'Microsoft_Token') {
        if (!hasCashPassword(securityData)) {
          setShowSecurityTipModal(true);
          return;
        }
        startBindFlow('microsoft');
        return;
      }
      if (key === 'Login_Password') {
        setShowModifyLoginPasswordModal(true);
        return;
      }
      if (!hasCashPassword(securityData)) {
        setShowSecurityTipModal(true);
      }
    },
    [securityData, hasCashPassword, startBindFlow],
  );

  const handleGestureNotToday = useCallback(
    (securityId?: string | number) => {
      if (securityId != null) {
        notPopCurrendDayReq({ securityId })
          .then(() => refreshSecurityData())
          .catch(() => {});
      }
    },
    [refreshSecurityData],
  );

  const phoneBound = hasSafetyPhone(securityData);
  const emailBound = hasSafetyEmail(securityData);
  const paymentBound = hasCashPassword(securityData);
  const microsoftBound = hasMicrosoftToken(securityData);

  const entries: SecurityEntry[] = [
    {
      key: 'microsoft',
      title: t('securityCenter.entries.microsoft'),
      actionText: microsoftBound
        ? t('securityCenter.actions.done')
        : t('securityCenter.actions.go'),
      bind: microsoftBound,
      icon: '/images/common/safeCenter/lingpai.svg',
      onClick: handleMicrosoftTokenClick,
    },
    {
      key: 'email',
      title: t('securityCenter.entries.email'),
      actionText: emailBound ? t('securityCenter.actions.done') : t('securityCenter.actions.go'),
      bind: emailBound,
      icon: '/images/common/safeCenter/email.svg',
      onClick: handleSecurityEmailClick,
    },
    {
      key: 'phone',
      title: t('securityCenter.entries.phone'),
      actionText: phoneBound ? t('securityCenter.actions.done') : t('securityCenter.actions.go'),
      bind: phoneBound,
      icon: '/images/common/safeCenter/phone_method.svg',
      onClick: handleSecurityPhoneClick,
    },
    {
      key: 'payment',
      title: t('securityCenter.entries.payment'),
      actionText: paymentBound ? t('securityCenter.actions.done') : t('securityCenter.actions.go'),
      bind: paymentBound,
      icon: '/images/common/safeCenter/paypassword.svg',
      onClick: handlePaymentClick,
    },
    {
      key: 'login',
      title: t('securityCenter.entries.login'),
      actionText: t('securityCenter.actions.done'),
      bind: true,
      icon: '/images/common/safeCenter/paypassword.svg',
      onClick: () => setShowModifyLoginPasswordModal(true),
    },
  ];

  const forceBindEntries: SecurityEntry[] = [
    {
      key: 'force-microsoft',
      title: t('securityCenter.entries.microsoft'),
      actionText: t('securityCenter.actions.goShort'),
      bind: false,
      icon: '/images/common/safeCenter/lingpai.svg',
      onClick: () => startBindFlow('microsoft', { unbindType: pendingUnbindType }),
    },
    {
      key: 'force-email',
      title: t('securityCenter.entries.email'),
      actionText: t('securityCenter.actions.goShort'),
      bind: false,
      icon: '/images/common/safeCenter/email.svg',
      onClick: () => startBindFlow('email', { unbindType: pendingUnbindType }),
    },
    {
      key: 'force-phone',
      title: t('securityCenter.entries.phone'),
      actionText: t('securityCenter.actions.goShort'),
      bind: false,
      icon: '/images/common/safeCenter/phone_method.svg',
      onClick: () => startBindFlow('phone', { unbindType: pendingUnbindType }),
    },
  ];

  const handleAccountItemClick = useCallback(
    (item: AccountBindEntry) => {
      if (!hasCashPassword(securityData)) {
        setSecurityTipMode('payment');
        setShowSecurityTipModal(true);
        return;
      }
      if (!hasAnyDynamicVerification(securityData)) {
        setSecurityTipMode('dynamicVerify');
        setShowSecurityTipModal(true);
        return;
      }
      if (item.accountBindType === 'BANK_ACCOUNT_BIND') {
        setAccountManagementModalShowType(BankAccountType.BANK_ACCOUNT);
      } else if (item.accountBindType === 'ZFB_ACCOUNT_BIND') {
        setAccountManagementModalShowType(BankAccountType.ZFB_ACCOUNT);
      } else if (item.accountBindType === 'DIGITAL_ACCOUNT_BIND') {
        setAccountManagementModalShowType(BankAccountType.DIGITAL_ACCOUNT);
      } else if (item.accountBindType === 'VIRTUAL_ACCOUNT_BIND') {
        setAccountManagementModalShowType(BankAccountType.VIRTUAL_ACCOUNT);
      }
    },
    [securityData, hasCashPassword, hasAnyDynamicVerification],
  );

  const accountBindList: AccountBindEntry[] = [
    {
      key: 'bank',
      title: t('securityCenter.accounts.bank'),
      number: 0,
      max: 1,
      accountBindType: 'BANK_ACCOUNT_BIND',
    },
    {
      key: 'virtual',
      title: t('securityCenter.accounts.virtual'),
      number: 0,
      max: 1,
      accountBindType: 'VIRTUAL_ACCOUNT_BIND',
    },
    {
      key: 'digital',
      title: t('securityCenter.accounts.digital'),
      number: 0,
      max: 1,
      accountBindType: 'DIGITAL_ACCOUNT_BIND',
    },
    {
      key: 'zfb',
      title: t('securityCenter.accounts.zfb'),
      number: 0,
      max: 1,
      accountBindType: 'ZFB_ACCOUNT_BIND',
    },
  ];

  const accountBindIconMap: Record<string, WalletChannelIconType> = {
    BANK_ACCOUNT_BIND: 'bank',
    VIRTUAL_ACCOUNT_BIND: 'virtual',
    DIGITAL_ACCOUNT_BIND: 'digital',
    ZFB_ACCOUNT_BIND: 'zfb',
  };

  const boundCount = entries.filter((e) => e.bind).length;
  const totalCount = entries.length;
  const percent = totalCount > 0 ? Math.round((boundCount / totalCount) * 100) : 0;
  const isWellDown = boundCount === totalCount;
  const optimizationCount = totalCount - boundCount;
  const optimizationItems = (securityData?.securityBindList ?? []).filter(
    (item) => item.bind !== true,
  );

  const getProgressColor = () => {
    if (percent === 0) return 'var(--Red-400)';
    if (percent === 100) return 'var(--Green-300)';
    return 'var(--ThemeColor-Main)';
  };

  // if (securityData === null) {
  //   return (
  //     <>
  //       <SecurityCenterHeader />
  //       <SecurityCenterSkeleton />
  //     </>
  //   );
  // }

  return (
    <>
      <SecurityCenterHeader
        title={forceBindDynamicVisible ? t('securityCenter.dynamicBind.title') : undefined}
        onBack={forceBindDynamicVisible ? handleForceBindBack : undefined}
        variant={forceBindDynamicVisible ? 'subPage' : 'default'}
        headerRight={forceBindHeaderRight}
      />
      <div className={styles.safeCenterPage}>
        {/* 必须绑定一种安全校验 */}
        {forceBindDynamicVisible && (
          <>
            <div className={styles.dynamicBindOverlay}>
              <div className={styles.dynamicBindStage}>
                <div className={styles.dynamicBindPage}>
                  <div className={styles.dynamicBindModalHeader}>
                    <SecurityModalHeader
                      title={t('securityCenter.dynamicBind.title')}
                      onBack={handleForceBindBack}
                      isMobile={false}
                      onClose={handleForceBindBack}
                      onCustomerClick={openCustomerService}
                      showCustomerOnDesktop
                      customerAriaLabel={t('securityVerify.contactService')}
                      backAriaLabel={t('securityCenter.back')}
                    />
                  </div>
                  <div className={styles.dynamicBindTipStrip}>
                    <span className={styles.dynamicBindTipIcon} aria-hidden>
                      <CircleExclamationSvg />
                    </span>
                    <span>{t('securityCenter.dynamicBind.selectMethod')}</span>
                  </div>
                  <div className={styles.dynamicBindList}>
                    {forceBindEntries.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={styles.dynamicBindItem}
                        onClick={item.onClick}
                      >
                        <div className={styles.dynamicBindItemLeft}>
                          <img src={item.icon} alt="" className={styles.dynamicBindItemIcon} />
                          <span
                            className={
                              // index === 0
                              //   ? styles.dynamicBindItemTitleStrong :
                              styles.dynamicBindItemTitle
                            }
                          >
                            {item.title}
                          </span>
                        </div>
                        <span className={styles.dynamicBindItemChevron} aria-hidden>
                          <svg width="5" height="7" viewBox="0 0 6 8" fill="none">
                            <path
                              d="M1 1L5 4L1 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className={styles.dynamicBindNote}>
                    <span className={styles.dynamicBindNoteTitle}>
                      {t('securityCenter.dynamicBind.noticeLabel')}
                    </span>
                    <div className={styles.dynamicBindNoteBody}>
                      {t('securityCenter.dynamicBind.tip')}
                    </div>
                  </div>
                </div>
                <div className={`${styles.safeFooter} ${styles.dynamicBindFooter}`}>
                  <span className={styles.safetyHighlightWrap}>
                    {wrapSafety(
                      t('securityCenter.footerProtection'),
                      highlightToken,
                      styles.safetyHighlight,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        <>
          <div className={styles.animateBox}>
            <div className={styles.boxLeft}>
              <div className={styles.black}>
                {wrapSafety(
                  securityData === null
                    ? t('securityCenter.checkingIn')
                    : t('securityCenter.realtimeProtection'),
                  highlightToken,
                  styles.safetyHighlight,
                )}
              </div>
              {isWellDown ? (
                <div className={styles.wellDown}>
                  {[t('securityCenter.wellDown1'), t('securityCenter.wellDown2')].map(
                    (item, index) => (
                      <div className={styles.wellDownItem} key={index}>
                        <img
                          src="/images/common/login/safe-tip.svg"
                          alt=""
                          className={styles.wellDownIcon}
                        />
                        {wrapSafety(item, highlightToken, styles.safetyHighlight)}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className={styles.remaining}>
                  <img
                    src="/images/common/safeCenter/leftIcon.svg"
                    alt=""
                    className={styles.remainingIcon}
                  />
                  <button
                    type="button"
                    className={styles.blue}
                    onClick={() => {
                      if (optimizationCount > 0) {
                        setShowOptimizationModal(true);
                      }
                    }}
                  >
                    {securityData !== null
                      ? t('securityCenter.optimizationHint', { count: optimizationCount })
                      : '\u00A0'}
                  </button>
                  <img
                    src="/images/common/safeCenter/rightIcon.svg"
                    alt=""
                    className={styles.remainingIcon}
                  />
                </div>
              )}
            </div>
            <div className={styles.boxRight}>
              <div className={styles.lottie}>
                {securityData === null ? (
                  <Lottie
                    animationData={lottieData}
                    loop={false}
                    autoplay={true}
                    style={{ width: '83px', height: '83px' }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                  />
                ) : (
                  <img
                    src="/images/common/safeCenter/ic_safe_logo_normal.png.webp"
                    alt=""
                    className={styles.safetyShield}
                  />
                )}
              </div>
              {/* <img
                  src="/images/common/safeCenter/safetyShield.png"
                  alt=""
                  className={styles.safetyShield}
                /> */}
            </div>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressLeft}>
              {!isWellDown ? (
                <>
                  <div className={styles.progressWarn}>
                    <img
                      src="/images/common/login/nav_tip.png"
                      alt=""
                      className={styles.warnIcon}
                    />
                    <span className={styles.safetyHighlightWrap}>
                      {wrapSafety(
                        t('securityCenter.accountRisk'),
                        highlightToken,
                        styles.safetyHighlight,
                      )}
                    </span>
                  </div>
                  <div className={styles.progressTips}>
                    {wrapSafety(
                      t('securityCenter.recommendationTip'),
                      highlightToken,
                      styles.safetyHighlight,
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.wellDownText}>
                  {wrapSafety(
                    t('securityCenter.itemsProtected', { count: totalCount }),
                    highlightToken,
                    styles.safetyHighlight,
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.progressRight}
              onClick={() => {
                if (optimizationCount > 0) {
                  setShowOptimizationModal(true);
                }
              }}
              aria-label={t('securityCenter.optimizationHint', { count: optimizationCount })}
            >
              <ProgressRing
                percent={percent}
                size={46}
                strokeWidth={4}
                trackColor="var(--ThemeColor-15)"
                fillColor={getProgressColor()}
              />
              <div
                className={`${styles.progressText} ${isWellDown ? styles.wellDown : ''} ${percent === 0 ? styles.zero : ''}`}
              >
                <span className={styles.progressValue}>{boundCount}</span>/
                <span className={styles.progressTotal}>{totalCount}</span>
              </div>
            </button>
          </div>

          <div className={styles.safeContent}>
            <div className={styles.safeBlock}>
              <div className={styles.safeBlockTitle}>
                <img src="/images/common/safeCenter/securityTools.svg" alt="" />
                <span className={styles.safetyHighlightWrap}>
                  {wrapSafety(
                    t('securityCenter.securityTools'),
                    highlightToken,
                    styles.safetyHighlight,
                  )}
                </span>
              </div>
              {/* 安全工具 */}
              <div className={styles.safeBlockList}>
                {entries.map((item) => (
                  <div key={item.key} className={styles.safeBlockItem} onClick={item.onClick}>
                    <div className={styles.safeBlockItemLeft}>
                      <div className={styles.blockItemTitle}>
                        {wrapSafety(item.title, highlightToken, styles.safetyHighlight)}
                      </div>
                      <div
                        className={`${styles.blockItemStatus} ${item.bind ? styles.binded : ''}`}
                      >
                        {item.actionText}
                        {!item.bind && (
                          <svg
                            className={styles.triIcon}
                            width="5"
                            height="7"
                            viewBox="0 0 6 8"
                            fill="none"
                          >
                            <path
                              d="M1 1L5 4L1 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className={styles.safeBlockItemRight}>
                      <img src={item.icon} alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.dived} />
            <div className={styles.safeBlock}>
              {/* 账户管理 */}
              <div className={styles.safeBlockTitle}>
                <img src="/images/common/safeCenter/accountManger.svg" alt="" />
                {t('securityCenter.accountManagement')}
              </div>
              <div className={styles.safeBlockList}>
                {accountBindList.map((item) => {
                  const securityAccount = securityData?.accountBindList?.find(
                    (obj) => obj.accountBindType === item.accountBindType,
                  );

                  const number = securityAccount?.number ?? item.number;
                  const max = securityAccount?.max ?? item.max;
                  return (
                    <div
                      key={item.key}
                      className={styles.safeBlockItem}
                      onClick={() => handleAccountItemClick(item)}
                    >
                      <div className={styles.safeBlockItemLeft}>
                        <div className={styles.blockItemTitle}>
                          {item.title}({number}/{max})
                        </div>
                        <div
                          className={`${styles.blockItemStatus} ${number > 0 ? styles.binded : ''}`}
                        >
                          {number > 0
                            ? t('securityCenter.actions.bound')
                            : t('securityCenter.actions.bind')}
                          <svg
                            className={styles.triIcon}
                            width="5"
                            height="7"
                            viewBox="0 0 6 8"
                            fill="none"
                          >
                            <path
                              d="M1 1L5 4L1 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className={styles.safeBlockItemRight}>
                        <WalletChannelIcon
                          type={accountBindIconMap[item.accountBindType] ?? 'bank'}
                          color="var(--ThemeColor-Main)"
                          size={24}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.safeFooter}>
            <span className={styles.safetyHighlightWrap}>
              {wrapSafety(
                t('securityCenter.footerProtection'),
                highlightToken,
                styles.safetyHighlight,
              )}
            </span>
          </div>
        </>

        <SecurityTipModal
          show={showSecurityTipModal}
          content={
            securityTipMode === 'dynamicVerify'
              ? t('securityCenter.accountManagementVerifyTip')
              : undefined
          }
          cancelText={
            securityTipMode === 'dynamicVerify'
              ? t('securityCenter.dynamicBind.backConfirmCancel')
              : undefined
          }
          onClose={handleSecurityTipClose}
          onGo={
            securityTipMode === 'dynamicVerify' ? handleSecurityVerifyTipGo : handleSecurityTipGo
          }
        />

        <BindPaymentPasswordModal
          show={showPaymentPasswordModal}
          onClose={() => {
            if (paymentFromVerifyRef.current) {
              paymentFromVerifyRef.current = false;
              setShowVerifyPaymentModal(true);
            } else if (paymentFromSecurityTip) {
              setGestureVisible(true);
              setPaymentFromSecurityTip(false);
            }
            setShowPaymentPasswordModal(false);
          }}
          onSuccess={() => {
            setPaymentFromSecurityTip(false);
            refreshSecurityData();
          }}
          mode={paymentPasswordModalMode}
          securityData={securityData ?? undefined}
        />
        <AccountManagementModal
          handleClose={() => {
            setAccountManagementModalShowType(null);
            // 刷新数据
            refreshSecurityData();
          }}
          showType={accountManagementModalShowType}
          onForgotPaymentPassword={() => {
            setAccountManagementModalShowType(null);
            setPaymentPasswordModalMode('forgot');
            setShowPaymentPasswordModal(true);
          }}
        />

        <VerifyPaymentPasswordModal
          show={showVerifyPaymentModal}
          onClose={handleVerifyPaymentModalClose}
          onSuccess={
            verifyPurpose === 'securityPhone'
              ? () => {
                  clearForceBindState();
                  refreshSecurityData();
                }
              : undefined
          }
          onVerifySuccess={verifyPurpose === 'microsoft' ? handleMicrosoftVerifySuccess : undefined}
          unbindType={pendingUnbindType ?? undefined}
          verifyType={verifyPurpose === 'microsoft' ? 10 : undefined}
          verifyTitle={
            verifyPurpose === 'microsoft' ? t('verifyPaymentPassword.microsoftTitle') : undefined
          }
          verifySubtitle={
            verifyPurpose === 'microsoft' ? t('verifyPaymentPassword.microsoftSubtitle') : undefined
          }
          hasPaymentPassword={hasCashPassword(securityData)}
          onForgotPassword={handleForgotPaymentPassword}
          securityData={securityData}
        />

        <SecurityVerifyModal
          visible={showMicrosoftDynamicVerifyModal}
          title={t('microsoftToken.title')}
          microsoftStepPageTitle={t('microsoftToken.title')}
          tip={t('securityVerify.stripTip')}
          excludeKeys={['Microsoft_Token']}
          mainSubtitle=""
          emailStepEditable
          microsoftVerifyType={10}
          unbindType={pendingUnbindType ?? undefined}
          onClose={() => {
            setShowMicrosoftDynamicVerifyModal(false);
            if (!forceBindDynamicVisible) clearForceBindState();
          }}
          onVerifySuccess={handleMicrosoftDynamicVerifySuccess}
          onNoAvailableChannels={() => {
            setShowMicrosoftDynamicVerifyModal(false);
            setShowMicrosoftTokenModal(true);
          }}
          securityData={securityData}
        />

        <MicrosoftTokenBindModal
          show={showMicrosoftTokenModal}
          verifyToken={microsoftDynamicVerifyToken ?? microsoftBindToken ?? undefined}
          unbindType={pendingUnbindType ?? undefined}
          onClose={() => {
            setMicrosoftBindToken(null);
            setMicrosoftDynamicVerifyToken(null);
            if (microsoftFromGestureRef.current) {
              setGestureVisible(true);
              microsoftFromGestureRef.current = false;
            }
            setShowMicrosoftTokenModal(false);
            if (!forceBindDynamicVisible) clearForceBindState();
          }}
          onSuccess={() => {
            microsoftFromGestureRef.current = false;
            clearForceBindState();
            refreshSecurityData();
          }}
        />

        <SecurityPhoneResetModal
          visible={showPhoneResetModal}
          onClose={() => setShowPhoneResetModal(false)}
          onSuccess={refreshSecurityData}
          onRequireRebind={handleRequireDynamicRebind}
          securityData={securityData}
        />

        <SecurityMicrosoftResetModal
          visible={showMicrosoftResetModal}
          onClose={() => setShowMicrosoftResetModal(false)}
          onSuccess={refreshSecurityData}
          onRequireRebind={handleRequireDynamicRebind}
          securityData={securityData}
        />

        <SecurityEmailBindModal
          show={showEmailBindModal}
          unbindType={pendingUnbindType ?? undefined}
          onClose={() => {
            setShowEmailBindModal(false);
            if (!forceBindDynamicVisible) clearForceBindState();
          }}
          onSuccess={() => {
            clearForceBindState();
            refreshSecurityData();
          }}
          hasPaymentPassword={hasCashPassword(securityData)}
          securityData={securityData}
          onForgotPassword={() => {
            setShowEmailBindModal(false);
            setPaymentPasswordModalMode('forgot');
            setShowPaymentPasswordModal(true);
          }}
        />

        <SecurityEmailResetModal
          visible={showEmailResetModal}
          onClose={() => setShowEmailResetModal(false)}
          onSuccess={refreshSecurityData}
          onRequireRebind={handleRequireDynamicRebind}
          securityData={securityData}
        />

        <ModifyPaymentPasswordModal
          show={showModifyPaymentPasswordModal}
          onClose={() => setShowModifyPaymentPasswordModal(false)}
          onSuccess={refreshSecurityData}
          onForgotPassword={() => {
            setShowModifyPaymentPasswordModal(false);
            setPaymentPasswordModalMode('forgot');
            setShowPaymentPasswordModal(true);
          }}
        />

        <ModifyLoginPasswordModal
          show={showModifyLoginPasswordModal}
          onClose={() => setShowModifyLoginPasswordModal(false)}
          onSuccess={refreshSecurityData}
        />

        <SecurityGestureModal
          show={gestureVisible}
          onClose={() => setGestureVisible(false)}
          popInfo={popInfo}
          recommendBindItem={recommendBindItem}
          onGo={handleRecommendItemClick}
          onNotToday={handleGestureNotToday}
          onRequestSecurityTip={
            !hasCashPassword(securityData) ? handleRequestSecurityTip : undefined
          }
        />

        {/* 待优化弹窗  */}
        <Overlay
          show={showOptimizationModal}
          close={() => setShowOptimizationModal(false)}
          position={isMobile ? 'bottom' : 'center'}
          maskClickClose
          zIndex={zIndexMap.loginModal}
        >
          <div className={styles.optimizationPopup}>
            <div className={styles.optimizationTitle}>
              {t('securityCenter.upgradeAccountSecurity')}
            </div>
            <div className={styles.optimizationList}>
              <div className={styles.optimizationListContent}>
                {optimizationItems.map((item) => (
                  <button
                    key={String(item.securityKey ?? item.title)}
                    type="button"
                    className={styles.optimizationItem}
                    onClick={() => handleOptimizationItemClick(item)}
                  >
                    <span className={styles.optimizationItemIconWrap}>
                      <img
                        src={getSecurityIcon(item.securityKey)}
                        alt=""
                        className={styles.optimizationItemIcon}
                      />
                    </span>
                    <span className={styles.optimizationItemTitle}>
                      {item.title ?? item.securityKey ?? ''}
                    </span>
                    <span className={styles.optimizationItemChevron} aria-hidden>
                      <svg width="5" height="8" viewBox="0 0 6 8" fill="none">
                        <path
                          d="M1 1L5 4L1 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Overlay>
      </div>
    </>
  );
};

export default SecurityCenterPage;
