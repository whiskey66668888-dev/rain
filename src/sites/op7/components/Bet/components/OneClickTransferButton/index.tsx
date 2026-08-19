import clsx from 'clsx';
import {
  useOneClickTransfer,
  useOneClickTransferLoading,
} from '@/common/hooks/sports/useOneClickTransfer';
import { useGetVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import { VENUE_GAME_ID } from '@/apis/commonSports/constants';
import { useAppSelector } from '@/core/store/hooks';
import { useCallback } from 'react';
import Button from '@/common/components/Button';

/**
 * 一键转入按钮，PC/H5 公用。
 * 转入的是当前场馆钱包（FB / EB），转完立即刷新该场馆余额。
 */
const OneClickTransferButton = () => {
  const venue = useAppSelector((state) => state.sport.venue);
  const { oneclickTransfer } = useOneClickTransfer();
  const { getVenueBalance } = useGetVenueBalance();
  const { oneClickTransferLoading } = useOneClickTransferLoading();

  const handleClick = useCallback(async () => {
    await oneclickTransfer({ venue, gameId: VENUE_GAME_ID[venue] });
    await getVenueBalance({ venue, isLoading: true });
  }, [oneclickTransfer, getVenueBalance, venue]);

  return (
    <>
      <Button
        onClick={() => {
          handleClick();
        }}
        loading={oneClickTransferLoading}
        size="small"
        className={clsx(
          'flex items-center justify-center shrink-0 px-8px min-w-72px w-auto min-h-24px h-auto lg:min-h-32px',
          'rounded-full border-none whitespace-nowrap',
          '_tf[14] lg:_tf[12]',
          'bg-[var(--White-20)] lg:bg-[var(--ThemeColor-Main)]',
          'text-[var(--White-100)] lg:text-[var(--White-100)]',
          { 'pointer-events-none': oneClickTransferLoading },
        )}
      >
        {oneClickTransferLoading ? '' : '一键转入'}
      </Button>
    </>
  );
};

export default OneClickTransferButton;
