'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'antd-mobile';
import { useTranslation } from 'react-i18next';
import Modal from '@/common/components/Modal';
import styles from './index.module.scss';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { EDateRangeType, TDateRange, TDateRangeItem } from '@/utils/dateHelper';
import { buildQuickDateRangeTabs, todayRange } from '@/utils/dateHelper';

interface Props {
  value: TDateRange | null;
  onChange: (range: TDateRange) => void;
  children: (dateLabel: string, open: boolean) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 指定显示哪些快捷 tab，不传则显示全部；组件内部负责生成日期，不会过期 */
  quickDateRangeTypes?: EDateRangeType[];
  min?: Date;
  max?: Date;
  text?: string;
  closeButtonClassName?: string;
}

const DateRangePicker = ({
  value,
  onChange,
  children,
  className,
  style,
  quickDateRangeTypes,
  min,
  max,
  text,
  closeButtonClassName,
}: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  /** 👉 是否正在自定义选择（Calendar） */
  const [isCustomSelecting, setIsCustomSelecting] = useState(false);

  /** 每次 Modal 打开时刷新，避免跨午夜后日期过期 */
  const [quickTabs, setQuickTabs] = useState<TDateRangeItem[]>(() =>
    buildQuickDateRangeTabs(quickDateRangeTypes),
  );

  /** 匹配当前快捷选项 */
  const matchQuickTab = useMemo(() => {
    if (!value) return null;
    return quickTabs.find(
      (item) =>
        item.range[0] &&
        item.range[1] &&
        dayjs(item.range[0]).isSame(value[0], 'day') &&
        dayjs(item.range[1]).isSame(value[1], 'day'),
    );
  }, [quickTabs, value]);

  /** 当前 label */
  const dateLabel = useMemo(() => {
    if (!matchQuickTab) return 'common.custom';
    return matchQuickTab.name;
  }, [matchQuickTab]);

  /** 默认区间 */
  const defaultRange: TDateRange = useMemo(() => {
    if (value) return value;
    return todayRange();
  }, [value]);

  const [tempRange, setTempRange] = useState<TDateRange>(defaultRange);

  useEffect(() => {
    if (!open) return;
    setQuickTabs(buildQuickDateRangeTabs(quickDateRangeTypes)); // 每次打开刷新日期区间
    setTempRange(defaultRange);
    setIsCustomSelecting(false);
  }, [open, quickDateRangeTypes, defaultRange]);

  return (
    <>
      {/* 触发区域：完全外部控制 */}
      <div className={clsx(className)} style={style} onClick={() => setOpen(true)}>
        {children(dateLabel, open)}
      </div>
      {open && (
        <Modal
          show={open}
          position="bottom"
          title={t('common.selectDate')}
          maskClickClose
          confirmText={t('common.confirm')}
          className={styles.dateBottomModal}
          closeButtonClassName={closeButtonClassName ?? '!right-0'}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            onChange([
              dayjs(tempRange[0]).startOf('day').toDate(),
              dayjs(tempRange[1]).endOf('day').toDate(),
            ]);
            setOpen(false);
          }}
        >
          <div className={styles.dateModal}>
            <div className={styles.tips}>* {text ? text : t('common.recent_90_days_tip')}</div>

            {/* 快捷 tab */}
            {quickTabs.length > 1 && (
              <div className={styles.timeTab}>
                {quickTabs.map((item) => {
                  const active = !isCustomSelecting && item.rangeType === matchQuickTab?.rangeType;

                  return (
                    <div
                      key={item.rangeType}
                      className={`${styles.dateItem} ${active ? styles.active : ''}`}
                      onClick={() => {
                        if (!item.range) return;
                        setIsCustomSelecting(false);
                        onChange(item.range);
                        setOpen(false);
                      }}
                    >
                      {t(item.name)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar */}
            <Calendar
              className={clsx('antd-mobile-calendar-custom')}
              selectionMode="range"
              value={tempRange}
              onChange={(val) => {
                setIsCustomSelecting(true);
                if (!val || !val[0] || !val[1]) return;
                setTempRange([val[0], val[1]]);
              }}
              min={min || dayjs().subtract(89, 'day').toDate()}
              max={max || new Date()}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default DateRangePicker;
