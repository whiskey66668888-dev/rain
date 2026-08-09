import clsx from 'clsx';

const QUICK_AMOUNTS = ['100', '200', '500', '1000', '5000', 'MAX'] as const;

export type TQuickAmountKeys = (typeof QUICK_AMOUNTS)[number];
interface TProps {
  onSelect: (value: TQuickAmountKeys) => void;
  className?: string;
}

const QuickAmount = ({ onSelect, className = '' }: TProps) => {
  return (
    <div className={clsx(`grid grid-cols-3 gap-4px`, className)} aria-label="快捷金额">
      {QUICK_AMOUNTS.map((item) => (
        <button
          key={item}
          type="button"
          className={clsx(
            'h-30px rounded-4px border-none bg-[var(--Background-300)] _tf[14] font-500 din-pro',
            'can-hover:[&:not(:active)]:hover:bg-[var(--ThemeColor-15)] active:bg-[var(--ThemeColor-Main)] active:text-[var(--White-100)]',
            item === 'MAX'
              ? 'text-[var(--Red-300)]'
              : 'text-[var(--Text-Main-10)] can-hover:[&:not(:active)]:hover:text-[var(--ThemeColor-Main)]',
          )}
          onClick={() => onSelect(item)}
        >
          {item === 'MAX' ? 'MAX' : `+${item}`}
        </button>
      ))}
    </div>
  );
};

export default QuickAmount;
