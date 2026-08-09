import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import FormInput from '../FormInput';
import ModalCloseButton from '../themeIcon/ModalCloseButton';
import styles from './AccountManagementModal.module.scss';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useAppSelector } from '@/core/store/hooks';
import { verifyCashPasswordReq } from '@/apis/origin/login';

interface BindBankModalProps {
  handleClose: () => void;
  /** 点击「忘记支付密码？」时回调，由父级打开忘记支付密码流程 */
  onForgotPassword?: () => void;
  /** 验证成功回调，可拿到后端返回的 token */
  onSuccess?: (token?: string) => void;
  /** 验证支付密码时的 type，如解绑场景 13=银行卡 15=虚拟币 17=数字货币 24=支付宝 */
  verifyType?: number;
}

const BindBankModal: React.FC<BindBankModalProps> = ({
  handleClose,
  onForgotPassword,
  onSuccess,
  verifyType,
}) => {
  const { t } = useTranslation();
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';

  const [paymentPassword, setPaymentPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifySubmit = () => {
    const trimmed = paymentPassword.trim();
    if (!trimmed) {
      setErrors({ password: t('bindPaymentPassword.passwordRequired') });
      return;
    }
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setErrors({ password: t('bindPaymentPassword.passwordLength6') });
      return;
    }
    setErrors({});
    setIsLoading(true);
    verifyCashPasswordReq({
      loginName,
      cashPassword: trimmed,
      ...(verifyType !== undefined ? { type: verifyType } : {}),
    })
      .then((res) => {
        const token = (res?.data as { token?: string })?.token ?? '';
        setPaymentPassword('');
        onSuccess?.(token);
      })
      .catch((error: unknown) => {
        let errorMessage = t('bindPaymentPassword.passwordRequired');
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as { response?: { info?: string; message?: string } }).response;
          if (response) {
            errorMessage = response.info || response.message || errorMessage;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setErrors({ password: errorMessage });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleForgotClick = () => {
    onForgotPassword?.();
    handleClose();
  };

  const canSubmit = paymentPassword.trim().length === 6 && /^\d{6}$/.test(paymentPassword.trim());

  return (
    <ClientOnly>
      <Overlay
        show
        close={handleClose}
        position="center"
        maskClickClose
        zIndex={zIndexMap.loginModal}
      >
        <div className={styles.checkPayPasswordModal}>
          <ModalCloseButton onClick={handleClose} className="!right-[12px]" />
          <p className={styles.verifyTitle}>支付密码验证</p>
          <div className={styles.stepContent}>
            <div className={styles.inputSection}>
              <FormInput
                type="password"
                placeholder={t('verifyPaymentPassword.passwordPlaceholder')}
                value={paymentPassword}
                onChange={(v) => setPaymentPassword(v.replace(/\D/g, '').slice(0, 6))}
                error={errors.password}
                showError={!!errors.password}
                variant="default"
                rightSlot={
                  onForgotPassword ? (
                    <button type="button" className={styles.forgotLink} onClick={handleForgotClick}>
                      {t('verifyPaymentPassword.forgotPaymentPassword')}
                    </button>
                  ) : undefined
                }
              />
            </div>
            <Button
              type="primary"
              className={`${styles.submitBtn} ${canSubmit ? styles.submitBtnActive : styles.submitBtnInactive}`}
              onClick={handleVerifySubmit}
              loading={isLoading}
              disabled={!canSubmit || isLoading}
            >
              确认
            </Button>
          </div>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default BindBankModal;
