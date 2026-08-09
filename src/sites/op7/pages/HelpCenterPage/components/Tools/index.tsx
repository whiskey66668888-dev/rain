import styles from './index.module.scss';
import { Swiper } from 'antd-mobile';
import clsx from 'clsx';
import LazyImage from '@/common/components/LazyImage';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import { BindData, HelpToolItem } from '@/apis/origin/helpCenter/helpCenterInfo';
import { useSearchParams } from 'react-router-dom';
import Modal from '@/common/components/Modal';
import Button from '@/common/components/Button';
import { useState, useCallback, useRef, useEffect } from 'react';
import { getSecurityCenterReq, SecurityCenterResponse } from '@/apis/origin/login';

import BindPaymentPasswordModal from '@/sites/op7/components/security/BindPaymentPasswordModal';
import VerifyPaymentPasswordModal from '@/sites/op7/components/security/VerifyPaymentPasswordModal';
import SecurityTipModal from '@/sites/op7/components/security/SecurityTipModal';
import MicrosoftTokenBindModal from '@/sites/op7/components/security/MicrosoftTokenBindModal';
import SecurityPhoneResetModal from '@/sites/op7/components/security/SecurityPhoneResetModal';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';
import SecurityMicrosoftResetModal from '@/sites/op7/components/security/SecurityMicrosoftResetModal';
import SecurityEmailBindModal from '@/sites/op7/components/security/SecurityEmailBindModal';
import SecurityEmailResetModal from '@/sites/op7/components/security/SecurityEmailResetModal';
import ModifyPaymentPasswordModal from '@/sites/op7/components/security/ModifyPaymentPasswordModal';
import { t } from 'i18next';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import AccountManagementModal from '@/sites/op7/components/AccountManagementModal';
import { BankAccountType } from '@/utils/constants/money';

type ExtendedSecurityCenterResponse = SecurityCenterResponse & {
  bindData: BindData;
};
const Tools = ({
  data,
  overlapHeroSearch,
  // securityData: securityDataProp,
}: {
  data: HelpToolItem[];
  /** 主页顶部胶囊搜索条与卡片重叠时的额外上边距 */
  overlapHeroSearch?: boolean;
  // securityData: SecurityCenterResponse;
}) => {
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token');

  // -------- 安全中心弹窗状态（对齐 SecurityCenterPage）--------
  const [securityData, setSecurityData] = useState<ExtendedSecurityCenterResponse>();
  const [showSecurityTipModal, setShowSecurityTipModal] = useState(false);
  const [showPaymentPasswordModal, setShowPaymentPasswordModal] = useState(false);
  const [paymentPasswordModalMode, setPaymentPasswordModalMode] = useState<'set' | 'forgot'>('set');
  const [showVerifyPaymentModal, setShowVerifyPaymentModal] = useState(false);
  const [verifyPurpose, setVerifyPurpose] = useState<'securityPhone' | 'microsoft'>(
    'securityPhone',
  );
  const [showMicrosoftTokenModal, setShowMicrosoftTokenModal] = useState(false);
  const [showMicrosoftDynamicVerifyModal, setShowMicrosoftDynamicVerifyModal] = useState(false);
  const [microsoftBindToken, setMicrosoftBindToken] = useState<string | null>(null);
  const [microsoftDynamicVerifyToken, setMicrosoftDynamicVerifyToken] = useState<string | null>(
    null,
  );
  const [pendingUnbindType, setPendingUnbindType] = useState<string | null>(null);
  const [showPhoneResetModal, setShowPhoneResetModal] = useState(false);
  const [showMicrosoftResetModal, setShowMicrosoftResetModal] = useState(false);
  const [showEmailBindModal, setShowEmailBindModal] = useState(false);
  const [showEmailResetModal, setShowEmailResetModal] = useState(false);
  const [showModifyPaymentPasswordModal, setShowModifyPaymentPasswordModal] = useState(false);
  const [paymentFromSecurityTip, setPaymentFromSecurityTip] = useState(false);

  const [accountManagementModalShowType, setAccountManagementModalShowType] =
    useState<BankAccountType | null>(null);

  const microsoftFromGestureRef = useRef(false);
  const verifySuccessRef = useRef(false);
  const paymentFromVerifyRef = useRef(false);

  // -------- 安全状态判断（对齐 SecurityCenterPage）--------
  const { Microsoft_Token, Pay_Password, Safety_Email, Safety_Phone } =
    securityData?.bindData ?? {};

  const hasCashPassword = Pay_Password === true;
  const hasAnySafetyVerification =
    Safety_Email === true || Safety_Phone === true || Microsoft_Token === true;

  const refreshSecurityData = useCallback(() => {
    getSecurityCenterReq()
      .then((res) => {
        if (res?.data) {
          setSecurityData(res.data as ExtendedSecurityCenterResponse);
        }
      })
      .catch(() => setSecurityData(undefined));
  }, []);

  useEffect(() => {
    refreshSecurityData();
  }, [refreshSecurityData]);

  const clearForceBindState = useCallback(() => {
    setPendingUnbindType(null);
  }, []);

  // -------- 渲染工具 --------
  const renderTitle = (text: string) => (
    <div className={styles.modal_ttitle_text}>
      <LazyImage src={`/images/${theme}/help/anquan.png`} alt="" width={18} height={18} />
      <span>{text}</span>
    </div>
  );

  // -------- 支付密码 --------
  const handleOpenPaymentModal = useCallback(() => {
    setPaymentPasswordModalMode('set');
    setPaymentFromSecurityTip(false);
    setShowPaymentPasswordModal(true);
  }, []);

  const handleSecurityTipGo = useCallback(() => {
    setShowSecurityTipModal(false);
    setPaymentPasswordModalMode('set');
    setShowPaymentPasswordModal(true);
    setPaymentFromSecurityTip(true);
  }, []);

  // -------- 手机 --------
  const handleOpenPhoneFlow = useCallback(() => {
    if (!hasCashPassword) {
      setShowSecurityTipModal(true);
      return;
    }
    setVerifyPurpose('securityPhone');
    setShowVerifyPaymentModal(true);
  }, [hasCashPassword]);

  const handleSecurityPhoneClick = useCallback(() => {
    if (Safety_Phone) {
      setShowPhoneResetModal(true);
    } else {
      handleOpenPhoneFlow();
    }
  }, [Safety_Phone, handleOpenPhoneFlow]);

  // -------- 邮箱 --------
  const handleOpenEmailFlow = useCallback(() => {
    if (!hasCashPassword) {
      setShowSecurityTipModal(true);
      return;
    }
    setShowEmailBindModal(true);
  }, [hasCashPassword]);

  const handleSecurityEmailClick = useCallback(() => {
    if (Safety_Email) {
      setShowEmailResetModal(true);
    } else {
      handleOpenEmailFlow();
    }
  }, [Safety_Email, handleOpenEmailFlow]);

  // -------- 微软安全令牌 --------
  const handleMicrosoftVerifySuccess = useCallback((token?: string) => {
    verifySuccessRef.current = true;
    setMicrosoftBindToken(token ?? null);
    setShowVerifyPaymentModal(false);
    getSecurityCenterReq()
      .then((res) => {
        const list = Array.isArray(res?.data?.securityBindList) ? res.data.securityBindList : [];
        const MICROSOFT_AVAILABLE_KEYS = ['Safety_Phone', 'Safety_Email', 'Gesture_Password'];
        const hasAvailable = list.some(
          (item: { bind?: boolean; securityKey?: string }) =>
            item.bind &&
            !!item.securityKey &&
            MICROSOFT_AVAILABLE_KEYS.includes(item.securityKey) &&
            item.securityKey !== 'Microsoft_Token',
        );
        if (hasAvailable) {
          setShowMicrosoftDynamicVerifyModal(true);
        } else {
          setShowMicrosoftTokenModal(true);
        }
      })
      .catch(() => {
        setShowMicrosoftDynamicVerifyModal(true);
      });
  }, []);

  const handleMicrosoftDynamicVerifySuccess = useCallback(
    (_securityKey?: string, token?: string) => {
      setMicrosoftDynamicVerifyToken(token ?? null);
      setShowMicrosoftDynamicVerifyModal(false);
      setShowMicrosoftTokenModal(true);
    },
    [],
  );

  const handleMicrosoftTokenClick = useCallback(() => {
    console.log('点击了微软安全令牌');
    if (!hasCashPassword) {
      setShowSecurityTipModal(true);
      return;
    }
    if (Microsoft_Token) {
      setShowMicrosoftResetModal(true);
    } else {
      microsoftFromGestureRef.current = false;
      setVerifyPurpose('microsoft');
      setTimeout(() => {
        setShowVerifyPaymentModal(true);
      }, 0);
    }
  }, [hasCashPassword, Microsoft_Token]);

  const handleRequireDynamicRebind = useCallback(
    (unbindType: string) => {
      const nextUnbindType = unbindType.trim();
      if (!nextUnbindType) return;
      setPendingUnbindType(nextUnbindType);
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

  const handleVerifyPaymentModalClose = useCallback(() => {
    if (verifySuccessRef.current) {
      verifySuccessRef.current = false;
    } else if (verifyPurpose === 'microsoft' && microsoftFromGestureRef.current) {
      microsoftFromGestureRef.current = false;
    }
    setShowVerifyPaymentModal(false);
    clearForceBindState();
  }, [verifyPurpose, clearForceBindState]);

  const handleForgotPaymentPassword = useCallback(() => {
    paymentFromVerifyRef.current = true;
    setShowVerifyPaymentModal(false);
    setPaymentPasswordModalMode('forgot');
    setShowPaymentPasswordModal(true);
  }, []);

  // -------- 工具项点击路由 --------
  const handleSecurityItemClick = (item: HelpToolItem) => {
    console.log('点击了工具项：', item, hasCashPassword, hasAnySafetyVerification, isLogin);
    if (isLogin || (isInFlutter() && !!token)) {
      if (!hasCashPassword && !isInFlutter()) {
        const modal = Modal.open({
          title: renderTitle('安全提示'),
          content: (
            <div>
              <p style={{ marginTop: '12px', color: 'var(--Text-800)' }} className="text-center">
                为了您的账号安全，请先绑定支付密码。
              </p>
            </div>
          ),
          showCloseButton: false,
          footer: (
            <div className={styles.modalFooter}>
              <Button
                type="second"
                className={clsx(styles.button, styles.cancel)}
                onClick={() => modal.close()}
              >
                取消
              </Button>
              <Button
                className={styles.button}
                type="primary"
                onClick={() => {
                  modal.close();
                  handleOpenPaymentModal();
                }}
              >
                前往
              </Button>
            </div>
          ),
        });
        return;
      }
      console.log(item.toolsKey, 'item.toolsKey');
      if (item.toolsKey === 'phone') {
        console.log('点击了手机验证工具项');
        if (isInFlutter()) {
          sendToFlutter('onMobileCardHandle');
          return;
        }
        handleSecurityPhoneClick();
      } else if (item.toolsKey === 'password') {
        if (isInFlutter()) {
          sendToFlutter('toCashPwdVerify');
          return;
        }
        if (hasCashPassword) {
          setShowModifyPaymentPasswordModal(true);
        } else {
          handleOpenPaymentModal();
        }
      } else if (item.toolsKey === 'email') {
        if (isInFlutter()) {
          sendToFlutter('toEmailVerify');
          return;
        }
        handleSecurityEmailClick();
      } else if (item.toolsKey === 'microsoft_token') {
        console.log('点击了微软安全令牌工具项');
        if (isInFlutter()) {
          sendToFlutter('onMicrosoftHandle');
          return;
        }
        handleMicrosoftTokenClick();
      } else if (item.toolsKey === 'auto_order') {
        // 自动投注 - 待接入
      } else if (
        item.toolsKey === 'virtual_currency' ||
        item.toolsKey === 'bank_card' ||
        item.toolsKey === 'digital_currency'
      ) {
        if (!hasAnySafetyVerification && !isInFlutter()) {
          const modal = Modal.open({
            title: renderTitle('安全提示'),
            content: <div>为了您的账号安全，请至少绑定 1 种安全验证。</div>,
            footer: (
              <div className={styles.modalFooter}>
                <Button
                  type="second"
                  className={clsx(styles.button, styles.cancel)}
                  onClick={() => modal.close()}
                >
                  取消
                </Button>
                <Button
                  className={styles.button}
                  type="primary"
                  onClick={() => {
                    modal.close();
                  }}
                >
                  前往
                </Button>
              </div>
            ),
          });
          return;
        } else {
          if (item.toolsKey === 'virtual_currency') {
            if (isInFlutter()) {
              sendToFlutter('toAccountPage', { value: 1 });
              return;
            }
            // 虚拟货币 - 待接入
            setAccountManagementModalShowType(BankAccountType.VIRTUAL_ACCOUNT);
          } else if (item.toolsKey === 'bank_card') {
            if (isInFlutter()) {
              sendToFlutter('toAccountPage', { value: 0 });
              return;
            }
            // 银行卡 - 待接入
            setAccountManagementModalShowType(BankAccountType.BANK_ACCOUNT);
          } else {
            if (isInFlutter()) {
              sendToFlutter('toAccountPage', { value: 2 });
              return;
            }
            // 数字货币 - 待接入
            setAccountManagementModalShowType(BankAccountType.DIGITAL_ACCOUNT);
          }
        }
      }
    } else {
      const modal = Modal.open({
        title: '前往登录',
        content: '精彩内容等你来体验，快去登录吧',
        footer: (
          <div className={styles.modalFooter}>
            <Button
              type="second"
              className={clsx(styles.button, styles.cancel)}
              onClick={() => modal.close()}
            >
              取消
            </Button>
            <Button
              className={styles.button}
              type="primary"
              onClick={() => {
                modal.close();
                setTimeout(() => {
                  dispatch(openLoginModal());
                }, 300);
              }}
            >
              登录
            </Button>
          </div>
        ),
      });
    }
  };

  // -------- 数据分组 --------
  const chunkData = (arr: HelpToolItem[], size: number) => {
    if (!arr || arr.length === 0) return [];
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const chunkedData = chunkData(data || [], 8);

  if (!data || data.length === 0) return null;

  return (
    <div className={clsx(styles.contentItem, overlapHeroSearch && styles.contentItemOverlapSearch)}>
      <div className={styles.contentHeader}>
        <div className={styles.blueLine} />
        <span className={styles.contentHeaderTitle}>自助工具</span>
      </div>
      <div className={styles.toolsList}>
        <Swiper indicator={false}>
          {chunkedData.map((chunk, index) => (
            <Swiper.Item key={index}>
              <div className={clsx(styles.toolsGroup, chunk.length < 5 ? styles.lessThanFive : '')}>
                {chunk.map((item, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className={styles.toolItem}
                    onClick={() => handleSecurityItemClick(item)}
                  >
                    <div className={styles.toolIcon}>
                      <LazyImage src={item.icon} alt="" width={40} height={40} />
                    </div>
                    <div className={styles.toolsName}>{item.toolsName}</div>
                  </div>
                ))}
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* -------- 安全中心弹窗 -------- */}
      <SecurityTipModal
        show={showSecurityTipModal}
        onClose={() => setShowSecurityTipModal(false)}
        onGo={handleSecurityTipGo}
      />

      <BindPaymentPasswordModal
        show={showPaymentPasswordModal}
        mode={paymentPasswordModalMode}
        securityData={securityData}
        onClose={() => {
          if (paymentFromVerifyRef.current) {
            paymentFromVerifyRef.current = false;
            setShowVerifyPaymentModal(true);
          } else if (paymentFromSecurityTip) {
            setPaymentFromSecurityTip(false);
          }
          setShowPaymentPasswordModal(false);
        }}
        onSuccess={() => {
          setPaymentFromSecurityTip(false);
          refreshSecurityData();
        }}
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
        hasPaymentPassword={hasCashPassword}
        onForgotPassword={handleForgotPaymentPassword}
      />
      {/* <VerifyPaymentPasswordModal
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
        /> */}
      <SecurityVerifyModal
        visible={showMicrosoftDynamicVerifyModal}
        title="微软安全令牌"
        excludeKeys={['Microsoft_Token']}
        mainSubtitle=""
        emailStepEditable
        microsoftVerifyType={10}
        unbindType={pendingUnbindType ?? undefined}
        onClose={() => {
          setShowMicrosoftDynamicVerifyModal(false);
          clearForceBindState();
        }}
        onVerifySuccess={handleMicrosoftDynamicVerifySuccess}
        onNoAvailableChannels={() => {
          setShowMicrosoftDynamicVerifyModal(false);
          setShowMicrosoftTokenModal(true);
        }}
      />

      <MicrosoftTokenBindModal
        show={showMicrosoftTokenModal}
        verifyToken={microsoftDynamicVerifyToken ?? microsoftBindToken ?? undefined}
        unbindType={pendingUnbindType ?? undefined}
        onClose={() => {
          setMicrosoftBindToken(null);
          setMicrosoftDynamicVerifyToken(null);
          microsoftFromGestureRef.current = false;
          setShowMicrosoftTokenModal(false);
          clearForceBindState();
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
      />
      {/* 安全微软重置 */}
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
          clearForceBindState();
        }}
        onSuccess={() => {
          clearForceBindState();
          refreshSecurityData();
        }}
        hasPaymentPassword={hasCashPassword}
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
      />

      {/* 账户管理 */}
      <AccountManagementModal
        handleClose={() => {
          setAccountManagementModalShowType(null);
          refreshSecurityData();
        }}
        showType={accountManagementModalShowType}
        onForgotPaymentPassword={() => {
          setAccountManagementModalShowType(null);
          setPaymentPasswordModalMode('forgot');
          setShowPaymentPasswordModal(true);
        }}
      />
    </div>
  );
};

export default Tools;
