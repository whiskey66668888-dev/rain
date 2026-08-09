import React from 'react';
import clsx from 'clsx';
import type { ChatMessage } from '@/core/sdk/IMManager';
import MessageHeader from '../MessageHeader';
import { MatchStageCard } from '../MatchShareMessageItem';
import styles from './TextMessageItem.module.scss';

interface TextMessageItemProps {
  message: ChatMessage;
  showHeader?: boolean;
}

/**
 * 文本 / 热词消息（对齐 emc TextMessageItem）
 * - 热词复用文本气泡
 * - 引用消息（114）可内嵌赛事卡片
 */
const TextMessageItem: React.FC<TextMessageItemProps> = ({ message, showHeader = true }) => {
  const quoted = message.quotedMatchShareInfo || message.matchShareInfo;

  return (
    <article className={clsx(styles.messageItem, message.isMine && styles.mine)}>
      <MessageHeader message={message} showHeader={showHeader} />
      <div className={clsx(styles.bubble, message.isImAdmin && styles.admin)}>
        {quoted ? (
          <div className={styles.quoteBlock}>
            <MatchStageCard info={quoted} isMine={message.isMine} isQuote />
          </div>
        ) : null}
        {message.content}
      </div>
    </article>
  );
};

export default TextMessageItem;
