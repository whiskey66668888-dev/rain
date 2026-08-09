import clsx from 'clsx';
import styles from './index.module.scss';

interface TabListProps {
  tabs: string[];
  value: number;
  onChange: (idx: number) => void;
}

const TabList: React.FC<TabListProps> = ({ tabs, value, onChange }) => {
  const tabCount = tabs.length;
  const trackStyle = {
    width: `calc((100% - 12px) / ${tabCount})`,
    transform: `translateX(${value * 100}%)`,
    left: 6,
  } as const;

  return (
    <div className={styles.tabList}>
      <div className={styles.tabTrack} style={trackStyle} />
      {tabs.map((tab, idx) => (
        <div
          key={tab}
          className={clsx(styles.tabItem, '_tf[14]', value === idx && styles.active)}
          style={{ width: `${100 / tabs.length}%` }}
          onClick={() => onChange(idx)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default TabList;
