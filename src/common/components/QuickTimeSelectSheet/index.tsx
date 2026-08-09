import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Modal from '@/common/components/Modal';
import styles from './index.module.scss';

export interface QuickTimeSelectSheetProps {
  show: boolean;
  onClose: () => void;
  options: readonly string[];
  value: string;
  /** 点击「确定」且当前选中非「自定义」时回调 */
  onConfirmSelection: (key: string) => void;
  /** 点击「自定义」行时触发（会先关闭弹层），由父级打开日历等 */
  onPickCustom?: () => void;
  title?: string;
  /** 底部说明；传空字符串可隐藏 */
  tip?: string;
  confirmText?: string;
  className?: string;
  contentClassName?: string;
}

function ChevronDownIcon() {
  return (
    <svg
      className={styles.chevron}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderOptionLabel(label: string) {
  const parts = label.split(/(\d+)/);
  return parts.map((part, idx) => {
    if (/^\d+$/.test(part)) {
      return (
        <span key={`${idx}-${part}`} className="din-pro">
          {part}
        </span>
      );
    }
    return <span key={`${idx}-${part}`}>{part}</span>;
  });
}

export default function QuickTimeSelectSheet({
  show,
  onClose,
  options,
  value,
  onConfirmSelection,
  onPickCustom,
  title = '请选择时间',
  tip,
  confirmText = '确定',
  className,
  contentClassName,
}: QuickTimeSelectSheetProps) {
  const [pending, setPending] = useState(value);

  useEffect(() => {
    if (show) {
      setPending(value);
    }
  }, [show, value]);

  const handleConfirm = () => {
    if (pending === '自定义') {
      onPickCustom?.();
      onClose();
      return;
    }
    onConfirmSelection(pending);
    onClose();
  };

  const tipText = tip === '' ? null : (tip ?? '*当前系统仅支持查询最近90天内数据');

  return (
    <Modal
      show={show}
      onClose={onClose}
      position="bottom"
      title={title}
      maskClickClose
      confirmText={confirmText}
      onConfirm={handleConfirm}
      className={clsx(styles.modalBg, className)}
      contentClassName={clsx(styles.contentTight, contentClassName)}
    >
      <div className={styles.listWrap}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={clsx(styles.row, pending === opt && styles.rowActive)}
            onClick={() => {
              if (opt === '自定义') {
                onPickCustom?.();
                onClose();
                return;
              }
              setPending(opt);
            }}
          >
            {opt === '自定义' ? (
              <span className={styles.rowCustomGroup}>
                <span className={clsx(styles.rowLabel, '_tf[14]')}>{renderOptionLabel(opt)}</span>
                <ChevronDownIcon />
              </span>
            ) : (
              <span className={clsx(styles.rowLabel, '_tf[14]')}>{renderOptionLabel(opt)}</span>
            )}
          </button>
        ))}
      </div>
      {tipText != null ? <p className={clsx(styles.tip, '_tf[12]')}>{tipText}</p> : null}
    </Modal>
  );
}
