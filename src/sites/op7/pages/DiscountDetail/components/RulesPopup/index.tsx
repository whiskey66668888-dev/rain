import React, { useMemo } from 'react';
import styles from './index.module.scss';
import LazyImage from '@/common/components/LazyImage';
import { handleContent } from '@/utils/format/handleContent';
import Overlay, { type OverlayPosition } from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';

type RulesPopupProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  icon?: string;
  items: Array<string>;
};

const RulesPopup: React.FC<RulesPopupProps> = ({
  visible,
  onClose,
  title = '活动规则',
  icon,
  items,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(() => {
    return isMobile ? 'bottom' : 'center';
  }, [isMobile]);

  return (
    <Overlay
      show={visible}
      close={onClose}
      position={overlayPosition}
      bodyClassname={styles.rulesModalWrapper}
    >
      <div className={styles.rulesModal}>
        <div className={styles.rulesModalHeader}>
          <div className={styles.rulesModalTitle}>{title}</div>
          {icon && (
            <LazyImage
              src={icon}
              alt="close"
              width={20}
              height={20}
              className={styles.rulesCloseIcon}
              onClick={onClose}
            />
          )}
        </div>
        <div className={styles.rulesModalBody}>
          {items.map((text, idx) => (
            <div key={idx} dangerouslySetInnerHTML={{ __html: handleContent(text) }} />
          ))}
        </div>
      </div>
    </Overlay>
  );
};

export default RulesPopup;
