import React from 'react';
import Modal from '@/common/components/Modal';
import type { ChatConfigInfo } from '@/core/sdk/IMManager';
import styles from './ChatRuleDialog.module.scss';

const RuleContent: React.FC<{ config?: ChatConfigInfo | null }> = ({ config }) => {
  if (!config?.ruleContent) {
    return <div className={styles.emptyText}>暂无规则说明</div>;
  }

  const lines = config.ruleContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={styles.ruleContent}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  );
};

export const openChatRuleDialog = (config?: ChatConfigInfo | null) => {
  Modal.open({
    title: config?.ruleTitle || '聊天室规则',
    content: <RuleContent config={config} />,
    confirmText: '我知道了',
    onConfirm: () => undefined,
    showCloseButton: false,
    contentClassName: styles.ruleModalContent,
  });
};

export default openChatRuleDialog;
