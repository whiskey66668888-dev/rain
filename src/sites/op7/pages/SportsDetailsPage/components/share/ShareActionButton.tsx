import React from 'react';
import clsx from 'clsx';

import { SHARE_ASSET } from './constants';

export interface ShareActionButtonProps {
  /** 图标资源名（不含目录/扩展名），如 share_ic_save */
  asset: string;
  label: string;
  onClick: () => void;
  /** 处理中置灰禁用：截图/发送都是耗时操作，避免连点重复触发 */
  disabled?: boolean;
}

/** 分享面板底部操作按钮：圆底图标 + 文字 */
export const ShareActionButton: React.FC<ShareActionButtonProps> = ({
  asset,
  label,
  onClick,
  disabled = false,
}) => (
  <button
    type="button"
    disabled={disabled}
    className={clsx(
      'flex flex-col items-center border-0 bg-transparent',
      disabled && 'pointer-events-none opacity-50',
    )}
    onClick={onClick}
  >
    <span className="flex h-44px w-44px items-center justify-center rounded-full bg-[var(--Background-500)]">
      <img
        src={`${SHARE_ASSET}/${asset}.png`}
        width={24}
        height={24}
        className="h-24px w-24px object-contain"
        alt=""
      />
    </span>
    <span className="mt-10px text-[10px] text-[var(--Text-800)]">{label}</span>
  </button>
);

export default ShareActionButton;
