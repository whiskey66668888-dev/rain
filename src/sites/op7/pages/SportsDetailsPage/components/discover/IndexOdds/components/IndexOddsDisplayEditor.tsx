import React from 'react';
import clsx from 'clsx';

import Overlay from '@/common/components/Overlay';

import { INDEX_COMPANIES } from '../constants';
import styles from '../index.module.scss';

interface Props {
  visible: boolean;
  selectedCompanyIds: string[];
  onToggle: (companyId: string) => void;
  onClose: () => void;
  bodyStyle?: React.CSSProperties;
}

const IndexOddsDisplayEditor: React.FC<Props> = ({
  visible,
  selectedCompanyIds,
  onToggle,
  onClose,
  bodyStyle,
}) => {
  if (!visible) return null;

  return (
    <Overlay show={visible} close={onClose} position="bottom" maskClickClose bodyStyle={bodyStyle}>
      <div className={styles.editorSheet}>
        <div className={styles.editorHeader}>
          <button type="button" className={styles.editorAction} onClick={onClose}>
            取消
          </button>
          <div className={styles.editorTitle}>显示设置</div>
          <button type="button" className={styles.editorActionConfirm} onClick={onClose}>
            完成
          </button>
        </div>
        <div className={styles.editorBody}>
          <div className={styles.editorHint}>至少保留一个场馆</div>
          <div className={styles.editorGrid}>
            {INDEX_COMPANIES.map((company) => {
              const active = selectedCompanyIds.includes(company.id);
              return (
                <button
                  key={company.id}
                  type="button"
                  className={clsx(styles.editorItem, active && styles.editorItemActive)}
                  onClick={() => onToggle(company.id)}
                >
                  {company.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default IndexOddsDisplayEditor;
