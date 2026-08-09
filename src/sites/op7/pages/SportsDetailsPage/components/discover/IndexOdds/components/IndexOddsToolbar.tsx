import React from 'react';
import clsx from 'clsx';

import SegmentedControl from '@/common/components/SegmentedControl';

import type { OddsTab } from '../types';
import styles from '../index.module.scss';

interface IndexOddsToolbarProps {
  tabs: OddsTab[];
  activeIndex: number;
  resolvedSportId: number;
  isFullTime: boolean;
  onTabChange: (index: number) => void;
  onPeriodChange: (fullTime: boolean) => void;
}

const IndexOddsToolbar: React.FC<IndexOddsToolbarProps> = ({
  tabs,
  activeIndex,
  resolvedSportId,
  isFullTime,
  onTabChange,
  onPeriodChange,
}) => (
  <div className={styles.toolbar}>
    <div className={styles.pills}>
      {tabs.map((tab, index) => (
        <button
          key={tab.key}
          type="button"
          className={clsx(styles.pill, '_tf[12]', index === activeIndex && styles.pillActive)}
          onClick={() => onTabChange(index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
    {resolvedSportId === 1 && (
      <SegmentedControl
        className={styles.segmented}
        height={24}
        tabButtonClassName="_tf[12] font-400"
        options={[
          { label: '全场', value: 'full' },
          { label: '半场', value: 'half' },
        ]}
        value={isFullTime ? 'full' : 'half'}
        onChange={(value) => onPeriodChange(value === 'full')}
      />
    )}
  </div>
);

export default IndexOddsToolbar;
