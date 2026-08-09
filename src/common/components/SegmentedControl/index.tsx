import { cn } from '@/utils';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SegmentedControlOption<T = string | number> {
  /** 选项值 */
  value: T;
  /** 展示文案或自定义内容 */
  label: React.ReactNode;
}

export interface SegmentedControlProps<T = string | number> {
  /** 选项列表，支持自定义 label */
  options: SegmentedControlOption<T>[];
  /** 当前选中值 */
  value: T;
  /** 切换回调 */
  onChange?: (value: T) => void;
  /** 禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 高度（与 Figma 24 一致） */
  height?: number;
  /** 每个分段按钮的文案样式（不传则默认 `_tf[12]`） */
  tabButtonClassName?: string;
}

const PADDING = 2;
const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
} as const;

/**
 * 多选一分段控制器，风格与 Switch 一致，使用项目主题变量
 */
function SegmentedControl<T extends string | number = string>({
  options,
  value,
  onChange,
  disabled,
  className,
  height = 24,
  tabButtonClassName,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const thumbX = selectedIndex >= 0 ? selectedIndex * segmentWidth : 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || options.length === 0) return;
    const updateWidth = () => {
      const total = el.offsetWidth;
      if (total > 0) setSegmentWidth((total - PADDING * 2) / options.length);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [options.length, value]);

  const handleClick = useCallback(
    (optionValue: T) => {
      if (!disabled && onChange && optionValue !== value) {
        onChange(optionValue);
      }
    },
    [disabled, onChange, value],
  );

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-disabled={disabled}
      className={cn(
        'relative inline-flex items-center rounded-full',
        'bg-[var(--Background-700)]',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'cursor-pointer',
        className,
      )}
      style={{ padding: PADDING, height: height + PADDING * 2 }}
    >
      {segmentWidth > 0 && (
        <motion.span
          className={cn(
            'absolute z-0 rounded-full bg-[var(--ThemeColor-Main)]',
            selectedIndex < 0 && 'hidden',
          )}
          style={{
            width: segmentWidth,
            height,
            top: PADDING,
            left: PADDING,
          }}
          initial={false}
          animate={{ x: thumbX }}
          transition={springTransition}
          aria-hidden
        />
      )}
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => handleClick(opt.value)}
            className={cn(
              'relative z-1 flex flex-1 items-center justify-center gap-3px rounded-full px-12px min-w-51px truncate',
              'min-h-0 bg-transparent',
              tabButtonClassName ?? '_tf[12]',
              isSelected
                ? 'font-semibold text-[var(--White-100)]'
                : 'text-[var(--un-selected-color,var(--Text-800))]',
              disabled && 'cursor-not-allowed',
              !disabled && 'cursor-pointer',
            )}
            style={{ height }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
