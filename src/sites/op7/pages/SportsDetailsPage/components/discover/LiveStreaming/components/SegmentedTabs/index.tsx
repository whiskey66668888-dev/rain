import clsx from 'clsx';

import styles from './index.module.scss';

/**
 * LiveStreaming 内的分段切换控件，主 tab 和统计 tab 共用同一套样式。
 */
const SegmentedTabs = <T extends string>({
  tabs,
  activeKey,
  onChange,
  className,
  variant = 'default',
}: {
  tabs: Array<{ key: T; label: string }>;
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
  variant?: 'default' | 'subtle';
}) => (
  <div className={clsx(styles.segmented, className)}>
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        className={clsx(
          styles.segmentButton,
          variant === 'subtle' && styles.segmentButtonSubtle,
          activeKey === tab.key && styles.segmentActive,
        )}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default SegmentedTabs;
