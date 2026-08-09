import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import { bigNB } from '@/utils/bet/bigMath';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';

/** 提前结算二次确认弹窗（step = 'confirming' | 'submitting'）*/
const EarlySettleConfirmModal = () => {
  const {
    list,
    EarlySettleConfigMap,
    earlySettleConfirmEntry: _entry,
    submitEarlySettle,
    cancelEarlySettleConfirm,
  } = useBetHistoryContext();
  const entry = _entry;

  const order = list.find((o) => o.orderId === entry?.orderId);
  const earlySettleConfig = entry ? EarlySettleConfigMap[entry.orderId] : undefined;
  const cashOutStake = entry?.cashOutStake ?? 0;

  const show = !!entry && !!order && !!earlySettleConfig;
  const submitting = entry?.step === 'submitting';
  const backAmt = earlySettleConfig
    ? bigNB(cashOutStake)
        .times(earlySettleConfig.cashOutRate ?? 0)
        .toFixed(2)
    : '0.00';

  return (
    <Modal
      show={show}
      title="提前结算"
      showCloseButton={false}
      maskClickClose={false}
      onClose={() => cancelEarlySettleConfirm(entry?.orderId)}
      footer={
        <div className="flex gap-10px w-full">
          <Button
            type="second"
            size="large"
            className="flex-1 rounded-6px"
            disabled={submitting}
            onClick={() => cancelEarlySettleConfirm(entry?.orderId)}
          >
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            className="flex-1 rounded-6px"
            disabled={submitting}
            loading={submitting}
            onClick={() => {
              if (!order) return;
              submitEarlySettle({ order, cashOutStake });
            }}
          >
            确认
          </Button>
        </div>
      }
    >
      <p className="_tf[12] text-[var(--Text-800)] leading-[1.5] mb-16px">
        该投注将被立即结算，且与该投注相关的最终结果将不影响返还至您账户中的金额，返还额包含本金。
      </p>
      <div className="flex items-center justify-between mb-8px">
        <span className="_tf[14] text-[var(--Text-800)]">结算本金</span>
        <p className="font-medium text-[var(--Text-Main-10)]">
          <span className="_tf[18] din-pro">{bigNB(cashOutStake).toFixed(2)}</span>
          <span className="_tf[14] ml-2px">元</span>
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="_tf[14] text-[var(--Text-800)]">结算返还</span>
        <p className="font-medium text-[var(--Text-Main-10)]">
          <span className="_tf[18] din-pro">{bigNB(backAmt).toFixed(2)}</span>
          <span className="_tf[14] ml-2px">元</span>
        </p>
      </div>
    </Modal>
  );
};

export default EarlySettleConfirmModal;
