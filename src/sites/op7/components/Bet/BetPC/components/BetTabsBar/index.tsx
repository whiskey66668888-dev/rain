import clsx from 'clsx';
import {
  shallowEqual,
  useBettingDataSelector,
} from '@/common/hooks/bet/context/BettingDataContext';
import type { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { memo, useMemo } from 'react';

const BetTabsBar = () => {
  const { singleCount, parlayCount, isParlay, isChatBet } = useBettingDataSelector(
    (state: TUseVenueBetData) => ({
      singleCount: state.singleBetData.ids.length,
      parlayCount: state.parlayBetData.ids.length,
      isParlay: state.isParlay,
      isChatBet: state.isChatBet,
    }),
    shallowEqual,
  );
  const { switchParlay, switchSingle } = useBetMethods();

  const tabs = useMemo(() => {
    const singleTab = {
      label: '单关',
      count: singleCount,
      active: !isParlay,
      onClick: switchSingle,
    };
    if (isChatBet) return [singleTab];
    return [
      singleTab,
      {
        label: '串关',
        count: parlayCount,
        active: isParlay,
        onClick: switchParlay,
      },
    ];
  }, [singleCount, parlayCount, isParlay, isChatBet, switchSingle, switchParlay]);

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

export default memo(BetTabsBar);
