import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  length?: number;
  disabled?: boolean;
  /** 是否仅允许数字，默认 true */
  numericOnly?: boolean;
  /** 校验失败时清空输入 */
  error?: boolean;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
}

export function usePinput({
  length = 6,
  disabled = false,
  numericOnly = true,
  error = false,
  onChange,
  onComplete,
}: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const clear = useCallback(() => {
    setValue('');
    focus();
  }, [focus]);

  useEffect(() => {
    if (error) {
      clear();
    }
  }, [error, clear]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      let val = numericOnly ? e.target.value.replace(/\D/g, '') : e.target.value;

      if (val.length > length) {
        val = val.slice(0, length);
      }

      setValue(val);
      onChange?.(val);

      if (val.length === length) {
        onComplete?.(val);
      }
    },
    [length, numericOnly, onChange, onComplete, disabled],
  );

  return {
    value,
    inputRef,
    focus,
    handleChange,
    clear,
  };
}
