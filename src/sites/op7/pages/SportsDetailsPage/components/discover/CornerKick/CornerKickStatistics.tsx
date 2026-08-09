import React from 'react';
import clsx from 'clsx';

import SegmentedControl from '@/common/components/SegmentedControl';
import Empty from '@/common/components/Empty';
import type { CornerKickStatsRow } from '@/apis/origin/discover/cornerKickTypes';

import styles from './CornerKick.module.scss';

interface CornerKickStatisticsProps {
  homeName: string;
  awayName: string;
  totalRows: CornerKickStatsRow[];
  forRows: CornerKickStatsRow[];
  againstRows: CornerKickStatsRow[];
  totalTabId: number;
  forTabId: number;
  againstTabId: number;
  sameHomeAwayTotal: boolean;
  sameHomeAwayFor: boolean;
  sameHomeAwayAgainst: boolean;
  onTotalTabChange: (index: number) => void;
  onForTabChange: (index: number) => void;
  onAgainstTabChange: (index: number) => void;
  onToggleSameHomeAwayTotal: () => void;
  onToggleSameHomeAwayFor: () => void;
  onToggleSameHomeAwayAgainst: () => void;
}

const MATCH_COUNT_OPTIONS = [
  { value: 0, label: '10场' },
  { value: 1, label: '20场' },
];

const CornerKickStatistics: React.FC<CornerKickStatisticsProps> = ({
  homeName,
  awayName,
  totalRows,
  forRows,
  againstRows,
  totalTabId,
  forTabId,
  againstTabId,
  sameHomeAwayTotal,
  sameHomeAwayFor,
  sameHomeAwayAgainst,
  onTotalTabChange,
  onForTabChange,
  onAgainstTabChange,
  onToggleSameHomeAwayTotal,
  onToggleSameHomeAwayFor,
  onToggleSameHomeAwayAgainst,
}) => (
  <div className={styles.statistics}>
    <StatsSection
      title="角球总数"
      homeName={homeName}
      awayName={awayName}
      rows={totalRows}
      tabId={totalTabId}
      sameHomeAway={sameHomeAwayTotal}
      onTabChange={onTotalTabChange}
      onToggleSameHomeAway={onToggleSameHomeAwayTotal}
    />
    <StatsSection
      title="得角球"
      homeName={homeName}
      awayName={awayName}
      rows={forRows}
      tabId={forTabId}
      sameHomeAway={sameHomeAwayFor}
      onTabChange={onForTabChange}
      onToggleSameHomeAway={onToggleSameHomeAwayFor}
    />
    <StatsSection
      title="失角球"
      homeName={homeName}
      awayName={awayName}
      rows={againstRows}
      tabId={againstTabId}
      sameHomeAway={sameHomeAwayAgainst}
      onTabChange={onAgainstTabChange}
      onToggleSameHomeAway={onToggleSameHomeAwayAgainst}
    />
  </div>
);

interface StatsSectionProps {
  title: string;
  homeName: string;
  awayName: string;
  rows: CornerKickStatsRow[];
  tabId: number;
  sameHomeAway: boolean;
  onTabChange: (index: number) => void;
  onToggleSameHomeAway: () => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  homeName,
  awayName,
  rows,
  tabId,
  sameHomeAway,
  onTabChange,
  onToggleSameHomeAway,
}) => (
  <section className={styles.statsSection}>
    <div className={styles.statsToolbar}>
      <h3 className={clsx(styles.sectionTitle, '_tf[14]')}>{title}</h3>
      <button type="button" className={styles.sameTeamToggle} onClick={onToggleSameHomeAway}>
        <span className={clsx(styles.sameTeamCheck, sameHomeAway && styles.sameTeamCheckActive)} />
        <span className={clsx(styles.sameTeamLabel, '_tf[12]')}>同主客</span>
      </button>
      <SegmentedControl
        className={styles.matchCountControl}
        height={24}
        options={MATCH_COUNT_OPTIONS}
        value={tabId}
        onChange={onTabChange}
      />
    </div>
    <div className={styles.statsHeader}>
      <div className={styles.statsLabelCol} />
      <div className={clsx(styles.statsValueCol, styles.statsValueWide, '_tf[12]')}>{homeName}</div>
      <div className={clsx(styles.statsValueCol, styles.statsValueWide, '_tf[12]')}>{awayName}</div>
      <div className={clsx(styles.statsValueCol, styles.statsValueNarrow, '_tf[12]')}>平均</div>
    </div>
    {rows.length === 0 ? (
      <Empty type="data" variant="card" className={styles.empty} />
    ) : (
      <div className={styles.statsBody}>
        {rows.map((row) => (
          <div key={`${title}-${row.label}`} className={styles.statsRow}>
            <div className={clsx(styles.statsLabelCol, styles.statsLabel, '_tf[12]')}>
              {row.label}
            </div>
            <div
              className={clsx(
                styles.statsValueCol,
                styles.statsValueWide,
                styles.statsValue,
                '_tf[12]',
                row.type === 'percent' && percentBgClass(row.home),
              )}
            >
              {formatStatsValue(row.home, row.type)}
            </div>
            <div
              className={clsx(
                styles.statsValueCol,
                styles.statsValueWide,
                styles.statsValue,
                '_tf[12]',
                row.type === 'percent' && percentBgClass(row.away),
              )}
            >
              {formatStatsValue(row.away, row.type)}
            </div>
            <div
              className={clsx(
                styles.statsValueCol,
                styles.statsValueNarrow,
                styles.statsValue,
                '_tf[12]',
                row.type === 'percent' && percentBgClass(row.avg),
              )}
            >
              {formatStatsValue(row.avg, row.type)}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const formatStatsValue = (value: number, type: CornerKickStatsRow['type']): string =>
  type === 'avg' ? value.toFixed(1) : `${value.toFixed(0)}%`;

const percentBgClass = (value: number): string | undefined => {
  if (value > 74) return styles.percentHigh;
  if (value > 40) return styles.percentMid;
  return styles.percentLow;
};

export default CornerKickStatistics;
