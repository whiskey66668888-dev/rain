import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './index.module.scss';
import { VipLevelInfo } from '@/apis/origin/vip/getVipinfo';

interface VipLevelTabsProps {
  /** VIP 等级列表 */
  levelList: VipLevelInfo[];
  /** 当前激活的 VIP 等级 */
  activeLevel: number;
  /** 当前用户等级 */
  currentLevel: number;
  /** 点击回调 */
  onTabClick: (level: number) => void;
}

const VipLevelTabs: React.FC<VipLevelTabsProps> = ({
  levelList,
  activeLevel,
  currentLevel,
  onTabClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !activeTabRef.current) {
      return;
    }

    const container = containerRef.current;
    const activeTab = activeTabRef.current;
    const needsScroll = container.scrollWidth > container.clientWidth;

    if (!needsScroll) {
      return;
    }

    const containerWidth = container.clientWidth;
    const tabLeft = activeTab.offsetLeft;
    const tabWidth = activeTab.offsetWidth;
    const tabCenter = tabLeft + tabWidth / 2;
    const containerCenter = containerWidth / 2;
    const scrollLeft = tabCenter - containerCenter;

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }, [activeLevel, levelList]);

  return (
    <div className={styles.swich_level} ref={containerRef}>
      <div className={styles.swicth_box}>
        {levelList.map((item) => {
          const isActive = activeLevel === item.level;

          return (
            <div
              key={item.level}
              className={clsx(styles.switch_level_item)}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabClick(item.level)}
            >
              <div
                className={clsx(
                  styles.switch_list,
                  isActive ? styles.active : null,
                  currentLevel === item.level ? styles.nowIndex : null,
                )}
              >
                VIP{item.level}
              </div>
              <div className={styles.middle_line} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VipLevelTabs;
