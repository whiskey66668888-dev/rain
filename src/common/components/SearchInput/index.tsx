import React, { useMemo } from 'react';
import Icon from '@/common/components/Icon';
import { ThemeMode } from '@/core/store/slices/configSlice';
import LazyImage from '@/common/components/LazyImage';

import { useAppSelector } from '@/core/store/hooks';

import styles from './index.module.scss';

export interface InputProps {
  type?: 'text' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  className?: string;
  inputClassName?: string;
  iconSize?: string;
  iconColor?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onKeyDown,
  onFocus,
  className,
  inputClassName,
  iconSize = '20px',
  iconColor = 'var(--Text-800)',
}) => {
  const themeMode = useAppSelector((state) => state.config.system.themeMode) ?? 'light';
  const theme = useMemo<ThemeMode>(() => {
    if (themeMode !== 'system') return themeMode;
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }, [themeMode]);

  const handleClear = (): void => {
    onChange('');
    onFocus?.();
  };

  return (
    <div className={[styles.inputContainer, className].filter(Boolean).join(' ')}>
      <Icon src="/images/common/ic_search.svg" size={iconSize} color={iconColor} />
      <input
        className={[styles.input, inputClassName].filter(Boolean).join(' ')}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label={'\u6e05\u9664'}
        >
          <LazyImage lazy={false} src={`/images/${theme}/bn_close.svg`} width={20} height={20} />
        </button>
      )}
    </div>
  );
};

export default Input;
