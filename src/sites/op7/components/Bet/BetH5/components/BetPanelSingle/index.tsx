import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { getInputError, handleAmountInputChange } from '@/utils/bet';
import { useCallback, useMemo } from 'react';
import AddMoreBetItem from '../AddMoreBetItem';
import BetInput from '../BetInput';
import BetItem from '../BetItem';
import Keyborad, { type TKeyBoardChange } from '../Keyborad';
import clsx from 'clsx';
import { bigNB } from '@/utils/bet/bigMath';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import styles from './BetPanelSingle.module.scss';
import { PlusIconSvgBold } from '@/sites/op7/components/SvgIcons';
import { useAppSelector } from '@/core/store/hooks';

const formatPreBetOdds = (odds?: string): string => {
  if (!odds) return '';
  const numericOdds = Number(odds);
  if (!Number.isFinite(numericOdds)) return odds;
  return numericOdds.toFixed(2);
};

const BetPanelSingle = () => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const {
    venue,
    totalBalance,
    singleIndex,
    singleBetData: { ids, entities },
    preBetItem,
    currSingleBetItem,
    fbPreBetLimitMap,
  } = useBettingData();
  const {
    updatePreBetOdds,
    openPreBet,
    updateSingleBetAmount,
    hideBetDrawer,
    closePreBet,
    onSingleIndexChange,
  } = useBetMethods();

  const onKeyboradChangeSingle: TKeyBoardChange = useCallback(
    ({ key, value }) => {
      if (!currSingleBetItem) {
        return;
      }
      const maxBet = preBetItem?.preBetInfo?.preBetEnabled
        ? (preBetItem?.preBetInfo?.preBetMaxAmount ?? 0)
        : (currSingleBetItem.maxBet ?? 0);

      const maxInputAmount = Math.min(+totalBalance, maxBet);

      let betMoneyStr = currSingleBetItem.betAmount;
      switch (key) {
        case 'MAX':
          betMoneyStr = maxInputAmount + '';
          break;
        case 'DELETE':
          betMoneyStr = betMoneyStr.slice(0, -1);
          break;
        case 'QUICK':
          betMoneyStr = value;
          break;
        default:
          betMoneyStr += key;
          break;
      }
      betMoneyStr = handleAmountInputChange(betMoneyStr);
      let finalBetMoneyStr = betMoneyStr;
      if (bigNB(+betMoneyStr).gt(maxInputAmount)) {
        finalBetMoneyStr = maxInputAmount.toString();
      }
      updateSingleBetAmount({
        venue,
        betItemId: currSingleBetItem.betItemId,
        betAmount: +finalBetMoneyStr > 0 ? finalBetMoneyStr : '',
      });
    },
    [currSingleBetItem, preBetItem, totalBalance, updateSingleBetAmount, venue],
  );

  const betItemData = useMemo(() => {
    const isPreBetItem = preBetItem?.betItemId === currSingleBetItem?.betItemId;
    const minBet = isPreBetItem
      ? (preBetItem?.preBetInfo?.preBetMinAmount ?? 0)
      : (currSingleBetItem?.minBet ?? 0);
    const maxBet = isPreBetItem
      ? (preBetItem?.preBetInfo?.preBetMaxAmount ?? 0)
      : (currSingleBetItem?.maxBet ?? 0);
    return {
      minBet,
      maxBet,
    };
  }, [currSingleBetItem, preBetItem]);

  const onSlideChange = useCallback(
    (swiper: SwiperClass) => {
      if (currSingleBetItem?.preBetInfo?.preBetEnabled) {
        closePreBet({ venue, betItemId: currSingleBetItem.betItemId });
      }
      onSingleIndexChange(swiper.activeIndex);
    },
    [onSingleIndexChange, currSingleBetItem, closePreBet, venue],
  );

  return (
    <div
      data-desc="h5单关投注面板"
      className="flex-1-col-hidden min-h-[min(506px,calc(88dvh-46px))] pb-98px"
    >
      {currSingleBetItem ? (
        <>
          {/* 投注项swiper */}
          <div className="shrink-0 relative">
            <div className="absolute inset-0 bg-[var(--Background-300)] rounded-t-16px pointer-events-none" />
            <Swiper
              key={ids.join('--')}
              className={clsx(styles.singleBetSwiper, 'w-full')}
              modules={[Pagination]}
              initialSlide={singleIndex}
              onSlideChange={onSlideChange}
              pagination
            >
              {ids.map((id) => {
                const item = entities[id];
                if (!item) return null;
                return (
                  <SwiperSlide key={id}>
                    <BetItem betItem={item} isFirstOne />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
          {/* 投注金额输入框 */}
          <div className="flex px-16px py-14px gap-16px">
            <BetInput
              className="h-[44px]"
              value={currSingleBetItem?.betAmount ?? ''}
              focused
              placeholderRight
              placeholder={
                currSingleBetItem?.isNewlyAdded
                  ? '限额获取中'
                  : `限额 ${betItemData.minBet}~${betItemData.maxBet}`
              }
              errorInput={getInputError({
                betAmount: currSingleBetItem?.betAmount ?? '',
                totalBalance,
                minBet: betItemData.minBet,
                maxBet: betItemData.maxBet,
              })}
            />
            {isLogin && currSingleBetItem.canPreBet && (
              <>
                {currSingleBetItem.preBetInfo?.preBetEnabled ? (
                  <div
                    className={clsx(
                      'flex-1 flex items-center gap-8px overflow-hidden',
                      'shadow-[0_0_0_0.5px_var(--ThemeColor-Main)_inset] rounded-6px p-10px',
                    )}
                  >
                    <button
                      onClick={() =>
                        updatePreBetOdds({
                          venue,
                          betItem: currSingleBetItem,
                          type: 'minus',
                          fbPreBetLimitMap,
                        })
                      }
                      className="shrink-0 flex items-center justify-center w-14px h-14px"
                    >
                      <span className="w-10px h-2px bg-[var(--Text-500)]" />
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-2px overflow-hidden ">
                      <span className="_tf[14] font-medium text-[var(--Text-Main-10)]">@</span>
                      <span className="_tf[18] text-[var(--Text-Main-10)] font-medium din-pro tracking-[-1px] min-w-0 p-0 text-center ">
                        {formatPreBetOdds(currSingleBetItem.preBetInfo?.preBetOdds)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updatePreBetOdds({
                          venue,
                          betItem: currSingleBetItem,
                          type: 'plus',
                          fbPreBetLimitMap,
                        })
                      }
                      className="shrink-0 flex items-center justify-center w-14px h-14px"
                    >
                      <PlusIconSvgBold className="w-10px h-10px text-[var(--Text-500)]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={clsx(
                      '_tf[16] h-44px px-26px rounded-6px bg-[var(--Background-500)] text-[var(--ThemeColor-Main)] font-semibold',
                      'flex items-center gap-2px',
                    )}
                    onClick={() => {
                      openPreBet({ venue, betItemId: currSingleBetItem.betItemId });
                    }}
                  >
                    <PlusIconSvgBold className="w-8px h-8px" />
                    <span>预约</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* 键盘 */}
          <div className="overflow-y-auto">
            <Keyborad onChange={onKeyboradChangeSingle} open={true} className="px-15px" />
          </div>
        </>
      ) : (
        <div className="min-h-[30vh] bg-[var(--Background-300)] px-[16px]">
          <AddMoreBetItem className="py-20px" onClick={hideBetDrawer} />
        </div>
      )}
    </div>
  );
};

export default BetPanelSingle;
