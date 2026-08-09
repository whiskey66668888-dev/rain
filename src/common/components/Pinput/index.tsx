import React, { useEffect } from 'react';
import { usePinput } from './hooks';
import styles from './index.module.scss';

interface Props {
  length?: number;
  isPassword?: boolean;
  disabled?: boolean;
  onComplete?: (code: string) => void;
}

const Pinput: React.FC<Props> = ({
  length = 6,
  isPassword = false,
  disabled = false,
  onComplete,
}) => {
  const { value, inputRef, focus, handleChange } = usePinput({ length, disabled, onComplete });

  useEffect(() => {
    focus();
  }, [focus]);

  return (
    <div className={styles.wrapper} onClick={focus}>
      {/* 真正输入框（隐藏） */}
      <input
        ref={inputRef}
        type={isPassword ? 'password' : 'tel'}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="one-time-code" // ✅ iOS 自动填充
        className={styles.hiddenInput}
        value={value}
        onChange={handleChange}
      />

      {/* UI 展示格子 */}
      <div className={styles.boxContainer}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i] || '';
          const isActive = i === value.length;

          return (
            <div key={i} className={`${styles.box} ${isActive ? styles.active : ''}`}>
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
