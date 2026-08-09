import { cn } from '@/utils';
import { useEffect, useRef } from 'react';

interface TBetInputProps {
  focused?: boolean;
  placeholder?: string;
  className?: string;
  onClick?: () => void;
  value?: string | number;
  errorInput?: boolean;
  placeholderRight?: boolean;
}

const BetInput = ({
  focused,
  placeholder,
  placeholderRight,
  className,
  onClick,
  value,
  errorInput,
}: TBetInputProps) => {
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused) return;
    const id = setTimeout(() => {
      inputRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, 310);
    return () => clearTimeout(id);
  }, [focused]);

  return (
    <div
      className={cn(
        'flex-1 flex items-center min-h-[24px] pl-[12px] pr-[8px] overflow-hidden',
        'bg-[var(--Background-300)] rounded-[6px] transition-all duration-200',
        'border-[0.5px] border-solid',
        { 'border-color-[var(--ThemeColor-Main)]': !errorInput },
        { 'border-color-[var(--Red-400)]': errorInput },
        className,
      )}
      onClick={onClick}
      ref={inputRef}
    >
      <div className="flex-1 flex items-center overflow-hidden">
        <span className="overflow-hidden whitespace-nowrap _tf[14] font-medium din-pro text-[var(--Text-Main-10)]">
          {value}
        </span>
        {focused && (
          <span className="flex-shrink-0 w-2px h-20px bg-[var(--ThemeColor-Main)] animate-blink" />
        )}
        {!value && !placeholderRight && (
          <div className="_tf[14] font-normal text-[var(--Text-500)] din-pro pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      {!value && !!placeholderRight && (
        <div className="_tf[14] font-normal text-[var(--Text-500)] din-pro pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default BetInput;
