import React, { useRef, useEffect, useCallback } from 'react';
import styles from './index.module.scss';

import dayjs from 'dayjs';
import clsx from 'clsx';
import { HotEventItem } from '../hooks/useHotEventData';
import LazyImage from '@/common/components/LazyImage';

interface EventTabsProps {
  list: Array<HotEventItem>;
  currentIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
}

const EventTabs: React.FC<EventTabsProps> = ({
  list,
  currentIndex,
  onChange,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 滚动到指定的tab使其居中
  const scrollToCenter = useCallback((index: number) => {
    const container = containerRef.current;
    const tab = tabRefs.current[index];
    if (!container || !tab) return;

    const containerWidth = container.offsetWidth;
    const tabLeft = tab.offsetLeft;
    const tabWidth = tab.offsetWidth;

    // 计算让tab居中的滚动位置
    const scrollLeft = tabLeft - (containerWidth - tabWidth) / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth',
    });
  }, []);

  // 当前选中项变化时，滚动到居中位置
  useEffect(() => {
    if (list.length > 2) {
      // 使用 setTimeout 确保 DOM 渲染完成
      setTimeout(() => {
        scrollToCenter(currentIndex);
      }, 0);
    }
  }, [currentIndex, list.length, scrollToCenter]);

  // 处理点击
  const handleClick = (index: number) => {
    if (disabled || index === currentIndex) return;
    // 先滚动到目标位置
    if (list.length > 2) {
      scrollToCenter(index);
    }
    onChange(index);
  };

  // 格式化时间显示
  const formatTime = (startTime?: number, endTime?: number) => {
    if (!startTime || !endTime) return '';
    const start = dayjs(startTime).format('MM.DD');
    const end = dayjs(endTime).format('MM.DD');
    return `${start}-${end}`;
  };

  // 如果只有一个或没有，不显示
  if (list.length <= 1) return null;

  return (
    <div
      ref={containerRef}
      className={clsx(styles.eventTabs, list.length <= 2 ? styles.center : '')}
    >
      {list.map((item, index) => (
        <div
          key={item.eventId}
          ref={(el) => {
            tabRefs.current[index] = el;
          }}
          className={clsx(styles.eventTab, index === currentIndex ? styles.eventTabActive : '')}
          onClick={() => handleClick(index)}
          style={item.subIcon ? { backgroundImage: `url(${item.subIcon})` } : undefined}
        >
          <div className={styles.tabContent}>
            <div className={styles.tabName}>{item.subTitle}</div>
            <div className={styles.tabTime}>
              <LazyImage
                // src={`/images/${theme}/hotEvent/clock.png`}
                src={`/images/light/hotEvent/clock.png`}
                alt=""
                className={styles.clockIcon}
                width={10}
                height={10}
              />
              <span>{formatTime(item.subBeginTime, item.subEndTime)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventTabs;
