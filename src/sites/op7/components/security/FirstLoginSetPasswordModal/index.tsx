import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { toast } from '@/common/components/Toast';
import { useAppSelector } from '@/core/store/hooks';
import { changeLoginPasswordReq } from '@/apis/origin/login';
import { zIndexMap } from '@/utils/constants/zIndex';
import { NewLoginModalClose } from '../../themeIcon';
import styles from './FirstLoginSetPasswordModal.module.scss';

interface FirstLoginSetPasswordModalProps {
  show: boolean;
  loginName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

const FirstLoginSetPasswordModal: React.FC<FirstLoginSetPasswordModalProps> = ({
  show,
  loginName,
  onClose,
  onSuccess,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const overlayPosition: OverlayPosition = isMobile ? 'bottom' : 'center';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [show]);

  const isValid = useMemo(() => {
    return PASSWORD_REGEX.test(password) && PASSWORD_REGEX.test(confirmPassword);
  }, [password, confirmPassword]);

  const handleSubmit = useCallback(() => {
    if (!PASSWORD_REGEX.test(password)) {
      toast({ type: 'warning', title: '请输入8-16位字母和数字组合的密码' });
      return;
    }
    if (!PASSWORD_REGEX.test(confirmPassword)) {
      toast({ type: 'warning', title: '请输入8-16位字母和数字组合的确认密码' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ type: 'warning', title: '两次输入的密码不一致' });
      return;
    }
    if (!loginName.trim()) {
      toast({ type: 'warning', title: '账号不能为空' });
      return;
    }

    setLoading(true);
    changeLoginPasswordReq({
      loginName: loginName.trim(),
      newLoginPassword: password,
      confirmNewLoginPassword: confirmPassword,
    })
      .then(() => {
        toast({ type: 'success', description: '修改成功' });
        onSuccess?.();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [confirmPassword, loginName, onSuccess, password]);

  return (
    <Overlay
      show={show}
      close={onClose}
      position={overlayPosition}
      maskClickClose={false}
      zIndex={zIndexMap.loginModal + 1}
    >
      <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
        <NewLoginModalClose onClick={onClose} className={styles.closeButton} />
        <div className={styles.title}>安全提醒</div>
        <div className={styles.tips1}>
          尊贵的会员，欢迎您光临OP7平台。系统检测到您的账号为首次登录，为了账号安全，请设置新密码。
        </div>
        <div className={styles.formGroup}>
          <div className={styles.inputRow}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              maxLength={16}
              autoComplete="new-password"
              placeholder="密码 8-16位数字和字母"
              onChange={(e) => setPassword(e.target.value.trim())}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              <img
                src={
                  showPassword
                    ? '/images/common/login/eye.svg'
                    : '/images/common/login/close-eye.svg'
                }
                alt=""
                width={16}
                height={16}
              />
            </button>
          </div>
          <div className={styles.inputRow}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              maxLength={16}
              autoComplete="new-password"
              placeholder="确认密码 8-16位数字和字母"
              onChange={(e) => setConfirmPassword(e.target.value.trim())}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
            >
              <img
                src={
                  showConfirmPassword
                    ? '/images/common/login/eye.svg'
                    : '/images/common/login/close-eye.svg'
                }
                alt=""
                width={16}
                height={16}
              />
            </button>
          </div>
        </div>
        <Button
          type="primary"
          className={styles.submitButton}
          disabled={!isValid || loading}
          loading={loading}
          onClick={handleSubmit}
        >
          提交
        </Button>
      </div>
    </Overlay>
  );
};

export default FirstLoginSetPasswordModal;
