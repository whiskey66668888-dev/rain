import React from 'react';
import clsx from 'clsx';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import { useNavigateWithLanguage } from '@common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';

const Birthday: React.FC = () => {
  const navigate = useNavigateWithLanguage();

  const handleClick = () => {
    navigate(PATHS.moments);
  };

  return (
    <>
      <div
        className={clsx(
          'flex items-center justify-between gap-12px px-12px py-14px lg:px-24px rounded-12px bg-[var(--Background-300)]',
          'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]',
        )}
        onClick={handleClick}
      >
        <div className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">个人主页</div>
        <div className="_tf[14] leading-[1.43] text-[var(--Text-700)] flex items-center gap-4px">
          <span></span>
          <ArrowRightSvg className="w-12px h-12px text-[var(--Text-700)]" />
        </div>
      </div>
    </>
  );
};

export default Birthday;
