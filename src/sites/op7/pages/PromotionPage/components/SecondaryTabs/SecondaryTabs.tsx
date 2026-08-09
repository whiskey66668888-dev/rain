import { useRef, useEffect } from 'react';
import styles from './SecondaryTabs.module.scss';

export interface SecondaryTabItem {
  label: string;
  value: string;
}

interface SecondaryTabsProps<T extends string> {
  tabs: SecondaryTabItem[];
  active: T;
  onChange: (val: T) => void;
}

const SecondaryTabs = <T extends string>({ tabs, active, onChange }: SecondaryTabsProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isClickRef = useRef(false);

  const scrollToTab = (value: string, behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;
    const tabElement = tabRefs.current.get(value);

    if (container && tabElement) {
      const containerWidth = container.offsetWidth;
      const tabLeft = tabElement.offsetLeft;
      const tabWidth = tabElement.offsetWidth;
      const scrollTo = tabLeft - containerWidth / 2 + tabWidth / 2;
      container.scrollTo({ left: scrollTo, behavior });
    }
  };

  // 外部切换时才触发滚动，点击时跳过（由 handleTabClick 直接处理）
  useEffect(() => {
    if (active) {
      if (isClickRef.current) {
        isClickRef.current = false;
        return;
      }
      scrollToTab(active, 'smooth');
    }
  }, [active]);

  const handleTabClick = (tab: SecondaryTabItem) => {
    isClickRef.current = true;
    onChange(tab.value as T);
    // 等待 font-weight 切换引起的布局稳定后再计算滚动位置
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTab(tab.value, 'smooth');
      });
    });
  };

  return (
    <div className={styles.secondaryTabs}>
      <div ref={scrollContainerRef} className={styles.scrollContainer}>
        {tabs.map((tab) => {
          const isActive = tab.value === active;

          return (
            <div
              key={tab.value}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(tab.value, el);
                } else {
                  tabRefs.current.delete(tab.value);
                }
              }}
              data-label={tab.label}
              className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecondaryTabs;
