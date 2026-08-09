import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
// Icon
import Icon from '@/common/components/Icon';

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
  allowClear?: boolean;
  showLimitWord?: boolean;
  autoComplete?: string;
  allowPaste?: boolean;
}

/**
 *  输入框
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
  allowClear = false,
  showLimitWord = false,
  autoComplete,
  allowPaste = false,
}) => {
  const [pasteVisible, setPasteVisible] = useState(false);

  useEffect(() => {
    if (allowPaste) {
      // 检查粘贴板功能
      checkClipboard();
    } else {
      setPasteVisible(false);
    }
  }, [allowPaste]);

  // 检查粘贴板功能
  const checkClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPasteVisible(true);
      } else {
        setPasteVisible(false);
      }
    } catch (err) {
      console.warn('粘贴失败', err);
      setPasteVisible(false);
    }
  };

  const onPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && onChange) {
        onChange(text);
      }
    } catch (err) {
      console.warn('粘贴失败', err);
    }
  };

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
        autoComplete={autoComplete}
        onChange={(e) => onChange && onChange(e.target.value)}
        maxLength={maxLength}
      />
    );
  };

  const renderSuffix = () => {
    const hasSuffix = suffix || (allowClear && value.length) || (allowPaste && pasteVisible);

    if (!hasSuffix) return null;

    return (
      <span className={styles.suffix}>
        {suffix}
        {allowClear && value.length ? (
          <div
            className={styles.bnClear}
            onClick={() => {
              if (onChange) {
                onChange('');
              }
            }}
          >
            <Icon src="/images/common/close.svg" size={12} color="var(--Text-Main-10)" />
          </div>
        ) : null}

        {allowPaste && pasteVisible ? (
          <span
            className={styles.paste}
            onClick={() => {
              onPaste();
            }}
          >
            粘贴
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <div className={clsx(styles.inputWrapper, className)}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <div className={styles.inputBox}>
        {renderContent()}
        {showLimitWord && maxLength && (
          <span className={styles.limitWord}>{`${value.length}/${maxLength}`}</span>
        )}
      </div>
      {renderSuffix()}
    </div>
  );
};

export default Input;
