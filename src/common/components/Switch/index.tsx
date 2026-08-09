import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';

export interface SwitchProps {
  /** 是否选中（开） */
  checked: boolean;
  /** 切换回调 */
  onChange?: (checked: boolean) => void;
  /** 禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  height?: number;
  width?: number;
  padding?: number;
  hasBtnText?: boolean; // 是否显示按钮文字
}

const Switch = ({
  checked,
  onChange,
  disabled,
  className,
  height = 24,
  width = 46,
  padding = 2,
  hasBtnText = false,
}: SwitchProps) => {
  const thumbSize = useMemo(() => {
    return height - padding * 2;
  }, [height, padding]);

  const thumbTravel = useMemo(() => {
    return width - padding * 2 - thumbSize;
  }, [width, padding, thumbSize]);

  const handleClick = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  }, [disabled, onChange, checked]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={clsx(
        'relative inline-flex shrink-0 items-center overflow-hidden rounded-full transition-background-color duration-200',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'cursor-pointer',
        checked ? 'bg-[var(--ThemeColor-Main)]' : 'bg-[var(--Button-300)]',
        className,
      )}
      style={{ width, height, padding }}
    >
      <span
        className={clsx(
          'pointer-events-none absolute select-none text-12px leading-none text-[var(--White-100)] transition-all duration-200',
          checked ? 'left-7px' : 'right-7px',
        )}
        aria-hidden
      >
        {hasBtnText && (checked ? '开' : '关')}
      </span>
      <motion.span
        className="h-full aspect-square shrink-0 rounded-full bg-[var(--White-100)]"
        animate={{ x: checked ? thumbTravel : 0 }}
        transition={{
          type: 'spring',
          stiffness: 400, // 刚度：越大弹簧越硬、回弹越快
          damping: 30, // 阻尼：越大摆动越少、越快停下
        }}
        aria-hidden
      />
    </button>
  );
};

export default Switch;
