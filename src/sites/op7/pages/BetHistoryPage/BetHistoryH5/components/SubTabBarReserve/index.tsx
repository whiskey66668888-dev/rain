import clsx from 'clsx';
import { reserveTabs } from '@/common/hooks/betHistory/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { bigNB } from '@/utils/bet/bigMath';
import { EBetHistoryQueryType } from '@/apis/commonSports/constants';

const SubTabBarReserve = () => {
  const { activeVenue, queryParams, stats } = useBetHistoryContext();
  const { changeQueryType } = useBetHistoryBaseMethods();
  const queryType = queryParams?.queryType;

  return (
    <>
      <div className="flex items-center h-34px">
        {reserveTabs.map((tab, i) => {
          const isActive = queryType === tab.value;
          return (
            <button
              key={tab.value}
              className="relative flex-1 flex items-center justify-center h-full"
              onClick={() =>
                changeQueryType({
                  activeVenue,
                  queryType: tab.value,
                })
              }
            >
              {i > 0 && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[0.5px] h-14px bg-[var(--Red-100)]" />
              )}
              <span
                className={clsx(
                  'text-14px leading-20px',
                  isActive
                    ? 'font-600 text-[var(--ThemeColor-Main)]'
                    : 'font-400 text-[var(--Text-800)]',
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32px h-2px rounded-full bg-[var(--ThemeColor-Main)]" />
              )}
            </button>
          );
        })}
      </div>
      {queryType === EBetHistoryQueryType.RESERVE_IN_PROGRESS && (
        <div
          className={clsx(
            'border-t-1px border-t-solid border-color-[var(--Background-700)]',
            'px-10px flex items-center gap-8px py-8px _tf[12] leading-[1.33]',
            'text-[var(--Text-800)]',
          )}
        >
          <p>预约{stats.totalOrderCount}单</p>
          <div className="w-1px h-14px bg-[var(--Line-200)]" />
          <p>
            总预约金额:<span className="din-pro">{bigNB(stats.totalBetAmount).toFixed(2)}</span>
          </p>
        </div>
      )}
    </>
  );
};

export default SubTabBarReserve;
