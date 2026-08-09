const StatDividerAbsolute = () => (
  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1px h-14px self-center shadow-[0.5px_0_0_0_var(--Line-200)_inset]" />
);

const StatDivider = () => (
  <div className="shrink-0 w-1px h-14px self-center shadow-[0.5px_0_0_0_var(--Line-200)_inset]" />
);

export { StatDivider, StatDividerAbsolute };
