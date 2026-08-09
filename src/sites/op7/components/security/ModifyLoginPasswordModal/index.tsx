import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { useAppSelector } from '@/core/store/hooks';
import { toast } from '@/common/components/Toast';
import SecurityModalHeader from '../SecurityModalHeader';
import { openSecurityBackConfirm } from '../openSecurityBackConfirm';
import { vAndRLoginPasswordReq } from '@/apis/origin/login';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { zIndexMap } from '@/utils/constants/zIndex';
import FormInput from '../../FormInput';
import styles from './ModifyLoginPasswordModal.module.scss';
import { clearRememberedLoginPassword } from '@/utils/rememberLoginStorage';

export interface ModifyLoginPasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MIN_LOGIN_PASSWORD_LENGTH = 6;
const MAX_LOGIN_PASSWORD_LENGTH = 20;

const ModifyLoginPasswordModal: React.FC<ModifyLoginPasswordModalProps> = ({
  show,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
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
    openSecurityBackConfirm({
      title: t('modifyLoginPassword.backConfirmTitle'),
      content: t('modifyLoginPassword.backConfirmContent'),
      cancelText: t('modifyLoginPassword.backConfirmCancel'),
      confirmText: t('modifyLoginPassword.backConfirmConfirm'),
      onConfirm: onClose,
    });
  }, [onClose, t]);

  const validLength = (s: string) =>
    s.length >= MIN_LOGIN_PASSWORD_LENGTH && s.length <= MAX_LOGIN_PASSWORD_LENGTH;
  const canSubmit =
    validLength(oldPassword) &&
    validLength(newPassword) &&
    validLength(confirmPassword) &&
    newPassword === confirmPassword;

  const handleSubmit = useCallback(() => {
    const oldVal = oldPassword.trim();
    const newVal = newPassword.trim();
    const confirmVal = confirmPassword.trim();
    const newErrors: Record<string, string> = {};
    if (oldVal.length < MIN_LOGIN_PASSWORD_LENGTH || oldVal.length > MAX_LOGIN_PASSWORD_LENGTH) {
      newErrors.old = `请输入${MIN_LOGIN_PASSWORD_LENGTH}-${MAX_LOGIN_PASSWORD_LENGTH}位原登录密码`;
    }
    if (newVal.length < MIN_LOGIN_PASSWORD_LENGTH || newVal.length > MAX_LOGIN_PASSWORD_LENGTH) {
      newErrors.new = `请输入${MIN_LOGIN_PASSWORD_LENGTH}-${MAX_LOGIN_PASSWORD_LENGTH}位新登录密码`;
    }
    if (confirmVal !== newVal) {
      newErrors.confirm = '两次输入的新密码不一致';
    }
    if (oldVal === newVal) {
      newErrors.new = '新密码不能与原密码相同';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    vAndRLoginPasswordReq({
      loginPassword: oldVal,
      newLoginPassword: newVal,
      confirmNewLoginPassword: confirmVal,
    })
      .then(() => {
        clearRememberedLoginPassword();
        toast({ type: 'success', description: '修改成功' });
        onSuccess?.();
        onClose();
      })
      .finally(() => setLoading(false));
  }, [oldPassword, newPassword, confirmPassword, onSuccess, onClose]);

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
            title="修改登录密码"
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
                placeholder="请输入原登录密码"
                value={oldPassword}
                onChange={(value) => setOldPassword(value.slice(0, MAX_LOGIN_PASSWORD_LENGTH))}
                maxLength={MAX_LOGIN_PASSWORD_LENGTH}
                autoComplete="current-password"
                error={errors.old}
                showError={!!errors.old}
                variant={isMobile ? 'light' : 'default'}
              />
              <FormInput
                type="password"
                placeholder="请输入新登录密码"
                value={newPassword}
                onChange={(value) => setNewPassword(value.slice(0, MAX_LOGIN_PASSWORD_LENGTH))}
                maxLength={MAX_LOGIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                error={errors.new}
                showError={!!errors.new}
                variant={isMobile ? 'light' : 'default'}
              />
              <FormInput
                type="password"
                placeholder="重新输入新登录密码"
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(value.slice(0, MAX_LOGIN_PASSWORD_LENGTH))}
                maxLength={MAX_LOGIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                error={errors.confirm}
                showError={!!errors.confirm}
                variant={isMobile ? 'light' : 'default'}
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
            </div>
          </div>
        </div>
      </Overlay>
    </>
  );
};

export default ModifyLoginPasswordModal;
