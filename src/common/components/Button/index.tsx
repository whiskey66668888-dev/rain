import React from 'react';
import { cn } from '@/utils';
import { LoadingIcon } from '@/sites/op7/components/SvgIcons';

/**
 * Button 类型
 * @primary: 主要按钮
 * @second: 次要按钮 background-700 , 在 background-100 上使用
 * @third: 第三按钮 background-100 , 在 background-main 上使用
 */
export type ButtonType = 'primary' | 'second' | 'third' | 'fourth' | 'outline';

/**
 * Button 尺寸
 */
export type ButtonSize = 'large' | 'middle' | 'small';

/**
 * Button 组件属性
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 按钮类型
   * @default 'primary'
   */
  type?: ButtonType;
  /**
   * 按钮尺寸
   * @default 'large'
   */
  size?: ButtonSize;
  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 按钮图标
   */
  icon?: React.ReactNode;
  /**
   * 按钮内容
   */
  children?: React.ReactNode;
  /**
   * 原生 button 的 type 属性
   * @default 'button'
   */
  htmlType?: 'button' | 'submit' | 'reset';
  /**
   * 点击事件
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  contentClassName?: string;
}

/**
 * Button 组件
 * 类似 Ant Design 的 Button 组件，支持 loading、多种类型和尺寸
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Button>点击我</Button>
 *
 * // 主要按钮
 * <Button type="primary">主要按钮</Button>
 *
 * // 加载中
 * <Button loading>加载中...</Button>
 *
 * // 带图标
 * <Button icon={<span>🚀</span>}>发射</Button>
 *
 * // 不同尺寸
 * <Button size="large">大按钮</Button>
 * <Button size="small">小按钮</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  icon,
  children,
  htmlType = 'button',
  className = '',
  onClick,
  contentClassName,
  ...restProps
}) => {
  // 组合类名
  // loading变化文字重叠 透明度过渡ios引起文字重叠  transition-all ==> transition-[background-color,color,border-color]
  const baseClasses = `inline-flex gap-[8px] items-center justify-center
    transition-[background-color,color,border-color] duration-200 ease-in-out rounded-full
    outline-none focus:outline-none focus-visible:outline-none`;

  // 尺寸类名
  const sizeClasses = {
    large: 'px-[12px] py-[6px] _tf[14] h-[40px]',
    middle: 'px-[12px] py-[4px] _tf[14] h-[32px]',
    small: 'px-[12px] py-[2px] _tf[12] h-[24px]',
  };

  // 加载中图标尺寸类名
  const loadingIconSizeClasses = {
    large: 'w-[16px]',
    middle: 'w-[14px]',
    small: 'w-[12px]',
  };

  // 类型类名
  const typeClasses: Record<ButtonType, string> = {
    primary: 'text-[var(--White-100)] bg-[var(--ThemeColor-Main)]',
    second: 'text-[var(--Text-Main-10)] bg-[var(--Background-500)]',
    third: 'text-[var(--Text-Main-10)] bg-[var(--Background-300)]',
    fourth:
      'text-[var(--Text-MaText/Main-10in-10)] bg-[var(--Background-300)] border border-solid border-[var(--Line-100)]',
    outline:
      'text-[var(--ThemeColor-Main)] bg-[var(--Button-100)] border-[1px] border-solid border-color-[var(--ThemeColor-Main)]',
  };

  // 类型状态类名
  const typeStatusClasses: Record<ButtonType, string> = {
    primary:
      'can-hover:[&:not(:active)]:hover:bg-[var(--ThemeColor-60)] active:bg-[var(--ThemeColor-800)]',
    second:
      'can-hover:[&:not(:active)]:hover:text-[var(--ThemeColor-Main)] can-hover:[&:not(:active)]:hover:bg-[var(--ThemeColor-15)] active:bg-[var(--Background-700)]',
    third:
      'can-hover:[&:not(:active)]:hover:text-[var(--ThemeColor-Main)] can-hover:[&:not(:active)]:hover:bg-[var(--ThemeColor-15)] active:bg-[var(--line-500)]',
    fourth:
      'can-hover:[&:not(:active)]:hover:text-[var(--ThemeColor-Main)] can-hover:[&:not(:active)]:hover:bg-[var(--ThemeColor-15)] active:bg-[var(--Background-300)]',
    outline:
      'can-hover:[&:not(:active)]:hover:bg-[var(--ThemeColor-15)] active:bg-[var(--ThemeColor-15)]',
  };

  // 处理点击事件
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={htmlType}
      className={cn(
        baseClasses,
        sizeClasses[size],
        typeClasses[type],
        !loading && !disabled && typeStatusClasses[type],
        {
          'font-medium': type === 'primary' && (size === 'large' || size === 'middle'),
          'opacity-60': disabled || loading,
          'cursor-wait': loading,
          'cursor-not-allowed': disabled && !loading,
        },
        className,
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...restProps}
    >
      {loading && (
        <LoadingIcon
          className={cn('animate-spin', loadingIconSizeClasses[size])}
          color={type === 'primary' ? 'white' : 'var(--ThemeColor-Main)'}
        />
      )}
      {!loading && !!icon && <div className="shrink-0 flex">{icon}</div>}
      {children && <div className={contentClassName}>{children}</div>}
    </button>
  );
};

export default Button;
