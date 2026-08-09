import React from 'react';

import { DEFAULT_AVATAR_SRC } from '@/common/utils/emcAvatar';

import { SHARE_ASSET } from './constants';

const onAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src.endsWith(DEFAULT_AVATAR_SRC)) return;
  img.src = DEFAULT_AVATAR_SRC;
};

export interface SharePosterUserRowProps {
  /** 会员昵称（不打码，无昵称留空） */
  nickName: string;
  avatarSrc: string;
  /** 打开面板时刻文案 yyyy/MM/dd HH:mm:ss */
  timeText: string;
}

/** 海报顶部：头像 + 昵称 + 分享时间 + OP7 logo */
export const SharePosterUserRow: React.FC<SharePosterUserRowProps> = ({
  nickName,
  avatarSrc,
  timeText,
}) => (
  <div className="flex items-center">
    <img
      src={avatarSrc || DEFAULT_AVATAR_SRC}
      crossOrigin="anonymous"
      width={28}
      height={28}
      className="h-28px w-28px rounded-full object-cover"
      onError={onAvatarError}
      alt=""
    />
    <div className="ml-8px min-w-0 flex-1">
      <div className="truncate text-[12px] font-500 leading-[1.4] text-[var(--Text-Main-10)]">
        {nickName}
      </div>
      <div className="text-[10px] leading-[1.4] text-[var(--Text-800)]">{timeText}</div>
    </div>
    <img
      src={`${SHARE_ASSET}/share_op7_logo.png`}
      width={42}
      height={16}
      className="h-16px w-42px object-contain"
      alt="OP7"
    />
  </div>
);

export default SharePosterUserRow;
