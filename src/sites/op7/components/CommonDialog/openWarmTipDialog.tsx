import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { getGlobalStoreForApiRequest } from '@/core/store/util';

import CommonDialog from './index';
import styles from './WarmTipDialog.module.scss';

export interface OpenWarmTipDialogOptions {
  /** 标题，默认「温馨提示」 */
  title?: string;
  /** 正文 */
  content: string;
  /** 确认按钮文案，默认「我知道了」 */
  confirmText?: string;
  /** 点击确认后回调 */
  onConfirm?: () => void;
  /** 点击蒙层是否关闭，默认 true */
  maskClickClose?: boolean;
}

export interface WarmTipDialogInstance {
  close: () => void;
}

const WarmTipDialogHost: React.FC<{
  title: string;
  content: string;
  confirmText: string;
  maskClickClose: boolean;
  onConfirm?: () => void;
  onClosed: () => void;
}> = ({ title, content, confirmText, maskClickClose, onConfirm, onClosed }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClosed, 300);
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  return (
    <CommonDialog
      visible={visible}
      onClose={handleClose}
      maskClickClose={maskClickClose}
      showCloseButton={false}
      header={title}
      footerButtonText={confirmText}
      footerButtonClassName={styles.footerButton}
      onFooterButtonClick={handleConfirm}
    >
      <p className={styles.content}>{content}</p>
    </CommonDialog>
  );
};

/** 函数式打开温馨提示弹窗（CommonDialog 样式） */
export function openWarmTipDialog({
  title = '温馨提示',
  content,
  confirmText = '我知道了',
  onConfirm,
  maskClickClose = true,
}: OpenWarmTipDialogOptions): WarmTipDialogInstance {
  const store = getGlobalStoreForApiRequest();
  if (!store) {
    console.error('Redux store is not available. Please ensure the app is properly initialized.');
    return { close: () => {} };
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    setTimeout(() => {
      root.unmount();
      container.remove();
    }, 300);
  };

  root.render(
    <Provider store={store}>
      <WarmTipDialogHost
        title={title}
        content={content}
        confirmText={confirmText}
        maskClickClose={maskClickClose}
        onConfirm={onConfirm}
        onClosed={cleanup}
      />
    </Provider>,
  );

  return {
    close: cleanup,
  };
}
