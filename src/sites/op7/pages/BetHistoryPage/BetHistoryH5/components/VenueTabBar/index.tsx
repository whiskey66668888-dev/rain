import clsx from 'clsx';
import { Fragment, useCallback } from 'react';
import { BET_HISTORY_VENUE_TAB_LIST } from '../../../../../../../common/hooks/betHistory/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { EBetHistoryTab, EVenue } from '@/apis/commonSports/constants';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import DateRangePicker from '@/common/components/DateRangePicker';
import { t } from 'i18next';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import { EDateRangeType } from '@/utils/dateHelper';
import dayjs from 'dayjs';

const VenueTabBar = () => {
  const { activeVenue, activeTab, queryParams } = useBetHistoryContext();
  const { changeActiveVenue, changeDate } = useBetHistoryBaseMethods();
  const navigate = useNavigateWithLanguage();

  const tabClick = useCallback(
    (venue?: EVenue) => {
      if (venue === activeVenue) return;
      if (venue) {
        changeActiveVenue(venue);
      } else {
        navigate(PATHS.allBettingRecord);
      }
    },
    [activeVenue, changeActiveVenue, navigate],
  );

  return (
    <div className="flex items-center justify-center relative">
      {BET_HISTORY_VENUE_TAB_LIST.map((tab, idx) => {
        const isActive = activeVenue === tab.venue;
        return (
          <Fragment key={tab.key}>
            {idx > 0 && (
              <div className="w-1px h-14px self-center shadow-[0.5px_0_0_0_var(--Line-200)_inset]" />
            )}
            <button
              onClick={() => tabClick(tab.venue)}
              className="relative flex items-center h-[44px] px-16px"
            >
              <div
                className={clsx(
                  '_tf[14] font-400',
                  isActive
                    ? 'text-[var(--ThemeColor-Main)] font-500'
                    : 'text-[var(--Text-Main-10)]',
                )}
              >
                {tab.label}
              </div>
              <div
                className={clsx(
                  'absolute bottom-[0] left-[50%] translate-x-[-50%] h-2px w-28px transition-opacity duration-200',
                  isActive ? 'bg-[var(--ThemeColor-Main)] opacity-100' : 'opacity-0',
                )}
              />
            </button>
          </Fragment>
        );
      })}

      {activeTab === EBetHistoryTab.SETTLED && (
        <div className="absolute right-0px top-[50%] translate-y-[-50%]">
          <DateRangePicker
            value={
              queryParams?.startTime && queryParams?.endTime
                ? [new Date(queryParams.startTime), new Date(queryParams.endTime)]
                : null
            }
            onChange={(dateRange) => changeDate(activeVenue, dateRange)}
            className={clsx(
              'flex-1 flex gap-4px items-center justify-center',
              'bg-[var(--Background-300)] rounded-full',
              'px-12px py-6px',
            )}
            quickDateRangeTypes={[
              EDateRangeType.TODAY,
              EDateRangeType.YESTERDAY,
              EDateRangeType.LAST_7_DAYS,
              EDateRangeType.LAST_WEEK,
              EDateRangeType.LAST_30_DAYS,
            ]}
            min={dayjs().subtract(29, 'day').toDate()}
            text="当前系统支持查询最近30天的投注记录"
          >
            {(label, open) => (
              <>
                <div className="_tf[14] font-medium leading-[1.14] text-[var(--Text-Main-10)]">
                  {t(label)}
                </div>
                <ArrowLeftSvg
                  className={clsx(
                    'w-12px h-12px text-[var(--Text-Main-10)]',
                    'transition-transform duration-200',
                    open ? 'rotate-90' : 'rotate-270',
                  )}
                />
              </>
            )}
          </DateRangePicker>
        </div>
      )}
    </div>
  );
};

export default VenueTabBar;
