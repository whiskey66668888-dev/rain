import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { BET_HISTORY_VENUE_TAB_LIST } from '@/common/hooks/betHistory/constants';

const PageHeader = () => {
  const { activeVenue } = useBetHistoryContext();
  // 弹窗只展示单个场馆的注单，且跟随主窗口切换，标出当前场馆避免误读（OB 对外文案为 EB）
  const venueLabel = BET_HISTORY_VENUE_TAB_LIST.find((tab) => tab.venue === activeVenue)?.label;

  return (
    <div className="flex items-center gap-28px h-48px px-20px shrink-0  bg-[var(--Background-300)]">
      <div className="w-63px h-24px bg-[url(/images/light/logo.png)] dt:bg-[url(/images/dark/logo.png)] bg-cover bg-no-repeat" />
      <div className="flex items-center gap-8px">
        <span className="_tf[14] leading-[1.43] font-semibold text-[var(--Text-Main-10)]">
          注单历史
        </span>
        {!!venueLabel && (
          <span className="_tf[12] leading-[1.33] px-8px py-2px rounded-full bg-[var(--ThemeColor-20)] text-[var(--ThemeColor-Main)]">
            {venueLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
