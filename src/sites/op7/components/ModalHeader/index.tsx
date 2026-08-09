import React from 'react';
import clsx from 'clsx';
import { CloseSvg } from '../SvgIcons';

export interface ModalHeaderProps {
  /** 中间标题 */
  title: React.ReactNode;
  /** 左侧返回按钮点击，不传则默认执行路由返回 */
  onClose?: () => void;
  /** 左侧插槽 */
  left?: React.ReactNode;
  /** 右侧插槽 */
  right?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 移动端隐藏 */
  mobileHidden?: boolean;
}

/**
 * 弹窗头部
 */
const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  left,
  right,
  className,
  mobileHidden,
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <header
      className={clsx(
        'shrink-0 px-12px lg:px-24px h-48px',
        mobileHidden ? 'hidden lg:flex' : 'flex',
        className,
      )}
    >
      <div className="flex items-center justify-start w-[20%] min-w-24px shrink-0">
        {left ?? null}
      </div>
      <div
        className={clsx(
          'flex flex-1 items-center justify-center overflow-hidden',
          '_tf[16] font-medium leading-[1.5] text-[var(--Text-Main-10)]',
        )}
      >
        {title}
      </div>
      <div className="flex items-center justify-end w-[20%] min-w-24px shrink-0">
        {right === undefined ? (
          <button type="button" className="flex items-center justify-center" onClick={handleClose}>
            <CloseSvg />
          </button>
        ) : (
          right
        )}
      </div>
    </header>
  );
};

export default ModalHeader;
