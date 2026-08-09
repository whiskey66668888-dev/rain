import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useAppSelector } from '@/core/store/hooks';
import {
  getCountryCodeListReq,
  getCodeBySMSReq,
  bindPhoneReq,
  type CountryCodeItem,
} from '@/apis/origin/login';
import { getSecurityCenterReq } from '@/apis/origin/login';
import { toast } from '@/common/components/Toast';
import Modal from '@/common/components/Modal';
import Button from '@/common/components/Button';
import { zIndexMap } from '@/utils/constants/zIndex';
import { ChevronDownSvg } from '@/sites/op7/components/SvgIcons';
import styles from './SecurityPhonePage.module.scss';

const BIND_PHONE_TYPE = 6;

const SecurityPhonePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigateWithLanguage();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';

  const [countryCodeList, setCountryCodeList] = useState<CountryCodeItem[]>([]);
  const [countryCode, setCountryCode] = useState('86');
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
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
  }, []);

  const handleBack = useCallback(() => {
    if (tokenFromUrl) {
      const modal = Modal.open({
        title: t('securityPhone.backConfirmTitle'),
        content: (
          <p
            style={{
              margin: 0,
              color: 'var(--Text-800)',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {t('securityPhone.backConfirmContent')}
          </p>
        ),
        showCloseButton: true,
        zIndex: zIndexMap.loginModal + 1,
        footer: (
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
            <Button type="second" onClick={() => modal.close()} style={{ flex: 1 }}>
              {t('securityPhone.backConfirmCancel')}
            </Button>
            <Button
              type="primary"
              style={{ flex: 1 }}
              onClick={() => {
                modal.close();
                navigate(-1);
              }}
            >
              {t('securityPhone.backConfirmConfirm')}
            </Button>
          </div>
        ),
      });
    } else {
      navigate(-1);
    }
  }, [navigate, tokenFromUrl, t]);

  const getCode = useCallback(() => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setErrors((e) => ({ ...e, phone: t('securityPhone.phoneRequired') }));
      return;
    }
    setErrors((e) => ({ ...e, phone: '' }));
    setLoading(true);
    getCodeBySMSReq({
      ...(loginName && { loginName }),
      phone: trimmed,
      countryCode,
      type: BIND_PHONE_TYPE,
      ...(tokenFromUrl && { token: tokenFromUrl }),
    })
      .then(() => {
        toast({ type: 'success', description: t('securityPhone.codeSent') });
        setCountDown(60);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loginName, phone, countryCode, tokenFromUrl, t]);

  useEffect(() => {
    if (countDown <= 0) return;
    const timer = setInterval(() => setCountDown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countDown]);

  const onSubmit = useCallback(() => {
    const trimmedPhone = phone.trim();
    const trimmedCode = verifyCode.trim();
    const newErrors: Record<string, string> = {};
    if (!trimmedPhone) newErrors.phone = t('securityPhone.phoneRequired');
    if (trimmedCode.length !== 4) newErrors.verifyCode = t('securityPhone.codeRequired');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    bindPhoneReq({
      // ...(loginName && { loginName }),
      loginName,
      phone: trimmedPhone,
      countryCode,
      type: BIND_PHONE_TYPE,
      code: trimmedCode,
      ...(tokenFromUrl && { token: tokenFromUrl }),
    })
      .then(() => {
        toast({ type: 'success', description: t('securityPhone.bindSuccess') });
        void getSecurityCenterReq();
        navigate(PATHS.mineSecurity);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loginName, phone, countryCode, verifyCode, tokenFromUrl, t, navigate]);

  const canSubmit = phone.trim().length > 0 && verifyCode.trim().length === 4;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.bar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label={t('securityCenter.back')}
          >
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
          </button>
          <div className={styles.titleWrap}>
            <div className={styles.title}>{t('securityPhone.title')}</div>
            <div className={styles.subtitle}>{t('securityPhone.subtitle')}</div>
          </div>
          <div className={styles.placeholder} />
        </div>
      </header>

      <div className={styles.content}>
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
            <div className={`${styles.verifyRow} ${errors.verifyCode ? styles.inputRowError : ''}`}>
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
                disabled={!phone.trim() || countDown > 0 || loading}
              >
                {countDown > 0 ? `${countDown}s` : t('securityPhone.getCode')}
              </button>
            </div>
            {errors.verifyCode && <div className={styles.errorText}>{errors.verifyCode}</div>}
          </div>

          <button
            type="button"
            className={`${styles.submitBtn} ${canSubmit ? styles.submitBtnActive : styles.submitBtnInactive}`}
            onClick={onSubmit}
            disabled={!canSubmit || loading}
          >
            {t('securityPhone.submit')}
          </button>
        </div>
      </div>

      {pickerVisible && (
        <div
          className={styles.pickerOverlay}
          role="presentation"
          onClick={() => setPickerVisible(false)}
        >
          <div
            className={styles.pickerPanel}
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.pickerTitle}>{t('securityPhone.selectCountry')}</div>
            <div className={styles.pickerList}>
              {countryCodeList.map((item) => (
                <div
                  key={item.value}
                  className={styles.pickerItem}
                  onClick={() => {
                    setCountryCode(String(item.value).replace(/^\+/, ''));
                    setPickerVisible(false);
                  }}
                >
                  <span>{item.label ?? item.name ?? item.value}</span>
                  <span className={styles.pickerItemValue}>
                    +{String(item.value).replace(/^\+/, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPhonePage;
