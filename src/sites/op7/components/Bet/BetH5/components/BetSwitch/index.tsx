import clsx from 'clsx';

export interface BetSwitchOption {
  label: string;
  count?: number;
}

interface BetSwitchProps {
  options: BetSwitchOption[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

const BetSwitch = ({ options, activeIndex, onChange, className }: BetSwitchProps) => {
  return (
    <div className={clsx('h-46px flex items-center gap-16px', className)}>
      {options.map((opt, index) => {
        const isActive = activeIndex === index;
        return (
          <div
            key={index}
            className={clsx('flex items-center gap-4px select-none')}
            onClick={() => !isActive && onChange(index)}
          >
            <p
              className={clsx('_tf[17] font-500 leading-[1]', {
                'text-[var(--White-100)]': isActive,
                'text-[var(--White-60)]': !isActive,
              })}
            >
              {opt.label}
            </p>
            <span
              className={clsx(
                'flex items-center justify-center min-w-16px h-16px px-4px rounded-full _tf[12] font-500 leading-[1] din-pro',
                {
                  'bg-[var(--White-20)] text-[var(--White-100)]': isActive,
                  'bg-[var(--Red-300)] text-[var(--White-100)]': !isActive,
                },
              )}
            >
              {opt.count ?? 0}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BetSwitch;
