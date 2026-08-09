/**
 * 右侧边栏广告位（按设计稿：3 张图）
 */

import React, { memo } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useAppDownload } from '@/common/hooks/useAppDownload';
import clsx from 'clsx';
// import { setRightSidebarVisible } from '@/core/store/slices/configSlice';
// import Icon from '@/common/components/Icon';

const Advertise: React.FC = () => {
  // const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const { openDownloadApp } = useAppDownload();
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const navigate = useNavigateWithLanguage();
  const imageBasePath = `/images/${theme}/rightSidebar`;

  return (
    <div className="w-[351px] shrink-0 h-full overflow-y-auto bg-[var(--Background-300)]">
      {/* <div className="h-48px px-12px flex items-center justify-between border-b-solid border-[var(--Line-100)]">
        <span className="_tf[14] font-600 leading-[24px] text-[var(--Text-Main-10)]">发现更多</span>
        <button
          type="button"
          aria-label="关闭右侧栏"
          className="w-26px h-26px rounded-full p-0 border-none flex items-center justify-center cursor-pointer"
          onClick={() => dispatch(setRightSidebarVisible(false))}
        >
          <Icon size="20px" src={'/images/common/close.svg'} />
        </button>
      </div> */}

      <div className="flex flex-col gap-12px p-12px">
        <button
          type="button"
          onClick={() => navigate(PATHS.mineInviteFriends)}
          className={clsx(
            'block w-full overflow-hidden rounded-10px bg-transparent p-0 cursor-pointer',
            'border border-solid border-[var(--Line-100)]',
          )}
        >
          <img
            src={`${imageBasePath}/right_sidebar_invite.png`}
            alt="邀请好友"
            className="block w-full h-auto object-cover"
          />
        </button>

        <button
          type="button"
          onClick={() => navigate(PATHS.promotion)}
          className={clsx(
            'block w-full overflow-hidden rounded-10px bg-transparent p-0 cursor-pointer',
            'border border-solid border-[var(--Line-100)]',
          )}
        >
          <img
            src={`${imageBasePath}/right_sidebar_promotion.png`}
            alt="优惠活动"
            className="block w-full h-auto object-cover"
          />
        </button>

        <button
          type="button"
          onClick={openDownloadApp}
          className={clsx(
            'block w-full overflow-hidden rounded-10px bg-transparent p-0 cursor-pointer',
            'border border-solid border-[var(--Line-100)]',
          )}
        >
          <img
            src={`${imageBasePath}/right_sidebar_download.webp`}
            alt="下载APP"
            className="block w-full h-auto object-cover"
          />
        </button>
      </div>
    </div>
  );
};

Advertise.displayName = 'Advertise';

export default memo(Advertise);
