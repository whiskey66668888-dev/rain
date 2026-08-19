import { cn } from '@/utils';
import { EBetHistoryTab, EBetOrderStatus, EBetSettleResult } from '@/apis/commonSports/constants';
import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { useVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import {
  calcEarlySettleStats,
  calcReserveSliderValues,
  calcReserveStepState,
} from '@/utils/betHistory';
import { SETTLED_RESULT_CONFIG, UNSETTLED_STATUS_CONFIG } from '../../../BetHistoryH5/constants';
import { Icon } from '@/common/components/Icon';
import Button from '@/common/components/Button';
import SliderInput from '@/common/components/SliderInput';
import { Popover } from 'antd-mobile';
import { CloseSvg, MinusIconSvg, PlusIconSvgBold } from '@/sites/op7/components/SvgIcons';
import type { TReserveEditState } from '@/core/store/slices/betHistorySlice';
import { EVenue } from '@/apis/commonSports/constants';
import clsx from 'clsx';
import { bigNB } from '@/utils/bet/bigMath';
import '@/sites/op7/components/Bet/BetPC/BetPC.scss';

export const UnsettledStatusCell = ({ order }: { order: TBetHistoryOrderItem }) => {
  const cfg = UNSETTLED_STATUS_CONFIG[order.orderStatus];
  return (
    <div className="flex flex-wrap gap-6px items-center overflow-hidden">
      {cfg && <span className={cfg.iconColor}>{cfg.label}</span>}
      <EarlySettleButtons order={order} />
    </div>
  );
};

export const SettledResultCell = ({ order }: { order: TBetHistoryOrderItem }) => {
  const cfg =
    SETTLED_RESULT_CONFIG[order.orderSettleResult] ??
    SETTLED_RESULT_CONFIG[EBetSettleResult.NoResulted];
  return <Icon src={cfg.icon} size="24px" color={cfg.color} />;
};

interface ReserveEditPopoverContentProps {
  order: TBetHistoryOrderItem;
  reserveEdit: TReserveEditState;
  activeVenue: EVenue;
}

const ReserveEditPopoverContent = ({
  order,
  reserveEdit,
  activeVenue,
}: ReserveEditPopoverContentProps) => {
  const { reserveEditComputed } = useBetHistoryContext();
  const { balance } = useVenueBalance();
  const {
    closeReserveEditOrder,
    updateReserveUnitStake,
    updateReserveEditOdds,
    openReserveEditConfirm,
  } = useBetHistoryMethods();

  return (
    <div className="w-[200px] flex flex-col gap-8px">
      {/* Header */}
      <div className="flex items-center justify-between text-[var(--Text-Main-10)]">
        <span className="_tf[12] font-medium ">预约投注修改</span>
        <button
          type="button"
          className="w-10px h-10px flex items-center justify-center"
          onClick={() => closeReserveEditOrder({ venue: activeVenue })}
        >
          <CloseSvg />
        </button>
      </div>

      {/* 本金 input */}
      <div className={clsx('bet-amount-input-wrapper show-border')}>
        <div className="shrink-0 w-40px h-[30px] bg-[var(--ThemeColor-20)] flex items-center justify-center">
          <span className="_tf[12] font-medium text-[var(--ThemeColor-Main)]">本金</span>
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

      {/* 赔率步进 */}
      <div className="flex items-center gap-4px">
        <span className="_tf[12] text-[var(--Text-800)] shrink-0">预约 @</span>
        <div className={clsx('flex-1 flex items-center', 'bg-[var(--Background-700)] rounded-4px')}>
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
            className="shrink-0 w-30px h-30px flex items-center justify-center border-r-1px border-r-solid border-color-[var(--Line-500)]"
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
            className="shrink-0 w-30px h-30px flex items-center justify-center border-l-1px border-l-solid border-color-[var(--Line-500)]"
          >
            <PlusIconSvgBold className="w-8px text-[var(--Text-800)]" />
          </button>
        </div>
      </div>

      {/* 取消 + 确定 */}
      <div className="flex gap-12px">
        <Button
          type="second"
          size="middle"
          className="flex-1 rounded-[4px] text-[var(--ThemeColor-Main)]"
          onClick={() => closeReserveEditOrder({ venue: activeVenue })}
        >
          取消
        </Button>
        <Button
          type="primary"
          size="middle"
          className="flex-1 rounded-[4px]"
          disabled={
            !reserveEditComputed ||
            !reserveEdit.unitStake ||
            +reserveEdit.unitStake < reserveEditComputed.minUnitStake ||
            +reserveEdit.unitStake > reserveEditComputed.maxUnitStake
          }
          onClick={() => openReserveEditConfirm(activeVenue)}
        >
          确定
        </Button>
      </div>
    </div>
  );
};

export const ReserveStatusCell = ({ order }: { order: TBetHistoryOrderItem }) => {
  const reserving = order.orderStatus === EBetOrderStatus.Confirming;
  const { activeVenue, reserveEdit } = useBetHistoryContext();
  const { openReserveEditOrder, closeReserveEditOrder, openCancelReserveBetConfirm } =
    useBetHistoryMethods();

  // 目前仅 FB 支持修改预约注单，OB（EB）只保留取消（对齐 App）
  const canEditReserve = activeVenue === EVenue.FB;
  const isReserveEditing = canEditReserve && reserveEdit?.orderId === order.orderId;

  const handleCancelClick = () => {
    if (isReserveEditing) {
      closeReserveEditOrder({ venue: activeVenue });
      return;
    }
    openCancelReserveBetConfirm(activeVenue, order.orderId);
  };

  if (reserving) {
    return (
      <div className="flex items-center gap-12px">
        <span className={cn('text-[var(--Red-300)] text-nowrap')}>预约中</span>
        <Button
          type="outline"
          className="text-nowrap rounded-[4px]"
          size="small"
          onClick={handleCancelClick}
        >
          取消
        </Button>
        {canEditReserve && (
          <Popover
            visible={isReserveEditing}
            content={
              isReserveEditing && reserveEdit ? (
                <ReserveEditPopoverContent
                  order={order}
                  reserveEdit={reserveEdit}
                  activeVenue={activeVenue}
                />
              ) : null
            }
            placement="bottom-end"
            onVisibleChange={(v) => {
              if (!v && isReserveEditing) closeReserveEditOrder({ venue: activeVenue });
            }}
            className={clsx(
              '[--arrow-size:0px] [--z-index:var(--z-bet-history-popover)]',
              'bet-history-table-popover',
            )}
          >
            <Button
              className="text-nowrap rounded-[4px]"
              size="small"
              disabled={!!reserveEdit}
              onClick={() => openReserveEditOrder({ venue: activeVenue, order })}
            >
              修改
            </Button>
          </Popover>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6px">
      <p>预约失败</p>
      {order.isManualCancel && <p className="text-[var(--Text-800)]">用户取消</p>}
    </div>
  );
};

// ── 提前结算 popover 内容（立即结算） ────────────────────────────────────────

interface EarlySettlePopoverProps {
  order: TBetHistoryOrderItem;
  minStake: number;
  maxStake: number;
  stakeRange: number;
  earlySettlePercent: number;
  earlySettleBackAmt: string;
  earlySettleConfig: NonNullable<
    ReturnType<typeof useBetHistoryContext>['EarlySettleConfigMap']
  >[string];
}

const ImmediateSettlePopoverContent = ({
  order,
  minStake,
  maxStake,
  stakeRange,
  earlySettlePercent,
  earlySettleBackAmt,
  earlySettleConfig,
}: EarlySettlePopoverProps) => {
  const { earlySettleMap, handleEarlySettle, updateEarlySettleInput } = useBetHistoryContext();
  const currEntry = earlySettleMap[order.orderId];

  return (
    <div className="w-[260px] flex flex-col gap-8px py-4px">
      <div className="flex items-center justify-between">
        <span className="_tf[12] font-medium text-[var(--Text-Main-10)]">提前结算本金</span>
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
        formatLabel={(v) => bigNB(stakeRange > 0 ? minStake + v * stakeRange : maxStake).toFixed(2)}
        className="w-full"
      />
      <Button
        type="primary"
        size="middle"
        className="w-full rounded-[4px] mt-4px font-medium"
        onClick={() => {
          if (!earlySettleConfig || !currEntry) return;
          handleEarlySettle({ order, earlySettleConfig, entry: currEntry });
        }}
      >
        结算&nbsp;可返还&nbsp;<span className="din-pro">{earlySettleBackAmt}</span>
      </Button>
    </div>
  );
};

// ── 提前结算 popover 内容（预约结算） ────────────────────────────────────────

interface ReserveSettlePopoverProps {
  order: TBetHistoryOrderItem;
  canAdjustReserveStake: boolean;
  reserveMinStake: number;
  maxStake: number;
  reserveStakeRange: number;
  reserveStakePercent: number;
  reserveStakeNum: number;
  reserveMinPayout: number;
  reserveMaxPayout: number;
  reservePayoutRange: number;
  reservePayoutPercent: number;
  reservePayoutNum: number;
}

const ReserveSettlePopoverContent = ({
  order,
  canAdjustReserveStake,
  reserveMinStake,
  maxStake,
  reserveStakeRange,
  reserveStakePercent,
  reserveStakeNum,
  reserveMinPayout,
  reserveMaxPayout,
  reservePayoutRange,
  reservePayoutPercent,
  reservePayoutNum,
}: ReserveSettlePopoverProps) => {
  const {
    reserveEarlySettleMap,
    setReserveEarlySettleStep,
    updateReserveEarlySettleInputs,
    openReserveEarlySettleConfirm,
    openCancelReserveEarlySettleConfirm,
    cancelReserveEarlySettleEdit,
  } = useBetHistoryContext();

  const reserveEntry = reserveEarlySettleMap[order.orderId];
  const { isViewing, isEditing, isSelecting, buttonsDisabled, sliderDisabled } =
    calcReserveStepState(reserveEntry);

  return (
    <div className="w-[260px] flex flex-col gap-8px py-4px">
      {/* 本金滑条 */}
      <div>
        <div className="flex items-center justify-between mb-6px">
          <span className="_tf[12] font-medium text-[var(--Text-Main-10)]">预约提前结算本金</span>
          {canAdjustReserveStake && (
            <span className="_tf[11] text-[var(--Text-500)]">
              限额 {bigNB(reserveMinStake).toFixed(2)}~{bigNB(maxStake).toFixed(2)}
            </span>
          )}
        </div>
        {canAdjustReserveStake ? (
          <SliderInput
            min={0}
            max={1}
            step={0.01}
            value={reserveStakePercent}
            disabled={sliderDisabled}
            onChange={(p) => updateReserveEarlySettleInputs(order.orderId, { stakePercent: p })}
            formatLabel={(v) =>
              bigNB(
                reserveStakeRange > 0 ? reserveMinStake + v * reserveStakeRange : maxStake,
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
      {/* 返还额滑条 */}
      <div>
        <div className="flex items-center justify-between mb-6px">
          <span className="_tf[12] font-medium text-[var(--Text-Main-10)]">预约提前结算返还</span>
          <span className="_tf[11] text-[var(--Text-500)]">
            限额 {bigNB(reserveMinPayout).toFixed(2)}~{bigNB(reserveMaxPayout).toFixed(2)}
          </span>
        </div>
        <SliderInput
          min={0}
          max={1}
          step={0.01}
          value={reservePayoutPercent}
          disabled={sliderDisabled}
          onChange={(p) => updateReserveEarlySettleInputs(order.orderId, { payoutPercent: p })}
          formatLabel={(v) =>
            bigNB(
              reservePayoutRange > 0 ? reserveMinPayout + v * reservePayoutRange : reservePayoutNum,
            ).toFixed(2)
          }
          className="w-full"
        />
      </div>

      {/* 操作按钮 */}
      {isViewing && (
        <div className="flex gap-8px mt-4px">
          <Button
            type="second"
            size="middle"
            className="flex-1 rounded-[4px] text-[var(--Text-Main-10)]"
            onClick={() => openCancelReserveEarlySettleConfirm(order.orderId)}
          >
            取消预约
          </Button>
          <Button
            type="primary"
            size="middle"
            className="flex-1 rounded-[4px]"
            onClick={() => setReserveEarlySettleStep(order.orderId, 'editing')}
          >
            修改
          </Button>
        </div>
      )}
      {isEditing && (
        <div className="flex gap-8px mt-4px">
          <Button
            type="second"
            size="middle"
            className="flex-1 rounded-[4px] text-[var(--Text-Main-10)]"
            disabled={buttonsDisabled}
            onClick={() => cancelReserveEarlySettleEdit(order.orderId)}
          >
            取消
          </Button>
          <Button
            type="primary"
            size="middle"
            className="flex-1 rounded-[4px]"
            disabled={buttonsDisabled}
            onClick={() =>
              openReserveEarlySettleConfirm(order.orderId, reserveStakeNum, reservePayoutNum)
            }
          >
            确认预约
          </Button>
        </div>
      )}
      {isSelecting && (
        <Button
          type="primary"
          size="middle"
          className="w-full rounded-[4px] mt-4px"
          disabled={buttonsDisabled}
          onClick={() =>
            openReserveEarlySettleConfirm(order.orderId, reserveStakeNum, reservePayoutNum)
          }
        >
          确认预约
        </Button>
      )}
    </div>
  );
};

// ── 未结算表格中的提前结算操作按钮（渲染在状态列内） ────────────────────────

const EarlySettleButtons = ({ order }: { order: TBetHistoryOrderItem }) => {
  const {
    activeTab,
    activeVenue,
    EarlySettleConfigMap,
    earlySettleMaxCount,
    earlySettleMap,
    reserveEarlySettleMap,
    handleEarlySettle,
    closeEarlySettle,
    openReserveEarlySettleSheet,
    closeReserveEarlySettleSheet,
  } = useBetHistoryContext();

  const isUnsettled = activeTab === EBetHistoryTab.UNSETTLED;
  const earlySettleConfig = EarlySettleConfigMap?.[order.orderId];
  const currEarlySettleInfo = earlySettleMap[order.orderId];
  const reserveEntry = reserveEarlySettleMap[order.orderId];

  const {
    history: _earlySettleHistory,
    count: earlySettleCount,
    remainingStake: maxStake,
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
  // OB（EB 体育）只有全额提前结算，没有预约提前结算（对齐 App）
  const showReserveEarlySettle = activeVenue === EVenue.FB;

  // 金额面板显隐统一由各自 entry 的 showPanel 控制（与 step 解耦）：
  // 贯穿 selecting/confirming/submitting，使确认弹窗弹出/提交 loading 期间面板不隐藏；仅关闭或提交成功移除 entry 时消失。
  // per-order，PC 支持多个注单同时展开
  const showEarlySettleSlider = !!currEarlySettleInfo?.showPanel;
  const showReserveSlider = !!reserveEntry?.showPanel;
  const isPopoverOpen = showEarlySettleSlider || showReserveSlider;

  const activeReserveEarlySettle = order.reserveEarlySettles?.find((r) => r.status === 1);

  // 立即结算派生值
  const earlySettlePercent = currEarlySettleInfo?.percent ?? 1;
  const earlySettleAmount = stakeRange > 0 ? minStake + earlySettlePercent * stakeRange : maxStake;
  const earlySettleBackAmt = earlySettleConfig?.cashOutRate
    ? bigNB(earlySettleAmount).times(earlySettleConfig.cashOutRate).toFixed(2)
    : '0.00';

  // 预约结算派生值
  const {
    canAdjustStake: canAdjustReserveStake,
    minStake: reserveMinStake,
    stakeRange: reserveStakeRange,
    stakePercent: reserveStakePercent,
    stakeNum: reserveStakeNum,
    minPayout: reserveMinPayout,
    maxPayout: reserveMaxPayout,
    payoutRange: reservePayoutRange,
    payoutPercent: reservePayoutPercent,
    payoutNum: reservePayoutNum,
  } = calcReserveSliderValues(order, earlySettleConfig, reserveEntry);

  if (!showEarlySettleRow) return null;

  const earlySettleLabel =
    currEarlySettleInfo?.step === 'settled' ? (
      '提前结算 成功'
    ) : currEarlySettleInfo?.step === 'failed' ? (
      '提前结算 失败'
    ) : (
      <>
        提前结算&nbsp;
        <span className="din-pro">{maxReturn}</span>
      </>
    );

  return (
    <div className="flex gap-6px items-center">
      {/* 立即结算 Popover */}
      <Popover
        visible={showEarlySettleSlider}
        content={
          showEarlySettleSlider && earlySettleConfig ? (
            <ImmediateSettlePopoverContent
              order={order}
              minStake={minStake}
              maxStake={maxStake}
              stakeRange={stakeRange}
              earlySettlePercent={earlySettlePercent}
              earlySettleBackAmt={earlySettleBackAmt}
              earlySettleConfig={earlySettleConfig}
            />
          ) : null
        }
        placement="bottom-end"
        onVisibleChange={(v) => {
          // 仅 selecting 阶段允许「点外部/移开」关闭；confirming 阶段由二次确认弹窗接管，忽略
          if (!v && currEarlySettleInfo?.step === 'selecting') closeEarlySettle(order.orderId);
        }}
        className="[--arrow-size:0px] [--z-index:var(--z-bet-history-popover)] bet-history-table-popover"
      >
        <Button
          type="outline"
          size="small"
          className="rounded-[4px] h-[32px] text-nowrap"
          contentClassName="truncate leading-[1]"
          disabled={isEarlySettleDisabled || isPopoverOpen}
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
          {earlySettleLabel}
        </Button>
      </Popover>

      {/* 预约 / 返回 */}
      {showReserveEarlySettle && (
        <Popover
          visible={showReserveSlider}
          content={
            showReserveSlider ? (
              <ReserveSettlePopoverContent
                order={order}
                canAdjustReserveStake={canAdjustReserveStake}
                reserveMinStake={reserveMinStake}
                maxStake={maxStake}
                reserveStakeRange={reserveStakeRange}
                reserveStakePercent={reserveStakePercent}
                reserveStakeNum={reserveStakeNum}
                reserveMinPayout={reserveMinPayout}
                reserveMaxPayout={reserveMaxPayout}
                reservePayoutRange={reservePayoutRange}
                reservePayoutPercent={reservePayoutPercent}
                reservePayoutNum={reservePayoutNum}
              />
            ) : null
          }
          placement="bottom-end"
          onVisibleChange={(v) => {
            // viewing/selecting/editing 阶段允许点外部关闭；confirming/submitting 由二次确认弹窗接管
            const closeable =
              reserveEntry?.step === 'selecting' ||
              reserveEntry?.step === 'editing' ||
              reserveEntry?.step === 'viewing';
            if (!v && closeable) closeReserveEarlySettleSheet(order.orderId);
          }}
          className="[--arrow-size:0px] [--z-index:var(--z-bet-history-popover)] bet-history-table-popover"
        >
          {isPopoverOpen ? (
            <Button
              type="primary"
              size="small"
              className="rounded-[4px] h-[32px]"
              onClick={() =>
                showEarlySettleSlider
                  ? closeEarlySettle(order.orderId)
                  : closeReserveEarlySettleSheet(order.orderId)
              }
            >
              返回
            </Button>
          ) : (
            <Button
              type="outline"
              size="small"
              className="rounded-[4px] w-[54px] px-[1px]  h-[32px]"
              disabled={isEarlySettleDisabled}
              onClick={() => openReserveEarlySettleSheet(order.orderId)}
            >
              {activeReserveEarlySettle ? '预约中' : '预约'}
            </Button>
          )}
        </Popover>
      )}
    </div>
  );
};
