import React, { useMemo, useRef } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';

import { useAppSelector } from '@/core/store/hooks';

import { zIndexMap } from '@/utils/constants/zIndex';
// styles
import styles from './index.module.scss';
import KeywordFilter, { type KeywordFilterHandle } from '../KeywordFilter';

const SearchModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  defaultHomeGameId: number;
}> = ({ visible, onClose, defaultHomeGameId }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const keywordFilterRef = useRef<KeywordFilterHandle | null>(null);

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.homeSearch}
      >
        <div className={`${styles.searchModal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            <div className={styles.tabList}>
              <span className={styles.tabItem} onClick={onClose}>
                取消
              </span>

              <span
                className={styles.tabItem}
                onClick={() => {
                  keywordFilterRef.current?.triggerSearch();
                }}
              >
                搜索
              </span>
            </div>
          </header>
          <section>
            <KeywordFilter ref={keywordFilterRef} defaultHomeGameId={defaultHomeGameId} />
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default SearchModal;
