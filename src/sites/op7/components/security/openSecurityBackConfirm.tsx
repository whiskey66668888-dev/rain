import React from 'react';

import Modal, { type ModalInstance } from '@/common/components/Modal';
import Button from '@/common/components/Button';
import { zIndexMap } from '@/utils/constants/zIndex';

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
};

const titleTextStyle: React.CSSProperties = {
  color: 'var(--Text-Main-10, #1F2634)',
  textAlign: 'center',
  fontFamily: '"PingFang SC", sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '24px',
};

const contentTextStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--Text-Main-10, #1F2634)',
  textAlign: 'center',
  fontFamily: '"PingFang SC", sans-serif',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '20px',
};

export interface OpenSecurityBackConfirmOptions {
  /** 确认文案，支持字符串或自定义节点 */
  content: React.ReactNode;
  /** 标题，默认「安全提示」 */
  title?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  zIndex?: number;
}

/**
 * 安全流程返回/终止确认弹窗（盾牌标题 + 取消/确定双按钮）
 */
export function openSecurityBackConfirm({
  content,
  title = '安全提示',
  cancelText = '取消',
  confirmText = '确定',
  onConfirm,
  onCancel,
  zIndex = zIndexMap.loginModal + 1,
}: OpenSecurityBackConfirmOptions): ModalInstance {
  const resolvedContent =
    typeof content === 'string' ? <p style={contentTextStyle}>{content}</p> : content;

  const modal = Modal.open({
    title: (
      <div style={titleStyle}>
        <img
          src="/images/common/login/safe-tip.svg"
          alt=""
          style={{ width: 16, height: 16, flexShrink: 0 }}
        />
        <span style={titleTextStyle}>{title}</span>
      </div>
    ),
    content: <div style={{ marginTop: 9, marginBottom: -3 }}>{resolvedContent}</div>,
    showCloseButton: true,
    zIndex,
    footer: (
      <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
        <Button
          type="second"
          style={{ flex: 1 }}
          onClick={() => {
            onCancel?.();
            modal.close();
          }}
        >
          {cancelText}
        </Button>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={() => {
            modal.close();
            onConfirm();
          }}
        >
          {confirmText}
        </Button>
      </div>
    ),
  });

  return modal;
}
