import { TBetItem } from '@/apis/commonSports/types';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import type { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';
import useBetMethods, { usePlaceBet, usePlacePreBet } from '@/common/hooks/bet/useBetMethods';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useGetVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import Switch from '@/common/components/Switch';
import Button from '@/common/components/Button';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { selectAllParlayBetItems } from '@/core/store/selectors/betSelectors';

const BetPanelActionBar = () => {
  const bettingData: TUseVenueBetData = useBettingData();
  const {
    venue,
    isParlay,
    preBetItem,

    parlayBetData,
    parlayList,
    currStep,
    totalCanWinAmountH5: totalCanWinAmount,
    totalBetAmountH5: totalBetAmount,
    betBtnDisabledH5: betBtnDisabled,
    defaultAmount,

    acceptOddsPrefer,
    currSingleBetItem,
    isChatBet,
  } = bettingData;
  const currentSingleBetItem: TBetItem | undefined = currSingleBetItem;
  const currentPreBetItem: TBetItem | undefined = preBetItem;
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const autoFollowMatch = useAppSelector((state) => state.user.autoFollowMatch);
  const { getVenueBalance } = useGetVenueBalance();
  const { clearBet, closePreBet, toggleDefaultAmount, hideBetDrawer } = useBetMethods();
  const { placeBet } = usePlaceBet();
  const { placePreBet } = usePlacePreBet();

  const callback = useCallback(() => {
    getVenueBalance({ venue });
  }, [getVenueBalance, venue]);

  const handleBet = useCallback(() => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }
    if (!!currentPreBetItem) {
      placePreBet({ venue, betItem: currentPreBetItem, callback, isMobile, autoFollowMatch });
      return;
    }
    let betItemList: TBetItem[] = [];
    if (isParlay) {
      betItemList = selectAllParlayBetItems(parlayBetData);
    } else if (currentSingleBetItem?.betAmount) {
      betItemList = [currentSingleBetItem];
    } else {
      return;
    }
    placeBet({
      venue,
      acceptOddsPrefer,
      isParlay,
      betItemList,
      parlayList: isParlay ? parlayList.filter((item) => +item.betAmount > 0) : [],
      /** 默认金额功能开启状态，并且单关单项投注时，更新默认金额 */
      updatedDefaultAmount: !!defaultAmount ? currentSingleBetItem?.betAmount : '',
      callback,
      autoFollowMatch,
    });
  }, [
    dispatch,
    isLogin,
    currentPreBetItem,
    isParlay,
    currentSingleBetItem,
    placeBet,
    venue,
    acceptOddsPrefer,
    parlayList,
    defaultAmount,
    callback,
    placePreBet,
    parlayBetData,
    autoFollowMatch,
    isMobile,
  ]);

  const onChange = useCallback(() => {
    if (!currentSingleBetItem) {
      return;
    }
    toggleDefaultAmount({ venue, betItem: currentSingleBetItem, defaultAmount });
  }, [toggleDefaultAmount, venue, currentSingleBetItem, defaultAmount]);

  return (
    <div className="absolute bottom-0 inset-x-0 px-12px pt-10px h-98px bg-[var(--Background-300)]">
      <div className={clsx('flex items-center gap-8px justify-between')}>
        <div className="min-h-24px">
          {!isParlay && !isChatBet && !!currentSingleBetItem && !currentSingleBetItem.canParlay && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="w-[24px] h-[24px]"
              fill="none"
            >
              <path
                d="M17.5859 11.876V16.0625H12.6719V18.4277H11.3281V16.0625H10.0586L11.1934 14.9277H11.3281V14.793L12.6719 13.4492V14.9277H16.2422V13.0098H13.1123L14.2461 11.876H17.5859ZM8.86914 13.0098H7.78613V14.0928L6.44141 15.4375V11.876H10.0029L8.86914 13.0098ZM17.0537 10.6865H15.4355L17.0537 9.06738V10.6865ZM12.6719 6.86426H15.0146L13.8809 7.99805H12.6719V9.20703L11.1924 10.6865H6.95996V6.86426H11.3281V5.49219H12.6719V6.86426ZM8.30371 9.55176H11.3281V7.99805H8.30371V9.55176Z"
                fill="var(--Text-Main-10)"
              />
              <path
                d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM18.0107 6.69727L6.69629 18.0107L5.98926 17.3037L17.3027 5.99023L18.0107 6.69727Z"
                fill="#FF6666"
              />
            </svg>
          )}
        </div>
        {isParlay ? (
          <div className="flex items-center gap-4px">
            <p className="_tf[14] text-[var(--Text-800)]">总本金：</p>
            <p className="_tf[20] text-[var(--Text-Main-10)] font-500 din-pro leading-[24px]">
              {totalBetAmount}
            </p>
          </div>
        ) : currentSingleBetItem ? (
          <div className="flex items-center gap-4px">
            <p className="_tf[14] text-[var(--Text-Main-10)]">设置为默认金额</p>
            <Switch checked={!!defaultAmount} onChange={onChange} />
          </div>
        ) : null}
      </div>
      <div className="mt-8px flex gap-8px">
        <div className="flex-shrink-0 flex">
          <button
            className={clsx(
              'shrink-0 w-96px h-44px flex items-center justify-center rounded-[8px] bg-[var(--Background-500)]',
              '_tf[16] font-semibold text-[var(--Text-800)]',
            )}
            onClick={() => {
              if (!!currentPreBetItem) {
                closePreBet({ venue, betItemId: currentPreBetItem.betItemId });
              } else {
                hideBetDrawer();
                clearBet();
              }
            }}
          >
            {!!currentPreBetItem ? '关闭预约' : '清除'}
          </button>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={handleBet}
          loading={!!currStep.fetching}
          disabled={betBtnDisabled && isLogin}
          className="flex-1 rounded-[8px] h-[44px]"
        >
          {isLogin ? (
            <div className="flex gap-2px flex-col items-center justify-center">
              <p className="_tf[16] font-500 leading-[1] text-[var(--White-100)]">
                {!!currentPreBetItem ? '预约投注' : '投注'}
              </p>
              <p
                className={clsx(
                  'leading-[1]',
                  betBtnDisabled && isLogin ? 'text-[var(--White-100)]' : 'text-[var(--White-60)] ',
                )}
              >
                <span className="_tf[12]">可返还&nbsp;</span>
                <span className="_tf[16] din-pro font-500">{totalCanWinAmount}</span>
              </p>
            </div>
          ) : (
            '登录进行投注'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BetPanelActionBar;
