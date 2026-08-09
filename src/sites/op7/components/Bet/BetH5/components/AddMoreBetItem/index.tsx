import { memo } from 'react';
import { cn } from '@/utils';

const AddMoreBetItem = ({ className, onClick }: { className?: string; onClick?: () => void }) => {
  return (
    <div className={cn('flex flex-shrink-0', className)}>
      <button
        type="button"
        className={cn(
          'border-none outline-none flex-1 flex gap-8px items-center justify-center',
          'bg-[var(--ThemeColor-Main)] rounded-full h-40px',
        )}
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 w-14px h-14px text-[var(--White-100)]"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8.33301 2C8.51699 2 8.66682 2.14906 8.66699 2.33301V7.33301H13.667C13.8509 7.33318 14 7.48301 14 7.66699V8.33301C14 8.51699 13.8509 8.66584 13.667 8.66602H8.66699V13.667C8.66682 13.8509 8.51699 14 8.33301 14H7.66699C7.48301 14 7.33318 13.8509 7.33301 13.667V8.66602H2.33301C2.14906 8.66584 2 8.51699 2 8.33301V7.66699C2 7.48301 2.14906 7.33318 2.33301 7.33301H7.33301V2.33301C7.33318 2.14906 7.48301 2 7.66699 2H8.33301Z"
            fill="currentColor"
          />
        </svg>
        <span className="_tf[14] font-500 text-[var(--White-100)] leading-[1]">添加赛事</span>
      </button>
    </div>
  );
};

export default memo(AddMoreBetItem);
