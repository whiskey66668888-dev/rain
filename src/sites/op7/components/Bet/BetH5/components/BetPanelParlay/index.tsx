import type { TBetItem } from '@/apis/commonSports/types';
import type { TParlayItem } from '@/apis/commonSports/types';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { getInputError, handleAmountInputChange } from '@/utils/bet';
import some from 'lodash/some';
import { useCallback } from 'react';
import AddMoreBetItem from '../AddMoreBetItem';
import BetInput from '../BetInput';
import BetItem from '../BetItem';
import Keyborad, { type TKeyBoardChange } from '../Keyborad';
import { EOddsStatus } from '@/apis/commonSports/constants';
import { bigNB } from '@/utils/bet/bigMath';

const BetPanelParlay = () => {
  const {
    venue,
    totalBalance,
    parlayBetData: { ids, entities },
    parlayList,
    parlayFocusId,
    parlayShowKeyboard,
    currParlayBetItem,
  } = useBettingData();
  const { clickParlayInput, closeKeyboard, updateParlayBetAmount, hideBetDrawer } = useBetMethods();

  const onKeyboradChangePalay: TKeyBoardChange = useCallback(
    ({ key, value }) => {
      if (key === 'CLOSE') {
        closeKeyboard();
        return;
      }
      if (!currParlayBetItem) {
        return;
      }

      const maxInputAmount = Math.min(+totalBalance, currParlayBetItem.maxBet);

      let betMoneyStr = currParlayBetItem.betAmount;

      switch (key) {
        case 'MAX':
          betMoneyStr = maxInputAmount + '';
          break;
        case 'DELETE':
          betMoneyStr = betMoneyStr.slice(0, -1);
          break;
        case 'QUICK':
          betMoneyStr = bigNB(+betMoneyStr).add(value).toString();
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

      updateParlayBetAmount({
        venue,
        id: currParlayBetItem.parlayCode,
        betAmount: +finalBetMoneyStr > 0 ? finalBetMoneyStr : '',
      });
    },
    [totalBalance, currParlayBetItem, closeKeyboard, updateParlayBetAmount, venue],
  );

  const hasInvalidParlayBetItem = some(
    entities,
    (bItem: TBetItem) => bItem.oddsStatus !== EOddsStatus.Open,
  );

  return (
    <div
      data-desc="h5串关投注面板"
      className="flex-1-col-hidden bg-[var(--Background-300)] min-h-[min(506px,calc(88dvh-46px))] pb-98px"
    >
      <div className="flex-1 gap-8px overflow-y-auto overflow-x-hidden">
        {/* 投注项列表 */}
        <div className="">
          {ids.map((id: string, index: number) => {
            const item = entities[id];
            if (!item) return null;
            return <BetItem key={id} betItem={item} isFirstOne={index === 0} />;
          })}
        </div>

        {/* 添加投注项 */}
        {ids.length < 10 && <AddMoreBetItem onClick={hideBetDrawer} className="mt-16px mx-24px" />}

        {/* 有盘口关闭中 / 投注金额输入框列表 */}
        {hasInvalidParlayBetItem ? (
          <div className="flex justify-center items-center py-24px _tf[12] leading-[1.33] text-[var(--Text-700)]">
            —— 有盘口关闭中 ——
          </div>
        ) : (
          <div className="mt-8px">
            {parlayList.map((item: TParlayItem) => (
              <div
                key={item.parlayCode}
                className="py-10px px-16px flex items-center shadow-[0_-0.5px_0_0_var(--Line-100)_inset]"
              >
                <div className="flex-1 flex flex-wrap items-center gap-4px">
                  <p className="_tf[14] text-[var(--Text-Main-10)] leading-[1.43]">
                    {item.parlayLabel}
                  </p>
                  <p className="_tf[14] font-500 text-[var(--ThemeColor-Main)] leading-[1.43]">
                    <span>@</span>
                    <span className="din-pro">{bigNB(item.parlayOdds).toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4px">
                  <span className="_tf[12] text-[var(--Text-Main-10)] leading-[1.33]">
                    {item.parlaySum}x
                  </span>
                  <BetInput
                    className="w-[150px] h-[36px]"
                    value={item.betAmount}
                    focused={parlayFocusId === item.parlayCode}
                    placeholder={`限额 ${item.minBet}~${item.maxBet}`}
                    placeholderRight
                    onClick={() => clickParlayInput(item.parlayCode)}
                    errorInput={getInputError({
                      betAmount: item.betAmount,
                      totalBalance,
                      minBet: item.minBet,
                      maxBet: item.maxBet,
                    })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Keyborad
        className="pt-10px px-15px"
        onChange={onKeyboradChangePalay}
        open={parlayShowKeyboard}
        isParlay
      />
    </div>
  );
};

export default BetPanelParlay;
