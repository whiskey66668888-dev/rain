import { useAppDispatch } from '@/core/store/hooks';
import { useAppDownload } from '@/common/hooks/useAppDownload';
import { toggleHideBetDrawerDownloadAppAction } from '@/core/store/slices/sportSlice';
import { Op7LogoSvg } from '@/sites/op7/components/SvgIcons';
import ModalCloseButton from '@/sites/op7/components/themeIcon/ModalCloseButton';
import clsx from 'clsx';
import { memo, useCallback } from 'react';

const DownloadApp = () => {
  const dispatch = useAppDispatch();
  const { openDownloadApp } = useAppDownload();

  const handleClose = useCallback(() => {
    dispatch(toggleHideBetDrawerDownloadAppAction());
  }, [dispatch]);

  return (
    <div
      className={clsx(
        'flex-shrink-0',
        'shadow-[0_0.5px_0_0_var(--Line-100)_inset]',
        'pt-24px',
        'flex items-end justify-center gap-32px',
        'relative',
      )}
    >
      <ModalCloseButton onClick={handleClose} />
      <img
        src="/images/common/rightSidebar/download_phone.png"
        alt="phone"
        className="shrink-0 h-206px"
      />
      <div className="flex flex-col items-center pb-32px">
        <Op7LogoSvg className="w-100px" />
        <div className="mt-4px _tf[16] font-500 leading-[1.5] text-[var(--Text-Main-10)]">
          手机应用程序
        </div>
        <button
          className={clsx(
            'mt-24px shrink-0 w-120px h-40px',
            'bg-[var(--ThemeColor-Main)] rounded-full',
            '_tf[16] font-500 text-[var(--White-100)]',
          )}
          onClick={openDownloadApp}
        >
          APP下载
        </button>
      </div>
    </div>
  );
};

DownloadApp.displayName = 'DownloadApp';

export default memo(DownloadApp);
