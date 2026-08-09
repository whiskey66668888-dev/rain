import React from 'react';
import clsx from 'clsx';

import styles from './CornerKick.module.scss';

interface DiscoverPillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

/** 对齐 App AppPill（角球页 历史/统计 切换） */
const DiscoverPill: React.FC<DiscoverPillProps> = ({ label, selected = false, onClick }) => (
  <button
    type="button"
    className={clsx(styles.pill, '_tf[12]', selected && styles.pillActive)}
    onClick={onClick}
  >
    {label}
  </button>
);

export default DiscoverPill;
