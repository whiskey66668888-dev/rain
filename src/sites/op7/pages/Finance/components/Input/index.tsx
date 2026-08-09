import React from 'react';
import clsx from 'clsx';

// styles
import styles from './index.module.scss';

interface InputProps {
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  value: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  type?: string;
  rows?: number;
  maxLength?: number;
  showLimitWord?: boolean;
  /** 有内容时显示清除按钮（与登录页 FormInput 一致） */
  allowClear?: boolean;
}

/**
 * 钱包 输入框
 */
const Input: React.FC<InputProps> = ({
  className,
  prefix,
  suffix,
  value,
  placeholder,
  onChange,
  type = 'text',
  rows,
  maxLength,
  showLimitWord = false,
  allowClear = false,
}) => {
  const renderContent = () => {
    if (type === 'textarea') {
      return (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          maxLength={maxLength}
          rows={rows}
        ></textarea>
      );
    }

    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        maxLength={maxLength}
      />
    );
  };

  const showClear = allowClear && Boolean(value);

  return (
    <div className={clsx(styles.inputWrapper, className)}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <div
        className={clsx(
          styles.inputBox,
          showClear && styles.inputBoxWithClear,
          type === 'textarea' && showClear && styles.inputBoxWithClearTextarea,
        )}
      >
        {renderContent()}
        {showClear && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onChange?.('')}
            aria-label="清除"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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
        {showLimitWord && maxLength && (
          <span className={styles.limitWord}>{`${value.length}/${maxLength}`}</span>
        )}
      </div>
      {suffix}
    </div>
  );
};

export default Input;
