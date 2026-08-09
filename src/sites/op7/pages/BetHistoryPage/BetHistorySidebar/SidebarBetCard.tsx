import { useState, memo, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import type {
  MatchBaseInfo,
  TBetHistoryOrderItem,
  THistoryBetItem,
} from '@/apis/commonSports/types';
import Timing from '@/common/components/Timing';
import { EBetHistoryTab, EBetOrderStatus } from '@/apis/commonSports/constants';
import {
  ArrowRightSvg,
  BetConfirmingSvg,
  CopySvg,
  LeftLine2x18Svg,
  MinusIconSvg,
  PlusIconSvgBold,
} from '@/sites/op7/components/SvgIcons';
import CopyButton from '@/sites/op7/components/CopyButton';
import { useAppSelector } from '@/core/store/hooks';
import { openBetShare } from '@/sites/op7/pages/SportsDetailsPage/components/share/betShareStore';
import { bigNB } from '@/utils/bet/bigMath';
import { UNSETTLED_STATUS_CONFIG } from '../BetHistoryH5/constants';
import Button from '@/common/components/Button';
import SliderInput from '@/common/components/SliderInput';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { useVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import {
  calcEarlySettleStats,
  calcReserveSliderValues,
  calcReserveStepState,
} from '@/utils/betHistory';

interface Props {
  order: TBetHistoryOrderItem;
}

const LiveStageInfo = ({ match }: { match: MatchBaseInfo }) => {
  const score = useMemo(() => {
    if (match.sportName === '网球') return match.scoreAll?.[match.scoreAll.length - 1] ?? '';
    return `${match.homeScore}-${match.awayScore}`;
  }, [match.sportName, match.scoreAll, match.homeScore, match.awayScore]);

  return (
    <div className="_tf[12] shrink-0 flex items-center gap-2px text-[var(--Text-800)]">
      <BetConfirmingSvg className="w-12px" />
      <span>{match.periodName}</span>
      {match.matchTime !== 0 && (
        <Timing
          time={match.matchTime}
          running={match.isCountdown}
          isCountdown={match.clockType === 'DESC'}
        />
      )}
      {!!score && <span>({score})</span>}
    </div>
  );
};

const MatchDetailBlock = ({
  order,
  detail,
}: {
  order: TBetHistoryOrderItem;
  detail: THistoryBetItem;
}) => {
  const { liveMatchMap, tryGoMatchDetail } = useBetHistoryContext();
  const canShowLive = !order.isSettledOrder && detail.isLive && !detail.isChampion;
  const liveMatch = canShowLive ? liveMatchMap[detail.matchId] : undefined;
  const canGoMatchDetail =
    (order.isPreBetOrder || order.isUnsettledOrder) && Number(detail.matchId) > 0;

  const handleMatchDetailClick = () => {
    if (!canGoMatchDetail) return;
    tryGoMatchDetail(detail);
  };

  return (
    <div className="shadow-[0px_0.5px_0px_0px_var(--Line-200)_inset] relative px-10px">
      <LeftLine2x18Svg className="text-[var(--ThemeColor-Main)] absolute left-0 top-[6px]" />
      <div
        className={clsx(canGoMatchDetail && 'cursor-pointer')}
        onClick={canGoMatchDetail ? handleMatchDetailClick : undefined}
        role={canGoMatchDetail ? 'button' : undefined}
        tabIndex={canGoMatchDetail ? 0 : undefined}
      >
        {/* 主客队 + 结算结果 */}
        <div className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)] py-7px">
          {detail.isChampion ? '冠军' : `${detail.homeName} vs ${detail.awayName}`}
        </div>

        {/* 联赛 + 时间 */}
        <div className="flex _tf[12] leading-[1.33] text-[var(--Text-800)]">
          <p className="flex-1">{detail.leagueName}</p>
          <p className="shrink-0 ml-8px din-pro font-medium">
            {dayjs(detail.matchStartTime).format('MM/DD HH:mm')}
          </p>
        </div>

        {/* 投注项 + 赔率 */}
        <div className="mt-8px rounded-4px bg-[var(--Background-300)] px-10px py-8px flex flex-col gap-4px">
          <div className="flex justify-between gap-8px">
            <p className="_tf[12] leading-[1.38] text-[var(--Text-Main-10)]">
              {detail.isLive && <span className="mr-2px">滚球</span>}
              <span>{detail.playName}</span>
              {detail.scoreWhileBetting && (
                <span className="ml-2px">({detail.scoreWhileBetting})</span>
              )}
              <span className="ml-2px text-[var(--Text-800)]">[欧洲盘]</span>
            </p>
          </div>
          <div className="_tf[12] leading-[1.33] font-medium text-[var(--Text-Main-10)] flex justify-between gap-8px">
            <span>{detail.betItemFullName}</span>

            <p
              className={clsx(
                'shrink-0 _tf[12] font-medium leading-[1.38]',
                'text-[var(--Text-Main-10)]',
              )}
            >
              <span>@</span>
              <span className="din-pro">{bigNB(detail.baseOdds).toFixed(2)}</span>
            </p>
          </div>
          {liveMatch && <LiveStageInfo match={liveMatch} />}
        </div>
      </div>
    </div>
  );
};

const SidebarBetCard = ({ order }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showEarlySettleDetail, setShowEarlySettleDetail] = useState(true);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  const {
    activeVenue,
    activeTab,
    reserveEdit,
    reserveEditComputed,
    EarlySettleConfigMap,
    earlySettleMaxCount,
    earlySettleMap,
    reserveEarlySettleMap,
    handleEarlySettle,
    closeEarlySettle,
    updateEarlySettleInput,
    openReserveEarlySettleSheet,
    closeReserveEarlySettleSheet,
    setReserveEarlySettleStep,
    updateReserveEarlySettleInputs,
    openReserveEarlySettleConfirm,
    openCancelReserveEarlySettleConfirm,
    cancelReserveEarlySettleEdit,
  } = useBetHistoryContext();
  const { balance } = useVenueBalance();
  const {
    openReserveEditOrder,
    closeReserveEditOrder,
    updateReserveUnitStake,
    updateReserveEditOdds,
    openReserveEditConfirm,
    openCancelReserveBetConfirm,
  } = useBetHistoryMethods();

  const isReserveEditing = reserveEdit?.orderId === order.orderId;
  const firstDetail = order.orderDetails[0];

  // #region 提前结算
  const earlySettleConfig = EarlySettleConfigMap?.[order.orderId];
  const currEarlySettleInfo = earlySettleMap[order.orderId];
  const reserveEntry = reserveEarlySettleMap[order.orderId];
  const isUnsettled = activeTab === EBetHistoryTab.UNSETTLED;
  const activeReserveEarlySettle = order.reserveEarlySettles?.find((r) => r.status === 1);

  const {
    history: _earlySettleHistory,
    count: earlySettleCount,
    usedStake,
    earlyPayout,
    remainingStake: maxStake,
    hasPartialEarlySettle,
    remainingPayable,
    remainingCount: remainingEarlySettleCount,
  } = calcEarlySettleStats(order, earlySettleMaxCount);
  const minStake = order.isParlayOrder
    ? (earlySettleConfig?.parlayMinStake ?? 0)
    : (earlySettleConfig?.singleMinStake ?? 0);
  const stakeRange = maxStake - minStake;
  const maxReturn = earlySettleConfig?.cashOutRate
    ? bigNB(maxStake).times(earlySettleConfig.cashOutRate).toFixed(2)
    : '0.00';

  const isEarlySettleDisabled =
    currEarlySettleInfo?.step === 'submitting' ||
    currEarlySettleInfo?.step === 'polling' ||
    currEarlySettleInfo?.step === 'settled' ||
    currEarlySettleInfo?.step === 'failed';
  const isEarlySettlePolling =
    currEarlySettleInfo?.step === 'submitting' || currEarlySettleInfo?.step === 'polling';

  const showEarlySettleRow =
    isUnsettled &&
    order.supportEarlySettle &&
    earlySettleConfig?.cashOutRate &&
    earlySettleCount < earlySettleMaxCount;
  // 金额面板显隐统一由各自 entry 的 showPanel 控制（与 step 解耦）：
  // 贯穿 selecting/confirming/submitting，使确认弹窗弹出/提交 loading 期间面板不隐藏；仅关闭或提交成功移除 entry 时消失。
  // per-order，PC 支持多个注单同时展开
  const showEarlySettleSlider = !!currEarlySettleInfo?.showPanel;
  const showReserveSlider = !!reserveEntry?.showPanel;

  // 立即结算 — slider 派生值
  const earlySettlePercent = currEarlySettleInfo?.percent ?? 1;
  const earlySettleAmount = stakeRange > 0 ? minStake + earlySettlePercent * stakeRange : maxStake;
  const earlySettleBackAmt = earlySettleConfig?.cashOutRate
    ? bigNB(earlySettleAmount).times(earlySettleConfig.cashOutRate).toFixed(2)
    : '0.00';

  // 预约结算 — step 状态 + slider 派生值
  const {
    isViewing: reserveIsViewing,
    isEditing: reserveIsEditing,
    isSelecting: reserveIsSelecting,
    buttonsDisabled: reserveButtonsDisabled,
    sliderDisabled: reserveSliderDisabled,
  } = calcReserveStepState(reserveEntry);
  const {
    canAdjustStake: canAdjustReserveStake,
    minStake: reserveMinStake,
    stakeRange: reserveStakeRange,
    defaultPayout,
    stakePercent: reserveStakePercent,
    stakeNum: reserveStakeNum,
    minPayout: reserveMinPayout,
    maxPayout: reserveMaxPayout,
    payoutRange: reservePayoutRange,
    payoutPercent: reservePayoutPercent,
    payoutNum: reservePayoutNum,
  } = calcReserveSliderValues(order, earlySettleConfig, reserveEntry);
  // #endregion

  const handleCancelReserve = () => openCancelReserveBetConfirm(activeVenue, order.orderId);

  const renderHeaderRight = useCallback(() => {
    if (order.isParlayOrder) {
      return (
        <p className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)]">
          @<span className="din-pro">{bigNB(order.orderOdds).toFixed(2)}</span>
        </p>
      );
    }
    if (order.isUnsettledOrder) {
      const cfg = UNSETTLED_STATUS_CONFIG[order.orderStatus];
      return (
        <span className={clsx('_tf[12] font-medium leading-[1.33]', cfg.iconColor)}>
          {cfg.label}
        </span>
      );
    }
    if (order.isPreBetOrder) {
      const reserving = order.orderStatus === EBetOrderStatus.Confirming;
      return (
        <span
          className={clsx(
            '_tf[12] font-medium leading-[1.33]',
            reserving ? 'text-[var(--ThemeColor-Main)]' : 'text-[var(--Red-300)]',
          )}
        >
          {reserving ? '预约中' : order.isManualCancel ? '取消' : '预约失败'}
        </span>
      );
    }

    return null;
  }, [order]);

  if (!firstDetail) return null;

  return (
    <div className={clsx('bg-[var(--Background-500)] rounded-6px')}>
      {/* Card header */}
      <button
        type="button"
        className="w-full flex items-center gap-6px px-10px py-8px"
        onClick={() => setCollapsed((p) => !p)}
      >
        <div className="flex-1 flex items-center gap-6px overflow-hidden text-left">
          <span className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)] truncate">
            {order.isParlayOrder ? `串关 ${order.orderLabel}*${order.orderSum}` : order.orderLabel}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-4px">
          {renderHeaderRight()}
          <ArrowRightSvg
            className={clsx(
              'w-12px h-12px text-[var(--Text-800)] transition-transform duration-200',
              collapsed ? 'rotate-90' : 'rotate-[-90deg]',
            )}
          />
        </div>
      </button>

      {!collapsed && (
        <>
          {/* Details */}
          {order.orderDetails.map((detail) => (
            <MatchDetailBlock key={detail.betItemId} order={order} detail={detail} />
          ))}

          <div className="mt-8px flex flex-col gap-4px px-10px pb-8px _tf[12] leading-[1.33]">
            <div className="flex justify-between">
              <span className="text-[var(--Text-800)]">
                {hasPartialEarlySettle ? '剩余本金' : order.isPreBetOrder ? '预约金额' : '投注额'}
              </span>
              <span className="font-medium din-pro text-[var(--ThemeColor-Main)]">
                {bigNB(hasPartialEarlySettle ? maxStake : order.orderBetAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--Text-800)]">可返还</span>
              <span className="font-medium din-pro text-[var(--ThemeColor-Main)]">
                {bigNB(hasPartialEarlySettle ? remainingPayable : order.orderMaxWinAmount).toFixed(
                  2,
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[var(--Text-800)]">
                {order.isPreBetOrder ? '预约时间' : '确认'}
              </span>
              <span className="font-medium din-pro text-[var(--Text-800)]">
                {dayjs(order.orderConfirmTime).format('YY-MM-DD HH:mm:ss')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8px">
              <div className="flex items-center gap-4px overflow-hidden">
                <span className="text-[var(--Text-800)] truncate din-pro">{order.orderId}</span>
                <CopyButton
                  text={order.orderId}
                  className="shrink-0 flex items-center"
                  aria-label="复制单号"
                >
                  <CopySvg className="w-14px h-14px text-[var(--Text-800)]" />
                </CopyButton>
              </div>
              {isLogin && (
                <button
                  type="button"
                  aria-label="分享"
                  className="shrink-0 flex items-center"
                  onClick={() => openBetShare(order, activeVenue)}
                >
                  <img
                    src="/images/common/sportDetail/order_share_icon.png"
                    alt="分享"
                    className="w-14px h-14px"
                  />
                </button>
              )}
            </div>
          </div>

          {/* 提前结算详情 */}
          {hasPartialEarlySettle && (
            <div className="_tf[12] leading-[1.33] px-10px pt-8px pb-8px border-t-solid border-t-0.5px border-color-[var(--Line-200)]">
              <button
                type="button"
                className="flex items-center gap-4px w-full"
                onClick={() => setShowEarlySettleDetail((p) => !p)}
              >
                <span className="text-[var(--Text-Main-10)]">提前结算详情</span>
                <ArrowRightSvg
                  className={clsx(
                    'w-12px h-12px text-[var(--Text-800)] transition-transform duration-200',
                    showEarlySettleDetail ? 'rotate-[-90deg]' : 'rotate-90',
                  )}
                />
              </button>
              {showEarlySettleDetail && (
                <div className="flex flex-col gap-4px mt-4px pb-8px border-b-solid border-b-0.5px border-color-[var(--Line-200)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--Text-800)]">提前结算本金</span>
                    <span className="font-medium din-pro text-[var(--ThemeColor-Main)]">
                      {bigNB(usedStake).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--Text-800)]">提前结算返还</span>
                    <span className="font-medium din-pro text-[var(--ThemeColor-Main)]">
                      {bigNB(earlyPayout).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--Text-800)]">剩余提前结算次数</span>
                    <span className="font-medium din-pro text-[var(--ThemeColor-Main)]">
                      {remainingEarlySettleCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--Text-800)]">初始本金</span>
                    <span className="font-medium din-pro text-[var(--ThemeColor-Main)]">
                      {bigNB(+order.orderBetAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 提前结算操作区 */}
          {showEarlySettleRow && (
            <div className="px-10px pb-8px flex flex-col gap-6px">
              {/* 默认按钮行（始终展示） */}
              <div className={clsx('flex gap-4px')}>
                <Button
                  type="outline"
                  size="small"
                  className="flex-1 h-[28px] rounded-[4px] overflow-hidden px-[4px]"
                  contentClassName="truncate"
                  disabled={isEarlySettleDisabled || showEarlySettleSlider || showReserveSlider}
                  loading={isEarlySettlePolling}
                  onClick={() => {
                    const entry = earlySettleMap[order.orderId];
                    handleEarlySettle({
                      order,
                      earlySettleConfig: earlySettleConfig,
                      entry,
                      fromList: true,
                    });
                  }}
                >
                  {currEarlySettleInfo?.step === 'settled' ? (
                    <>提前结算 成功</>
                  ) : currEarlySettleInfo?.step === 'failed' ? (
                    <>提前结算 失败</>
                  ) : (
                    <>
                      提前结算&nbsp;
                      <span className="din-pro">{maxReturn}</span>
                    </>
                  )}
                </Button>
                {showEarlySettleSlider || showReserveSlider ? (
                  <Button
                    size="small"
                    className="w-[44px] h-[28px] rounded-[4px] px-[1px]"
                    onClick={
                      showEarlySettleSlider
                        ? () => closeEarlySettle(order.orderId)
                        : () => closeReserveEarlySettleSheet()
                    }
                  >
                    返回
                  </Button>
                ) : (
                  <Button
                    size="small"
                    className="w-[44px] h-[28px] rounded-[4px] px-[1px]"
                    disabled={isEarlySettleDisabled}
                    onClick={() => openReserveEarlySettleSheet(order.orderId)}
                  >
                    {activeReserveEarlySettle ? '预约中' : '预约'}
                  </Button>
                )}
              </div>

              {/* 立即结算 — selecting 阶段：内联滑条 */}
              {showEarlySettleSlider && (
                <div className="pt-6px flex flex-col gap-6px">
                  <div className="flex items-center justify-between">
                    <span className="_tf[12] text-[var(--Text-Main-10)]">结算本金</span>
                    <span className="_tf[11] text-[var(--Text-500)]">
                      限额 {bigNB(minStake).toFixed(2)}~{bigNB(maxStake).toFixed(2)}
                    </span>
                  </div>
                  <SliderInput
                    min={0}
                    max={1}
                    step={0.01}
                    value={earlySettlePercent}
                    onChange={(p) => updateEarlySettleInput(order.orderId, p)}
                    formatLabel={(v) =>
                      bigNB(stakeRange > 0 ? minStake + v * stakeRange : maxStake).toFixed(2)
                    }
                    className="w-full"
                  />
                  <Button
                    type="primary"
                    size="small"
                    className="w-full h-[28px] rounded-[4px] font-medium"
                    onClick={() => {
                      if (!earlySettleConfig || !currEarlySettleInfo) return;
                      handleEarlySettle({ order, earlySettleConfig, entry: currEarlySettleInfo });
                    }}
                  >
                    结算&nbsp;可返还&nbsp;
                    <span className="din-pro">{earlySettleBackAmt}</span>
                  </Button>
                </div>
              )}

              {/* 预约结算 — 内联双滑条 */}
              {showReserveSlider && (
                <div className="pt-6px flex flex-col gap-6px">
                  <div>
                    <div className="flex items-center justify-between mb-4px">
                      <span className="_tf[12] text-[var(--Text-Main-10)]">结算本金</span>
                      <span className="_tf[11] text-[var(--Text-500)]">
                        {canAdjustReserveStake
                          ? `限额 ${bigNB(reserveMinStake).toFixed(2)}~${bigNB(maxStake).toFixed(2)}`
                          : '不可调整'}
                      </span>
                    </div>
                    {canAdjustReserveStake ? (
                      <SliderInput
                        min={0}
                        max={1}
                        step={0.01}
                        value={reserveStakePercent}
                        disabled={reserveSliderDisabled}
                        onChange={(p) =>
                          updateReserveEarlySettleInputs(order.orderId, { stakePercent: p })
                        }
                        formatLabel={(v) =>
                          bigNB(
                            reserveStakeRange > 0
                              ? reserveMinStake + v * reserveStakeRange
                              : maxStake,
                          ).toFixed(2)
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="_tf[12] din-pro font-medium text-[var(--Text-Main-10)]">
                        {bigNB(maxStake).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4px">
                      <span className="_tf[12] text-[var(--Text-Main-10)]">结算返还额</span>
                      <span className="_tf[11] text-[var(--Text-500)]">
                        限额 {bigNB(reserveMinPayout).toFixed(2)}~
                        {bigNB(reserveMaxPayout).toFixed(2)}
                      </span>
                    </div>
                    <SliderInput
                      min={0}
                      max={1}
                      step={0.01}
                      value={reservePayoutPercent}
                      disabled={reserveSliderDisabled}
                      onChange={(p) =>
                        updateReserveEarlySettleInputs(order.orderId, { payoutPercent: p })
                      }
                      formatLabel={(v) =>
                        bigNB(
                          reservePayoutRange > 0
                            ? reserveMinPayout + v * reservePayoutRange
                            : defaultPayout,
                        ).toFixed(2)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* 操作按钮 */}
                  {reserveIsViewing && (
                    <div className="flex gap-6px">
                      <Button
                        type="third"
                        size="small"
                        className="flex-1 h-[28px] rounded-[4px] text-[var(--Text-Main-10)]"
                        onClick={() => openCancelReserveEarlySettleConfirm(order.orderId)}
                      >
                        取消预约
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        className="flex-1 h-[28px] rounded-[4px]"
                        onClick={() => setReserveEarlySettleStep(order.orderId, 'editing')}
                      >
                        修改
                      </Button>
                    </div>
                  )}
                  {reserveIsEditing && (
                    <div className="flex gap-6px">
                      <Button
                        type="third"
                        size="small"
                        className="flex-1 h-[28px] rounded-[4px] text-[var(--Text-Main-10)]"
                        disabled={reserveButtonsDisabled}
                        onClick={() => cancelReserveEarlySettleEdit(order.orderId)}
                      >
                        取消
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        className="flex-1 h-[28px] rounded-[4px]"
                        disabled={reserveButtonsDisabled}
                        onClick={() =>
                          openReserveEarlySettleConfirm(
                            order.orderId,
                            reserveStakeNum,
                            reservePayoutNum,
                          )
                        }
                      >
                        确认预约
                      </Button>
                    </div>
                  )}
                  {reserveIsSelecting && (
                    <Button
                      type="primary"
                      size="small"
                      className="w-full h-[28px] rounded-[4px]"
                      disabled={reserveButtonsDisabled}
                      onClick={() =>
                        openReserveEarlySettleConfirm(
                          order.orderId,
                          reserveStakeNum,
                          reservePayoutNum,
                        )
                      }
                    >
                      确认预约
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {order.isPreBetOrder && order.orderStatus === EBetOrderStatus.Confirming && (
            <div className="px-10px pb-8px flex flex-col gap-8px">
              {isReserveEditing && reserveEdit && (
                <>
                  <div className={clsx('bet-amount-input-wrapper show-border')}>
                    <div className="shrink-0 w-40px h-[30px] bg-[var(--ThemeColor-20)] flex items-center justify-center">
                      <span className="_tf[12] font-medium text-[var(--ThemeColor-Main)]">
                        本金
                      </span>
                    </div>
                    <input
                      className="bet-amount-input h-30px placeholder:text-[var(--Text-700)] placeholder:_tf[12] placeholder:din-pro"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      disabled={!reserveEditComputed}
                      value={reserveEdit.unitStake}
                      onChange={(e) =>
                        updateReserveUnitStake({
                          venue: activeVenue,
                          unitStake: e.target.value,
                          computed: reserveEditComputed,
                          totalBalance: balance,
                        })
                      }
                      placeholder={
                        reserveEditComputed
                          ? `限额 ${reserveEditComputed.minUnitStake}-${reserveEditComputed.maxUnitStake}`
                          : '限额获取中'
                      }
                    />
                  </div>
                  <div className="flex items-center gap-4px">
                    <span className="_tf[12] text-[var(--Text-800)] shrink-0">预约 @</span>
                    <div
                      className={clsx(
                        'flex-1 flex items-center',
                        'bg-[var(--Background-300)] rounded-4px',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateReserveEditOdds({
                            venue: activeVenue,
                            type: 'minus',
                            currentOdds: reserveEdit.odds,
                            computed: reserveEditComputed,
                            baseOdds: order.orderOdds,
                          })
                        }
                        className="shrink-0 w-30px h-30px flex items-center justify-center border-r-1px border-r-solid border-color-[var(--Line-100)]"
                      >
                        <MinusIconSvg className="w-8px text-[var(--Text-800)]" />
                      </button>
                      <span
                        className={clsx(
                          'flex-1 text-center _tf[12] font-medium din-pro text-[var(--Text-Main-10)]',
                        )}
                      >
                        {reserveEdit.odds}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateReserveEditOdds({
                            venue: activeVenue,
                            type: 'plus',
                            currentOdds: reserveEdit.odds,
                            computed: reserveEditComputed,
                            baseOdds: order.orderOdds,
                          })
                        }
                        className="shrink-0 w-30px h-30px flex items-center justify-center border-l-1px border-l-solid border-color-[var(--Line-100)]"
                      >
                        <PlusIconSvgBold className="w-8px text-[var(--Text-800)]" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-4px">
                {isReserveEditing ? (
                  <>
                    <Button
                      type="third"
                      size="small"
                      className="w-[56px] h-[30px] rounded-[4px]"
                      onClick={() => closeReserveEditOrder({ venue: activeVenue })}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      className="flex-1 h-[30px] rounded-[4px]"
                      disabled={
                        !reserveEditComputed ||
                        !reserveEdit.unitStake ||
                        +reserveEdit.unitStake < reserveEditComputed.minUnitStake ||
                        +reserveEdit.unitStake > reserveEditComputed.maxUnitStake
                      }
                      onClick={() => openReserveEditConfirm(activeVenue)}
                    >
                      确认
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="third"
                      size="small"
                      className="w-[56px] h-[30px] rounded-[4px] text-[var(--ThemeColor-Main)]"
                      onClick={handleCancelReserve}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      className="flex-1 h-[30px] rounded-[4px]"
                      onClick={() => openReserveEditOrder({ venue: activeVenue, order })}
                    >
                      修改
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(SidebarBetCard);
