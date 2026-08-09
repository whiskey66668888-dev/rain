import clsx from 'clsx';

export type MineGridItem = {
  label: string;
  icon: string;
  onClick: () => void;
  /** 消息中心等：未读红点 */
  showDot?: boolean;
};

type MineFeatureGridProps = {
  items: MineGridItem[];
};

export function MineFeatureGrid({ items }: MineFeatureGridProps) {
  return (
    <div className="rounded-16px">
      <div className="grid grid-cols-4 gap-24px px-18px">
        {items.map(({ label, icon, onClick, showDot }) => (
          <button
            key={label}
            type="button"
            className="flex flex-col items-center gap-8px active:opacity-85"
            onClick={onClick}
          >
            <div
              className={clsx(
                'relative flex h-40px w-40px shrink-0 items-center justify-center rounded-full',
                'bg-[var(--Background-gradient-10)]',
              )}
            >
              <img src={icon} alt="" className="h-24px w-24px object-contain" />
              {showDot ? (
                <span className="absolute right-5px top-5px h-6px w-6px rounded-full bg-[#FF4D4F]" />
              ) : null}
            </div>
            <span className="max-w-full truncate px-2px text-center _tf[12] leading-[1.3] text-[var(--Text-900)]">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
