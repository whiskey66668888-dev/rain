import React from 'react';
import type { ChatMessage } from '@/core/sdk/IMManager';
import styles from './AdminTextMessageItem.module.scss';

interface AdminTextMessageItemProps {
  message: ChatMessage;
}

/** 超管文本（对齐 emc AdminTextMessageItem）：居中条 +「官方助手：」前缀 */
const AdminTextMessageItem: React.FC<AdminTextMessageItemProps> = ({ message }) => {
  return (
    <div className={styles.admin}>
      <span className={styles.prefix}>官方助手：</span>
      <span className={styles.body}>{message.content}</span>
    </div>
  );
};

export default AdminTextMessageItem;
