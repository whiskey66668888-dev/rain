import React, { useState, ChangeEvent } from 'react';
import styles from './index.module.scss';
import clsx from 'clsx';

interface TextAreaComponentProps {
  maxLength?: number;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  className?: string;
}

const TextAreaComponent: React.FC<TextAreaComponentProps> = ({
  maxLength = 300,
  placeholder = '欢迎留下您的改进建议（选填）',
  value: externalValue,
  onChange: externalOnChange,
  rows = 6,
  className,
}) => {
  const [internalValue, setInternalValue] = useState('');

  const value = externalValue !== undefined ? externalValue : internalValue;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // const newValue = e.target.value.replace(/\s/g, '');
    if (newValue.length <= maxLength) {
      if (externalOnChange) {
        externalOnChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  return (
    <div className={clsx(styles.textAreaWrapper, className)}>
      <textarea
        className={styles.textArea}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        rows={rows}
        maxLength={maxLength}
      />
      <div className={styles.counter}>
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export default TextAreaComponent;
