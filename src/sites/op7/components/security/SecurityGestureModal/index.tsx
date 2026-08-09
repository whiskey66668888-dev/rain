import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import type { SecurityBindItem } from '@/apis/origin/login';
import styles from './SecurityGestureModal.module.scss';

const parseMsgToArr = (msg: string = '') => {
  return msg
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .split(/\n|\r\n/)
    .filter(Boolean);
};

export interface PopInfo {
  popTitle?: string;
  openBeforeMsg?: string;
  openAfterMsg?: string;
}

export interface SecurityGestureModalProps {
  show: boolean;
  onClose: () => void;
  popInfo: PopInfo | null;
  recommendBindItem: SecurityBindItem | null;
  onGo: (item: SecurityBindItem) => void;
  onNotToday: (securityId?: string | number) => void;
  onRequestSecurityTip?: () => void;
}

const SecurityGestureModal: React.FC<SecurityGestureModalProps> = ({
  show,
  onClose,
  popInfo,
  recommendBindItem,
  onGo,
  onNotToday,
  onRequestSecurityTip,
}) => {
  const { t } = useTranslation();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const beforeArr = parseMsgToArr(popInfo?.openBeforeMsg ?? '');
  const afterArr = parseMsgToArr(popInfo?.openAfterMsg ?? '');

  const handleGo = () => {
    if (!recommendBindItem) {
      onClose();
      return;
    }
    if (onRequestSecurityTip) {
      onClose();
      setTimeout(() => onRequestSecurityTip(), 0);
    } else {
      onGo(recommendBindItem);
    }
  };

  const handleNotToday = () => {
    const id = recommendBindItem?.id;
    if (id != null && (typeof id === 'string' || typeof id === 'number')) {
      onNotToday(id);
    }
    onClose();
  };

  return (
    <Overlay
      show={show}
      close={onClose}
      position={overlayPosition}
      maskClickClose
      zIndex={zIndexMap.loginModal}
    >
      <div className={clsx(styles.gestureGuide, isMobile ? styles.mobile : styles.desktop)}>
        <div className={styles.gestureGuideTitle}>{popInfo?.popTitle ?? ''}</div>
        <div className={styles.gestureGuideContent}>
          <div className={styles.gestureGuideItem}>
            <div className={styles.GuideItemTitle}>
              <img src="/images/common/safeCenter/gesture_warn.svg" alt="" />
              {t('securityCenter.gestureModal.openBefore')}
            </div>
            {beforeArr.map((item, idx) => (
              <div key={idx} className={styles.GuideText}>
                {item}
              </div>
            ))}
          </div>
          <div className={styles.gestureGuideItem}>
            <div className={styles.GuideItemTitle}>
              <img src="/images/common/safeCenter/gesture_success.svg" alt="" />
              {t('securityCenter.gestureModal.openAfter')}
            </div>
            {afterArr.map((item, idx) => (
              <div key={idx} className={styles.GuideText}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <button type="button" className={styles.gestureGuideBtn} onClick={handleGo}>
          {t('securityCenter.gestureModal.goToSettings')}
        </button>
        <button type="button" className={styles.gestureGuideCancel} onClick={handleNotToday}>
          {t('securityCenter.gestureModal.notToday')}
        </button>
      </div>
    </Overlay>
  );
};

export default SecurityGestureModal;
