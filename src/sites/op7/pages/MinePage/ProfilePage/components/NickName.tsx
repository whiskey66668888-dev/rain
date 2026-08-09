import React, { useState } from 'react';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import NickNameModal from './NickNameModal';

const NickName: React.FC = () => {
  const nickName = useAppSelector((state) => state.user.memberInfo.nickName);
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow(true);
  };

  return (
    <>
      <div
        className={clsx(
          'flex items-center justify-between gap-12px px-12px py-14px lg:px-24px',
          'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]',
        )}
        onClick={handleClick}
      >
        <div className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">昵称</div>
        <div className="_tf[14] leading-[1.43] text-[var(--Text-700)] flex items-center gap-4px">
          {nickName ? <span>{nickName}</span> : <span>请设置昵称</span>}
          <ArrowRightSvg className="w-12px h-12px text-[var(--Text-700)]" />
        </div>
      </div>

      <NickNameModal visible={show} initialNickName={nickName} onClose={() => setShow(false)} />
    </>
  );
};

export default NickName;
