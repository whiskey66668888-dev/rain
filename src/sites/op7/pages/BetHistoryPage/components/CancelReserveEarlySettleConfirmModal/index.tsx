import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';

const CancelReserveEarlySettleConfirmModal = () => {
  const {
    cancelReserveConfirmEntry: entry,
    closeCancelReserveConfirm,
    cancelReserveEarlySettle,
  } = useBetHistoryContext();

  const show = !!entry;
  const submitting = entry?.step === 'submitting';

  return (
    <Modal
      show={show}
      title="取消预约"
      showCloseButton={false}
      maskClickClose={false}
      onClose={closeCancelReserveConfirm}
      footer={
        <div className="flex gap-10px w-full">
          <Button
            type="second"
            size="large"
            className="flex-1 rounded-6px"
            disabled={submitting}
            onClick={closeCancelReserveConfirm}
          >
            暂不取消
          </Button>
          <Button
            type="primary"
            size="large"
            className="flex-1 rounded-6px"
            disabled={submitting}
            loading={submitting}
            onClick={() => {
              cancelReserveEarlySettle();
            }}
          >
            确认取消
          </Button>
        </div>
      }
    >
      <p className="_tf[12] text-[var(--Text-800)] leading-[1.5] text-center">
        您即将取消当前预约订单
      </p>
    </Modal>
  );
};

export default CancelReserveEarlySettleConfirmModal;
