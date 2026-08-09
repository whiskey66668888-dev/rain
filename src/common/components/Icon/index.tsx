import React from 'react';

import styles from './Icon.module.scss';

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  /**
   * SVG 图标路径
   */
  src: string;
  /**
   * 图标尺寸（宽高相同）
   * @default '18px'
   */
  size?: string | number;
  /**
   * 图标颜色（CSS 颜色值或 CSS 变量）
   * @default 'var(--Text-Main-10)'
   */
  color?: string;
  /**
   * hover 时的颜色
   */
  hoverColor?: string;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 点击事件
   */
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

/**
 * Icon 组件
 * 使用 CSS Mask 实现 SVG 颜色控制，支持主题色和 hover 状态
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Icon src="/images/common/menu/sports.svg" />
 *
 * // 自定义尺寸和颜色
 * <Icon src="/images/common/menu/sports.svg" size="20px" color="var(--ThemeColor-Main)" />
 *
 * // 支持 hover
 * <Icon src="/images/common/menu/sports.svg" hoverColor="var(--ThemeColor-Main)" />
 *
 * // 支持点击
 * <Icon src="/images/common/menu/sports.svg" onClick={() => console.log('clicked')} />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  src,
  size = '18px',
  color = 'var(--Text-Main-10)',
  hoverColor,
  className = '',
  onClick,
  style,
  ...restProps
}) => {
  // 处理尺寸：如果是数字，添加 px
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  const iconStyle: React.CSSProperties = {
    width: `calc(${sizeValue} * var(--text-scale, 1))`,
    height: `calc(${sizeValue} * var(--text-scale, 1))`,
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`, // Safari 兼容
    backgroundColor: color,
    cursor: onClick ? 'pointer' : 'inherit',
    ...(hoverColor &&
      ({
        '--icon-hover-color': hoverColor,
      } as React.CSSProperties)),
    ...style,
  };

  // 组合类名
  const classes = [styles.icon, hoverColor && styles.iconHover, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes} style={iconStyle} onClick={onClick} {...restProps} />;
};

export default React.memo(Icon);
