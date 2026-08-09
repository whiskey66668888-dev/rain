import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import { bigNB } from '@/utils/bet/bigMath';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';

/** 预约提前结算二次确认弹窗（step = 'confirming' | 'submitting'）*/
const ReserveEarlySettleConfirmModal = () => {
  const {
    list,
    reserveConfirmEntry: _entry,
    cancelReserveEarlySettleConfirm,
    submitReserveEarlySettle,
  } = useBetHistoryContext();
  const entry = _entry;

  const order = list.find((o) => o.orderId === entry?.orderId);
  const cashOutStake = entry?.cashOutStake ?? 0;
  const cashOutPayoutStake = entry?.cashOutPayoutStake ?? 0;
  const isUpdate = entry?.isUpdate;
  const submitting = entry?.step === 'submitting';
  const show = !!entry && !!order;

  return (
    <Modal
      show={show}
      title={isUpdate ? '修改预约' : '预约提前结算'}
      showCloseButton={false}
      maskClickClose={false}
      onClose={() => cancelReserveEarlySettleConfirm(entry?.orderId ?? '')}
      footer={
        <div className="flex gap-10px w-full">
          <Button
            type="second"
            size="large"
            className="flex-1 rounded-6px"
            disabled={submitting}
            onClick={() => cancelReserveEarlySettleConfirm(entry?.orderId ?? '')}
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
              submitReserveEarlySettle({ order, cashOutStake, cashOutPayoutStake, isUpdate });
            }}
          >
            确认
          </Button>
        </div>
      }
    >
      <p className="_tf[12] text-[var(--Text-800)] leading-[1.5] mb-16px text-center hidden lg:block">
        当达到您设定的结算本金和可返还额时，系统自动结算。
      </p>
      <p className="_tf[12] text-[var(--Text-800)] leading-[1.5] mb-16px text-center block lg:hidden">
        当达到您设定的结算本金和可返还额时，
        <br />
        系统自动结算。
      </p>
      <div className="flex items-center justify-between mb-8px">
        <span className="_tf[14] text-[var(--Text-800)]">结算本金</span>
        <span className="_tf[14] din-pro font-medium text-[var(--Text-Main-10)]">
          {bigNB(cashOutStake).toFixed(2)}元
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="_tf[14] text-[var(--Text-800)]">结算返还</span>
        <span className="_tf[14] din-pro font-medium text-[var(--Text-Main-10)]">
          {bigNB(cashOutPayoutStake).toFixed(2)}元
        </span>
      </div>
    </Modal>
  );
};

export default ReserveEarlySettleConfirmModal;
