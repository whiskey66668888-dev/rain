import React, { useState } from 'react';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import RealNameModal from './RealNameModal';

const RealName: React.FC = () => {
  const realName = useAppSelector((state) => state.user.memberInfo.realName);
  const [show, setShow] = useState(false);

  const handleClick = () => {
    if (realName) {
      return;
    }
    setShow(true);
  };

  return (
    <>
      <div
        className={clsx(
          'flex items-center justify-between gap-12px px-12px py-14px lg:px-24px ',
          'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]',
        )}
      >
        <div className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">姓名</div>
        <div
          className="_tf[14] leading-[1.43] text-[var(--Text-700)] flex items-center gap-4px"
          onClick={handleClick}
        >
          {realName ? <span>{realName}</span> : <span>完善信息，获取生日福利</span>}
          {!realName && <ArrowRightSvg className="w-12px h-12px text-[var(--Text-700)]" />}
        </div>
      </div>

      <RealNameModal
        visible={show}
        onClose={() => {
          setShow(false);
        }}
      />
    </>
  );
};

export default RealName;
