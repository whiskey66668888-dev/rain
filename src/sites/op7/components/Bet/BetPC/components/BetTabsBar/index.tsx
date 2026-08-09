import clsx from 'clsx';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { useMemo } from 'react';

const BetTabsBar = () => {
  const { singleBetData, parlayBetData, isParlay, isChatBet } = useBettingData();
  const { switchParlay, switchSingle } = useBetMethods();

  const tabs = useMemo(() => {
    const singleTab = {
      label: '单关',
      count: singleBetData.ids.length,
      active: !isParlay,
      onClick: switchSingle,
    };
    if (isChatBet) return [singleTab];
    return [
      singleTab,
      {
        label: '串关',
        count: parlayBetData.ids.length,
        active: isParlay,
        onClick: switchParlay,
      },
    ];
  }, [
    singleBetData.ids.length,
    parlayBetData.ids.length,
    isParlay,
    isChatBet,
    switchSingle,
    switchParlay,
  ]);

  return (
    <div data-desc="投注单导航栏" className="shrink-0 px-12px py-8px">
      <div className="flex rounded-4px overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={tab.active ? undefined : tab.onClick}
            className={clsx('flex flex-1 items-center justify-center gap-4px h-30px', {
              'bg-[var(--ThemeColor-Main)] pointer-events-none': tab.active,
              'bg-[var(--Background-500)] ': !tab.active,
            })}
          >
            <span
              className={clsx('_tf[12]', {
                'text-[var(--White-100)] font-medium': tab.active,
                'text-[var(--Text-800)]': !tab.active,
              })}
            >
              {tab.label}
            </span>
            <span
              className={clsx(
                'flex items-center justify-center min-w-14px h-14px px-4px',
                'rounded-7px _tf[10] font-medium text-[var(--White-100)]',
                {
                  'bg-[var(--White-20)]': tab.active,
                  'bg-[var(--Red-300)]': !tab.active,
                },
              )}
            >
              <i className="not-italic -translate-y-0.5px">{tab.count}</i>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BetTabsBar;
