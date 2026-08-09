import React from 'react';
import clsx from 'clsx';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { ArrowLeftSvg } from '../SvgIcons';

export interface H5HeaderProps {
  /** 中间标题 */
  title: React.ReactNode;
  /** 左侧返回按钮点击，不传则默认执行路由返回 */
  onBack?: () => void;
  /** 左侧插槽 */
  left?: React.ReactNode;
  /** 右侧插槽 */
  right?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** PC端是否隐藏 */
  pcHidden?: boolean;
  /** 是否固定在顶部 */
  isFixed?: boolean;
  /** 高度 */
  height?: number;
  /** 样式 */
  style?: React.CSSProperties;
}

/**
 * H5 通用头部（按 Figma OP7 2.0 App Bar：高 44px，左返回、中标题、右插槽）
 */
const H5Header: React.FC<H5HeaderProps> = ({
  title,
  onBack,
  left,
  right,
  className,
  pcHidden = true,
  isFixed = true,
  height = 48,
  style,
}) => {
  const navigate = useNavigateWithLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <header
        className={clsx(
          'shrink-0 w-full overflow-hidden',
          `h-${height}px`,
          'flex px-12px bg-[var(--Background-300)]',
          {
            'lg:hidden': pcHidden,
            'fixed top-0 left-0 right-0 z-10 ': isFixed,
          },
          className,
        )}
        style={style}
        data-desc="h5-header"
      >
        <div className="flex items-center justify-start w-[25%] min-w-60px shrink-0">
          {left === undefined ? (
            <button
              type="button"
              // className="flex h-24px w-24px shrink-0 items-center justify-center rounded-full bg-[var(--Line-100)]"
              onClick={handleBack}
              aria-label="返回"
            >
              <ArrowLeftSvg className="h-16px w-16px text-[var(--Text-Main-10)]" />
            </button>
          ) : (
            left
          )}
        </div>
        <div
          className={clsx(
            'flex flex-1 items-center justify-center overflow-hidden',
            '_tf[16] font-500 leading-[1.5] text-[var(--Text-Main-10)]',
          )}
        >
          {title}
        </div>
        <div className="flex items-center justify-end w-[25%] min-w-60px shrink-0">
          {right ?? null}
        </div>
      </header>
      {isFixed && (
        <div
          data-desc="h5-header-placeholder"
          className={clsx(`h-${height}px`, 'shrink-0 min-w-1px', {
            'lg:hidden': pcHidden,
          })}
        />
      )}
    </>
  );
};

export default H5Header;
