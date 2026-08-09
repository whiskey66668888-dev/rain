import { useState, useRef, useCallback } from 'react';

interface Props {
  length?: number;
  disabled?: boolean;
  onComplete?: (code: string) => void;
}

export function usePinput({ length = 6, disabled = false, onComplete }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      let val = e.target.value.replace(/\D/g, '');

      if (val.length > length) {
        val = val.slice(0, length);
      }

      setValue(val);

      if (val.length === length) {
        onComplete?.(val);
      }
    },
    [length, onComplete, disabled],
  );

  const clear = () => {
    setValue('');
    focus();
  };

  return {
    value,
    inputRef,
    focus,
    handleChange,
    clear,
  };
}
