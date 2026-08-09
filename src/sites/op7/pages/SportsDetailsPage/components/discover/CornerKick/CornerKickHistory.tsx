import React from 'react';
import clsx from 'clsx';

import SegmentedControl from '@/common/components/SegmentedControl';
import Empty from '@/common/components/Empty';
import type { CornerKickHistoryRow } from '@/apis/origin/discover/cornerKickTypes';

import CornerKickTable from './CornerKickTable';
import styles from './CornerKick.module.scss';

interface CornerKickHistoryProps {
  homeTitle: string;
  awayTitle: string;
  homeIcon?: string;
  awayIcon?: string;
  homeRows: CornerKickHistoryRow[];
  awayRows: CornerKickHistoryRow[];
  homeFilterIndex: number;
  awayFilterIndex: number;
  homeBigRate: number;
  homeSmallRate: number;
  awayBigRate: number;
  awaySmallRate: number;
  onHomeFilterChange: (index: number) => void;
  onAwayFilterChange: (index: number) => void;
}

const FILTER_OPTIONS = [
  { value: 0, label: '全部' },
  { value: 1, label: '主场' },
  { value: 2, label: '客场' },
];

const CornerKickHistory: React.FC<CornerKickHistoryProps> = ({
  homeTitle,
  awayTitle,
  homeIcon,
  awayIcon,
  homeRows,
  awayRows,
  homeFilterIndex,
  awayFilterIndex,
  homeBigRate,
  homeSmallRate,
  awayBigRate,
  awaySmallRate,
  onHomeFilterChange,
  onAwayFilterChange,
}) => (
  <div className={styles.history}>
    <HistorySection
      titleName={homeTitle}
      icon={homeIcon}
      rows={homeRows}
      filterIndex={homeFilterIndex}
      bigRate={homeBigRate}
      smallRate={homeSmallRate}
      onFilterChange={onHomeFilterChange}
    />
    <HistorySection
      titleName={awayTitle}
      icon={awayIcon}
      rows={awayRows}
      filterIndex={awayFilterIndex}
      bigRate={awayBigRate}
      smallRate={awaySmallRate}
      onFilterChange={onAwayFilterChange}
    />
  </div>
);

interface HistorySectionProps {
  titleName: string;
  icon?: string;
  rows: CornerKickHistoryRow[];
  filterIndex: number;
  bigRate: number;
  smallRate: number;
  onFilterChange: (index: number) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  titleName,
  icon,
  rows,
  filterIndex,
  bigRate,
  smallRate,
  onFilterChange,
}) => (
  <section className={styles.historySection}>
    <h3 className={clsx(styles.sectionTitle, '_tf[14]')}>比赛角球</h3>
    <div className={styles.teamBar}>
      <div className={styles.teamInfo}>
        {icon ? (
          <img src={icon} alt="" className={styles.teamIcon} />
        ) : (
          <span className={styles.teamIconPlaceholder} />
        )}
        <span className={clsx(styles.teamName, '_tf[12]')}>{titleName}</span>
      </div>
      <SegmentedControl
        className={styles.filterControl}
        height={24}
        options={FILTER_OPTIONS}
        value={filterIndex}
        onChange={onFilterChange}
      />
    </div>
    {!(bigRate === 0 && smallRate === 0) && (
      <div className={styles.rateBar}>
        <div className={styles.rateLabels}>
          <span className={clsx(styles.rateBig, '_tf[12]')}>
            大 <strong>{Math.round(bigRate)}%</strong>
          </span>
          <span className={clsx(styles.rateSmall, '_tf[12]')}>小 {Math.round(smallRate)}%</span>
        </div>
        <div className={styles.rateTrack}>
          {bigRate > 0 && (
            <span
              className={styles.rateBigFill}
              style={{ flex: Math.max(1, Math.round(bigRate)) }}
            />
          )}
          {bigRate > 0 && smallRate > 0 && <span className={styles.rateGap} />}
          {smallRate > 0 && (
            <span
              className={styles.rateSmallFill}
              style={{ flex: Math.max(1, Math.round(smallRate)) }}
            />
          )}
        </div>
      </div>
    )}
    {rows.length === 0 ? (
      <Empty type="data" variant="card" className={styles.empty} />
    ) : (
      <CornerKickTable rows={rows} />
    )}
  </section>
);

export default CornerKickHistory;
