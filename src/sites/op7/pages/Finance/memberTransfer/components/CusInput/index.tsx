import React, { useEffect } from 'react';
import clsx from 'clsx';
import { usePinput } from './hooks';
import styles from './index.module.scss';

interface Props {
  length?: number;
  isPassword?: boolean;
  disabled?: boolean;
  /** 是否仅允许数字，默认 true */
  numericOnly?: boolean;
  /** 校验失败时清空输入 */
  error?: boolean;
  className?: string;
  containerClassName?: string;
  cellClassName?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
}

const Pinput: React.FC<Props> = ({
  length = 6,
  isPassword = false,
  disabled = false,
  numericOnly = true,
  error = false,
  className,
  containerClassName,
  cellClassName,
  onChange,
  onComplete,
}) => {
  const { value, inputRef, focus, handleChange } = usePinput({
    length,
    disabled,
    numericOnly,
    error,
    onChange,
    onComplete,
  });

  useEffect(() => {
    focus();
  }, [focus]);

  return (
    <div className={clsx(styles.wrapper, className)} onClick={focus}>
      <input
        ref={inputRef}
        type={isPassword ? 'password' : numericOnly ? 'tel' : 'text'}
        disabled={disabled}
        inputMode={numericOnly ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        className={styles.hiddenInput}
        value={value}
        onChange={handleChange}
      />

      <div className={clsx(styles.boxContainer, containerClassName)}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i] || '';
          const isActive = i === value.length;

          return (
            <div
              key={i}
              className={clsx(
                styles.box,
                cellClassName,
                isActive && styles.active,
                error && styles.error,
              )}
            >
              {isPassword && char ? '●' : char}
              {isActive && <span className={styles.cursor} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pinput;
