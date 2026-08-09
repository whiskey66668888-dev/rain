import { useCallback, useMemo } from 'react';
import Overlay from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import SliderInput from '@/common/components/SliderInput';
import { bigNB } from '@/utils/bet/bigMath';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import ModalHeader from '@/sites/op7/components/ModalHeader';

/** 提前结算本金选择底部弹层（showPanel 控制显示，selecting / confirming 阶段保持） */
const EarlySettleSheet = () => {
  const {
    list,
    EarlySettleConfigMap,
    earlySettleMap,
    handleEarlySettle,
    closeEarlySettle,
    updateEarlySettleInput,
  } = useBetHistoryContext();

  // 以 entry.showPanel 作为面板显示开关；H5 全局弹层同时仅一个 showPanel 为 true
  const activeEarlySettleOrder = useMemo(
    () => _.find(earlySettleMap, (item) => !!item?.showPanel),
    [earlySettleMap],
  );

  const order = list.find((o) => o.orderId === activeEarlySettleOrder?.orderId);
  const orderId = order?.orderId;
  const earlySettleConfig = orderId ? EarlySettleConfigMap[orderId] : undefined;

  const earlySettleHistory = order?.earlySettleHistory ?? [];
  const usedStake = earlySettleHistory.reduce((s, r) => s + r.stake, 0);
  const maxStake = +(order?.orderBetAmount ?? '0') - usedStake;
  const minStake = order?.isParlayOrder
    ? (earlySettleConfig?.parlayMinStake ?? 0)
    : (earlySettleConfig?.singleMinStake ?? 0);
  const range = maxStake - minStake;

  // showPanel 是面板显示的开关（仅在走面板的非串关单上才会被置 true）；
  // 点击「结算」进入二次确认弹窗后（confirming）面板不消失，取消确认退回 selecting 仍在
  const show = !!activeEarlySettleOrder && !!order && !!earlySettleConfig;

  // 0 → minStake，1 → maxStake
  const percent: number = activeEarlySettleOrder?.percent ?? 1;
  const amount = range > 0 ? minStake + percent * range : maxStake;
  const backAmt = earlySettleConfig?.cashOutRate
    ? bigNB(amount).times(earlySettleConfig.cashOutRate).toFixed(2)
    : '0.00';

  const handleSliderChange = useCallback(
    (p: number) => {
      if (!orderId) return;
      updateEarlySettleInput(orderId, p);
    },
    [orderId, updateEarlySettleInput],
  );

  return (
    <Overlay
      show={show}
      position="bottom"
      close={() => closeEarlySettle(orderId)}
      maskClickClose
      bodyClassname="bg-[var(--Background-400)] rounded-t-12px safe-b"
    >
      <ModalHeader title="提前结算" onClose={() => closeEarlySettle(orderId)} />

      <div className="px-16px pt-12px pb-16px">
        <p className="_tf[12] text-[var(--Text-800)] leading-[1.5] mb-16px">
          提前结算部分的投注将立即结算且与该投注相关的最终结果不影响已结算至您账户中的金额结算。
        </p>

        <div className="flex items-center justify-between mb-8px">
          <span className="_tf[14] font-semibold text-[var(--Text-Main-10)]">结算本金</span>
          <span className="_tf[12] text-[var(--Text-500)]">
            限额 {bigNB(minStake).toFixed(2)}~{bigNB(maxStake).toFixed(2)}
          </span>
        </div>

        <SliderInput
          min={0}
          max={1}
          step={0.01}
          value={percent}
          onChange={handleSliderChange}
          formatLabel={(v) => bigNB(range > 0 ? minStake + v * range : maxStake).toFixed(2)}
          className="w-full mb-24px"
        />

        <Button
          type="primary"
          size="large"
          className="w-full rounded-6px h-[48px] _tf[16] font-semibold"
          onClick={() => {
            if (!order || !earlySettleConfig || !activeEarlySettleOrder) return;
            handleEarlySettle({ order, earlySettleConfig, entry: activeEarlySettleOrder });
          }}
        >
          <span className="_tf[16] font-semibold">结算&nbsp;</span>
          <span className="_tf[16] din-pro text-[var(--White-60)]">可返还&nbsp;{backAmt}</span>
        </Button>
      </div>
    </Overlay>
  );
};

export default EarlySettleSheet;
