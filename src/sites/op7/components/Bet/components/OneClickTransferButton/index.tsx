import clsx from 'clsx';
import {
  useOneClickTransfer,
  useOneClickTransferLoading,
} from '@/common/hooks/sports/useOneClickTransfer';
import { useGetVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import { EVenue } from '@/apis/commonSports/constants';
import { useCallback } from 'react';
import Button from '@/common/components/Button';

/**
 * 一键转入按钮，PC/H5 公用。
 * 点击逻辑后续在 useBetMethods 或此处补充。
 */
const OneClickTransferButton = () => {
  const { oneclickTransfer } = useOneClickTransfer();
  const { getVenueBalance } = useGetVenueBalance();
  const { oneClickTransferLoading } = useOneClickTransferLoading();

  const handleClick = useCallback(async () => {
    await oneclickTransfer({ venue: EVenue.FB, gameId: 89 });
    await getVenueBalance({ venue: EVenue.FB, isLoading: true });
  }, [oneclickTransfer, getVenueBalance]);

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
