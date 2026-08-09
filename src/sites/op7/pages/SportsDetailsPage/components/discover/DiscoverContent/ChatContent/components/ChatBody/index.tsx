import React, { useMemo } from 'react';
import ChatSkeleton from '../ChatSkeleton';
import ChatMessageList from '../ChatMessageList';
import styles from './ChatBody.module.scss';
import type { ChatFilterType } from '../../types';
import type { ChatConfigInfo, ChatMessage, ChatMuteInfo } from '@/core/sdk/IMManager';

interface ChatBodyProps {
  loading: boolean;
  isFilteredLoading?: boolean;
  filterType: ChatFilterType;
  chatConfig?: ChatConfigInfo | null;
  messages: ChatMessage[];
  shareMessages: ChatMessage[];
  bigMessages: ChatMessage[];
  pendingCount: number;
  muteInfo?: ChatMuteInfo | null;
  onBottomStateChange: (isBottom: boolean) => void;
  onFlushPending: () => void;
  onQuoteMessage?: (message: ChatMessage) => void;
  onContactService?: () => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({
  loading,
  isFilteredLoading,
  filterType,
  chatConfig,
  messages,
  shareMessages,
  bigMessages,
  pendingCount,
  muteInfo,
  onBottomStateChange,
  onFlushPending,
  onQuoteMessage,
  onContactService,
}) => {
  const currentMessages = useMemo(() => {
    if (filterType === 'share') return shareMessages;
    if (filterType === 'big') return bigMessages;
    return messages;
  }, [bigMessages, filterType, messages, shareMessages]);
  // 对齐 Flutter：chatSwitch != 1 未开放；配置未返回时不在此拦截（由 loading 骨架承接）
  if (chatConfig != null && chatConfig.chatSwitch !== 1) {
    return (
      <div className={styles.body}>
        <div className={styles.stateText}>聊天室暂未开放</div>
      </div>
    );
  }

  if (loading || isFilteredLoading) {
    return (
      <div className={styles.body}>
        <ChatSkeleton />
      </div>
    );
  }

  if (currentMessages.length === 0) {
    return (
      <div className={styles.body}>
        <div className={styles.stateText}>暂无聊天内容</div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <ChatMessageList
        key={filterType}
        messages={currentMessages}
        pendingCount={filterType === 'chat' ? pendingCount : 0}
        muteInfo={muteInfo}
        onBottomStateChange={onBottomStateChange}
        onFlushPending={onFlushPending}
        onQuoteMessage={onQuoteMessage}
        onContactService={onContactService}
      />
    </div>
  );
};

export default ChatBody;
