import React, { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './index.module.scss';
import { handleContent } from '@/utils/format/handleContent';
interface ActivitySectionProps {
  /** 左侧标题内容 (文本或React组件) */
  title?: ReactNode;
  /** 中间内容 */
  center?: ReactNode;
  /** 右侧内容 (文本或React组件) */
  extra?: ReactNode;
  /** 子元素 */
  children?: ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 标题栏样式类名 */
  headerClassName?: string;
  /** 内容区样式类名 */
  bodyClassName?: string;
  /** 标题栏左侧区域样式类名 */
  titleClassName?: string;
  /** 标题栏中间区域样式类名 */
  centerClassName?: string;
  /** 标题栏右侧区域样式类名 */
  extraClassName?: string;
}

/**
 * 简易盒子组件
 *
 * 支持自定义标题栏和内容区，标题栏左右两侧均可传入任意React元素
 */
const ActivitySection: React.FC<ActivitySectionProps> = ({
  title,
  center,
  extra,
  children,
  className,
  headerClassName,
  bodyClassName,
  titleClassName,
  centerClassName,
  extraClassName,
}) => {
  return (
    <div className={clsx(styles.simpleBox, className)}>
      <div className={clsx(styles.header, headerClassName)}>
        <div className={styles.left}>
          {title &&
            (typeof title === 'string' ? (
              <div
                className={clsx(styles.title, titleClassName)}
                dangerouslySetInnerHTML={{
                  __html: handleContent(title),
                }}
              ></div>
            ) : (
              <div className={clsx(styles.title, titleClassName)}>{title}</div>
            ))}
        </div>
        <div className={clsx(styles.center, centerClassName)}>{center}</div>
        <div className={clsx(styles.extra, extraClassName)}>{extra}</div>
      </div>

      <div className={clsx(styles.body, bodyClassName)}>{children}</div>
    </div>
  );
};

export default ActivitySection;
