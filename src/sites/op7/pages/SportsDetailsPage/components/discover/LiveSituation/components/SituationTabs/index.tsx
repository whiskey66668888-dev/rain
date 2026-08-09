import React from 'react';
import clsx from 'clsx';

import { situationTabs } from '../../constants';
import type { SituationTabsProps } from '../../types';
import styles from './index.module.scss';

const SituationTabs: React.FC<SituationTabsProps> = ({ activeTab, onChange }) => (
  <div className={styles.tabs}>
    {situationTabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        className={clsx(activeTab === tab.key && styles.activeTab)}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default SituationTabs;
