import React from 'react';
import clsx from 'clsx';

import { useAppSelector } from '@/core/store/hooks';
import { ArrowLeftSvg } from '../SvgIcons';

export interface ModalBackButtonProps {
  onClick: () => void;
  /** 可选：追加的 className（如父级定位、圆角、背景、图标大小） */
  className?: string;
  /** 可选：aria-label，默认 "返回" */
  ariaLabel?: string;
}

const BackArrowIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.05086 4.90179C2.00264 4.95 1.99729 5.02484 2.03479 5.07897L2.05086 5.09821L6.56848 9.61584C6.62272 9.67008 6.71066 9.67008 6.7649 9.61584L7.45237 8.92837C7.50661 8.87413 7.50661 8.78619 7.45237 8.73195L3.72041 5L7.45237 1.26805C7.50661 1.21381 7.50661 1.12587 7.45237 1.07163L6.7649 0.384164C6.71066 0.329925 6.62272 0.329925 6.56848 0.384164L2.05086 4.90179Z"
      fill="currentColor"
    />
  </svg>
);

const h5BackBtnBaseClass =
  'w-5 h-5 flex items-center justify-center text-[var(--Text-Main-10)] border-none p-0 cursor-pointer z-10 transition-transform duration-200 active:scale-95 [&_svg]:w-5 [&_svg]:h-5';

/**
 * 弹窗左上角返回按钮，SVG 图标随主题色。背景/圆角/图标大小可由 className 覆盖（如 bg-[var(--Line-100)] rounded-full）
 */
const ModalBackButton: React.FC<ModalBackButtonProps> = ({
  onClick,
  className,
  ariaLabel = '返回',
}) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);

  return (
    <button
      type="button"
      className={clsx(isMobile && h5BackBtnBaseClass, className)}
      onClick={onClick}
      aria-label={ariaLabel}
      style={
        isMobile
          ? {
              width: '16px',
              height: '16px',
              padding: 0,
              background: 'transparent',
              borderRadius: 0,
              boxShadow: 'none',
            }
          : undefined
      }
    >
      {isMobile ? <ArrowLeftSvg className="h-16px w-16px text-main" /> : <BackArrowIcon />}
    </button>
  );
};

export default ModalBackButton;
