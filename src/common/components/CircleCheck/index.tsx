import React from 'react';

import LazyImage from '@/common/components/LazyImage';

import styles from './CircleCheck.module.scss';

export interface CircleCheckProps {
  /** 是否选中（打勾） */
  checked: boolean;
  /** 切换选中状态 */
  onChange?: (checked: boolean) => void;
  /** 右侧文案，如「24小时内不再提醒」 */
  children?: React.ReactNode;
  /** 根节点 class */
  className?: string;
}

/**
 * 圆框打勾组件：14px 圆形框，未选为描边，选中为主题色填充并显示 check 图标
 * 用于「24小时内不再提醒」等勾选项
 */
const CircleCheck: React.FC<CircleCheckProps> = ({ checked, onChange, children, className }) => {
  return (
    <div
      className={`${styles.root} ${className ?? ''}`.trim()}
      onClick={() => onChange?.(!checked)}
      role="checkbox"
      aria-checked={checked}
    >
      <span className={styles.circleWrap}>
        <div className={checked ? styles.circleChecked : styles.circle} />
        {checked && (
          <LazyImage
            src="/images/common/check.svg"
            alt=""
            width={8}
            height={6}
            className={styles.checkIcon}
          />
        )}
      </span>
      {children != null && <span className={styles.label}>{children}</span>}
    </div>
  );
};

export default CircleCheck;
