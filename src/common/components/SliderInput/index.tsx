import clsx from 'clsx';

interface SliderInputProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (value: number) => void;
  formatLabel?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

/**
 * 自定义滑动条：track fill + pill thumb 显示当前值。
 * pill 位置用 left/translateX 组合实现两端自动贴边。
 */
const SliderInput = ({
  min,
  max,
  value,
  step = 0.01,
  onChange,
  formatLabel,
  disabled = false,
  className,
}: SliderInputProps) => {
  const range = max - min;
  const pct = range <= 0 ? 100 : ((value - min) / range) * 100;
  const label = formatLabel ? formatLabel(value) : String(value);

  return (
    <div className={clsx('relative flex items-center w-full min-h-[20px]', className)}>
      {/* Track */}
      <div className="absolute inset-x-0 h-[5px] rounded-full overflow-hidden bg-[var(--Background-gradient-30)]">
        <div
          className={clsx(
            'h-full rounded-full transition-[width] duration-0',
            disabled ? 'bg-[var(--ThemeColor-60)]' : 'bg-[var(--ThemeColor-Main)]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Pill thumb */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${pct}%`,
          transform: `translateX(-${pct}%)`,
        }}
      >
        <div
          className={clsx(
            'h-[20px] leading-[20px] px-[7px] whitespace-nowrap',
            'border-[1px] border-solid rounded-full',
            'bg-[var(--Background-300)]',
            '_tf[12] din-pro text-[var(--Text-Main-10)]',
            disabled ? 'border-[var(--Text-800)]' : 'border-[var(--ThemeColor-Main)]',
          )}
        >
          {label}
        </div>
      </div>

      {/* 透明 native input，覆盖全区域负责事件 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        style={{ margin: 0 }}
      />
    </div>
  );
};

export default SliderInput;
