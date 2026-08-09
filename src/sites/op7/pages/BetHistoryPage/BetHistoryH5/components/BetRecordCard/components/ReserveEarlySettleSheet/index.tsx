import { useCallback } from 'react';
import Overlay from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import SliderInput from '@/common/components/SliderInput';
import { bigNB } from '@/utils/bet/bigMath';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { calcReserveSliderValues, calcReserveStepState } from '@/utils/betHistory';

/** 预约提前结算底部弹层 */
const ReserveEarlySettleSheet = () => {
  const {
    list,
    EarlySettleConfigMap,
    reserveEarlySettleMap,
    activeReserveEarlySettleOrderId,
    closeReserveEarlySettleSheet,
    setReserveEarlySettleStep,
    updateReserveEarlySettleInputs,
    openReserveEarlySettleConfirm,
    openCancelReserveEarlySettleConfirm,
    cancelReserveEarlySettleEdit,
  } = useBetHistoryContext();

  const order = list.find((o) => o.orderId === activeReserveEarlySettleOrderId);
  const earlySettleConfig = activeReserveEarlySettleOrderId
    ? EarlySettleConfigMap[activeReserveEarlySettleOrderId]
    : undefined;
  const entry = activeReserveEarlySettleOrderId
    ? reserveEarlySettleMap[activeReserveEarlySettleOrderId]
    : undefined;

  const show =
    !!activeReserveEarlySettleOrderId && !!order && !!earlySettleConfig && !!entry?.showPanel;

  // ── 派生计算 ──────────────────────────────────────────────────────────────
  const {
    remainingStake,
    canAdjustStake,
    minStake,
    stakeRange,
    defaultPayout,
    stakePercent,
    stakeNum,
    minPayout: currentPayoutAtRate,
    maxPayout,
    minPayout,
    payoutRange,
    payoutPercent,
    payoutNum,
  } = calcReserveSliderValues(order, earlySettleConfig, entry);
  const { isViewing, isEditing, isSelecting, buttonsDisabled, sliderDisabled } =
    calcReserveStepState(entry);

  // ── 本金滑条 ──────────────────────────────────────────────────────────────
  const handleStakeSlider = useCallback(
    (p: number) => {
      if (!activeReserveEarlySettleOrderId) return;
      updateReserveEarlySettleInputs(activeReserveEarlySettleOrderId, { stakePercent: p });
    },
    [activeReserveEarlySettleOrderId, updateReserveEarlySettleInputs],
  );

  // ── 返还额滑条 ────────────────────────────────────────────────────────────
  const handlePayoutSlider = useCallback(
    (p: number) => {
      if (!activeReserveEarlySettleOrderId) return;
      updateReserveEarlySettleInputs(activeReserveEarlySettleOrderId, { payoutPercent: p });
    },
    [activeReserveEarlySettleOrderId, updateReserveEarlySettleInputs],
  );

  // 「修改」：进入编辑模式（percent 已在 openSheet 时从接口金额初始化，无需重算）
  const handleEnterEdit = useCallback(() => {
    if (!activeReserveEarlySettleOrderId) return;
    setReserveEarlySettleStep(activeReserveEarlySettleOrderId, 'editing');
  }, [activeReserveEarlySettleOrderId, setReserveEarlySettleStep]);

  const handleCancelEdit = useCallback(() => {
    if (!activeReserveEarlySettleOrderId) return;
    cancelReserveEarlySettleEdit(activeReserveEarlySettleOrderId);
  }, [activeReserveEarlySettleOrderId, cancelReserveEarlySettleEdit]);

  if (!order || !earlySettleConfig) return null;

  return (
    <Overlay
      show={show}
      position="bottom"
      close={() => closeReserveEarlySettleSheet()}
      maskClickClose
      bodyClassname="bg-[var(--Background-400)] rounded-t-12px safe-b"
    >
      <ModalHeader title="预约提前结算" onClose={closeReserveEarlySettleSheet} />

      <div className="px-16px pt-12px pb-16px">
        <p className="_tf[12] text-[var(--Text-800)] leading-[1.5] mb-16px">
          当达到您设定的结算本金和可返还时，系统自动结算。
        </p>

        {/* 结算本金 */}
        <div className="mb-20px">
          <div className="flex items-center justify-between mb-8px">
            <span className="_tf[14] font-semibold text-[var(--Text-Main-10)]">结算本金</span>
            <span className="_tf[12] text-[var(--Text-500)]">
              {canAdjustStake
                ? `限额 ${bigNB(minStake).toFixed(2)}~${bigNB(remainingStake).toFixed(2)}`
                : '不可调整'}
            </span>
          </div>
          {canAdjustStake ? (
            <SliderInput
              min={0}
              max={1}
              step={0.01}
              value={stakePercent}
              onChange={handleStakeSlider}
              disabled={sliderDisabled}
              formatLabel={(v) =>
                bigNB(stakeRange > 0 ? minStake + v * stakeRange : remainingStake).toFixed(2)
              }
              className="w-full"
            />
          ) : (
            <p className="_tf[14] din-pro font-medium text-[var(--Text-Main-10)]">
              {bigNB(stakeNum).toFixed(2)}
            </p>
          )}
          <p className="_tf[12] text-[var(--Text-500)] mt-6px">
            自动结算的可返还: {bigNB(currentPayoutAtRate).toFixed(2)}
          </p>
        </div>

        {/* 结算返还额 */}
        <div className="mb-20px">
          <div className="flex items-center justify-between mb-12px">
            <span className="_tf[14] font-semibold text-[var(--Text-Main-10)]">结算返还额</span>
            <span className="_tf[12] text-[var(--Text-500)]">
              限额 {bigNB(minPayout).toFixed(2)}~{bigNB(maxPayout).toFixed(2)}
            </span>
          </div>
          <SliderInput
            min={0}
            max={1}
            step={0.01}
            value={payoutPercent}
            onChange={handlePayoutSlider}
            disabled={sliderDisabled}
            formatLabel={(v) =>
              bigNB(payoutRange > 0 ? minPayout + v * payoutRange : defaultPayout).toFixed(2)
            }
            className="w-full"
          />
        </div>

        {/* 操作按钮：viewing/selecting/editing 可交互；confirming_* 时禁用（弹窗在上层） */}
        {(isViewing || isEditing || isSelecting) && (
          <div className="flex gap-10px">
            {isViewing && (
              <>
                <Button
                  type="second"
                  size="large"
                  className="flex-1 text-[var(--Text-Main-10)]"
                  onClick={() => openCancelReserveEarlySettleConfirm(order.orderId)}
                >
                  取消预约
                </Button>
                <Button type="primary" size="large" className="flex-1" onClick={handleEnterEdit}>
                  修改
                </Button>
              </>
            )}

            {isEditing && (
              <>
                <Button
                  type="second"
                  size="large"
                  className="flex-1 text-[var(--Text-Main-10)]"
                  disabled={buttonsDisabled}
                  onClick={handleCancelEdit}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  className="flex-1"
                  disabled={buttonsDisabled}
                  onClick={() => {
                    if (!activeReserveEarlySettleOrderId || buttonsDisabled) return;
                    openReserveEarlySettleConfirm(
                      activeReserveEarlySettleOrderId,
                      stakeNum,
                      payoutNum,
                    );
                  }}
                >
                  确认预约
                </Button>
              </>
            )}

            {isSelecting && (
              <Button
                type="primary"
                size="large"
                className="flex-1"
                disabled={buttonsDisabled}
                onClick={() => {
                  if (!activeReserveEarlySettleOrderId || buttonsDisabled) return;
                  openReserveEarlySettleConfirm(
                    activeReserveEarlySettleOrderId,
                    stakeNum,
                    payoutNum,
                  );
                }}
              >
                确认预约
              </Button>
            )}
          </div>
        )}
      </div>
    </Overlay>
  );
};

export default ReserveEarlySettleSheet;
