import type { TParlayItem } from '@/apis/commonSports/types';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { EOddsChange, EOddsStatus, ESportsLeftPanelType } from '@/apis/commonSports/constants';
import Empty from '@/common/components/Empty';
import clsx from 'clsx';
import MarketStatusTips from '../MarketStatusTips';
import QuickAmount from '../QuickAmount';
import {
  ClearInputXSvg,
  CloseSvg,
  LeftLine2x18Svg,
  OddsChangeArrowSvg,
  TriangleUpSvg,
} from '@/sites/op7/components/SvgIcons';
import { useCallback, useMemo, useState } from 'react';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { bigNB } from '@/utils/bet/bigMath';

const BetPanelParlay = () => {
  const {
    venue,
    totalBalance,
    parlayBetData: { ids, entities },
    parlayList,
    quickAmountInputId,
    isParlay,
    showBetPanel,
    syncSingleParlay,
  } = useBettingData();
  const [showOtherParlayItems, setShowOtherParlayItems] = useState(false);
  const {
    amountInputChangeParlay,
    quickAmountSelectParlay,
    setQuickAmountInput,
    removeBetItem,
    hideBetDrawer,
  } = useBetMethods();
  const { switchSportsLeftPanelType } = useSportsMainListControl();

  const [firstParlayItem, otherParlayItems] = useMemo(
    () => [parlayList[0], parlayList.slice(1)],
    [parlayList],
  );

  const handleDelete = useCallback(
    (betItemId: string) => {
      if (ids.length === 1 && ids[0] === betItemId) {
        hideBetDrawer();
        switchSportsLeftPanelType(ESportsLeftPanelType.MENU);
      }
      removeBetItem({ venue, isParlay, betItemId, syncSingleParlay });
    },
    [
      hideBetDrawer,
      ids,
      isParlay,
      removeBetItem,
      switchSportsLeftPanelType,
      syncSingleParlay,
      venue,
    ],
  );

  const renderParlayItem = useCallback(
    (item: TParlayItem) => {
      return (
        <div className="flex flex-col gap-8px">
          {/* 串关label + 赔率 */}
          <div className="flex items-center justify-between gap-4px">
            <span className="_tf[12] leading-[1.33] font-medium text-[var(--Text-Main-10)] ">
              {item.parlayLabel}*{item.parlaySum}
            </span>
            <span className="_tf[12] leading-[1.33] font-medium text-[var(--Text-Main-10)]">
              @<i className="not-italic din-pro">{bigNB(item.parlayOdds).toFixed(2)}</i>
            </span>
          </div>
          <div className={clsx('bet-amount-input-wrapper')}>
            <input
              className="bet-amount-input w-full h-30px placeholder:text-[var(--Text-700)] placeholder:_tf[12] placeholder:din-pro"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              disabled={item.maxBet === 0}
              value={item.betAmount}
              onChange={(e) =>
                amountInputChangeParlay({
                  venue,
                  parlayItem: item,
                  value: e.target.value,
                  totalBalance,
                })
              }
              placeholder={`限额 ${item.minBet}-${item.maxBet}`}
              onFocus={() => setQuickAmountInput(item.parlayCode)}
            />
            {!!item.betAmount && (
              <button
                className="bet-amount-input-clear"
                onClick={() =>
                  amountInputChangeParlay({
                    venue,
                    parlayItem: item,
                    value: '',
                    totalBalance,
                  })
                }
              >
                <ClearInputXSvg className="w-10px h-10px text-[var(--Text-700)]" />
              </button>
            )}
          </div>
          {quickAmountInputId === item.parlayCode && (
            <QuickAmount
              className="mt-8px"
              onSelect={(value) => {
                quickAmountSelectParlay({
                  venue,
                  parlayItem: item,
                  value,
                  totalBalance,
                });
              }}
            />
          )}
        </div>
      );
    },
    [
      amountInputChangeParlay,
      quickAmountInputId,
      quickAmountSelectParlay,
      setQuickAmountInput,
      totalBalance,
      venue,
    ],
  );

  return (
    <div
      data-desc="pc串关投注面板"
      className={clsx('flex flex-col overflow-y-auto px-12px', !ids.length && 'flex-1')}
    >
      {ids.length > 0 ? (
        <>
          <div className="flex-shrink-0 flex flex-col gap-4px">
            {ids.toReversed().map((id: string) => {
              const item = entities[id];
              if (!item) return null;
              const isOddsClosed = item.oddsStatus !== EOddsStatus.Open;
              const isDisabled = isOddsClosed;
              const isChampion = item.isChampion;
              const oddUp = showBetPanel && item.oddsChange === EOddsChange.Up;
              const oddDown = showBetPanel && item.oddsChange === EOddsChange.Down;
              return item ? (
                <div
                  key={id}
                  className={clsx(
                    'shrink-0 rounded-6px overflow-hidden',
                    isDisabled && 'opacity-50 pointer-events-none',
                  )}
                >
                  <div className="bg-[var(--Background-500)]">
                    {/* 主客队名称 + 删除按钮 */}
                    <div className="px-10px flex gap-8px justify-between relative py-7px">
                      <LeftLine2x18Svg className="absolute left-0 top-6px text-[var(--ThemeColor-Main)]" />
                      <div className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)]">
                        {isChampion ? '冠军' : `${item.homeName} vs ${item.awayName}`}
                      </div>
                      <button
                        className="shrink-0 flex pt-3px pointer-events-auto"
                        onClick={() => handleDelete(item.betItemId)}
                      >
                        <CloseSvg className="w-8px h-8px text-[var(--Text-700)]" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-8px px-10px pb-8px">
                      {/* 联赛名称 + 开赛时间 */}
                      <div className="flex gap-4px justify-between">
                        <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">
                          {item.leagueName}
                        </div>
                        <div className="shrink-0 _tf[12] font-medium leading-[1.33] din-pro text-[var(--Text-800)]">
                          03/20 03:30
                        </div>
                      </div>
                      {/* 卡片中带背景色的内容 */}
                      <div
                        className={clsx(
                          'flex flex-col gap-8px bg-[var(--Background-300)] rounded-6px px-10px py-8px',
                        )}
                      >
                        {/* 第一行：是否滚球 + 玩法名称 + 盘口类型 */}
                        <div className="_tf[12] leading-[1.33] text-[var(--Text-Main-10)]">
                          {item.isLive && <span className="mr-2px">滚球</span>}
                          <span className="">{item.playName}</span>
                          {item.score && (
                            <span className="ml-2px">
                              (<i className="din-pro not-italic">{item.score}</i>)
                            </span>
                          )}
                          <span className="ml-2px text-[var(--Text-800)]">[欧洲盘]</span>
                        </div>

                        {/* 第二行：投注项名称 */}
                        <div className="_tf[12] text-[var(--Text-Main-10)] leading-[1.3333] din-pro">
                          <span>{item.betItemFullName}</span>
                        </div>

                        {/* 第三行：赔率 + 开启预约按钮 */}
                        <div className="flex items-center justify-between _tf[12] leading-[1.33]">
                          <div
                            className={clsx('shrink-0 relative', {
                              'text-[var(--Text-Main-10)]': !oddUp && !oddDown,
                              'text-[var(--Red-300)]': oddUp,
                              'text-[var(--Green-300)]': oddDown,
                            })}
                          >
                            <span>@</span>
                            <span className="din-pro">{bigNB(item.baseOdds).toFixed(2)}</span>
                            <OddsChangeArrowSvg
                              className={clsx(
                                'w-6px absolute right-[-8px] top-1/2 -translate-y-1/2',
                                {
                                  'rotate-180': oddDown,
                                  hidden: !oddUp && !oddDown,
                                },
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <MarketStatusTips
                    marketValueChange={!!item.marketValueChange}
                    oddsClosed={isOddsClosed}
                  />
                </div>
              ) : null;
            })}
          </div>
          {parlayList.length > 0 && (
            <div className="shrink-0 p-10px mt-4px bg-[var(--Background-500)] rounded-6px">
              {!!firstParlayItem && (
                <div>
                  {renderParlayItem(firstParlayItem)}
                  {otherParlayItems.length > 0 && (
                    <button
                      className="w-full mt-8px flex items-center justify-between gap-4px text-[var(--ThemeColor-Main)]"
                      onClick={() => setShowOtherParlayItems((prev) => !prev)}
                    >
                      <p className="_tf[12] leading-[1.3333]">
                        {showOtherParlayItems ? '收起更多串关' : '展示更多串关'}
                      </p>
                      <TriangleUpSvg
                        className={clsx('w-12px h-12px transition-transform duration-200', {
                          'rotate-180': !showOtherParlayItems,
                        })}
                      />
                    </button>
                  )}
                </div>
              )}
              {otherParlayItems.length > 0 &&
                showOtherParlayItems &&
                otherParlayItems.map((item: TParlayItem) => {
                  return (
                    <div key={item.parlayCode}>
                      <div className="h-1px bg-[var(--Line-200)] my-8px"></div>
                      {renderParlayItem(item)}
                    </div>
                  );
                })}
            </div>
          )}
        </>
      ) : (
        <Empty text="暂无投注" variant="card" imgWrapClassName="w-[64px] h-[64px]" />
      )}
    </div>
  );
};

export default BetPanelParlay;
