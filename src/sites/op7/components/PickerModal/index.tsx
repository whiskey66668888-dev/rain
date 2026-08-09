import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Picker, PickerView } from 'antd-mobile';
import type { PickerColumn, PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker';
import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import styles from './PickerModal.module.scss';

export type PickerModalItemLayout = 'split' | 'center';

export interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  columns: PickerColumn[];
  value?: PickerValue[];
  onConfirm: (value: PickerValue[]) => void;
  title?: React.ReactNode;
  cancelText?: React.ReactNode;
  confirmText?: React.ReactNode;
  /** 列表项展示模式：split 左右分布（如 中国 +86），center 居中 */
  itemLayout?: PickerModalItemLayout;
  /** 自定义列表项渲染，传入时覆盖 itemLayout */
  renderLabel?: (item: PickerColumnItem) => React.ReactNode;
  /** split 模式下右侧值的格式化，默认 +{value} */
  formatItemValue?: (item: PickerColumnItem) => string;
}

const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  onClose,
  columns,
  value,
  onConfirm,
  title,
  cancelText,
  confirmText,
  itemLayout = 'split',
  renderLabel,
  formatItemValue = (item) => `+${String(item.value)}`,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [innerValue, setInnerValue] = useState<PickerValue[]>(value ?? []);

  useEffect(() => {
    if (visible) {
      setInnerValue(value ?? []);
    }
  }, [visible, value]);

  const handleRenderLabel = React.useCallback(
    (item: PickerColumnItem) => {
      if (renderLabel) return renderLabel(item);
      if (itemLayout === 'center') {
        return <div className={styles.pickerItemCenter}>{item.label}</div>;
      }
      return (
        <div className={styles.pickerItemRow}>
          <span>{item.label}</span>
          <span className={styles.pickerItemValue}>{formatItemValue(item)}</span>
        </div>
      );
    },
    [itemLayout, renderLabel, formatItemValue],
  );

  const handleConfirm = React.useCallback(() => {
    onConfirm(innerValue);
    onClose();
  }, [innerValue, onConfirm, onClose]);

  if (isMobile) {
    return (
      <Picker
        columns={columns}
        visible={visible}
        onClose={onClose}
        onCancel={onClose}
        value={value}
        onConfirm={(val) => {
          onConfirm(val);
          onClose();
        }}
        title={title}
        cancelText={cancelText}
        confirmText={confirmText}
        popupClassName={styles.pickerModal}
        renderLabel={handleRenderLabel}
      />
    );
  }

  return (
    <ClientOnly>
      <Overlay show={visible} close={onClose} position="center" maskClickClose zIndex={1100}>
        <div className={clsx(styles.pickerModal, styles.pickerModalDesktop)}>
          <div className={styles.pickerHeader}>
            <button type="button" className={styles.pickerHeaderButton} onClick={onClose}>
              {cancelText}
            </button>
            <div className={styles.pickerHeaderTitle}>{title}</div>
            <button type="button" className={styles.pickerHeaderButton} onClick={handleConfirm}>
              {confirmText}
            </button>
          </div>
          <div className={styles.pickerBody}>
            <PickerView
              columns={columns}
              value={innerValue}
              onChange={setInnerValue}
              renderLabel={handleRenderLabel}
              mouseWheel
            />
          </div>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default PickerModal;
