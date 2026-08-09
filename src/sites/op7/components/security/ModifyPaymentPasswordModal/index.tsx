import React, { useCallback, useEffect, useState } from 'react';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { useAppSelector } from '@/core/store/hooks';
import { toast } from '@/common/components/Toast';
import SecurityModalHeader from '../SecurityModalHeader';
import { vAndRCashPasswordReq } from '@/apis/origin/login';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { zIndexMap } from '@/utils/constants/zIndex';
import FormInput from '../../FormInput';
import styles from './ModifyPaymentPasswordModal.module.scss';

export interface ModifyPaymentPasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** 点击「忘记支付密码」时回调，由父级打开忘记密码流程 */
  onForgotPassword?: () => void;
}

const PAYMENT_PASSWORD_LENGTH = 6;

const sanitizePaymentPassword = (value: string) =>
  value.replace(/\D/g, '').slice(0, PAYMENT_PASSWORD_LENGTH);

const ModifyPaymentPasswordModal: React.FC<ModifyPaymentPasswordModalProps> = ({
  show,
  onClose,
  onSuccess,
  onForgotPassword,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const overlayPosition: OverlayPosition = isMobile ? 'bottom' : 'center';

  const openCustomerService = useOpenCustomerService();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!show) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [show]);

  const handleBack = useCallback(() => {
    onClose();
  }, [onClose]);

  const isValidPaymentPassword = (value: string) =>
    value.length === PAYMENT_PASSWORD_LENGTH && /^\d{6}$/.test(value);

  const canSubmit =
    isValidPaymentPassword(oldPassword) &&
    isValidPaymentPassword(newPassword) &&
    isValidPaymentPassword(confirmPassword) &&
    newPassword === confirmPassword;

  const handleSubmit = useCallback(() => {
    const oldVal = oldPassword.trim();
    const newVal = newPassword.trim();
    const confirmVal = confirmPassword.trim();
    const newErrors: Record<string, string> = {};
    if (!isValidPaymentPassword(oldVal)) {
      newErrors.old = '请输入6位数字原支付密码';
    }
    if (!isValidPaymentPassword(newVal)) {
      newErrors.new = '请输入6位数字新支付密码';
    }
    if (confirmVal !== newVal) {
      newErrors.confirm = '两次输入的新密码不一致';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    vAndRCashPasswordReq({
      cashPassword: oldVal,
      newCashPassword: newVal,
      confirmNewCashPassword: confirmVal,
    })
      .then(() => {
        toast({ type: 'success', description: '修改成功' });
        onSuccess?.();
        onClose();
      })
      .finally(() => setLoading(false));
  }, [oldPassword, newPassword, confirmPassword, onSuccess, onClose]);

  const handleForgotClick = useCallback(() => {
    onClose();
    onForgotPassword?.();
  }, [onClose, onForgotPassword]);

  const inputVariant = isMobile ? 'light' : 'default';

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
        <div className={`${styles.page} ${isMobile ? styles.mobile : styles.desktop}`}>
          <SecurityModalHeader
            title="修改支付密码"
            onBack={handleBack}
            isMobile={isMobile}
            onClose={onClose}
            onCustomerClick={openCustomerService}
            customerAriaLabel="客服"
          />

          <div className={styles.content}>
            <div className={styles.form}>
              <FormInput
                type="password"
                placeholder="请输入原支付密码"
                value={oldPassword}
                onChange={(value) => setOldPassword(sanitizePaymentPassword(value))}
                maxLength={PAYMENT_PASSWORD_LENGTH}
                inputMode="numeric"
                autoComplete="current-password"
                error={errors.old}
                showError={!!errors.old}
                variant={inputVariant}
              />
              <FormInput
                type="password"
                placeholder="请输入新支付密码"
                value={newPassword}
                onChange={(value) => setNewPassword(sanitizePaymentPassword(value))}
                maxLength={PAYMENT_PASSWORD_LENGTH}
                inputMode="numeric"
                autoComplete="new-password"
                error={errors.new}
                showError={!!errors.new}
                variant={inputVariant}
              />
              <FormInput
                type="password"
                placeholder="重新输入新支付密码"
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(sanitizePaymentPassword(value))}
                maxLength={PAYMENT_PASSWORD_LENGTH}
                inputMode="numeric"
                autoComplete="new-password"
                error={errors.confirm}
                showError={!!errors.confirm}
                variant={inputVariant}
              />
            </div>

            <div className={styles.actions}>
              <Button
                type="primary"
                className={`${styles.submitBtn} ${canSubmit ? styles.submitBtnActive : styles.submitBtnInactive}`}
                onClick={handleSubmit}
                loading={loading}
                disabled={!canSubmit || loading}
              >
                提交
              </Button>
              {onForgotPassword && (
                <button type="button" className={styles.forgotLink} onClick={handleForgotClick}>
                  忘记支付密码
                </button>
              )}
            </div>

            <div className={styles.warmTip}>
              <p className={styles.warmTipTitle}>温馨提示：</p>
              <p className={styles.warmTipText}>为了您的资金安全，请您设置支付密码。</p>
            </div>
          </div>
        </div>
      </Overlay>
    </>
  );
};

export default ModifyPaymentPasswordModal;
