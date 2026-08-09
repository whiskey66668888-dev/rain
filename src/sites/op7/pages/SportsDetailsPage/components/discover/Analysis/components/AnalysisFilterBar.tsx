import React from 'react';
import clsx from 'clsx';

import SegmentedControl from '@/common/components/SegmentedControl';

import type { AnalysisFilterState } from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

interface AnalysisFilterBarProps {
  filter: AnalysisFilterState;
  onFilterChange: (patch: Partial<AnalysisFilterState>) => void;
  showCountToggle?: boolean;
}

const COUNT_OPTIONS = [
  { value: 10, label: '10场' },
  { value: 20, label: '20场' },
];

const AnalysisFilterBar: React.FC<AnalysisFilterBarProps> = ({
  filter,
  onFilterChange,
  showCountToggle = true,
}) => (
  <div className={styles.filterRow}>
    <div className={styles.filterRowLeft}>
      <button
        type="button"
        className={clsx(styles.filterChip, filter.sameHomeAway && styles.filterChipActive)}
        onClick={() => onFilterChange({ sameHomeAway: !filter.sameHomeAway })}
      >
        同主客
      </button>
      <button
        type="button"
        className={clsx(styles.filterChip, filter.sameLeague && styles.filterChipActive)}
        onClick={() => onFilterChange({ sameLeague: !filter.sameLeague })}
      >
        同赛事
      </button>
    </div>
    {showCountToggle ? (
      <SegmentedControl
        className={styles.filterCountControl}
        options={COUNT_OPTIONS}
        value={filter.matchCount}
        onChange={(v) => onFilterChange({ matchCount: v })}
        height={24}
      />
    ) : null}
  </div>
);

export default AnalysisFilterBar;
