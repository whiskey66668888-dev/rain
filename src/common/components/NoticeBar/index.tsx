import React, { useRef, useEffect, useState } from 'react';

import Icon from '@/common/components/Icon';

import styles from './NoticeBar.module.scss';

/**
 * NoticeBar 组件属性
 */
export interface NoticeBarProps {
  /**
   * 公告内容数组
   */
  items: string[];
  /**
   * 点击公告内容事件
   */
  itemClick?: (item: string, index: number) => void;
  /**
   * 图标地址
   */
  icon?: string;
  /**
   * 滚动速度（px/s）
   * @default 30
   */
  speed?: number;
  /**
   * 自定义类名
   */
  className?: string;
  iconColor?: string;
}

/**
 * 横向滚动公告栏组件
 */
export const NoticeBar: React.FC<NoticeBarProps> = ({
  items,
  itemClick,
  icon,
  speed = 30,
  className = 'color-[var(--Text-Main-10)]',
  iconColor = 'var(--Text-Main-10)',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(9999999999999); // 默认动画时长（SSR时设置到无穷大，相当于静止滚动）

  // 计算动画时长
  useEffect(() => {
    if (items.length === 0) return;
    if (contentRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const calculatedDuration = contentWidth / speed;
      setDuration(calculatedDuration);
    }
  }, [items, speed]);

  if (items.length === 0) {
    return null;
  }
  return (
    <div className={`${styles.noticeBar} ${className}`}>
      {icon && <Icon src={icon} size="12px" color={iconColor} className={styles.noticeIcon} />}
      <div className={styles.noticeWrapper}>
        <div
          ref={contentRef}
          className={styles.noticeContent}
          style={{
            animationDuration: `${duration}s`,
          }}
        >
          {items.map((item, index) => (
            <span
              key={index}
              className={`_tf[12] font-weight-400 cursor-pointer`}
              onClick={() => itemClick?.(item, index)}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeBar;
