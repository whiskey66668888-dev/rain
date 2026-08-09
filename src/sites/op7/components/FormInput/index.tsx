import React, { useState } from 'react';

import styles from './FormInput.module.scss';

export interface FormInputProps {
  type?: 'text' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  showError?: boolean;
  variant?: 'default' | 'light';
  rightSlot?: React.ReactNode;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  showError = true,
  variant = 'default',
  rightSlot,
  maxLength,
  autoComplete,
  inputMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleClear = (): void => {
    onChange('');
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };
  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputContainer}>
        <input
          type={inputType}
          className={`${styles.input} ${variant === 'light' ? styles.inputLight : ''} ${error ? styles.error : ''} ${rightSlot ? styles.inputWithRightSlot : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
        />
        {value && (
          <button
            type="button"
            className={`${styles.clearButton} ${!isPassword && !rightSlot ? styles.clearButtonRight : ''} ${rightSlot && isPassword ? styles.clearButtonWithRightSlot : ''} ${variant === 'light' ? styles.clearButtonLight : ''}`}
            onClick={handleClear}
            aria-label="清除"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {isPassword && (
          <div className={rightSlot ? styles.rightSide : styles.eyeButtonWrap}>
            <button
              type="button"
              className={styles.eyeButton}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <img src="/images/common/login/eye.svg" alt="" width="15" height="12" />
              ) : (
                <img src="/images/common/login/close-eye.svg" alt="" width="15" height="15" />
              )}
            </button>
            {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
          </div>
        )}
        {!isPassword && rightSlot && (
          <div className={styles.rightSide}>
            <div className={styles.rightSlot}>{rightSlot}</div>
          </div>
        )}
      </div>
      {error && showError && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default FormInput;
