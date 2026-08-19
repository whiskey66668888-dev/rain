import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { EBetHistoryQueryType, EVenue } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { settledTabs } from '@/common/hooks/betHistory/constants';
import {
  buildQuickDateRangeTabs,
  EDateRangeType,
  last30DaysRange,
  last7DaysRange,
  todayRange,
  yeastodayRange,
  type TDateRange,
} from '@/utils/dateHelper';
import FilterTypeGroup from './FilterTypeGroup';
import Button from '@/common/components/Button';
import Overlay from '@/common/components/Overlay';
import { Calendar } from 'antd-mobile';
import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/common/components/SegmentedControl';

const QUICK_DATE_TYPES = [
  EDateRangeType.TODAY,
  EDateRangeType.YESTERDAY,
  EDateRangeType.LAST_7_DAYS,
  EDateRangeType.LAST_30_DAYS,
];

const SettledSubFilter = () => {
  const { t } = useTranslation();
  const { activeVenue, queryParams } = useBetHistoryContext();
  const { changeQueryType, changeDate } = useBetHistoryBaseMethods();
  const [tempRange, setTempRange] = useState<TDateRange>([new Date(), new Date()]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (queryParams?.startTime && queryParams.endTime) {
      setTempRange([dayjs(queryParams.startTime).toDate(), dayjs(queryParams.endTime).toDate()]);
    }
  }, [queryParams]);

  const handleTypeChange = useCallback(
    (type: EBetHistoryQueryType) => {
      if (queryParams?.queryType === type) {
        changeQueryType({ activeVenue, queryType: EBetHistoryQueryType.SETTLED });
      } else {
        changeQueryType({ activeVenue, queryType: type });
      }
    },
    [activeVenue, changeQueryType, queryParams?.queryType],
  );

  const handleQuickDateChange = (type: EDateRangeType) => {
    let range = todayRange();
    switch (type) {
      case EDateRangeType.TODAY:
        range = todayRange();
        break;
      case EDateRangeType.YESTERDAY:
        range = yeastodayRange();
        break;
      case EDateRangeType.LAST_7_DAYS:
        range = last7DaysRange();
        break;
      case EDateRangeType.LAST_30_DAYS:
        range = last30DaysRange();
        break;

      default:
        break;
    }
    changeDate(activeVenue, range);
  };

  const handleConfirm = useCallback(() => {
    setShowCalendar(false);
    changeDate(activeVenue, tempRange);
  }, [activeVenue, changeDate, tempRange]);

  const quickList = useMemo(() => {
    return buildQuickDateRangeTabs(QUICK_DATE_TYPES);
  }, []);

  const quickDateValue = useMemo(() => {
    return quickList.find((quick) => {
      return (
        dayjs(quick.range[0]).isSame(queryParams?.startTime, 'day') &&
        dayjs(quick.range[1]).isSame(queryParams?.endTime, 'day')
      );
    })?.rangeType;
  }, [queryParams?.endTime, queryParams?.startTime, quickList]);

  return (
    <div className="shrink-0 h-32px flex items-center gap-12px">
      {/* 冠军 / 提前结算筛选依赖 FB 接口参数，OB 场馆不提供 */}
      {activeVenue === EVenue.FB && (
        <FilterTypeGroup
          options={settledTabs}
          value={queryParams?.queryType}
          onChange={handleTypeChange}
        />
      )}
      <div className="flex-1 flex justify-between">
        <div className="flex">
          <SegmentedControl
            options={quickList.map((i) => ({
              label: t(i.name),
              value: i.rangeType,
            }))}
            value={quickDateValue as unknown as number}
            onChange={handleQuickDateChange}
            className="shrink-0 h-32px self-start bg-[var(--Background-300)] w-[210px]"
          />
        </div>
        <button
          className="flex items-center justify-between bg-[var(--Background-300)] rounded-full w-[240px] px-10px"
          onClick={() => setShowCalendar(true)}
        >
          <p className="_tf[12] font-medium din-pro text-[var(--Text-800)]">
            {dayjs(tempRange?.[0]).format('YYYY/MM/DD')}～
            {dayjs(tempRange?.[1]).format('YYYY/MM/DD')}
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14px h-14px"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M9.91699 2.33317H12.2503C12.405 2.33317 12.5534 2.39463 12.6628 2.50402C12.7722 2.61342 12.8337 2.76179 12.8337 2.9165V12.2498C12.8337 12.4045 12.7722 12.5529 12.6628 12.6623C12.5534 12.7717 12.405 12.8332 12.2503 12.8332H1.75033C1.59562 12.8332 1.44724 12.7717 1.33785 12.6623C1.22845 12.5529 1.16699 12.4045 1.16699 12.2498V2.9165C1.16699 2.76179 1.22845 2.61342 1.33785 2.50402C1.44724 2.39463 1.59562 2.33317 1.75033 2.33317H4.08366V1.1665H5.25033V2.33317H8.75033V1.1665H9.91699V2.33317ZM8.75033 3.49984H5.25033V4.6665H4.08366V3.49984H2.33366V5.83317H11.667V3.49984H9.91699V4.6665H8.75033V3.49984ZM11.667 6.99984H2.33366V11.6665H11.667V6.99984Z"
              fill="var(--Text-800)"
            />
          </svg>
        </button>
      </div>
      <Button
        size="middle"
        className="shrink-0 w-[80px]"
        onClick={() => changeDate(activeVenue, tempRange)}
      >
        搜索
      </Button>
      <Overlay
        show={showCalendar}
        bodyClassname="bg-[var(--Background-300)] p-20px rounded-16px w-400px"
        close={() => setShowCalendar(false)}
      >
        <Calendar
          className={clsx('antd-mobile-calendar-custom')}
          selectionMode="range"
          value={tempRange}
          onChange={(val) => {
            if (!val || !val[0] || !val[1]) return;
            setTempRange([val[0], val[1]]);
          }}
          min={dayjs().subtract(29, 'day').toDate()}
          max={new Date()}
        />
        <Button className="w-full" onClick={handleConfirm}>
          确定
        </Button>
      </Overlay>
    </div>
  );
};

export default SettledSubFilter;
