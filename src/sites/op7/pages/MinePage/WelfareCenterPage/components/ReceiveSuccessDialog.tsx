import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import type { WelfareReceiveSuccessModalData } from '../receiveSuccessModal';
import caidaiData from './caidai.json';
import styles from './receiveSuccessDialog.module.scss';

export interface ReceiveSuccessDialogProps {
  visible: boolean;
  data: WelfareReceiveSuccessModalData | null;
  onClose: () => void;
}

export default function ReceiveSuccessDialog({
  visible,
  data,
  onClose,
}: ReceiveSuccessDialogProps) {
  const caidaiRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (visible) {
      caidaiRef.current?.goToAndPlay(0, true);
    }
  }, [visible]);

  if (!data) return null;

  return (
    <Overlay
      show={visible}
      close={onClose}
      position="center"
      bodyClassname={clsx(
        'flex flex-col overflow-hidden bg-[var(--Background-300)] rounded-12px w-272px',
        styles.dialog,
      )}
    >
      <div className={styles.caidai}>
        <Lottie
          lottieRef={caidaiRef}
          animationData={caidaiData}
          loop={false}
          autoplay
          className={styles.caidaiLottie}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        />
      </div>
      <ModalHeader title={data.title} right={<></>} onClose={onClose} />
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.cash}>{data.cash}</div>
          {data.content}
        </div>
        <button type="button" className={styles.footerButton} onClick={onClose}>
          确定
        </button>
      </div>
    </Overlay>
  );
}
