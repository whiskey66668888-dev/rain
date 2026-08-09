import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Overlay from '@/common/components/Overlay';
import { toast } from '@/common/components/Toast';
import { getCaptchaReq, verifyCaptchaReq, type CaptchaData } from '@/apis/origin/login';

import closeIcon from '../../images/common/login/close.png';
import refreshIcon from '../../images/common/login/refresh.png';

import styles from './OwnCaptcha.module.scss';
import { zIndexMap } from '@/utils/constants/zIndex';

interface OwnCaptchaProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  callBack: (captchaKey?: string) => void | Promise<void>;
}

const OwnCaptcha: React.FC<OwnCaptchaProps> = ({ visible, setVisible, callBack }) => {
  const { t } = useTranslation();
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'default' | 'failed' | 'passed'>('default');

  const getCaptcha = useCallback(async (): Promise<void> => {
    setAnswer('');
    try {
      const response = await getCaptchaReq();
      setStatus('default');
      setCaptchaData(response.data);
    } catch (error) {
      toast({ type: 'error', title: t('forgotPassword.captcha.getError'), duration: 2000 });
      console.error('获取验证码失败:', error);
    }
  }, [t]);

  const submit = async (): Promise<void> => {
    if (!captchaData || !answer.trim()) {
      return;
    }
    try {
      await verifyCaptchaReq({
        key: captchaData.key,
        answer: answer.trim(),
      });
      setStatus('passed');
      setTimeout(() => {
        setVisible(false);
        void callBack(captchaData.key);
      }, 500);
    } catch (error) {
      setStatus('failed');
      console.error('验证失败:', error);
      getCaptcha();
    }
  };

  useEffect(() => {
    if (visible) {
      setStatus('default');
      setAnswer('');
      getCaptcha();
    }
  }, [visible, getCaptcha]);

  const handleClose = (): void => {
    setVisible(false);
    setAnswer('');
    setStatus('default');
  };

  return (
    <Overlay
      show={visible}
      position="center"
      close={handleClose}
      maskClickClose
      zIndex={zIndexMap.ownCaptcha}
    >
      <div className={styles.captchaModal}>
        <div
          className={`${styles.line} ${status === 'failed' ? styles.failed : ''} ${status === 'passed' ? styles.passed : ''}`}
        />
        {status === 'passed' ? (
          <div className={styles.passedBox}>
            <div className={styles.passedIcon}>✓</div>
            <span>{t('forgotPassword.captcha.passed')}</span>
          </div>
        ) : (
          <div className={styles.captchaContent}>
            <div className={styles.title}>{t('forgotPassword.captcha.title')}</div>
            <div className={styles.imgBox}>
              {captchaData?.img ? (
                <img src={captchaData.img} alt="" className={styles.captchaImage} />
              ) : (
                <div className={styles.loadingPlaceholder}>
                  {t('forgotPassword.captcha.loading')}
                </div>
              )}
              {status === 'failed' && (
                <div className={styles.failedMessage}>
                  {t('forgotPassword.captcha.failedMessage')}
                </div>
              )}
            </div>
            <div className={styles.bottom}>
              <input
                type="text"
                inputMode="numeric"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('forgotPassword.captcha.placeholder')}
                className={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && answer.trim()) {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => answer.trim() && void submit()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && answer.trim()) {
                    e.preventDefault();
                    void submit();
                  }
                }}
                className={`${styles.submit} ${answer.length > 0 ? '' : styles.disable}`}
              >
                {t('forgotPassword.captcha.submit')}
              </div>
            </div>
            <div className={styles.footer}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.footerBtn}
                aria-label={t('forgotPassword.captcha.close')}
              >
                <img src={closeIcon} alt="" />
              </button>
              <button
                type="button"
                onClick={() => void getCaptcha()}
                className={styles.footerBtn}
                aria-label={t('forgotPassword.captcha.refresh')}
              >
                <img src={refreshIcon} alt="" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
};

export default OwnCaptcha;
