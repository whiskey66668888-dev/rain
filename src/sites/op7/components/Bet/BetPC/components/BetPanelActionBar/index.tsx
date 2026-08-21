import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods, { usePlaceBet } from '@/common/hooks/bet/useBetMethods';
import clsx from 'clsx';
import { EOddsStatus, ESportsLeftPanelType } from '@/apis/commonSports/constants';
import type { TBetItem } from '@/apis/commonSports/types';
import { useGetVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import { useCallback, useMemo } from 'react';
import Button from '@/common/components/Button';
import QuickAmount from '../QuickAmount';
import { ClearInputXSvg, CloseSvg } from '@/sites/op7/components/SvgIcons';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import {
  selectAllParlayBetItems,
  selectAllSingleBetItems,
} from '@/core/store/selectors/betSelectors';

const BetPanelActionBar = () => {
  const {
    venue,
    isParlay,
    singleBetData,
    parlayBetData,
    parlayList,
    currStep,
    preBetItem,
    betBtnDisabled,
    acceptOddsPrefer,
    totalBalance,
    singleBatchAmount,
    quickAmountInputId,
    totalBetAmount,
    totalCanWinAmount,
  } = useBettingData();
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const autoFollowMatch = useAppSelector((state) => state.user.autoFollowMatch);
  const { getVenueBalance } = useGetVenueBalance();
  const { switchSportsLeftPanelType } = useSportsMainListControl();
  const { clearBet, amountInputChangeSingleBatch, setQuickAmountInput, removeInvalidBetItems } =
    useBetMethods();
  const { placeBet } = usePlaceBet();

  const invalidBetItemIds = useMemo(() => {
    const items: TBetItem[] = isParlay
      ? selectAllParlayBetItems(parlayBetData)
      : selectAllSingleBetItems(singleBetData);
    return items
      .filter((item) => item.oddsStatus !== EOddsStatus.Open)
      .map((item) => item.betItemId);
  }, [isParlay, parlayBetData, singleBetData]);

  const singleBatchLimitInfo = useMemo(() => {
    const items: TBetItem[] = selectAllSingleBetItems(singleBetData);
    let minBet = 0;
    let maxBet = 999999;
    let hasNewlyAdded = false;
    items.forEach((item) => {
      minBet = Math.max(minBet, item.minBet);
      maxBet = Math.min(maxBet, item.maxBet);
      hasNewlyAdded = hasNewlyAdded || item.isNewlyAdded;
    });
    const err = maxBet < minBet;
    return {
      minBet: err ? 0 : minBet,
      maxBet: err ? 0 : maxBet,
      hasNewlyAdded,
    };
  }, [singleBetData]);

  const handleBet = useCallback(() => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }
    const parlayItems: TBetItem[] = selectAllParlayBetItems(parlayBetData);
    const singleItems: TBetItem[] = selectAllSingleBetItems(singleBetData);
    placeBet({
      venue,
      acceptOddsPrefer,
      isParlay,
      betItemList: isParlay
        ? parlayItems
        : singleItems.filter((item) => item.oddsStatus === EOddsStatus.Open && +item.betAmount > 0),
      parlayList: isParlay ? parlayList.filter((item) => +item.betAmount > 0) : [],
      callback: () => {
        getVenueBalance({ venue });
      },
      autoFollowMatch,
    });
  }, [
    dispatch,
    isLogin,
    venue,
    isParlay,
    singleBetData,
    parlayBetData,
    parlayList,
    placeBet,
    getVenueBalance,
    acceptOddsPrefer,
    autoFollowMatch,
  ]);

  if (
    (!isParlay && singleBetData.ids.length < 1) ||
    (!isParlay &&
      singleBetData.ids.length === 1 &&
      singleBetData.ids[0] === (preBetItem ? preBetItem.betItemId : undefined)) ||
    (isParlay && parlayBetData.ids.length < 1)
  ) {
    return null;
  }

  return (
    <div
      className={clsx('mt-4px px-12px pb-12px', {
        'opacity-50 pointer-events-none': !isParlay && !!preBetItem,
      })}
    >
      <div className="bg-[var(--Background-500)] rounded-6px p-10px flex flex-col gap-8px">
        {!isParlay && singleBetData.ids.length > 1 && (
          <div className={clsx('flex flex-col gap-8px')}>
            <div className="_tf[12] leading-[1.33] font-medium text-[var(--Text-Main-10)]">
              单场*{singleBetData.ids.length}
            </div>
            {/* 投注金额输入框 */}
            <div className={clsx('bet-amount-input-wrapper')}>
              <input
                className="bet-amount-input h-30px placeholder:text-[var(--Text-700)] placeholder:_tf[12] placeholder:din-pro"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={singleBatchLimitInfo.hasNewlyAdded || singleBatchLimitInfo.maxBet === 0}
                value={singleBatchAmount}
                onChange={(e) =>
                  amountInputChangeSingleBatch({
                    venue,
                    maxBet: singleBatchLimitInfo.maxBet,
                    value: e.target.value,
                    totalBalance,
                  })
                }
                placeholder={
                  singleBatchLimitInfo.hasNewlyAdded
                    ? '限额获取中'
                    : `限额 ${singleBatchLimitInfo.minBet}-${singleBatchLimitInfo.maxBet}`
                }
                onFocus={() => setQuickAmountInput('BATCH_SINGLE')}
              />
              {!!singleBatchAmount && (
                <button
                  className="bet-amount-input-clear"
                  onClick={() =>
                    amountInputChangeSingleBatch({
                      venue,
                      maxBet: singleBatchLimitInfo.maxBet,
                      value: '',
                      totalBalance,
                    })
                  }
                >
                  <ClearInputXSvg className="w-10px h-10px text-[var(--Text-700)]" />
                </button>
              )}
            </div>

            {/* 快速投注按钮 */}
            {quickAmountInputId === 'BATCH_SINGLE' && (
              <QuickAmount
                onSelect={(value) =>
                  amountInputChangeSingleBatch({
                    venue,
                    maxBet: singleBatchLimitInfo.maxBet,
                    value: value === 'MAX' ? totalBalance : value,
                    totalBalance,
                  })
                }
              />
            )}
          </div>
        )}

        {/* 单关时，投注项大于1时显示，串关始终显示 */}
        {(isParlay || (!isParlay && singleBetData.ids.length > 1)) && (
          <>
            {/* 总投注额 */}
            <div className="flex justify-between _tf[12] leading-[1.33]">
              <p className="text-[var(--Text-800)]">总投注额</p>
              <p className="text-[var(--Text-Main-10)] font-medium din-pro">{totalBetAmount}</p>
            </div>

            {/* 可返还 */}
            <div className="flex justify-between _tf[12] leading-[1.33]">
              <p className="text-[var(--Text-800)]">可返还</p>
              <p className="text-[var(--Text-Main-10)] font-medium din-pro">{totalCanWinAmount}</p>
            </div>

            <div className="border-t-0.5px border-t-solid border-t-[var(--Line-200)]" />
          </>
        )}

        {invalidBetItemIds.length > 0 && (
          <button
            className={clsx(
              'w-full flex gap-4px items-center justify-center rounded-4px py-6px',
              'bg-[var(--Red-100)] _tf[10] leading-[1.2]',
              'text-[var(--Red-300)] pointer-events-auto',
            )}
            onClick={() =>
              removeInvalidBetItems({ venue, betItemIds: invalidBetItemIds, isParlay })
            }
          >
            <p>*移除无效投注项</p>
            <CloseSvg className="w-10px h-10px text-[var(--Red-300)]" />
          </button>
        )}

        <div className="flex items-center gap-4px">
          <Button
            type="third"
            size="small"
            className="h-[32px] text-[var(--ThemeColor-Main)] font-medium rounded-[4px] w-[56px] pointer-events-auto"
            onClick={() => {
              clearBet();
              switchSportsLeftPanelType(ESportsLeftPanelType.MENU);
            }}
          >
            删除
          </Button>
          <Button
            type="primary"
            size="small"
            className="h-[32px] rounded-[4px] flex-1"
            loading={!!currStep.fetching}
            disabled={betBtnDisabled && isLogin}
            onClick={handleBet}
          >
            {isLogin ? '确认投注' : <span className="text-12px">登录进行投注</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BetPanelActionBar;
