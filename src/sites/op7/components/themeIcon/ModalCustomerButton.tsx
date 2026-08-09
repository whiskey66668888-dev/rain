import React from 'react';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';

export interface ModalCustomerButtonProps {
  onClick: () => void;
  /** 可选：追加的 className（如父级定位、圆角、背景、图标大小） */
  className?: string;
  /** 可选：aria-label，默认 "客服" */
  ariaLabel?: string;
}

const customerBtnBaseClass =
  'flex items-center justify-center border-none cursor-pointer p-0 text-[var(--Text-Main-10)] transition-opacity duration-200 hover:opacity-70 active:opacity-50 [&_svg]:w-[20px] [&_svg]:h-[20px] rounded-full';

/**
 * 弹窗右上角客服按钮，SVG 图标随主题色。背景/圆角/图标大小可由 className 覆盖
 */
const ModalCustomerButton: React.FC<ModalCustomerButtonProps> = ({
  onClick,
  className,
  ariaLabel = '客服',
}) => {
  return (
    <button
      type="button"
      className={clsx(customerBtnBaseClass, className)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Icon src="/images/common/customerService_1.svg" size="20px" color="var(--Text-Main-10)" />
    </button>
  );
};

export default ModalCustomerButton;
