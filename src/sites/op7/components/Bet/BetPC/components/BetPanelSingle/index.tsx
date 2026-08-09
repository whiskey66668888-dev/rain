import dayjs from 'dayjs';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods, { usePlacePreBet } from '@/common/hooks/bet/useBetMethods';
import QuickAmount from '../QuickAmount';
import clsx from 'clsx';
import Empty from '@/common/components/Empty';
import { bigNB } from '@/utils/bet/bigMath';
import { EOddsChange, EOddsStatus, ESportsLeftPanelType } from '@/apis/commonSports/constants';
import MarketStatusTips from '../MarketStatusTips';
import { useGetVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import {
  ClearInputXSvg,
  LeftLine2x18Svg,
  MinusIconSvg,
  OddsChangeArrowSvg,
  PlusIconSvgBold,
} from '@/sites/op7/components/SvgIcons';
import { CloseSvg } from '@/sites/op7/components/SvgIcons';
import Button from '@/common/components/Button';
import { useCallback } from 'react';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { useAppSelector } from '@/core/store/hooks';

const BetPanelSingle = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const autoFollowMatch = useAppSelector((state) => state.user.autoFollowMatch);
  const {
    venue,
    totalBalance,
    preBetItem,
    singleBetData: { ids, entities },
    fbPreBetLimitMap,
    isParlay,
    quickAmountInputId,
    showBetPanel,
    currStep,
    syncSingleParlay,
  } = useBettingData();
  const {
    amountInputChangeSingle,
    openPreBet,
    closePreBet,
    updatePreBetOdds,
    quickAmountSelectSingle,
    setQuickAmountInput,
    removeBetItem,
    hideBetDrawer,
  } = useBetMethods();
  const { placePreBet } = usePlacePreBet();
  const { getVenueBalance } = useGetVenueBalance();
  const { switchSportsLeftPanelType } = useSportsMainListControl();

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

  return (
    <div
      data-desc="pc单关投注面板"
      className={clsx('overflow-y-auto px-12px flex flex-col gap-4px', !ids.length && 'flex-1')}
    >
      {ids.length ? (
        <>
          {ids.toReversed().map((id) => {
            const item = entities[id];
            if (!item) return null;
            const isChampion = item.isChampion;
            const isPreBetItem = preBetItem?.betItemId === item.betItemId;
            const isDisabled = !!preBetItem && !isPreBetItem;
            const minBet = isPreBetItem
              ? (preBetItem?.preBetInfo?.preBetMinAmount ?? 0)
              : (item.minBet ?? 0);
            const maxBet = isPreBetItem
              ? (preBetItem?.preBetInfo?.preBetMaxAmount ?? 0)
              : (item.maxBet ?? 0);
            // 盘口关闭
            const isOddsClosed = item.oddsStatus !== EOddsStatus.Open;
            const oddUp = showBetPanel && item.oddsChange === EOddsChange.Up;
            const oddDown = showBetPanel && item.oddsChange === EOddsChange.Down;
            return (
              <div
                key={id}
                className={clsx(
                  'shrink-0 rounded-6px overflow-hidden',
                  (isDisabled || isOddsClosed) && 'opacity-50 pointer-events-none',
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
                      className="shrink-0 flex pt-3px  pointer-events-auto"
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
                        {item.matchStartTime
                          ? dayjs(item.matchStartTime).format('MM/DD HH:mm')
                          : ''}
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
                        {item.canPreBet && !isPreBetItem && (
                          <button
                            className="text-[var(--ThemeColor-Main)] font-medium"
                            onClick={() => openPreBet({ venue, betItemId: item.betItemId })}
                          >
                            +预约
                          </button>
                        )}
                      </div>
                      {/* 第三行：主客队名称  +  非串icon/删除icon */}
                      {/* <div className="mt-4px flex items-center justify-between gap-2">
                          <div className="_tf[12] font-500 text-[var(--Text-800)] leading-[1.3333] truncate">
                            {!betItem.isChampion &&
                              betItem.homeName &&
                              betItem.awayName &&
                              `${betItem.homeName} vs ${betItem.awayName}`}
                          </div>

                          <div className="shrink-0 flex gap-8px items-center">
                            {!betItem.canParlay && <NoParlaySvg className="w-16px h-16px text-[var(--Text-700)]" />}
                            {showBetPanel && (
                              <DeleteSvg
                                className="w-16px h-16px text-[var(--Text-800)] cursor-pointer"
                                onClick={handleDelete}
                              />
                            )}
                            {orderStatus !== undefined && <OrderStatusIcon orderStatus={orderStatus} />}
                          </div>
                        </div> */}

                      {item.canPreBet && isPreBetItem && (
                        <>
                          <div className="flex items-center gap-8px overflow-hidden bg-[var(--Background-500)] rounded-4px">
                            <button
                              onClick={() =>
                                updatePreBetOdds({
                                  venue,
                                  betItem: item,
                                  type: 'minus',
                                  fbPreBetLimitMap,
                                })
                              }
                              className={clsx(
                                'shrink-0 flex items-center justify-center w-20px h-20px rounded-4px',
                                'bg-[var(--Background-300)] border-1px border-solid border-[var(--Line-100)]',
                                'rounded-l-4px',
                              )}
                            >
                              <MinusIconSvg className="w-8px h-2px bg-[var(--Text-800)]" />
                            </button>
                            <div className="_tf[12] leading-[1.43] flex-1 text-center text-[var(--Text-Main-10)]">
                              <span>@</span>
                              <span className="din-pro">
                                {bigNB(item.preBetInfo?.preBetOdds || 0).toFixed(2)}
                              </span>
                            </div>
                            {/* <input
                              type="text"
                              inputMode="decimal"
                              className="_tf[12] leading-[1] min-w-0 p-0 text-center din-pro text-[var(--Text-Main-10)]"
                              value={`@${bigNB(item.preBetInfo?.preBetOdds || 0).toFixed(2)}`}
                              disabled
                              // onChange={(e) =>
                              //   updatePreBetOdds({
                              //     venue,
                              //     betItem: item,
                              //     value: e.target.value,
                              //     type: 'manualInput',
                              //     fbPreBetLimitMap,
                              //   })
                              // }
                            /> */}
                            <button
                              onClick={() =>
                                updatePreBetOdds({
                                  venue,
                                  betItem: item,
                                  type: 'plus',
                                  fbPreBetLimitMap,
                                })
                              }
                              className={clsx(
                                'shrink-0 flex items-center justify-center w-20px h-20px rounded-4px',
                                'bg-[var(--Background-300)] border-1px border-solid border-[var(--Line-100)]',
                                'rounded-r-4px',
                              )}
                            >
                              <PlusIconSvgBold className="w-8px h-8px text-[var(--Text-800)]" />
                            </button>
                          </div>
                          <div className="_tf[10] text-[var(--Text-800)] leading-[1]">
                            输入要预约的赔率
                          </div>
                        </>
                      )}
                    </div>

                    {/* 投注金额输入框 */}
                    <div className={clsx('bet-amount-input-wrapper')}>
                      <input
                        className="bet-amount-input h-30px placeholder:text-[var(--Text-700)] placeholder:_tf[12] placeholder:din-pro"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        disabled={!!item.isNewlyAdded || maxBet === 0}
                        value={item.betAmount}
                        onChange={(e) =>
                          amountInputChangeSingle({
                            venue,
                            betItem: isPreBetItem ? preBetItem : item,
                            value: e.target.value,
                            totalBalance,
                          })
                        }
                        placeholder={item.isNewlyAdded ? '限额获取中' : `限额 ${minBet}-${maxBet}`}
                        onFocus={() => setQuickAmountInput(item.betItemId)}
                      />
                      {!!item.betAmount && (
                        <button
                          className="bet-amount-input-clear"
                          onClick={() =>
                            amountInputChangeSingle({
                              venue,
                              betItem: item,
                              value: '',
                              totalBalance,
                            })
                          }
                        >
                          <ClearInputXSvg className="w-10px h-10px text-[var(--Text-700)]" />
                        </button>
                      )}
                    </div>

                    {/* 该投注项最高可赢 */}
                    <div className="flex justify-between _tf[12] leading-[1.33]">
                      <p className="text-[var(--Text-800)]">可返还</p>
                      <p className="text-[var(--Text-Main-10)] font-medium din-pro">
                        {isPreBetItem
                          ? bigNB(item.betAmount || 0)
                              .times(item.preBetInfo?.preBetOdds || 0)
                              .toFixed(2)
                          : bigNB(item.betAmount || 0)
                              .times(item.baseOdds || 0)
                              .toFixed(2)}
                      </p>
                    </div>

                    {/* 快速投注按钮 */}
                    {quickAmountInputId === item.betItemId && (
                      <QuickAmount
                        onSelect={(value) =>
                          quickAmountSelectSingle({
                            venue,
                            betItem: item,
                            value,
                            totalBalance,
                          })
                        }
                      />
                    )}

                    {isPreBetItem && (
                      <div className="flex items-center justify-center gap-4px">
                        <Button
                          type="third"
                          size="small"
                          className="h-[32px] w-[56px] px-[2px] rounded-[4px] text-[var(--ThemeColor-Main)] pointer-events-auto"
                          onClick={() => closePreBet({ venue, betItemId: item.betItemId })}
                        >
                          取消
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          className="h-[32px] flex-1 rounded-[4px] px-[2px] gap-[4px]"
                          disabled={
                            !item.betAmount ||
                            bigNB(item.betAmount).lt(minBet) ||
                            bigNB(item.betAmount).gt(maxBet)
                          }
                          loading={currStep.fetching}
                          onClick={() => {
                            placePreBet({
                              venue,
                              betItem: item,
                              callback: () => {
                                getVenueBalance({ venue });
                              },
                              isMobile,
                              autoFollowMatch,
                            });
                          }}
                        >
                          确认预约投注
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <MarketStatusTips
                  marketValueChange={!!item.marketValueChange}
                  oddsClosed={isOddsClosed}
                />
              </div>
            );
          })}
        </>
      ) : (
        <Empty text="暂无投注" variant="card" imgWrapClassName="w-[64px] h-[64px]" />
      )}
    </div>
  );
};

export default BetPanelSingle;
