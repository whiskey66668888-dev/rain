import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import { useAppSelector } from '@/core/store/hooks';
import { useBetHistoryMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';

const CancelReserveBetConfirmModal = () => {
  const activeVenue = useAppSelector((state) => state.betHistory.activeVenue);
  const entry = useAppSelector((state) => state.betHistory[activeVenue].cancelReserveBetEntry);
  const { closeCancelReserveBetConfirm, submitCancelReserveBet } = useBetHistoryMethods();

  const show = !!entry;
  const loading = entry?.loading ?? false;

  return (
    <Modal
      show={show}
      title="取消预约"
      showCloseButton={false}
      maskClickClose={false}
      onClose={() => closeCancelReserveBetConfirm(activeVenue)}
      footer={
        <div className="flex gap-10px w-full">
          <Button
            type="second"
            size="large"
            className="flex-1"
            disabled={loading}
            onClick={() => closeCancelReserveBetConfirm(activeVenue)}
          >
            暂不取消
          </Button>
          <Button
            type="primary"
            size="large"
            className="flex-1"
            disabled={loading}
            loading={loading}
            onClick={() => {
              if (entry) void submitCancelReserveBet(activeVenue, entry);
            }}
          >
            确认取消
          </Button>
        </div>
      }
    >
      <p className="_tf[14] leading-[1.43] text-[var(--Text-800)] text-center">您的预约将被取消</p>
    </Modal>
  );
};

export default CancelReserveBetConfirmModal;
