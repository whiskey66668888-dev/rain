import React from 'react';
import type { ChatMessage } from '@/core/sdk/IMManager';
import styles from './SystemNoticeMessageItem.module.scss';

interface SystemNoticeMessageItemProps {
  message: ChatMessage;
}

/** 系统通知（对齐 emc SystemNoticeMessageItem）：居中条 + 官方助手前缀 */
const SystemNoticeMessageItem: React.FC<SystemNoticeMessageItemProps> = ({ message }) => {
  return (
    <div className={styles.notice}>
      <span className={styles.prefix}>官方助手：</span>
      <span>{message.content}</span>
    </div>
  );
};

export default SystemNoticeMessageItem;
