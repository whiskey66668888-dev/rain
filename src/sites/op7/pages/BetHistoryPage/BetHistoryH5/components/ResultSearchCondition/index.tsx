import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { CapsuleTabs } from 'antd-mobile';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { ChevronDownSvg, DoubleArrowUpSvg } from '@/sites/op7/components/SvgIcons';
import { PATHS } from '@/sites/op7/routes/paths';
import type { ResultDateRange } from '../../types/resultFilter';

import {
  readResultLeagueFilterStorage,
  type ResultLeagueOption,
  writeResultLeagueFilterStorage,
} from '../../utils/resultLeagueFilterStorage';
import styles from './index.module.scss';

export interface ResultSearchConditionValue {
  dateRange: ResultDateRange;
  sportId: number;
  leagueIds: number[];
  collapsed: boolean;
}

interface ResultSearchConditionProps {
  leagueOptions?: ResultLeagueOption[];
  defaultValue?: Partial<ResultSearchConditionValue>;
  onChange?: (value: ResultSearchConditionValue) => void;
  resultListCollapsed?: boolean;
  onToggleResultListCollapsed?: () => void;
}

type BallItem = {
  label: string;
  id: number;
  sportId: string;
};

/** 赛果筛选球种（本地固定列表，与 App 端一致） */
const RESULT_SPORT_TYPE_LIST: BallItem[] = [
  { label: '足球', id: 1, sportId: '1' },
  { label: '篮球', id: 3, sportId: '3' },
  { label: '网球', id: 5, sportId: '5' },
  { label: '排球', id: 13, sportId: '13' },
  { label: '乒乓球', id: 15, sportId: '15' },
  { label: '冰球', id: 2, sportId: '2' },
  { label: '羽毛球', id: 47, sportId: '47' },
  { label: '电竞足球', id: 177, sportId: '177' },
  { label: '电竞篮球', id: 178, sportId: '178' },
];

type DateShortcut = {
  key: number;
  weekLabel: string;
  dateLabel: string;
  range: ResultDateRange;
};

type ActivePanel = 'date' | 'sport' | null;

const DEFAULT_DATE_RANGE: ResultDateRange = {
  startTime: dayjs().startOf('day').valueOf(),
  endTime: dayjs().endOf('day').valueOf(),
};

export const createDefaultResultSearchConditionValue = (): ResultSearchConditionValue => ({
  dateRange: {
    startTime: dayjs().startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
  },
  sportId: 1,
  leagueIds: [],
  collapsed: true,
});

const WEEKDAY_LABELS = [
  '\u5468\u65e5',
  '\u5468\u4e00',
  '\u5468\u4e8c',
  '\u5468\u4e09',
  '\u5468\u56db',
  '\u5468\u4e94',
  '\u5468\u516d',
] as const;

const formatMonthDayLabel = (value: number) => {
  const date = dayjs(value);
  return `${date.format('MM')}\u6708${date.format('DD')}\u65e5`;
};

const formatDateLabel = (range: ResultDateRange) => {
  const start = dayjs(range.startTime);
  const end = dayjs(range.endTime);

  if (start.isSame(end, 'day')) {
    return formatMonthDayLabel(range.startTime);
  }

  return `${formatMonthDayLabel(range.startTime)}-${formatMonthDayLabel(range.endTime)}`;
};

const ResultSearchCondition = ({
  leagueOptions = [],
  defaultValue,
  onChange,
  resultListCollapsed = false,
  onToggleResultListCollapsed,
}: ResultSearchConditionProps) => {
  const navigate = useNavigateWithLanguage();
  const initialStorage = useMemo(() => readResultLeagueFilterStorage(), []);

  const sportList = RESULT_SPORT_TYPE_LIST;

  const initialSportId = defaultValue?.sportId ?? Number(RESULT_SPORT_TYPE_LIST[0]?.sportId ?? 1);
  const [dateRange, setDateRange] = useState<ResultDateRange>(
    defaultValue?.dateRange ?? DEFAULT_DATE_RANGE,
  );
  const [sportId, setSportId] = useState(initialSportId);
  const [leagueIds, setLeagueIds] = useState<number[]>(defaultValue?.leagueIds ?? []);
  const [activePanel, setActivePanel] = useState<ActivePanel>(
    defaultValue?.collapsed ? null : 'date',
  );
  const [leagueSearchText, setLeagueSearchText] = useState(initialStorage?.searchText ?? '');

  useEffect(() => {
    if (defaultValue?.collapsed) {
      setActivePanel(null);
    }
  }, [defaultValue?.collapsed]);

  const currentSport = useMemo(
    () => sportList.find((item) => Number(item.sportId) === sportId) ?? sportList[0],
    [sportId, sportList],
  );

  const activeSportKey = useMemo(
    () => String(currentSport?.sportId ?? sportList[0]?.sportId ?? '1'),
    [currentSport?.sportId, sportList],
  );

  const leagueLabel = useMemo(() => {
    if (leagueIds.length === 0) return '筛选(全部)';
    if (leagueOptions.length > 0 && leagueIds.length >= leagueOptions.length) {
      return '筛选(全部)';
    }
    return `筛选(${leagueIds.length})`;
  }, [leagueIds, leagueOptions.length]);

  const dateShortcuts = useMemo<DateShortcut[]>(() => {
    const baseDate = dayjs().startOf('day');

    return Array.from({ length: 7 }, (_, index) => {
      const date = baseDate.subtract(index, 'day');
      return {
        key: date.valueOf(),
        weekLabel: WEEKDAY_LABELS[date.day()] ?? '',
        dateLabel: formatMonthDayLabel(date.valueOf()),
        range: {
          startTime: date.startOf('day').valueOf(),
          endTime: date.endOf('day').valueOf(),
        },
      };
    });
  }, []);

  const emitChange = (patch: Partial<ResultSearchConditionValue>) => {
    onChange?.({
      dateRange,
      sportId,
      leagueIds,
      collapsed: activePanel === null,
      ...patch,
    });
  };

  const persistLeagueFilter = (
    patch: Partial<ResultSearchConditionValue> = {},
    nextSearchText = leagueSearchText,
  ) => {
    const nextSportId = patch.sportId ?? sportId;
    const nextLeagueIds = patch.leagueIds ?? leagueIds;
    const nextSportName =
      sportList.find((item) => Number(item.sportId) === nextSportId)?.label ??
      currentSport?.label ??
      '足球';

    writeResultLeagueFilterStorage({
      dateRange: patch.dateRange ?? dateRange,
      sportId: nextSportId,
      sportName: nextSportName,
      mode: nextLeagueIds.length > 0 ? 'partial' : 'all',
      leagueIds: nextLeagueIds,
      leagueOptions: initialStorage?.leagueOptions ?? [],
      searchText: nextSearchText,
      updatedAt: Date.now(),
    });
  };

  const handleSportChange = (nextSportId: number) => {
    setSportId(nextSportId);
    setLeagueIds([]);
    setLeagueSearchText('');
    setActivePanel(null);
    persistLeagueFilter({ sportId: nextSportId, leagueIds: [] }, '');
    emitChange({ sportId: nextSportId, leagueIds: [], collapsed: true });
  };

  const handleSportTabChange = (key: string) => {
    const nextSportId = Number(key);
    if (!Number.isNaN(nextSportId)) {
      handleSportChange(nextSportId);
    }
  };

  const handleDatePanelChange = () => {
    setActivePanel((prev) => {
      const next = prev === 'date' ? null : 'date';
      emitChange({ collapsed: next === null });
      return next;
    });
  };

  const handleSportPanelChange = () => {
    setActivePanel((prev) => {
      const next = prev === 'sport' ? null : 'sport';
      emitChange({ collapsed: next === null });
      return next;
    });
  };

  const handleDateShortcutChange = (range: ResultDateRange) => {
    setDateRange(range);
    setLeagueIds([]);
    setActivePanel(null);
    persistLeagueFilter({ dateRange: range, leagueIds: [] });
    emitChange({ dateRange: range, leagueIds: [], collapsed: true });
  };

  const handleLeagueFilterClick = () => {
    persistLeagueFilter();
    navigate(PATHS.betHistoryH5ResultLeagueFilter);
  };

  return (
    <div className={clsx(styles.resultSearchCondition, 'px-10px')}>
      <div className={styles.filterBar}>
        <button
          type="button"
          className={clsx(styles.cell, activePanel === 'date' && styles.cellActive)}
          onClick={handleDatePanelChange}
        >
          <span className={styles.cellText}>{formatDateLabel(dateRange)}</span>
          <ChevronDownSvg
            className={clsx(styles.arrowIcon, activePanel === 'date' && styles.arrowIconOpen)}
          />
        </button>

        <span className={styles.divider} />

        <button
          type="button"
          className={clsx(styles.cell, activePanel === 'sport' && styles.cellActive)}
          onClick={handleSportPanelChange}
        >
          <span className={styles.cellText}>{currentSport?.label ?? '足球'}</span>
          <ChevronDownSvg
            className={clsx(styles.arrowIcon, activePanel === 'sport' && styles.arrowIconOpen)}
          />
        </button>

        <span className={styles.divider} />

        <button type="button" className={styles.cell} onClick={handleLeagueFilterClick}>
          <span className={styles.cellText}>{leagueLabel}</span>
        </button>

        <span className={styles.divider} />

        <button
          type="button"
          className={clsx(styles.foldButton, resultListCollapsed && styles.foldCollapsed)}
          onClick={onToggleResultListCollapsed}
          aria-label={resultListCollapsed ? '展开赛果列表' : '收起赛果列表'}
        >
          <DoubleArrowUpSvg className={styles.foldIcon} />
        </button>
      </div>

      {activePanel === 'date' && (
        <div className={styles.dateShortcutList}>
          {dateShortcuts.map((item) => {
            const active =
              dayjs(dateRange.startTime).isSame(item.range.startTime, 'day') &&
              dayjs(dateRange.endTime).isSame(item.range.endTime, 'day');

            return (
              <button
                key={item.key}
                type="button"
                className={clsx(styles.dateShortcut, active && styles.dateShortcutActive)}
                onClick={() => handleDateShortcutChange(item.range)}
              >
                <span>{item.weekLabel}</span>
                <strong>{item.dateLabel}</strong>
              </button>
            );
          })}
        </div>
      )}

      {activePanel === 'sport' && (
        <CapsuleTabs
          activeKey={activeSportKey}
          onChange={handleSportTabChange}
          className={styles.sportFilterPanel}
        >
          {sportList.map((item) => (
            <CapsuleTabs.Tab key={item.sportId} title={item.label} />
          ))}
        </CapsuleTabs>
      )}
    </div>
  );
};

export default ResultSearchCondition;
