import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { Swiper, SwiperSlide } from 'swiper/react';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import { toast } from '@/common/components/Toast';
import SecurityModalHeader from '../SecurityModalHeader';
import {
  getAuthKeyReq,
  bindAuthKeyReq,
  getAuthenticatorURLReq,
  type AuthKeyData,
} from '@/apis/origin/login';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import CopyButton from '@/sites/op7/components/CopyButton';
import styles from './MicrosoftTokenBindModal.module.scss';

/** 绑定微软安全令牌 type 为 10 */
const BIND_MICROSOFT_TYPE = '10';
const GRAPHIC_TUTORIAL_IMAGES = Array.from(
  { length: 9 },
  (_, index) => `/images/common/securityTutorial/android-${index + 1}.png`,
);

const IconTutorialImage: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M10 2.5C7.8775 2.55208 6.11 3.28458 4.6975 4.6975C3.285 6.11042 2.5525 7.87792 2.5 10C2.55208 12.1225 3.28458 13.89 4.6975 15.3025C6.11042 16.715 7.87792 17.4475 10 17.5C12.1225 17.4479 13.89 16.7154 15.3025 15.3025C16.715 13.8896 17.4475 12.1221 17.5 10C17.4479 7.8775 16.7154 6.11 15.3025 4.6975C13.8896 3.285 12.1221 2.5525 10 2.5ZM10 1.25C12.4742 1.315 14.5348 2.17104 16.1819 3.81813C17.829 5.46521 18.685 7.52583 18.75 10C18.685 12.4742 17.829 14.5348 16.1819 16.1819C14.5348 17.829 12.4742 18.685 10 18.75C7.52583 18.685 5.46521 17.829 3.81813 16.1819C2.17104 14.5348 1.315 12.4742 1.25 10C1.315 7.52583 2.17104 5.46521 3.81813 3.81813C5.46521 2.17104 7.52583 1.315 10 1.25ZM12.5 5.625C13.3333 5.625 13.75 6.04167 13.75 6.875C13.75 7.70833 13.3333 8.125 12.5 8.125C11.6667 8.125 11.25 7.70833 11.25 6.875C11.25 6.04167 11.6667 5.625 12.5 5.625ZM4.19937 15.4494L3.30063 14.5506L6.93375 10.9375C7.2725 10.6121 7.66313 10.4298 8.10563 10.3906C8.54813 10.3515 8.96479 10.4688 9.35563 10.7425L12.0512 12.6569C12.1683 12.7481 12.2985 12.7873 12.4419 12.7744C12.5852 12.7615 12.7154 12.7094 12.8325 12.6181L17.7156 8.24312L18.5363 9.18062L13.6731 13.5556C13.3215 13.8423 12.9342 13.9985 12.5112 14.0244C12.0883 14.0502 11.6944 13.9329 11.3294 13.6725L8.61438 11.7581C8.49729 11.6669 8.36375 11.6277 8.21375 11.6406C8.06375 11.6535 7.93021 11.7121 7.81313 11.8162L4.19937 15.4494Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);

const IconTutorialVideo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M13.75 15V5H2.5V15H13.75ZM15 6.875L18.75 5V15L15 13.125V15.625C15 15.8075 14.9415 15.9573 14.8244 16.0744C14.7073 16.1915 14.5575 16.25 14.375 16.25H1.875C1.6925 16.25 1.54271 16.1915 1.42562 16.0744C1.30854 15.9573 1.25 15.8075 1.25 15.625V4.375C1.25 4.1925 1.30854 4.04271 1.42562 3.92563C1.54271 3.80854 1.6925 3.75 1.875 3.75H14.375C14.5575 3.75 14.7073 3.80854 14.8244 3.92563C14.9415 4.04271 15 4.1925 15 4.375V6.875ZM15 8.28125V11.7188L17.5 12.9688V7.03125L15 8.28125ZM3.75 6.25H7.5V7.5H3.75V6.25Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);

export interface MicrosoftTokenBindModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** 完成任意一种验证返回的 token，绑定微软令牌需传此参数否则接口报无权限 */
  verifyToken?: string;
  /** 解绑类型， */
  unbindType?: string;
}

const MicrosoftTokenBindModal: React.FC<MicrosoftTokenBindModalProps> = ({
  show,
  onClose,
  onSuccess,
  verifyToken,
  unbindType = '',
}) => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const openCustomerService = useOpenCustomerService();

  const [step, setStep] = useState(1);
  const [authKeyData, setAuthKeyData] = useState<AuthKeyData | null>(null);
  const [authenticatorURL, setAuthenticatorURL] = useState<{
    ios?: string;
    android?: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [tutorialPreview, setTutorialPreview] = useState<
    | {
        mode: 'graphic';
      }
    | {
        mode: 'video';
        url: string;
      }
    | null
  >(null);

  const fetchData = useCallback(() => {
    getAuthKeyReq({ loginName })
      .then((res) => setAuthKeyData(res?.data ?? null))
      .catch(() => setAuthKeyData(null));
  }, [loginName]);

  useEffect(() => {
    if (show && !authKeyData) {
      fetchData();
    }
  }, [show, authKeyData, fetchData]);

  useEffect(() => {
    if (!show) {
      setStep(1);
      setVerifyCode('');
      setTutorialPreview(null);
    }
  }, [show]);

  useEffect(() => {
    if (show && !authenticatorURL) {
      getAuthenticatorURLReq()
        .then((res) => setAuthenticatorURL(res?.data ?? null))
        .catch(() => setAuthenticatorURL(null));
    }
  }, [show, authenticatorURL]);

  const handleDownloadClick = useCallback(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && authenticatorURL?.ios) {
      window.open(authenticatorURL.ios);
    } else if (authenticatorURL?.android) {
      window.open(authenticatorURL.android);
    }
  }, [authenticatorURL]);

  // qrCode 为 otpauth URL 作为编码值，无则用 secret 生成；data: 为后端返回的图片
  const qrDisplay = useMemo(() => {
    const fromApi = authKeyData?.qrCode?.trim();
    if (fromApi?.startsWith('data:')) {
      return { type: 'img' as const, src: fromApi };
    }
    const secret = authKeyData?.secret?.trim();
    const valueToEncode =
      fromApi ||
      (secret
        ? (() => {
            const issuer = 'OP7';
            const label = loginName ? `${issuer}:${loginName}` : issuer;
            return `otpauth://totp/${encodeURIComponent(label)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}`;
          })()
        : '');
    if (!valueToEncode) return null;
    return { type: 'qrcode' as const, value: valueToEncode };
  }, [authKeyData?.secret, authKeyData?.qrCode, loginName]);

  const handleBack = useCallback(() => {
    if (step === 1) {
      Modal.open({
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <img
              src="/images/common/login/safe-tip.svg"
              alt=""
              style={{ width: 16, height: 16, flexShrink: 0 }}
            />
            <span
              style={{
                color: 'var(--Text-Main-10, #1F2634)',
                textAlign: 'center',
                fontFamily: '"PingFang SC", sans-serif',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '24px',
              }}
            >
              {t('microsoftToken.backConfirmTitle')}
            </span>
          </div>
        ),
        content: (
          <div style={{ marginTop: 9, marginBottom: -3 }}>
            <p
              style={{
                margin: 0,
                color: 'var(--Text-Main-10, #1F2634)',
                textAlign: 'center',
                fontFamily: '"PingFang SC", sans-serif',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              {t('microsoftToken.backConfirmContent')}
            </p>
          </div>
        ),
        showCloseButton: true,
        confirmText: t('microsoftToken.backConfirmConfirm'),
        zIndex: zIndexMap.loginModal + 1,
        onConfirm: () => {
          onClose();
          return Promise.resolve();
        },
      });
    } else {
      setStep((s) => Math.max(1, s - 1));
    }
  }, [step, onClose, t]);

  const handlePaste = useCallback(() => {
    navigator.clipboard
      .readText()
      .then((text) => setVerifyCode(text.replace(/\D/g, '').slice(0, 6)));
  }, []);

  const handleSubmit = useCallback(() => {
    if (verifyCode.length !== 6 || !authKeyData?.secret) return;
    setLoading(true);
    bindAuthKeyReq({
      code: verifyCode,
      type: BIND_MICROSOFT_TYPE,
      secret: authKeyData.secret,
      token: verifyToken || '',
      loginName: loginName || '',
      unbindType: unbindType || '',
    })
      .then(() => {
        toast({ type: 'success', description: t('microsoftToken.bindSuccess') });
        onSuccess?.();
        onClose();
      })
      .catch((error) => {
        console.error('绑定微软令牌失败:', error);
      })
      .finally(() => setLoading(false));
  }, [verifyCode, authKeyData?.secret, verifyToken, loginName, unbindType, onSuccess, onClose, t]);

  const canSubmit = verifyCode.length === 6;

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
            title={t('microsoftToken.title')}
            onBack={handleBack}
            isMobile={isMobile}
            onClose={onClose}
            onCustomerClick={openCustomerService}
            customerAriaLabel={t('customerService.chooseServiceTitle')}
          />

          <div className={styles.content}>
            {step === 1 && (
              <div className={styles.stepDownload}>
                <div className={styles.downloadCard}>
                  <img
                    src="/images/common/safeCenter/lingpai2.svg"
                    alt="Authenticator"
                    className={styles.authenticatorIcon}
                  />
                  <span className={styles.appName}>Authenticator</span>
                  <ul className={styles.downloadList}>
                    <li>{t('microsoftToken.step1Hint1')}</li>
                    <li>{t('microsoftToken.step1Hint2')}</li>
                    <li>{t('microsoftToken.step1Hint3')}</li>
                  </ul>
                  <button
                    type="button"
                    className={styles.downloadBtn}
                    onClick={handleDownloadClick}
                  >
                    {t('microsoftToken.download')}
                  </button>
                </div>
                <Button type="primary" className={styles.nextBtn} onClick={() => setStep(2)}>
                  {t('microsoftToken.nextStep')}
                </Button>
                <span className={styles.reminder}>{t('microsoftToken.step1Reminder')}</span>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepPrepare}>
                <div className={styles.stepCard}>
                  <div className={styles.stepHead}>
                    <span className={styles.stepNum}>1</span>
                    {t('microsoftToken.step1Title')}
                  </div>
                  <div className={styles.stepDivider} />
                  <div className={styles.secretArea}>
                    {qrDisplay && (
                      <div className={styles.qrCodeWrap}>
                        {qrDisplay.type === 'img' ? (
                          <img
                            src={qrDisplay.src}
                            alt={t('microsoftToken.qrCodeAlt')}
                            className={styles.qrCodeImg}
                          />
                        ) : (
                          <QRCode value={qrDisplay.value} size={250} className={styles.qrCodeImg} />
                        )}
                      </div>
                    )}
                    <div className={styles.secretRow}>
                      <span className={styles.secretText}>{authKeyData?.secret ?? '...'}</span>
                      {authKeyData?.secret && (
                        <CopyButton
                          text={authKeyData.secret}
                          className={styles.copyBtn}
                          resultToast={false}
                          onCopySuccess={() =>
                            toast({ type: 'success', description: t('microsoftToken.copySuccess') })
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepHead}>
                    <span className={styles.stepNum}>2</span>
                    {t('microsoftToken.step2Title')}
                  </div>
                  <div className={styles.stepDivider} />
                  <div className={styles.tutorialSection}>
                    <div className={styles.tutorialLabel}>
                      <span className={styles.tutorialLabelLine} />
                      {t('microsoftToken.bindingTutorial')}
                    </div>
                    <div className={styles.tutorialBtns}>
                      <button
                        type="button"
                        className={styles.tutorialBtn}
                        onClick={() => setTutorialPreview({ mode: 'graphic' })}
                      >
                        <IconTutorialImage className={styles.tutorialIcon} />
                        {t('microsoftToken.tutorialImage')}
                        <span className={styles.tutorialArrow}>›</span>
                      </button>
                      {authKeyData?.videoUrl && (
                        <button
                          type="button"
                          className={styles.tutorialBtn}
                          onClick={() =>
                            authKeyData?.videoUrl
                              ? setTutorialPreview({ mode: 'video', url: authKeyData.videoUrl })
                              : null
                          }
                        >
                          <IconTutorialVideo className={styles.tutorialIcon} />
                          {t('microsoftToken.tutorialVideo')}
                          <span className={styles.tutorialArrow}>›</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.actionBlock}>
                  <Button type="primary" className={styles.nextBtn} onClick={() => setStep(3)}>
                    {t('microsoftToken.nextStep')}
                  </Button>
                  <span className={styles.reminder}>{t('microsoftToken.step2Reminder')}</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepVerify}>
                <div className={styles.stepCard}>
                  <div className={`${styles.stepHead} ${styles.stepHeadStep3}`}>
                    <span className={styles.stepNum}>3</span>
                    {t('microsoftToken.step3Title')}
                  </div>
                  <div className={styles.verifyContent}>
                    <div className={styles.inputRow}>
                      {/* <span className={styles.inputLabel}>{t('microsoftToken.verifyCode')}</span> */}
                      <div className={styles.inputWrap}>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder={t('microsoftToken.verifyCodePlaceholder')}
                          value={verifyCode}
                          onChange={(e) =>
                            setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          className={styles.verifyInput}
                        />
                        <button type="button" className={styles.pasteBtn} onClick={handlePaste}>
                          {t('microsoftToken.paste')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  className={`${styles.nextBtn} ${canSubmit ? styles.active : ''}`}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!canSubmit || loading}
                >
                  {t('microsoftToken.confirm')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Overlay>

      {tutorialPreview && (
        <div className={styles.tutorialModal}>
          <div className={styles.tutorialModalContent}>
            <button
              type="button"
              className={styles.tutorialClose}
              onClick={() => setTutorialPreview(null)}
              aria-label="关闭"
            >
              ✕
            </button>
            {tutorialPreview.mode === 'graphic' ? (
              <div
                className={styles.tutorialSwiperWrap}
                style={{
                  width: isMobile ? '80vw' : '375px',
                }}
              >
                <Swiper className={styles.tutorialSwiper}>
                  {GRAPHIC_TUTORIAL_IMAGES.map((image) => (
                    <SwiperSlide key={image} className={styles.tutorialSwiperSlide}>
                      <img src={image} alt={t('microsoftToken.tutorialImage')} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <iframe
                src={tutorialPreview.url}
                title="tutorial"
                className={styles.tutorialIframe}
                style={{
                  width: isMobile ? '80vw' : '375px',
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MicrosoftTokenBindModal;
