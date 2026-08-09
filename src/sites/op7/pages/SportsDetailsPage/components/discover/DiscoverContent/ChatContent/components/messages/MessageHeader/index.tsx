import React from 'react';
import clsx from 'clsx';
import {
  ChatMessageType,
  formatChatTimestamp,
  getVipBadgeSrc,
  maskNickname,
  type ChatMessage,
} from '@/core/sdk/IMManager';
import styles from './MessageHeader.module.scss';

interface MessageHeaderProps {
  message: ChatMessage;
  /** 连续同用户消息可折叠（对齐 emc showHeader） */
  showHeader?: boolean;
}

/**
 * 消息头（对齐 emc MessageHeader）
 * 他人：VIP徽章 + 掩码昵称 + [晒了一单] + 时间
 * 自己：时间 + 掩码昵称 + [晒了一单] + VIP徽章
 */
const MessageHeader: React.FC<MessageHeaderProps> = ({ message, showHeader = true }) => {
  if (!showHeader) return null;

  const vipLevel = message.user?.vipLevel ?? 0;
  const nickname = maskNickname(message.user?.nickname || '匿名用户');
  const time = formatChatTimestamp(message.sendTime);
  const showBetShare = message.type === ChatMessageType.BetShare;

  const vipBadge = (
    <img
      className={styles.vipBadge}
      src={getVipBadgeSrc(vipLevel)}
      alt={`VIP${vipLevel}`}
      width={52}
      height={28}
    />
  );

  const betTag = showBetShare ? <span className={styles.betTag}>晒了一单</span> : null;

  if (message.isMine) {
    return (
      <div className={clsx(styles.header, styles.mine)}>
        <span className={styles.time}>{time}</span>
        <span className={styles.nickname}>{nickname}</span>
        {betTag}
        {vipBadge}
      </div>
    );
  }

  return (
    <div className={styles.header}>
      {vipBadge}
      <span className={styles.nickname}>{nickname}</span>
      {betTag}
      <span className={styles.time}>{time}</span>
    </div>
  );
};

export default MessageHeader;
