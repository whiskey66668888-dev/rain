import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export interface NewLoginModalCloseProps {
  onClick: () => void;
  /** 可选：追加的 className（如父级定位） */
  className?: string;
  /** 可选：aria-label，默认使用 i18n modals.close */
  ariaLabel?: string;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path
      d="M1.42259 0.244075C1.09715 -0.0813583 0.569517 -0.0813583 0.244075 0.244075C-0.0813583 0.569517 -0.0813583 1.09715 0.244075 1.42259L5.05634 6.23484L0.244125 11.0471C-0.0813083 11.3725 -0.0813083 11.9002 0.244125 12.2256C0.569567 12.551 1.0972 12.551 1.42263 12.2256L6.23484 7.41334L11.0471 12.2256C11.3725 12.551 11.9002 12.551 12.2256 12.2256C12.551 11.9002 12.551 11.3725 12.2256 11.0471L7.41334 6.23484L12.2257 1.42259C12.5511 1.09715 12.5511 0.569517 12.2257 0.244075C11.9003 -0.0813583 11.3726 -0.0813583 11.0472 0.244075L6.23484 5.05634L1.42259 0.244075Z"
      fill="currentColor"
    />
  </svg>
);

const closeBtnBaseClass =
  'absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-xl border-none bg-transparent p-0 text-[var(--Text-Main-10)] cursor-pointer z-10 transition-all duration-200  active:scale-95 [&_svg]:h-[12.47px] [&_svg]:w-[12.47px]';

/**
 * 登录注册弹窗右上角关闭按钮
 */
const NewLoginModalClose: React.FC<NewLoginModalCloseProps> = ({
  onClick,
  className,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const label = ariaLabel ?? t('modals.close');

  return (
    <button
      type="button"
      className={clsx(closeBtnBaseClass, className)}
      onClick={onClick}
      aria-label={label}
    >
      <CloseIcon />
    </button>
  );
};

export default NewLoginModalClose;
