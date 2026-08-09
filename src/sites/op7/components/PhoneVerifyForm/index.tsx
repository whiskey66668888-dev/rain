import React, { useEffect, useState } from 'react';
import { getCountryCodeListReq } from '@/apis/origin/login';
import { ChevronDownSvg } from '@/sites/op7/components/SvgIcons';
import styles from './PhoneVerifyForm.module.scss';

export interface CountryCodeOption {
  value: string;
  label?: string;
  name?: string;
}

export interface PhoneVerifyFormProps {
  /** 手机号（绑定态可编辑，验证态只读展示） */
  phone: string;
  /** 区号，如 86 */
  countryCode: string;
  /** 为 true 时手机号/区号只读展示；为 false 时手机号可输入、区号可点击选号，并自动拉取区号列表 */
  readOnly?: boolean;
  /** 区号变更（仅 readOnly 为 false 时，选择后回调；拉取到列表后也会用默认区号回调一次） */
  onCountryCodeChange?: (code: string) => void;
  /** 区号选择弹层标题 */
  pickerTitle?: string;
  /** 手机号变更（仅 readOnly 为 false 时生效） */
  onPhoneChange?: (value: string) => void;
  /** 验证码 */
  verifyCode: string;
  onVerifyCodeChange: (value: string) => void;
  /** 获取验证码倒计时秒数 */
  countDown: number;
  onGetCode: () => void;
  /** 获取验证码请求中 */
  getCodeLoading?: boolean;
  /** 提交按钮文案 */
  submitText?: string;
  onSubmit: () => void;
  /** 提交是否禁用 */
  submitDisabled: boolean;
  /** 提交请求中 */
  submitLoading?: boolean;
  /** 校验错误信息 */
  errors?: { phone?: string; verifyCode?: string };
  /** 手机号输入 placeholder（仅绑定态） */
  phonePlaceholder?: string;
  /** 验证码输入 placeholder */
  verifyCodePlaceholder?: string;
  /** 获取验证码按钮文案 */
  getCodeText?: string;
}

const PhoneVerifyForm: React.FC<PhoneVerifyFormProps> = ({
  phone,
  countryCode,
  readOnly = false,
  onCountryCodeChange,
  pickerTitle = '选择国家/地区',
  onPhoneChange,
  verifyCode,
  onVerifyCodeChange,
  countDown,
  onGetCode,
  getCodeLoading = false,
  submitText = '确定',
  onSubmit,
  submitDisabled,
  submitLoading = false,
  errors = {},
  phonePlaceholder = '请输入手机号',
  verifyCodePlaceholder = '请输入验证码',
  getCodeText = '获取验证码',
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [countryCodeList, setCountryCodeList] = useState<CountryCodeOption[]>([]);

  useEffect(() => {
    if (readOnly) return;
    getCountryCodeListReq()
      .then((res) => {
        const list = (res?.data ?? []) as CountryCodeOption[];
        list.forEach((item) => {
          if (!item.label && item.name) item.label = item.name;
        });
        setCountryCodeList(list);
        if (list.length > 0 && onCountryCodeChange) {
          const has86 = list.some((i) => String(i.value).replace(/^\+/, '') === '86');
          const defaultCode = has86 ? '86' : String(list[0]?.value ?? '86').replace(/^\+/, '');
          onCountryCodeChange(defaultCode);
        }
      })
      .catch(() => {});
  }, [readOnly, onCountryCodeChange]);

  const countryCodeDisplay = `+${String(countryCode).replace(/^\+/, '')}`;
  const getCodeDisabled = countDown > 0 || getCodeLoading;
  const showPicker = !readOnly && countryCodeList.length > 0;

  const handleCountryCodeClick = () => {
    if (showPicker) setPickerVisible(true);
  };

  const handleSelectCountry = (value: string) => {
    onCountryCodeChange?.(String(value).replace(/^\+/, ''));
    setPickerVisible(false);
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.formRow}>
        <div className={`${styles.phoneRow} ${errors?.phone ? styles.inputRowError : ''}`}>
          <div
            className={`${styles.countryCode} ${readOnly ? styles.countryCodeReadOnly : ''}`}
            role={readOnly ? undefined : 'button'}
            tabIndex={readOnly ? undefined : 0}
            onClick={readOnly ? undefined : handleCountryCodeClick}
            onKeyDown={readOnly ? undefined : (e) => e.key === 'Enter' && handleCountryCodeClick()}
          >
            {countryCodeDisplay}
            <ChevronDownSvg className={styles.chevronIcon} />
          </div>
          {readOnly ? (
            <span className={styles.phoneDisplay}>{phone}</span>
          ) : (
            <input
              type="tel"
              className={styles.phoneInput}
              placeholder={phonePlaceholder}
              value={phone}
              onChange={(e) => onPhoneChange?.(e.target.value)}
              maxLength={11}
              autoComplete="tel"
            />
          )}
        </div>
        {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
      </div>

      <div className={styles.formRow}>
        <div className={`${styles.verifyRow} ${errors?.verifyCode ? styles.inputRowError : ''}`}>
          <input
            type="text"
            className={styles.verifyInput}
            placeholder={verifyCodePlaceholder}
            value={verifyCode ?? ''}
            onChange={(e) => onVerifyCodeChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            autoComplete="one-time-code"
          />
          <button
            type="button"
            className={`${styles.getCodeBtn} ${getCodeDisabled ? styles.getCodeBtnDisabled : ''}`}
            onClick={onGetCode}
            disabled={getCodeDisabled}
          >
            {countDown > 0 ? `${countDown}s` : getCodeText}
          </button>
        </div>
        {errors.verifyCode && <div className={styles.errorText}>{errors.verifyCode}</div>}
      </div>

      <button
        type="button"
        className={`${styles.submitBtn} ${submitDisabled || submitLoading ? styles.submitBtnInactive : styles.submitBtnActive}`}
        onClick={onSubmit}
        disabled={submitDisabled || submitLoading}
      >
        {submitText}
      </button>

      {pickerVisible && showPicker && (
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
            <div className={styles.pickerTitle}>{pickerTitle}</div>
            <div className={styles.pickerList}>
              {countryCodeList.map((item) => (
                <div
                  key={item.value}
                  className={styles.pickerItem}
                  onClick={() => handleSelectCountry(String(item.value))}
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

export default PhoneVerifyForm;
