import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import { useAppSelector } from '@/core/store/hooks';
import { useBetHistoryMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';

const ReserveEditConfirmModal = () => {
  const activeVenue = useAppSelector((state) => state.sport.venue);
  const reserveEdit = useAppSelector((state) => state.betHistory[activeVenue].reserveEdit);
  const { closeReserveEditConfirm, submitReserveEditConfirm } = useBetHistoryMethods();

  const show = !!reserveEdit?.confirming;
  const loading = reserveEdit?.loading ?? false;

  return (
    <Modal
      show={show}
      title="修改确认"
      showCloseButton={false}
      maskClickClose={false}
      onClose={() => closeReserveEditConfirm(activeVenue)}
      footer={
        <div className="flex gap-10px w-full">
          <Button
            type="second"
            size="large"
            className="flex-1"
            disabled={loading}
            onClick={() => closeReserveEditConfirm(activeVenue)}
          >
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            className="flex-1"
            disabled={loading}
            loading={loading}
            onClick={() => {
              if (reserveEdit) void submitReserveEditConfirm(activeVenue, reserveEdit);
            }}
          >
            确认
          </Button>
        </div>
      }
    >
      <p className="_tf[14] text-[var(--Text-800)] leading-[1.5] text-center">
        确认修改 {reserveEdit?.matchName} 的预约吗？
      </p>
    </Modal>
  );
};

export default ReserveEditConfirmModal;
