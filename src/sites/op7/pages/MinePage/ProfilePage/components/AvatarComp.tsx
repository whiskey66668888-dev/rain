import LazyImage from '@/common/components/LazyImage';
import { useAppSelector } from '@/core/store/hooks';
import React from 'react';
import clsx from 'clsx';
import { DEFAULT_AVATAR_SRC, resolveEmcAvatarSrc } from '@/common/utils/emcAvatar';

interface IProps {
  className?: string;
}

const AvatarComp: React.FC<IProps> = ({ className }) => {
  const memberAvatarId = useAppSelector((state) => state.user.memberInfo.userAvatar);
  const userAvatar = useAppSelector((state) => state.user.userAvatar);
  const avatar = memberAvatarId
    ? resolveEmcAvatarSrc(memberAvatarId)
    : userAvatar || DEFAULT_AVATAR_SRC;

  return (
    <LazyImage
      src={avatar}
      fallback={DEFAULT_AVATAR_SRC}
      alt="avatar"
      className={clsx('w-40px h-40px shrink-0', className)}
    />
  );
};

export default AvatarComp;
