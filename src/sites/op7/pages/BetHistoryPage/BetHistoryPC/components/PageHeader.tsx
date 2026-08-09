const PageHeader = () => (
  <div className="flex items-center gap-28px h-48px px-20px shrink-0  bg-[var(--Background-300)]">
    <div className="w-63px h-24px bg-[url(/images/light/logo.png)] dt:bg-[url(/images/dark/logo.png)] bg-cover bg-no-repeat" />
    <span className="_tf[14] leading-[1.43] font-semibold text-[var(--Text-Main-10)]">
      注单历史
    </span>
  </div>
);

export default PageHeader;
