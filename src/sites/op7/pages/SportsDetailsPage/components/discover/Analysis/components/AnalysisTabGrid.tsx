import React from 'react';
import clsx from 'clsx';

import styles from '../Analysis.module.scss';

interface AnalysisTabGridProps {
  labels: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

const AnalysisTabGrid: React.FC<AnalysisTabGridProps> = ({ labels, selectedIndex, onChange }) => (
  <div className={styles.tabGrid}>
    {labels.map((label, index) => (
      <button
        key={label}
        type="button"
        className={clsx(styles.tabItem, index === selectedIndex && styles.tabItemActive)}
        onClick={() => onChange(index)}
      >
        {label}
      </button>
    ))}
  </div>
);

export default AnalysisTabGrid;
